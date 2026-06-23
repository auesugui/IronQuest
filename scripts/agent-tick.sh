#!/usr/bin/env bash
# =============================================================================
# IronQuest AFK Agent Tick — Manual MVP
# =============================================================================
# Invokes the ironquest-engineer agent against a single GitHub issue.
# Creates a git worktree, runs Claude headless, pushes branch, opens PR.
#
# Usage:
#   ./scripts/agent-tick.sh <issue-number>
#   ./scripts/agent-tick.sh 3
#
# Requirements:
#   - claude CLI in PATH (auth configured)
#   - gh CLI authenticated to auesugui/IronQuest
#   - clean working tree on current branch
# =============================================================================

set -euo pipefail

# --- Configuration ----------------------------------------------------------
REPO="auesugui/IronQuest"
WORKTREE_BASE=".claude/worktrees"
RUNS_DIR=".claude/agents/runs"
BASE_BRANCH="${BASE_BRANCH:-feature/phase1-core-implementation}"
MAX_BUDGET_USD="${MAX_BUDGET_USD:-5}"

# --- Args -------------------------------------------------------------------
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <issue-number>"
  exit 1
fi

ISSUE="$1"
BRANCH="agent/issue-$ISSUE"
WORKTREE="$WORKTREE_BASE/issue-$ISSUE"
LOG_FILE="$RUNS_DIR/issue-$ISSUE.log"
PROMPT_FILE="$RUNS_DIR/issue-$ISSUE.prompt"
SUMMARY_FILE="$RUNS_DIR/issue-$ISSUE.summary.md"

# --- Preflight --------------------------------------------------------------
echo "=== Preflight ==="

for cmd in claude gh git; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: $cmd not found in PATH"
    exit 1
  fi
done

if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh CLI not authenticated. Run: gh auth login"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: working tree is dirty. Commit or stash first."
  git status --short
  exit 1
fi

if [[ -d "$WORKTREE" ]]; then
  echo "ERROR: worktree already exists at $WORKTREE"
  echo "  If stale: git worktree remove $WORKTREE"
  exit 1
fi

echo "Validating issue #$ISSUE..."
LABELS=$(gh issue view "$ISSUE" --repo "$REPO" --json labels --jq '.labels[].name')
if ! echo "$LABELS" | grep -qx "agent-ready"; then
  echo "ERROR: issue #$ISSUE does not have the 'agent-ready' label"
  exit 1
fi

# Stale summary from a prior run would mislead the PR body. Clear it.
[[ -f "$SUMMARY_FILE" ]] && rm "$SUMMARY_FILE"

ISSUE_TITLE=$(gh issue view "$ISSUE" --repo "$REPO" --json title --jq '.title')
ISSUE_URL=$(gh issue view "$ISSUE" --repo "$REPO" --json url --jq '.url')

echo "  Title: $ISSUE_TITLE"
echo "  URL:   $ISSUE_URL"
echo "  Budget: \$$MAX_BUDGET_USD"
echo ""

# --- Create worktree --------------------------------------------------------
echo "=== Creating worktree ==="
mkdir -p "$WORKTREE_BASE" "$RUNS_DIR"

git worktree add -b "$BRANCH" "$WORKTREE" "$BASE_BRANCH"
echo "  Branch: $BRANCH"
echo "  Path:   $WORKTREE"
echo ""

# --- Build prompt -----------------------------------------------------------
{
  echo "You are working on IronQuest issue #$ISSUE."
  echo ""
  echo "Issue title: $ISSUE_TITLE"
  echo ""
  echo "Issue body:"
  echo ""
  gh issue view "$ISSUE" --repo "$REPO" --json body --jq '.body'
  echo ""
  echo "Issue URL: $ISSUE_URL"
  echo ""
  echo "Instructions:"
  echo "1. Read the issue body completely. Re-read any docs or source files the issue references."
  echo "2. Implement every acceptance criterion in the issue."
  echo "3. Run every verification step listed in the issue. All must pass before you finish."
  echo "4. Once verifications pass, commit your work with a conventional commit format, e.g.:"
  echo "   \"feat: <short summary> (#$ISSUE)\""
  echo "5. **Before exiting, write a markdown summary of your work to:**"
  echo "   \`$SUMMARY_FILE\`"
  echo "   The summary becomes the PR body. Include:"
  echo "   - What you found when investigating (was the work already partly done?)"
  echo "   - What you changed (files + brief rationale)"
  echo "   - How you verified (test counts, typecheck status, manual checks)"
  echo "   - Any criteria that need post-merge CDT verification by the orchestrator"
  echo "6. DO NOT push. DO NOT open a PR. DO NOT perform any remote git operation."
  echo ""
  echo "Your work will be pushed and a PR will be opened automatically after you exit."
  echo ""
  echo "If you cannot complete a criterion or a verification fails after 3 attempts,"
  echo "stop and report which step failed and why. Still write the summary file."
} > "$PROMPT_FILE"

# --- Invoke Claude ----------------------------------------------------------
echo "=== Invoking ironquest-engineer ==="
echo "  Log: $LOG_FILE"
echo ""

(
  cd "$WORKTREE"
  claude -p "$(cat "$OLDPWD/$PROMPT_FILE")" \
    --agent ironquest-engineer \
    --permission-mode bypassPermissions \
    --max-budget-usd "$MAX_BUDGET_USD" \
    2>&1 | tee "$OLDPWD/$LOG_FILE"
)

echo ""

# --- Verify commit was made -------------------------------------------------
echo "=== Verifying agent work ==="

HEAD_COMMIT=$(git -C "$WORKTREE" rev-parse HEAD)
BASE_COMMIT=$(git -C "$WORKTREE" rev-parse "$BASE_BRANCH")

if [[ "$HEAD_COMMIT" == "$BASE_COMMIT" ]]; then
  echo "ERROR: no commit was made. See log: $LOG_FILE"
  echo "  Worktree left in place for debugging: $WORKTREE"
  exit 1
fi

git -C "$WORKTREE" log --oneline "${BASE_BRANCH}..HEAD"
echo ""

# --- Push and open PR -------------------------------------------------------
echo "=== Pushing branch ==="
git -C "$WORKTREE" push -u origin "$BRANCH"
echo ""

echo "=== Opening PR ==="

# Use agent's summary as PR body if it wrote one; fall back to boilerplate.
if [[ -f "$SUMMARY_FILE" && -s "$SUMMARY_FILE" ]]; then
  AGENT_SUMMARY=$(cat "$SUMMARY_FILE")
  PR_BODY="## Summary

$AGENT_SUMMARY

---

Resolves #$ISSUE

**Issue:** $ISSUE_TITLE — $ISSUE_URL

**Agent artifacts:**
- Branch: \`$BRANCH\`
- Local log: \`$LOG_FILE\`

🤖 Generated by IronQuest AFK agent tick"
else
  echo "WARNING: no summary file at $SUMMARY_FILE, using boilerplate PR body"
  PR_BODY="## Summary

Resolves #$ISSUE

Automated implementation by \`ironquest-engineer\` agent via \`scripts/agent-tick.sh\`.

## Issue
**$ISSUE_TITLE**

$ISSUE_URL

## Agent artifacts
- Branch: \`$BRANCH\`
- Local log: \`$LOG_FILE\`

## Reviewer checklist
- [ ] All acceptance criteria in issue #$ISSUE met
- [ ] All verification steps in issue #$ISSUE pass
- [ ] No unintended scope creep
- [ ] Conventional commit format used

🤖 Generated by IronQuest AFK agent tick"
fi

PR_URL=$(gh pr create \
  --repo "$REPO" \
  --base "$BASE_BRANCH" \
  --head "$BRANCH" \
  --title "[$ISSUE] $ISSUE_TITLE" \
  --body "$PR_BODY" \
  --label agent-generated)

# --- Cleanup worktree (success only) ---------------------------------------
git worktree remove --force "$WORKTREE"

echo ""
echo "=== Done ==="
echo "  PR:     $PR_URL"
echo "  Issue:  $ISSUE_URL"
echo "  Log:    $LOG_FILE"

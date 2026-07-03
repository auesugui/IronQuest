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
MAX_BUDGET_USD="${MAX_BUDGET_USD:-20}"

# --- Args -------------------------------------------------------------------
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <issue-number>"
  exit 1
fi

ISSUE="$1"
BRANCH="agent/issue-$ISSUE"
WORKTREE="$WORKTREE_BASE/issue-$ISSUE"
LOG_FILE="$RUNS_DIR/issue-$ISSUE.log"
JSON_FILE="$RUNS_DIR/issue-$ISSUE.json"
RAW_STREAM="$RUNS_DIR/issue-$ISSUE.raw"
PROMPT_FILE="$RUNS_DIR/issue-$ISSUE.prompt"
# Absolute path — the agent runs inside the worktree, so a relative path would
# land in the wrong directory. Resolve against the repo root up front.
REPO_ROOT="$(pwd)"
SUMMARY_FILE="$REPO_ROOT/$RUNS_DIR/issue-$ISSUE.summary.md"

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

# From this point on, an unexpected abort (push failure, gh outage, set -e on
# anything) leaves a worktree + branch behind. Without this trap the next run
# just hits "worktree already exists" with no context. Print exact recovery
# steps instead of failing silently.
on_abort() {
  local rc=$?
  [[ $rc -eq 0 ]] && return 0
  echo "" >&2
  echo "=== TICK ABORTED (exit $rc) ===" >&2
  echo "  State left in place for debugging:" >&2
  echo "    Worktree: $WORKTREE" >&2
  echo "    Branch:   $BRANCH" >&2
  echo "    Raw log:  $RAW_STREAM" >&2
  echo "  To reset:" >&2
  echo "    git worktree remove --force $WORKTREE" >&2
  echo "    git branch -D $BRANCH" >&2
}
trap on_abort EXIT

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
  echo "2. **Classify the issue** by reading its acceptance criteria:"
  echo "   - **Logic-only** (no UI surface — pure store/engine/types) → verification_status: test-only is acceptable"
  echo "   - **UI-surfacing** (user sees anything change) → verification_status: browser-checked is REQUIRED"
  echo "3. Implement every acceptance criterion in the issue."
  echo "4. Run pre-commit gates: \`npm run typecheck\`, \`npm run lint\`, \`npm test\`. All must pass."
  echo "5. **For UI-surfacing criteria, perform CDT browser verification** — do NOT defer to the orchestrator:"
  echo "   - Start the dev server in the worktree: \`npm run web\` (background). If port 8081 is taken, use \`npm run web -- --port 8082\`."
  echo "   - Wait for 'Web Bundled' in the output before driving CDT."
  echo "   - Drive CDT MCP through each acceptance criterion. Capture snapshots proving each passes."
  echo "   - Reference snapshot evidence in the summary file."
  echo "   - Stop the dev server before committing (kill the background process)."
  echo "   CDT MCP is available headless — the old claim that AFK agents 'have no browser session' was wrong."
  echo "6. Run the shadow calculator guard: grep \`app/\` for hand-rolled math that mirrors engine functions."
  echo "   Two calculators that should be one is a bug. See engineer prompt's 'Shadow calculator guard' section."
  echo "7. Once verifications pass, commit your work with a conventional commit format, e.g.:"
  echo "   \"feat: <short summary> (#$ISSUE)\""
  echo "8. **Before exiting, write a markdown summary of your work to:**"
  echo "   \`$SUMMARY_FILE\`"
  echo "   The summary becomes the PR body. It MUST start with this section at the very top:"
  echo "   "
  echo "   \`\`\`markdown"
  echo "   ## Verification status"
  echo "   "
  echo "   status: browser-checked  # or: test-only"
  echo "   evidence:"
  echo "     - <what was checked and how>"
  echo "     - <test counts: e.g., '241/241 jest pass'>"
  echo "   unverified_criteria: none  # explicit list if status is test-only"
  echo "   \`\`\`"
  echo "   "
  echo "   Then include:"
  echo "   - What you found when investigating (was the work already partly done?)"
  echo "   - What you changed (files + brief rationale)"
  echo "   - How you verified (test counts, typecheck status, CDT snapshots)"
  echo "   - **## Findings (out of scope)** — REQUIRED section, even if it just says 'none'."
  echo "     List every defect you NOTICED but did not fix because it was outside the issue's"
  echo "     acceptance criteria: TODO comments in code you touched, dead wiring (a value that"
  echo "     should come from a store but is hardcoded), spec violations, placeholder UI, and"
  echo "     contradictions between docs and code. One line each: file:line + what's wrong."
  echo "     Context: the 2026-07 audit found an agent tick that had 'streakDays: 0 // TODO'"
  echo "     inside its own diff and shipped around it without reporting it — that TODO turned"
  echo "     out to disable the entire streak-multiplier and Spirit FP economy. Scope fidelity"
  echo "     is correct behavior; silent scope fidelity is not. Report what you see."
  echo "9. DO NOT push. DO NOT open a PR. DO NOT perform any remote git operation."
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

# --output-format=json emits a single result object with cost + usage data.
# Capture to a file so we can surface real spend (vs. just the cap) in the PR.
# NOTE: `set -e` is suspended around the invocation. Without this, a nonzero
# exit from claude (crash, over-budget kill, auth failure) aborted the whole
# script HERE — the JSON-fallback branch below was unreachable dead code, the
# log never got assembled, and the worktree+branch were orphaned with no
# explanation. (Latent since the original script; surfaced by 2026-07 audit.)
set +e
(
  cd "$WORKTREE"
  claude -p "$(cat "$OLDPWD/$PROMPT_FILE")" \
    --agent ironquest-engineer \
    --permission-mode bypassPermissions \
    --max-budget-usd "$MAX_BUDGET_USD" \
    --output-format json \
    >"$OLDPWD/$JSON_FILE" \
    2>"$OLDPWD/$RAW_STREAM"
)
CLAUDE_EXIT=$?
set -e

if [[ $CLAUDE_EXIT -ne 0 ]]; then
  echo "WARNING: claude exited nonzero ($CLAUDE_EXIT) — likely crash or budget cap."
  echo "  Continuing to log assembly + commit check; raw stderr: $RAW_STREAM"
fi

# Build a human-readable log from the JSON. If JSON parsing fails (claude
# crashed, ran over budget, etc.), fall back to the raw stream so the log
# still has something for debugging.
TOTAL_COST="unknown"
DURATION_DISPLAY="unknown"
if [[ -s "$JSON_FILE" ]] && jq empty "$JSON_FILE" 2>/dev/null; then
  RAW_COST=$(jq -r '.total_cost_usd // "unknown"' "$JSON_FILE")
  if [[ "$RAW_COST" != "unknown" ]]; then
    TOTAL_COST=$(awk -v c="$RAW_COST" 'BEGIN {printf "%.2f", c}')
  fi
  DURATION_MS=$(jq -r '.duration_ms // 0' "$JSON_FILE")
  NUM_TURNS=$(jq -r '.num_turns // 0' "$JSON_FILE")
  IS_ERROR=$(jq -r '.is_error // false' "$JSON_FILE")
  DURATION_DISPLAY=$(awk -v ms="$DURATION_MS" 'BEGIN {printf "%.1fs", ms/1000}')
  {
    jq -r '.result // "(no result field in JSON)"' "$JSON_FILE"
    echo ""
    echo "=== Metrics ==="
    printf 'Cost: $%s / $%s cap\n' "$TOTAL_COST" "$MAX_BUDGET_USD"
    printf 'Duration: %s (%s turns)\n' "$DURATION_DISPLAY" "$NUM_TURNS"
    [[ "$IS_ERROR" == "true" ]] && echo "Status: ERROR (claude reported failure)"
  } > "$LOG_FILE"
else
  {
    echo "ERROR: claude -p did not produce valid JSON output (exit $CLAUDE_EXIT)"
    echo ""
    echo "=== Raw stream ==="
    cat "$RAW_STREAM" 2>/dev/null
  } > "$LOG_FILE"
fi

cat "$LOG_FILE"
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

# --- Parse verification status from agent's summary -------------------------
echo "=== Parsing verification status ==="

# Required labels: create idempotently if missing. Colors follow traffic-light convention.
# Create once per repo; --force would clobber user edits, so use the missing-check pattern.
# agent-generated is included: gh pr create fails outright if any --label is
# missing, and only the verification-* labels were being auto-created before.
for label_spec in "verification-browser-checked:22863A" \
                  "verification-test-only:B54708" \
                  "verification-unknown:9F1B1B" \
                  "agent-generated:5319E7"; do
  label_name="${label_spec%%:*}"
  label_color="${label_spec##*:}"
  if ! gh label list --repo "$REPO" --json name --jq '.[].name' 2>/dev/null \
       | grep -qx "$label_name"; then
    gh label create "$label_name" --color "$label_color" --repo "$REPO" \
      --description "Agent self-reported verification status" 2>/dev/null \
      || echo "  (could not create label '$label_name' — PR will fall back to single label)"
  fi
done

if [[ -f "$SUMMARY_FILE" && -s "$SUMMARY_FILE" ]]; then
  STATUS=$(awk '/^## Verification status/{flag=1; next} flag && /^status:/{print $2; exit}' "$SUMMARY_FILE")
  case "$STATUS" in
    browser-checked)
      VERIFICATION_LABEL="verification-browser-checked"
      VERIFICATION_BADGE="🟢 browser-checked"
      ;;
    test-only)
      VERIFICATION_LABEL="verification-test-only"
      VERIFICATION_BADGE="🟡 test-only — orchestrator must CDT before merge"
      ;;
    *)
      STATUS="unknown"
      VERIFICATION_LABEL="verification-unknown"
      VERIFICATION_BADGE="🔴 unknown — status missing or malformed in summary"
      echo "  WARNING: could not parse verification status; defaulting to unknown"
      ;;
  esac
else
  STATUS="missing"
  VERIFICATION_LABEL="verification-unknown"
  VERIFICATION_BADGE="🔴 missing — no summary file written"
fi
echo "  Status: $STATUS"
echo ""

# --- Push and open PR -------------------------------------------------------
echo "=== Pushing branch ==="
git -C "$WORKTREE" push -u origin "$BRANCH"
echo ""

echo "=== Opening PR ==="

# Use agent's summary as PR body if it wrote one; fall back to boilerplate.
# Either way, surface verification_status at the very top — never bury it.
if [[ -f "$SUMMARY_FILE" && -s "$SUMMARY_FILE" ]]; then
  AGENT_SUMMARY=$(cat "$SUMMARY_FILE")
  PR_BODY="## Verification: $VERIFICATION_BADGE

## Cost

- **Agent:** \`$TOTAL_COST\` / \`$MAX_BUDGET_USD\` budget cap
- **Duration:** $DURATION_DISPLAY
- **Orchestrator:** _pending — reviewer fills in post-merge via \`/cost\`_

---

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
  PR_BODY="## Verification: $VERIFICATION_BADGE

## Cost

- **Agent:** \`$TOTAL_COST\` / \`$MAX_BUDGET_USD\` budget cap
- **Duration:** $DURATION_DISPLAY
- **Orchestrator:** _pending — reviewer fills in post-merge via \`/cost\`_

---

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

# Two-label create with graceful fallback: if the verification label is somehow
# missing despite the create-loop above, retry with just agent-generated.
PR_URL=$(gh pr create \
  --repo "$REPO" \
  --base "$BASE_BRANCH" \
  --head "$BRANCH" \
  --title "[$ISSUE] $ISSUE_TITLE" \
  --body "$PR_BODY" \
  --label agent-generated \
  --label "$VERIFICATION_LABEL" \
  2>/dev/null \
  || gh pr create \
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

# Agent-Tick Loop — Failure-Mode Review & Hardening (2026-07-03)

Companion to `AUDIT-AND-ROADMAP-2026-07.md`. Scope: `scripts/agent-tick.sh`, `.claude/agents/ironquest-engineer.md`, `.github/workflows/verification-gate.yml`, and the run artifacts in `.claude/agents/runs/`.

## Verdict in one paragraph

The loop is genuinely good at what it was built for: scoped issues in, verified PRs out, with honest self-reporting (the issue-5 summary's CDT-blocked disclosure is a model of agent transparency). But it has one structural blind spot and several mechanical failure modes. The structural one: **the loop optimizes for scope fidelity and verifies "the new feature works" — nothing in it ever asks "is the system coherent?"** The proof is in its own artifacts: the issue-4 run had `streakDays: 0, // TODO` inside its diff, re-threaded that very parameter through the calculator signature it was extending, and shipped around it without reporting it. That TODO disables the streak multiplier and the entire Spirit FP economy. Browser verification passed. Tests passed. The gate went green. The product was broken the whole time.

## Fixes applied in this pass (agent-tick.sh — syntax-checked)

| # | Failure mode | Evidence | Fix |
|---|---|---|---|
| 1 | **Crash/budget-kill handling was dead code.** Under `set -e`, a nonzero exit from `claude -p` aborted the script at the invocation line — the JSON-fallback branch, log assembly, and the "ERROR: no commit" check were unreachable. Orphaned worktree+branch, no explanation. Over-budget kills (the exact scenario the $20 cap exists for) hit this path. | `CLAUDE_EXIT=$?` after a bare subshell under `set -euo pipefail` | `set +e` around invocation, explicit exit capture, warning line, then continue to log assembly |
| 2 | **Silent orphaned state on any late abort** (push failure, gh outage). Next run hits "worktree already exists" with no context — this class of leftover-state collision already bit two runs (port conflict on #5's first attempt; Chrome `SingletonLock` on #5's second). | preflight error path; issue-5 summary; commit `1a44211` | `EXIT` trap prints worktree/branch/raw-log paths + exact recovery commands on nonzero exit |
| 3 | **`gh pr create` fails hard if `agent-generated` label is missing.** Only the three `verification-*` labels were created idempotently; the one label both create attempts require was assumed to exist. Fresh repo / label rename = both `gh pr create` calls fail after the push, i.e. failure mode #2. | label-create loop vs. `--label agent-generated` on both calls | Added `agent-generated:5319E7` to the idempotent create loop |
| 4 | **Scope-fidelity trap: adjacent defects are noticed but never channeled.** Issue-3's agent *volunteered* a gap it found (`editSet` not saving weight) and fixed it; issue-4's agent stared at the streakDays TODO and said nothing. Whether defects get reported was personality, not process. | `.claude/agents/runs/issue-3.log` vs `issue-4.preserved.diff:14` | Prompt now REQUIRES a `## Findings (out of scope)` section in every summary (which becomes the PR body) — one line per noticed-but-not-fixed defect, `none` allowed but explicit |

## Fixes that need YOUR hands (protected file — paste-ready)

`.claude/agents/ironquest-engineer.md` is write-protected in this session. Two sections are actively harmful as written and will re-propagate audit findings D1/C3 into future agent work:

**(a) Replace the "Type Triangle" section with:**

```markdown
### Type Triangle — ⚠️ DECISION PENDING (do not propagate either taxonomy)
The docs specify **3 types (Ferro/Terra/Flux)**; the code ships **5 different
types** (`ignis/terra/aqua/ventus/umbra` in `src/types/index.ts`). Both appear
in the live UI. This is open question **Q1** in `AUDIT-AND-ROADMAP-2026-07.md`
and is Adrian's call. Until resolved: do NOT write new UI copy, onboarding, or
battle logic that hard-codes either set. If an issue requires touching pet
types, flag the conflict in your summary's Findings section and stop.

Docs' intended triangle (reference, once Q1 resolves to 3 types):
Ferro → Flux → Terra → Ferro (cyclic) · advantage 1.3x dealt / 0.8x taken
```

**(b) Replace the "Zustand Store Architecture" block — every filename in it is wrong** (`player.ts` → `playerStore.ts` etc.), it lists a `tower.ts` store that does not exist, and it claims "Zustand persistence middleware" where the code uses manual `persistState` helpers:

```markdown
### Zustand Store Architecture (actual filenames — verified 2026-07)
src/stores/playerStore.ts        — profile, FP balances, streak, achievements
src/stores/petStore.ts           — stats, evolution stage, hunger, type, name
src/stores/workoutStore.ts       — active session, sets, rest timer, intent
src/stores/templateStore.ts      — personal template copies (Copy & Customize)
src/stores/baselineStore.ts      — per-exercise rolling volume baselines
src/stores/weightHistoryStore.ts — last-used weight per exercise (auto-fill)
src/stores/prStore.ts            — weight/rep PR records
src/stores/settingsStore.ts      — preferences (haptics)

No tower store yet (Phase 2). No workout-history store yet (audit gap C3).
If an issue needs either, creating it is in scope — don't assume it exists.
Persistence: manual persistState helpers → AsyncStorage. No MMKV.
```

Also worth fixing while in there: "Reanimated v3" → the repo ships `react-native-reanimated ~4.1.1`; the CDT tool names (`mcp__chrome-devtools__*`) should note the Playwright fallback that issue-5 legitimized; and the three referenced skills (`vercel-react-best-practices`, `impeccable`, `systematic-debugging`) should be verified to exist in the headless environment or removed — an agent told to invoke absent skills wastes turns discovering they're missing.

## Remaining failure modes — known, not yet fixed (ranked)

1. **Verification proves the wrong proposition (structural).** Browser-checking acceptance criteria would have happily passed both audit P0s: the double-claim exploit isn't on any issue's criteria list, and `streakDays: 0` makes tests pass *by construction* because the tests encode the same wrong wiring. Mitigations, cheapest first: (a) the Findings section (done); (b) write the NOW-phase issues with *integrity assertions* as acceptance criteria ("claiming the same workout twice must not double-award — add a regression test"), which turns the loop's scope-literalism into a strength; (c) GLM's arch-review tick — see verdict below.
2. **The verification gate checks label presence, and the label is self-reported.** `agent-tick.sh` awk-parses the agent's own summary; nothing validates that claimed snapshots exist or that "browser-checked" is true. A lazy/hallucinating run gets a green badge. Cheap improvement: have the tick script fail to `verification-unknown` unless the summary references at least one artifact path that actually exists on disk.
3. **`test-only` passes the gate even for UI-surfacing issues.** The tiered model says UI work *requires* browser-checked, but CI can't tell issue types apart, so the gate accepts either label. The engineer prompt's "orchestrator does CDT before merge" is aspirational — nothing enforces it. Cheap improvement: an `ui-surfacing` issue label that the gate cross-checks against the verification label.
4. **Branch-protection follow-up was never confirmed.** PR #12's own commit message says the gate only blocks merges "once configured as a required status check via branch protection (follow-up after this PR merges)." Verify that follow-up actually happened — if not, every gate failure is advisory. (Couldn't check from this sandbox; needs `gh api repos/auesugui/IronQuest/branches/<branch>/protection`.)
5. **Environment collisions between ticks.** Dev-server ports and Chrome profiles are shared machine state; the prompt mitigates (find-or-start rule) but two ticks running concurrently, or a tick after a crashed CDT session, will still collide (SingletonLock proved kill is permission-gated, so the agent can't self-heal). Fine while ticks are manual and serial; becomes a real problem the day this runs on cron. Fix when it matters: per-tick `CHROME_USER_DATA_DIR` and a port derived from the issue number.
6. **No cost ledger.** Per-run cost lands in each PR body, but nothing aggregates spend across ticks. A `runs/costs.csv` appended per tick is ~3 lines in the script.
7. **`main` is 12 commits behind the feature branch** while CI, Vercel, and the tick's `BASE_BRANCH` default all track the feature branch. Not a script bug, but the loop is quietly building on a branch that diverges further from `main` every tick (audit Q7).

## On GLM's assessment and sequencing

Its verification table is accurate and its meta-pattern diagnosis is fair — the artifacts back it up better than it knew (the issue-4 diff is the smoking gun). Two disagreements:

**Step 1 is backwards.** It proposes promoting the arch-review agent tick *before* shipping the P0 fix — "build the safety net before walking it." But the audit already *is* the arch review; its output is in hand. Building more review machinery before fixing a known, verified, 2–4-hour P0 exploit is the exact process-preening pattern GLM itself named one paragraph earlier. Ship the fix first — it's also the cheapest possible test of whether the hardened loop can handle wiring-class work when the issue is written with integrity assertions. Then decide whether a recurring arch-review tick earns its cost, knowing what one costs (this audit: read-everything + live-app-driving is not a $20 tick; a useful arch-review tick needs a narrower contract, e.g. "diff docs/ claims against src/ reality for one subsystem").

**"Open 6 issues" needs one amendment.** The issues are only as good as their acceptance criteria — the loop executes criteria literally (proven twice). Each NOW-phase issue should carry: the integrity assertion as a criterion, the regression test as a criterion, and an explicit "out of scope" line so Findings-reporting has a boundary to report against.

Sequencing I'd defend: **(1)** decide Q1 (pet types) — one sentence from Adrian, unblocks everything; **(2)** apply the paste-ready agent-doc fixes above; **(3)** write + tick the FP-pipeline issue (exploit + streakDays in one PR, both with regression tests); **(4)** tick the remaining NOW issues serially; **(5)** *then* evaluate an arch-review tick with a scoped contract. Meta-work earns its keep only between product milestones, not before them.

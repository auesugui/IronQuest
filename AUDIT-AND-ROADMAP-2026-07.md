# IronQuest — Full Application Audit & Roadmap

> **Date:** July 3, 2026 · **Auditor:** Claude (full due-diligence pass: docs, code, live app, market)
> **Build audited:** `feature/phase1-core-implementation` @ `1bef68c`, live Vercel deployment `iron-quest-haa7fpdha`
> **Method:** Read all 18 docs (2,667 lines), audited all 35 source files, ran typecheck + 284 unit tests, exercised the deployed web app end-to-end with a scripted browser (every tab, full workout session, FP claim, stat upgrades, evolution), and researched the competitive landscape.

---

## 1. Executive Summary

IronQuest is in much better shape than most solo side projects — and much further from "done" than its own docs imply. The workout tracker core is real and works: I logged a full 5-exercise PPL push session on the live deployment in under a minute of taps, the 3-second logging rule genuinely holds, PR detection fired correctly, and the FP math matched spec (100 base + 16 volume for 160 reps). The codebase is clean: TypeScript strict passes with zero errors, 284/284 unit tests pass, CI runs typecheck/lint/tests plus a custom "shadow calculator" guard born from a real production incident. That engineering discipline is rare and worth preserving.

But the audit found four load-bearing problems:

1. **The FP economy is trivially exploitable and partially unwired.** Workout results are passed to the summary screen as URL parameters and awarded client-side with no idempotency — I claimed the same workout five times by reloading the URL (FP went 156 → 780, pet evolved to Stage 2 without a single extra rep). Meanwhile `streakDays` is hardcoded to `0` in `session.tsx`, so the streak multiplier and *all Spirit FP* — the entire streak-exclusive economy the docs call a core design rule — can never be earned. The Spirit stat is permanently locked at 0 for every real user.
2. **The pet is not yet a pet.** The renderer works technically (SVG, stat-driven spikes, breathing animation, evolution size steps), but the result is an orange starburst with two dots for eyes. There is no onboarding (type selection and naming exist in the store but no UI ever calls them), no mood, no evolution celebration, no cosmetics. The docs themselves flagged "pet renderer doesn't feel good" as the #1 risk; that risk has materialized and is the single biggest threat to the product's reason to exist.
3. **The docs and code have diverged on identity-level decisions.** Docs (Decision A3) specify 3 pet types — Ferro/Terra/Flux with a type triangle. Code implements 5 different types (`ignis/terra/aqua/ventus/umbra`). The live app shows both at once: the Den says "Ignis Type" while the Tower info card two tabs away says "Ferro → Flux → Terra." No workout history entity exists at all despite the docs' schema requiring it.
4. **The Tower is a static mockup** — expected for Phase 1, but worth stating plainly because half the pitch ("battles its way up an endless tower") is 0% built.

**Bottom-line verdict:** viable path, wrong next milestone. The market niche — a *serious* lifting tracker where a creature is shaped by your actual training data — is real and essentially unoccupied (competitors are either step-counter pets or habit RPGs with no real programming). But the current build order risks shipping a competent tracker attached to a pet nobody cares about. The next 4–6 weeks should be spent almost entirely on (a) FP integrity and (b) making the pet worth caring about — not on the Tower, not on more tracker features.

---

## 2. Audit Findings

### 2.1 Documentation

**Strengths.** The PRD corpus is exceptional for a solo project: 18 files, versioned amendments, a decisions log with rationale (A1–A7), effort estimates with named risks, a UX spec that defines emotional arcs per screen, and a state-architecture doc with concrete TypeScript interfaces. `docs/INDEX.md` is a working entry point. The self-awareness is notable — the architecture doc correctly identifies the pet renderer as the highest-risk item and prescribes "prototype in isolation, define good-enough early."

**Findings.**

| # | Finding | Evidence |
|---|---------|----------|
| D1 | **Pet-type contradiction at decision level.** Docs commit to 3 types (Ferro/Terra/Flux, Decision A3, type triangle in INDEX.md); code ships 5 (`ignis/terra/aqua/ventus/umbra` in `src/types/index.ts:9` and `PetAvatar.tsx:25`). The live Tower screen still teaches "Ferro → Flux → Terra." | `src/types/index.ts`, `app/(tabs)/tower.tsx:46`, live Den screen |
| D2 | **Docs status is stale.** INDEX.md and CLAUDE.md say "Status: Planning Phase, Updated February 2026" while 27 commits of implementation landed through late June 2026. | git log vs. doc headers |
| D3 | **No doc reflects what's actually built.** There is no implementation-status page; the P0/P1 table in `implementation-priority.md` has no checkmarks. A reader cannot tell rest-timer is built but cardio is not. | `docs/07-technical/implementation-priority.md` |
| D4 | **Local schema doc is aspirational.** `local-schema.md` requires UUIDs, `created_at/updated_at`, soft-delete on all entities "from the start" for cloud sync. No entity in the codebase has any of these; there is no WorkoutLog entity at all. | `src/types/index.ts`, `src/stores/*` |

### 2.2 Codebase

**Architecture.** `app/` (expo-router screens) → `src/stores/` (8 Zustand stores with AsyncStorage persistence) → `src/engine/fp/` + `src/lib/` (pure calculators) → `src/config/fp-values.ts` (single tuning file, exactly as the PRD prescribed) → `src/data/` (54-exercise DB, 5 templates). The layering is genuinely good; the FP config-as-single-source-of-truth rule from the docs is honored.

**Health signals.** `tsc --noEmit` clean; 284/284 tests pass across 10 suites (stores, calculators, summary); Biome lint enforced in CI; only one TODO in the entire src/app tree — but it's a critical one (see C2). The `.claude/agents/` + `agent-tick.sh` autonomous-agent loop with verification labels and a CI shadow-calculator guard is unusual, well-documented infrastructure that already caught one real bug class.

**Findings.**

| # | Finding | Evidence |
|---|---------|----------|
| C1 | **FP award is non-idempotent and replayable (verified live).** Workout data travels to the summary screen as a giant JSON URL param (`router.replace({ pathname: '/workout/summary', params: { exercises: JSON.stringify(...) } })`). `handleFinish` awards FP client-side with no workout ID or claim guard. Reloading the URL and tapping "Claim Rewards" again re-awards everything. I did it 5×: 780 FP, Stage-2 evolution, zero extra reps. This breaks the app's own #1 economy rule ("FP earned exclusively through logged workouts"). | `app/workout/session.tsx:137–153`, `app/workout/summary.tsx:59–92`, live test |
| C2 | **Streak multiplier and Spirit FP are dead code paths.** `session.tsx:146`: `streakDays: 0, // TODO: Get from streak store when implemented` — but the streak store *is* implemented (`playerStore.updateStreak`, tested). The engine's `calculateSpiritFP(streakDays)` therefore always returns 0. Consequence: the 1.0×–2.0× streak multiplier never applies, no Spirit FP is ever earned, and the Spirit stat (upgradeable only with Spirit FP, `den.tsx:73–83`) is unreachable for every user. One line of wiring disables ~30% of the designed economy. | `app/workout/session.tsx:146`, `src/engine/fp/calculator.ts:184–190`, `src/stores/playerStore.ts:142–185` |
| C3 | **No workout history exists.** No WorkoutLog entity, store, or screen. After claiming, a session is reduced to aggregates (totalWorkouts count, per-exercise baselines, weight history). Home-screen "This Week" and "PRs" stats are hardcoded `"0"`, and "Tower Floor" is hardcoded `"1"` (`app/(tabs)/index.tsx:44–47`). A tracker that can't show you last week's session will lose serious lifters — its primary persona. | `src/stores/` (absence), `app/(tabs)/index.tsx` |
| C4 | **Two parallel FP calculators remain.** `src/engine/fp/calculator.ts` (session-level, the "real" engine) and `src/lib/fp-calculator.ts` (set-level, for display/PR detection). This exact split caused the June 23 "FP fracture" incident (summary bypassed the engine; tests passed, behavior broke). The CI guard only catches `calculate*`/`compute*` functions declared inside `app/` — divergence between the two `src/` modules is unguarded. | `scripts/check-shadow-calculators.sh`, both calculator files |
| C5 | **Typed-FP distribution is miscalibrated in the exercise DB.** fpType tag counts: focus 35, vigor 24, speed 22, guard 16, power 11, spirit 0. Compound presses tagged `['power','focus']` leak Focus everywhere. Result (visible on live template cards): every one of the 5 templates shows Focus 32–40%, Power 11–15%, Spirit 0%. All pets will converge toward the same Focus-heavy shape — killing the "your pet reflects your split" differentiator. | `src/data/exercises.ts`, live radar charts on all 5 template cards |
| C6 | **Dead/broken tooling in repo root.** `jest.unit.config.js` references uninstalled `ts-jest` (fails on run); `debug-ui.js`, `interactive-test.js`, `visual-test.js`, `verify*.js` are one-off scripts from early June sitting in root. Minor, but they misrepresent the test surface. | repo root, `npx jest --config jest.unit.config.js` |
| C7 | **Onboarding APIs exist but are orphaned.** `petStore.initializePet(type, name)` is implemented and tested; no screen ever calls it. `app/index.tsx` just redirects to tabs. Pet is permanently the unnamed default `'ignis'`. | grep: only definition + tests reference it |

### 2.3 Live App Behavior (deployed build, mobile viewport)

Every flow below was exercised on the live Vercel deployment; screenshots captured.

**What works well.**
- **Set logging is genuinely fast.** Quick-tap rep chips (5/8/10/12) log a set in one tap and auto-start the rest timer with pause/skip. The 3-second rule is met. The "..." modal adds reps steppers, weight steppers, and plate-math quick weights (45/65/95/135/185/225) — thoughtful for barbell work.
- **PR detection works end-to-end:** logging 10×135 lb via the modal immediately showed a gold "PR!" badge on the set row.
- **Loadout screen is the best screen in the app:** template preview, Normal/Deload intent picker with FP consequences explained, Phase-2 intents visible but disabled (good future-teasing), FP forecast.
- **The claim loop works:** summary → Claim Rewards → FP lands in Den → stat upgrades spend typed-then-generic FP correctly with scaling costs (5→8→12), Spirit correctly refuses generic FP.
- Zero failed network requests; no console errors beyond the hydration warning below.

**Findings.**

| # | Finding | Evidence |
|---|---------|----------|
| A1 | **"End" destroys a session with no confirmation.** The header "End" button (`handleEndSession`) discards every logged set and navigates back — no dialog, no FP, no recovery. I lost a 7-set session with one mis-tap. This is the single worst interaction in the app for its target user. | `app/workout/session.tsx:131–135`, reproduced live |
| A2 | **Raw route names render as screen titles.** Headers literally read `workout/template/[id]`, `workout/loadout`, `workout/summary` on the live app. Missing `Stack.Screen` title options. | Screenshots of all three screens |
| A3 | **Tab bar icons are placeholder squares.** `TabIcon` renders an empty tinted `View` ("Placeholder — will use expo-symbols"). Four gray rectangles are the app's primary navigation. | `app/(tabs)/_layout.tsx:74–84`, screenshots |
| A4 | **Quick-tap sets log `weight: null`.** Only the modal path captures weight. So the default fast path produces volume-less data: baselines (weight×reps) stay 0, weight PRs can't fire, and the docs' P0 "weight memory + auto-fill from last session" is absent from the primary flow. Weight history auto-fill exists only inside the modal. | Summary URL payload (`"weight":null` on 15 of 16 sets), `SetInputModal.tsx` |
| A5 | **No auto-advance between exercises.** After logging all 4 bench sets, the screen stays on bench ("1 / 5"); user must find the bottom nav button. Docs' session-flow spec calls for auto-advance. | Live session, `session.tsx:154–160` |
| A6 | **Summary screen underdelivers its own spec.** The UX spec calls this "the single most important gamification moment": sequential FP line animation, typed-FP radar filling, streak celebration, "Head to The Den" CTA. Shipped: static text lines, no radar, no streak mention, no Den CTA. | `docs/09-ux-design/ux-spec.md` vs `app/workout/summary.tsx` |
| A7 | **Evolution happens silently.** Crossing 500 FP flipped "Stage 1: Shard" → "Stage 2: Form" as a text change. No morph, no fanfare — the docs' flagship celebration moment. | Live test crossing threshold |
| A8 | **React hydration error #418 on every page load** (static rendering + client-side store divergence). Harmless-looking but it's masking real hydration divergence — e.g. dates, persisted state — and will complicate debugging. | Console on every navigation |
| A9 | **Tower tab is inert** (expected Phase 2): "Start Battle" is a `Pressable` with no `onPress`; page text never changes. Attempts show a hardcoded 7/7. | `app/(tabs)/tower.tsx:37–39`, verified no state change |
| A10 | **Profile is a stub:** no name editing, one setting (haptics), "0 unlocked" achievements with no achievement system behind it. | `app/(tabs)/profile.tsx` |
| A11 | Minor: hunger "100 %" wraps awkwardly; streak fire emoji renders as tofu box in some environments; feed is a single flat 20-FP action (docs: 3–4 food tiers + auto-feed per Decision A1). | Screenshots, `den.tsx:24` |

### 2.4 Design / UX & the Avatar System

The visual foundation is competent: a coherent dark theme with a proper token system (`src/theme/` — colors, spacing, typography used consistently everywhere; almost no hardcoded values). Cards, bars, and buttons are consistent across screens. This is a solid skeleton.

**The pet, assessed honestly:** at Stage 1 with zero stats it is a small orange 6-pointed star. At Stage 2 with Power 5 / Focus 3 it is a larger, spikier orange starburst with two small eyes. The stat→geometry mapping exists in code (`PetShapes.ts` is 399 lines of real parameterized generation — spike count/length from Power, layering from Guard, elongation from Speed, aura/particles from Spirit) and the breathing animation runs. But the *result* reads as clipart, not creature. It has no face beyond two dots, no silhouette identity, no personality pose, no reaction to your presence (docs specify tap reactions and mood-driven environment; neither exists). Nothing on screen tells you *why* it's spiky or what changed when you upgraded Power. The docs' inspiration references (VoidPets' attachment, Undertale's geometric-but-characterful design) set a bar this doesn't approach yet — and the docs' own risk register predicted exactly this ("If geometric generation doesn't feel right after 20h, fall back to pre-defined templates with stat-driven variation").

Against your three bars:
- **Unique?** The concept is unique; the current rendering is not — it would blend into any icon pack.
- **Intuitive?** The tracker mostly yes (quick-taps are self-evident); the game layer no — nothing explains FP types, why Spirit is different, what evolution means, or that the pet's shape encodes your training.
- **Cohesive?** Theme yes; *content* no — placeholder tab icons, raw route titles, a type system that names itself two different things, and an emoji-based profile avatar next to an SVG pet.

### 2.5 Market & Competitive Landscape

**Category:** gamified strength-training tracker with creature-raising — the intersection of serious workout trackers (Strong, Hevy, JEFIT) and virtual-pet motivation apps. Market context: fitness apps face a brutal retention cliff — industry benchmarks put day-30 retention around 3–10%, and roughly 80% of users abandon workout apps within 90 days ([RetentionCheck](https://retentioncheck.com/churn-benchmarks/fitness-apps), [Lucid](https://www.lucid.now/blog/retention-metrics-for-fitness-apps-industry-insights/)). The gamified segment is growing (US gamified fitness projected ~$4.2B, ~17% CAGR per [Editorialge](https://editorialge.com/us-gamified-fitness-market-2026/)), and gamification measurably helps adherence (+27% in a 2022 JMIR study cited by [FitCraft](https://getfitcraft.com/science/do-fitness-apps-work)).

| Competitor | Avatar/creature system | Core loop | Monetization | Lesson for IronQuest |
|---|---|---|---|---|
| **Habitica** (~$5.2M/yr, 4M+ users) | Pixel avatar + collectible pets | Any habit → XP/gold, party quests | Subs $4.99/mo + gems | Proves people pay for habit-RPG; but no real workout programming — lifters outgrow it |
| **Strong / Hevy** | None | Serious set logging, plate math, history charts | Subscription | The tracker bar IronQuest must match: history, charts, auto-fill are table stakes |
| **Wokamon / DigiBuddy / Motion "Motmots" / GymPet** | Cute pets fed by steps/workouts | Passive activity → pet growth | IAP/light subs | Closest neighbors; all are step-counter-casual. None ties creature *stats/shape* to training composition — IronQuest's lane is open |
| **Pokémon Sleep** ($100M+ yr 1) | Beloved IP creatures | Sleep → research points | IAP | IP does heavy lifting IronQuest can't; but proves passive-data→creature loop retains at scale |
| **Zombies, Run!** | None (narrative) | Story missions during cardio | Subscription | Retention comes from *meaning*, not points: 68% still active at week 16 vs 31% control in one cited study ([Alibaba insights](https://www.alibaba.com/product-insights/minecraft-fitness-mod-vs-zombies-run-which-gamified-app-actually-improves-consistency-for-weight-loss)) |
| **Fitocracy** (dead) | None | Points + social for lifting | Coaching | Cautionary tale: gamified lifting with millions of users still died when the loop got stale and monetization lagged |

**Assessment:** the niche is real and unoccupied — no shipping app makes a creature whose *body* is a function of your split, PRs, and consistency, attached to a tracker good enough for a 4–6-day/week intermediate lifter. That's a defensible wedge. The two failure modes the graveyard warns about: (1) the tracker isn't actually better than Strong/Hevy for daily logging, so lifters don't switch; (2) the game layer is a skin, so the week-6 novelty cliff hits (Fitocracy). IronQuest's answer to both must be the pet's *legibility* — a training partner can glance at your pet and read "high-volume leg-day consistency freak" — which only works if C5 (Focus skew) is fixed and the renderer earns attachment.

---

## 3. Gap Analysis — Vision vs. Reality (prioritized by impact)

| Priority | Vision (docs) | Reality (verified) | Impact |
|---|---|---|---|
| 🔴 P0 | FP exclusively from logged work; anti-gaming rules | Double-claim exploit via URL replay (C1) | Economy integrity — invalidates everything downstream |
| 🔴 P0 | Streak multiplier ×1.0–2.0; Spirit FP from streaks only | Hardwired `streakDays: 0`; Spirit unearnable (C2) | Kills the consistency-reward loop that is the app's retention thesis |
| 🔴 P0 | "Your Pet = Your Effort"; pet worth caring about (Phase 1 exit criterion) | Starburst with dot eyes; no onboarding, name, mood, or celebration (§2.4, C7, A7) | The product's differentiator doesn't yet exist emotionally |
| 🔴 P0 | Tracker faster than current method (exit criterion) | Fast, but: no history (C3), no session-abandon guard (A1), weight-less quick taps (A4) | Serious lifters won't switch without history + weight capture |
| 🟠 P1 | 3 pet types, chosen at start, type triangle | 5 types in code, 0 selectable, contradictory copy (D1) | Identity confusion shipped to UI; blocks Tower design |
| 🟠 P1 | Typed FP reflects your split → distinct pets | Focus 32–40% on every template (C5) | All pets converge → differentiator neutered |
| 🟠 P1 | Post-session summary = peak gamification moment | Static text; no radar/streak/Den CTA (A6) | The one screen that sells the game layer undersells it |
| 🟠 P1 | Evolution as celebration; feeding tiers; auto-feed; mood; vacation mode | Silent text flip; flat 20-FP feed; none of the rest (A7, A11) | Pet-care loop is mechanical, not emotional |
| 🟡 P2 | Battle Tower (Phase 2) | Static mockup (A9) | Expected gap; fine if sequenced after the above |
| 🟡 P2 | Achievements, quests, cosmetics, cardio, notifications | Absent | Correctly deferred |

---

## 4. Phased Roadmap to a Cohesive v1

Sequencing principle: **integrity → attachment → depth.** Don't build the Tower on an exploitable economy and an unloved pet.

### NOW (≈ weeks 1–4): Economy integrity + tracker trust

*Everything here is small, sharply-scoped, and unblocks everything else.*

1. **Fix the FP award pipeline** (C1, C2 — ~2–4h each, highest ROI in the repo):
   - Create the workout record in `workoutStore` *before* navigation; pass only a workout ID to the summary; award FP once against that ID with a `claimedAt` guard. This kills the URL-replay exploit and the fragile mega-URL.
   - Replace `streakDays: 0` with `usePlayerStore.getState().streak.current`. Add a regression test asserting Spirit FP > 0 after a claimed workout on a ≥1-day streak.
2. **WorkoutLog entity + history screen** (C3): persist claimed sessions (id, date, exercises/sets, FP breakdown, PRs) per the `local-schema.md` shape (UUID + timestamps now — cheap insurance for Phase 3 sync). Wire home-screen "This Week" and "PRs" to real data. A simple reverse-chron list with per-session FP is enough for v1.
3. **Session-abandon guard** (A1): confirmation dialog on "End" ("Discard 7 logged sets?"), and persist in-progress session state so an accidental refresh/kill doesn't lose work (store already persists; verify resume path).
4. **Weight in the fast path** (A4): quick-tap should log with the exercise's last-used weight (weightHistoryStore already exists) and show it on the chip row ("@ 135 lb · tap ... to change"). This makes baselines/PRs work with real data without breaking the 3-second rule.
5. **Ship real tab icons and screen titles** (A2, A3): an afternoon of work that removes the two loudest "unfinished" signals. Fix the hydration error (A8) while in `_layout.tsx` (gate store-dependent first paint).
6. **Repo hygiene** (C6, D2, D3): delete/relocate root one-off scripts, fix or remove `jest.unit.config.js`, update INDEX/CLAUDE status headers, add an implementation-status column to `implementation-priority.md`.

**Exit test:** a user can log two weeks of real workouts with weights, see their history, never lose a session, never double-claim, and watch their streak multiplier and Spirit FP actually accrue.

### NEXT (≈ weeks 5–10): Make the pet worth caring about

*This is the make-or-break bet. Time-box it like the docs said: if procedural-only doesn't feel good after ~20 focused hours, switch to art-directed templates.*

7. **Resolve the type-system decision first** (D1 — decision, then ~1 day): pick 3 types (recommend keeping the documented Ferro/Terra/Flux — the type triangle and Tower copy already assume it) or formally amend the docs to 5. Everything visual downstream depends on this.
8. **Onboarding flow** (C7): 3 screens — choose type (with visual + personality blurb), name the pet, pick a starting template. `initializePet` already exists; this is UI only.
9. **Avatar identity pass** — the concrete design direction in §5 below. Target: a creature with a silhouette, a face, and 3 readable "builds" (Power-spiky / Guard-armored / Speed-sleek) per type.
10. **Celebration layer:** evolution morph sequence (Reanimated is already a dependency and used in PetAvatar; a scale+morph+flash is achievable), PR gold flash in-session, summary screen upgraded to spec (sequential FP lines, typed radar — `RadarChart.tsx` already exists and is used on template cards, reuse it — streak line, "Visit the Den" CTA).
11. **Pet-care depth, minimum lovable version:** mood derived from hunger+recency (already typed in `src/types`), tap reaction animation, 2 food tiers + auto-feed toggle (Decision A1), vacation mode toggle (Decision A5 — small: freeze `calculateHungerDecayAmount`).
12. **Fix typed-FP calibration** (C5): re-tag the exercise DB so compounds emit their primary mover dominantly (e.g. bench = power 0.8/focus 0.2 via weighted tags rather than equal split), and rebalance so each core template produces a visibly different radar. Add a test asserting no single type exceeds ~35% across all built-in templates.

**Exit test (the docs' own):** after a real workout you *want* to open the Den; a friend seeing your pet asks what it means.

### LATER (≈ weeks 11–18): The Tower and the loop that retains

13. **Auto-battle engine** as a pure module in `src/engine/battle/` with the same test discipline as the FP engine (stat comparison, type triangle, turn order, HP from Vigor — all specified in `docs/05-battle-tower/tower.md`).
14. **Tower progression:** floor generation scaled to floor number, attempts earned per claimed workout (wire to the now-real WorkoutLog), boss floors every 10th, floor rewards.
15. **Battle presentation v1:** keep it cheap — text-log + animated stat bars + pet bounce/flash. Do not build the full battle-animation system before validating people play the Tower at all.
16. **Achievements v1** (the P2 docs list has 20+; ship 8–10 that celebrate tracker behavior: first PR, 7-day streak, 100 sets, first evolution…).
17. **Then and only then:** Supabase/auth/sync, leaderboards, share cards, notifications (Phase 3 as documented). Note: share cards may deserve promotion into this phase — a pet image with stats is the cheapest organic-growth loop this product has.

### Explicitly cut / keep deferred
Cardio logging, supersets, program builder, PvP, multiple pets, seasonal events, AI coach, Skia/Rive upgrades — all correctly Phase 3/4. Resist promoting any of them before the Tower proves the mid-game retains.

---

## 5. Design Direction — Making the Avatar a Signature (concrete, not "make it unique")

The stat→geometry idea is right; it just needs an identity layer on top of the math. Specific recommendations:

1. **Give every pet an anchor silhouette per type.** Instead of generating free-floating starbursts, define one base body-shape per type (e.g. Ferro = compact hexagonal core; Terra = broad trapezoidal base; Flux = tall teardrop) and let stats *deform* that silhouette. Recognition comes from silhouette; personalization comes from deformation. This is the docs' own fallback plan, executed halfway: templates + stat-driven variation.
2. **Invest disproportionately in the face.** Two dots → a proper eye system: eye shape per type, blink cycle, gaze that follows a tap, squint when hungry, sparkle after a PR workout. Undertale (the docs' own reference) proves ~90% of geometric-character charm is eyes + timing. This is days, not weeks, of work and moves attachment more than any body-geometry change.
3. **Make stat changes legible at the moment of spend.** When +1 Power is tapped, animate *only* the spikes growing with a 300ms overshoot and a one-line caption ("Spikes sharpened"). The Den already has the live pet above the stat rows; currently an upgrade changes nothing perceptible. The UX spec's "live visual preview" is the single most important unbuilt interaction in the Den.
4. **Encode training history, not just totals.** A subtle ring/segment marking (one notch per week of ≥3 workouts, glow intensity from current streak) makes the pet a readable training résumé — the thing no competitor has and the core of the "glance at someone's pet" promise in the UX spec.
5. **Color discipline:** stat colors already exist in the theme (`colors.stats.*`) and are used in Den bars and radar. Carry them onto the pet itself (Power deformations tint warm red at high values, etc.) so radar chart, stat rows, and creature all speak one language.
6. **Interaction-pattern consistency rules to adopt now:** every irreversible action gets a confirm (End session, template delete — templateStore delete currently silent too); every screen gets a designed title; every celebration (PR, evolution, streak milestone) uses one shared animation vocabulary (gold flash + haptic burst + spring settle) so reward moments are instantly recognizable.
7. **If procedural still doesn't sing after the time-box:** commission a small set (3 types × 4 stages = 12 base illustrations as SVG) and keep stat-driven recolor/scale/accessory layers procedural. Cost is bounded, the "your effort shapes it" promise survives via the deformation layer.

---

## 6. Feasibility Assessment (solo + AI-agent workflow)

**What's realistic:** the NOW phase is 1:1 with existing skills demonstrated in the repo — it's wiring, guards, and screens of kinds already built, well within the agent-loop workflow that shipped issues #2–#5. The docs' estimate of ~240–320h for Phases 1+2 looks *optimistic but not fantasy* given ~40% of Phase 1 hours are already banked; at the historical pace (27 commits, 5 agent-assisted PRs in ~10 days of activity in June), NOW+NEXT is a realistic Q3.

**The two honest single-person risks:**
1. **Character design is a different skill than engineering.** The renderer risk isn't code — `PetShapes.ts` proves the code is fine — it's art direction. Mitigation is built into §5: silhouette+face work first (learnable, high-leverage), commissioned base art as the bounded fallback. Budget for the fallback now (~12 SVG illustrations) so it's a decision, not a crisis.
2. **The battle system is a content treadmill.** Endless-tower balance, enemy variety, and ability design are ongoing design labor, not a feature you finish. Keep Phase-2 scope to the auto-battle + simple floor scaling and let prestige resets (Decision A2) do the content-stretching work.

**Technical debt that gets expensive if deferred:** entity IDs/timestamps on stores (blocks Phase 3 sync migration), the dual-calculator split (extend the CI guard to hash-compare engine outputs, or merge set-level math into the engine), and the hydration error (will mask real bugs as screens multiply).

---

## 7. Open Questions / Decisions Needed from Adrian

1. **Pet types: 3 (Ferro/Terra/Flux per docs) or 5 (ignis/terra/aqua/ventus/umbra per code)?** Everything from onboarding UI to Tower balance to art budget hangs on this. Recommendation: 3 — the triangle is designed, and 3 types × 4 stages is a tractable art surface; 5 is not.
2. **Art budget: is commissioning ~12 base creature illustrations acceptable if the procedural time-box fails?** (Rough market rate for simple vector creature sets is modest; the decision matters more than the amount.)
3. **Units: the app is lb-only (quick weights 45/65/95/135/185/225).** Is kg support in scope for v1? Affects weight memory, plate math, and baselines.
4. **Web target: is the Vercel web build a real distribution channel or just an agent-verification surface?** If real, hydration + responsive layout need a workstream; if not, CI should test what users get (Expo Go / native builds).
5. **Phase 1 exit criteria are personal ("use it for every workout for 2 weeks").** Has that dogfooding period started? The NOW list is essentially "what must be true before those 2 weeks can produce a honest verdict."
6. **Share cards early?** They're Phase 3 in docs, but they're also the only organic acquisition mechanic. Worth promoting to the Tower phase?
7. **The `main` branch is 12 commits behind `feature/phase1-core-implementation`.** Intentional staging, or should the feature branch land? (CI + Vercel both track the feature branch; the divergence will bite eventually.)

---

## Appendix: Evidence Inventory

- **Live flows exercised:** Quest Board, all 5 template cards + radar charts, template detail (PPL), Copy & Customize entry, loadout + intent picker, full 5-exercise session (16 sets), quick-tap + modal logging, PR trigger @135 lb, rest timer (start/skip), End-session data loss, Finish → summary → Claim, double/quintuple-claim exploit, Den (feed state, 8 stat upgrades, typed-vs-generic spend, Spirit lockout), Stage 1→2 evolution, Tower (Start Battle inert), Profile (haptics toggle).
- **Console:** React #418 hydration error on every route; zero failed network requests.
- **Code verification:** `tsc --noEmit` clean; `jest` 284/284 pass; `jest.unit.config.js` broken (ts-jest missing); Biome binary not runnable in audit sandbox (platform-specific binary; CI covers it).
- **Screenshots on file:** home (zero-state), Den (Stage 1 + Stage 2), Tower, session (pre/mid/post logging), set modal, loadout, summary.

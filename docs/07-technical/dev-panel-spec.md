# Dev Panel — End-to-End Build Spec

> **Status:** Ready to build · **Date:** 2026-07-06 · **Owner:** ironquest-engineer agent
> **Scope:** `__DEV__`-only feature — never ships to production.
> **Store APIs verified against the codebase as of 2026-07-06** (Phase 2 code-complete, post-PR #50).

---

## 1. Goal

A `__DEV__`-gated control panel that seeds and mutates app state so features can be
tested in seconds instead of by grinding real workouts. The force-multiplier for
dogfooding Phase 2 (evolution, hunger/mood, streak/Spirit, PR flash, share cards, history)
without a two-week real-use ramp.

**One-line purpose:** set pet type/stage/stats/hunger, grant FP, set streak, seed PRs + history,
and full-reset — all from one hidden screen.

---

## 2. Scope

### In scope (4 stores + reset)

- **Pet** — type, evolution stage, stats, hunger
- **Player** — FP balances, streak
- **PRs** — seed the big lifts
- **Workout history** — seed claimed logs
- **Reset** — back to fresh install (onboarding)

### Out of scope (and why)

| Cut | Reason |
|---|---|
| Vacation mode toggle | Feature doesn't exist yet (grep confirms; roadmap Decision A5, unbuilt). The hunger lever covers the same test need. |
| Tower / achievement seeding | Those screens aren't built out; not worth seeding. |
| Settings toggles | Already live in Profile (units, haptics, reduced-motion). |

### Optional levers (defer unless time allows)

- **Preview evolution ceremony at stage N** — host an `EvolutionCeremony` modal in the dev screen to see each tier without earning it.
- **Trigger PR flash** — mount the in-session PR flash component standalone.

---

## 3. Architecture

Three decisions, all forced by existing code patterns:

### 3.1 No new production store API

Every store already has a `reset()` clearly labeled "dev/test only"
(`workoutHistoryStore` literally comments `/** Reset to initial state (dev/test only). */`).
This feature follows that precedent — it does **not** add `devSetStage`-style actions to the
real stores. Instead:

- **Reuse existing actions** where they exist: `usePlayerStore.setFP`, `usePRStore.recordPR`.
- **Where no setter exists** (streak value, pet stage/type/hunger, raw stats, history logs):
  `useXStore.setState({ ... })` + persist to that store's **own** `FULL_STATE` key — the
  identical pattern each store's private persist helper uses internally.

Zustand's `setState` is synchronous, so `getState()` called immediately after reflects the change.

### 3.2 Entry = a `__DEV__`-only row on Profile

Not a secret gesture. Since the whole feature is dev-gated (never ships), discoverability beats
secrecy — you shouldn't have to remember a long-press to test your own app.

### 3.3 Route is `href: null`

Hidden tab (same pattern as `history`), reached via `router.push('/(tabs)/dev')`. Must register
a `<Tabs.Screen name="dev" href:null>` entry, or expo-router auto-shows it as a tab.

### 3.4 `__DEV__` gating

Metro/RN global; `true` in Expo Go + dev web server (all dogfood surfaces), `false` +
dead-code-eliminated in production. Gate the Profile entry row in JSX **and** short-circuit the
screen component to `null` if `!__DEV__` (defense in depth).

---

## 4. Files

| Action | File | Purpose |
|---|---|---|
| Create | `src/components/dev/devActions.ts` | Pure mutation helpers + seed fixtures. No JSX — unit-testable. |
| Create | `src/components/dev/DevPanel.tsx` | Screen UI (sections + pressable levers). |
| Create | `app/(tabs)/dev.tsx` | Route component. Returns `<DevPanel/>` (or `null` if `!__DEV__`). |
| Create | `src/components/dev/__tests__/devActions.test.ts` | Fixture-shape + reset tests. |
| Modify | `app/(tabs)/profile.tsx` | Append `{__DEV__ && <Dev row/>}` section. |
| Modify | `app/(tabs)/_layout.tsx` | Add `<Tabs.Screen name="dev" options={{ href: null, title: 'Dev Panel' }} />`. |
| Modify | `src/navigation/routeTitles.ts` | Add `'(tabs)/dev': 'Dev Panel'`. |
| Modify | `src/__tests__/routeTitles.unit.test.ts` | Add the new route to whatever it asserts. |

**No store files change.**

---

## 5. The Levers

Each row: what it does → the exact store call → the browser assertion (Chrome DevTools MCP
a11y snapshot is the project's in-loop verification tool).

### 5.1 Pet

| Lever | Call | Verify |
|---|---|---|
| Set type (Ferro / Flux / Terra) | `usePetStore.setState({ type })` → `appStorage.setJSON(STORAGE_KEYS.PET.FULL_STATE, usePetStore.getState())` | Den + onboarding cards render the chosen type |
| Set stage (1–4) | `devSetStage(stage)` — sets `evolutionStage` **and** snaps `totalFPEarned` to `FP_CONFIG.evolution.thresholds[stage]` | Den renders the sprite at that stage (Flux 3/4 visible without grinding) |
| Set stats (presets: empty / balanced / Power-build / Speed-build) | `usePetStore.setState({ stats })` + persist | Den radar + dominant-stat glow reflect the preset |
| Set hunger (Low 15 / Mid 50 / Full 100) | `devSetHunger(hunger)` — sets `hunger` **and** backdates `lastFedAt` to `(100-hunger)/5` hours ago | Den shows the matching mood/hunger state; survives reload |

**Why stage snaps `totalFPEarned`:** `evolutionStage` is what `PetSprite` dispatches on (rendering
needs only the explicit field), but `addFP` uses `Math.max(derived, current)` and the Den's
progress / `canEvolve` selectors read `totalFPEarned`. Snapping keeps all three consistent so a
later real workout doesn't behave weirdly.

**Why hunger backdates `lastFedAt`:** `calculateHungerDecay()` runs on app open and derives hunger
*from `lastFedAt`* at 5 pts/hr. Setting `hunger: 15` but leaving `lastFedAt` recent means the next
open recomputes and overwrites it. Backdating makes the lever stable.

### 5.2 Player

| Lever | Call | Verify |
|---|---|---|
| Set FP (presets: 0 / 1k / 10k across all 7 types) | `usePlayerStore.getState().setFP(fp)` (existing action, persists) | Den stat-buy buttons affordable; feeding works |
| Set streak (0 / 3 / 7 / 14 / 30) | `usePlayerStore.setState({ streak: { current, longest: current, lastWorkoutDate: today } })` → persist `STORAGE_KEYS.PLAYER.FULL_STATE` | Quest Board streak multiplier + Spirit FP tier update |

### 5.3 PRs

| Lever | Call | Verify |
|---|---|---|
| Seed big-3 PRs (lb or kg) | `usePRStore.getState().recordPR('barbell_bench_press', 225, 5, unit)` repeated for squat / deadlift (+ a couple accessories) | Quest Board "PRs" section + history screen populate; next real set above these triggers PR flash |

**Use `recordPR`, not a raw write** — it builds the `ExercisePR` shape correctly and updates
`totalPRCount` / `recentPRs`. Records are keyed `${exerciseId}::${unit}`, so pass the matching unit.

### 5.4 Workout history

| Lever | Call | Verify |
|---|---|---|
| Seed 5 claimed workouts | `useWorkoutHistoryStore.setState({ logs })` → `appStorage.setJSON(STORAGE_KEYS.WORKOUT_HISTORY.FULL_STATE, { logs })` | History screen shows 5 sessions with FP; share card totals populate |

`createLog` can't be reused — it writes *unclaimed* logs with null FP. Seed logs must be
pre-claimed, so a direct write with the fixture below is correct.

### 5.5 Reset

| Lever | Call | Verify |
|---|---|---|
| Reset all data (confirm via `Alert`) | `reset()` on every store: pet, player, workoutHistory (`reset`), pr (`clearAll`), baseline, weightHistory, templates, settings, workout | App returns to onboarding (fresh install) |

Each `reset()` / `clearAll()` clears its own AsyncStorage key — that's why no manual key deletion
is needed.

---

## 6. Seed-Fixture Shapes (exact, paste-ready)

`src/components/dev/devActions.ts`:

```ts
// DEV-ONLY. Never imported outside __DEV__. Reuses existing store actions where they
// exist; otherwise setState + persist to the store's own FULL_STATE key (same pattern
// the stores use internally). No new production store API.

import { FP_CONFIG } from '@/config/fp-values';
import { getExerciseById } from '@/data';
import type { Exercise, FPBalances, PetStats, PetType, WorkoutLog } from '@/types';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { usePetStore } from '@/stores/petStore';
import type { EvolutionStage } from '@/stores/petStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useWorkoutHistoryStore } from '@/stores/workoutHistoryStore';
import { usePRStore } from '@/stores/prStore';
// + useBaselineStore, useWeightHistoryStore, useTemplateStore, useSettingsStore,
//   useWorkoutStore for devResetAll (confirm each exports reset() at build time).

const persistPet = () =>
  appStorage.setJSON(STORAGE_KEYS.PET.FULL_STATE, usePetStore.getState());
const persistPlayer = () =>
  appStorage.setJSON(STORAGE_KEYS.PLAYER.FULL_STATE, usePlayerStore.getState());

const STAGE_THRESHOLDS = FP_CONFIG.evolution.thresholds; // [0, s2, s3, s4]

export function devSetPetType(type: PetType) {
  usePetStore.setState({ type });
  persistPet();
}

export function devSetStage(stage: EvolutionStage) {
  usePetStore.setState({ evolutionStage: stage, totalFPEarned: STAGE_THRESHOLDS[stage] });
  persistPet();
}

export function devSetStats(stats: PetStats) {
  usePetStore.setState({ stats });
  persistPet();
}

export function devSetHunger(hunger: number) {
  const hoursAgo = (100 - hunger) / 5; // match 5pts/hr decay so it survives recalc
  const lastFedAt = new Date(Date.now() - hoursAgo * 3_600_000).toISOString();
  usePetStore.setState({ hunger, lastFedAt });
  persistPet();
}

export function devSetFP(fp: FPBalances) {
  usePlayerStore.getState().setFP(fp); // existing action persists
}

export function devSetStreak(current: number) {
  const lastWorkoutDate = new Date().toISOString().split('T')[0];
  usePlayerStore.setState({ streak: { current, longest: current, lastWorkoutDate } });
  persistPlayer();
}

export function devSeedPRs(unit: 'lb' | 'kg') {
  const record = usePRStore.getState().recordPR;
  record('barbell_bench_press', unit === 'lb' ? 225 : 100, 5, unit);
  record('barbell_back_squat', unit === 'lb' ? 315 : 140, 5, unit);
  record('barbell_deadlift', unit === 'lb' ? 405 : 180, 5, unit);
}

function makeExercise(id: string, weight: number, reps: number, sets: number): Exercise {
  const def = getExerciseById(id);
  return {
    id,
    name: def?.name ?? id,
    muscleGroups: def?.muscleGroups ?? [],
    restSeconds: 120,
    completed: true,
    sets: Array.from({ length: sets }, () => ({
      reps,
      weight,
      logged: true,
      isPR: false,
      isRepPR: false,
    })),
  };
}

export function devSeedHistory() {
  const now = Date.now();
  const mk = (daysAgo: number, totalFP: number, fpEarned: FPBalances): WorkoutLog => ({
    id: `seed_${daysAgo}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date(now - daysAgo * 86_400_000).toISOString(),
    exercises: [makeExercise('barbell_bench_press', 225, 5, 3)],
    durationSeconds: 2700,
    streakDays: Math.max(1, 7 - daysAgo),
    sessionIntent: 'normal',
    claimedAt: new Date(now - daysAgo * 86_400_000 + 60_000).toISOString(),
    totalFP,
    fpEarned,
  });
  const fp = (p: number, g: number, s: number): FPBalances => ({
    generic: g,
    power: p,
    guard: 0,
    speed: s,
    vigor: 10,
    focus: 10,
    spirit: 0,
  });
  const logs = [
    mk(1, 250, fp(60, 150, 0)),
    mk(2, 230, fp(50, 140, 0)),
    mk(4, 210, fp(40, 120, 20)),
    mk(6, 200, fp(30, 110, 30)),
    mk(8, 190, fp(20, 100, 40)),
  ];
  useWorkoutHistoryStore.setState({ logs });
  appStorage.setJSON(STORAGE_KEYS.WORKOUT_HISTORY.FULL_STATE, { logs });
}

export function devResetAll() {
  usePetStore.getState().reset();
  usePlayerStore.getState().reset();
  useWorkoutHistoryStore.getState().reset();
  usePRStore.getState().clearAll();
  useBaselineStore.getState().reset();
  useWeightHistoryStore.getState().reset();
  useTemplateStore.getState().reset();
  useSettingsStore.getState().reset();
  useWorkoutStore.getState().reset();
}
```

**Before wiring `devResetAll`:** confirm every store in it exports `reset()` (PR uses `clearAll`).
Run `grep -n "reset:" src/stores/*.ts` at build time. If any store lacks `reset`, call its existing
equivalent or drop it from the loop and note which data the reset won't clear.

---

## 7. Tests (`devActions.test.ts`)

Keep to 3, matching project discipline (343 tests, biome clean):

1. **Fixture shape** — `devSeedHistory()` logs all have `claimedAt !== null`, `totalFP !== null`,
   `fpEarned !== null`, and every set has `logged === true`. Guards the history screen against
   rendering null FP.
2. **Stage snap** — after `devSetStage(3)`, store has `evolutionStage === 3` and
   `totalFPEarned === FP_CONFIG.evolution.thresholds[3]`.
3. **Reset** — after seeding then `devResetAll()`, every store returns to initial state
   (pet `id === ''`, player FP all 0, history `logs === []`, PR `totalPRCount === 0`).

Reset all stores in `beforeEach`.

---

## 8. Build Order

1. `devActions.ts` + `devActions.test.ts` → `npm test` green (TDD the logic first).
2. `DevPanel.tsx` — wire each lever to a Pressable; sections for Pet / Player / PRs / History / Reset.
   Use theme tokens (`colors`, `spacing`, `radius`, `textStyles`). Reset row uses
   `Alert.alert('Reset all data?', …)` confirm.
3. `dev.tsx` route + `_layout.tsx` `href:null` entry + `ROUTE_TITLES` entry + routeTitles test.
4. `profile.tsx` entry row (gated).
5. Browser-verify each lever (§5 table) via Chrome DevTools MCP a11y snapshots.
6. Gate: `tsc --noEmit`, `biome check . --diagnostic-level=error`, full `jest`, confirm the
   existing e2e specs are unaffected.

---

## 9. Gotchas

- **Add the `<Tabs.Screen name="dev" href:null>` entry** or dev shows as a visible tab in dev
  builds. `history` is the template.
- **Update `ROUTE_TITLES` + its test in the same commit** or `routeTitles.unit.test.ts` goes red.
- **Persist to the store's *own* `FULL_STATE` key** after every `setState` — keys: `PET`,
  `PLAYER`, `WORKOUT_HISTORY`. Miss this and a reload wipes the change.
- **`devSetStage` snaps `totalFPEarned`; `devSetHunger` backdates `lastFedAt`** — without these,
  the Den's derived selectors / the on-open decay clobber the lever.
- **Vacation mode isn't built** — don't add that lever; the hunger lever covers the same test need.
- **`__DEV__` global** is Metro-provided; if tsc flags it, add `declare const __DEV__: boolean;`
  once. Grep first to confirm the project doesn't already define it.

---

## 10. Exit Criteria

The feature is done when, in a single dev session without logging a real workout, you can:

- See Flux at stage 4 in the Den
- Buy stats and feed the pet (FP granted)
- Watch the streak multiplier + Spirit tier update at streak 7
- Open the history screen and see 5 populated sessions
- Trigger the PR flash path (seeded PRs + one set above)
- Reset to onboarding in one tap

All levers survive an app reload (AsyncStorage persistence), and `tsc` / `biome` / `jest` are clean.

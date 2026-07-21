# Custom Exercise Creation — End-to-End Build Spec

> **Status:** Ready to build · **Date:** 2026-07-11 · **Owner:** ironquest-engineer / Fable
> **Scope:** Phase 2 tracker-depth feature — let users create, edit, and delete their own exercises; those customs flow into personal templates and live sessions with correct FP.
> **Codebase verified 2026-07-11** (post-PR #50, dev-panel branch in tree).

---

## 1. Goal

Right now every exercise comes from the seeded `EXERCISE_DATABASE` (54 entries, a static `const` in `src/data/exercises.ts`). If a user's lift isn't in the DB, they can't log it — and the whole "your pet reflects *your* training" thesis breaks for anyone whose split isn't generic. This adds user-created exercises that:

- Are searchable and selectable inside the existing `ExercisePickerModal` (same surface, no new screen).
- Flow into personal templates via the existing `useTemplateStore.addExercise`.
- Produce a **valid `fpDistribution`** so the pet radar + typed-FP loop stay correct.
- Persist across reloads, are editable/deletable, and never corrupt history when deleted.

**One-line purpose:** type a name, pick a muscle group, get a real exercise you can program and log — without touching seed data.

---

## 2. Scope

### In scope
- Create / edit / delete custom exercises from inside the exercise picker.
- Auto-derive `fpDistribution` from the primary muscle group (reusing the engine's muscle→stat map).
- Unified id resolution so customs work everywhere an exerciseId is looked up (picker, template editor, session FP engine).
- AsyncStorage persistence + hydration + dev-panel reset.

### Out of scope (v1)
- **User-chosen FP stat override.** Auto-derive only. (Hook exists for an "advanced" picker later — see §6.)
- **Importing/sharing** custom exercises across devices (Phase 3 sync territory).
- **Custom cardio types.** Cardio is a separate path (`FP_CONFIG.cardio`); leave it.
- **Re-tagging seed exercises.** Seed DB is immutable.

---

## 3. Architecture

Three load-bearing decisions, all forced by existing patterns:

### 3.1 Customs live in a new store, not in `EXERCISE_DATABASE`

`EXERCISE_DATABASE` is a static `export const` — you can't push to it at runtime. So customs go in a new **`customExerciseStore`** (Zustand + AsyncStorage), mirroring the `templateStore` pattern (personal templates are the exact precedent: built-ins immutable, user copies in a separate persisted store). Same `source`-discriminator convention templates use (`isCustom`).

### 3.2 One resolver bridges both sources — `src/exercises/catalog.ts`

The picker, `templateStore.exerciseFromId`, and the session builder all resolve an `exerciseId` → definition. Today they call `getExerciseById` (seeded only). Instead of polluting `src/data/exercises.ts` with a store import (breaks the "data is pure functions" layering and risks a circular dep), introduce a thin bridge module:

- `findExerciseById(id)` — seeded first, then customs.
- `isCustomExercise(id)` — membership check for edit/delete affordance.
- `useExerciseCatalog()` — React hook returning `[...EXERCISE_DATABASE, ...customs]` for the picker.

Every id resolution in the app routes through `findExerciseById`. **This is the single merge point.**

### 3.3 `fpDistribution` is auto-derived, never empty

`fpDistribution` is load-bearing: `calculateDayFPDistribution` (templates.ts) reads it for every radar chart, and an empty/zero distribution silently breaks the pet-shape loop. So a custom exercise **must** get a valid distribution at create time. We derive it from the primary muscle using the engine's existing `MUSCLE_TO_FP_TYPE` map (currently unexported, in `calculator.ts:126`), following the same convention the seed DB uses:

- Compound → `{ primary: 0.8, secondary: 0.2 }`
- Isolation → `{ primary: 1.0 }`
- **Spirit is never produced** (streak-only Core Design Rule).

---

## 4. Files

| Action | File | Purpose |
|---|---|---|
| Modify | `src/engine/fp/calculator.ts` | Export `MUSCLE_TO_FP_TYPE` (add `glutes` + `forearms`); add + export `deriveFpDistribution`. |
| Modify | `src/data/exercises.ts` | Add + export `CustomExercise` interface (extends `ExerciseDefinition`). |
| Modify | `src/utils/storage.ts` | Add `CUSTOM_EXERCISES: { FULL_STATE: 'custom_exercises.full_state' }` to `STORAGE_KEYS`. |
| Create | `src/exercises/catalog.ts` | `findExerciseById`, `isCustomExercise`, `useExerciseCatalog` (the merge bridge). |
| Create | `src/stores/customExerciseStore.ts` | State + CRUD + hydrate + reset (mirrors `templateStore`). |
| Create | `src/components/workout/CreateCustomExerciseModal.tsx` | The create/edit form modal. |
| Modify | `src/components/workout/ExercisePickerModal.tsx` | Merge catalog into results; "+ New" button; long-press edit/delete on custom rows. |
| Modify | `src/stores/templateStore.ts` | `exerciseFromId` → use `findExerciseById` (so customs resolve in templates). |
| Modify | `app/_layout.tsx` | Hydrate `customExerciseStore` alongside the other stores. |
| Modify | `src/components/dev/devActions.ts` | `devResetAll` → also `useCustomExerciseStore.getState().reset()`. |
| Create | `src/exercises/__tests__/catalog.test.ts` | derive + resolver tests. |
| Create | `src/stores/__tests__/customExerciseStore.test.ts` | CRUD + persistence-shape tests. |

---

## 5. Data Model

`src/data/exercises.ts` (alongside `ExerciseDefinition`):

```ts
export interface CustomExercise extends ExerciseDefinition {
  createdAt: number;
  updatedAt: number;
}
```

- **Id scheme:** `custom__<slug>__<base36 ts>__<6-char rand>` — the `custom__` prefix guarantees no collision with seeded ids (all seeded are bare `snake_case`). Use the same `generateTemplateId` shape as `templateStore.ts:102`.
- **`movementPattern`:** metadata only (not read by the FP engine; only by `getExercisesByPattern`, which the picker doesn't use). Default `'isolation'`; not user-facing in v1.
- **`equipment`:** optional, defaults to `[]`.
- Discriminator for "is this editable/deletable?" = `isCustomExercise(id)` (store membership) — equivalently `id.startsWith('custom__')`.

---

## 6. The Create Flow

Entry: a **"+ New exercise"** button in `ExercisePickerModal` (header row, above the list). Tapping opens `CreateCustomExerciseModal`. On save → `addCustomExercise` → the new exercise appears in the picker list → user taps it to add it to the template (same `onSelect` path as any seeded exercise).

### Form fields (minimal — the 3-second spirit)

| Field | Required | Default | Notes |
|---|---|---|---|
| Name | ✅ | — | Free text; trim; non-empty. |
| Primary muscle | ✅ | — | Select from the 12 `MuscleGroup`. Drives FP. |
| Muscle groups | — | `[primaryMuscle]` | Multi-select; defaults to just the primary. `isCompound` defaults to `length > 1`. |
| Equipment | — | `[]` | Multi-select from `Equipment`. |
| Sets / Reps / Rest | — | `3` / `'8-12'` / `90` | Pre-filled; editable. Same shape as `DEFAULT_EXERCISE` (`templateStore.ts:107`). |

**`fpDistribution` is derived, not entered.** Show it read-only under the muscle picker once a primary muscle is chosen: e.g. *"Shapes pet: Power 80% · Focus 20%."* An "advanced" stat override is a documented later hook — do **not** build it in v1.

### Auto-derive logic (exact)

```ts
// src/engine/fp/calculator.ts — extend + export the existing map
export const MUSCLE_TO_FP_TYPE: Record<string, { primary: StatType; secondary: StatType }> = {
  chest:      { primary: 'power', secondary: 'focus' },
  shoulders:  { primary: 'power', secondary: 'focus' },
  back:       { primary: 'guard', secondary: 'focus' },
  traps:      { primary: 'guard', secondary: 'focus' },
  quads:      { primary: 'speed', secondary: 'vigor' },
  hamstrings: { primary: 'speed', secondary: 'vigor' },
  calves:     { primary: 'vigor', secondary: 'speed' },
  core:       { primary: 'vigor', secondary: 'speed' },
  biceps:     { primary: 'focus', secondary: 'power' },
  triceps:    { primary: 'focus', secondary: 'guard' },
  glutes:     { primary: 'vigor', secondary: 'speed' }, // NEW (was missing → typed-FP bug)
  forearms:   { primary: 'focus', secondary: 'power' }, // NEW (was missing → typed-FP bug)
};

export function deriveFpDistribution(
  primaryMuscle: MuscleGroup,
  isCompound: boolean,
): FPDistribution {
  const m = MUSCLE_TO_FP_TYPE[primaryMuscle];
  if (!m) return { focus: 1.0 }; // safe fallback — never spirit
  return isCompound
    ? { [m.primary]: 0.8, [m.secondary]: 0.2 }
    : { [m.primary]: 1.0 };
}
```

This mirrors the per-entry convention in `EXERCISE_DATABASE` (the C5 fix: primary mover ≥ 0.7, standardized at 0.8/0.2). **Extending the map also fixes a latent bug:** `calculateTypedFP` (calculator.ts:139) currently drops `glutes` and `forearms` sets entirely because they're unmapped — adding them is a correctness win for *every* user, not just customs.

---

## 7. Edit / Delete

- **Edit:** long-press a custom row in the picker → action sheet → `CreateCustomExerciseModal` in edit mode → `updateCustomExercise`. Re-derive `fpDistribution` if `primaryMuscle` or `isCompound` changed.
- **Delete:** same action sheet → confirm → `deleteCustomExercise`.
- **Seed rows:** no long-press affordance (immutable).

### Delete safety (important)

- **History is safe.** `WorkoutLog.exercises` snapshots the full exercise data at log time (muscle groups included — `devActions.devSeedHistory` builds these snapshots). Deleting a custom never rewrites a past session.
- **Templates degrade gracefully.** A `TemplateExercise` only stores `exerciseId`; if that custom is later deleted, `findExerciseById` returns `undefined`. The template editor must render a **"Deleted exercise — swap or remove"** row in that case (don't crash). Wire this in `app/workout/template-edit/[id].tsx` wherever it resolves exercises for display.

---

## 8. Paste-Ready Code

### 8.1 `src/stores/customExerciseStore.ts`

```ts
// User-created exercises. Mirrors templateStore: built-ins (EXERCISE_DATABASE)
// are immutable; customs live here, persisted to AsyncStorage. FP distribution
// is derived at create time via deriveFpDistribution (never empty, never spirit).

import { type CustomExercise, type Equipment, type MuscleGroup } from '@/data';
import { deriveFpDistribution } from '@/engine/fp/calculator';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { create } from 'zustand';

export interface CustomExerciseInput {
  name: string;
  primaryMuscle: MuscleGroup;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  isCompound: boolean;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
}

interface CustomExerciseState {
  exercises: CustomExercise[];
}
interface CustomExerciseActions {
  addCustomExercise: (input: CustomExerciseInput) => string; // returns new id
  updateCustomExercise: (id: string, patch: Partial<CustomExerciseInput>) => void;
  deleteCustomExercise: (id: string) => void;
  hydrate: () => Promise<void>;
  reset: () => void;
}
type CustomExerciseStore = CustomExerciseState & CustomExerciseActions;

const initialState: CustomExerciseState = { exercises: [] };

const persistState = async (state: CustomExerciseState) => {
  await appStorage.setJSON(STORAGE_KEYS.CUSTOM_EXERCISES.FULL_STATE, state);
};

const generateCustomId = (name: string): string => {
  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 24) ||
    'exercise';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `custom__${slug}__${Date.now().toString(36)}__${suffix}`;
};

const buildExercise = (input: CustomExerciseInput, now: number): CustomExercise => ({
  id: generateCustomId(input.name),
  name: input.name.trim(),
  muscleGroups: input.muscleGroups.length ? input.muscleGroups : [input.primaryMuscle],
  primaryMuscle: input.primaryMuscle,
  movementPattern: 'isolation',
  equipment: input.equipment,
  defaultSets: input.defaultSets,
  defaultReps: input.defaultReps,
  defaultRestSeconds: input.defaultRestSeconds,
  isCompound: input.isCompound,
  fpDistribution: deriveFpDistribution(input.primaryMuscle, input.isCompound),
  createdAt: now,
  updatedAt: now,
});

export const useCustomExerciseStore = create<CustomExerciseStore>((set) => ({
  ...initialState,

  addCustomExercise: (input) => {
    const exercise = buildExercise(input, Date.now());
    set((state) => {
      const nextState = { exercises: [...state.exercises, exercise] };
      persistState(nextState).catch(console.warn);
      return nextState;
    });
    return exercise.id;
  },

  updateCustomExercise: (id, patch) => {
    set((state) => {
      if (!state.exercises.some((e) => e.id === id)) return state;
      const now = Date.now();
      const exercises = state.exercises.map((e) => {
        if (e.id !== id) return e;
        const merged: CustomExercise = { ...e, ...patch, updatedAt: now };
        if (patch.primaryMuscle !== undefined || patch.isCompound !== undefined) {
          merged.fpDistribution = deriveFpDistribution(merged.primaryMuscle, merged.isCompound);
        }
        return merged;
      });
      const nextState = { exercises };
      persistState(nextState).catch(console.warn);
      return nextState;
    });
  },

  deleteCustomExercise: (id) => {
    set((state) => {
      const nextState = { exercises: state.exercises.filter((e) => e.id !== id) };
      persistState(nextState).catch(console.warn);
      return nextState;
    });
  },

  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<CustomExerciseState>(
        STORAGE_KEYS.CUSTOM_EXERCISES.FULL_STATE,
      );
      if (stored?.exercises) set({ exercises: stored.exercises });
    } catch (error) {
      console.warn('Failed to hydrate custom exercise store:', error);
    }
  },

  reset: () => set(initialState),
}));
```

### 8.2 `src/exercises/catalog.ts` (the merge bridge)

```ts
// Single merge point for seeded + custom exercises. Pure data stays pure:
// src/data/exercises.ts never imports a store — this module does.

import { EXERCISE_DATABASE, type ExerciseDefinition } from '@/data';
import { useCustomExerciseStore } from '@/stores/customExerciseStore';

/** Resolve an exercise id across built-ins first, then user customs. */
export function findExerciseById(id: string): ExerciseDefinition | undefined {
  return (
    EXERCISE_DATABASE.find((e) => e.id === id) ??
    useCustomExerciseStore.getState().exercises.find((e) => e.id === id)
  );
}

/** True only for a user-created (editable/deletable) exercise. */
export function isCustomExercise(id: string): boolean {
  return useCustomExerciseStore.getState().exercises.some((e) => e.id === id);
}

/** React hook: the full catalog (seeded + customs), reactive to custom changes. */
export function useExerciseCatalog(): ExerciseDefinition[] {
  const customs = useCustomExerciseStore((s) => s.exercises);
  // seeded first, customs appended; stable order for the picker.
  return [...EXERCISE_DATABASE, ...customs];
}
```

### 8.3 `templateStore.ts` — one-line resolution change

```ts
// was: const def = getExerciseById(exerciseId);
import { findExerciseById } from '@/exercises/catalog';
const exerciseFromId = (exerciseId: string): TemplateExercise => {
  const def = findExerciseById(exerciseId);
  if (!def) return { ...DEFAULT_EXERCISE, exerciseId };
  return { exerciseId, sets: def.defaultSets, reps: def.defaultReps, restSeconds: def.defaultRestSeconds };
};
```

### 8.4 `ExercisePickerModal.tsx` — integration sketch

```tsx
// replace: const results = searchExercises(query.trim()).filter(...);
import { useExerciseCatalog } from '@/exercises/catalog';
import { isCustomExercise } from '@/exercises/catalog';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';

const catalog = useExerciseCatalog();
const [creating, setCreating] = useState(false);

const q = query.trim().toLowerCase();
const results = catalog
  .filter((e) => !excludeSet.has(e.id))
  .filter((e) =>
    !q ? true : e.name.toLowerCase().includes(q) || e.muscleGroups.some((m) => m.includes(q)),
  );

// Above the list:
<Pressable style={styles.newButton} onPress={() => setCreating(true)}>
  <Text style={styles.newButtonText}>+ New exercise</Text>
</Pressable>

// Row: long-press → if isCustomExercise(exercise.id) → action sheet (Edit / Delete).
// After CreateCustomExerciseModal onSave → useExerciseCatalog re-renders with the new entry.
<CreateCustomExerciseModal visible={creating} onClose={() => setCreating(false)} />
```

(`searchExercises` stays in `src/data` for any non-store caller; the picker just stops using it in favor of the reactive catalog + a local filter predicate. Extract the predicate into a shared `matchExercise(query)` helper if more callers need it.)

---

## 9. Tests

Keep to ~5, matching project discipline (343 tests, biome clean):

1. **`deriveFpDistribution`** — compound chest → `{power:0.8, focus:0.2}`; isolation biceps → `{focus:1.0}`; glutes → vigor primary; **assert no result ever contains `spirit`**.
2. **`MUSCLE_TO_FP_TYPE` completeness** — every `MuscleGroup` has an entry (guards the glutes/forearms regression).
3. **`addCustomExercise`** — after add: store contains it, `id` starts with `custom__`, `fpDistribution` is non-empty, and `findExerciseById(newId)` resolves it.
4. **`findExerciseById` precedence** — resolves a seeded id to the seeded def, a custom id to the custom def, and an unknown id to `undefined`.
5. **`templateStore.addExercise` with a custom id** — appends a `TemplateExercise` whose sets/reps/rest come from the *custom's* defaults (integration: customs flow into templates).
6. **Delete isolation** — after `deleteCustomExercise(id)`, `findExerciseById(id)` is `undefined`; a pre-existing `WorkoutLog` snapshot is unchanged.

Reset all stores in `beforeEach`. Mock `appStorage` per the existing store-test harness.

---

## 10. Build Order

1. `calculator.ts`: export + extend `MUSCLE_TO_FP_TYPE`, add `deriveFpDistribution` → `npm test` (adds the latent-glutes/forearms fix; verify no existing test breaks).
2. `data/exercises.ts`: add `CustomExercise`. `storage.ts`: add `CUSTOM_EXERCISES` key.
3. `customExerciseStore.ts` + `__tests__/customExerciseStore.test.ts` → green.
4. `catalog.ts` + `__tests__/catalog.test.ts` → green.
5. Wire `templateStore.exerciseFromId` → `findExerciseById`. Hydrate in `app/_layout.tsx`. Add reset to `devActions.devResetAll`.
6. `CreateCustomExerciseModal.tsx`; integrate into `ExercisePickerModal.tsx` (+ New, long-press edit/delete, "deleted exercise" row in template editor).
7. Browser-verify end-to-end via the dev panel (seed a custom shoulder exercise → add to a personal template → run a session logging it → summary shows Power FP; reload → custom persists).
8. Gate: `tsc --noEmit`, `biome check . --diagnostic-level=error`, full `jest`, golden-path e2e unaffected.

---

## 11. Gotchas

- **Every exerciseId resolution must route through `findExerciseById`.** Run `grep -rn "getExerciseById" src/ app/` at build time and convert call sites that need customs (the session-builder that feeds `calculateTypedFP` is load-bearing — a custom in a session must resolve `muscleGroups`, or its FP vanishes). Pure-listing callers (e.g. `getExercisesByMuscle`) can stay seeded-only if they're not on the user's custom path.
- **`fpDistribution` must never be empty** — `templates.ts` divides by it for the radar. `deriveFpDistribution` always returns at least `{focus:1.0}`.
- **Don't import a store into `src/data/exercises.ts`** — that breaks the "data is pure" layering and risks a circular dep. The bridge is `catalog.ts`, which lives outside `src/data/`.
- **`MUSCLE_TO_FP_TYPE` extension is also an engine bugfix** — adding `glutes`/`forearms` changes typed-FP output for *existing* seed exercises that hit those muscles (deadlift/RDL hit glutes; hammer curl hits forearms). Expect the `fpSystem.unit.test.ts` and `templateFpDistribution.test.ts` snapshots to shift slightly — update them, don't suppress.
- **Id prefix `custom__`** is the collision guard; never generate a custom id without it.
- **Deleted-custom rendering** — the template editor must handle `findExerciseById === undefined` (show "Deleted — swap or remove"), or deleting a custom that's in a template crashes the editor.

---

## 12. Exit Criteria

The feature is done when, from the template editor, you can:

- Tap "+ New exercise", name it "Cable Lateral Raise", pick shoulders, save → it appears in the picker.
- Add it to a day, run a session logging 3×12, and see **Power FP accrue** in the summary + the pet radar move.
- Edit it (rename, change muscle) → new sessions use the new defaults; `fpDistribution` re-derives.
- Delete it → history still shows the logged session intact; the template shows a "Deleted — swap or remove" row instead of crashing.
- Reload the app → the custom is still there (AsyncStorage).

`tsc` / `biome` / `jest` clean; the existing golden-path e2e still passes.

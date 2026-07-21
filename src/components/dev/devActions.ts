// =============================================================================
// IronQuest Dev Panel Actions — DEV-ONLY state seeding/mutation
// =============================================================================
// Never imported outside __DEV__ surfaces. Reuses existing store actions where
// they exist (setFP, recordPR, reset); otherwise setState + persist to the
// store's own FULL_STATE key — the identical pattern each store's private
// persist helper uses internally. No new production store API.

import { FP_CONFIG } from '@/config/fp-values';
import { getExerciseById } from '@/data';
import type { Exercise, FPBalances, PetStats, PetType, WeightUnit, WorkoutLog } from '@/types';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';

import { useBaselineStore } from '@/stores/baselineStore';
import { type EvolutionStage, usePetStore } from '@/stores/petStore';
import { usePlayerStore } from '@/stores/playerStore';
import { usePRStore } from '@/stores/prStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useWeightHistoryStore } from '@/stores/weightHistoryStore';
import { useWorkoutHistoryStore } from '@/stores/workoutHistoryStore';
import { useWorkoutStore } from '@/stores/workoutStore';

const persistPet = () =>
  appStorage.setJSON(STORAGE_KEYS.PET.FULL_STATE, usePetStore.getState()).catch(console.warn);
const persistPlayer = () =>
  appStorage.setJSON(STORAGE_KEYS.PLAYER.FULL_STATE, usePlayerStore.getState()).catch(console.warn);

// FP_CONFIG.evolution.thresholds is [stage1, stage2, stage3, stage4] entry
// FP — stage N's threshold lives at index N-1 (petStore destructures it the
// same way).
const STAGE_THRESHOLDS = FP_CONFIG.evolution.thresholds;

// -----------------------------------------------------------------------------
// Pet
// -----------------------------------------------------------------------------

export function devSetPetType(type: PetType) {
  usePetStore.setState({ type });
  persistPet();
}

/**
 * Sets the explicit stage AND snaps totalFPEarned to that stage's threshold.
 * PetSprite dispatches on evolutionStage, but addFP / the Den's progress and
 * canEvolve selectors read totalFPEarned — snapping keeps all three consistent
 * so a later real workout doesn't behave weirdly.
 */
export function devSetStage(stage: EvolutionStage) {
  usePetStore.setState({
    evolutionStage: stage,
    totalFPEarned: STAGE_THRESHOLDS[stage - 1],
  });
  persistPet();
}

export const STAT_PRESETS = {
  empty: { power: 0, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 },
  balanced: { power: 15, guard: 15, speed: 15, vigor: 15, focus: 15, spirit: 15 },
  power: { power: 40, guard: 15, speed: 5, vigor: 10, focus: 5, spirit: 5 },
  speed: { power: 5, guard: 5, speed: 40, vigor: 15, focus: 10, spirit: 5 },
} as const satisfies Record<string, PetStats>;

export type StatPresetName = keyof typeof STAT_PRESETS;

export function devSetStats(stats: PetStats) {
  usePetStore.setState({ stats: { ...stats } });
  persistPet();
}

/**
 * Sets hunger with lastFedAt = now. The spec suggested backdating lastFedAt,
 * but calculateHungerDecay subtracts the FULL elapsed-since-fed decay from the
 * *current* hunger value — backdating 17h for hunger 15 would zero it on the
 * next decay pass. lastFedAt = now keeps the lever stable either way (decay
 * amount is 0 immediately after setting).
 */
export function devSetHunger(hunger: number) {
  usePetStore.setState({ hunger, lastFedAt: new Date().toISOString() });
  persistPet();
}

// -----------------------------------------------------------------------------
// Player
// -----------------------------------------------------------------------------

const uniformFP = (amount: number): FPBalances => ({
  generic: amount,
  power: amount,
  guard: amount,
  speed: amount,
  vigor: amount,
  focus: amount,
  spirit: amount,
});

export const FP_PRESETS = {
  zero: uniformFP(0),
  '1k': uniformFP(1000),
  '10k': uniformFP(10000),
} as const satisfies Record<string, FPBalances>;

export type FPPresetName = keyof typeof FP_PRESETS;

export function devSetFP(fp: FPBalances) {
  usePlayerStore.getState().setFP({ ...fp }); // existing action persists
}

export function devSetStreak(current: number) {
  const lastWorkoutDate = current > 0 ? new Date().toISOString().split('T')[0] : null;
  usePlayerStore.setState({
    streak: { current, longest: current, lastWorkoutDate },
  });
  persistPlayer();
}

// -----------------------------------------------------------------------------
// PRs
// -----------------------------------------------------------------------------

// recordPR builds the ExercisePR shape correctly and updates totalPRCount —
// records are keyed `${exerciseId}::${unit}`, so pass the unit being tested.
const PR_SEEDS: Array<{ exerciseId: string; lb: number; kg: number; reps: number }> = [
  { exerciseId: 'barbell_bench_press', lb: 225, kg: 100, reps: 5 },
  { exerciseId: 'back_squat', lb: 315, kg: 140, reps: 5 },
  { exerciseId: 'deadlift', lb: 405, kg: 180, reps: 5 },
  { exerciseId: 'overhead_press', lb: 135, kg: 60, reps: 5 },
  { exerciseId: 'barbell_row', lb: 185, kg: 85, reps: 8 },
];

export function devSeedPRs(unit: WeightUnit) {
  const record = usePRStore.getState().recordPR;
  for (const seed of PR_SEEDS) {
    record(seed.exerciseId, unit === 'lb' ? seed.lb : seed.kg, seed.reps, unit);
  }
}

// -----------------------------------------------------------------------------
// Workout history
// -----------------------------------------------------------------------------

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

/**
 * Seeds 5 pre-claimed logs. `createLog` can't be reused — it writes unclaimed
 * logs with null FP, and the history screen renders claimed FP totals.
 */
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
  appStorage.setJSON(STORAGE_KEYS.WORKOUT_HISTORY.FULL_STATE, { logs }).catch(console.warn);
}

// -----------------------------------------------------------------------------
// Reset
// -----------------------------------------------------------------------------

/**
 * Full reset to fresh-install state. Each store's reset()/clearAll() deletes
 * its own AsyncStorage key, so no manual key cleanup is needed. With the pet
 * uninitialized (id === ''), app/index.tsx redirects to onboarding.
 */
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

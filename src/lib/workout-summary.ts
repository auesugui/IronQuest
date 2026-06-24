// =============================================================================
// IronQuest Workout Summary Adapter
// =============================================================================
// Thin wrapper over the FP engine (`calculateSessionFP`) that produces the
// shape the summary UI renders. The UI must not re-implement FP math —
// engines are the source of truth, this adapter only maps fields.

import { calculateSessionFP } from '@/engine/fp';
import type { Exercise, FPBalances, SessionIntent, WorkoutSession } from '@/types';

export interface WorkoutSummary {
  totalFP: number;
  breakdown: {
    base: number;
    volumeBonus: number;
    prBonus: number;
    streakMultiplier: number;
  };
  typedFP: Partial<FPBalances>;
  exercises: Exercise[];
  duration: number;
  totalReps: number;
  totalSets: number;
}

export function calculateWorkoutSummary(
  exercises: Exercise[],
  duration: number,
  streakDays: number,
  intent: SessionIntent,
  baselines?: Record<string, number>
): WorkoutSummary {
  const session: WorkoutSession = {
    active: false,
    templateId: null,
    startedAt: null,
    currentExerciseIndex: 0,
    exercises,
    intent,
    gymRushActive: false,
  };

  // Engine takes PR counts as input; the summary's set flags carry PR detection.
  let weightPRs = 0;
  let repPRs = 0;
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.isPR) weightPRs++;
      if (s.isRepPR) repPRs++;
    }
  }

  const result = calculateSessionFP(
    session,
    streakDays,
    { weight: weightPRs, rep: repPRs },
    baselines
  );

  // Display-only aggregates the engine doesn't return.
  const loggedSets = exercises.flatMap((e) => e.sets.filter((s) => s.logged));
  const totalReps = loggedSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
  const totalSets = loggedSets.length;

  return {
    totalFP: result.total,
    breakdown: {
      base: result.breakdown.base,
      volumeBonus: result.breakdown.volume,
      prBonus: result.breakdown.pr,
      streakMultiplier: result.streakMultiplier,
    },
    typedFP: result.typed,
    exercises,
    duration,
    totalReps,
    totalSets,
  };
}

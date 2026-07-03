// =============================================================================
// IronQuest Workout Summary Adapter
// =============================================================================
// Thin wrapper over the FP engine (`calculateSessionFP` + `calculateSpiritFP`)
// that produces the shape the summary UI renders. The UI must not re-implement
// FP math — engines are the source of truth, this adapter only maps fields.

import { calculateSessionFP, calculateSpiritFP } from '@/engine/fp';
import type { Exercise, FPBalances, SessionIntent, WorkoutSession } from '@/types';

export interface WorkoutSummary {
  totalFP: number;
  breakdown: {
    base: number;
    volumeBonus: number;
    prBonus: number;
    streakMultiplier: number;
  };
  typedFP: FPBalances;
  /**
   * Spirit FP earned from the streak (streak-exclusive source). Reported
   * separately from totalFP because Spirit is a distinct balance that does
   * NOT feed pet evolution — only the Spirit stat is upgraded with it.
   * Folded into typedFP.spirit so the existing addMultipleFP path awards it.
   */
  spiritFP: number;
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

  // Spirit FP is the streak-exclusive economy. The engine's typed distributor
  // deliberately leaves Spirit at 0 ("Spirit only from streaks"), so the streak
  // contribution is layered on here from its own engine function. This is the
  // only path that ever populates typedFP.spirit — wiring it is what un-deads
  // the Spirit stat (issue #16 / audit C2).
  const spiritFP = calculateSpiritFP(streakDays);
  const typedFP: FPBalances = { ...result.typed, spirit: spiritFP };

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
    typedFP,
    spiritFP,
    exercises,
    duration,
    totalReps,
    totalSets,
  };
}

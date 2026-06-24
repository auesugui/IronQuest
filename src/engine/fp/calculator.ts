// =============================================================================
// IronQuest FP Calculation Engine
// =============================================================================

import { FP_CONFIG, getStreakMultiplier } from '@/config/fp-values';
import type { FPBalances, StatType, WorkoutSession } from '@/types';

// -----------------------------------------------------------------------------
// FP Calculation Result
// -----------------------------------------------------------------------------

export interface FPCalculationResult {
  total: number;
  breakdown: {
    base: number;
    volume: number;
    pr: number;
    streak: number;
    modifiers: number;
  };
  typed: FPBalances;
  streakMultiplier: number;
}

// -----------------------------------------------------------------------------
// Main FP Calculator
// -----------------------------------------------------------------------------

export function calculateSessionFP(
  session: WorkoutSession,
  streakDays: number,
  prs: { weight: number; rep: number }
): FPCalculationResult {
  const { base, volume, pr, streak, modifiers } = FP_CONFIG;

  // Deload: flat per workout. Spec: no volume, no PR, no streak scaling.
  if (session.intent === 'deload') {
    const flat = base.deload;
    return {
      total: flat,
      breakdown: {
        base: flat,
        volume: 0,
        pr: 0,
        streak: 1.0,
        modifiers: 0,
      },
      typed: {
        generic: flat,
        power: 0,
        guard: 0,
        speed: 0,
        vigor: 0,
        focus: 0,
        spirit: 0,
      },
      streakMultiplier: 1.0,
    };
  }

  // Base FP (normal path — deload handled above)
  const baseFP = base.completion;

  // Volume bonus (1 FP per 10 reps, capped at 50 per set)
  const totalReps = session.exercises
    .flatMap((e) => e.sets.filter((s) => s.logged))
    .reduce((sum, s) => {
      const cappedReps = Math.min(s.reps || 0, volume.repCeiling);
      return sum + cappedReps;
    }, 0);
  const volumeFP = Math.floor(totalReps / volume.divisor);

  // PR bonuses
  const prFP = prs.weight * pr.weight + prs.rep * pr.rep;

  // Modifier bonuses (would be calculated based on session.intent)
  let modifierFP = 0;
  if (session.intent === 'tempo') modifierFP = modifiers.slowTempo;
  if (session.intent === 'pause') modifierFP = modifiers.pauseReps;

  // Streak multiplier
  const streakMultiplier = getStreakMultiplier(streakDays);

  // Calculate subtotal and apply multiplier
  const subtotal = baseFP + volumeFP + prFP + modifierFP;
  const total = Math.floor(subtotal * streakMultiplier);

  // Calculate typed FP distribution
  const typedFP = calculateTypedFP(session, total);

  return {
    total,
    breakdown: {
      base: baseFP,
      volume: volumeFP,
      pr: prFP,
      streak: streakMultiplier,
      modifiers: modifierFP,
    },
    typed: typedFP,
    streakMultiplier,
  };
}

// -----------------------------------------------------------------------------
// Typed FP Distribution
// -----------------------------------------------------------------------------

const MUSCLE_TO_FP_TYPE: Record<string, { primary: StatType; secondary: StatType }> = {
  chest: { primary: 'power', secondary: 'focus' },
  shoulders: { primary: 'power', secondary: 'focus' },
  back: { primary: 'guard', secondary: 'focus' },
  traps: { primary: 'guard', secondary: 'focus' },
  quads: { primary: 'speed', secondary: 'vigor' },
  hamstrings: { primary: 'speed', secondary: 'vigor' },
  calves: { primary: 'vigor', secondary: 'speed' },
  core: { primary: 'vigor', secondary: 'speed' },
  biceps: { primary: 'focus', secondary: 'power' },
  triceps: { primary: 'focus', secondary: 'guard' },
};

function calculateTypedFP(session: WorkoutSession, totalGenericFP: number): FPBalances {
  const typed: FPBalances = {
    generic: totalGenericFP,
    power: 0,
    guard: 0,
    speed: 0,
    vigor: 0,
    focus: 0,
    spirit: 0, // Spirit only from streaks
  };

  // Count sets per muscle group
  const muscleGroupSets: Record<string, number> = {};

  for (const exercise of session.exercises) {
    const loggedSets = exercise.sets.filter((s) => s.logged).length;
    for (const muscle of exercise.muscleGroups) {
      muscleGroupSets[muscle] = (muscleGroupSets[muscle] || 0) + loggedSets;
    }
  }

  // Calculate total sets for normalization
  const totalSets = Object.values(muscleGroupSets).reduce((sum, v) => sum + v, 0);
  if (totalSets === 0) return typed;

  // Distribute FP to types based on muscle groups
  for (const [muscle, sets] of Object.entries(muscleGroupSets)) {
    const mapping = MUSCLE_TO_FP_TYPE[muscle.toLowerCase()];
    if (!mapping) continue;

    const ratio = sets / totalSets;
    const fpForMuscle = Math.floor(totalGenericFP * ratio * 0.5); // 50% goes to typed

    typed[mapping.primary] += Math.floor(fpForMuscle * 0.7); // 70% to primary
    typed[mapping.secondary] += Math.floor(fpForMuscle * 0.3); // 30% to secondary
  }

  return typed;
}

// -----------------------------------------------------------------------------
// Spirit FP Calculation (Streak Only)
// -----------------------------------------------------------------------------

export function calculateSpiritFP(streakDays: number): number {
  const { dailySpirit, milestones } = FP_CONFIG.streak;

  let total = streakDays * dailySpirit;

  // Add milestone bonuses
  for (const [days, bonus] of Object.entries(milestones)) {
    if (streakDays >= Number.parseInt(days)) {
      total += bonus;
    }
  }

  return total;
}

// -----------------------------------------------------------------------------
// EvoXP Calculation
// -----------------------------------------------------------------------------

export function calculateEvoXP(fpEarned: number): number {
  const { baseEvoXP, evoXPPerFP } = FP_CONFIG.evolution;
  return baseEvoXP + Math.floor(fpEarned / evoXPPerFP);
}

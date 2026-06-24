// =============================================================================
// IronQuest FP Configuration - Single Source of Truth
// =============================================================================
// All FP values MUST be defined here. No magic numbers in game logic.
// This enables rapid tuning without code changes and easy export for docs.

export const FP_CONFIG = {
  // Base FP earned per workout
  base: {
    completion: 100, // Flat per workout
    deload: 80, // Flat for deload sessions
    shortSession: 50, // Sessions < 15 minutes
  },

  // Volume-based FP
  volume: {
    divisor: 10, // 1 FP per 10 reps
    repCeiling: 50, // Max reps counted per set
    maxBonusPerSession: 50, // Cap on relative volume bonus
  },

  // Personal Record bonuses
  pr: {
    weight: 50, // New weight PR
    rep: 25, // New rep PR at same weight
  },

  // Streak system
  streak: {
    multiplierBase: 1.0,
    multiplierPerDay: 0.1,
    multiplierMax: 2.0,

    // Spirit FP from streaks (EXCLUSIVE source of Spirit)
    dailySpirit: 5, // Per consecutive day
    milestones: {
      7: 15, // 7-day milestone
      14: 30, // 14-day milestone
      30: 50, // 30-day milestone
    } as Record<number, number>,
    weeklyCompletion: 10, // All scheduled workouts done
    monthlyConsistency: 25, // 90%+ scheduled workouts
  },

  // Training variable modifiers
  modifiers: {
    slowTempo: 15, // 3-4s eccentric
    pauseReps: 15, // 1-3s hold
    dropSet: 20, // Reduce weight mid-set
    restPause: 10, // 10-15s rest then continue
    reducedRest: 10, // 25%+ shorter rest
    singleLimb: 15, // Unilateral variation
    gymRush: 10, // Per exercise in Gym Rush mode
  },

  // Stat costs (FP per point)
  stat: {
    tier1: 5, // Stats 1-10
    tier2: 8, // Stats 11-25
    tier3: 12, // Stats 26-50
    spirit: 10, // Spirit always costs 10
  },

  // Stat cost tier boundaries
  statTiers: {
    tier1Max: 10,
    tier2Max: 25,
    tier3Max: 50,
  },

  // Evolution system
  evolution: {
    baseEvoXP: 10, // Per workout
    evoXPPerFP: 50, // 1 EvoXP per 50 FP earned
    thresholds: [0, 500, 2000, 5000], // Shard, Form, Prime, Apex
    abilitySlots: [1, 2, 3, 4], // Per evolution stage
  },

  // Battle system
  battle: {
    typeAdvantage: 1.3, // 30% bonus
    typeDisadvantage: 0.8, // 20% penalty
    baseCritChance: 0.05, // 5%
    critPerFocus: 0.005, // 0.5% per focus
    critMultiplier: 1.5, // 50% extra damage
    baseAccuracy: 0.95, // 95%
    accuracyPerFocus: 0.002, // 0.2% per focus
    baseHP: 100,
    hpPerVigor: 10,
    minDamage: 1,
  },

  // Tower system
  tower: {
    maxAttempts: 7,
    attemptsPerWorkout: 1,
    bossFloorInterval: 10,
    bossStatMultiplier: 1.2,
    floorTiers: {
      tutorial: { min: 1, max: 10, powerRange: [0.5, 0.7] },
      normal: { min: 11, max: 30, powerRange: [0.7, 0.9] },
      challenge: { min: 31, max: 50, powerRange: [0.9, 1.1] },
      endless: { min: 51, max: Number.POSITIVE_INFINITY, powerRange: [1.1, 1.5] },
    },
  },

  // Cardio FP rates
  cardio: {
    liss: {
      ratePerMinute: 2,
      minDuration: 20,
      maxDuration: 60,
      completionBonus: 20,
      primaryFP: 'vigor' as const,
      secondaryFP: 'focus' as const,
    },
    hiit: {
      ratePerMinute: 4,
      minDuration: 10,
      maxDuration: 30,
      completionBonus: 30,
      primaryFP: 'speed' as const,
      secondaryFP: 'vigor' as const,
    },
    hybrid: {
      ratePerMinute: 3,
      minDuration: 15,
      maxDuration: 45,
      completionBonus: 25,
      primaryFP: 'speed' as const,
      secondaryFP: 'power' as const,
    },
    sport: {
      ratePerMinute: 1.5,
      minDuration: 20,
      maxDuration: 90,
      completionBonus: 15,
      primaryFP: 'vigor' as const,
      secondaryFP: 'speed' as const,
    },
  },

  // Pet care
  pet: {
    hungerDecayBase: 0.05, // Per day
    hungerDecayPerStage: 0.0125, // Additional per evolution stage
    moodDecayRate: 0.02, // Per day without interaction
    feedingTiers: {
      1: { hungerRestore: 0.25, moodBoost: 0.05, cost: 10 },
      2: { hungerRestore: 0.5, moodBoost: 0.1, cost: 25 },
      3: { hungerRestore: 0.75, moodBoost: 0.15, cost: 50 },
      4: { hungerRestore: 1.0, moodBoost: 0.25, cost: 100 },
    },
  },

  // Anti-gaming guards
  guards: {
    repCeiling: 50, // No volume FP beyond this per set
    sessionFloorMinutes: 15, // Sessions under this get reduced FP
    shortSessionMultiplier: 0.5, // 50% base FP for short sessions
    rapidPRThreshold: 1.4, // 40% weight jump triggers review
    baselineAdjustmentSessions: 3, // Sessions before baseline is set
  },
} as const;

// Type exports for config values
export type FPConfig = typeof FP_CONFIG;

// Helper function to get stat cost
export function getStatCost(currentStat: number, isSpirit: boolean): number {
  if (isSpirit) return FP_CONFIG.stat.spirit;
  if (currentStat < FP_CONFIG.statTiers.tier1Max) return FP_CONFIG.stat.tier1;
  if (currentStat < FP_CONFIG.statTiers.tier2Max) return FP_CONFIG.stat.tier2;
  return FP_CONFIG.stat.tier3;
}

// Helper function to get total cost for stat increase
export function getTotalStatCost(fromStat: number, toStat: number, isSpirit: boolean): number {
  let total = 0;
  for (let i = fromStat; i < toStat; i++) {
    total += getStatCost(i, isSpirit);
  }
  return total;
}

// Helper function to get streak multiplier
export function getStreakMultiplier(streakDays: number): number {
  const multiplier =
    FP_CONFIG.streak.multiplierBase + FP_CONFIG.streak.multiplierPerDay * streakDays;
  return Math.min(multiplier, FP_CONFIG.streak.multiplierMax);
}

// Helper function to get evolution stage from EvoXP
export function getEvolutionStage(evoXP: number): 1 | 2 | 3 | 4 {
  const thresholds = FP_CONFIG.evolution.thresholds;
  if (evoXP >= thresholds[3]) return 4;
  if (evoXP >= thresholds[2]) return 3;
  if (evoXP >= thresholds[1]) return 2;
  return 1;
}

// Helper function to get next evolution threshold
export function getNextEvolutionThreshold(evoXP: number): number | null {
  const thresholds = FP_CONFIG.evolution.thresholds;
  for (const threshold of thresholds) {
    if (threshold > evoXP) return threshold;
  }
  return null; // Max evolution reached
}

// Helper function to get ability slots for stage
export function getAbilitySlots(stage: 1 | 2 | 3 | 4): number {
  return FP_CONFIG.evolution.abilitySlots[stage - 1];
}

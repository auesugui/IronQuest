// =============================================================================
// IronQuest PRD-Aligned Test Suite
// =============================================================================
// This file contains all tests aligned with the PRD specifications.
// Organized by Phase 1 priorities (P0 first, then P1).
//
// Run with: node verify-prd-specs.js
// =============================================================================

// =============================================================================
// Types (JSDoc for documentation)
// =============================================================================

/**
 * @typedef {'power' | 'guard' | 'speed' | 'vigor' | 'focus' | 'spirit'} StatType
 * @typedef {'generic' | 'power' | 'guard' | 'speed' | 'vigor' | 'focus' | 'spirit'} FPType
 * @typedef {Object} FPBalances
 * @property {number} generic
 * @property {number} power
 * @property {number} guard
 * @property {number} speed
 * @property {number} vigor
 * @property {number} focus
 * @property {number} spirit
 * @typedef {Object} PetStats
 * @property {number} power
 * @property {number} guard
 * @property {number} speed
 * @property {number} vigor
 * @property {number} focus
 * @property {number} spirit
 * @typedef {Object} WorkoutSet
 * @property {number} reps
 * @property {number} [weight]
 * @property {boolean} [isPR]
 * @property {boolean} [isRepPR]
 * @property {boolean} logged
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} name
 * @property {string[]} muscleGroups
 * @property {WorkoutSet[]} sets
 */

// =============================================================================
// Test Framework
// =============================================================================

let passed = 0;
let failed = 0;
const failures = [];
const currentSuite = { name: '' };

function describe(name, fn) {
  currentSuite.name = name;
  console.log(`\n📋 ${name}`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    failures.push({ suite: currentSuite.name, name, error: e.message });
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${e.message}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (!(actual <= expected)) {
        throw new Error(`Expected ${actual} to be <= ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined, got ${actual}`);
      }
    },
    toBeInRange(min, max) {
      if (actual < min || actual > max) {
        throw new Error(`Expected ${actual} to be in range [${min}, ${max}]`);
      }
    },
  };
}

// =============================================================================
// P0: FP Calculation Engine (PRD §3.2)
// =============================================================================

/**
 * Calculate FP from workout session
 * @param {Object} params
 * @param {number} params.baseFP - Base completion FP (100)
 * @param {number} params.totalReps - Total reps logged
 * @param {number} params.prCount - Number of PRs
 * @param {number} params.repPRCount - Number of rep PRs
 * @param {number} params.streakDays - Current streak in days
 * @returns {{ totalFP: number, breakdown: Object }}
 */
function calculateWorkoutFP({
  baseFP = 100,
  totalReps,
  prCount = 0,
  repPRCount = 0,
  streakDays = 0,
}) {
  // Volume bonus: 1 FP per 10 reps
  const volumeBonus = Math.floor(totalReps / 10);

  // PR bonus: 50 FP per PR, 25 FP per rep PR
  const prBonus = prCount * 50 + repPRCount * 25;

  // Streak multiplier: 1.0x + 0.1x/day, max 2.0x
  const streakMultiplier = Math.min(1.0 + 0.1 * streakDays, 2.0);

  // Subtotal before multiplier
  const subTotal = baseFP + volumeBonus + prBonus;

  // Total with multiplier
  const totalFP = Math.floor(subTotal * streakMultiplier);

  return {
    totalFP,
    breakdown: {
      base: baseFP,
      volumeBonus,
      prBonus,
      streakMultiplier,
    },
  };
}

/**
 * Calculate cardio FP
 * @param {Object} params
 * @param {'LISS'|'HISS'|'Hybrid'|'Sport'} params.type
 * @param {number} params.durationMinutes
 * @param {number} params.streakDays
 */
function calculateCardioFP({ type, durationMinutes, streakDays = 0 }) {
  const rates = {
    LISS: { rate: 2, min: 20, cap: 60, bonus: 20 },
    HIIT: { rate: 4, min: 10, cap: 30, bonus: 30 },
    Hybrid: { rate: 3, min: 15, cap: 45, bonus: 25 },
    Sport: { rate: 1.5, min: 20, cap: 90, bonus: 15 },
  };

  const config = rates[type];
  if (!config) return { totalFP: 0, error: 'Invalid cardio type' };

  // Clamp duration to valid range
  const validDuration = Math.max(config.min, Math.min(durationMinutes, config.cap));

  // Calculate FP
  const baseFP = validDuration * config.rate;
  const completionBonus = durationMinutes >= config.min ? config.bonus : 0;

  // Streak multiplier
  const streakMultiplier = Math.min(1.0 + 0.1 * streakDays, 2.0);

  const subTotal = baseFP + completionBonus;
  const totalFP = Math.floor(subTotal * streakMultiplier);

  return {
    totalFP,
    breakdown: {
      duration: validDuration,
      baseFP,
      completionBonus,
      streakMultiplier,
    },
  };
}

// =============================================================================
// P0: Muscle Group → FP Type Mapping (Exercise Database §6)
// =============================================================================

const MUSCLE_TO_FP_TYPE = {
  // Push muscles → Power + Focus
  chest: { primary: ['power'], secondary: ['focus'] },
  shoulders: { primary: ['power'], secondary: ['focus'] },
  triceps: { primary: ['focus'], secondary: [] },
  // Pull muscles → Guard + Focus
  back: { primary: ['guard'], secondary: ['focus'] },
  traps: { primary: ['guard'], secondary: [] },
  lats: { primary: ['guard'], secondary: ['focus'] },
  biceps: { primary: ['focus'], secondary: [] },
  // Leg muscles → Speed + Vigor
  quads: { primary: ['speed'], secondary: ['vigor'] },
  hamstrings: { primary: ['speed'], secondary: ['vigor'] },
  glutes: { primary: ['speed'], secondary: ['vigor'] },
  calves: { primary: ['vigor'], secondary: [] },
  // Core → Vigor
  core: { primary: ['vigor'], secondary: [] },
  abs: { primary: ['vigor'], secondary: [] },
};

/**
 * Calculate typed FP distribution from workout
 * @param {number} totalFP
 * @param {string[]} muscleGroups
 * @returns {Partial<FPBalances>}
 */
function calculateTypedFPDistribution(totalFP, muscleGroups) {
  const typeWeights = { power: 0, guard: 0, speed: 0, vigor: 0, focus: 0 };

  for (const muscle of muscleGroups) {
    const mapping = MUSCLE_TO_FP_TYPE[muscle.toLowerCase()];
    if (mapping) {
      mapping.primary.forEach((t) => typeWeights[t]++);
      mapping.secondary.forEach((t) => {
        typeWeights[t] += 0.3; // Secondary = 30% weight
      });
    }
  }

  const totalWeight = Object.values(typeWeights).reduce((sum, w) => sum + w, 0);

  if (totalWeight === 0) {
    return { generic: totalFP };
  }

  const typedFP = {};
  let distributed = 0;

  for (const [type, weight] of Object.entries(typeWeights)) {
    if (weight > 0) {
      const amount = Math.floor((weight / totalWeight) * totalFP);
      typedFP[type] = amount;
      distributed += amount;
    }
  }

  // Distribute remainder
  const remainder = totalFP - distributed;
  if (remainder > 0) {
    const highestType = Object.entries(typeWeights).sort((a, b) => b[1] - a[1])[0][0];
    typedFP[highestType] = (typedFP[highestType] || 0) + remainder;
  }

  return typedFP;
}

// =============================================================================
// P0: Pet Stat Allocation (Pet Care §4.1)
// =============================================================================

/**
 * Get stat upgrade cost based on current value
 * @param {StatType} stat
 * @param {number} currentValue
 * @returns {number}
 */
function getStatCost(stat, currentValue) {
  if (stat === 'spirit') return 10; // Spirit always costs 10

  if (currentValue < 10) return 5;
  if (currentValue < 25) return 8;
  return 12;
}

/**
 * Check if stat upgrade is affordable
 * @param {StatType} stat
 * @param {number} currentValue
 * @param {FPBalances} fp
 * @returns {boolean}
 */
function canAffordStatUpgrade(stat, currentValue, fp) {
  if (currentValue >= 50) return false; // Maxed

  const cost = getStatCost(stat, currentValue);

  if (stat === 'spirit') {
    // Spirit only accepts Spirit FP
    return fp.spirit >= cost;
  }

  // Physical stats: specific type OR generic
  return fp[stat] >= cost || fp.generic >= cost;
}

/**
 * Spend FP for stat upgrade (returns new FP balances)
 * @param {StatType} stat
 * @param {FPBalances} fp
 * @returns {{ success: boolean, newFP: FPBalances, spentType: FPType | null }}
 */
function spendFPForStat(stat, currentValue, fp) {
  if (!canAffordStatUpgrade(stat, currentValue, fp)) {
    return { success: false, newFP: fp, spentType: null };
  }

  const cost = getStatCost(stat, currentValue);
  const newFP = { ...fp };

  if (stat === 'spirit') {
    newFP.spirit -= cost;
    return { success: true, newFP, spentType: 'spirit' };
  }

  // Prefer specific type, fall back to generic
  if (fp[stat] >= cost) {
    newFP[stat] -= cost;
    return { success: true, newFP, spentType: stat };
  }

  newFP.generic -= cost;
  return { success: true, newFP, spentType: 'generic' };
}

// =============================================================================
// P0: Evolution System (Pet System §4.2)
// =============================================================================

const EVOLUTION_THRESHOLDS = {
  1: { name: 'Shard', evoXP: 0, shapes: '3-4 polygons' },
  2: { name: 'Form', evoXP: 500, shapes: '6-8 shapes + gradients' },
  3: { name: 'Prime', evoXP: 2000, shapes: 'Multi-shape composite' },
  4: { name: 'Apex', evoXP: 5000, shapes: 'Fractal-like recursion' },
};

/**
 * Get evolution stage from total EvoXP
 * @param {number} totalEvoXP
 * @returns {{ stage: number, name: string, nextThreshold: number | null }}
 */
function getEvolutionStage(totalEvoXP) {
  if (totalEvoXP >= 5000) {
    return { stage: 4, name: 'Apex', nextThreshold: null };
  }
  if (totalEvoXP >= 2000) {
    return { stage: 3, name: 'Prime', nextThreshold: 5000 };
  }
  if (totalEvoXP >= 500) {
    return { stage: 2, name: 'Form', nextThreshold: 2000 };
  }
  return { stage: 1, name: 'Shard', nextThreshold: 500 };
}

// =============================================================================
// P1: Streak System (Timer Amendment §1)
// =============================================================================

/**
 * Calculate Spirit FP from streak
 * @param {number} streakDays
 * @param {boolean} weeklyComplete
 * @param {boolean} monthlyComplete
 * @returns {{ daily: number, milestone: number, weekly: number, monthly: number, total: number }}
 */
function calculateSpiritFPFromStreak(streakDays, weeklyComplete = false, monthlyComplete = false) {
  // Daily: 5 Spirit FP per day
  const daily = streakDays * 5;

  // Milestones
  let milestone = 0;
  if (streakDays >= 30) milestone = 50;
  else if (streakDays >= 14) milestone = 30;
  else if (streakDays >= 7) milestone = 15;

  // Weekly completion: 10 Spirit FP
  const weekly = weeklyComplete ? 10 : 0;

  // Monthly consistency: 25 Spirit FP
  const monthly = monthlyComplete ? 25 : 0;

  return {
    daily,
    milestone,
    weekly,
    monthly,
    total: daily + milestone + weekly + monthly,
  };
}

// =============================================================================
// P1: Hunger & Mood System (Pet Care §4.1)
// =============================================================================

/**
 * Calculate hunger decay
 * @param {number} currentHunger - 0-100
 * @param {number} hoursSinceLastFeed
 * @returns {number}
 */
function calculateHungerDecay(currentHunger, hoursSinceLastFeed) {
  // ~1 bar (25%) per 24 hours = ~1% per hour
  const decayRate = hoursSinceLastFeed * 1.04; // ~25/24
  return Math.max(0, currentHunger - decayRate);
}

/**
 * Calculate mood from factors
 * @param {number} hunger - 0-100
 * @param {boolean} recentFeed
 * @param {boolean} recentWorkout
 * @param {boolean} recentInteraction
 * @returns {{ mood: string, spiritModifier: number }}
 */
function calculateMood(hunger, recentFeed, recentWorkout, recentInteraction) {
  let score = 50; // Base neutral

  // Hunger influence (up to ±30)
  if (hunger >= 75) score += 30;
  else if (hunger >= 50) score += 15;
  else if (hunger <= 25) score -= 35;
  else if (hunger < 50) score -= 20;

  // Recent activities
  if (recentFeed) score += 20;
  if (recentWorkout) score += 25;
  if (recentInteraction) score += 10;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Determine mood
  let mood;
  let spiritModifier;
  if (score >= 80) {
    mood = 'Ecstatic';
    spiritModifier = 1.2;
  } else if (score >= 60) {
    mood = 'Happy';
    spiritModifier = 1.0;
  } else if (score >= 40) {
    mood = 'Neutral';
    spiritModifier = 1.0;
  } else if (score >= 20) {
    mood = 'Drowsy';
    spiritModifier = 0.8;
  } else {
    mood = 'Miserable';
    spiritModifier = 0.6;
  }

  return { mood, spiritModifier };
}

// =============================================================================
// P1: Anti-Gaming Measures (FP Economy §3.2)
// =============================================================================

/**
 * Apply anti-gaming measures to a set
 * @param {number} reps
 * @param {number} sessionMinutes
 * @returns {{ volumeCappedReps: number, baseFPMultiplier: number }}
 */
function applyAntiGamingMeasures(reps, sessionMinutes) {
  // Rep ceiling: no set above 50 reps earns volume FP beyond 50
  const volumeCappedReps = Math.min(reps, 50);

  // Session floor: sessions under 15 minutes = 50% base FP
  const baseFPMultiplier = sessionMinutes < 15 ? 0.5 : 1.0;

  return { volumeCappedReps, baseFPMultiplier };
}

// =============================================================================
// TESTS: Phase 1 - P0 (Must Ship)
// =============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('IronQuest PRD-Aligned Test Suite');
console.log('Phase 1 - P0 Features (Must Ship)');
console.log('═══════════════════════════════════════════════════════════════');

// ---------------------------------------------------------------------------
// FP Calculation Engine Tests
// ---------------------------------------------------------------------------

describe('FP Calculation: Base & Volume', () => {
  test('base completion is always 100 FP', () => {
    const result = calculateWorkoutFP({ totalReps: 0, streakDays: 0 });
    expect(result.breakdown.base).toBe(100);
  });

  test('volume bonus: 1 FP per 10 reps', () => {
    expect(calculateWorkoutFP({ totalReps: 10 }).breakdown.volumeBonus).toBe(1);
    expect(calculateWorkoutFP({ totalReps: 25 }).breakdown.volumeBonus).toBe(2);
    expect(calculateWorkoutFP({ totalReps: 100 }).breakdown.volumeBonus).toBe(10);
    expect(calculateWorkoutFP({ totalReps: 99 }).breakdown.volumeBonus).toBe(9); // Floor
  });

  test('example from PRD: 100 base + 28 volume + 50 PR × 1.4 streak = 249 FP', () => {
    const result = calculateWorkoutFP({
      baseFP: 100,
      totalReps: 280, // 28 volume
      prCount: 1, // 50 FP
      streakDays: 4, // 1.4x multiplier
    });

    // (100 + 28 + 50) × 1.4 = 249.2 → 249 (floored)
    expect(result.totalFP).toBe(249);
    expect(result.breakdown.streakMultiplier).toBe(1.4);
  });
});

describe('FP Calculation: PR Bonuses', () => {
  test('PR bonus: 50 FP per personal record', () => {
    expect(calculateWorkoutFP({ totalReps: 0, prCount: 1 }).breakdown.prBonus).toBe(50);
    expect(calculateWorkoutFP({ totalReps: 0, prCount: 3 }).breakdown.prBonus).toBe(150);
  });

  test('Rep PR bonus: 25 FP per rep PR', () => {
    expect(calculateWorkoutFP({ totalReps: 0, repPRCount: 1 }).breakdown.prBonus).toBe(25);
    expect(calculateWorkoutFP({ totalReps: 0, repPRCount: 2 }).breakdown.prBonus).toBe(50);
  });

  test('PR and Rep PR can stack', () => {
    const result = calculateWorkoutFP({ totalReps: 0, prCount: 1, repPRCount: 1 });
    expect(result.breakdown.prBonus).toBe(75); // 50 + 25
  });
});

describe('FP Calculation: Streak Multiplier', () => {
  test('no streak = 1.0x multiplier', () => {
    expect(calculateWorkoutFP({ totalReps: 0, streakDays: 0 }).breakdown.streakMultiplier).toBe(
      1.0
    );
  });

  test('streak multiplier: 1.0x + 0.1x per day', () => {
    expect(calculateWorkoutFP({ totalReps: 0, streakDays: 1 }).breakdown.streakMultiplier).toBe(
      1.1
    );
    expect(calculateWorkoutFP({ totalReps: 0, streakDays: 5 }).breakdown.streakMultiplier).toBe(
      1.5
    );
    expect(calculateWorkoutFP({ totalReps: 0, streakDays: 10 }).breakdown.streakMultiplier).toBe(
      2.0
    );
  });

  test('streak multiplier capped at 2.0x', () => {
    expect(calculateWorkoutFP({ totalReps: 0, streakDays: 15 }).breakdown.streakMultiplier).toBe(
      2.0
    );
    expect(calculateWorkoutFP({ totalReps: 0, streakDays: 100 }).breakdown.streakMultiplier).toBe(
      2.0
    );
  });
});

// ---------------------------------------------------------------------------
// Typed FP Distribution Tests
// ---------------------------------------------------------------------------

describe('Typed FP: Muscle Group Mapping', () => {
  test('chest maps to Power + Focus', () => {
    const dist = calculateTypedFPDistribution(100, ['chest']);
    expect(dist.power).toBeGreaterThan(0);
    expect(dist.focus).toBeGreaterThan(0);
    expect(dist.guard).toBeUndefined();
  });

  test('back maps to Guard + Focus', () => {
    const dist = calculateTypedFPDistribution(100, ['back']);
    expect(dist.guard).toBeGreaterThan(0);
    expect(dist.focus).toBeGreaterThan(0);
    expect(dist.power).toBeUndefined();
  });

  test('quads map to Speed + Vigor', () => {
    const dist = calculateTypedFPDistribution(100, ['quads']);
    expect(dist.speed).toBeGreaterThan(0);
    expect(dist.vigor).toBeGreaterThan(0);
  });

  test('unknown muscle groups default to generic', () => {
    const dist = calculateTypedFPDistribution(100, ['unknown']);
    expect(dist.generic).toBe(100);
  });

  test('Spirit FP is NEVER generated from workouts', () => {
    const dist = calculateTypedFPDistribution(100, ['chest', 'back', 'quads', 'core']);
    expect(dist.spirit).toBeUndefined();
  });

  test('total FP is preserved (no loss)', () => {
    const dist = calculateTypedFPDistribution(100, ['chest', 'back', 'quads']);
    const total = Object.values(dist).reduce((sum, v) => sum + v, 0);
    expect(total).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Pet Stat Allocation Tests
// ---------------------------------------------------------------------------

describe('Stat Costs: Scaling Tiers', () => {
  test('stats 0-9 cost 5 FP', () => {
    expect(getStatCost('power', 0)).toBe(5);
    expect(getStatCost('power', 5)).toBe(5);
    expect(getStatCost('power', 9)).toBe(5);
    expect(getStatCost('guard', 9)).toBe(5);
  });

  test('stats 10-24 cost 8 FP', () => {
    expect(getStatCost('power', 10)).toBe(8);
    expect(getStatCost('power', 15)).toBe(8);
    expect(getStatCost('power', 24)).toBe(8);
  });

  test('stats 25-49 cost 12 FP', () => {
    expect(getStatCost('power', 25)).toBe(12);
    expect(getStatCost('power', 37)).toBe(12);
    expect(getStatCost('power', 49)).toBe(12);
  });

  test('Spirit always costs 10 FP', () => {
    expect(getStatCost('spirit', 0)).toBe(10);
    expect(getStatCost('spirit', 10)).toBe(10);
    expect(getStatCost('spirit', 25)).toBe(10);
    expect(getStatCost('spirit', 49)).toBe(10);
  });
});

describe('Stat Upgrade: Affordability', () => {
  test('can upgrade with specific FP type', () => {
    const fp = { generic: 0, power: 5, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStatUpgrade('power', 0, fp)).toBe(true);
  });

  test('can upgrade with generic FP', () => {
    const fp = { generic: 5, power: 0, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStatUpgrade('power', 0, fp)).toBe(true);
  });

  test('cannot combine FP pools', () => {
    const fp = { generic: 4, power: 4, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    // Cost is 8 at level 10, neither pool has 8+
    expect(canAffordStatUpgrade('power', 10, fp)).toBe(false);
  });

  test('cannot upgrade maxed stat (50)', () => {
    const fp = { generic: 100, power: 100, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStatUpgrade('power', 50, fp)).toBe(false);
  });

  test('Spirit only accepts Spirit FP', () => {
    const fp1 = { generic: 0, power: 0, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 10 };
    const fp2 = { generic: 100, power: 0, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };

    expect(canAffordStatUpgrade('spirit', 0, fp1)).toBe(true);
    expect(canAffordStatUpgrade('spirit', 0, fp2)).toBe(false);
  });
});

describe('Stat Upgrade: Spending Priority', () => {
  test('prefers specific FP over generic', () => {
    const fp = { generic: 10, power: 8, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    const result = spendFPForStat('power', 10, fp); // Cost 8

    expect(result.success).toBe(true);
    expect(result.spentType).toBe('power');
    expect(result.newFP.power).toBe(0);
    expect(result.newFP.generic).toBe(10); // Unchanged
  });

  test('falls back to generic when specific insufficient', () => {
    const fp = { generic: 10, power: 5, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    const result = spendFPForStat('power', 10, fp); // Cost 8

    expect(result.success).toBe(true);
    expect(result.spentType).toBe('generic');
    expect(result.newFP.generic).toBe(2);
    expect(result.newFP.power).toBe(5); // Unchanged
  });
});

// ---------------------------------------------------------------------------
// Evolution System Tests
// ---------------------------------------------------------------------------

describe('Evolution: Stage Thresholds', () => {
  test('stage 1 (Shard) at 0 EvoXP', () => {
    const result = getEvolutionStage(0);
    expect(result.stage).toBe(1);
    expect(result.name).toBe('Shard');
    expect(result.nextThreshold).toBe(500);
  });

  test('stage 2 (Form) at 500 EvoXP', () => {
    const result = getEvolutionStage(500);
    expect(result.stage).toBe(2);
    expect(result.name).toBe('Form');
    expect(result.nextThreshold).toBe(2000);
  });

  test('stage 3 (Prime) at 2000 EvoXP', () => {
    const result = getEvolutionStage(2000);
    expect(result.stage).toBe(3);
    expect(result.name).toBe('Prime');
    expect(result.nextThreshold).toBe(5000);
  });

  test('stage 4 (Apex) at 5000 EvoXP', () => {
    const result = getEvolutionStage(5000);
    expect(result.stage).toBe(4);
    expect(result.name).toBe('Apex');
    expect(result.nextThreshold).toBe(null);
  });

  test('intermediate values map correctly', () => {
    expect(getEvolutionStage(250).stage).toBe(1);
    expect(getEvolutionStage(750).stage).toBe(2);
    expect(getEvolutionStage(3500).stage).toBe(3);
  });
});

// =============================================================================
// TESTS: Phase 1 - P1 (Should Ship)
// =============================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('Phase 1 - P1 Features (Should Ship)');
console.log('═══════════════════════════════════════════════════════════════');

// ---------------------------------------------------------------------------
// Spirit FP from Streak Tests
// ---------------------------------------------------------------------------

describe('Spirit FP: Streak System', () => {
  test('daily Spirit FP: 5 per day', () => {
    const result = calculateSpiritFPFromStreak(3);
    expect(result.daily).toBe(15);
  });

  test('7-day milestone: +15 Spirit FP', () => {
    const result = calculateSpiritFPFromStreak(7);
    expect(result.milestone).toBe(15);
  });

  test('14-day milestone: +30 Spirit FP', () => {
    const result = calculateSpiritFPFromStreak(14);
    expect(result.milestone).toBe(30);
  });

  test('30-day milestone: +50 Spirit FP', () => {
    const result = calculateSpiritFPFromStreak(30);
    expect(result.milestone).toBe(50);
  });

  test('weekly completion: +10 Spirit FP', () => {
    const result = calculateSpiritFPFromStreak(5, true);
    expect(result.weekly).toBe(10);
  });

  test('monthly consistency: +25 Spirit FP', () => {
    const result = calculateSpiritFPFromStreak(30, false, true);
    expect(result.monthly).toBe(25);
  });

  test('PRD example: 6-day PPL perfect month ≈ 240 Spirit FP (estimate)', () => {
    // PRD says "roughly half the rate of physical stats" and ~24 Spirit stat points
    // 24 points × 10 FP = 240 FP
    // Our calculation: 30 days × 5 = 150 daily + 50 milestone + weekly/monthly bonuses
    const result = calculateSpiritFPFromStreak(30, true, true);
    // Should be in reasonable range of PRD estimate (200-280)
    expect(result.total).toBeGreaterThanOrEqual(200);
    expect(result.total).toBeLessThanOrEqual(280);
  });
});

// ---------------------------------------------------------------------------
// Cardio FP Tests
// ---------------------------------------------------------------------------

describe('Cardio FP: LISS', () => {
  test('30-min LISS = (30 × 2) + 20 = 80 FP', () => {
    const result = calculateCardioFP({ type: 'LISS', durationMinutes: 30 });
    expect(result.breakdown.baseFP).toBe(60);
    expect(result.breakdown.completionBonus).toBe(20);
    expect(result.totalFP).toBe(80);
  });

  test('LISS with 5-day streak (1.5x): 80 × 1.5 = 120 FP', () => {
    const result = calculateCardioFP({ type: 'LISS', durationMinutes: 30, streakDays: 5 });
    expect(result.totalFP).toBe(120);
  });

  test('LISS capped at 60 min', () => {
    const result = calculateCardioFP({ type: 'LISS', durationMinutes: 90 });
    expect(result.breakdown.duration).toBe(60);
  });

  test('LISS below minimum: no completion bonus', () => {
    const result = calculateCardioFP({ type: 'LISS', durationMinutes: 15 });
    expect(result.breakdown.completionBonus).toBe(0);
  });
});

describe('Cardio FP: HIIT', () => {
  test('20-min HIIT = (20 × 4) + 30 = 110 FP', () => {
    const result = calculateCardioFP({ type: 'HIIT', durationMinutes: 20 });
    expect(result.breakdown.baseFP).toBe(80);
    expect(result.breakdown.completionBonus).toBe(30);
    expect(result.totalFP).toBe(110);
  });

  test('HIIT with 5-day streak (1.5x): 110 × 1.5 = 165 FP', () => {
    const result = calculateCardioFP({ type: 'HIIT', durationMinutes: 20, streakDays: 5 });
    expect(result.totalFP).toBe(165);
  });

  test('HIIT capped at 30 min', () => {
    const result = calculateCardioFP({ type: 'HIIT', durationMinutes: 45 });
    expect(result.breakdown.duration).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// Hunger & Mood Tests
// ---------------------------------------------------------------------------

describe('Hunger: Decay Rate', () => {
  test('decays ~1 bar (25%) per 24 hours', () => {
    const result = calculateHungerDecay(100, 24);
    expect(result).toBeGreaterThanOrEqual(70);
    expect(result).toBeLessThanOrEqual(80);
  });

  test('hunger never goes below 0', () => {
    const result = calculateHungerDecay(10, 48);
    expect(result).toBe(0);
  });
});

describe('Mood: Calculation', () => {
  test('high hunger + recent feed + workout = Ecstatic', () => {
    const result = calculateMood(100, true, true, false);
    expect(result.mood).toBe('Ecstatic');
    expect(result.spiritModifier).toBe(1.2);
  });

  test('low hunger + no activity = Miserable', () => {
    const result = calculateMood(0, false, false, false);
    expect(result.mood).toBe('Miserable');
    expect(result.spiritModifier).toBe(0.6);
  });

  test('recovery: one feed + one workout restores to neutral or better', () => {
    // Starting with 25 hunger: 50 - 20 + 20 + 25 = 75 → Happy
    // PRD says "restores to neutral" - we interpret this as at least neutral
    const result = calculateMood(25, true, true, false);
    expect(result.mood === 'Neutral' || result.mood === 'Happy' || result.mood === 'Ecstatic').toBe(
      true
    );
  });
});

// ---------------------------------------------------------------------------
// Anti-Gaming Tests
// ---------------------------------------------------------------------------

describe('Anti-Gaming: Measures', () => {
  test('reps above 50 are capped for volume bonus', () => {
    const result = applyAntiGamingMeasures(75, 20);
    expect(result.volumeCappedReps).toBe(50);
  });

  test('reps at or below 50 are uncapped', () => {
    const result = applyAntiGamingMeasures(40, 20);
    expect(result.volumeCappedReps).toBe(40);
  });

  test('sessions under 15 min get 50% base FP', () => {
    const result = applyAntiGamingMeasures(30, 10);
    expect(result.baseFPMultiplier).toBe(0.5);
  });

  test('sessions 15+ min get full base FP', () => {
    const result = applyAntiGamingMeasures(30, 15);
    expect(result.baseFPMultiplier).toBe(1.0);
  });
});

// =============================================================================
// Summary
// =============================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════════════');

if (failed > 0) {
  console.log('\nFailed tests:');
  failures.forEach((f) => {
    console.log(`  [${f.suite}] ${f.name}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ All PRD-aligned tests passed!');
  process.exit(0);
}

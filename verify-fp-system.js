// =============================================================================
// IronQuest FP System Verification - Validates implementation against PRD specs
// Run with: node verify-fp-system.js
// =============================================================================

// Types
/** @typedef {'power' | 'guard' | 'speed' | 'vigor' | 'focus' | 'spirit'} StatType */
/** @typedef {'generic' | 'power' | 'guard' | 'speed' | 'vigor' | 'focus' | 'spirit'} FPType */

// =============================================================================
// Implementation Functions (copied from den.tsx for verification)
// =============================================================================

/**
 * PRD Spec: Scaling stat costs
 * - Physical stats: 5 FP (1-10), 8 FP (11-25), 12 FP (26-50)
 * - Spirit: 10 FP flat
 */
function getStatCost(stat, currentValue) {
  if (stat === 'spirit') return 10;

  if (currentValue < 10) return 5;
  if (currentValue < 25) return 8;
  return 12;
}

/**
 * Check if user can afford a stat upgrade
 */
function canAffordStat(stat, currentStatValue, fp) {
  if (currentStatValue >= 50) return false;

  const cost = getStatCost(stat, currentStatValue);

  // Spirit stat: only Spirit FP can be used
  if (stat === 'spirit') {
    return fp.spirit >= cost;
  }

  // Physical stats: specific type OR generic (single pool only)
  return fp[stat] >= cost || fp.generic >= cost;
}

/**
 * Get spendable FP for a stat (max of specific or generic)
 */
function getSpendableFP(stat, fp) {
  if (stat === 'spirit') return fp.spirit;
  return Math.max(fp[stat], fp.generic);
}

// Muscle group to FP type mapping (from PRD)
const MUSCLE_TO_FP_TYPE = {
  // Push muscles → Power + Focus
  chest: ['power', 'focus'],
  shoulders: ['power', 'focus'],
  triceps: ['focus'],
  // Pull muscles → Guard + Focus
  back: ['guard', 'focus'],
  traps: ['guard', 'focus'],
  lats: ['guard', 'focus'],
  biceps: ['focus'],
  // Leg muscles → Speed + Vigor
  quads: ['speed', 'vigor'],
  hamstrings: ['speed', 'vigor'],
  glutes: ['speed', 'vigor'],
  calves: ['vigor'],
  // Core → Vigor
  core: ['vigor'],
  abs: ['vigor'],
};

/**
 * Calculate FP distribution from workout (weighted by muscle groups)
 */
function calculateWorkoutFP(totalFP, muscleGroups) {
  const typeWeights = {
    generic: 0,
    power: 0,
    guard: 0,
    speed: 0,
    vigor: 0,
    focus: 0,
    spirit: 0,
  };

  for (const muscle of muscleGroups) {
    const types = MUSCLE_TO_FP_TYPE[muscle.toLowerCase()];
    if (types) {
      types.forEach(t => typeWeights[t]++);
    }
  }

  const totalWeight = Object.entries(typeWeights)
    .filter(([key]) => key !== 'spirit')
    .reduce((sum, [, weight]) => sum + weight, 0);

  const typedFP = {};

  if (totalWeight === 0) {
    typedFP.generic = totalFP;
    return typedFP;
  }

  let distributed = 0;
  const fpTypes = ['generic', 'power', 'guard', 'speed', 'vigor', 'focus', 'spirit'];

  for (const type of fpTypes) {
    if (type === 'spirit') continue;

    const weight = typeWeights[type];
    if (weight > 0) {
      const amount = Math.floor((weight / totalWeight) * totalFP);
      typedFP[type] = amount;
      distributed += amount;
    }
  }

  const remainder = totalFP - distributed;
  if (remainder > 0) {
    const sorted = Object.entries(typeWeights)
      .filter(([key]) => key !== 'spirit')
      .sort((a, b) => b[1] - a[1]);
    const highestType = sorted[0]?.[0];

    if (highestType && typedFP[highestType] !== undefined) {
      typedFP[highestType] = (typedFP[highestType] ?? 0) + remainder;
    }
  }

  return typedFP;
}

// =============================================================================
// Test Runner
// =============================================================================

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
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
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined, got ${actual}`);
      }
    },
  };
}

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
}

// =============================================================================
// Tests
// =============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('IronQuest FP System Verification');
console.log('═══════════════════════════════════════════════════════════════');

describe('Stat Costs - Physical Stats', () => {
  const physicalStats = ['power', 'guard', 'speed', 'vigor', 'focus'];

  test('costs 5 FP for stats 0-9', () => {
    for (const stat of physicalStats) {
      expect(getStatCost(stat, 0)).toBe(5);
      expect(getStatCost(stat, 5)).toBe(5);
      expect(getStatCost(stat, 9)).toBe(5);
    }
  });

  test('costs 8 FP for stats 10-24', () => {
    for (const stat of physicalStats) {
      expect(getStatCost(stat, 10)).toBe(8);
      expect(getStatCost(stat, 15)).toBe(8);
      expect(getStatCost(stat, 24)).toBe(8);
    }
  });

  test('costs 12 FP for stats 25-49', () => {
    for (const stat of physicalStats) {
      expect(getStatCost(stat, 25)).toBe(12);
      expect(getStatCost(stat, 37)).toBe(12);
      expect(getStatCost(stat, 49)).toBe(12);
    }
  });
});

describe('Stat Costs - Spirit', () => {
  test('always costs 10 FP regardless of level', () => {
    expect(getStatCost('spirit', 0)).toBe(10);
    expect(getStatCost('spirit', 10)).toBe(10);
    expect(getStatCost('spirit', 25)).toBe(10);
    expect(getStatCost('spirit', 49)).toBe(10);
  });
});

describe('Affordability - Physical Stats', () => {
  test('allows upgrade with specific FP type', () => {
    const fp = { generic: 0, power: 5, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStat('power', 0, fp)).toBe(true);
  });

  test('allows upgrade with generic FP', () => {
    const fp = { generic: 5, power: 0, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStat('power', 0, fp)).toBe(true);
  });

  test('does NOT allow combining FP pools', () => {
    const fp = { generic: 4, power: 4, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    // Cost is 8 at level 10, neither pool has 8+
    expect(canAffordStat('power', 10, fp)).toBe(false);
  });

  test('does NOT allow upgrade when stat is maxed', () => {
    const fp = { generic: 100, power: 100, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStat('power', 50, fp)).toBe(false);
  });
});

describe('Affordability - Spirit Stat', () => {
  test('ONLY allows upgrade with Spirit FP', () => {
    const fp = { generic: 0, power: 0, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 10 };
    expect(canAffordStat('spirit', 0, fp)).toBe(true);
  });

  test('does NOT allow upgrade with generic FP', () => {
    const fp = { generic: 100, power: 0, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStat('spirit', 0, fp)).toBe(false);
  });

  test('does NOT allow upgrade with other typed FP', () => {
    const fp = { generic: 0, power: 100, guard: 0, speed: 0, vigor: 0, focus: 0, spirit: 0 };
    expect(canAffordStat('spirit', 0, fp)).toBe(false);
  });
});

describe('Spendable Balance', () => {
  const fp = {
    generic: 10,
    power: 5,
    guard: 0,
    speed: 20,
    vigor: 0,
    focus: 0,
    spirit: 15,
  };

  test('returns max of specific or generic for physical stats', () => {
    expect(getSpendableFP('power', fp)).toBe(10); // max(5, 10)
    expect(getSpendableFP('guard', fp)).toBe(10); // max(0, 10)
    expect(getSpendableFP('speed', fp)).toBe(20); // max(20, 10)
  });

  test('returns only spirit FP for spirit stat', () => {
    expect(getSpendableFP('spirit', fp)).toBe(15);
  });
});

describe('Workout FP Distribution', () => {
  test('distributes FP to types based on muscle groups', () => {
    const result = calculateWorkoutFP(100, ['chest']);
    expect(result.power).toBeGreaterThan(0);
    expect(result.focus).toBeGreaterThan(0);
    expect(result.guard).toBeUndefined();
  });

  test('weights FP by muscle group count', () => {
    const result = calculateWorkoutFP(100, ['chest', 'shoulders', 'back']);
    // Focus appears most (chest + shoulders + back = 3 times)
    expect(result.focus).toBeGreaterThan(result.power);
    expect(result.power).toBeGreaterThan(result.guard);
  });

  test('gives generic FP if no muscle groups map', () => {
    const result = calculateWorkoutFP(100, ['unknown_muscle']);
    expect(result.generic).toBe(100);
  });

  test('NEVER generates Spirit FP from workouts', () => {
    const result = calculateWorkoutFP(100, ['chest', 'back', 'quads']);
    expect(result.spirit).toBeUndefined();
  });

  test('distributes total FP exactly (no loss)', () => {
    const result = calculateWorkoutFP(100, ['chest', 'back']);
    const total = Object.values(result).reduce((sum, val) => sum + (val || 0), 0);
    expect(total).toBe(100);
  });
});

describe('Edge Cases', () => {
  test('handles boundary 9→10 with correct cost change', () => {
    expect(getStatCost('power', 9)).toBe(5);
    expect(getStatCost('power', 10)).toBe(8);
  });

  test('handles boundary 24→25 with correct cost change', () => {
    expect(getStatCost('power', 24)).toBe(8);
    expect(getStatCost('power', 25)).toBe(12);
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
  failures.forEach(f => {
    console.log(`  - ${f.name}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ All FP system tests passed!');
  process.exit(0);
}

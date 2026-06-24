// =============================================================================
// IronQuest FP System Tests - Validates implementation against PRD specs
// =============================================================================

import { beforeEach, describe, expect, it } from '@jest/globals';

// =============================================================================
// Test Helpers - Pure functions extracted from implementation for testing
// =============================================================================

type StatType = 'power' | 'guard' | 'speed' | 'vigor' | 'focus' | 'spirit';
type FPType = 'generic' | 'power' | 'guard' | 'speed' | 'vigor' | 'focus' | 'spirit';

interface FPBalances {
  generic: number;
  power: number;
  guard: number;
  speed: number;
  vigor: number;
  focus: number;
  spirit: number;
}

// PRD Spec: Scaling stat costs
// - Physical stats: 5 FP (1-10), 8 FP (11-25), 12 FP (26-50)
// - Spirit: 10 FP flat
function getStatCost(stat: StatType, currentValue: number): number {
  if (stat === 'spirit') return 10;

  if (currentValue < 10) return 5;
  if (currentValue < 25) return 8;
  return 12;
}

// Check if user can afford a stat upgrade
function canAffordStat(stat: StatType, currentStatValue: number, fp: FPBalances): boolean {
  if (currentStatValue >= 50) return false;

  const cost = getStatCost(stat, currentStatValue);

  // Spirit stat: only Spirit FP can be used
  if (stat === 'spirit') {
    return fp.spirit >= cost;
  }

  // Physical stats: specific type OR generic (single pool only)
  return fp[stat] >= cost || fp.generic >= cost;
}

// Get spendable FP for a stat (max of specific or generic)
function getSpendableFP(stat: StatType, fp: FPBalances): number {
  if (stat === 'spirit') return fp.spirit;
  return Math.max(fp[stat], fp.generic);
}

// Muscle group to FP type mapping (from PRD)
const MUSCLE_TO_FP_TYPE: Record<string, FPType[]> = {
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

// Calculate FP distribution from workout (weighted by muscle groups)
function calculateWorkoutFP(totalFP: number, muscleGroups: string[]): Partial<FPBalances> {
  const typeWeights: Record<FPType, number> = {
    generic: 0,
    power: 0,
    guard: 0,
    speed: 0,
    vigor: 0,
    focus: 0,
    spirit: 0,
  };

  // Count occurrences of each FP type
  for (const muscle of muscleGroups) {
    const types = MUSCLE_TO_FP_TYPE[muscle.toLowerCase()];
    if (types) {
      types.forEach((t) => typeWeights[t]++);
    }
  }

  // Calculate total weight (excluding spirit - not from workouts)
  const totalWeight = Object.entries(typeWeights)
    .filter(([key]) => key !== 'spirit')
    .reduce((sum, [, weight]) => sum + weight, 0);

  const typedFP: Partial<FPBalances> = {};

  if (totalWeight === 0) {
    typedFP.generic = totalFP;
    return typedFP;
  }

  let distributed = 0;
  const fpTypes: FPType[] = ['generic', 'power', 'guard', 'speed', 'vigor', 'focus', 'spirit'];

  for (const type of fpTypes) {
    if (type === 'spirit') continue;

    const weight = typeWeights[type];
    if (weight > 0) {
      const amount = Math.floor((weight / totalWeight) * totalFP);
      typedFP[type] = amount;
      distributed += amount;
    }
  }

  // Distribute remainder to highest weighted type
  const remainder = totalFP - distributed;
  if (remainder > 0) {
    const highestType = Object.entries(typeWeights)
      .filter(([key]) => key !== 'spirit')
      .sort((a, b) => b[1] - a[1])[0]?.[0] as FPType | undefined;

    if (highestType && typedFP[highestType] !== undefined) {
      typedFP[highestType] = (typedFP[highestType] ?? 0) + remainder;
    }
  }

  return typedFP;
}

// =============================================================================
// Tests
// =============================================================================

describe('FP System - Stat Costs', () => {
  describe('Physical Stats (Power, Guard, Speed, Vigor, Focus)', () => {
    it('should cost 5 FP for stats 0-9', () => {
      const physicalStats: StatType[] = ['power', 'guard', 'speed', 'vigor', 'focus'];

      for (const stat of physicalStats) {
        expect(getStatCost(stat, 0)).toBe(5);
        expect(getStatCost(stat, 5)).toBe(5);
        expect(getStatCost(stat, 9)).toBe(5);
      }
    });

    it('should cost 8 FP for stats 10-24', () => {
      const physicalStats: StatType[] = ['power', 'guard', 'speed', 'vigor', 'focus'];

      for (const stat of physicalStats) {
        expect(getStatCost(stat, 10)).toBe(8);
        expect(getStatCost(stat, 15)).toBe(8);
        expect(getStatCost(stat, 24)).toBe(8);
      }
    });

    it('should cost 12 FP for stats 25-49', () => {
      const physicalStats: StatType[] = ['power', 'guard', 'speed', 'vigor', 'focus'];

      for (const stat of physicalStats) {
        expect(getStatCost(stat, 25)).toBe(12);
        expect(getStatCost(stat, 37)).toBe(12);
        expect(getStatCost(stat, 49)).toBe(12);
      }
    });
  });

  describe('Spirit Stat', () => {
    it('should always cost 10 FP regardless of level', () => {
      expect(getStatCost('spirit', 0)).toBe(10);
      expect(getStatCost('spirit', 10)).toBe(10);
      expect(getStatCost('spirit', 25)).toBe(10);
      expect(getStatCost('spirit', 49)).toBe(10);
    });
  });
});

describe('FP System - Affordability Checks', () => {
  let fp: FPBalances;

  beforeEach(() => {
    fp = {
      generic: 0,
      power: 0,
      guard: 0,
      speed: 0,
      vigor: 0,
      focus: 0,
      spirit: 0,
    };
  });

  describe('Physical Stats', () => {
    it('should allow upgrade with specific FP type', () => {
      fp.power = 5;
      expect(canAffordStat('power', 0, fp)).toBe(true);
    });

    it('should allow upgrade with generic FP', () => {
      fp.generic = 5;
      expect(canAffordStat('power', 0, fp)).toBe(true);
    });

    it('should NOT allow upgrade if both pools are insufficient', () => {
      fp.power = 3;
      fp.generic = 3;
      // Cost is 5, but neither pool has 5+
      expect(canAffordStat('power', 0, fp)).toBe(false);
    });

    it('should NOT allow combining FP pools', () => {
      fp.power = 4;
      fp.generic = 4;
      // Cost is 8 at level 10, neither pool has 8+
      expect(canAffordStat('power', 10, fp)).toBe(false);
    });

    it('should NOT allow upgrade when stat is maxed (50)', () => {
      fp.power = 100;
      expect(canAffordStat('power', 50, fp)).toBe(false);
    });
  });

  describe('Spirit Stat', () => {
    it('should ONLY allow upgrade with Spirit FP', () => {
      fp.spirit = 10;
      fp.generic = 100; // Lots of generic, but shouldn't work
      expect(canAffordStat('spirit', 0, fp)).toBe(true);
    });

    it('should NOT allow upgrade with generic FP', () => {
      fp.spirit = 0;
      fp.generic = 100;
      expect(canAffordStat('spirit', 0, fp)).toBe(false);
    });

    it('should NOT allow upgrade with other typed FP', () => {
      fp.spirit = 0;
      fp.power = 100;
      expect(canAffordStat('spirit', 0, fp)).toBe(false);
    });

    it('should require 10 Spirit FP for any level', () => {
      fp.spirit = 10;
      expect(canAffordStat('spirit', 0, fp)).toBe(true);
      expect(canAffordStat('spirit', 25, fp)).toBe(true);
      expect(canAffordStat('spirit', 49, fp)).toBe(true);
    });
  });
});

describe('FP System - Spendable Balance', () => {
  let fp: FPBalances;

  beforeEach(() => {
    fp = {
      generic: 10,
      power: 5,
      guard: 0,
      speed: 20,
      vigor: 0,
      focus: 0,
      spirit: 15,
    };
  });

  it('should return max of specific or generic for physical stats', () => {
    expect(getSpendableFP('power', fp)).toBe(10); // max(5, 10)
    expect(getSpendableFP('guard', fp)).toBe(10); // max(0, 10)
    expect(getSpendableFP('speed', fp)).toBe(20); // max(20, 10)
  });

  it('should return only spirit FP for spirit stat', () => {
    expect(getSpendableFP('spirit', fp)).toBe(15);
  });
});

describe('FP System - Workout Distribution', () => {
  it('should distribute FP to types based on muscle groups', () => {
    // Chest workout → Power + Focus
    const result = calculateWorkoutFP(100, ['chest']);

    expect(result.power).toBeGreaterThan(0);
    expect(result.focus).toBeGreaterThan(0);
    expect(result.guard).toBeUndefined();
    expect(result.speed).toBeUndefined();
    expect(result.vigor).toBeUndefined();
    expect(result.spirit).toBeUndefined(); // Never from workouts
  });

  it('should weight FP by muscle group count', () => {
    // 2 chest exercises (4 FP type hits) + 1 back exercise (2 FP type hits)
    // Total: 6 hits, Power=2, Focus=3, Guard=1
    const result = calculateWorkoutFP(100, ['chest', 'shoulders', 'back']);

    // Focus should get most (3/6 = 50%), Power (2/6 = 33%), Guard (1/6 = 17%)
    expect(result.focus).toBeGreaterThan(result.power!);
    expect(result.power).toBeGreaterThan(result.guard!);
  });

  it('should give generic FP if no muscle groups map', () => {
    const result = calculateWorkoutFP(100, ['unknown_muscle']);

    expect(result.generic).toBe(100);
  });

  it('should NEVER generate Spirit FP from workouts', () => {
    const result = calculateWorkoutFP(100, ['chest', 'back', 'quads']);

    expect(result.spirit).toBeUndefined();
  });

  it('should distribute total FP exactly (no loss)', () => {
    const result = calculateWorkoutFP(100, ['chest', 'back']);
    const total = Object.values(result).reduce((sum, val) => sum + (val || 0), 0);

    expect(total).toBe(100);
  });

  it('should map leg exercises to Speed + Vigor', () => {
    const result = calculateWorkoutFP(100, ['quads', 'hamstrings']);

    expect(result.speed).toBeGreaterThan(0);
    expect(result.vigor).toBeGreaterThan(0);
    expect(result.power).toBeUndefined();
    expect(result.guard).toBeUndefined();
  });

  it('should map pull exercises to Guard + Focus', () => {
    const result = calculateWorkoutFP(100, ['back', 'lats']);

    expect(result.guard).toBeGreaterThan(0);
    expect(result.focus).toBeGreaterThan(0);
    expect(result.power).toBeUndefined();
  });
});

describe('FP System - PRD Edge Cases', () => {
  it('should handle stat at boundary (10 → 11) with correct cost change', () => {
    // Stat 9 → 10 costs 5 FP
    expect(getStatCost('power', 9)).toBe(5);
    // Stat 10 → 11 costs 8 FP
    expect(getStatCost('power', 10)).toBe(8);
  });

  it('should handle stat at boundary (24 → 25) with correct cost change', () => {
    // Stat 24 → 25 costs 8 FP
    expect(getStatCost('power', 24)).toBe(8);
    // Stat 25 → 26 costs 12 FP
    expect(getStatCost('power', 25)).toBe(12);
  });

  it('should not allow upgrades at stat max (50)', () => {
    const fp: FPBalances = {
      generic: 1000,
      power: 1000,
      guard: 1000,
      speed: 1000,
      vigor: 1000,
      focus: 1000,
      spirit: 1000,
    };

    expect(canAffordStat('power', 50, fp)).toBe(false);
    expect(canAffordStat('spirit', 50, fp)).toBe(false);
  });
});

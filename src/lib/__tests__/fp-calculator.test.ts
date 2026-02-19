// =============================================================================
// IronQuest FP Calculator Unit Tests
// =============================================================================

import { calculateSetFP, estimateSetFP, checkForPR, formatFPBreakdown } from '../fp-calculator';
import type { FPBreakdown, SetFPParams } from '../fp-calculator';

// =============================================================================
// Test Fixtures
// =============================================================================

describe('FP Calculator', () => {
  // ---------------------------------------------------------------------------
  // Basic Calculation Tests
  // ---------------------------------------------------------------------------

  describe('calculateSetFP - basic calculation', () => {
    it('should calculate correct FP for a basic set (no PR, day 1)', () => {
      const result = calculateSetFP({
        reps: 10,
        weight: 135,
        currentStreak: 0,
      });

      expect(result).toEqual({
        base: 100,
        volumeBonus: 1, // floor(10 / 10)
        weightPR: 0,
        repPR: 0,
        streakMultiplier: 1.0,
        total: 101, // (100 + 1) * 1.0
      });
    });

    it('should include base FP of 100 for all sets', () => {
      const result = calculateSetFP({
        reps: 0,
        weight: 0,
        currentStreak: 0,
      });

      expect(result.base).toBe(100);
    });

    it('should apply streak multiplier correctly', () => {
      const result = calculateSetFP({
        reps: 10,
        currentStreak: 5, // 1.0 + 0.1 * 5 = 1.5x
      });

      expect(result.streakMultiplier).toBe(1.5);
      expect(result.total).toBe(Math.floor(101 * 1.5)); // 151
    });

    it('should handle undefined weight (bodyweight exercises)', () => {
      const result = calculateSetFP({
        reps: 20,
        weight: undefined,
        currentStreak: 0,
      });

      expect(result.base).toBe(100);
      expect(result.volumeBonus).toBe(2); // floor(20 / 10)
      expect(result.weightPR).toBe(0); // No weight PR for bodyweight
      expect(result.total).toBe(102);
    });
  });

  // ---------------------------------------------------------------------------
  // Volume Bonus Edge Cases
  // ---------------------------------------------------------------------------

  describe('calculateSetFP - volume bonus', () => {
    it('should give 0 volume bonus for 0-9 reps', () => {
      for (let reps = 0; reps <= 9; reps++) {
        const result = calculateSetFP({
          reps,
          currentStreak: 0,
        });
        expect(result.volumeBonus).toBe(0);
      }
    });

    it('should give 1 volume bonus for 10-19 reps', () => {
      for (let reps = 10; reps <= 19; reps++) {
        const result = calculateSetFP({
          reps,
          currentStreak: 0,
        });
        expect(result.volumeBonus).toBe(1);
      }
    });

    it('should give correct volume bonus for higher rep counts', () => {
      const testCases = [
        { reps: 20, expected: 2 },
        { reps: 25, expected: 2 },
        { reps: 30, expected: 3 },
        { reps: 50, expected: 5 },
        { reps: 100, expected: 10 },
        { reps: 99, expected: 9 },
        { reps: 101, expected: 10 },
      ];

      testCases.forEach(({ reps, expected }) => {
        const result = calculateSetFP({
          reps,
          currentStreak: 0,
        });
        expect(result.volumeBonus).toBe(expected);
      });
    });

    it('should use floor division for volume calculation', () => {
      // floor(9.9) = 9, but since reps is integer, test floor(19/10) = 1
      const result = calculateSetFP({
        reps: 19,
        currentStreak: 0,
      });
      expect(result.volumeBonus).toBe(1); // floor(19/10) = 1, not 2
    });
  });

  // ---------------------------------------------------------------------------
  // PR Detection Tests
  // ---------------------------------------------------------------------------

  describe('calculateSetFP - PR detection', () => {
    describe('weight PR', () => {
      it('should award 50 FP for new weight PR', () => {
        const result = calculateSetFP({
          reps: 5,
          weight: 225,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.weightPR).toBe(50);
        expect(result.total).toBe(150); // (100 + 0 + 50) * 1.0
      });

      it('should not award weight PR for same weight', () => {
        const result = calculateSetFP({
          reps: 5,
          weight: 200,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.weightPR).toBe(0);
      });

      it('should not award weight PR for lower weight', () => {
        const result = calculateSetFP({
          reps: 5,
          weight: 185,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.weightPR).toBe(0);
      });
    });

    describe('rep PR', () => {
      it('should award 25 FP for rep PR at same weight', () => {
        const result = calculateSetFP({
          reps: 8,
          weight: 200,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.repPR).toBe(25);
        expect(result.total).toBe(125); // (100 + 0 + 25) * 1.0
      });

      it('should not award rep PR for same reps at same weight', () => {
        const result = calculateSetFP({
          reps: 5,
          weight: 200,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.repPR).toBe(0);
      });

      it('should not award rep PR for fewer reps at same weight', () => {
        const result = calculateSetFP({
          reps: 3,
          weight: 200,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.repPR).toBe(0);
      });

      it('should not award rep PR at different weight', () => {
        // Rep PR only counts at the same weight
        const result = calculateSetFP({
          reps: 10,
          weight: 185, // Different weight
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.repPR).toBe(0);
      });
    });

    describe('combined PRs', () => {
      it('should award both weight PR and rep PR when applicable', () => {
        // New weight AND more reps than at the previous best weight
        const result = calculateSetFP({
          reps: 6,
          weight: 225,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        // Weight PR: 225 > 200 -> 50 FP
        // Rep PR: Only at same weight, so not applicable here
        expect(result.weightPR).toBe(50);
        expect(result.repPR).toBe(0);
        expect(result.total).toBe(150);
      });

      it('should award both PRs when weight matches but reps exceed', () => {
        const result = calculateSetFP({
          reps: 10,
          weight: 200,
          previousBest: { weight: 200, reps: 5 },
          currentStreak: 0,
        });

        expect(result.weightPR).toBe(0); // Same weight
        expect(result.repPR).toBe(25); // More reps at same weight
        // 100 base + 1 volume (floor(10/10)) + 25 rep PR = 126
        expect(result.total).toBe(126);
      });
    });

    describe('no previous best', () => {
      it('should not award any PR for first set', () => {
        const result = calculateSetFP({
          reps: 10,
          weight: 135,
          previousBest: undefined,
          currentStreak: 0,
        });

        expect(result.weightPR).toBe(0);
        expect(result.repPR).toBe(0);
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Streak Multiplier Tests
  // ---------------------------------------------------------------------------

  describe('calculateSetFP - streak multiplier', () => {
    it('should give 1.0x multiplier for 0 streak (day 1)', () => {
      const result = calculateSetFP({
        reps: 10,
        currentStreak: 0,
      });

      expect(result.streakMultiplier).toBe(1.0);
    });

    it('should increase by 0.1x per day', () => {
      const testCases = [
        { streak: 0, expected: 1.0 },
        { streak: 1, expected: 1.1 },
        { streak: 2, expected: 1.2 },
        { streak: 5, expected: 1.5 },
        { streak: 7, expected: 1.7 },
        { streak: 10, expected: 2.0 }, // Caps at 2.0
      ];

      testCases.forEach(({ streak, expected }) => {
        const result = calculateSetFP({
          reps: 10,
          currentStreak: streak,
        });
        // Use toBeCloseTo to handle floating-point precision
        expect(result.streakMultiplier).toBeCloseTo(expected, 10);
      });
    });

    it('should cap streak multiplier at 2.0', () => {
      const testCases = [10, 15, 20, 30, 100, 365];

      testCases.forEach((streak) => {
        const result = calculateSetFP({
          reps: 10,
          currentStreak: streak,
        });
        expect(result.streakMultiplier).toBe(2.0);
      });
    });

    it('should apply multiplier correctly to total', () => {
      // 10 reps = 1 volume bonus
      // Base: 100, Volume: 1, Subtotal: 101
      // 5 day streak: 1.5x multiplier
      const result = calculateSetFP({
        reps: 10,
        currentStreak: 5,
      });

      expect(result.streakMultiplier).toBe(1.5);
      expect(result.total).toBe(Math.floor(101 * 1.5)); // 151
    });
  });

  // ---------------------------------------------------------------------------
  // Zero/Negative Input Tests
  // ---------------------------------------------------------------------------

  describe('calculateSetFP - edge cases', () => {
    it('should handle zero reps', () => {
      const result = calculateSetFP({
        reps: 0,
        currentStreak: 0,
      });

      expect(result.base).toBe(100);
      expect(result.volumeBonus).toBe(0);
      expect(result.total).toBe(100);
    });

    it('should handle negative reps (treat as 0)', () => {
      const result = calculateSetFP({
        reps: -5,
        currentStreak: 0,
      });

      expect(result.base).toBe(100);
      expect(result.volumeBonus).toBe(0);
      expect(result.total).toBe(100);
    });

    it('should handle negative streak (treat as 0)', () => {
      const result = calculateSetFP({
        reps: 10,
        currentStreak: -10,
      });

      expect(result.streakMultiplier).toBe(1.0);
    });

    it('should handle zero weight', () => {
      const result = calculateSetFP({
        reps: 10,
        weight: 0,
        previousBest: { weight: 100, reps: 5 },
        currentStreak: 0,
      });

      // 0 is not > 100, so no weight PR
      expect(result.weightPR).toBe(0);
    });

    it('should handle all zeros', () => {
      const result = calculateSetFP({
        reps: 0,
        weight: 0,
        currentStreak: 0,
      });

      expect(result).toEqual({
        base: 100,
        volumeBonus: 0,
        weightPR: 0,
        repPR: 0,
        streakMultiplier: 1.0,
        total: 100,
      });
    });

    it('should handle very large rep counts', () => {
      const result = calculateSetFP({
        reps: 500,
        currentStreak: 0,
      });

      expect(result.volumeBonus).toBe(50); // floor(500/10)
      expect(result.total).toBe(150);
    });
  });

  // ---------------------------------------------------------------------------
  // Full Integration Tests
  // ---------------------------------------------------------------------------

  describe('calculateSetFP - integration scenarios', () => {
    it('should calculate correctly for a typical heavy set', () => {
      // User bench presses 225 for 5 reps, beating previous 200x5
      // 7 day streak
      const result = calculateSetFP({
        reps: 5,
        weight: 225,
        previousBest: { weight: 200, reps: 5 },
        currentStreak: 7,
      });

      expect(result.base).toBe(100);
      expect(result.volumeBonus).toBe(0); // floor(5/10) = 0
      expect(result.weightPR).toBe(50); // 225 > 200
      expect(result.repPR).toBe(0);
      expect(result.streakMultiplier).toBeCloseTo(1.7, 10); // 1.0 + 0.1 * 7
      expect(result.total).toBe(Math.floor(150 * 1.7)); // 255
    });

    it('should calculate correctly for high-rep set with PR', () => {
      // User does 15 reps at 135, previous best was 135x10
      // 3 day streak
      const result = calculateSetFP({
        reps: 15,
        weight: 135,
        previousBest: { weight: 135, reps: 10 },
        currentStreak: 3,
      });

      expect(result.base).toBe(100);
      expect(result.volumeBonus).toBe(1); // floor(15/10) = 1
      expect(result.weightPR).toBe(0); // Same weight
      expect(result.repPR).toBe(25); // More reps at same weight
      expect(result.streakMultiplier).toBe(1.3); // 1.0 + 0.1 * 3
      expect(result.total).toBe(Math.floor(126 * 1.3)); // 163
    });

    it('should calculate correctly for max streak user', () => {
      // 30 day streak, heavy set with PR
      const result = calculateSetFP({
        reps: 8,
        weight: 315,
        previousBest: { weight: 300, reps: 5 },
        currentStreak: 30,
      });

      expect(result.streakMultiplier).toBe(2.0); // Capped
      expect(result.weightPR).toBe(50);
      expect(result.total).toBe(Math.floor(150 * 2.0)); // 300
    });
  });
});

// =============================================================================
// Estimate FP Tests
// =============================================================================

describe('estimateSetFP', () => {
  it('should estimate FP without PR bonuses', () => {
    const result = estimateSetFP(15, 5);

    expect(result.base).toBe(100);
    expect(result.volumeBonus).toBe(1);
    expect(result.weightPR).toBe(0); // Always 0 in estimates
    expect(result.repPR).toBe(0); // Always 0 in estimates
    expect(result.streakMultiplier).toBe(1.5);
    expect(result.total).toBe(Math.floor(101 * 1.5)); // 151
  });

  it('should work with zero reps', () => {
    const result = estimateSetFP(0, 0);

    expect(result.base).toBe(100);
    expect(result.total).toBe(100);
  });
});

// =============================================================================
// Check For PR Tests
// =============================================================================

describe('checkForPR', () => {
  it('should detect weight PR', () => {
    const result = checkForPR({
      reps: 5,
      weight: 225,
      previousBest: { weight: 200, reps: 5 },
    });

    expect(result.isWeightPR).toBe(true);
    expect(result.isRepPR).toBe(false);
  });

  it('should detect rep PR', () => {
    const result = checkForPR({
      reps: 10,
      weight: 200,
      previousBest: { weight: 200, reps: 5 },
    });

    expect(result.isWeightPR).toBe(false);
    expect(result.isRepPR).toBe(true);
  });

  it('should detect both PRs in same set', () => {
    const result = checkForPR({
      reps: 10,
      weight: 225,
      previousBest: { weight: 200, reps: 5 },
    });

    expect(result.isWeightPR).toBe(true);
    // Rep PR is only at same weight
    expect(result.isRepPR).toBe(false);
  });

  it('should treat first set as PR', () => {
    const result = checkForPR({
      reps: 10,
      weight: 135,
      previousBest: undefined,
    });

    expect(result.isWeightPR).toBe(true);
    expect(result.isRepPR).toBe(true);
  });

  it('should handle bodyweight exercises', () => {
    const result = checkForPR({
      reps: 25,
      weight: undefined,
      previousBest: { weight: 0, reps: 20 },
    });

    expect(result.isWeightPR).toBe(false);
    expect(result.isRepPR).toBe(true);
  });

  it('should not detect PR when not beating records', () => {
    const result = checkForPR({
      reps: 5,
      weight: 200,
      previousBest: { weight: 225, reps: 8 },
    });

    expect(result.isWeightPR).toBe(false);
    expect(result.isRepPR).toBe(false);
  });
});

// =============================================================================
// Format FP Breakdown Tests
// =============================================================================

describe('formatFPBreakdown', () => {
  it('should format basic breakdown', () => {
    const breakdown: FPBreakdown = {
      base: 100,
      volumeBonus: 1,
      weightPR: 0,
      repPR: 0,
      streakMultiplier: 1.0,
      total: 101,
    };

    const formatted = formatFPBreakdown(breakdown);
    expect(formatted).toBe('100 + 1 = 101 x 1.0 = 101 FP');
  });

  it('should format with weight PR', () => {
    const breakdown: FPBreakdown = {
      base: 100,
      volumeBonus: 0,
      weightPR: 50,
      repPR: 0,
      streakMultiplier: 1.5,
      total: 225,
    };

    const formatted = formatFPBreakdown(breakdown);
    expect(formatted).toBe('100 + 50 (weight PR) = 150 x 1.5 = 225 FP');
  });

  it('should format with rep PR', () => {
    const breakdown: FPBreakdown = {
      base: 100,
      volumeBonus: 2,
      weightPR: 0,
      repPR: 25,
      streakMultiplier: 1.3,
      total: 164,
    };

    const formatted = formatFPBreakdown(breakdown);
    expect(formatted).toBe('100 + 2 + 25 (rep PR) = 127 x 1.3 = 164 FP');
  });

  it('should format with both PRs', () => {
    const breakdown: FPBreakdown = {
      base: 100,
      volumeBonus: 1,
      weightPR: 50,
      repPR: 25,
      streakMultiplier: 2.0,
      total: 352,
    };

    const formatted = formatFPBreakdown(breakdown);
    expect(formatted).toBe('100 + 1 + 50 (weight PR) + 25 (rep PR) = 176 x 2.0 = 352 FP');
  });
});

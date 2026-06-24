// =============================================================================
// IronQuest Workout Summary Adapter Tests
// =============================================================================
// Regression coverage for issue #4 (Deload intent propagation) and the
// engine-vs-summary fracture that masked it. The summary screen must route
// through the FP engine (`calculateSessionFP`), not hand-roll FP math.

import type { Exercise, LoggedSet } from '@/types';
import { describe, expect, it } from '@jest/globals';
import { calculateWorkoutSummary } from '../workout-summary';

const makeSet = (overrides: Partial<LoggedSet> = {}): LoggedSet => ({
  reps: 10,
  weight: 100,
  logged: true,
  isPR: false,
  isRepPR: false,
  ...overrides,
});

const makeExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: 'ex-1',
  name: 'Test Exercise',
  muscleGroups: ['chest', 'triceps'],
  sets: [makeSet()],
  restSeconds: 60,
  completed: false,
  ...overrides,
});

describe('calculateWorkoutSummary — Deload intent (issue #4 regression)', () => {
  it('awards flat 80 FP for a deload session with volume on multiple exercises', () => {
    // Shadow calculator used to return 0 FP here because it ignored intent.
    const exercises: Exercise[] = [
      makeExercise({
        sets: [makeSet({ reps: 10 }), makeSet({ reps: 10 })],
      }),
      makeExercise({
        id: 'ex-2',
        name: 'Second Exercise',
        sets: [makeSet({ reps: 12 })],
      }),
    ];

    const summary = calculateWorkoutSummary(exercises, 1200, 0, 'deload');

    expect(summary.totalFP).toBe(80);
    expect(summary.breakdown.base).toBe(80);
    expect(summary.breakdown.volumeBonus).toBe(0);
    expect(summary.breakdown.prBonus).toBe(0);
    expect(summary.breakdown.streakMultiplier).toBe(1.0);
  });

  it('deload with zero logged sets still awards flat 80 FP', () => {
    // Reproduces the exact scenario verified in the browser: finish a session
    // without logging sets. The shadow returned 0; engine returns flat 80.
    const exercises: Exercise[] = [
      makeExercise({
        sets: [makeSet({ reps: null, weight: null, logged: false })],
      }),
    ];

    const summary = calculateWorkoutSummary(exercises, 60, 0, 'deload');

    expect(summary.totalFP).toBe(80);
    expect(summary.breakdown.base).toBe(80);
  });

  it('deload ignores weight PR flags (no volume scaling, no PR bonus)', () => {
    const exercises: Exercise[] = [
      makeExercise({
        sets: [makeSet({ reps: 10, weight: 200, isPR: true })],
      }),
    ];

    const summary = calculateWorkoutSummary(exercises, 60, 0, 'deload');

    expect(summary.totalFP).toBe(80);
    expect(summary.breakdown.prBonus).toBe(0);
  });
});

describe('calculateWorkoutSummary — Normal intent', () => {
  it('awards 100 flat base + volume bonus per spec (not 100 per exercise)', () => {
    // The shadow calculator over-granted base FP proportional to exercise
    // count. Engine is the source of truth: 100 flat per workout.
    const exercises: Exercise[] = [
      makeExercise({
        sets: [makeSet({ reps: 10 }), makeSet({ reps: 10 })],
      }),
      makeExercise({
        id: 'ex-2',
        name: 'Second',
        sets: [makeSet({ reps: 10 })],
      }),
    ];

    const summary = calculateWorkoutSummary(exercises, 600, 0, 'normal');

    // 100 base + floor(30/10)=3 volume = 103
    expect(summary.breakdown.base).toBe(100);
    expect(summary.breakdown.volumeBonus).toBe(3);
    expect(summary.totalFP).toBe(103);
  });

  it('reflects weight PR (50) and rep PR (25) bonuses from set flags', () => {
    const exercises: Exercise[] = [
      makeExercise({
        sets: [makeSet({ reps: 10, isPR: true }), makeSet({ reps: 12, isRepPR: true })],
      }),
    ];

    const summary = calculateWorkoutSummary(exercises, 600, 0, 'normal');

    // 100 base + 2 volume + 50 weight PR + 25 rep PR = 177
    expect(summary.breakdown.prBonus).toBe(75);
    expect(summary.totalFP).toBe(177);
  });

  it('applies streak multiplier >1 when streakDays > 0', () => {
    const exercises: Exercise[] = [makeExercise({ sets: [makeSet({ reps: 10 })] })];

    const summary = calculateWorkoutSummary(exercises, 600, 10, 'normal');

    // streak(10) = 1.0 + 0.1*10 = 2.0 (max)
    // subtotal = 100 + 1 = 101; total = floor(101 * 2.0) = 202
    expect(summary.breakdown.streakMultiplier).toBe(2.0);
    expect(summary.totalFP).toBe(202);
  });
});

describe('calculateWorkoutSummary — display aggregates', () => {
  it('counts totalReps and totalSets from logged sets only', () => {
    const exercises: Exercise[] = [
      makeExercise({
        sets: [makeSet({ reps: 10 }), makeSet({ reps: 12, logged: false }), makeSet({ reps: 8 })],
      }),
    ];

    const summary = calculateWorkoutSummary(exercises, 300, 0, 'normal');

    expect(summary.totalSets).toBe(2);
    expect(summary.totalReps).toBe(18);
  });
});

describe('calculateWorkoutSummary — Personal Baseline relative scaling', () => {
  it('falls back to absolute volume when no baseline is provided', () => {
    // Same setup as the normal-intent test: 30 reps = 3 volume FP.
    const exercises: Exercise[] = [
      makeExercise({
        sets: [
          makeSet({ reps: 10, weight: 135 }),
          makeSet({ reps: 10, weight: 135 }),
          makeSet({ reps: 10, weight: 135 }),
        ],
      }),
    ];

    const summary = calculateWorkoutSummary(exercises, 600, 0, 'normal');

    expect(summary.breakdown.volumeBonus).toBe(3); // 30 reps / 10
  });

  it('applies relative scaling when a baseline is provided', () => {
    // Baseline = 1000 (e.g. 100 lb × 10 reps historical max).
    // Session max = 135 × 10 = 1350.
    // % above baseline = (1350/1000 - 1) × 100 = 35%.
    // Expected volume FP = 35.
    const exercises: Exercise[] = [
      makeExercise({
        id: 'bench-press',
        sets: [makeSet({ reps: 10, weight: 135 })],
      }),
    ];
    const baselines = { 'bench-press': 1000 };

    const summary = calculateWorkoutSummary(exercises, 600, 0, 'normal', baselines);

    expect(summary.breakdown.volumeBonus).toBe(35);
    // 100 base + 35 volume = 135
    expect(summary.totalFP).toBe(135);
  });

  it('caps total volume bonus at maxBonusPerSession (50)', () => {
    // Baseline = 100. Session max = 200. % above = 100%. Would be +100 FP uncapped.
    // Should be capped at 50 (FP_CONFIG.volume.maxBonusPerSession).
    const exercises: Exercise[] = [
      makeExercise({
        id: 'bench-press',
        sets: [makeSet({ reps: 10, weight: 200 })],
      }),
    ];
    const baselines = { 'bench-press': 100 };

    const summary = calculateWorkoutSummary(exercises, 600, 0, 'normal', baselines);

    expect(summary.breakdown.volumeBonus).toBe(50);
  });

  it('handles mixed baseline/no-baseline exercises within one session', () => {
    // Exercise 1: has baseline (relative scaling).
    // Exercise 2: no baseline (absolute fallback).
    const exercises: Exercise[] = [
      makeExercise({
        id: 'bench-press',
        sets: [makeSet({ reps: 10, weight: 110 })], // session max 1100; +10% over baseline 1000 → +10
      }),
      makeExercise({
        id: 'squat',
        sets: [makeSet({ reps: 10, weight: null })], // absolute: 10 reps → +1
      }),
    ];
    const baselines = { 'bench-press': 1000 };

    const summary = calculateWorkoutSummary(exercises, 600, 0, 'normal', baselines);

    // 10 (relative) + 1 (absolute) = 11 volume FP
    expect(summary.breakdown.volumeBonus).toBe(11);
  });

  it('ignores baseline when session max does not exceed it (no negative FP)', () => {
    // Baseline 2000, session max 1500 → below baseline. Should contribute 0, not negative.
    const exercises: Exercise[] = [
      makeExercise({
        id: 'bench-press',
        sets: [makeSet({ reps: 10, weight: 150 })], // session max 1500
      }),
    ];
    const baselines = { 'bench-press': 2000 };

    const summary = calculateWorkoutSummary(exercises, 600, 0, 'normal', baselines);

    expect(summary.breakdown.volumeBonus).toBe(0);
  });
});

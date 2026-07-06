// =============================================================================
// IronQuest PR Store Unit Tests
// =============================================================================
// Tests for personal record tracking and detection

import { appStorage } from '@/utils/storage';
import { usePRStore } from '../prStore';

// Mock dependencies
jest.mock('@/utils/storage', () => ({
  appStorage: {
    getJSON: jest.fn(),
    setJSON: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  STORAGE_KEYS: {
    PR: {
      FULL_STATE: 'pr.full_state',
    },
  },
}));

describe('PR Store', () => {
  beforeEach(() => {
    // Reset store before each test
    usePRStore.getState().clearAll();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Record PR
  // ---------------------------------------------------------------------------

  describe('recordPR', () => {
    it('should create new PR record for first time exercise', () => {
      const { recordPR, records } = usePRStore.getState();

      const result = recordPR('bench-press', 135, 10);

      expect(result.isWeightPR).toBe(true);
      expect(result.isRepPR).toBe(true);

      const record = usePRStore.getState().records['bench-press::lb'];
      expect(record).toBeDefined();
      expect(record?.maxWeight).toBe(135);
      expect(record?.maxRepsAtWeight[135]).toBe(10);
    });

    it('should detect weight PR when exceeding previous max', () => {
      const { recordPR } = usePRStore.getState();

      // First set
      recordPR('bench-press', 135, 10);

      // Second set with heavier weight
      const result = recordPR('bench-press', 155, 8);

      expect(result.isWeightPR).toBe(true);
      expect(result.isRepPR).toBe(true);

      const record = usePRStore.getState().records['bench-press::lb'];
      expect(record?.maxWeight).toBe(155);
    });

    it('should detect rep PR at same weight', () => {
      const { recordPR } = usePRStore.getState();

      // First set
      recordPR('bench-press', 135, 8);

      // Same weight, more reps
      const result = recordPR('bench-press', 135, 12);

      expect(result.isWeightPR).toBe(false); // Same weight
      expect(result.isRepPR).toBe(true); // More reps

      const record = usePRStore.getState().records['bench-press::lb'];
      expect(record?.maxRepsAtWeight[135]).toBe(12);
    });

    it('should not mark as PR if not exceeding records', () => {
      const { recordPR } = usePRStore.getState();

      // First set establishes PR
      recordPR('bench-press', 135, 10);

      // Same weight, fewer reps - not a PR
      const result = recordPR('bench-press', 135, 8);

      expect(result.isWeightPR).toBe(false);
      expect(result.isRepPR).toBe(false);
    });

    it('should handle multiple exercises independently', () => {
      const { recordPR } = usePRStore.getState();

      const result1 = recordPR('bench-press', 135, 10);
      const result2 = recordPR('squat', 225, 8);

      expect(result1.isWeightPR).toBe(true);
      expect(result2.isWeightPR).toBe(true);

      const records = usePRStore.getState().records;
      expect(records['bench-press::lb']?.maxWeight).toBe(135);
      expect(records['squat::lb']?.maxWeight).toBe(225);
    });

    it('should persist PR state after recording', () => {
      const { recordPR } = usePRStore.getState();

      recordPR('bench-press', 135, 10);

      expect(appStorage.setJSON).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Check PR
  // ---------------------------------------------------------------------------

  describe('checkPR', () => {
    it('should return PR flags for new exercise', () => {
      const { checkPR } = usePRStore.getState();

      const result = checkPR('new-exercise', 100, 10);

      expect(result.isWeightPR).toBe(true);
      expect(result.isRepPR).toBe(true);
      expect(result.previousMaxWeight).toBeNull();
      expect(result.previousMaxReps).toBeNull();
    });

    it('should not mark as weight PR if lower than max', () => {
      const { checkPR, recordPR } = usePRStore.getState();

      // First establish a PR
      recordPR('bench-press', 135, 10);

      // Check lower weight - should NOT be a weight PR
      const result = checkPR('bench-press', 125, 8);

      expect(result.isWeightPR).toBe(false); // Lower weight than max (135)
      expect(result.isRepPR).toBe(true); // But IS a rep PR at weight 125 (first time at this weight)
    });

    it('should return previous max values when new PR detected', () => {
      const { checkPR, recordPR } = usePRStore.getState();

      // Establish initial PR
      recordPR('bench-press', 135, 10);

      // Check heavier weight
      const result = checkPR('bench-press', 155, 8);

      expect(result.isWeightPR).toBe(true);
      expect(result.previousMaxWeight).toBe(135);
    });
  });

  // ---------------------------------------------------------------------------
  // Get Exercise PR
  // ---------------------------------------------------------------------------

  describe('getExercisePR', () => {
    it('should return null for exercise without records', () => {
      const { getExercisePR } = usePRStore.getState();

      const record = getExercisePR('unknown-exercise');

      expect(record).toBeNull();
    });

    it('should return PR data for exercise with records', () => {
      const { recordPR, getExercisePR } = usePRStore.getState();

      recordPR('bench-press', 135, 10);
      recordPR('bench-press', 155, 8);

      const record = getExercisePR('bench-press');

      expect(record).not.toBeNull();
      expect(record?.maxWeight).toBe(155);
      expect(record?.maxRepsAtWeight[135]).toBe(10);
      expect(record?.maxRepsAtWeight[155]).toBe(8);
      expect(record?.totalPRs).toBe(2);
    });
  });

  // ---------------------------------------------------------------------------
  // Hydration
  // ---------------------------------------------------------------------------

  describe('hydrate', () => {
    it('should restore PR state from storage', async () => {
      const mockState = {
        records: {
          'bench-press': {
            exerciseId: 'bench-press',
            maxWeight: 225,
            maxWeightDate: '2024-01-15T10:00:00Z',
            maxRepsAtWeight: { 135: 15, 185: 10, 225: 5 },
            maxRepsDate: '2024-01-15T10:00:00Z',
            totalPRs: 3,
          },
        },
        recentPRs: [],
        totalPRCount: 3,
      };

      (appStorage.getJSON as jest.Mock).mockResolvedValue(mockState);

      const { hydrate } = usePRStore.getState();
      await hydrate();

      const record = usePRStore.getState().getExercisePR('bench-press');
      expect(record?.maxWeight).toBe(225);
      expect(record?.totalPRs).toBe(3);
    });

    it('should handle empty storage gracefully', async () => {
      (appStorage.getJSON as jest.Mock).mockResolvedValue(undefined);

      const { hydrate, records } = usePRStore.getState();
      await hydrate();

      expect(Object.keys(usePRStore.getState().records)).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Clear All
  // ---------------------------------------------------------------------------

  describe('clearAll', () => {
    it('should clear all PR records', () => {
      const { recordPR, clearAll } = usePRStore.getState();

      recordPR('bench-press', 135, 10);
      recordPR('squat', 225, 8);

      clearAll();

      const state = usePRStore.getState();
      expect(Object.keys(state.records)).toHaveLength(0);
      expect(state.totalPRCount).toBe(0);
    });
  });
});

// -----------------------------------------------------------------------------
// Unit-aware PRs (issue #42)
// -----------------------------------------------------------------------------

describe('unit-aware PR tracking (issue #42)', () => {
  beforeEach(() => {
    usePRStore.getState().clearAll();
  });

  it('tracks lb and kg records for the same exercise independently', () => {
    const store = usePRStore.getState();

    store.recordPR('bench', 135, 5, 'lb');
    // 100 kg is heavier in the real world, but it must be a FIRST record in
    // the kg lane, not a comparison against the 135 lb record.
    const kgResult = store.recordPR('bench', 100, 5, 'kg');
    expect(kgResult.isWeightPR).toBe(true);

    expect(usePRStore.getState().getExercisePR('bench', 'lb')?.maxWeight).toBe(135);
    expect(usePRStore.getState().getExercisePR('bench', 'kg')?.maxWeight).toBe(100);
  });

  it('never treats a kg number as beating an lb record', () => {
    const store = usePRStore.getState();

    store.recordPR('squat', 225, 5, 'lb');
    store.recordPR('squat', 60, 5, 'kg');

    // A later, heavier kg set must not touch the lb record.
    const check = usePRStore.getState().checkPR('squat', 226, 1, 'kg');
    expect(check.isWeightPR).toBe(true); // vs the 60 kg record
    expect(usePRStore.getState().getExercisePR('squat', 'lb')?.maxWeight).toBe(225);
  });

  it('defaults to lb when no unit passed (pre-#42 call sites)', () => {
    const store = usePRStore.getState();
    store.recordPR('row', 100, 8);
    expect(usePRStore.getState().getExercisePR('row')?.unit).toBe('lb');
  });

  it('migrates legacy bare-exerciseId records to the lb lane on hydrate', async () => {
    const legacy = {
      records: {
        deadlift: {
          exerciseId: 'deadlift',
          maxWeight: 315,
          maxWeightDate: '2026-06-01T00:00:00.000Z',
          maxRepsAtWeight: { 315: 3 },
          maxRepsDate: '2026-06-01T00:00:00.000Z',
          totalPRs: 4,
        },
      },
      recentPRs: [],
      totalPRCount: 4,
    };
    (appStorage.getJSON as jest.Mock).mockResolvedValueOnce(legacy);

    await usePRStore.getState().hydrate();

    const migrated = usePRStore.getState().getExercisePR('deadlift', 'lb');
    expect(migrated?.maxWeight).toBe(315);
    expect(migrated?.unit).toBe('lb');
    expect(usePRStore.getState().getExercisePR('deadlift', 'kg')).toBeNull();
  });
});

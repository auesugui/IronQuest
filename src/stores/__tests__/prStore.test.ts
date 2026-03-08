// =============================================================================
// IronQuest PR Store Unit Tests
// =============================================================================
// Tests for personal record tracking and detection

import { usePRStore } from '../prStore';
import { appStorage, STORAGE_KEYS } from '@/utils/storage';

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

      const record = usePRStore.getState().records['bench-press'];
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

      const record = usePRStore.getState().records['bench-press'];
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

      const record = usePRStore.getState().records['bench-press'];
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
      expect(records['bench-press']?.maxWeight).toBe(135);
      expect(records['squat']?.maxWeight).toBe(225);
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

    it('should not mark as PR without existing record', () => {
      const { checkPR, recordPR } = usePRStore.getState();

      // First establish a PR
      recordPR('bench-press', 135, 10);

      // Check without recording
      const result = checkPR('bench-press', 125, 8);

      expect(result.isWeightPR).toBe(false); // Lower weight
      expect(result.isRepPR).toBe(false); // Lower reps at this weight
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

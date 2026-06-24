// =============================================================================
// IronQuest Baseline Store Unit Tests
// =============================================================================
// Covers the per-exercise rolling baseline used by the FP engine's relative
// volume scaling. baselineAdjustmentSessions = 3 in FP_CONFIG.

import { appStorage } from '@/utils/storage';
import { useBaselineStore } from '../baselineStore';

jest.mock('@/utils/storage', () => ({
  appStorage: {
    getJSON: jest.fn(),
    setJSON: jest.fn(),
    delete: jest.fn(),
  },
  STORAGE_KEYS: {
    BASELINE: { FULL_STATE: 'baseline.full_state' },
  },
}));

describe('Baseline Store', () => {
  beforeEach(() => {
    useBaselineStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('getBaseline — pre-baseline (fewer than 3 sessions)', () => {
    it('returns null when no sessions have been recorded', () => {
      expect(useBaselineStore.getState().getBaseline('bench-press')).toBeNull();
    });

    it('returns null after 1 session', () => {
      useBaselineStore.getState().recordSession('bench-press', 1000);
      expect(useBaselineStore.getState().getBaseline('bench-press')).toBeNull();
    });

    it('returns null after 2 sessions', () => {
      const store = useBaselineStore.getState();
      store.recordSession('bench-press', 1000);
      store.recordSession('bench-press', 1100);
      expect(useBaselineStore.getState().getBaseline('bench-press')).toBeNull();
    });
  });

  describe('getBaseline — post-baseline (3+ sessions)', () => {
    it('returns the average once 3 sessions are recorded', () => {
      const store = useBaselineStore.getState();
      store.recordSession('bench-press', 1000);
      store.recordSession('bench-press', 1100);
      store.recordSession('bench-press', 1200);
      // avg(1000, 1100, 1200) = 1100
      expect(useBaselineStore.getState().getBaseline('bench-press')).toBe(1100);
    });

    it('uses a rolling window — only the last 3 sessions count', () => {
      const store = useBaselineStore.getState();
      store.recordSession('bench-press', 1000);
      store.recordSession('bench-press', 1100);
      store.recordSession('bench-press', 1200);
      store.recordSession('bench-press', 1500); // pushes 1000 out
      // avg(1100, 1200, 1500) = 1266.666...
      expect(useBaselineStore.getState().getBaseline('bench-press')).toBeCloseTo(1266.666, 1);
    });
  });

  describe('recordSession — input validation', () => {
    it('ignores zero or negative volumes', () => {
      useBaselineStore.getState().recordSession('bench-press', 0);
      useBaselineStore.getState().recordSession('bench-press', -100);
      expect(useBaselineStore.getState().getSessionMaxes('bench-press')).toEqual([]);
    });

    it('ignores NaN and Infinity', () => {
      useBaselineStore.getState().recordSession('bench-press', Number.NaN);
      useBaselineStore.getState().recordSession('bench-press', Number.POSITIVE_INFINITY);
      expect(useBaselineStore.getState().getSessionMaxes('bench-press')).toEqual([]);
    });

    it('persists state to storage on every record', () => {
      useBaselineStore.getState().recordSession('bench-press', 1000);
      expect(appStorage.setJSON).toHaveBeenCalledWith(
        'baseline.full_state',
        expect.objectContaining({
          baselines: expect.objectContaining({
            'bench-press': expect.objectContaining({ sessionMaxes: [1000] }),
          }),
        })
      );
    });
  });

  describe('exercise isolation', () => {
    it('tracks exercises independently', () => {
      const store = useBaselineStore.getState();
      store.recordSession('bench-press', 1000);
      store.recordSession('squat', 2000);
      store.recordSession('bench-press', 1100);

      expect(useBaselineStore.getState().getSessionMaxes('bench-press')).toEqual([1000, 1100]);
      expect(useBaselineStore.getState().getSessionMaxes('squat')).toEqual([2000]);
    });
  });

  describe('clearExercise / clearAll', () => {
    it('clearExercise removes one exercise without touching others', () => {
      const store = useBaselineStore.getState();
      store.recordSession('bench-press', 1000);
      store.recordSession('squat', 2000);

      useBaselineStore.getState().clearExercise('bench-press');

      expect(useBaselineStore.getState().getSessionMaxes('bench-press')).toEqual([]);
      expect(useBaselineStore.getState().getSessionMaxes('squat')).toEqual([2000]);
    });

    it('clearAll removes every exercise', () => {
      const store = useBaselineStore.getState();
      store.recordSession('bench-press', 1000);
      store.recordSession('squat', 2000);

      useBaselineStore.getState().clearAll();

      expect(useBaselineStore.getState().getSessionMaxes('bench-press')).toEqual([]);
      expect(useBaselineStore.getState().getSessionMaxes('squat')).toEqual([]);
    });
  });

  describe('hydrate', () => {
    it('loads baselines from storage', async () => {
      (appStorage.getJSON as jest.Mock).mockResolvedValueOnce({
        baselines: {
          'bench-press': {
            sessionMaxes: [1000, 1100, 1200],
            updatedAt: '2026-06-01T00:00:00.000Z',
          },
        },
      });

      await useBaselineStore.getState().hydrate();

      expect(useBaselineStore.getState().getBaseline('bench-press')).toBe(1100);
    });

    it('does not throw when storage is empty', async () => {
      (appStorage.getJSON as jest.Mock).mockResolvedValueOnce(null);
      await expect(useBaselineStore.getState().hydrate()).resolves.toBeUndefined();
    });
  });
});

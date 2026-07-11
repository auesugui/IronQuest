// =============================================================================
// Dev Panel Actions Unit Tests
// =============================================================================
// Three tests, per the dev-panel spec (§7): fixture shape (history screen must
// never see null FP on seeded logs), stage snap (evolutionStage + totalFPEarned
// stay consistent), and full reset (every store back to initial state).

import { FP_CONFIG } from '@/config/fp-values';
import { usePetStore } from '@/stores/petStore';
import { usePlayerStore } from '@/stores/playerStore';
import { usePRStore } from '@/stores/prStore';
import { useWorkoutHistoryStore } from '@/stores/workoutHistoryStore';
import {
  FP_PRESETS,
  STAT_PRESETS,
  devResetAll,
  devSeedHistory,
  devSeedPRs,
  devSetFP,
  devSetHunger,
  devSetPetType,
  devSetStage,
  devSetStats,
  devSetStreak,
} from '../devActions';

// Mock storage (same pattern as the store tests)
jest.mock('@/utils/storage', () => ({
  appStorage: {
    getJSON: jest.fn().mockResolvedValue(undefined),
    setJSON: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  STORAGE_KEYS: {
    PET: { FULL_STATE: 'pet.full_state' },
    PLAYER: { FULL_STATE: 'player.full_state' },
    PR: { FULL_STATE: 'pr.full_state' },
    BASELINE: { FULL_STATE: 'baseline.full_state' },
    WEIGHT_HISTORY: { FULL_STATE: 'weight_history.full_state' },
    PERSONAL_TEMPLATES: { FULL_STATE: 'personal_templates.full_state' },
    WORKOUT_HISTORY: { FULL_STATE: 'workout_history.full_state' },
    SETTINGS: { FULL_STATE: 'settings.full_state' },
    SESSION: { FULL_STATE: 'session.full_state' },
  },
}));

describe('devActions', () => {
  beforeEach(() => {
    devResetAll();
    jest.clearAllMocks();
  });

  it('seeds history logs that are fully claimed (no null FP)', () => {
    devSeedHistory();
    const { logs } = useWorkoutHistoryStore.getState();

    expect(logs).toHaveLength(5);
    for (const log of logs) {
      expect(log.claimedAt).not.toBeNull();
      expect(log.totalFP).not.toBeNull();
      expect(log.fpEarned).not.toBeNull();
      expect(log.exercises.length).toBeGreaterThan(0);
      for (const exercise of log.exercises) {
        for (const set of exercise.sets) {
          expect(set.logged).toBe(true);
        }
      }
    }
  });

  it('snaps totalFPEarned to the stage threshold on devSetStage', () => {
    devSetStage(3);

    const pet = usePetStore.getState();
    expect(pet.evolutionStage).toBe(3);
    // Stage N's threshold lives at thresholds[N - 1].
    expect(pet.totalFPEarned).toBe(FP_CONFIG.evolution.thresholds[2]);

    // Stage 4 must not index past the end of the tuple.
    devSetStage(4);
    expect(usePetStore.getState().totalFPEarned).toBe(FP_CONFIG.evolution.thresholds[3]);
  });

  it('returns every store to initial state after devResetAll', () => {
    // Seed across all four stores first.
    devSetPetType('flux');
    devSetStage(4);
    devSetStats(STAT_PRESETS.power);
    devSetHunger(15);
    devSetFP(FP_PRESETS['10k']);
    devSetStreak(7);
    devSeedPRs('lb');
    devSeedHistory();

    devResetAll();

    const pet = usePetStore.getState();
    expect(pet.id).toBe('');
    expect(pet.evolutionStage).toBe(1);
    expect(pet.totalFPEarned).toBe(0);

    const player = usePlayerStore.getState();
    expect(Object.values(player.fp).every((v) => v === 0)).toBe(true);
    expect(player.streak.current).toBe(0);

    expect(useWorkoutHistoryStore.getState().logs).toEqual([]);
    expect(usePRStore.getState().totalPRCount).toBe(0);
    expect(usePRStore.getState().records).toEqual({});
  });
});

// =============================================================================
// IronQuest Baseline Store - Per-exercise rolling baseline for relative FP scaling
// =============================================================================
// Tracks the last N session-max volumes (weight × reps) per exercise. Once an
// exercise has >= FP_CONFIG.guards.baselineAdjustmentSessions recorded, the
// baseline is the average of those session maxes and the FP engine uses it to
// scale volume bonuses relatively (see docs/02-forge-points/fp-economy.md).

import { FP_CONFIG } from '@/config/fp-values';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { create } from 'zustand';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ExerciseBaseline {
  /** Last N session-max volumes (weight × reps), oldest first. */
  sessionMaxes: number[];
  updatedAt: string;
}

interface BaselineState {
  baselines: Record<string, ExerciseBaseline>;
}

interface BaselineActions {
  /** Append a session's max volume for an exercise. Caps the rolling window. */
  recordSession: (exerciseId: string, sessionMax: number) => void;
  /**
   * Returns the baseline volume for an exercise, or null if not yet
   * established (fewer than baselineAdjustmentSessions recorded).
   */
  getBaseline: (exerciseId: string) => number | null;
  /** Raw session-max history for debugging/UI. */
  getSessionMaxes: (exerciseId: string) => number[];
  clearExercise: (exerciseId: string) => void;
  clearAll: () => void;
  hydrate: () => Promise<void>;
  reset: () => void;
}

type BaselineStore = BaselineState & BaselineActions;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const WINDOW_SIZE = FP_CONFIG.guards.baselineAdjustmentSessions;
const BASELINE_MIN_SESSIONS = FP_CONFIG.guards.baselineAdjustmentSessions;

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: BaselineState = {
  baselines: {},
};

const persistState = async (state: BaselineState) => {
  await appStorage.setJSON(STORAGE_KEYS.BASELINE.FULL_STATE, state);
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useBaselineStore = create<BaselineStore>((set, get) => ({
  ...initialState,

  recordSession: (exerciseId, sessionMax) => {
    if (!Number.isFinite(sessionMax) || sessionMax <= 0) return;
    set((state) => {
      const existing = state.baselines[exerciseId];
      const sessionMaxes = existing
        ? [...existing.sessionMaxes, sessionMax].slice(-WINDOW_SIZE)
        : [sessionMax];
      const updated: ExerciseBaseline = {
        sessionMaxes,
        updatedAt: new Date().toISOString(),
      };
      const newState = {
        baselines: { ...state.baselines, [exerciseId]: updated },
      };
      persistState(newState).catch(console.warn);
      return newState;
    });
  },

  getBaseline: (exerciseId) => {
    const entry = get().baselines[exerciseId];
    if (!entry || entry.sessionMaxes.length < BASELINE_MIN_SESSIONS) return null;
    const sum = entry.sessionMaxes.reduce((acc, v) => acc + v, 0);
    return sum / entry.sessionMaxes.length;
  },

  getSessionMaxes: (exerciseId) => {
    return get().baselines[exerciseId]?.sessionMaxes ?? [];
  },

  clearExercise: (exerciseId) => {
    set((state) => {
      const { [exerciseId]: _, ...rest } = state.baselines;
      const newState = { baselines: rest };
      persistState(newState).catch(console.warn);
      return newState;
    });
  },

  clearAll: () => {
    const newState = { ...initialState };
    set(newState);
    persistState(newState).catch(console.warn);
  },

  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<BaselineState>(STORAGE_KEYS.BASELINE.FULL_STATE);
      if (stored?.baselines) {
        set({ baselines: stored.baselines });
      }
    } catch (error) {
      console.warn('Failed to hydrate baseline store:', error);
    }
  },

  reset: () => {
    set(initialState);
  },
}));

// =============================================================================
// IronQuest Weight History Store - Remembers Last Used Weight Per Exercise
// =============================================================================

import type { ExerciseWeightHistory, WeightHistoryEntry } from '@/types';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { create } from 'zustand';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface WeightHistoryState {
  history: Record<string, ExerciseWeightHistory>;
}

interface WeightHistoryActions {
  getLastWeight: (exerciseId: string) => number | null;
  saveWeight: (exerciseId: string, weight: number) => void;
  getRecentWeights: (exerciseId: string) => WeightHistoryEntry[];
  clearExerciseHistory: (exerciseId: string) => void;
  clearAllHistory: () => void;
  hydrate: () => Promise<void>;
  reset: () => void;
}

type WeightHistoryStore = WeightHistoryState & WeightHistoryActions;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const MAX_RECENT_WEIGHTS = 5;

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: WeightHistoryState = {
  history: {},
};

// Helper to persist state
const persistState = async (state: WeightHistoryState) => {
  await appStorage.setJSON(STORAGE_KEYS.WEIGHT_HISTORY.FULL_STATE, state);
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useWeightHistoryStore = create<WeightHistoryStore>((set, get) => ({
  ...initialState,

  getLastWeight: (exerciseId) => {
    const state = get();
    const exerciseHistory = state.history[exerciseId];
    return exerciseHistory?.lastWeight ?? null;
  },

  saveWeight: (exerciseId, weight) => {
    set((state) => {
      const existingHistory = state.history[exerciseId];
      const now = new Date().toISOString();

      // Create new entry
      const newEntry: WeightHistoryEntry = {
        weight,
        timestamp: now,
      };

      // Build recent weights array
      let recentWeights: WeightHistoryEntry[];
      if (existingHistory) {
        // Prepend new entry and limit to MAX_RECENT_WEIGHTS
        recentWeights = [newEntry, ...existingHistory.recentWeights].slice(0, MAX_RECENT_WEIGHTS);
      } else {
        recentWeights = [newEntry];
      }

      // Update history
      const updatedHistory: ExerciseWeightHistory = {
        exerciseId,
        lastWeight: weight,
        recentWeights,
        updatedAt: now,
      };

      const newState = {
        history: {
          ...state.history,
          [exerciseId]: updatedHistory,
        },
      };

      persistState(newState).catch(console.warn);

      return newState;
    });
  },

  getRecentWeights: (exerciseId) => {
    const state = get();
    const exerciseHistory = state.history[exerciseId];
    return exerciseHistory?.recentWeights ?? [];
  },

  clearExerciseHistory: (exerciseId) => {
    set((state) => {
      const { [exerciseId]: _, ...remainingHistory } = state.history;

      const newState = {
        history: remainingHistory,
      };

      persistState(newState).catch(console.warn);

      return newState;
    });
  },

  clearAllHistory: () => {
    const newState = { ...initialState };
    set(newState);
    persistState(newState).catch(console.warn);
  },

  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<WeightHistoryState>(
        STORAGE_KEYS.WEIGHT_HISTORY.FULL_STATE
      );

      if (stored?.history) {
        set({
          history: stored.history,
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate weight history store:', error);
    }
  },

  reset: () => {
    set(initialState);
  },
}));

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------

export const selectLastWeight = (exerciseId: string) => (state: WeightHistoryStore) => {
  return state.history[exerciseId]?.lastWeight ?? null;
};

export const selectRecentWeights = (exerciseId: string) => (state: WeightHistoryStore) => {
  return state.history[exerciseId]?.recentWeights ?? [];
};

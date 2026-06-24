// =============================================================================
// IronQuest PR (Personal Record) Store
// =============================================================================
// Tracks personal records per exercise with persistence
// PR Types:
// - Weight PR: Heaviest weight lifted for an exercise
// - Rep PR: Most reps at a specific weight for an exercise

import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { create } from 'zustand';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ExercisePR {
  exerciseId: string;
  maxWeight: number; // Heaviest weight ever lifted
  maxWeightDate: string | null; // ISO date when achieved
  maxRepsAtWeight: Record<number, number>; // weight -> max reps
  maxRepsDate: string | null; // ISO date of most recent rep PR
  totalPRs: number; // Count of all-time PRs for this exercise
}

export interface PRState {
  records: Record<string, ExercisePR>; // exerciseId -> PR data
  recentPRs: Array<{
    exerciseId: string;
    exerciseName: string;
    type: 'weight' | 'rep';
    value: number;
    previousValue: number | null;
    date: string;
  }>;
  totalPRCount: number;
}

export interface PRActions {
  // Check if a set is a PR, returns PR type or null
  checkPR: (
    exerciseId: string,
    weight: number,
    reps: number
  ) => {
    isWeightPR: boolean;
    isRepPR: boolean;
    previousMaxWeight: number | null;
    previousMaxReps: number | null;
  };

  // Record a new PR (called after logging)
  recordPR: (
    exerciseId: string,
    weight: number,
    reps: number
  ) => {
    isWeightPR: boolean;
    isRepPR: boolean;
  };

  // Get PR data for an exercise
  getExercisePR: (exerciseId: string) => ExercisePR | null;

  // Clear all PRs (for testing)
  clearAll: () => void;

  // Hydration
  hydrate: () => Promise<void>;
}

type PRStore = PRState & PRActions;

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: PRState = {
  records: {},
  recentPRs: [],
  totalPRCount: 0,
};

// Helper to persist PR state
const persistPR = async (state: PRState) => {
  await appStorage.setJSON(STORAGE_KEYS.PR.FULL_STATE, state);
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const usePRStore = create<PRStore>((set, get) => ({
  ...initialState,

  checkPR: (exerciseId, weight, reps) => {
    const records = get().records;
    const existing = records[exerciseId];

    const result = {
      isWeightPR: false,
      isRepPR: false,
      previousMaxWeight: null as number | null,
      previousMaxReps: null as number | null,
    };

    if (!existing) {
      // First time logging this exercise - it's a PR!
      result.isWeightPR = weight > 0;
      result.isRepPR = reps > 0;
      return result;
    }

    // Check weight PR
    if (weight > 0 && weight > existing.maxWeight) {
      result.isWeightPR = true;
      result.previousMaxWeight = existing.maxWeight;
    }

    // Check rep PR at this weight
    if (weight > 0 && reps > 0) {
      const currentMaxReps = existing.maxRepsAtWeight[weight] ?? 0;
      if (reps > currentMaxReps) {
        result.isRepPR = true;
        result.previousMaxReps = currentMaxReps;
      }
    }

    return result;
  },

  recordPR: (exerciseId, weight, reps) => {
    const state = get();
    const existing = state.records[exerciseId];
    const now = new Date().toISOString();

    const result = {
      isWeightPR: false,
      isRepPR: false,
    };

    let newRecord: ExercisePR;

    if (!existing) {
      // First time - create new record
      newRecord = {
        exerciseId,
        maxWeight: weight,
        maxWeightDate: weight > 0 ? now : null,
        maxRepsAtWeight: weight > 0 && reps > 0 ? { [weight]: reps } : {},
        maxRepsDate: weight > 0 && reps > 0 ? now : null,
        totalPRs: weight > 0 ? 1 : 0,
      };
      result.isWeightPR = weight > 0;
      result.isRepPR = reps > 0;
    } else {
      // Update existing record
      newRecord = { ...existing };

      // Check weight PR
      if (weight > 0 && weight > existing.maxWeight) {
        newRecord.maxWeight = weight;
        newRecord.maxWeightDate = now;
        newRecord.totalPRs += 1;
        result.isWeightPR = true;
      }

      // Check rep PR at this weight
      if (weight > 0 && reps > 0) {
        const currentMaxReps = existing.maxRepsAtWeight[weight] || 0;
        if (reps > currentMaxReps) {
          newRecord.maxRepsAtWeight = {
            ...existing.maxRepsAtWeight,
            [weight]: reps,
          };
          newRecord.maxRepsDate = now;
          if (!result.isWeightPR) {
            // Don't double count if it's also a weight PR
            newRecord.totalPRs += 1;
          }
          result.isRepPR = true;
        }
      }
    }

    // Update state
    const newState = {
      ...state,
      records: {
        ...state.records,
        [exerciseId]: newRecord,
      },
      totalPRCount: state.totalPRCount + (result.isWeightPR || result.isRepPR ? 1 : 0),
    };

    set(newState);
    persistPR(newState).catch(console.warn);

    return result;
  },

  getExercisePR: (exerciseId) => {
    return get().records[exerciseId] || null;
  },

  clearAll: () => {
    set(initialState);
    appStorage.delete(STORAGE_KEYS.PR.FULL_STATE).catch(console.warn);
  },

  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<PRState>(STORAGE_KEYS.PR.FULL_STATE);
      if (stored) {
        set({
          records: stored.records || {},
          recentPRs: stored.recentPRs || [],
          totalPRCount: stored.totalPRCount || 0,
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate PR store:', error);
    }
  },
}));

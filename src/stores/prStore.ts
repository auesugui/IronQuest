// =============================================================================
// IronQuest PR (Personal Record) Store
// =============================================================================
// Tracks personal records per exercise with persistence
// PR Types:
// - Weight PR: Heaviest weight lifted for an exercise
// - Rep PR: Most reps at a specific weight for an exercise

import type { WeightUnit } from '@/types';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { create } from 'zustand';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ExercisePR {
  exerciseId: string;
  unit: WeightUnit; // PRs only compare within one unit (issue #42)
  maxWeight: number; // Heaviest weight ever lifted (in `unit`)
  maxWeightDate: string | null; // ISO date when achieved
  maxRepsAtWeight: Record<number, number>; // weight -> max reps
  maxRepsDate: string | null; // ISO date of most recent rep PR
  totalPRs: number; // Count of all-time PRs for this exercise
}

// Records are keyed per exercise AND unit: a 100 lb bench and a 100 kg bench
// are different records — no cross-unit comparison, no conversion.
const recordKey = (exerciseId: string, unit: WeightUnit) => `${exerciseId}::${unit}`;

export interface PRState {
  records: Record<string, ExercisePR>; // `${exerciseId}::${unit}` -> PR data
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
    reps: number,
    unit?: WeightUnit
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
    reps: number,
    unit?: WeightUnit
  ) => {
    isWeightPR: boolean;
    isRepPR: boolean;
  };

  // Get PR data for an exercise
  getExercisePR: (exerciseId: string, unit?: WeightUnit) => ExercisePR | null;

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

  checkPR: (exerciseId, weight, reps, unit = 'lb') => {
    const records = get().records;
    const existing = records[recordKey(exerciseId, unit)];

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

  recordPR: (exerciseId, weight, reps, unit = 'lb') => {
    const state = get();
    const existing = state.records[recordKey(exerciseId, unit)];
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
        unit,
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
        [recordKey(exerciseId, unit)]: newRecord,
      },
      totalPRCount: state.totalPRCount + (result.isWeightPR || result.isRepPR ? 1 : 0),
    };

    set(newState);
    persistPR(newState).catch(console.warn);

    return result;
  },

  getExercisePR: (exerciseId, unit = 'lb') => {
    return get().records[recordKey(exerciseId, unit)] || null;
  },

  clearAll: () => {
    set(initialState);
    appStorage.delete(STORAGE_KEYS.PR.FULL_STATE).catch(console.warn);
  },

  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<PRState>(STORAGE_KEYS.PR.FULL_STATE);
      if (stored) {
        // Migrate pre-#42 records: keys were bare exercise ids and all
        // weights were logged in lb. Re-key to `${exerciseId}::lb`.
        const migrated: Record<string, ExercisePR> = {};
        for (const [key, record] of Object.entries(stored.records || {})) {
          if (key.includes('::')) {
            migrated[key] = record;
          } else {
            migrated[recordKey(key, 'lb')] = { ...record, unit: record.unit ?? 'lb' };
          }
        }
        set({
          records: migrated,
          recentPRs: stored.recentPRs || [],
          totalPRCount: stored.totalPRCount || 0,
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate PR store:', error);
    }
  },
}));

// =============================================================================
// IronQuest Workout Store - Active Session, Exercises, Rest Timer
// =============================================================================

import type { Exercise, SessionIntent } from '@/types';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { create } from 'zustand';
import { usePRStore } from './prStore';
import { useSettingsStore } from './settingsStore';
import { useWeightHistoryStore } from './weightHistoryStore';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface RestTimerState {
  duration: number;
  remaining: number;
  running: boolean;
  paused: boolean;
}

interface WorkoutState {
  // Session state
  active: boolean;
  templateId: string | null;
  startedAt: number | null;
  currentExerciseIndex: number;
  exercises: Exercise[];
  intent: SessionIntent;
  gymRushActive: boolean;

  // Rest timer
  restTimer: RestTimerState;
}

interface WorkoutActions {
  // Session lifecycle
  startSession: (templateId: string, exercises: Exercise[], intent?: SessionIntent) => void;
  endSession: () => void;
  cancelSession: () => void;

  // Exercise flow
  logSet: (exerciseIndex: number, setIndex: number, reps: number, weight?: number) => void;
  editSet: (exerciseIndex: number, setIndex: number, reps: number, weight?: number) => void;
  clearSet: (exerciseIndex: number, setIndex: number) => void;
  completeExercise: (exerciseIndex: number) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  setCurrentExercise: (index: number) => void;

  // Rest timer
  startRestTimer: (duration: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  resetRestTimer: () => void;
  tickRestTimer: () => void;

  // Modifiers
  toggleGymRush: () => void;
  setIntent: (intent: SessionIntent) => void;

  // Getters (for deriving state)
  getCurrentExercise: () => Exercise | null;
  getCompletedSets: () => number;
  getTotalReps: () => number;

  // Hydration
  hydrate: () => Promise<void>;
  reset: () => void;
}

type WorkoutStore = WorkoutState & WorkoutActions;

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialRestTimer: RestTimerState = {
  duration: 90,
  remaining: 0,
  running: false,
  paused: false,
};

const initialState: WorkoutState = {
  active: false,
  templateId: null,
  startedAt: null,
  currentExerciseIndex: 0,
  exercises: [],
  intent: 'normal',
  gymRushActive: false,
  restTimer: initialRestTimer,
};

// Helper to persist session state
const persistSession = async (state: Partial<WorkoutState>) => {
  await appStorage.setJSON(STORAGE_KEYS.SESSION.FULL_STATE, state);
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  ...initialState,

  // Session lifecycle
  startSession: (templateId, exercises, intent = 'normal') => {
    const startedAt = Date.now();

    const newState: WorkoutState = {
      ...initialState,
      active: true,
      templateId,
      startedAt,
      currentExerciseIndex: 0,
      exercises,
      intent,
      gymRushActive: false,
    };

    set(newState);
    persistSession(newState).catch(console.warn);
  },

  endSession: () => {
    set(initialState);
    appStorage.delete(STORAGE_KEYS.SESSION.FULL_STATE).catch(console.warn);
  },

  cancelSession: () => {
    get().endSession();
  },

  // Exercise flow
  logSet: (exerciseIndex, setIndex, reps, weight = undefined) => {
    set((state) => {
      const exercises = [...state.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      const sets = [...exercise.sets];

      // Check for PR before recording
      let isPR = false;
      let isRepPR = false;

      if (weight !== undefined && weight !== null && weight > 0 && exercise.id) {
        // PRs compare within the unit the set was logged in (issue #42).
        const unit = useSettingsStore.getState().units;
        const prResult = usePRStore.getState().recordPR(exercise.id, weight, reps, unit);
        isPR = prResult.isWeightPR;
        isRepPR = prResult.isRepPR;
      }

      sets[setIndex] = {
        reps,
        weight: weight ?? null,
        logged: true,
        isPR,
        isRepPR,
      };

      exercise.sets = sets;
      exercises[exerciseIndex] = exercise;

      const newState = { ...state, exercises };
      persistSession(newState).catch(console.warn);

      // Save weight to history if weight is provided
      if (weight !== undefined && weight !== null) {
        const exerciseData = state.exercises[exerciseIndex];
        if (exerciseData?.id) {
          useWeightHistoryStore.getState().saveWeight(exerciseData.id, weight, useSettingsStore.getState().units);
        }
      }

      return { exercises };
    });
  },

  editSet: (exerciseIndex, setIndex, reps, weight = undefined) => {
    // Same as logSet but without triggering side effects (like rest timer)
    set((state) => {
      const exercises = [...state.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      const sets = [...exercise.sets];

      sets[setIndex] = {
        reps,
        weight: weight ?? null,
        logged: true,
        isPR: false,
        isRepPR: false,
      };

      exercise.sets = sets;
      exercises[exerciseIndex] = exercise;

      const newState = { ...state, exercises };
      persistSession(newState).catch(console.warn);

      // Keep weight history fresh so next session auto-fills the edited value
      if (weight !== undefined && weight !== null) {
        const exerciseData = state.exercises[exerciseIndex];
        if (exerciseData?.id) {
          useWeightHistoryStore.getState().saveWeight(exerciseData.id, weight, useSettingsStore.getState().units);
        }
      }

      return { exercises };
    });
  },

  clearSet: (exerciseIndex, setIndex) => {
    set((state) => {
      const exercises = [...state.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      const sets = [...exercise.sets];

      sets[setIndex] = {
        reps: 0,
        weight: null,
        logged: false,
        isPR: false,
        isRepPR: false,
      };

      exercise.sets = sets;
      exercises[exerciseIndex] = exercise;

      const newState = { ...state, exercises };
      persistSession(newState).catch(console.warn);
      return { exercises };
    });
  },

  completeExercise: (exerciseIndex) => {
    set((state) => {
      const exercises = [...state.exercises];
      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        completed: true,
      };
      const newState = { ...state, exercises };
      persistSession(newState).catch(console.warn);
      return { exercises };
    });
  },

  nextExercise: () => {
    set((state) => {
      const nextIndex = Math.min(state.currentExerciseIndex + 1, state.exercises.length - 1);
      return { currentExerciseIndex: nextIndex };
    });
  },

  previousExercise: () => {
    set((state) => {
      const prevIndex = Math.max(state.currentExerciseIndex - 1, 0);
      return { currentExerciseIndex: prevIndex };
    });
  },

  setCurrentExercise: (index) => {
    set((state) => {
      if (index >= 0 && index < state.exercises.length) {
        return { currentExerciseIndex: index };
      }
      return state;
    });
  },

  // Rest timer
  startRestTimer: (duration) => {
    set({
      restTimer: {
        duration,
        remaining: duration,
        running: true,
        paused: false,
      },
    });
  },

  pauseRestTimer: () => {
    set((state) => ({
      restTimer: { ...state.restTimer, paused: true, running: false },
    }));
  },

  resumeRestTimer: () => {
    set((state) => ({
      restTimer: { ...state.restTimer, paused: false, running: true },
    }));
  },

  resetRestTimer: () => {
    set({ restTimer: initialRestTimer });
  },

  tickRestTimer: () => {
    set((state) => {
      if (!state.restTimer.running || state.restTimer.paused) {
        return state;
      }

      const remaining = Math.max(0, state.restTimer.remaining - 1);

      if (remaining === 0) {
        return {
          restTimer: {
            ...state.restTimer,
            remaining: 0,
            running: false,
          },
        };
      }

      return {
        restTimer: { ...state.restTimer, remaining },
      };
    });
  },

  // Modifiers
  toggleGymRush: () => {
    set((state) => ({ gymRushActive: !state.gymRushActive }));
  },

  setIntent: (intent) => {
    set({ intent });
  },

  // Getters
  getCurrentExercise: () => {
    const state = get();
    if (!state.active || state.exercises.length === 0) {
      return null;
    }
    return state.exercises[state.currentExerciseIndex] ?? null;
  },

  getCompletedSets: () => {
    const state = get();
    return state.exercises.flatMap((e) => e.sets.filter((s) => s.logged)).length;
  },

  getTotalReps: () => {
    const state = get();
    return state.exercises
      .flatMap((e) => e.sets.filter((s) => s.logged))
      .reduce((sum, s) => sum + (s.reps || 0), 0);
  },

  // Hydration
  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<Partial<WorkoutState>>(
        STORAGE_KEYS.SESSION.FULL_STATE
      );
      if (stored?.active) {
        set({
          active: stored.active,
          templateId: stored.templateId ?? null,
          startedAt: stored.startedAt ?? null,
          currentExerciseIndex: stored.currentExerciseIndex ?? 0,
          exercises: stored.exercises ?? [],
          intent: stored.intent ?? 'normal',
          gymRushActive: stored.gymRushActive ?? false,
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate workout store:', error);
    }
  },

  reset: () => {
    set(initialState);
    appStorage.delete(STORAGE_KEYS.SESSION.FULL_STATE).catch(console.warn);
  },
}));

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------

export const selectSessionDuration = (state: WorkoutStore) => {
  if (!state.startedAt) return 0;
  return Math.floor((Date.now() - state.startedAt) / 1000 / 60);
};

export const selectExerciseProgress = (state: WorkoutStore) => {
  const completed = state.exercises.filter((e) => e.completed).length;
  const total = state.exercises.length;
  return { completed, total, percentage: total > 0 ? completed / total : 0 };
};

export const selectIsRestTimerComplete = (state: WorkoutStore) => {
  return state.restTimer.remaining === 0 && !state.restTimer.running;
};

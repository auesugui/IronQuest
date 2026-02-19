// =============================================================================
// IronQuest Player Store - Profile, FP, Streak
// =============================================================================

import { create } from 'zustand';
import { appStorage, STORAGE_KEYS } from '@/utils/storage';
import type { FPBalances, StreakData, PlayerProfile, Player } from '@/types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface PlayerState {
  profile: PlayerProfile;
  fp: FPBalances;
  streak: StreakData;
  achievements: string[];
  totalWorkouts: number;
}

interface PlayerActions {
  // FP Actions
  addFP: (type: keyof FPBalances, amount: number) => void;
  addMultipleFP: (amounts: Partial<FPBalances>) => void;
  spendFP: (type: keyof FPBalances, amount: number) => boolean;
  setFP: (fp: FPBalances) => void;

  // Streak Actions
  updateStreak: (workedOutToday: boolean) => void;
  resetStreak: () => void;

  // Workout Actions
  incrementWorkoutCount: () => void;

  // Profile Actions
  updateProfile: (profile: Partial<PlayerProfile>) => void;

  // Achievement Actions
  unlockAchievement: (id: string) => boolean;
  removeAchievement: (id: string) => void;

  // Hydration
  hydrate: () => Promise<void>;
  reset: () => void;
}

type PlayerStore = PlayerState & PlayerActions;

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: PlayerState = {
  profile: {
    name: 'Iron Master',
    avatar: null,
    createdAt: new Date().toISOString(),
  },
  fp: {
    generic: 0,
    power: 0,
    guard: 0,
    speed: 0,
    vigor: 0,
    focus: 0,
    spirit: 0,
  },
  streak: {
    current: 0,
    longest: 0,
    lastWorkoutDate: null,
  },
  achievements: [],
  totalWorkouts: 0,
};

// Helper to persist state
const persistState = async (state: PlayerState) => {
  await appStorage.setJSON(STORAGE_KEYS.PLAYER.FULL_STATE, state);
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,

  // FP Actions
  addFP: (type, amount) => {
    set((state) => {
      const newFP = { ...state.fp };
      newFP[type] = Math.max(0, newFP[type] + amount);
      const newState = { ...state, fp: newFP };
      persistState(newState).catch(console.warn);
      return { fp: newFP };
    });
  },

  addMultipleFP: (amounts) => {
    set((state) => {
      const newFP = { ...state.fp };
      for (const [type, amount] of Object.entries(amounts)) {
        if (amount && type in newFP) {
          newFP[type as keyof FPBalances] = Math.max(0, newFP[type as keyof FPBalances] + amount);
        }
      }
      const newState = { ...state, fp: newFP };
      persistState(newState).catch(console.warn);
      return { fp: newFP };
    });
  },

  spendFP: (type, amount) => {
    const state = get();
    if (state.fp[type] < amount) {
      return false;
    }

    set((state) => {
      const newFP = { ...state.fp };
      newFP[type] = Math.max(0, newFP[type] - amount);
      const newState = { ...state, fp: newFP };
      persistState(newState).catch(console.warn);
      return { fp: newFP };
    });

    return true;
  },

  setFP: (fp) => {
    set({ fp });
    persistState({ ...get(), fp }).catch(console.warn);
  },

  // Streak Actions
  updateStreak: (workedOutToday) => {
    const today = new Date().toISOString().split('T')[0];
    const state = get();

    if (!workedOutToday) {
      const lastWorkout = state.streak.lastWorkoutDate;
      if (lastWorkout) {
        const lastDate = new Date(lastWorkout);
        const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 1) {
          get().resetStreak();
        }
      }
      return;
    }

    const lastWorkout = state.streak.lastWorkoutDate;
    let newCurrent = state.streak.current;

    if (lastWorkout !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastWorkout === yesterday) {
        newCurrent = state.streak.current + 1;
      } else if (!lastWorkout) {
        newCurrent = 1;
      } else {
        newCurrent = 1;
      }
    }

    const newStreak: StreakData = {
      current: newCurrent,
      longest: Math.max(state.streak.longest, newCurrent),
      lastWorkoutDate: today,
    };

    set({ streak: newStreak });
    persistState({ ...get(), streak: newStreak }).catch(console.warn);
  },

  resetStreak: () => {
    const newStreak: StreakData = {
      current: 0,
      longest: get().streak.longest,
      lastWorkoutDate: null,
    };

    set({ streak: newStreak });
    persistState({ ...get(), streak: newStreak }).catch(console.warn);
  },

  // Workout Actions
  incrementWorkoutCount: () => {
    set((state) => {
      const newCount = state.totalWorkouts + 1;
      const newState = { ...state, totalWorkouts: newCount };
      persistState(newState).catch(console.warn);
      return { totalWorkouts: newCount };
    });
  },

  // Profile Actions
  updateProfile: (profile) => {
    set((state) => ({
      profile: { ...state.profile, ...profile },
    }));
    persistState(get()).catch(console.warn);
  },

  // Achievement Actions
  unlockAchievement: (id) => {
    const state = get();
    if (state.achievements.includes(id)) {
      return false;
    }

    set((state) => ({
      achievements: [...state.achievements, id],
    }));
    persistState(get()).catch(console.warn);
    return true;
  },

  removeAchievement: (id) => {
    set((state) => ({
      achievements: state.achievements.filter((a) => a !== id),
    }));
    persistState(get()).catch(console.warn);
  },

  // Hydration
  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<Partial<PlayerState>>(STORAGE_KEYS.PLAYER.FULL_STATE);
      if (stored) {
        set({
          profile: stored.profile ?? initialState.profile,
          fp: stored.fp ?? initialState.fp,
          streak: stored.streak ?? initialState.streak,
          achievements: stored.achievements ?? initialState.achievements,
          totalWorkouts: stored.totalWorkouts ?? initialState.totalWorkouts,
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate player store:', error);
    }
  },

  reset: () => {
    set(initialState);
    appStorage.delete(STORAGE_KEYS.PLAYER.FULL_STATE).catch(console.warn);
  },
}));

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------

export const selectTotalFP = (state: PlayerStore) =>
  Object.values(state.fp).reduce((sum, val) => sum + val, 0);

export const selectCanAfford = (type: keyof FPBalances, amount: number) => (state: PlayerStore) =>
  state.fp[type] >= amount;

export const selectStreakDays = (state: PlayerStore) => state.streak.current;

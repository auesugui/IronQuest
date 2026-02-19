// =============================================================================
// IronQuest Settings Store - App Preferences
// =============================================================================

import { create } from 'zustand';
import { appStorage, STORAGE_KEYS } from '@/utils/storage';
import type { Settings, NotificationSettings } from '@/types';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SettingsActions {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  reset: () => void;
  hydrate: () => Promise<void>;
}

type SettingsStore = Settings & SettingsActions;

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const initialState: Settings = {
  theme: 'system',
  haptics: true,
  notifications: {
    streakReminder: true,
    petHunger: true,
    weeklySummary: false,
  },
  units: 'lb',
  reducedMotion: false,
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialState,

  updateSetting: (key, value) => {
    set({ [key]: value });

    // Persist to storage (async, fire-and-forget)
    appStorage.setJSON(STORAGE_KEYS.SETTINGS.FULL_STATE, {
      ...get(),
      [key]: value,
    }).catch(console.warn);
  },

  updateNotifications: (notifications) => {
    set((state) => ({
      notifications: { ...state.notifications, ...notifications },
    }));

    const current = get();
    appStorage.setJSON(STORAGE_KEYS.SETTINGS.FULL_STATE, current).catch(console.warn);
  },

  reset: () => {
    set(initialState);
    appStorage.delete(STORAGE_KEYS.SETTINGS.FULL_STATE).catch(console.warn);
  },

  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<Partial<Settings>>(STORAGE_KEYS.SETTINGS.FULL_STATE);
      if (stored) {
        set({
          theme: stored.theme ?? initialState.theme,
          haptics: stored.haptics ?? initialState.haptics,
          units: stored.units ?? initialState.units,
          reducedMotion: stored.reducedMotion ?? initialState.reducedMotion,
          notifications: stored.notifications ?? initialState.notifications,
        });
      }
    } catch (error) {
      console.warn('Failed to hydrate settings:', error);
    }
  },
}));

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------

export const selectTheme = (state: SettingsStore) => state.theme;
export const selectHapticsEnabled = (state: SettingsStore) => state.haptics;
export const selectReducedMotion = (state: SettingsStore) => state.reducedMotion;

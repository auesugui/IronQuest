// =============================================================================
// IronQuest Storage Utility - AsyncStorage with MMKV fallback for dev builds
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// MMKV is optional - only works in custom dev builds, not Expo Go or Web
let MMKV: any = null;
let storage: any = null;

// On web, always use AsyncStorage (localStorage under the hood)
// MMKV doesn't work on web
if (Platform.OS !== 'web') {
  try {
    const mmkvModule = require('react-native-mmkv');
    MMKV = mmkvModule.MMKV;
    storage = new MMKV({
      id: 'ironquest-storage',
    });
    console.log('MMKV storage initialized');
  } catch (e) {
    // MMKV not available (Expo Go) - use AsyncStorage fallback
    console.log('MMKV not available, using AsyncStorage fallback');
  }
} else {
  console.log('Web platform detected, using AsyncStorage');
}

// Storage Keys
export const STORAGE_KEYS = {
  // Pet stats
  PET_STATS: {
    POWER: 'pet.stats.power',
    GUARD: 'pet.stats.guard',
    SPEED: 'pet.stats.speed',
    VIGOR: 'pet.stats.vigor',
    FOCUS: 'pet.stats.focus',
    SPIRIT: 'pet.stats.spirit',
  },
  // Pet state
  PET: {
    HUNGER: 'pet.hunger',
    MOOD: 'pet.mood',
    EVOLUTION_STAGE: 'pet.evolution_stage',
    EVO_XP: 'pet.evo_xp',
    TYPE: 'pet.type',
    VISUAL_SEED: 'pet.visual_seed',
    ABILITIES: 'pet.abilities',
    COSMETICS: 'pet.cosmetics',
    FULL_STATE: 'pet.full_state',
  },
  // Player FP
  PLAYER_FP: {
    GENERIC: 'player.fp.generic',
    POWER: 'player.fp.power',
    GUARD: 'player.fp.guard',
    SPEED: 'player.fp.speed',
    VIGOR: 'player.fp.vigor',
    FOCUS: 'player.fp.focus',
    SPIRIT: 'player.fp.spirit',
    FULL_STATE: 'player.fp.full_state',
  },
  // Player streak
  STREAK: {
    CURRENT: 'streak.current',
    LONGEST: 'streak.longest',
    LAST_WORKOUT: 'streak.last_workout',
    FULL_STATE: 'streak.full_state',
  },
  // Session
  SESSION: {
    ACTIVE: 'session.active',
    TEMPLATE_ID: 'session.template_id',
    STARTED_AT: 'session.started_at',
    FULL_STATE: 'session.full_state',
  },
  // Settings
  SETTINGS: {
    THEME: 'settings.theme',
    HAPTICS: 'settings.haptics',
    NOTIFICATIONS: 'settings.notifications',
    UNITS: 'settings.units',
    REDUCED_MOTION: 'settings.reduced_motion',
    FULL_STATE: 'settings.full_state',
  },
  // Tower
  TOWER: {
    CURRENT_FLOOR: 'tower.current_floor',
    BEST_FLOOR: 'tower.best_floor',
    ATTEMPTS_REMAINING: 'tower.attempts_remaining',
    LAST_RESET: 'tower.last_reset',
    FULL_STATE: 'tower.full_state',
  },
  // Weight History
  WEIGHT_HISTORY: {
    FULL_STATE: 'weight_history.full_state',
  },
  // Player profile
  PLAYER: {
    PROFILE: 'player.profile',
    ACHIEVEMENTS: 'player.achievements',
    FULL_STATE: 'player.full_state',
  },
  // Misc
  SCHEMA_VERSION: 'schema_version',
} as const;

// AsyncStorage Keys (for history/bulk data)
export const ASYNC_KEYS = {
  WORKOUT_HISTORY: '@workout_history',
  PERSONAL_BASELINES: '@personal_baselines',
  TEMPLATES: '@templates',
} as const;

// =============================================================================
// Unified Storage API (works with both MMKV and AsyncStorage)
// =============================================================================

export const appStorage = {
  // Check if MMKV is available
  isMMKVAvailable: (): boolean => storage !== null,

  // Getters
  getString: async (key: string): Promise<string | undefined> => {
    if (storage) {
      return storage.getString(key);
    }
    const value = await AsyncStorage.getItem(key);
    return value ?? undefined;
  },

  getNumber: async (key: string): Promise<number | undefined> => {
    if (storage) {
      return storage.getNumber(key);
    }
    const value = await AsyncStorage.getItem(key);
    return value ? parseFloat(value) : undefined;
  },

  getBoolean: async (key: string): Promise<boolean | undefined> => {
    if (storage) {
      return storage.getBoolean(key);
    }
    const value = await AsyncStorage.getItem(key);
    return value === 'true' ? true : value === 'false' ? false : undefined;
  },

  getJSON: async <T>(key: string): Promise<T | undefined> => {
    if (storage) {
      const value = storage.getString(key);
      return value ? JSON.parse(value) : undefined;
    }
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  },

  // Setters
  setString: async (key: string, value: string): Promise<void> => {
    if (storage) {
      storage.set(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  setNumber: async (key: string, value: number): Promise<void> => {
    if (storage) {
      storage.set(key, value);
    } else {
      await AsyncStorage.setItem(key, String(value));
    }
  },

  setBoolean: async (key: string, value: boolean): Promise<void> => {
    if (storage) {
      storage.set(key, value);
    } else {
      await AsyncStorage.setItem(key, value ? 'true' : 'false');
    }
  },

  setJSON: async <T>(key: string, value: T): Promise<void> => {
    const serialized = JSON.stringify(value);
    if (storage) {
      storage.set(key, serialized);
    } else {
      await AsyncStorage.setItem(key, serialized);
    }
  },

  // Delete
  delete: async (key: string): Promise<void> => {
    if (storage) {
      storage.delete(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  // Clear all
  clearAll: async (): Promise<void> => {
    if (storage) {
      storage.clearAll();
    } else {
      await AsyncStorage.clear();
    }
  },

  // Check exists
  contains: async (key: string): Promise<boolean> => {
    if (storage) {
      return storage.contains(key);
    }
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  },
};

// =============================================================================
// Storage Migration
// =============================================================================

const SCHEMA_VERSION = 1;

export const migrateStorage = async (): Promise<void> => {
  const currentVersion = (await appStorage.getNumber(STORAGE_KEYS.SCHEMA_VERSION)) ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    // Future migrations go here
    // if (currentVersion < 2) { ... }

    await appStorage.setNumber(STORAGE_KEYS.SCHEMA_VERSION, SCHEMA_VERSION);
  }
};

// Legacy exports for backward compatibility with existing stores
export const mmkv = {
  getString: (key: string): string | undefined => storage?.getString(key),
  getNumber: (key: string): number | undefined => storage?.getNumber(key),
  getBoolean: (key: string): boolean | undefined => storage?.getBoolean(key),
  getJSON: <T>(key: string): T | undefined => {
    const value = storage?.getString(key);
    return value ? JSON.parse(value) : undefined;
  },
  setString: (key: string, value: string): void => storage?.set(key, value),
  setNumber: (key: string, value: number): void => storage?.set(key, value),
  setBoolean: (key: string, value: boolean): void => storage?.set(key, value),
  setJSON: <T>(key: string, value: T): void => storage?.set(key, JSON.stringify(value)),
  delete: (key: string): void => storage?.delete(key),
  clearAll: (): void => storage?.clearAll(),
  contains: (key: string): boolean => storage?.contains(key) ?? false,
};

export const asyncStorage = {
  get: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  set: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  delete: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },
  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },
  getMultiple: async <T>(keys: string[]): Promise<Record<string, T | null>> => {
    const pairs = await AsyncStorage.multiGet(keys);
    const result: Record<string, T | null> = {};
    for (const [key, value] of pairs) {
      if (key) {
        result[key] = value ? JSON.parse(value) : null;
      }
    }
    return result;
  },
  setMultiple: async <T>(pairs: Record<string, T>): Promise<void> => {
    const entries = Object.entries(pairs).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(entries as [string, string][]);
  },
};

// Legacy key exports (for backward compatibility)
export const MMKV_KEYS = STORAGE_KEYS;

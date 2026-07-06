// =============================================================================
// IronQuest Pet Store - Stats, Evolution, Care
// =============================================================================

import { FP_CONFIG } from '@/config/fp-values';
import type { PetStats, PetType } from '@/types';
import { STORAGE_KEYS, appStorage } from '@/utils/storage';
import { create } from 'zustand';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type EvolutionStage = 1 | 2 | 3 | 4;

interface PetState {
  // Identity
  id: string;
  name: string;
  type: PetType;

  // Care
  hunger: number; // 0-100, decays over time
  lastFedAt: string | null; // ISO timestamp

  // Stats
  stats: PetStats;

  // Evolution
  evolutionStage: EvolutionStage;
  totalFPEarned: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface PetActions {
  // Initialization
  initializePet: (type: PetType, name: string) => void;

  // Care
  feedPet: () => void; // Costs FP elsewhere, just updates hunger

  // Stats
  upgradeStat: (stat: keyof PetStats, amount: number) => void;
  applyFPToStats: (distribution: Partial<PetStats>) => void;

  // Evolution
  addFP: (amount: number) => void; // Updates totalFPEarned, checks evolution

  // Hunger decay (called on app open)
  calculateHungerDecay: () => void;

  // Hydration
  hydrate: () => Promise<void>;
  reset: () => void;
}

type PetStore = PetState & PetActions;

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

// Evolution thresholds in total FP earned. Derived from the single tuning
// file — petStore previously carried its own copy of these numbers, the same
// shadow-config pattern behind the June FP fracture (audit C4).
const [, STAGE_2_FP, STAGE_3_FP, STAGE_4_FP] = FP_CONFIG.evolution.thresholds;
const EVOLUTION_THRESHOLDS: Record<EvolutionStage, number> = {
  1: 0,
  2: STAGE_2_FP,
  3: STAGE_3_FP,
  4: STAGE_4_FP,
};

// Hunger decay rate: 5 points per hour (100 points over 20 hours)
const HUNGER_DECAY_RATE_PER_HOUR = 5;

// Max hunger value
const MAX_HUNGER = 100;

// Min hunger value
const MIN_HUNGER = 0;

// Max stat value
const MAX_STAT_VALUE = 50;

// -----------------------------------------------------------------------------
// Initial State
// -----------------------------------------------------------------------------

const createInitialStats = (): PetStats => ({
  power: 0,
  guard: 0,
  speed: 0,
  vigor: 0,
  focus: 0,
  spirit: 0,
});

const initialState: PetState = {
  id: '',
  name: '',
  type: 'ferro',
  hunger: MAX_HUNGER,
  lastFedAt: null,
  stats: createInitialStats(),
  evolutionStage: 1,
  totalFPEarned: 0,
  createdAt: '',
  updatedAt: '',
};

// Helper to generate unique ID
const generateId = (): string => {
  return `pet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Helper to get current ISO timestamp
const nowISO = (): string => new Date().toISOString();

// The 3-type taxonomy shipped in Phase 2 (issue #33). Pre-Phase-2 persisted
// state may still hold a stale retired-type value; passing it through would
// crash PetAvatar (PET_TYPE_COLORS lookup misses). Coerce any unrecognized
// value to the default 'ferro'.
const VALID_PET_TYPES: PetType[] = ['ferro', 'flux', 'terra'];
const coercePetType = (value: unknown): PetType => {
  return VALID_PET_TYPES.includes(value as PetType) ? (value as PetType) : 'ferro';
};

// Helper to persist pet state
const persistPet = async (state: PetState) => {
  await appStorage.setJSON(STORAGE_KEYS.PET.FULL_STATE, state);
};

// Helper to determine evolution stage based on total FP
const getEvolutionStageFromFP = (totalFP: number): EvolutionStage => {
  if (totalFP >= EVOLUTION_THRESHOLDS[4]) return 4;
  if (totalFP >= EVOLUTION_THRESHOLDS[3]) return 3;
  if (totalFP >= EVOLUTION_THRESHOLDS[2]) return 2;
  return 1;
};

// Helper to calculate hunger decay based on time elapsed
const calculateHungerDecayAmount = (lastFedAt: string | null): number => {
  if (!lastFedAt) return 0;

  const lastFed = new Date(lastFedAt).getTime();
  const now = Date.now();
  const hoursElapsed = (now - lastFed) / (1000 * 60 * 60);

  return Math.floor(hoursElapsed * HUNGER_DECAY_RATE_PER_HOUR);
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const usePetStore = create<PetStore>((set, get) => ({
  ...initialState,

  // Initialization
  initializePet: (type, name) => {
    const now = nowISO();
    const newState: PetState = {
      id: generateId(),
      name,
      type,
      hunger: MAX_HUNGER,
      lastFedAt: now,
      stats: createInitialStats(),
      evolutionStage: 1,
      totalFPEarned: 0,
      createdAt: now,
      updatedAt: now,
    };

    set(newState);
    persistPet(newState).catch(console.warn);
  },

  // Care
  feedPet: () => {
    set((state) => {
      const now = nowISO();
      const newState: PetState = {
        ...state,
        hunger: MAX_HUNGER,
        lastFedAt: now,
        updatedAt: now,
      };

      persistPet(newState).catch(console.warn);
      return newState;
    });
  },

  // Stats
  upgradeStat: (stat, amount) => {
    set((state) => {
      const currentValue = state.stats[stat];
      const newValue = Math.min(currentValue + amount, MAX_STAT_VALUE);

      // Don't update if already at max
      if (newValue === currentValue) {
        return state;
      }

      const now = nowISO();
      const newState: PetState = {
        ...state,
        stats: {
          ...state.stats,
          [stat]: newValue,
        },
        updatedAt: now,
      };

      persistPet(newState).catch(console.warn);
      return newState;
    });
  },

  applyFPToStats: (distribution) => {
    set((state) => {
      const now = nowISO();
      const newStats = { ...state.stats };

      // Apply each stat increase from the distribution
      for (const [stat, amount] of Object.entries(distribution)) {
        if (amount !== undefined) {
          const statKey = stat as keyof PetStats;
          const currentValue = newStats[statKey];
          newStats[statKey] = Math.min(currentValue + amount, MAX_STAT_VALUE);
        }
      }

      const newState: PetState = {
        ...state,
        stats: newStats,
        updatedAt: now,
      };

      persistPet(newState).catch(console.warn);
      return newState;
    });
  },

  // Evolution
  addFP: (amount) => {
    set((state) => {
      const newTotalFP = state.totalFPEarned + amount;
      // Evolution is monotonic: a pet that reached a stage keeps it even if
      // thresholds are later raised ("No Punishment for Absence" extends to
      // economy retuning — never demote an earned stage).
      const newStage = Math.max(
        getEvolutionStageFromFP(newTotalFP),
        state.evolutionStage
      ) as EvolutionStage;
      const now = nowISO();

      const newState: PetState = {
        ...state,
        totalFPEarned: newTotalFP,
        evolutionStage: newStage,
        updatedAt: now,
      };

      persistPet(newState).catch(console.warn);
      return newState;
    });
  },

  // Hunger decay
  calculateHungerDecay: () => {
    set((state) => {
      // Don't decay if pet not initialized
      if (!state.id) {
        return state;
      }

      const decayAmount = calculateHungerDecayAmount(state.lastFedAt);
      const newHunger = Math.max(MIN_HUNGER, state.hunger - decayAmount);

      // Don't update if no decay
      if (newHunger === state.hunger) {
        return state;
      }

      const now = nowISO();
      const newState: PetState = {
        ...state,
        hunger: newHunger,
        updatedAt: now,
      };

      persistPet(newState).catch(console.warn);
      return newState;
    });
  },

  // Hydration
  hydrate: async () => {
    try {
      const stored = await appStorage.getJSON<PetState>(STORAGE_KEYS.PET.FULL_STATE);

      if (stored) {
        // If pet has data but no id, generate one (migrates old data)
        const petId = stored.id || generateId();
        const now = nowISO();

        set({
          id: petId,
          name: stored.name ?? '',
          type: coercePetType(stored.type),
          hunger: stored.hunger ?? MAX_HUNGER,
          lastFedAt: stored.lastFedAt ?? null,
          stats: stored.stats ?? createInitialStats(),
          evolutionStage: stored.evolutionStage ?? 1,
          totalFPEarned: stored.totalFPEarned ?? 0,
          createdAt: stored.createdAt ?? now,
          updatedAt: stored.updatedAt ?? now,
        });

        // If we had to generate an id, persist the updated state
        if (!stored.id) {
          persistPet({
            id: petId,
            name: stored.name ?? '',
            type: coercePetType(stored.type),
            hunger: stored.hunger ?? MAX_HUNGER,
            lastFedAt: stored.lastFedAt ?? null,
            stats: stored.stats ?? createInitialStats(),
            evolutionStage: stored.evolutionStage ?? 1,
            totalFPEarned: stored.totalFPEarned ?? 0,
            createdAt: stored.createdAt ?? now,
            updatedAt: stored.updatedAt ?? now,
          }).catch(console.warn);
        }
      }
    } catch (error) {
      console.warn('Failed to hydrate pet store:', error);
    }
  },

  reset: () => {
    set(initialState);
    appStorage.delete(STORAGE_KEYS.PET.FULL_STATE).catch(console.warn);
  },
}));

// -----------------------------------------------------------------------------
// Selectors
// -----------------------------------------------------------------------------

/**
 * Select the entire pet state
 */
export const selectPet = (state: PetStore): PetState => ({
  id: state.id,
  name: state.name,
  type: state.type,
  hunger: state.hunger,
  lastFedAt: state.lastFedAt,
  stats: state.stats,
  evolutionStage: state.evolutionStage,
  totalFPEarned: state.totalFPEarned,
  createdAt: state.createdAt,
  updatedAt: state.updatedAt,
});

/**
 * Select hunger as a percentage (0-100)
 */
export const selectHungerPercentage = (state: PetStore): number => {
  return Math.max(MIN_HUNGER, Math.min(MAX_HUNGER, state.hunger));
};

/**
 * Check if pet can evolve to next stage
 */
export const selectCanEvolve = (state: PetStore): boolean => {
  const currentStage = state.evolutionStage;

  // Already at max evolution
  if (currentStage === 4) {
    return false;
  }

  const nextStage = (currentStage + 1) as EvolutionStage;
  const nextThreshold = EVOLUTION_THRESHOLDS[nextStage];

  return state.totalFPEarned >= nextThreshold;
};

/**
 * Get the next evolution threshold
 */
export const selectNextEvolutionThreshold = (state: PetStore): number | null => {
  const currentStage = state.evolutionStage;

  if (currentStage === 4) {
    return null;
  }

  const nextStage = (currentStage + 1) as EvolutionStage;
  return EVOLUTION_THRESHOLDS[nextStage];
};

/**
 * Get FP progress towards next evolution (as a percentage)
 */
export const selectEvolutionProgress = (state: PetStore): number => {
  const currentStage = state.evolutionStage;

  if (currentStage === 4) {
    return 100;
  }

  const currentThreshold = EVOLUTION_THRESHOLDS[currentStage];
  const nextStage = (currentStage + 1) as EvolutionStage;
  const nextThreshold = EVOLUTION_THRESHOLDS[nextStage];

  const progress = state.totalFPEarned - currentThreshold;
  const needed = nextThreshold - currentThreshold;

  return Math.min(100, Math.max(0, (progress / needed) * 100));
};

/**
 * Get total stats sum
 */
export const selectTotalStats = (state: PetStore): number => {
  return Object.values(state.stats).reduce((sum, val) => sum + val, 0);
};

/**
 * Check if a specific stat is at max value
 */
export const selectIsStatMaxed =
  (stat: keyof PetStats) =>
  (state: PetStore): boolean => {
    return state.stats[stat] >= MAX_STAT_VALUE;
  };

/**
 * Check if pet is initialized
 */
export const selectIsPetInitialized = (state: PetStore): boolean => {
  return state.id !== '' && state.id !== null;
};

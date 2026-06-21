# State Architecture — Zustand Stores

> **Version:** 1.0 | **Scope:** Phase 1+ state management implementation reference

This document defines the Zustand store architecture, TypeScript interfaces, selector patterns, and persistence strategy for IronQuest.

---

## Storage Strategy

**AsyncStorage only.** MMKV was removed for Expo Go compatibility — do not re-introduce.

| Data | Storage | Reason |
|------|---------|--------|
| Pet stats, FP balances, current session, settings | AsyncStorage (via Zustand `persist`) | Hot reads; Zustand subscription keeps in-memory copy fast |
| Workout history | AsyncStorage (raw) | Large, infrequent access |
| Achievements | AsyncStorage (raw) | Append-only, historical |
| Personal baselines | AsyncStorage (raw) | Per-exercise, accessed post-session |

---

## Store Architecture

```
src/stores/
├── playerStore.ts     # Profile, FP, streak, achievements
├── petStore.ts        # Stats, evolution, care, type, abilities, cosmetics
├── workoutStore.ts    # Active session, exercises, rest timer
├── towerStore.ts      # Floor progress, attempts, battle state
├── settingsStore.ts   # Theme, haptics, notifications, units, reduced motion
└── index.ts           # Barrel export
```

---

## Store Interfaces

### Player Store

```typescript
interface PlayerState {
  profile: {
    name: string;
    avatar: string | null;
    createdAt: number;
  };

  fp: {
    generic: number;
    power: number;
    guard: number;
    speed: number;
    vigor: number;
    focus: number;
    spirit: number;
  };

  streak: {
    current: number;
    longest: number;
    lastWorkoutDate: string | null; // ISO date
  };

  achievements: string[];
}

interface PlayerActions {
  addFP: (type: FPType, amount: number) => void;
  spendFP: (type: FPType, amount: number) => boolean;
  updateStreak: (workedOutToday: boolean) => void;
  unlockAchievement: (id: string) => void;
  reset: () => void;
}

// Selectors
const getTotalFP = (state: PlayerState) =>
  Object.values(state.fp).reduce((sum, val) => sum + val, 0);

const canAfford = (type: FPType, amount: number) => (state: PlayerState) =>
  type === 'generic'
    ? state.fp.generic >= amount
    : state.fp[type] >= amount;
```

### Pet Store

```typescript
interface PetState {
  stats: {
    power: number;
    guard: number;
    speed: number;
    vigor: number;
    focus: number;
    spirit: number;
  };

  evolution: {
    stage: 1 | 2 | 3 | 4;
    evoXP: number;
  };

  care: {
    hunger: number;    // 0-1
    mood: number;      // 0-1
    lastFed: number;   // timestamp
  };

  type: 'Ferro' | 'Terra' | 'Flux';
  visualSeed: number;
  abilities: string[];
  cosmetics: string[];
}

interface PetActions {
  allocateStat: (stat: StatType, points: number) => boolean;
  feedPet: (foodTier: 1 | 2 | 3 | 4) => void;
  addEvoXP: (amount: number) => void;
  updateMood: () => void;
  equipCosmetic: (id: string) => void;
  unequipCosmetic: (id: string) => void;

  // Getters
  getStatCost: (stat: StatType) => number;
  getNextEvolutionThreshold: () => number;
  canEvolve: () => boolean;
}

// Selectors
const getTotalPower = (state: PetState) => state.stats.power;

const getHungerDecayRate = (state: PetState) => {
  // Base: 0.05 per day, modified by evolution stage
  return 0.05 * state.evolution.stage;
};
```

### Workout Store

```typescript
interface WorkoutState {
  active: boolean;
  templateId: string | null;
  startedAt: number | null;

  currentExerciseIndex: number;
  exercises: Exercise[];

  restTimer: {
    duration: number;
    remaining: number;
    running: boolean;
    paused: boolean;
  };

  intent: 'normal' | 'deload' | 'tempo' | 'pause' | 'drop_set' | 'rest_pause';
  gymRushActive: boolean;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  sets: Set[];
  restSeconds: number;
  completed: boolean;
}

interface Set {
  reps: number | null;
  weight: number | null;
  logged: boolean;
  isPR: boolean;
  isRepPR: boolean;
}

interface WorkoutActions {
  startSession: (templateId: string, intent: SessionIntent) => void;
  endSession: () => WorkoutSummary;

  logSet: (exerciseIndex: number, setIndex: number, reps: number, weight?: number) => void;
  completeExercise: (exerciseIndex: number) => void;
  nextExercise: () => void;

  startRestTimer: (duration: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  resetRestTimer: () => void;

  toggleGymRush: () => void;
}

// Selectors
const getCurrentExercise = (state: WorkoutState) =>
  state.exercises[state.currentExerciseIndex];

const getCompletedSets = (state: WorkoutState) =>
  state.exercises.flatMap(e => e.sets.filter(s => s.logged)).length;

const getTotalReps = (state: WorkoutState) =>
  state.exercises.flatMap(e => e.sets.filter(s => s.logged))
    .reduce((sum, s) => sum + (s.reps || 0), 0);
```

### Tower Store

```typescript
interface TowerState {
  currentFloor: number;
  bestFloor: number;

  attempts: {
    remaining: number;
    lastResetDate: string; // ISO date
  };

  battle: {
    inProgress: boolean;
    turn: number;
    playerHP: number;
    enemyHP: number;
    log: BattleLogEntry[];
  } | null;

  bossKills: number;
}

interface BattleLogEntry {
  turn: number;
  attacker: 'player' | 'enemy';
  action: 'attack' | 'ability' | 'miss' | 'crit';
  damage?: number;
  type: 'normal' | 'advantage' | 'disadvantage';
}

interface TowerActions {
  startBattle: () => void;
  processTurn: () => void;
  completeBattle: (won: boolean) => void;
  resetDailyAttempts: () => void;

  canAttemptBattle: () => boolean;
  getEnemyStats: (floor: number) => EnemyStats;
}

// Selectors
const canBattle = (state: TowerState) =>
  state.attempts.remaining > 0 && !state.battle?.inProgress;

const getFloorTier = (state: TowerState) => {
  if (state.currentFloor <= 10) return 'tutorial';
  if (state.currentFloor <= 30) return 'normal';
  if (state.currentFloor <= 50) return 'challenge';
  return 'endless';
};
```

### Settings Store

```typescript
interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  haptics: boolean;
  notifications: {
    streakReminder: boolean;
    petHunger: boolean;
    weeklySummary: boolean;
  };
  units: 'lb' | 'kg';
  reducedMotion: boolean;
}

interface SettingsActions {
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => void;
  reset: () => void;
}
```

---

## Selectors & Subscription Patterns

### Optimized Selectors

```typescript
// BAD: Re-renders on any FP change
const fp = usePlayerStore(state => state.fp);
const power = fp.power;

// GOOD: Only re-renders when power changes
const power = usePlayerStore(state => state.fp.power);

// BETTER: Use shallow compare for objects
import { shallow } from 'zustand/shallow';

const { power, guard } = usePlayerStore(
  state => ({ power: state.fp.power, guard: state.fp.guard }),
  shallow
);
```

### Derived State (derive, don't store)

```typescript
const useCanEvolve = () => {
  const evoXP = usePetStore(state => state.evolution.evoXP);
  const stage = usePetStore(state => state.evolution.stage);

  const thresholds = [500, 2000, 5000];
  const nextThreshold = thresholds[stage - 1];

  return evoXP >= nextThreshold;
};
```

---

## Cross-Store Updates

Multi-store updates live in services/hooks — **never** call one store from inside another store's action.

```typescript
// In a service/hook, not in store directly
const completeWorkoutSession = () => {
  const workoutStore = useWorkoutStore.getState();
  const playerStore = usePlayerStore.getState();
  const petStore = usePetStore.getState();

  const fpEarned = calculateFP(workoutStore);

  playerStore.addFP('generic', fpEarned.generic);
  playerStore.addFP('power', fpEarned.power);
  // ... other types

  petStore.addEvoXP(calculateEvoXP(fpEarned));
  playerStore.updateStreak(true);

  return workoutStore.endSession();
};
```

---

## Cache Invalidation

| Event | Invalidate |
|-------|-----------|
| Session end | Workout store, Player FP |
| Pet fed | Pet care state |
| Battle complete | Tower state, Player FP |
| App open | Check daily resets (streak, attempts) |
| Settings change | Re-render affected components |

---

## Persistence Implementation

```typescript
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Usage
export const usePlayerStore = create<PlayerState>()(
  persist(
    playerSlice,
    {
      name: 'player-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## Performance Targets

| Operation | Target |
|-----------|--------|
| Store read (in-memory, after hydration) | <1ms |
| Store write | <5ms |
| AsyncStorage hydrate on cold start | <50ms |
| AsyncStorage write (background) | <100ms |
| State subscription update | <16ms (60fps) |

---

## Operational Notes

1. **Zustand, not Redux** — minimal boilerplate, sufficient for game state.
2. **Select narrowly** — avoid unnecessary re-renders; use `shallow` for object selectors.
3. **Derive, don't duplicate** — computed state derived from source, never stored twice.
4. **AsyncStorage via Zustand `persist` middleware** — no direct MMKV replacement needed; in-memory cache handles hot reads.
5. **Test migrations** — schema changes break stored data. Always include a `version` field and migrate on hydrate.

# State Architect — Memory Cache

> Quick reference for Zustand stores and data persistence. Read this first.

---

## Storage Mapping

| Data | Storage | Reason |
|------|---------|--------|
| Pet stats | **MMKV** | Read every animation frame |
| FP balances | **MMKV** | Frequent reads, immediate updates |
| Current session | **MMKV** | Fast access, survives restart |
| Settings | **MMKV** | Small, frequent reads |
| Tower state | **MMKV** | Session-level, frequent updates |
| Workout history | **AsyncStorage** | Large, infrequent access |
| Achievements | **AsyncStorage** | Append-only, historical |
| Personal baselines | **AsyncStorage** | Per-exercise, accessed post-session |

---

## Store Architecture

```
src/stores/
├── playerStore.ts     # Profile, FP, streak
├── petStore.ts        # Stats, evolution, care
├── workoutStore.ts    # Active session, exercises
├── towerStore.ts      # Floor progress, battles
├── settingsStore.ts   # App preferences
└── index.ts           # Barrel export
```

---

## Player Store

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

---

## Pet Store

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
const getTotalPower = (state: PetState) => {
  const { stats, type } = state;
  // Factor in type advantages, abilities, etc.
  return stats.power;
};

const getHungerDecayRate = (state: PetState) => {
  // Base: 0.05 per day, modified by evolution stage
  return 0.05 * state.evolution.stage;
};
```

---

## Workout Store

```typescript
interface WorkoutState {
  // Session state
  active: boolean;
  templateId: string | null;
  startedAt: number | null;

  // Current exercise
  currentExerciseIndex: number;
  exercises: Exercise[];

  // Rest timer
  restTimer: {
    duration: number;
    remaining: number;
    running: boolean;
    paused: boolean;
  };

  // Session intent
  intent: 'normal' | 'deload' | 'tempo' | 'pause' | 'drop_set' | 'rest_pause';

  // Gym rush mode
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
  // Session lifecycle
  startSession: (templateId: string, intent: SessionIntent) => void;
  endSession: () => WorkoutSummary;

  // Exercise flow
  logSet: (exerciseIndex: number, setIndex: number, reps: number, weight?: number) => void;
  completeExercise: (exerciseIndex: number) => void;
  nextExercise: () => void;

  // Rest timer
  startRestTimer: (duration: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  resetRestTimer: () => void;

  // Modifiers
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

---

## Tower Store

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

  // Getters
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

---

## Settings Store

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

## Persistence Middleware

```typescript
import { MMKV } from 'react-native-mmkv';
import { StateCreator } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

// Usage
export const usePlayerStore = create<PlayerState>()(
  persist(
    playerSlice,
    {
      name: 'player-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
```

---

## Key Subscription Patterns

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

### Derived State
```typescript
// Derive, don't store
const useCanEvolve = () => {
  const evoXP = usePetStore(state => state.evolution.evoXP);
  const stage = usePetStore(state => state.evolution.stage);

  const thresholds = [500, 2000, 5000];
  const nextThreshold = thresholds[stage - 1];

  return evoXP >= nextThreshold;
};
```

---

## Cross-Store Patterns

### Action That Updates Multiple Stores
```typescript
// In a service/hook, not in store directly
const completeWorkoutSession = () => {
  const workoutStore = useWorkoutStore.getState();
  const playerStore = usePlayerStore.getState();
  const petStore = usePetStore.getState();

  // Calculate FP
  const fpEarned = calculateFP(workoutStore);

  // Update stores
  playerStore.addFP('generic', fpEarned.generic);
  playerStore.addFP('power', fpEarned.power);
  // ... other types

  petStore.addEvoXP(calculateEvoXP(fpEarned));
  playerStore.updateStreak(true);

  // End session
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

## Performance Targets

| Operation | Target |
|-----------|--------|
| Store read (MMKV-backed) | <1ms |
| Store write (MMKV-backed) | <5ms |
| AsyncStorage read | <50ms |
| AsyncStorage write | <100ms |
| State subscription update | <16ms (60fps) |

---

## Collaboration Triggers

| When | Hand Off To |
|------|-------------|
| UI needs reactive data | mobile-specialist |
| FP calculation triggers storage | game-logic-specialist |
| Schema changes, migrations | database-specialist |
| Animation triggers from state | ui-gamification-specialist |

---

## Don't Forget

1. **Zustand, not Redux** — minimal boilerplate
2. **MMKV for hot data** — pet stats, FP, session
3. **Select narrowly** — avoid unnecessary re-renders
4. **Derive, don't duplicate** — computed state from source
5. **Test migrations** — schema changes break stored data

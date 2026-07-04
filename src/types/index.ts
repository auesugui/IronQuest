// =============================================================================
// IronQuest Core Types
// =============================================================================

// -----------------------------------------------------------------------------
// Pet Types
// -----------------------------------------------------------------------------

// Phase 2 (issue #33): migrated from the 5-type exploration set to the resolved
// Q1 3-type taxonomy. Type triangle (cyclic): Ferro → Flux → Terra → Ferro.
// Advantage: 1.3× damage dealt / 0.8× taken. See docs/04-pet-system/pet-types.md.
export type PetType = 'ferro' | 'flux' | 'terra';

export type StatType = 'power' | 'guard' | 'speed' | 'vigor' | 'focus' | 'spirit';

export type FPType = StatType | 'generic';

export interface PetStats {
  power: number;
  guard: number;
  speed: number;
  vigor: number;
  focus: number;
  spirit: number;
}

export interface EvolutionState {
  stage: 1 | 2 | 3 | 4;
  evoXP: number;
}

export interface PetCare {
  hunger: number; // 0-1
  mood: number; // 0-1
  lastFed: number; // timestamp
}

export interface Pet {
  id: string;
  stats: PetStats;
  evolution: EvolutionState;
  care: PetCare;
  type: PetType;
  visualSeed: number;
  abilities: string[];
  cosmetics: string[];
}

// -----------------------------------------------------------------------------
// Player Types
// -----------------------------------------------------------------------------

export interface FPBalances {
  generic: number;
  power: number;
  guard: number;
  speed: number;
  vigor: number;
  focus: number;
  spirit: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastWorkoutDate: string | null; // ISO date string
}

export interface PlayerProfile {
  name: string;
  avatar: string | null;
  createdAt: string;
}

export interface Player {
  id: string;
  profile: PlayerProfile;
  fp: FPBalances;
  streak: StreakData;
  achievements: string[];
}

// -----------------------------------------------------------------------------
// Workout Types
// -----------------------------------------------------------------------------

export type SessionIntent = 'normal' | 'deload' | 'tempo' | 'pause' | 'drop_set' | 'rest_pause';

export type WorkoutType =
  | 'lifting'
  | 'cardio_liss'
  | 'cardio_hiit'
  | 'cardio_hybrid'
  | 'cardio_sport';

export interface LoggedSet {
  reps: number | null;
  weight: number | null;
  logged: boolean;
  isPR: boolean;
  isRepPR: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  sets: LoggedSet[];
  restSeconds: number;
  completed: boolean;
}

export interface WorkoutSession {
  active: boolean;
  templateId: string | null;
  startedAt: number | null;
  currentExerciseIndex: number;
  exercises: Exercise[];
  intent: SessionIntent;
  gymRushActive: boolean;
}

/**
 * A persisted record of a finished workout session.
 *
 * Created at session finish (BEFORE navigation to the summary) and updated
 * once when its FP rewards are claimed. `claimedAt` is the idempotency key:
 * null until claimed, an ISO timestamp after. The FP award path must no-op
 * when `claimedAt` is already set — this is what kills the URL-replay
 * double-claim exploit (issue #16 / audit C1).
 *
 * `streakDays` is snapshotted at finish time so the summary renders the same
 * multiplier/Spirit FP on reload that it did the first time.
 */
export interface WorkoutLog {
  id: string;
  timestamp: string; // ISO — when the session was finished
  exercises: Exercise[];
  durationSeconds: number;
  streakDays: number; // streak snapshot at finish time
  sessionIntent: SessionIntent;
  /** Idempotency key: null until FP is claimed, ISO timestamp once claimed. */
  claimedAt: string | null;
  /** Captured at claim time for the future history screen. null until claimed. */
  totalFP: number | null;
  fpEarned: FPBalances | null;
}

export interface PRRecord {
  exerciseId: string;
  type: 'weight' | 'rep';
  value: number;
}

// -----------------------------------------------------------------------------
// Tower Types
// -----------------------------------------------------------------------------

export interface TowerAttempts {
  remaining: number;
  lastResetDate: string;
}

export interface BattleState {
  inProgress: boolean;
  turn: number;
  playerHP: number;
  enemyHP: number;
  log: BattleLogEntry[];
}

export interface BattleLogEntry {
  turn: number;
  attacker: 'player' | 'enemy';
  action: 'attack' | 'ability' | 'miss' | 'crit';
  damage?: number;
  type: 'normal' | 'advantage' | 'disadvantage';
}

export interface TowerProgress {
  id: string;
  playerId: string;
  currentFloor: number;
  bestFloor: number;
  attempts: TowerAttempts;
  bossKills: number;
  battle: BattleState | null;
}

// -----------------------------------------------------------------------------
// Template Types
// -----------------------------------------------------------------------------

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroups: string[];
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseTemplate[];
  fpDistribution: Partial<Record<StatType, number>>;
}

// -----------------------------------------------------------------------------
// Achievement Types
// -----------------------------------------------------------------------------

export interface Achievement {
  id: string;
  playerId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'pet' | 'tower' | 'streak' | 'special';
  hidden: boolean;
}

// -----------------------------------------------------------------------------
// Settings Types
// -----------------------------------------------------------------------------

export interface NotificationSettings {
  streakReminder: boolean;
  petHunger: boolean;
  weeklySummary: boolean;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  haptics: boolean;
  notifications: NotificationSettings;
  units: 'lb' | 'kg';
  reducedMotion: boolean;
}

// -----------------------------------------------------------------------------
// Weight History Types
// -----------------------------------------------------------------------------

export interface WeightHistoryEntry {
  weight: number;
  timestamp: string;
}

export interface ExerciseWeightHistory {
  exerciseId: string;
  lastWeight: number | null;
  recentWeights: WeightHistoryEntry[];
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Utility Types
// -----------------------------------------------------------------------------

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

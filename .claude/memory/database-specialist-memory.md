# Database Specialist — Memory Cache

> Quick reference for data architecture and Supabase. Read this first.

---

## Storage Strategy (Phase 1-2: Local Only)

| Storage | Use Case | Speed | Examples |
|---------|----------|-------|----------|
| **MMKV** | High-frequency reads, <100ms access | Sync, ultra-fast | Pet stats, FP balances, current session, settings |
| **AsyncStorage** | Large data, infrequent access | Async, slower | Workout history, achievements, logs |

---

## Core Entities

### Player
```
id: UUID (primary key)
profile: {
  name: string
  avatar: string | null
  createdAt: datetime
}
fp: {
  generic: integer
  power: integer
  guard: integer
  speed: integer
  vigor: integer
  focus: integer
  spirit: integer
}
streak: {
  current: integer
  longest: integer
  lastWorkoutDate: date | null
}
achievements: string[]  // achievement IDs
created_at: datetime
updated_at: datetime
deleted_at: datetime | null
```

### Pet
```
id: UUID
player_id: UUID (FK → Player)
stats: {
  power: integer (0-50)
  guard: integer (0-50)
  speed: integer (0-50)
  vigor: integer (0-50)
  focus: integer (0-50)
  spirit: integer (0-50)
}
evolution: {
  stage: integer (1-4)
  evo_xp: integer
}
care: {
  hunger: float (0-1)
  mood: float (0-1)
  last_fed: datetime
}
type: 'Ferro' | 'Terra' | 'Flux'
visual_seed: integer
abilities: string[]
cosmetics: string[]
created_at: datetime
updated_at: datetime
deleted_at: datetime | null
```

### WorkoutLog
```
id: UUID
player_id: UUID (FK → Player)
timestamp: datetime
type: 'lifting' | 'cardio_liss' | 'cardio_hiit' | 'cardio_hybrid' | 'cardio_sport'
exercises: {
  id: string
  name: string
  muscle_groups: string[]
  sets: {
    reps: integer
    weight: float | null
    is_pr: boolean
    is_rep_pr: boolean
  }[]
}[]
duration_minutes: integer
fp_earned: {
  generic: integer
  power: integer
  guard: integer
  speed: integer
  vigor: integer
  focus: integer
  spirit: integer
}
prs: {
  exercise_id: string
  type: 'weight' | 'rep'
  value: float | integer
}[]
session_intent: 'normal' | 'deload' | 'tempo' | 'pause' | 'drop_set' | 'rest_pause'
created_at: datetime
updated_at: datetime
deleted_at: datetime | null
```

### TowerProgress
```
id: UUID
player_id: UUID (FK → Player)
current_floor: integer
best_floor: integer
attempts: {
  remaining: integer (0-7)
  last_reset_date: date
}
boss_kills: integer
created_at: datetime
updated_at: datetime
deleted_at: datetime | null
```

### Achievement
```
id: UUID
player_id: UUID (FK → Player)
achievement_id: string  // reference to definition
unlocked_at: datetime
created_at: datetime
```

---

## Index Strategy (Phase 3: Supabase/Postgres)

```sql
-- Player lookups
CREATE INDEX idx_player_created ON players(created_at);

-- Workout history queries (most common)
CREATE INDEX idx_workout_player_date ON workout_logs(player_id, timestamp DESC);
CREATE INDEX idx_workout_type ON workout_logs(type);

-- Tower leaderboards
CREATE INDEX idx_tower_best_floor ON tower_progress(best_floor DESC);

-- Achievement lookups
CREATE INDEX idx_achievement_player ON achievements(player_id);
CREATE INDEX idx_achievement_id ON achievements(achievement_id);
```

---

## Query Performance Targets

| Query | Target | Index Used |
|-------|--------|------------|
| Workout history (paginated, 20 items) | <100ms | idx_workout_player_date |
| Player stats + pet (join) | <50ms | PK lookups |
| Tower leaderboard (top 100) | <500ms | idx_tower_best_floor |
| Achievement check | <30ms | idx_achievement_player |

---

## MMKV Key Namespaces

```typescript
// Pet stats (read every animation frame)
'pet.stats.power'     → number
'pet.stats.guard'     → number
'pet.stats.speed'     → number
'pet.stats.vigor'     → number
'pet.stats.focus'     → number
'pet.stats.spirit'    → number

// Pet state
'pet.hunger'          → number (0-1)
'pet.mood'            → number (0-1)
'pet.evolution_stage' → number (1-4)
'pet.evo_xp'          → number

// Player FP
'player.fp.generic'   → number
'player.fp.power'     → number
// ... etc for each type

// Session
'session.active'      → boolean
'session.template_id' → string
'session.started_at'  → number (timestamp)

// Settings
'settings.theme'      → string
'settings.haptics'    → boolean
'settings.notifications' → boolean
```

---

## AsyncStorage Keys

```typescript
// Large data, accessed less frequently
'@workout_history'    → WorkoutLog[] (JSON)
'@achievements'       → Achievement[] (JSON)
'@personal_baselines' → { [exerciseId]: BaselineData } (JSON)
'@templates'          → Template[] (JSON)
```

---

## Offline-First Rules

1. **All mutations succeed locally first** — never wait for network
2. **Queue failed operations** — retry on next app open or connectivity change
3. **Optimistic updates with rollback** — if sync fails, revert local state
4. **UUIDs generated client-side** — not dependent on server
5. **Soft deletes only** — `deleted_at` timestamp, never hard delete

---

## Sync Queue Schema (Phase 3)

```typescript
interface SyncQueueItem {
  id: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record_id: string
  payload: object
  created_at: number
  attempts: number
  last_error: string | null
}
```

---

## Conflict Resolution (Phase 3)

| Conflict Type | Resolution Strategy |
|--------------|---------------------|
| Same field, different values | **Server wins** (last write wins with timestamp) |
| Workout log duplication | **Dedup by timestamp + exercise list hash** |
| Pet stat divergence | **Server wins** (source of truth after first sync) |
| Achievement race | **Both unlock** (idempotent) |

---

## Phase 3: Supabase RLS Policies

```sql
-- Players can only read/write their own data
CREATE POLICY "Players own data"
  ON players FOR ALL
  USING (auth.uid()::text = id::text);

-- Pets belong to player
CREATE POLICY "Pets by owner"
  ON pets FOR ALL
  USING (auth.uid()::text = player_id::text);

-- Workout logs by owner
CREATE POLICY "Workout logs by owner"
  ON workout_logs FOR ALL
  USING (auth.uid()::text = player_id::text);

-- Tower progress by owner
CREATE POLICY "Tower by owner"
  ON tower_progress FOR ALL
  USING (auth.uid()::text = player_id::text);

-- Achievements by owner (read), public for leaderboards
CREATE POLICY "Achievements read own"
  ON achievements FOR SELECT
  USING (auth.uid()::text = player_id::text);
```

---

## Data Migration Notes

When schema changes:
1. **Version the storage** — include schema version in MMKV/AsyncStorage
2. **Migrate on app open** — before any reads
3. **Never drop data** — transform, don't delete
4. **Test with real data** — create fixtures that exercise migrations

```typescript
// Migration pattern
const SCHEMA_VERSION = 3;

const migrate = (version: number, data: any) => {
  if (version < 2) {
    // v1 → v2: Add spirit FP field
    data.fp.spirit = data.fp.spirit ?? 0;
  }
  if (version < 3) {
    // v2 → v3: Restructure pet stats
    // ... transformation
  }
  return data;
};
```

---

## Collaboration Triggers

| When | Hand Off To |
|------|-------------|
| UI needs to display stored data | state-architect |
| FP values need calculation before storage | game-logic-specialist |
| Supabase client setup in app | mobile-specialist |

---

## Don't Forget

1. **Phase 1-2: Local only** — design for sync, but don't implement yet
2. **MMKV for hot paths** — pet stats, FP, current session
3. **UUIDs from creation** — no server-generated IDs
4. **Soft deletes** — never lose user data
5. **Index early** — add indexes as query patterns emerge

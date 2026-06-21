# Local Schema — Phase 1 Data Model

> **Version:** 1.0 | **Scope:** Phase 1–2 local persistence. Phase 3 (Supabase sync) sketched at end as a forward reference only.

This document defines the local entity schemas, storage keys, and offline-first rules for IronQuest Phase 1–2. All persistence is **AsyncStorage only** (MMKV was removed for Expo Go compatibility).

---

## Core Entities

### Player

```typescript
{
  id: string                  // UUID, generated client-side at first launch
  profile: {
    name: string
    avatar: string | null
    createdAt: number         // timestamp
  }
  fp: {
    generic: number
    power: number
    guard: number
    speed: number
    vigor: number
    focus: number
    spirit: number
  }
  streak: {
    current: number
    longest: number
    lastWorkoutDate: string | null  // ISO date
  }
  achievements: string[]     // achievement IDs
  createdAt: number
  updatedAt: number
  deletedAt: number | null   // soft delete only
}
```

### Pet

```typescript
{
  id: string                 // UUID
  playerId: string           // FK → Player
  stats: {
    power: number            // 0-50
    guard: number
    speed: number
    vigor: number
    focus: number
    spirit: number
  }
  evolution: {
    stage: 1 | 2 | 3 | 4
    evoXP: number
  }
  care: {
    hunger: number           // 0-1
    mood: number             // 0-1
    lastFed: number          // timestamp
  }
  type: 'Ferro' | 'Terra' | 'Flux'
  visualSeed: number         // for procedural SVG variation
  abilities: string[]
  cosmetics: string[]
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}
```

### WorkoutLog

```typescript
{
  id: string                 // UUID
  playerId: string           // FK → Player
  timestamp: number
  type: 'lifting' | 'cardio_liss' | 'cardio_hiit' | 'cardio_hybrid' | 'cardio_sport'
  exercises: Array<{
    id: string
    name: string
    muscleGroups: string[]
    sets: Array<{
      reps: number
      weight: number | null
      isPR: boolean
      isRepPR: boolean
    }>
  }>
  durationMinutes: number
  fpEarned: {
    generic: number
    power: number
    guard: number
    speed: number
    vigor: number
    focus: number
    spirit: number
  }
  prs: Array<{
    exerciseId: string
    type: 'weight' | 'rep'
    value: number
  }>
  sessionIntent: 'normal' | 'deload' | 'tempo' | 'pause' | 'drop_set' | 'rest_pause'
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}
```

### TowerProgress

```typescript
{
  id: string
  playerId: string
  currentFloor: number
  bestFloor: number
  attempts: {
    remaining: number        // 0-7
    lastResetDate: string    // ISO date
  }
  bossKills: number
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}
```

### Achievement

```typescript
{
  id: string
  playerId: string
  achievementId: string     // reference to achievement definition
  unlockedAt: number
  createdAt: number
}
```

---

## AsyncStorage Keys

```typescript
// Active state (managed by Zustand persist middleware)
'player-store'              → Player (JSON, via Zustand)
'pet-store'                 → Pet (JSON, via Zustand)
'workout-store'             → Active WorkoutState (JSON, via Zustand)
'tower-store'               → TowerProgress (JSON, via Zustand)
'settings-store'            → Settings (JSON, via Zustand)

// Raw storage (large/append-only collections)
'@workout_history'          → WorkoutLog[] (JSON)
'@achievements'             → Achievement[] (JSON)
'@personal_baselines'       → { [exerciseId]: BaselineData } (JSON)
'@templates'                → Template[] (JSON)
```

---

## Offline-First Rules

1. **All mutations succeed locally first** — never wait for network.
2. **UUIDs generated client-side** — not dependent on a server, even before sync exists.
3. **Soft deletes only** — `deletedAt` timestamp, never hard delete. Forward-compatible with sync.
4. **Optimistic updates with rollback** — if any later sync layer fails, revert local state.
5. **Schema versioning** — every persisted blob includes a `schemaVersion` field; migrate on hydrate.

---

## Data Migration Pattern

```typescript
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

Rules when schema changes:
1. **Version the storage** — include `schemaVersion` in every persisted blob.
2. **Migrate on app open** — before any reads.
3. **Never drop data** — transform, don't delete.
4. **Test with real fixtures** — create fixtures that exercise each migration step.

---

## Phase 3 Forward Reference (Supabase Sync)

> Out of scope for Phase 1–2. Documented here as a forward reference; do not implement until Phase 3.

**Sync queue item shape:**

```typescript
interface SyncQueueItem {
  id: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  recordId: string
  payload: object
  createdAt: number
  attempts: number
  lastError: string | null
}
```

**Conflict resolution policy:**

| Conflict Type | Resolution |
|--------------|------------|
| Same field, different values | Server wins (last-write-wins with timestamp) |
| Workout log duplication | Dedup by timestamp + exercise-list hash |
| Pet stat divergence | Server wins (source of truth after first sync) |
| Achievement race | Both unlock (idempotent) |

**Index strategy (Postgres):**

```sql
CREATE INDEX idx_workout_player_date ON workout_logs(player_id, timestamp DESC);
CREATE INDEX idx_workout_type ON workout_logs(type);
CREATE INDEX idx_tower_best_floor ON tower_progress(best_floor DESC);
CREATE INDEX idx_achievement_player ON achievements(player_id);
```

**RLS policy pattern:** one policy per table, scoping all rows to `auth.uid()::text = player_id::text`. Achievements get a separate SELECT policy if leaderboard reads are public.

**Query performance targets (Phase 3):**

| Query | Target |
|-------|--------|
| Workout history (paginated, 20 items) | <100ms |
| Player stats + pet (join) | <50ms |
| Tower leaderboard (top 100) | <500ms |
| Achievement check | <30ms |

# Multi-Agent Task Queue

> Coordination point for parallel agent work on IronQuest Phase 1

## Current Sprint: Core Game Loop (P0 Features)

---

## GAME-LOGIC AGENT (Window 3)

### [GAME-001] FP Calculation Engine ⏳ IN PROGRESS
**Priority:** P0
**Blocked by:** none

**Description:**
Implement the Forge Points calculation system per docs/02-forge-points/fp-earning.md:
- Base completion: 100 FP flat per exercise
- Volume bonus: 1 FP per 10 reps
- PR detection: 50 FP for weight PR, 25 FP for rep PR
- Streak multiplier: 1.0x + 0.1x/day (max 2.0x)

**Acceptance Criteria:**
- [ ] `src/lib/fp-calculator.ts` exports `calculateSetFP()` function
- [ ] Handles all FP source types (base, volume, PR, streak)
- [ ] Returns breakdown object showing each component
- [ ] Unit tests for calculation edge cases

**Files to create/modify:**
- `src/lib/fp-calculator.ts` (new)
- `src/lib/__tests__/fp-calculator.test.ts` (new)

**Output:**
_Started in Window 3_

---

### [GAME-002] FP Store Integration
**Priority:** P0
**Blocked by:** GAME-001

**Description:**
Create Zustand store for player FP balance and transaction history.

**Files:**
- `src/stores/fpStore.ts` (new)

**Output:**
_Pending GAME-001_

---

### [GAME-003] Streak System
**Priority:** P2
**Blocked by:** none

**Description:**
Track consecutive workout days and calculate streak multiplier.

**Files:**
- `src/lib/streak-calculator.ts` (new)
- `src/stores/streakStore.ts` (new)

**Output:**
_Backlog_

---

## MOBILE AGENT (Window 1)

### [MOB-001] Pet SVG Renderer
**Priority:** P0
**Blocked by:** none

**Description:**
Create the base pet rendering component using react-native-svg per docs/04-pet-system/pet-rendering.md:
- Render pet as layered SVG shapes
- Support 6 stat-based visual variations (Power, Guard, Speed, Vigor, Focus, Spirit)
- Basic idle animation (breathing/pulsing)

**Acceptance Criteria:**
- [ ] `src/components/pet/PetAvatar.tsx` renders SVG pet
- [ ] Props: `petType`, `stats`, `evolutionStage`, `size`
- [ ] Visual changes based on stat values

**Files to create:**
- `src/components/pet/PetAvatar.tsx`
- `src/components/pet/PetShapes.ts` (SVG path generators)

**Output:**
_Pending_

---

### [MOB-002] Pet Care Screen (The Den)
**Priority:** P1
**Blocked by:** MOB-001, GAME-002

**Description:**
Build the Den tab where players interact with their pet:
- Display pet with PetAvatar component
- Feed button (costs FP, restores hunger)
- Stat upgrade buttons (5 FP per point, 10 FP for Spirit)
- Display current FP balance

**Files:**
- `src/screens/DenScreen.tsx` (update from placeholder)

**Output:**
_Pending_

---

### [MOB-003] Workout Completion Summary
**Priority:** P1
**Blocked by:** GAME-001

**Description:**
Screen shown when workout ends showing FP earned breakdown.

**Files:**
- `src/screens/WorkoutSummaryScreen.tsx` (new)

**Output:**
_Pending_

---

## STATE AGENT (Window 4)

### [STATE-001] Pet State Store
**Priority:** P0
**Blocked by:** none

**Description:**
Create Zustand store for pet data (hunger, stats, evolution).

**Files:**
- `src/stores/petStore.ts` (new)

**Output:**
_Pending_

---

### [STATE-002] Player Profile Store
**Priority:** P1
**Blocked by:** none

**Description:**
Store for player metadata, lifetime stats, achievements.

**Files:**
- `src/stores/playerStore.ts` (new)

**Output:**
_Pending_

---

## DATABASE AGENT (Window 2)

### [DB-001] Schema Design (Phase 1)
**Priority:** P1
**Blocked by:** none

**Description:**
Design local schema for AsyncStorage/MMKV persistence. Document data shapes.

**Files:**
- `docs/07-technical/local-schema.md` (new)

**Output:**
_Pending_

---

## Session Log

| Time | Window | Event |
|------|--------|-------|
| Now | 0 | Session started, tasks populated |
| Now | 3 | Starting GAME-001 (FP Engine) |

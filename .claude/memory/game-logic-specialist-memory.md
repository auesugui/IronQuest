# Game Logic Specialist — Memory Cache

> Quick reference for FP economy, battle engine, and game systems. Read this first.

---

## FP Calculation (Core Formula)

```
session_fp = (base + volume_bonus + pr_bonus + variable_bonus) × streak_multiplier
```

### Component Values

| Component | Value | Notes |
|-----------|-------|-------|
| Base completion | **100 FP** | Flat per workout |
| Volume bonus | **1 FP per 10 reps** | floor(total_reps / 10) |
| Weight PR | **50 FP** | New max weight for exercise |
| Rep PR | **25 FP** | Most reps at specific weight |
| Streak multiplier | **1.0x + 0.1x/day** | Max 2.0x |
| Quest bonus | **25 FP** | Weekly quest completion |
| Gym Rush bonus | **+10 FP/exercise** | Reduced rest mode |

### Example Calculation
```
Push A session:
  Base: 100
  Volume: 280 reps ÷ 10 = 28
  PR: 1 weight PR = 50
  Streak: 4 days = 1.4x

  Subtotal: 100 + 28 + 50 = 178
  Final: 178 × 1.4 = 249 FP
```

---

## Personal Baseline System

### Purpose
Makes FP fair for beginners AND veterans by comparing effort relative to personal history, not absolute weight.

### How It Works
1. **First 3 sessions** → Record weight, reps, volume per exercise
2. **After 3 sessions** → Average becomes baseline
3. **FP calculated relative to baseline**
4. **Rolling average updates** weighted toward recent sessions

### Volume Bonus (Relative)
```
volume_bonus = floor((session_volume / baseline_volume - 1) × 100)
// Capped at +50 FP per session
```

| Scenario | Baseline | Session | Bonus |
|----------|----------|---------|-------|
| Improvement | 100 lbs | 108 lbs | +8 FP |
| Same effort | 100 lbs | 100 lbs | 0 FP |
| Deload | 100 lbs | 70 lbs | -30 FP (use deload tag → 80 FP flat) |

---

## Typed FP Distribution

### Muscle Group → FP Type

| Muscle Group | Primary FP | Secondary FP |
|--------------|------------|--------------|
| Chest | Power | Focus |
| Shoulders | Power | Focus |
| Back | Guard | Focus |
| Traps | Guard | Focus |
| Quads | Speed | Vigor |
| Hamstrings | Speed | Vigor |
| Calves | Vigor | Speed |
| Core | Vigor | Speed |
| Biceps | Focus | Power |
| Triceps | Focus | Guard |

### Spirit FP (Exclusive from Streaks)

| Source | Spirit FP | Frequency |
|--------|-----------|-----------|
| Daily streak | 5 FP | Per day |
| 7-day milestone | 15 FP | One-time |
| 14-day milestone | 30 FP | One-time |
| 30-day milestone | 50 FP | One-time |
| Weekly completion | 10 FP | Weekly (Sunday) |
| Monthly consistency (90%+) | 25 FP | Monthly |

**Spirit is NEVER earned from exercise, cardio, or purchases.**

---

## Stat Costs

### Scaling Tiers

| Stat Range | Cost per Point |
|------------|----------------|
| 1–10 | **5 FP** |
| 11–25 | **8 FP** |
| 26–50 | **12 FP** |
| Spirit (any) | **10 FP** |

### Cost Calculator
```typescript
function getStatCost(currentStat: number, statType: string): number {
  if (statType === 'spirit') return 10;

  if (currentStat < 10) return 5;
  if (currentStat < 25) return 8;
  return 12;
}

function getTotalCost(fromStat: number, toStat: number, statType: string): number {
  let total = 0;
  for (let i = fromStat; i < toStat; i++) {
    total += getStatCost(i, statType);
  }
  return total;
}
```

---

## Battle System

### Type Triangle
```
Ferro (Metal) → beats Flux → beats Terra → beats Ferro
```

| Matchup | Damage Dealt | Damage Taken |
|---------|-------------|--------------|
| Advantage | **1.3x** | **0.8x** |
| Disadvantage | **0.8x** | **1.3x** |
| Neutral | 1.0x | 1.0x |

### Damage Formula
```typescript
function calculateDamage(
  attacker: Pet,
  defender: Pet,
  typeMultiplier: number
): number {
  const baseDamage = attacker.stats.power * typeMultiplier;
  const defense = defender.stats.guard * getDefenseMultiplier(attacker, defender);
  const damage = Math.max(1, baseDamage - defense);
  return Math.floor(damage);
}
```

### Turn Order
```typescript
// Higher speed goes first
function determineTurnOrder(player: Pet, enemy: Pet): 'player' | 'enemy' {
  return player.stats.speed >= enemy.stats.speed ? 'player' : 'enemy';
}
```

### Critical Hits (Focus-based)
```typescript
function getCritChance(focus: number): number {
  // Base 5% + 0.5% per focus point
  return 0.05 + (focus * 0.005);
}

function getAccuracy(focus: number): number {
  // Base 95% + 0.2% per focus point
  return 0.95 + (focus * 0.002);
}
```

### HP Calculation (Vigor-based)
```typescript
function getMaxHP(vigor: number): number {
  // Base 100 + 10 per vigor point
  return 100 + (vigor * 10);
}
```

---

## Tower Mechanics

### Floor Tiers

| Floors | Enemy Difficulty | Notes |
|--------|-----------------|-------|
| 1–10 | 50–70% player power | Tutorial phase |
| 11–30 | 70–90% player power | Normal progression |
| 31–50 | 90–110% player power | Challenge zone |
| 51+ | 110%+ player power | Endless, scales infinitely |

### Attempt Economy
- **1 attempt per completed workout**
- **Max 7 attempts stored**
- **Attempts reset daily at midnight**
- **Failed battles don't consume attempts** (only victories)

### Boss Floors (Every 10th)
- Special enemy with ability
- Higher stats (120% of normal floor)
- Bonus rewards on victory

---

## Evolution System

### EvoXP Thresholds

| Stage | Name | EvoXP Required | Timeline |
|-------|------|----------------|----------|
| 1 | Shard | 0 | Day 1 |
| 2 | Form | 500 | ~2–3 weeks |
| 3 | Prime | 2,000 | ~6–8 weeks |
| 4 | Apex | 5,000 | ~16–20 weeks |

### EvoXP Earning
```typescript
function calculateEvoXP(session: WorkoutSession): number {
  // Base: 10 EvoXP per workout
  // Bonus: 1 EvoXP per 50 FP earned
  return 10 + Math.floor(session.totalFP / 50);
}
```

### Ability Slots (Unlocked by Evolution)
```
Stage 1 (Shard):  1 ability slot
Stage 2 (Form):   2 ability slots
Stage 3 (Prime):  3 ability slots
Stage 4 (Apex):   4 ability slots
```

---

## Training Variable Modifiers

| Modifier | FP Bonus | Condition |
|----------|----------|-----------|
| Slow Tempo (3–4s eccentric) | +15 FP | Toggle before exercise |
| Pause Reps (1–3s hold) | +15 FP | Toggle before exercise |
| Drop Set | +20 FP | Log as special set type |
| Rest-Pause | +10 FP | Log as special set type |
| Reduced Rest (25%+ shorter) | +10 FP | Auto-detected |
| Single-Limb (unilateral) | +15 FP | Exercise tagged |

---

## Anti-Gaming Guards

| Guard | Rule |
|-------|------|
| Rep ceiling | No set above 50 reps earns volume FP beyond 50 |
| Session floor | Sessions <15 min = 50% base FP |
| Baseline manipulation | Rolling avg self-corrects; max +50 FP/session |
| Rapid PR detection | Weight jumps >40% with no history → delayed PR |

---

## Cardio FP Rates

| Type | Base Rate | Min Duration | Max Duration | Completion Bonus |
|------|-----------|--------------|--------------|------------------|
| LISS | 2 FP/min | 20 min | 60 min | +20 FP |
| HIIT | 4 FP/min | 10 min | 30 min | +30 FP |
| Hybrid | 3 FP/min | 15 min | 45 min | +25 FP |
| Sport | 1.5 FP/min | 20 min | 90 min | +15 FP |

### Cardio FP Types

| Cardio Type | Primary FP | Secondary FP |
|-------------|-----------|--------------|
| LISS | Vigor | Focus |
| HIIT | Speed | Vigor |
| Hybrid | Speed + Power | Vigor |
| Sport | Vigor + Speed | Focus |

---

## Single Source of Truth: FP Config

All FP values must be in one file:

```typescript
// src/config/fp-values.ts
export const FP_CONFIG = {
  base: {
    completion: 100,
    deload: 80,
    shortSession: 50,
  },
  volume: {
    divisor: 10,  // 1 FP per 10 reps
    repCeiling: 50,
  },
  pr: {
    weight: 50,
    rep: 25,
  },
  streak: {
    multiplierBase: 1.0,
    multiplierPerDay: 0.1,
    multiplierMax: 2.0,
    dailySpirit: 5,
    milestones: {
      7: 15,
      14: 30,
      30: 50,
    },
  },
  modifiers: {
    slowTempo: 15,
    pauseReps: 15,
    dropSet: 20,
    restPause: 10,
    reducedRest: 10,
    singleLimb: 15,
    gymRush: 10,
  },
  stat: {
    tier1: 5,   // 1-10
    tier2: 8,   // 11-25
    tier3: 12,  // 26-50
    spirit: 10,
  },
  evolution: {
    baseEvoXP: 10,
    evoXPPerFP: 50,
    thresholds: [0, 500, 2000, 5000],
  },
  battle: {
    typeAdvantage: 1.3,
    typeDisadvantage: 0.8,
    baseCritChance: 0.05,
    critPerFocus: 0.005,
    baseAccuracy: 0.95,
    accuracyPerFocus: 0.002,
    baseHP: 100,
    hpPerVigor: 10,
  },
} as const;
```

---

## Collaboration Triggers

| When | Hand Off To |
|------|-------------|
| Displaying FP breakdowns | mobile-specialist |
| Storing FP/game state | state-architect |
| Persisting workout logs | database-specialist |
| Celebration triggers | ui-gamification-specialist |

---

## Don't Forget

1. **All values in config file** — no magic numbers in code
2. **Err generous early** — FP should feel rewarding
3. **Test edge cases** — 0 stats, max stats, broken streaks
4. **Log calculations** — debugging player reports
5. **Unit test every formula** — comprehensive coverage

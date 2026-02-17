# Forge Points (FP) Economy

> Sources: PRD v2.0 §3.2 · Addendum v2.1 §B · Timer Amendment §1

---

## Overview

Forge Points are the **single currency** bridging the workout tracker and the pet system. They are earned exclusively through logged workouts and **cannot be purchased**.

---

## FP Earning Formula

| FP Source | Calculation | Example | Rationale |
|-----------|-------------|---------|-----------|
| **Base Completion** | Flat 100 FP per completed workout | 100 FP | Rewards showing up |
| **Volume Bonus** | 1 FP per 10 reps logged | ~25 FP for 250 reps | Rewards effort |
| **Streak Multiplier** | 1.0x base, +0.1x per streak day, max 2.0x | 1.5x at 5-day streak | Most powerful consistency incentive |
| **PR Bonus** | 50 FP per personal record | 50 FP for new max | Celebrates milestones |
| **Quest Bonus** | 25 FP for weekly quest completion | 25 FP | Prevents routine staleness |

**Example session:** Push A (100 base) + 280 reps (28 volume) + 4-day streak (1.4x) + 1 PR (50) = (100 + 28 + 50) × 1.4 = **249 FP**

### Sanity Checks
- Rep counts above 50 per set are flagged — no volume bonus
- Sessions under 10 minutes earn reduced base FP

---

## Typed FP

Each workout generates **Typed Forge Points** based on muscle groups trained:

| Workout Type | FP Types Generated |
|--------------|-------------------|
| Push (Chest/Shoulders) | Power + Focus |
| Pull (Back/Traps) | Guard + Focus |
| Legs (Quads/Hams) | Speed + Vigor |
| Streak consistency | Spirit (exclusively) |

Imbalanced training → specialized but potentially vulnerable pet in battle.

---

## Relative Effort Scaling (Personal Baseline System)

> **This is the most critical balance system in the entire product.** It determines whether Iron Quest feels fair for a beginner and a 10-year veteran using the same app.

### The Problem

Linear FP scaling by weight lifted is fundamentally broken:
- Beginners feel the game is unfairly slow
- Veterans who plateau or deload feel punished

### The Solution: Personal Baseline (PB)

Every player has a **Personal Baseline** per exercise:
1. First 3 sessions → recorded (weight, reps, volume)
2. After 3 sessions → average becomes baseline
3. FP calculated **relative to baseline**, not absolute numbers
4. Baseline updates via rolling average weighted toward recent sessions

| FP Source | How It Scales | Beginner Example | Veteran Example |
|-----------|---------------|------------------|-----------------|
| **Base Completion** | Flat 100 FP | 100 FP | 100 FP |
| **Volume vs Baseline** | % above/below personal baseline | 65→70 lb = +8% = +8 FP | 225→230 lb = +4% = +4 FP |
| **Personal Record** | 50 FP for any new PR | 70 lb first time = +50 FP | 8 reps at 225 (first) = +50 FP |
| **Rep PR** | 25 FP for beating rep record at specific weight | 12 reps at 65 (was 10) = +25 FP | 6 reps at 225 (was 5) = +25 FP |
| **Streak Multiplier** | Same for all: 1.0x + 0.1x/day, max 2.0x | 1.3x at 3-day streak | 1.3x at 3-day streak |
| **Training Variable Bonus** | 15 FP for logging a modifier | Slow eccentric: +15 FP | 4-sec tempo: +15 FP |

> **KEY INSIGHT:** A beginner going from 65→70 lbs and a veteran going from 225→230 experience the same relative challenge and earn the same PR bonus.

---

## Training Variable Modifiers

| Modifier | What It Means | FP Bonus | How to Log |
|----------|---------------|----------|------------|
| **Slow Tempo** | 3–4+ sec eccentric | 15 FP/exercise | Toggle before exercise; timer validates |
| **Pause Reps** | 1–3 sec hold at hardest point | 15 FP/exercise | Toggle before exercise |
| **Drop Set** | Reduce weight mid-set, continue | 20 FP/drop set | Log as special set type |
| **Rest-Pause** | Brief 10–15s rest then continue set | 10 FP/rest-pause set | Log as special set type |
| **Reduced Rest** | 25%+ shorter rest than programmed | 10 FP | Auto-detected by timer |
| **Single-Limb** | Unilateral variation of bilateral exercise | 15 FP/exercise | Exercise tagged as unilateral |

---

## Deload & Recovery Recognition

When session volume is **>30% below baseline**, the app offers a **"recovery session" tag**:
- Tagged recovery sessions earn flat **80 FP** (no volume penalty)
- Don't negatively affect rolling baseline
- Tag is **opt-in** — player can skip if it was just a bad day

---

## Anti-Gaming Measures

| Guard | Rule |
|-------|------|
| **Rep ceiling** | No set above 50 reps earns volume FP beyond 50 |
| **Session floor** | Sessions under 15 minutes = 50% base FP |
| **Baseline manipulation** | Rolling average self-corrects in 2–3 sessions; max volume bonus capped at +50 FP/session |
| **Rapid PR detection** | Weight jumps >40% with no history → PR delayed until confirmed next session |

---

## Spirit FP Rules (Exclusive)

> **Spirit FP is earned ONLY through the streak system. No exercise, cardio, food, or shop purchase generates Spirit FP.**

| Spirit Source | FP Amount | Frequency | Intent |
|---------------|-----------|-----------|--------|
| **Daily Streak** | 5 Spirit FP per consecutive training day | Daily | Core drip |
| **Streak Milestones** | 15 FP (7-day), 30 FP (14-day), 50 FP (30-day) | On milestone | Celebrates long streaks |
| **Weekly Completion** | 10 Spirit FP if all scheduled workouts completed | Weekly (Sunday) | Rewards program adherence |
| **Monthly Consistency** | 25 Spirit FP if 90%+ scheduled workouts done | Monthly | The long game |

**Monthly estimate (6-day PPL, perfect consistency):** ~240 Spirit FP → ~24 Spirit stat points (at 10 FP/point). Grows at roughly **half the rate** of physical stats — intentionally the slowest, most prestigious stat.

---

## Cardio FP Mapping (Corrected)

> As amended by Timer Amendment §1 — Spirit removed from all cardio FP generation.

| Cardio Type | Primary FP | Secondary FP | Rationale |
|-------------|-----------|--------------|-----------|
| **LISS** (Walking, Easy Cycling) | Vigor | Focus | Meditative → mental clarity |
| **HIIT** (Sprints, Intervals, Rowing) | Speed | Vigor | Explosive → speed attributes |
| **Hybrid Conditioning** (Circuits, KB Swings) | Speed + Power | Vigor | Loaded movements justify Power |
| **Sport / Activity** (Basketball, Hiking) | Vigor + Speed | Focus | Coordination → Focus (not Spirit) |

### Cardio FP Rates

| Component | LISS | HIIT | Hybrid | Sport |
|-----------|------|------|--------|-------|
| **Base Rate** | 2 FP/min | 4 FP/min | 3 FP/min | 1.5 FP/min |
| **Min Duration** | 20 min | 10 min | 15 min | 20 min |
| **Duration Cap** | 60 min | 30 min | 45 min | 90 min |
| **Completion Bonus** | +20 FP | +30 FP | +25 FP | +15 FP |
| **Streak Multiplier** | Same as lifting | Same as lifting | Same as lifting | Same as lifting |

**Examples:**
- 30-min LISS walk = (30 × 2) + 20 = 80 FP. With 5-day streak (1.5x): **120 FP**
- 20-min HIIT = (20 × 4) + 30 = 110 FP. With same streak: **165 FP**

> Lifting (150–250 FP) should always out-earn cardio alone. Lifting is the primary FP engine; cardio is a meaningful supplement.

---

## FP Spending Destinations

FP is spent on **two shop systems** sharing one currency:

| Shop | What You Buy | Purpose |
|------|-------------|---------|
| **Functional** | Stat allocation, feeding, pet training | Battle power |
| **Cosmetic** | Color palettes, particle effects, accessories, evolution skins | Personal expression |

This creates a genuine spending tension: stats vs. looks. That tension is the point.

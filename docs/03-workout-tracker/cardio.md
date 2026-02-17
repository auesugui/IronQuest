# Cardio Integration

> Sources: Tracker Spec §4 · Timer Amendment §1

---

## Philosophy

Cardio is a **first-class citizen**, not an afterthought. Players doing cardio alongside lifting — or as primary training — earn meaningful FP and see their pet benefit.

---

## Cardio FP Mapping (Corrected per Timer Amendment)

| Cardio Type | Primary FP | Secondary FP | Rationale |
|-------------|-----------|--------------|-----------|
| **LISS** (Walking, Easy Cycling, Light Jog) | Vigor | Focus | Meditative → improves concentration |
| **HIIT** (Sprints, Intervals, Rowing) | Speed | Vigor | Explosive → speed-based attributes |
| **Hybrid Conditioning** (Circuits, KB Swings) | Speed + Power | Vigor | Loaded movements justify Power |
| **Sport / Activity** (Basketball, Hiking) | Vigor + Speed | Focus | Coordination → Focus (not Spirit) |

> **Spirit removed from all cardio FP generation.** Spirit is earned only through the streak system.

---

## Cardio Loadout Screen

Before starting, the player selects:
- **Cardio type** (LISS, HIIT, Hybrid, Sport/Activity)
- **Target duration**
- For HIIT: configure interval structure (e.g., 30s work / 60s rest, 8 rounds)

Shows estimated FP range + which pet stats benefit.

---

## Cardio Session Screens

| Type | Session Screen | Player Interaction |
|------|---------------|-------------------|
| **LISS** | Large running timer. FP accumulating at duration milestones | Start/stop. Optional RPE every 10 min |
| **HIIT** | Interval timer (red = work, blue = rest). Round counter + audio cues | Start only. Timer handles everything. Optional RPE per round |
| **Hybrid** | Circuit exercise list + running timer | Log reps per exercise (like lifting). Rest between rounds |
| **Sport / Activity** | Simple running timer + duration milestones | Start, stop, optional description. RPE at end |

---

## FP Calculation

| Component | LISS | HIIT | Hybrid | Sport |
|-----------|------|------|--------|-------|
| **Base Rate** | 2 FP/min | 4 FP/min | 3 FP/min | 1.5 FP/min |
| **Min Duration** | 20 min | 10 min | 15 min | 20 min |
| **Duration Cap** | 60 min (120 max) | 30 min (120 max) | 45 min (135 max) | 90 min (135 max) |
| **Completion Bonus** | +20 FP | +30 FP | +25 FP | +15 FP |
| **Streak Multiplier** | Same as lifting | Same as lifting | Same as lifting | Same as lifting |

### Examples
- **30-min LISS walk:** (30 × 2) + 20 = 80 FP → with 5-day streak (1.5x): **120 FP**
- **20-min HIIT:** (20 × 4) + 30 = 110 FP → with 5-day streak (1.5x): **165 FP**

> Full lifting session (150–250 FP) should always out-earn cardio alone. Lifting is the primary FP engine.

---

## Mixed Days

- Players can do **both** a lifting and cardio session on the same day
- Each generates FP independently
- Streak multiplier applies to both
- Appear separately in workout history; daily FP summary combines them

# Pet System — Care & Stats

> Sources: PRD v2.0 §4.1 · Addendum v2.1 §§A1, A5, A6

---

## The Den

The Den is the pet's home screen showing:
- The creature in its environment
- Current mood, stats, hunger level
- Available Forge Points to spend

---

## Feeding

| Food Item | FP Cost | Effect | Notes |
|-----------|---------|--------|-------|
| Basic Ration | 10 FP | Restores 1 hunger bar | Cheap, always available |
| Protein Pack | 25 FP | Restores 2 hunger + small XP boost | Efficient maintenance |
| Power Meal | 50 FP | Full hunger restore + mood boost | Temporary stat buff for next battle |
| Rare Treat | 100 FP | Full restore + bonus evolution XP | Unlocked after tower floor 25 |

### Hunger Mechanics
- Decays ~1 bar per 24 hours
- Hungry pet → reduced mood → lowered Spirit stat → weaker battle buffs
- Starving pet (0 hunger for 48+ hours) → stops gaining XP from stat allocation
- **Missing a day or two is recoverable with a single meal**

> Hunger is a nudge, not a punishment. The pet doesn't die or lose stats permanently.

### Auto-Feed System (Addendum v2.1 Decision A1)

- Toggle in settings
- When enabled: cheapest food auto-applied when hunger drops below 50%
- Players can still manually feed premium food for stat buffs
- **Emotional connection comes from cosmetic customization, not feeding rituals**

---

## Stat Allocation (Primary Spending Mechanic)

Players spend **Typed Forge Points** to raise pet battle stats:

| Pet Stat | FP Type Required | Battle Effect | Cost/Point | Visual Influence |
|----------|-----------------|---------------|-----------|-----------------|
| **Power** | Push (Chest/Shoulders) | Physical attack damage | 5 FP | Spikier edges, larger core |
| **Guard** | Pull (Back/Traps) | Damage reduction | 5 FP | Thicker outline, layered forms |
| **Speed** | Legs (Quads/Hams) | Turn order, dodge chance | 5 FP | Elongated shape, motion lines |
| **Vigor** | Legs (Core/Calves) | Max HP, stamina regen | 5 FP | Symmetrical, stable base |
| **Focus** | Push + Pull (Arms) | Crit rate, ability accuracy | 5 FP | Sharp points, eye details |
| **Spirit** | Streak consistency only | Special ability power, passive buffs | **10 FP** | Glow intensity, particles |

### Scaling Costs

| Stat Range | Cost per Point |
|-----------|---------------|
| 1–10 | 5 FP each |
| 11–25 | 8 FP each |
| 26–50 | 12 FP each |

> Spirit costs **double** and can only be earned from streak FP. A high Spirit pet proves weeks of consistency.

---

## Pet Training (Mini-Interactions)

- Quick animations in The Den: pet performs an exercise (visual echo of real workout)
- Cost: 15–30 FP per session (~10 seconds of animation)
- Stat gain: ~60% efficiency vs. direct allocation
- **But earns Evolution XP**, which direct allocation does not

**Trade-off:** Direct allocation = better for battle stats. Training = the primary way to push toward next evolution.

---

## Mood System

Mood ranges: **Ecstatic → Miserable**

### Mood Influences
- Hunger level
- Recent feeding
- Recent real workout
- Recent Den interaction

### Mood Effects
- High mood → Spirit bonus + happy idle animations (bouncing, glowing)
- Low mood → Spirit reduction + dim, sluggish movement
- Recovery: **one feeding + one workout** restores to neutral

> Goal: make the player feel good about caring for their pet, not guilt them for missing a day.

---

## Vacation Mode (Decision A5)

> **Philosophy:** Iron Quest should always feel like an app that wants you to come back, never one that punishes you for leaving.

### Planned Vacation (Toggle in Settings)
- Set vacation period (1–30 days)
- Hunger decay **pauses completely**
- Streak resets forgiven (resumes on return)
- Pet enters visible "resting" animation

### Notifications
- Halfway through: "Your pet is resting up! Ready to get back to it?"
- Return date: "Welcome back! Your pet missed you."

### Unplanned Absence
- Hunger still decays slowly, but pet never drops below "drowsy" state
- **No stat loss, no permanent consequences**
- One feeding restores everything on return
- Streak resets, but app celebrates: "Welcome back, warrior. Let's rebuild that streak"

### Rules
- Vacation mode does **not** generate FP or progress
- Simply freezes decay — the only way forward is training

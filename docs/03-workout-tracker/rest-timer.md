# Smart Rest Timer System

> Sources: Timer Amendment §2 · Tracker Spec §3.1

---

## Design Principles

| Principle | Meaning |
|-----------|---------|
| **Tool, not a judge** | Helps track rest, never punishes for delays |
| **No FP penalty** | Extended rest never reduces FP earnings |
| **Rest ≠ delay** | System distinguishes intentional rest from situational pauses |
| **Zero-tap handling** | Common interruptions handled with one tap max |

> **PHILOSOPHY:** Iron Quest rewards effort quality, not speed. Rest as long as you need.

---

## Timer Modes

### 1. Active Rest (Default)

Standard countdown that starts automatically after logging a set.

- Counts down from programmed rest (e.g., 90s compounds, 60s accessories)
- Audio/haptic cues at 10s remaining and at 0s
- At zero → single gentle chime → transitions to **"Ready when you are"** state
- Then counts **UP** in muted gray as passive reference (not a stress indicator)

> **KEY CHANGE:** No insistent beeping or flashing warnings at zero. Just a calm transition.

### 2. Pause Mode

**Single tap** on timer (or pause icon) → countdown freezes.

- Universal solution: equipment wait, bathroom, water, conversation, rack adjustment
- No limit on pause duration
- Paused time tracked as "transition time" (visible in history, zero FP impact)
- Resuming = single tap. Countdown resumes from where it left off

### 3. Extend Mode

**Long press** or tap **"+30s"** button → adds 30 seconds to current countdown.

- For when you need slightly more recovery without full pause
- Extension logged as additional rest time. No FP impact

---

## Smart Timer Behaviors

### Equipment Transition Detection

When the next exercise uses different equipment, the timer automatically adds a **transition buffer**:

| Transition Scenario | Default Buffer | Customizable | Example |
|--------------------|----------------|-------------|---------|
| Same exercise, next set | 0s | No | Set 2 of DB Press |
| Same equipment, different exercise | +15s | Yes | DB Press → DB Flyes |
| Different equipment, same area | +30s | Yes | DB Press → Barbell Rows |
| Different area of gym | +45s | Yes | Free weights → cable station |
| Major equipment change | +60s | Yes | Squat rack → dumbbell area |

Display: **"Rest: 90s + Setup: 30s"** — player sees why timer is longer.

> Requires exercises tagged with equipment type (dumbbell, barbell, cable, machine, bodyweight, bench, rack). Home gym users can disable transition buffers entirely.

### Overrun Handling

| Time Past Zero | Behavior |
|---------------|----------|
| 0–3 min | Passive gray count-up. No alerts, no notifications |
| 3 min | Single non-intrusive prompt: "Still going? Tap when ready." |
| 10 min | Session auto-pauses. Notification: "Session paused. Tap to resume whenever you're ready." |

### Gym Rush Mode

- Accessible from session settings (gear icon in top zone)
- Cuts all rest times by **25%**, hides transition buffers
- Can be toggled **mid-session**
- Earns **Reduced Rest Period FP bonus (+10 FP/exercise)**

---

## Timer Visual Design

| State | Visual | Sound/Haptic | Player Feeling |
|-------|--------|-------------|----------------|
| **Counting Down (>10s)** | Calm blue gradient. Circular progress ring depleting | None. Silent | Relaxed, recovering |
| **Approaching Ready (10s–0s)** | Ring transitions blue → soft gold. Subtle pulse | Gentle pulse haptic at 10s, soft chime at 0s | Aware rest is ending |
| **Ready (0s)** | Full gold ring. "Ready when you are" text | Single chime, then silence | Clear signal, zero urgency |
| **Overrun (past 0s)** | Muted gray count-up. Smaller font | Completely silent | Informational only |
| **Paused** | Frozen display. "Paused" badge. Muted colors | None | On hold, no judgment |
| **Transition Buffer** | Two-segment ring: blue (rest) + purple (setup) | Chime when full timer hits zero | App understands you're moving equipment |

---

## FP Interaction

**Rest time and pause time have ZERO impact on FP calculations.**

FP is calculated from:
- Reps completed
- Weight used
- Personal baseline comparison
- Intent modifiers
- Streak multiplier

**Never from time.** A player resting 60s and a player resting 4 minutes earn identical FP for the same work.

The only timer-related FP bonus is **Reduced Rest Period** (Gym Rush Mode), which is purely additive and never penalizes normal rest.

---

## Session Duration Tracking

Total session duration is tracked for the player's records (not FP):

| Category | What It Measures |
|----------|-----------------|
| **Active Time** | Time performing sets (estimated from set count × avg duration) |
| **Rest Time** | Time in Active Rest mode (countdown running) |
| **Transition Time** | Time in Pause Mode, overrun, and equipment transition buffers |

Available in workout history. Never used as judgment.

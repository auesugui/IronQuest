# Workout Session Flow

> Sources: Tracker Spec §§1–3, 5 · PRD v2.0 §3.1

---

## Session Lifecycle

```
Quest Board → Loadout Screen → "Begin Quest" → In-Session → Post-Session Summary
```

---

## 1. Template Library

Templates solve the **cold-start problem**: new user → pick a template → training within 60 seconds.

### Resistance Training Templates

| Template | Split | Days | Level | Primary FP | Description |
|----------|-------|------|-------|-----------|-------------|
| Powerbuilding PPL | Push/Pull/Legs | 6 | Intermediate | Balanced | Default program. Heavy compounds + rest-pause |
| PPL Home Edition | Push/Pull/Legs | 6 | Intermediate | Balanced | Dumbbell + bench only |
| Upper / Lower | Upper/Lower | 4 | Beginner+ | Power + Guard | Classic 4-day. Good entry point |
| Full Body Basics | Full Body | 3 | Beginner | Even, lower vol | Compound-focused, moderate FP |
| Bro Split | Body Part | 5–6 | Intermediate | Varies | Traditional BB split |
| Strength Focus | Powerlifting | 4 | Intermediate+ | Power + Speed | SBD + OHP focused |
| Hypertrophy Block | PPL | 6 | Intermediate | Balanced, high vol | Max total FP from volume bonuses |
| Minimalist | Full Body | 2–3 | Beginner | Even, very low | 30-min sessions for busy schedules |

### Cardio Templates

| Template | Type | Days | Primary FP | Description |
|----------|------|------|-----------|-------------|
| LISS Steady State | Cardio | 2–4 | Vigor + Focus | Walking, easy cycling. 30–60 min |
| HIIT Intervals | Cardio | 2–3 | Speed + Vigor | Sprints, rowing. Highest FP/minute |
| Hybrid Conditioning | Mixed | 1–2 | Speed + Vigor + Power | KB swings, burpees, circuits |

### Template Management

| Action | What It Does |
|--------|-------------|
| **Adopt** ("Start This Program") | Adds to active programs (max 3 active). Shows on Quest Board |
| **Copy & Customize** ("Make It Mine") | Editable copy. Swap/reorder/add exercises. Radar chart updates live |
| **Build From Scratch** | Blank slate. Exercise search + muscle group filtering + radar preview |

> Every template card shows a **radar chart** of FP distribution across 6 pet stats — turns workout selection into a strategic game decision.

---

## 2. Pre-Session (Loadout Screen)

Everything distracting is handled **before** the session starts. After "Begin Quest," interactions are limited to: log reps, advance set, note weight.

### Loadout Components

| Component | Purpose |
|-----------|---------|
| **Workout Preview** | Today's exercise list + target sets/reps + last weight |
| **Session Intent** | Multi-select toggles setting default modifier for all exercises |
| **Quick Adjustments** | Swap/skip exercises before starting (same muscle-group alternatives) |
| **FP Forecast** | Estimated FP range ("~130–180 FP expected") |
| **Begin Quest** | Locks loadout, starts session timer |

### Session Intent Modifiers

| Intent | Meaning | FP Bonus | Validation |
|--------|---------|----------|------------|
| **Normal** | Standard training (default) | None | None |
| **Tempo Focus** | 3–4 sec slow eccentrics | +15 FP/exercise | Timer tracks set duration |
| **Pause Reps** | 1–3 sec hold at hardest point | +15 FP/exercise | Optional "Paused? Yes/No" confirm |
| **Deload** | Intentional recovery session | Flat 80 FP total | Trust the player |
| **Drop Sets** | Weight reductions mid-set | +20 FP/drop set | "Drop" button appears next to rep input |
| **Rest-Pause** | 10–15s micro-rests within sets | +10 FP/RP set | "Pause & Continue" button + micro-timer |

Intents are **stackable** (e.g., Tempo + Drop Sets). Active intents display as small badges at the top of the session screen.

> Intent selection is optional. Tapping "Begin Quest" with Normal is identical to a standard workout tracker.

---

## 3. In-Session Experience

Designed for **one-handed operation with sweaty fingers**.

### Screen Layout

| Zone | Contents |
|------|----------|
| **Top (Glanceable)** | Exercise name + set counter, active intent badge, progress bar, FP accumulator |
| **Middle (Action)** | Weight input (±5 lb buttons), rep input (large numpad), Log Set button (full-width, haptic) |
| **Bottom (Context)** | Rest timer, next exercise preview, collapsible quick notes |

> **3-SECOND RULE:** Logging a set must be completable in 3 seconds: glance at reps → tap number → hit Log.

### Key Behaviors

| Feature | How It Works |
|---------|-------------|
| **Auto-Advance** | After last set of an exercise, auto-advances to next exercise after rest timer completes |
| **Weight Memory** | Pre-fills last session's weight. If progressive overload is due, shows gold ↑ arrow with suggested weight |
| **Superset Support** | Groups superset exercises, alternates automatically. Short transition (no full rest) between A→B, full rest after B |
| **Per-Exercise Override** | Tap icon next to exercise name to cycle intent for that exercise only |
| **Skip Exercise** | Swipe left (+ confirm). Logged as skipped, no FP |
| **Add Exercise** | "+" button in bottom zone. Adds to end of session |

---

## 4. Post-Session Summary

Feels like a **victory screen** after a boss fight, not a clinical data readout.

### Components

| Element | Detail |
|---------|--------|
| **Quest Complete banner** | Animated text + confetti/particle effect (2s) |
| **Session stats** | Duration, total volume, sets completed, exercises completed |
| **FP breakdown** | Each line animates in sequentially (base, volume, intent, streak, PR) |
| **Typed FP radar** | Animates from empty → filled. Shows which pet stats this session fed |
| **PR callouts** | Gold flash + "NEW PR!" badge |
| **Streak update** | Current streak + multiplier. Milestones (3, 7, 14, 30) celebrated with animation |
| **Next action prompt** | "Head to The Den" / "Your pet is hungry!" / "Rest up for tomorrow" |

### Quick Actions

- **Go to The Den** — spend FP immediately while satisfaction is fresh
- **Done** — FP banked for later. No pressure

> Summary screen requires a deliberate tap to dismiss — prevents skipping past FP breakdown and PR celebrations.

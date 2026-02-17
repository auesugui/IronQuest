# Exercise Database & Tagging

> Sources: Tracker Spec §6 · PRD v2.0 §3.3

---

## Muscle Group → FP Type Mapping

| Muscle Group | FP Type | Tag Weight | Example Exercises |
|-------------|---------|-----------|------------------|
| Chest | Power | Primary | Bench Press, DB Flyes, Push-ups |
| Shoulders | Power | Primary | OHP, Lateral Raises, Face Pulls |
| Back (Lats/Rhomboids) | Guard | Primary | Rows, Pull-ups, Pullovers |
| Traps | Guard | Secondary | Shrugs, Deadlifts (secondary) |
| Quads | Speed | Primary | Squats, Lunges, Leg Press |
| Hamstrings | Speed | Primary | RDL, Leg Curls, Nordic Curls |
| Calves | Vigor | Secondary | Calf Raises, Box Jumps |
| Core / Abs | Vigor | Primary | Planks, Leg Raises, Ab Rollouts |
| Biceps | Focus | Primary | Curls, Chin-ups (secondary) |
| Triceps | Focus | Primary | Pushdowns, Dips, CGBP |

### Tagging Rules

- Each exercise has **1 Primary tag** (full FP rate) + up to **2 Secondary tags** (30% FP rate)
- Example: Barbell Rows = Primary: Back (Guard), Secondary: Biceps (Focus), Secondary: Traps (Guard)
- **All exercises must have at least one tag** — untagged exercises cannot generate typed FP

---

## Auto-Tagging

When creating a custom exercise, the app auto-suggests tags via **fuzzy name match** against a dictionary of common exercises.

Example: "Incline DB Press" → Primary: Chest (Power), Secondary: Shoulders (Power), Secondary: Triceps (Focus)

Player can accept, modify, or override.

---

## Default Program

The app ships with the **6-Day Powerbuilding PPL (Home Dumbbell + NordStick Edition)** pre-loaded. All exercises pre-tagged with primary and secondary muscle groups.

---

## Spirit FP Generation

Spirit FP comes **exclusively from the streak system** — not from any exercise or muscle group. See [FP Economy → Spirit FP Rules](../02-forge-points/fp-economy.md#spirit-fp-rules-exclusive).

# Iron Quest — Documentation Index

> **Version:** 2.0 + Addendum 2.1 + Amendments | **Status:** Planning Phase | **Updated:** February 2026

---

## Quick Navigation

| Section | Doc | Key Contents |
|---------|-----|-------------|
| Product Overview | [01 — Product Overview](01-product-overview/product-overview.md) | Vision, core loop, design pillars, target user |
| Forge Points | [02 — FP Economy](02-forge-points/fp-economy.md) | Earning formula, typed FP, relative scaling, Spirit rules, cardio FP, anti-gaming |
| Workout Tracker | [03 — Session Flow](03-workout-tracker/session-flow.md) | Templates, loadout, in-session UX, post-session summary |
| | [03 — Rest Timer](03-workout-tracker/rest-timer.md) | 3 timer modes, equipment transitions, overrun handling, Gym Rush |
| | [03 — Cardio](03-workout-tracker/cardio.md) | Cardio types, FP mapping, session screens, calculation |
| | [03 — Exercise Database](03-workout-tracker/exercise-database.md) | Muscle group → FP type mapping, auto-tagging |
| Pet System | [04 — Pet Care](04-pet-system/pet-care.md) | Feeding, stat allocation, training, mood, vacation mode |
| | [04 — Evolution & Rendering](04-pet-system/evolution-and-rendering.md) | 4 evolution stages, SVG pipeline, stat-driven geometry |
| | [04 — Pet Types](04-pet-system/pet-types.md) | Ferro/Terra/Flux, type advantages (1.3x/0.8x) |
| Battle Tower | [05 — Tower](05-battle-tower/tower.md) | Floor tiers, auto-battle, attempts, prestige system |
| Game Systems | [06 — Cosmetics, Achievements, Quests](06-game-systems/cosmetics-achievements-quests.md) | Shop structure, achievement badges, weekly quests |
| UX Design | [09 — UX Specification](09-ux-design/ux-spec.md) | Emotional arc, animation timing, haptics, color language, accessibility, anti-patterns |
| Technical | [07 — Architecture & Roadmap](07-technical/architecture-and-roadmap.md) | Tech stack, data model, phases, estimates, risks |
| | [07 — Implementation Priority](07-technical/implementation-priority.md) | P0/P1/P2 build order by phase |
| | [07 — State Architecture](07-technical/state-architecture.md) | Zustand stores, TypeScript interfaces, selector patterns, persistence |
| | [07 — Local Schema](07-technical/local-schema.md) | Entity schemas, AsyncStorage keys, offline-first rules, migrations |
| Decisions | [08 — Decisions Log](08-decisions/decisions-log.md) | 7 resolved decisions, amendments, future ideas |

---

## Quick-Reference: Core Design Rules

| Rule | Detail | Source |
|------|--------|--------|
| **Tracker First, Game Second** | Workout logging is the highest priority. Game layer is a reward, not a requirement | PRD §1.3 |
| **3-Second Rule** | Logging a set must be completable in 3 seconds | Tracker Spec §3.1 |
| **No FP from Money** | FP earned exclusively through logged workouts. Cannot be purchased | PRD §3.2 |
| **Rest Time ≠ FP** | Rest and pause time have zero impact on FP calculations | Timer Amendment §2.6 |
| **Spirit = Streak Only** | Spirit FP earned only through streak system — no exercise or cardio | Timer Amendment §1.2 |
| **No Punishment for Absence** | Pet never dies or loses stats permanently. Vacation mode freezes decay | Addendum §A5 |
| **Self-Contained** | No integration with external workout apps. Owns the full data pipeline | Addendum §A4 |

---

## Quick-Reference: FP Earning Summary

| Source | FP Amount | Type |
|--------|-----------|------|
| Base completion | 100 FP flat | Generic |
| Volume bonus | 1 FP per 10 reps | Generic |
| Personal record | 50 FP | Generic |
| Rep PR (same weight) | 25 FP | Generic |
| Streak multiplier | 1.0x + 0.1x/day, max 2.0x | Multiplier |
| Training variable (tempo, pause, etc.) | 10–20 FP per exercise/set | Generic |
| Deload session | Flat 80 FP (no volume calc) | Generic |
| Quest bonus | 25 FP | Generic |
| Gym Rush Mode | +10 FP/exercise | Generic |

---

## Quick-Reference: Pet Stats

| Stat | Source Workout | Battle Effect | FP Cost | Visual |
|------|---------------|---------------|---------|--------|
| **Power** | Push (Chest/Shoulders) | Attack damage | 5 FP/pt | Spikier, larger core |
| **Guard** | Pull (Back/Traps) | Damage reduction | 5 FP/pt | Thicker, layered |
| **Speed** | Legs (Quads/Hams) | Turn order, dodge | 5 FP/pt | Elongated, motion lines |
| **Vigor** | Legs (Core/Calves) | Max HP, regen | 5 FP/pt | Symmetrical, stable |
| **Focus** | Arms (Biceps/Triceps) | Crit rate, accuracy | 5 FP/pt | Sharp points, eye detail |
| **Spirit** | Streak only | Special ability, buffs | **10 FP/pt** | Glow, particles |

Stat costs scale: 5 FP (1–10) → 8 FP (11–25) → 12 FP (26–50)

---

## Quick-Reference: Evolution Stages

| Stage | Name | EvoXP | Timeline | Shapes | Ability Slots |
|-------|------|-------|----------|--------|-------------|
| 1 | Shard | 0 | Day 1 | 3–4 polygons | 1 |
| 2 | Form | 500 | ~2–3 weeks | 6–8 shapes + gradients | 2 |
| 3 | Prime | 2,000 | ~6–8 weeks | Multi-shape + inner detail | 3 |
| 4 | Apex | 5,000 | ~16–20 weeks | Fractal recursion | 4 |

---

## Quick-Reference: Type Triangle

```
Ferro (Metal) → beats Flux → beats Terra → beats Ferro
```

| Matchup | Damage Dealt | Damage Taken |
|---------|-------------|-------------|
| Advantage | 1.3x | 0.8x |
| Disadvantage | 0.8x | 1.3x |
| Neutral | 1.0x | 1.0x |

---

## Quick-Reference: Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Native + Expo (Managed) |
| Language | TypeScript |
| Engine | Hermes |
| Pet Rendering | React Native SVG |
| Animations | Reanimated v3 (+ Skia Phase 2+, Rive Phase 3+) |
| State | Zustand |
| Storage | AsyncStorage |
| Backend | Supabase (Phase 3) |
| Notifications | Expo Notifications |

---

## Quick-Reference: Phase Timeline

| Phase | Scope | Hours | Weeks (10–15h/wk) |
|-------|-------|-------|--------------------|
| **1** | Tracker + Pet | ~155–205h | 10–20 weeks |
| **2** | + Battle Tower | ~240–320h total | 16–32 weeks |
| **3** | + Polish & Social | ~290–375h total | 19–37 weeks |
| **4** | Expansion | Post-launch | Ongoing |

---

## Source Documents (Originals)

| Document | Location | Purpose |
|----------|----------|---------|
| PRD v2.0 | [iron_quest_prd_v2.md](../iron_quest_prd_v2.md) | Master product requirements |
| Addendum v2.1 | [iron_quest_addendum_v2_1.md](../iron_quest_addendum_v2_1.md) | Resolved decisions, relative scaling, cosmetics |
| Tracker Spec | [iron_quest_tracker_spec.md](../iron_quest_tracker_spec.md) | Templates, session flow, cardio, exercise DB |
| Timer Amendment | [iron_quest_timer_amendment.md](../iron_quest_timer_amendment.md) | Spirit FP correction, smart rest timer system |

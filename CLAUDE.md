# IronQuest - Project Instructions

> **Version:** 1.1 | **Status:** Phase 1 Implementation (in progress) | **Updated:** July 2026

---

## Project Overview

**IronQuest** is a gamified workout tracking mobile application where every rep logged earns currency (Forge Points) to raise, feed, and strengthen a digital pet that battles its way up an endless tower.

**One-Line Pitch:** A workout tracker where every rep you log earns currency to raise, feed, and strengthen a digital pet that battles its way up an endless tower.

---

## Documentation Entry Point

**Start here:** [`docs/INDEX.md`](docs/INDEX.md)

The INDEX.md file contains:
- Complete navigation to all documentation sections
- Quick-reference tables for core design rules, FP earning, pet stats, evolution stages
- Links to the original PRD and amendment documents

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native + Expo (Managed) |
| **Language** | TypeScript (end-to-end) |
| **JS Engine** | Hermes |
| **Pet Rendering** | React Native SVG |
| **Animations** | Reanimated v3 (+ Skia Phase 2+, Rive Phase 3+) |
| **State Management** | Zustand |
| **Local Persistence** | AsyncStorage (MMKV removed for Expo Go compatibility) |
| **Backend** | Supabase (Phase 3) |
| **Notifications** | Expo Notifications |

---

## Core Design Rules

These principles must be upheld in all implementations:

| Rule | Detail |
|------|--------|
| **Tracker First, Game Second** | Workout logging is the highest priority. Game layer is a reward, not a requirement |
| **3-Second Rule** | Logging a set must be completable in 3 seconds |
| **No FP from Money** | FP earned exclusively through logged workouts. Cannot be purchased |
| **Rest Time ≠ FP** | Rest and pause time have zero impact on FP calculations |
| **Spirit = Streak Only** | Spirit FP earned only through streak system — no exercise or cardio generates it |
| **No Punishment for Absence** | Pet never dies or loses stats permanently. Vacation mode freezes decay |
| **Self-Contained** | No integration with external workout apps. Owns the full data pipeline |

---

## Development Phases

| Phase | Scope | Focus |
|-------|-------|-------|
| **Phase 1** | Tracker + Pet | Workout logging, FP engine, pet care, SVG renderer, evolution stages 1-2 |
| **Phase 2** | Battle Tower | Auto-battle engine, tower generation, ability system, evolution stages 3-4 |
| **Phase 3** | Polish + Social | Supabase backend, cloud sync, leaderboards, push notifications, share cards |
| **Phase 4** | Expansion | Multiple pets, PvP, custom builders, health integrations, seasonal events |

See [`docs/07-technical/architecture-and-roadmap.md`](docs/07-technical/architecture-and-roadmap.md) for detailed phase requirements.

---

## Agent Architecture

IronQuest uses a single collapsed engineer agent for Phase 1+ work — covering mobile, state, and game-logic layers. UX reference lives in `docs/09-ux-design/ux-spec.md` (not as an agent). Database/Supabase work is Phase 3 and deferred.

| When | Use |
|------|-----|
| Interactive pairing or AFK queue task | `ironquest-engineer` agent |

Agent definition: [`.claude/agents/ironquest-engineer.md`](.claude/agents/ironquest-engineer.md)

**Verification model:** Chrome DevTools MCP is the primary in-loop verification tool (token-cheap a11y snapshots). Playwright is frozen at the 4 golden-path specs and runs in CI — agents do not author new Playwright tests as part of routine task work.

---

## Key Files & Directories

```
/IronQuest
├── docs/                          # All PRD documentation
│   ├── INDEX.md                   # START HERE - Documentation entry point
│   ├── 01-product-overview/       # Vision, core loop, design pillars
│   ├── 02-forge-points/           # FP economy, earning, spending
│   ├── 03-workout-tracker/        # Session flow, rest timer, cardio, exercise DB
│   ├── 04-pet-system/             # Pet care, evolution, types, rendering
│   ├── 05-battle-tower/           # Tower mechanics, auto-battle
│   ├── 06-game-systems/           # Cosmetics, achievements, quests
│   ├── 07-technical/              # Architecture, roadmap, implementation priority
│   └── 08-decisions/              # Decision log, amendments
├── .claude/
│   └── agents/
│       └── ironquest-engineer.md  # Collapsed engineer agent (mobile + state + game-logic)
└── CLAUDE.md                      # This file
```

---

## Quick Reference: FP Sources

| Source | FP Amount | Type |
|--------|-----------|------|
| Base completion | 100 FP flat | Generic |
| Volume bonus | 1 FP per 10 reps | Generic |
| Personal record | 50 FP | Generic |
| Rep PR (same weight) | 25 FP | Generic |
| Streak multiplier | 1.0x + 0.1x/day, max 2.0x | Multiplier |
| Training variable | 10–20 FP per exercise/set | Generic |
| Spirit (streak only) | 5 FP/day + milestones | Spirit |

---

## Quick Reference: Pet Stats

| Stat | Source Workout | FP Cost | Visual Effect |
|------|---------------|---------|---------------|
| **Power** | Push (Chest/Shoulders) | 5 FP/pt | Spikier, larger core |
| **Guard** | Pull (Back/Traps) | 5 FP/pt | Thicker, layered |
| **Speed** | Legs (Quads/Hams) | 5 FP/pt | Elongated, motion lines |
| **Vigor** | Legs (Core/Calves) | 5 FP/pt | Symmetrical, stable |
| **Focus** | Arms (Biceps/Triceps) | 5 FP/pt | Sharp points, eye detail |
| **Spirit** | Streak only | **10 FP/pt** | Glow, particles |

---

## Implementation Priority

| Priority | Meaning |
|----------|---------|
| **P0** | Must ship in Phase 1 |
| **P1** | Should ship in target phase, critical for experience |
| **P2** | Nice-to-have, can slip without blocking launch |

See [`docs/07-technical/implementation-priority.md`](docs/07-technical/implementation-priority.md) for detailed feature priorities.

---

## Development Guidelines

1. **Read the docs first** - Always consult the relevant documentation in `docs/` before implementing
2. **Respect the design rules** - The core rules above are non-negotiable constraints
3. **Use the right agent** - Match tasks to specialized agents for best results
4. **Phase-aware development** - Don't implement Phase 3 features in Phase 1
5. **Type safety matters** - TypeScript end-to-end for game state, FP math, battle formulas
6. **Offline-first** - Local persistence with AsyncStorage + MMKV before cloud sync

---

*This file guides AI assistants working on IronQuest. For detailed requirements, always start with `docs/INDEX.md`.*

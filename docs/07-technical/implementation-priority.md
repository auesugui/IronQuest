# Implementation Priority

> Source: Tracker Spec §8

---

## Build Order

Aligned with PRD roadmap phases. Not all systems need to ship in Phase 1.

The **Status** column reflects what is actually in the codebase as of July 2026
(see git history and `src/`). Phase 1 P0/P1 items have shipped through PRs #2–#25;
Phase 2+ items remain unbuilt or are explicitly deferred.

| Feature | Phase | Priority | Status | Notes |
|---------|-------|----------|--------|-------|
| Core session flow (exercise list, rep logging, rest timer) | 1 | **P0** | **shipped** | `app/workout/session.tsx`; rest timer auto-starts on set log |
| Weight memory + auto-fill from last session | 1 | **P0** | **shipped** | `weightHistoryStore` + quick-tap auto-fill (#23) |
| Template browser (4 core: PPL, UL, Full Body, Minimalist) | 1 | **P0** | **shipped** | 5 templates in `src/data/templates.ts` |
| FP calculation engine (base + volume + streak) | 1 | **P0** | **shipped** | `src/engine/fp/calculator.ts`; streak/Spirit FP wired (#17) |
| Post-session summary with FP breakdown | 1 | **P0** | **shipped** | `app/workout/summary.tsx` (basic breakdown; richer spec UX pending) |
| Loadout screen with Session Intent (Normal + Deload only) | 1 | **P1** | **shipped** | `app/workout/loadout.tsx` (#4) |
| Copy & Customize template editing | 1 | **P1** | **shipped** | `app/workout/template-edit/` (#10) |
| Personal Baseline + relative FP scaling | 1 | **P1** | **shipped** | `baselineStore` (#2) |
| FP distribution radar chart on templates | 1 | **P1** | **shipped** | `src/components/progress/RadarChart.tsx` on template cards |
| Full Session Intent suite (Tempo, Pause, Drop Set, Rest-Pause) | 2 | **P1** | **planned** | Phase 2; Phase-2 intents teased as disabled on the loadout screen |
| Cardio session logging (all 4 types) | 2 | **P1** | **deferred** | Not started; pushed past Phase 1 (LISS→HIIT/Hybrid later) |
| Superset & circuit support | 2 | **P2** | **planned** | Phase 2 |
| Weekly quest system | 2 | **P2** | **planned** | Phase 2 |
| Build-from-scratch program editor | 2 | **P2** | **planned** | Phase 2; Copy & Customize covers most cases |
| Auto-tagging engine for custom exercises | 2 | **P2** | **planned** | Phase 2; manual tagging works for MVP |
| Progressive overload suggestions (gold arrow) | 3 | **P2** | **planned** | Phase 3; needs several weeks of data first |
| Expanded template library (8–10 total) | 3 | **P2** | **planned** | Phase 3; 4–5 templates cover MVP |

### Priority Legend

| Level | Meaning |
|-------|---------|
| **P0** | Must ship in Phase 1 |
| **P1** | Should ship in target phase, critical for experience |
| **P2** | Nice-to-have, can slip without blocking launch |

### Status Legend

| Status | Meaning |
|--------|---------|
| **shipped** | Implemented and present in the codebase |
| **in-progress** | Actively being built (partial) |
| **planned** | Scheduled for its target phase; not yet started |
| **deferred** | Explicitly pushed out of the current roadmap |

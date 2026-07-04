# Technical Architecture

> Sources: PRD v2.0 §§7, 8, 9, 10, 11 · Addendum v2.1 §D

---

## Platform: React Native (Expo)

Shifted from PWA-first (v1) to React Native via Expo. Reasons:
- Native push notifications (streak reminders, rest timer alerts)
- Haptic feedback (battle animations, evolution celebrations)
- Expo managed workflow + EAS (builds + OTA updates, no Xcode/Android Studio)
- React Native SVG + Reanimated for geometric pets
- Hermes for fast startup (critical when opening between sets)

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React Native + Expo (Managed) | Single codebase iOS/Android. EAS builds. OTA updates |
| **Language** | TypeScript (end-to-end) | Type safety for game state, FP math, battle formulas |
| **JS Engine** | Hermes (default in Expo) | Faster startup, lower memory |
| **Pet Rendering** | React Native SVG | Parameterized geometric shapes, stat-driven |
| **Animations** | React Native Reanimated v3 | 60fps pet idle, evolution morphs, battle sequences |
| **Advanced Graphics** | React Native Skia (Phase 2+) | Apex-stage particles/fractals. Not MVP |
| **Interactive Animations** | Rive (Phase 3+) | Evolution sequences, battle effects, celebrations |
| **State Management** | Zustand | Lightweight, no boilerplate. Game state + workout session |
| **Local Persistence** | AsyncStorage | Workout history, pet stats, FP, UI state. MMKV was removed for Expo Go compatibility — see [`state-architecture.md`](state-architecture.md) |
| **Backend** | Supabase (Phase 3) | Managed Postgres, auth, real-time (leaderboards). Not MVP |
| **Notifications** | Expo Notifications | Streak reminders, pet hunger, rest timer completion |

---

## Data Model

### Core Entities

| Entity | Key Fields |
|--------|-----------|
| **Player** | Profile, settings, total FP (generic + typed), streak data, achievements |
| **Pet** | Stats (Power/Guard/Speed/Vigor/Focus/Spirit), evolution stage, EvoXP, hunger, mood, visual seed, abilities, cosmetics |
| **WorkoutLog** | Timestamp, type, exercises (sets/reps/weight), duration, FP earned (generic + typed), PRs |
| **TowerProgress** | Current floor, best floor, attempt count, boss kills |
| **Achievement** | Unlocked IDs + timestamps |

> All entities should include UUIDs, `created_at`, `updated_at`, and soft delete flags from the start — designs for eventual cloud sync.

---

## Development Roadmap

### Phase 1: Tracker + Pet ✅ (Weeks 1–5, shipped July 2026)

**Goal:** A workout tracker you actually use every session + a pet that responds to training.

- Expo project scaffolding (TypeScript, Reanimated, RN SVG)
- Workout tracker: quest board, exercise flow, rep logging, rest timer
- FP calculation engine: base + volume + streak + PR detection
- The Den: pet home, idle animation, hunger, mood
- Feeding system (3–4 tiers)
- Stat allocation UI: spend typed FP, see visual changes live
- Pet SVG renderer: stat-driven geometric creature
- Evolution stages 1–2 (Shard, Form) with morph animation
- Local persistence (AsyncStorage)
- Pre-loaded 6-day PPL program

> **EXIT CRITERIA:** Use the app for every workout for 2 consecutive weeks. Tracker is faster than current method. Pet feels worth caring about.
>
> **Status:** Shipped July 2026 via PRs #2–#30. Audit (full due-diligence pass) verified the tracker core works end-to-end (3-second logging rule holds, FP math matches spec, PR detection fires correctly). Pet renderer works technically but did not yet meet the "feels worth caring about" bar — that's Phase 2's job.

### Phase 2: Pet Attachment (Weeks 6–10)

**Goal:** Make the pet worth caring about. The product's differentiator doesn't yet exist emotionally — this phase ships it.

Sequencing principle (from `AUDIT-AND-ROADMAP-2026-07.md`): **integrity → attachment → depth.** Phase 1 fixed integrity; this phase ships attachment; Phase 3 adds depth (Tower).

Scope (audit §4 items 8–12; Q1 type-system decision resolved 2026-07-03):

- **Pet type migration (5 → 3):** Replace `ignis/terra/aqua/ventus/umbra` in `src/types/index.ts` and `PetAvatar.tsx` with `ferro/flux/terra` (cyclic triangle, 1.3× advantage / 0.8× resistance). Tower copy already assumes 3 types.
- **Onboarding flow:** 3 screens — choose type, name pet, pick starting template. `petStore.initializePet` exists; UI only. App must route around the pet-uninitialized state (`app/index.tsx` currently redirects to tabs unconditionally).
- **Avatar identity pass:** Per-type silhouette (Ferro = compact hex, Terra = broad trapezoid, Flux = tall teardrop), face investment (eye system, blink, gaze-follow), readable builds (Power-spiky / Guard-armored / Speed-sleek), stat-change legibility at the moment of spend. Two paths: procedural SVG (audit default, time-boxed ~20 focused hours per audit §5) OR AI-generated base art via Higgsfield MCP (decision 2026-07-04, replaces audit Q2 commission fallback). See Higgsfield usage policy in `CLAUDE.md` (400 credit/month ceiling).
- **Celebration layer:** Evolution morph (Reanimated scale+morph+flash — Reanimated already in use by `PetAvatar`), PR gold flash in-session, summary screen upgraded to spec (sequential FP lines, typed radar — `RadarChart.tsx` exists — streak line, "Visit the Den" CTA).
- **Pet-care depth (MLV):** Mood derived from hunger + recency (typed in `src/types`), tap reaction animation, 2 food tiers + auto-feed toggle (Decision A1), vacation mode toggle (Decision A5 — small: freeze `calculateHungerDecayAmount`).
- **Typed-FP recalibration (audit C5):** Re-tag exercise DB so compounds emit primary mover dominantly (e.g. bench = power 0.8 / focus 0.2 via weighted tags rather than equal split). Add a test asserting no single type exceeds ~35% across all built-in templates.
- **kg support (decision 2026-07-04):** App is currently lb-only (plate math 45/65/95/135/185/225). Affects weight memory (`weightHistoryStore`), plate math, baselines, PR detection. UX open: lb/kg toggle in settings vs. per-user onboarding preference vs. per-exercise.
- **Share cards (promoted from Phase 3, decision 2026-07-04):** Pet image with stats + tower floor — cheapest organic acquisition mechanic. Renders the pet to a shareable static image alongside the avatar identity pass so the rendering work serves double duty.

> **EXIT CRITERIA:** After a real workout you want to open the Den; a friend seeing your pet asks what it means.

### Phase 3: Battle Tower + Polish (Weeks 11–18)

**Goal:** A battle system that makes you want to train harder, plus the polish layer that retains.

**Tower (audit §4 items 13–16):**

- Auto-battle engine as a pure module in `src/engine/battle/` with the same test discipline as the FP engine (stat comparison, type triangle, turn order, HP from Vigor — all specified in [`docs/05-battle-tower/tower.md`](../05-battle-tower/tower.md))
- Tower progression: floor generation scaled to floor number, attempts earned per claimed workout (wire to the now-real WorkoutLog), boss floors every 10th, floor rewards
- Battle presentation v1: text-log + animated stat bars + pet bounce/flash (cheap; full animation system waits for engagement validation)
- Achievements v1 (8–10 badges: first PR, 7-day streak, 100 sets, first evolution…)
- Evolution stages 3–4 (Prime, Apex)
- Pet training mini-interactions

**Polish + Social (original Phase 3 content):**

- Supabase: auth, cloud sync, cross-device data
- Leaderboard: tower floors, total FP, longest streaks
- Push notifications: streak reminders, pet hunger, weekly summary
- Sound design: battle effects, evolution fanfare, UI feedback
- Workout history charts: volume, stats, FP trends
- Skia upgrade for Apex rendering
- Rive animations for evolution + battle

### Phase 4: Expansion (Post-Launch)

- Multiple pet slots with different program bindings
- PvP: async matchmaking
- Custom workout builder with exercise tagging
- Apple Health / Google Fit integration
- Seasonal tower events
- Pet cosmetic shop
- AI integration (Battle Advisor + Workout Coach)

---

## Effort Estimates

| Component | Complexity | Est. Hours |
|-----------|-----------|-----------|
| Expo setup + navigation + base UI | Low | 12–16h |
| Workout tracker (full flow) | Medium | 30–40h |
| FP calculation engine | Low | 8–12h |
| The Den (pet home + feeding + mood) | Medium | 25–30h |
| Pet SVG renderer (stat-driven) | **High** | 40–55h |
| Evolution system + animations | Medium | 15–20h |
| Auto-battle engine | Medium | 25–35h |
| Battle animation system | **High** | 30–40h |
| Tower generation + progression | Low-Med | 10–15h |
| Data persistence (MMKV + AsyncStorage) | Low | 8–10h |
| Achievement system | Low | 8–12h |
| Push notifications | Low | 6–8h |
| Supabase backend + auth + sync | Medium | 20–25h |
| Leaderboard + share card | Medium | 12–16h |

### Totals (at 10–15h/week side project pace)

| Scope | Hours | Timeline |
|-------|-------|----------|
| **Phase 1** (Tracker + Pet) | ~155–205h | 10–20 weeks |
| **Phase 1+2** (adds Tower) | ~240–320h | 16–32 weeks |
| **Full MVP through Phase 3** | ~290–375h | 19–37 weeks |

> Pet SVG renderer is the **highest-risk, highest-uncertainty** item. Prototype in isolation first. If geometric generation doesn't feel right after 20h, fall back to pre-defined templates with stat-driven color/size variation.

---

## Risks & Mitigations

| Risk | Severity | Impact | Mitigation |
|------|----------|--------|-----------|
| Pet renderer doesn't feel good | **HIGH** | Core visual hook fails | Prototype in isolation. Define "good enough" early. Fallback to template shapes |
| FP economy unbalanced | MEDIUM | Too fast (no challenge) or too slow (frustrating) | All FP values in single config file. Playtest 2 weeks. Err generous |
| Tracker adds friction | **HIGH** | Users stop logging → game data stops | Obsessive UX focus on input speed. Real workout user testing |
| Pet care feels like a chore | MEDIUM | Tamagotchi fatigue | Slow hunger decay. No death. Auto-feed option |
| Scope creep into Phase 4 | **HIGH** | Never ships | Strict phase gates. "Cool ideas" list separate from backlog |
| 85 lb dumbbell ceiling | LOW | Strength plateau → FP slows | FP rewards volume/consistency, not just weight. Modifiers |

---

## Success Metrics

### Phase 1 (After 4 Weeks of Use)

| Metric | Question |
|--------|----------|
| Tracker adoption | Am I using Iron Quest for every workout? |
| Logging speed | Can I log a set in under 3 seconds? |
| Pet attachment | Do I check The Den after workouts? Do I care about feeding? |
| Streak motivation | Has the streak prevented at least one skipped workout? |

### Phase 2 (After 4 Weeks with Tower)

| Metric | Question |
|--------|----------|
| Tower engagement | Do I spend battle attempts? Do I look forward to climbing? |
| Stat choices | Am I thinking strategically about FP allocation? |
| Evolution excitement | Did the Form evolution feel like a genuine reward? |
| Shareability | Would I show this to a training partner? Would they want it? |

> If all Phase 1 answers are yes → proceed to Phase 2. If any is no → fix before adding features.

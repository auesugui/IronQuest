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
| **Local Persistence** | AsyncStorage + MMKV | AsyncStorage = workout history. MMKV = high-frequency reads (pet stats, FP, UI state) |
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

### Phase 1: Tracker + Pet (Weeks 1–5)

**Goal:** A workout tracker you actually use every session + a pet that responds to training.

- Expo project scaffolding (TypeScript, Reanimated, RN SVG)
- Workout tracker: quest board, exercise flow, rep logging, rest timer
- FP calculation engine: base + volume + streak + PR detection
- The Den: pet home, idle animation, hunger, mood
- Feeding system (3–4 tiers)
- Stat allocation UI: spend typed FP, see visual changes live
- Pet SVG renderer: stat-driven geometric creature
- Evolution stages 1–2 (Shard, Form) with morph animation
- Local persistence (AsyncStorage + MMKV)
- Pre-loaded 6-day PPL program

> **EXIT CRITERIA:** Use the app for every workout for 2 consecutive weeks. Tracker is faster than current method. Pet feels worth caring about.

### Phase 2: The Tower (Weeks 6–10)

**Goal:** A battle system that makes you want to train harder.

- Auto-battle engine (stat comparison, damage, turns, abilities)
- Tower floor generation (procedural enemies scaled to floor)
- Battle animation system
- Ability system (4 slots via evolution)
- Tower attempt economy (1/workout, max 7)
- Boss floor mechanics (every 10th)
- Tower rewards (FP + cosmetics)
- Evolution stages 3–4 (Prime, Apex)
- Achievement system (20+ badges)
- Pet training mini-interactions

### Phase 3: Polish + Social (Weeks 11–14)

- Supabase: auth, cloud sync, cross-device data
- Leaderboard: tower floors, total FP, longest streaks
- Share card: shareable pet image with stats + tower floor
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

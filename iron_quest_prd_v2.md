**IRON QUEST**

Product Requirements Document

*Train Hard. Raise Your Pet. Climb the Tower.*

Author: Adrian \| Version: 2.0 \| February 2026

**Status: Planning Phase**

**v2.0 CHANGELOG**

-   Revised core game loop: Earn points from workouts, then spend them raising your pet (Tamagotchi model)

-   Platform shifted from PWA-first to React Native (Expo) based on VoidPets tech stack analysis

-   Updated tech stack: Expo + Reanimated + React Native SVG, Supabase backend, Hermes JS engine

-   Pet care system added: feeding, training, mood, and stat allocation as a spending mechanic

-   Workout tracker repositioned as the primary product; pet/battle as the reward extension

**1. Product Vision**

**1.1 One-Line Pitch**

**Iron Quest is a workout tracker where every rep you log earns currency to raise, feed, and strengthen a digital pet that battles its way up an endless tower.**

**1.2 The Core Loop**

The app has two distinct modes that feed into each other, and this separation is a fundamental design decision. The workout tracker is the product. The pet is the reward system. Players should never feel like the pet is slowing down their workout or adding friction between sets.

**Phase A: Earn (The Gym)**

The player opens the app, selects their workout, and logs sets and reps as they train. The interface is optimized for speed: large tap targets, auto-advancing exercises, and a built-in rest timer. At the end of each workout, the player earns Forge Points (FP) based on their volume, consistency, and any PRs hit. They also receive a workout summary with stats. This phase should feel like a top-tier workout tracker that happens to have a points system attached.

**Phase B: Spend (The Den)**

After training (or whenever they want), the player enters The Den, where their pet lives. Here they can spend their earned Forge Points on several activities: feeding their pet to maintain its happiness and prevent mood decay, allocating stat points to specific attributes (Power, Guard, Speed, etc.), training their pet in mini-exercises that boost specific stats with diminishing returns, and sending their pet into the Battle Tower to test its strength against increasingly difficult floors. The Den is where the emotional connection lives. The pet reacts to being fed, celebrates when it levels up, and looks visibly different based on how the player has invested their points.

> **KEY DESIGN RULE:** The workout tracker must function perfectly as a standalone tool. If the pet system disappeared tomorrow, the tracker should still be worth using. The pet layer adds motivation and fun, but never at the cost of tracker usability.

**1.3 Design Pillars**

-   **Tracker First, Game Second:** The workout logging experience is the highest priority. It must be faster and smoother than any competing app. The game layer is a reward, not a requirement

-   **Earn Everywhere, Spend Intentionally:** Points flow automatically from workouts. Spending them on the pet requires deliberate choices. This creates a satisfying decision space

-   **Your Pet = Your Effort:** The pet is a living reflection of the player\'s training history. Its shape, stats, and abilities are all downstream of real physical effort. There are no shortcuts

-   **Geometric Identity:** Pets are abstract geometric creatures rendered via SVG, visually shaped by their stat distribution. This keeps art scope manageable while creating unique, personal creatures

**1.4 Competitive Positioning**

Iron Quest occupies a unique space at the intersection of workout trackers (Strong, Hevy, JEFIT) and virtual pet games (VoidPets, Tamagotchi). Existing fitness RPGs like Habitica treat exercise as one of many habits and lack workout-specific features. Ring Fit prescribes its own exercises rather than integrating with the user\'s program. No current app combines a serious rep-logging workout tracker with a creature-raising battle game where the pet\'s growth is directly tied to real training data.

> *Inspiration references: VoidPets (aesthetic, creature attachment, clean mobile UX), Tamagotchi (care/feeding loop, emotional bond with digital creature), Pokemon (battle tower, type system, evolution excitement), Undertale (geometric character design that conveys personality without realistic art).*

**2. Target User**

**2.1 Primary Persona**

Intermediate lifter, 25-40 years old, follows a structured program (PPL, Upper/Lower, Bro Split), trains 4-6 days per week. They have the knowledge and discipline to train effectively most of the time, but struggle with consistency during deload weeks, busy periods, or when motivation dips. They enjoy gaming and respond well to progression systems, collectibles, and visual feedback on their efforts.

**2.2 User Needs**

-   **Friction-free logging:** Rep input between sets should take under 3 seconds. The app cannot slow down the workout

-   **Visible progress:** Seeing their pet grow, stats rise, and tower floors fall makes gradual strength gains feel tangible and rewarding

-   **Meaningful choices:** Deciding how to allocate earned points creates engagement beyond just logging reps

-   **Motivation on bad days:** The pet\'s happiness decaying and the streak at risk provides an external reason to show up when internal motivation is low

-   **Fun without pressure:** The battle tower is optional. The pet can be raised casually. Nothing punishes the user harshly for missing a day

**3. Workout Tracker (Phase A: Earn)**

The workout tracker is the revenue engine of the game economy. Every interaction with it generates Forge Points that fuel the pet system. But its primary job is being an excellent workout tracker.

**3.1 Workout Flow**

The player selects a workout from the Quest Board (rebranded workout list). The app presents exercises one at a time in sequence. For each exercise, the player sees the exercise name, target sets and rep goal, and the weight used last session. Between sets, they tap in their completed reps on a large number pad designed for sweaty hands. An automatic rest timer starts with audio/haptic cues at 10 seconds remaining and at zero. After the final exercise, a completion screen displays the session summary: total volume, time elapsed, any PRs, Forge Points earned, and a breakdown of which pet stats were fueled.

**3.2 Forge Points (FP) Economy**

Forge Points are the single currency that bridges the workout tracker and the pet system. They are earned exclusively through logged workouts and cannot be purchased or generated any other way.

**3.2.1 FP Earning Formula**

  ----------------------- ------------------------------------------- ---------------------- --------------------------------------------------
  **FP Source**           **Calculation**                             **Example**            **Design Rationale**

  **Base Completion**     Flat 100 FP per completed workout           100 FP                 Rewards showing up regardless of performance

  **Volume Bonus**        1 FP per 10 reps logged                     \~25 FP for 250 reps   Rewards effort and high-volume sessions

  **Streak Multiplier**   1.0x base, +0.1x per streak day, max 2.0x   1.5x at 5-day streak   The most powerful incentive for consistency

  **PR Bonus**            50 FP per personal record hit               50 FP for new max      Celebrates genuine strength milestones

  **Quest Bonus**         25 FP for weekly quest completion           25 FP                  Rotating challenges to prevent routine staleness
  ----------------------- ------------------------------------------- ---------------------- --------------------------------------------------

**Example session: complete Push A (100 base) + 280 reps (28 volume) + 4-day streak (1.4x multiplier) + 1 PR (50) = (100 + 28 + 50) x 1.4 = 249 FP earned.**

> *Sanity checks: rep counts above 50 per set are flagged and don\'t earn volume bonus. Sessions under 10 minutes earn reduced base FP. This prevents gaming the system with fake logs.*

**3.2.2 Typed FP**

In addition to generic FP, each workout generates Typed Forge Points based on the muscle groups trained. These typed points determine which pet stats the player can allocate to. A Push workout generates Power-type and Focus-type FP. A Pull workout generates Guard-type and Focus-type FP. A Legs workout generates Speed-type and Vigor-type FP. Streak consistency generates Spirit-type FP.

This means a player who only trains Push will have plenty of Power points but nothing for Speed. The pet\'s growth naturally mirrors the player\'s training balance, and imbalanced training produces a specialized but potentially vulnerable pet in battle.

**3.3 Exercise Database**

The app ships with the 6-Day Powerbuilding PPL (Home Dumbbell + NordStick Edition) pre-loaded as the default program. Each exercise is tagged with primary and secondary muscle groups that determine FP type distribution. Players can also create custom workouts and tag exercises manually. Future versions may include an exercise library with common movements pre-tagged.

**4. The Pet System (Phase B: Spend)**

The Den is the pet\'s home screen. It shows the creature in its environment, its current mood, stats, hunger level, and available Forge Points to spend. This is where the Tamagotchi loop lives.

**4.1 Pet Care Activities**

The player spends Forge Points on four core activities. Each serves a different purpose in the pet\'s development.

**4.1.1 Feeding**

  --------------- ------------- ------------------------------------ -----------------------------------------------------------------
  **Food Item**   **FP Cost**   **Effect**                           **Notes**

  Basic Ration    10 FP         Restores 1 hunger bar                Cheap, keeps pet alive. Always available

  Protein Pack    25 FP         Restores 2 hunger + small XP boost   Efficient for maintaining a healthy pet between big investments

  Power Meal      50 FP         Full hunger restore + mood boost     Premium feed. Gives a temporary stat buff for next battle

  Rare Treat      100 FP        Full restore + bonus evolution XP    Unlocked after reaching tower floor 25. Accelerates evolution
  --------------- ------------- ------------------------------------ -----------------------------------------------------------------

Hunger decays slowly over real time (roughly 1 bar per 24 hours). A hungry pet has reduced mood, which lowers its Spirit stat and weakens its passive buffs in battle. A starving pet (0 hunger for 48+ hours) stops gaining any XP from stat allocation until fed. This creates gentle pressure to check in and care for the pet without being punishing. Missing a day or two is recoverable with a single meal.

> **DESIGN NOTE:** Hunger decay should feel like a nudge, not a punishment. The pet doesn\'t die or lose stats permanently. It just gets grumpy and less effective until you feed it. Think Tamagotchi with guardrails.

**4.1.2 Stat Allocation**

This is the primary spending mechanic. The player takes their earned Typed Forge Points and manually assigns them to their pet\'s battle stats. This is where strategic choices happen.

  -------------- --------------------------------- -------------------------------------- ---------------- --------------------------------
  **Pet Stat**   **FP Type Required**              **Battle Effect**                      **Cost/Point**   **Visual Influence**

  **Power**      Push workouts (Chest/Shoulders)   Physical attack damage                 5 FP             Spikier edges, larger core

  **Guard**      Pull workouts (Back/Traps)        Damage reduction                       5 FP             Thicker outline, layered forms

  **Speed**      Leg workouts (Quads/Hams)         Turn order, dodge chance               5 FP             Elongated shape, motion lines

  **Vigor**      Leg workouts (Core/Calves)        Max HP, stamina regen                  5 FP             Symmetrical, stable base

  **Focus**      Push + Pull (Arms)                Crit rate, ability accuracy            5 FP             Sharp points, eye details

  **Spirit**     Streak consistency only           Special ability power, passive buffs   10 FP            Glow intensity, particles
  -------------- --------------------------------- -------------------------------------- ---------------- --------------------------------

Stat allocation costs increase as stats grow (soft scaling). The first 10 points in Power cost 5 FP each. Points 11-25 cost 8 FP each. Points 26-50 cost 12 FP each. This prevents players from maxing a single stat cheaply and encourages balanced builds, but still allows specialization if the player commits the resources.

> *Spirit costs double and can only be earned from streak FP. This makes it the rarest, most valuable stat. A player with a high Spirit pet has proven weeks of consistency. It cannot be rushed.*

**4.1.3 Pet Training**

In addition to direct stat allocation, players can spend FP on short training mini-interactions in The Den. These are quick animations where the pet performs an exercise (a visual echo of the player\'s real workout) and gains a small stat boost plus evolution XP. Training sessions cost 15-30 FP and take about 10 seconds of animation. The stat gain is smaller than direct allocation (roughly 60% efficiency) but the pet earns evolution XP, which direct allocation does not provide. This creates a meaningful trade-off: direct allocation is more FP-efficient for battle stats, but training is the primary way to push toward the next evolution stage.

**4.1.4 Mood System**

The pet has a mood that ranges from Ecstatic to Miserable, influenced by hunger level, recent feeding, how recently the player trained (real workout), and how recently the pet was interacted with in The Den. Mood affects the Spirit stat (high mood adds a Spirit bonus, low mood reduces it) and changes the pet\'s idle animations and expressions. A happy pet bounces and glows. A neglected pet dims and moves sluggishly.

Mood is intentionally soft. It recovers quickly with minimal attention (one feeding + one workout restores mood to neutral). The goal is to make the player feel good about caring for their pet, not to guilt them for missing a day.

**4.2 Evolution System**

Pets evolve through four stages. Evolution is triggered by accumulating Evolution XP (EvoXP), which is earned primarily through pet training sessions and rare treats, with small amounts from stat allocation and feeding. Evolution is permanent, celebrated with a full-screen morph animation, and visibly transforms the creature\'s geometric complexity.

  ----------- ---------- ------------------ ----------------------------------------------------------------------------------------- -------------------------------------------------
  **Stage**   **Name**   **EvoXP Needed**   **Visual Description**                                                                    **Real-World Timeline**

  1           Shard      0 (start)          Simple 3-4 sided polygon, single color, gentle float animation                            Day 1

  2           Form       500 EvoXP          6-8 sided shape, gradient fills, orbiting particles                                       \~2-3 weeks of consistent training and pet care

  3           Prime      2,000 EvoXP        Multi-shape composite, inner glow, animated edges, stat-influenced morphology             \~6-8 weeks

  4           Apex       5,000 EvoXP        Fractal-like recursion, dynamic color shifts, ambient particle field, unique silhouette   \~16-20 weeks (one full training cycle)
  ----------- ---------- ------------------ ----------------------------------------------------------------------------------------- -------------------------------------------------

Each evolution also unlocks a new ability slot for battle, expanding the pet\'s combat options. The visual transformation is the primary reward, but the mechanical upgrade makes evolution feel impactful in the tower as well.

**4.3 Geometric Rendering**

Pets are constructed from parameterized SVG shapes using React Native SVG. The rendering pipeline takes the pet\'s stat array and visual seed as input and produces a unique creature. The stat distribution shapes the creature\'s geometry: high Power produces angular, aggressive forms with warm colors; high Guard creates rounded, layered shells with cooler tones; high Speed elongates the shape with motion-suggesting asymmetry. A seed value (derived from creation timestamp) adds randomness so even identically-statted pets have visual personality differences.

Evolution stages increase the geometric complexity: Shard uses 3-4 basic polygons, Form introduces gradient fills and 6-8 shapes, Prime adds composite multi-shape forms with inner details, and Apex uses recursive patterns approaching fractal complexity. The morph between stages uses interpolated SVG path transitions animated via Reanimated for a smooth, satisfying evolution sequence.

**5. Battle Tower**

The Battle Tower is optional but recommended. It is the competitive endgame where the player\'s pet investment pays off in visible combat performance. It answers the question: how strong am I actually getting?

**5.1 Tower Structure**

The tower is an endless series of floors with scaling difficulty. Each floor presents one enemy creature to defeat. Enemies are procedurally generated geometric creatures with stat distributions based on the floor number. Every 10th floor is a Boss floor with a significantly stronger enemy and better rewards.

  ------------ ----------- -------------------------------------------------------- -------------------------------------------------------------------
  **Floors**   **Tier**    **Enemies**                                              **Unlocks**

  1-10         Bronze      Basic shapes, single-type, predictable patterns          Tutorial tier. Shard-stage pets can clear with minimal investment

  11-25        Silver      Dual-type enemies, status effects introduced             Rare Treats unlocked at floor 25. Requires Form-stage pet

  26-50        Gold        Multi-shape composites, healing enemies, paired fights   Cosmetic rewards. Requires Prime-stage pet

  51-100       Platinum    Fractal enemies, adaptive stat scaling, boss rush        Prestige title. Requires Apex-stage pet
  ------------ ----------- -------------------------------------------------------- -------------------------------------------------------------------

**5.2 Battle Mechanics**

Battles are auto-resolved with pre-battle player input. Before each fight, the player sees the enemy\'s type and approximate power level. They assign priority weights to their pet\'s four abilities (e.g., 40% offensive, 30% defensive, 20% speed, 10% special). The battle then plays out as an animated sequence with turn-based exchanges. This approach is deliberate: building a full interactive turn-based system would double the development effort and pull focus from the workout tracker. Auto-battle with strategic pre-configuration keeps the game meaningful without requiring the player to master a combat system.

**5.3 Tower Attempts**

Each completed real workout grants one tower attempt. Attempts stack up to a maximum of 7. Failed attempts are not consumed; the player simply doesn\'t advance. This means there is zero penalty for trying a floor you\'re not ready for. The tower is purely aspirational.

**5.4 Tower Rewards**

Clearing floors earns bonus FP, cosmetic items for the pet (color overlays, particle effects, accessories), and achievement badges. Boss floors drop significantly more FP and exclusive cosmetics. These rewards feed back into the pet care loop: more FP means more feeding, more stat allocation, more evolution progress, which means clearing higher floors, which means more rewards.

**6. Achievement System**

Achievements provide secondary goals across four categories. They reward different types of engagement and serve as long-term motivation beyond the immediate workout-pet-tower loop.

**Training Milestones**

-   First Blood: Complete your first workout

-   Iron Will: Log 1,000 total reps

-   Rep Machine: Log 10,000 total reps

-   PR Hunter: Hit 10 personal records

-   Volume King: Log 500 total reps in a single session

**Consistency Badges**

-   Momentum: Maintain a 3-day workout streak

-   Unstoppable: Maintain a 7-day streak

-   Iron Habit: Complete 4 consecutive weeks without missing a scheduled workout

-   The Grind: Log 100 total workouts

**Pet Milestones**

-   First Form: Evolve your pet to Stage 2

-   Apex Predator: Reach Stage 4 evolution

-   Well Fed: Feed your pet 50 times

-   Balanced Build: All pet stats within 20% of each other

-   Glass Cannon: Any single stat more than 3x your lowest stat

**Tower Achievements**

-   Tower Rookie: Clear floor 10

-   Silver Climber: Clear floor 25

-   Gold Standard: Clear floor 50

-   Platinum Legend: Clear floor 100

-   Boss Slayer: Defeat 10 boss floors

**Hidden Achievements**

Undiscovered badges that reward unusual behavior. Examples: workout at 5am (Early Bird), log 100 reps in a single set (Century Set), defeat a boss 20 levels above your expected range (Giant Killer), feed your pet immediately after every workout for 2 weeks (Dedicated Caretaker). These should feel like genuine surprises when they pop.

**7. Technical Architecture**

**7.1 Platform Decision: React Native (Expo)**

The v1 PRD recommended a PWA-first approach. After researching VoidPets\' tech stack and evaluating the requirements, the platform recommendation has shifted to React Native via Expo from day one. The reasons are: native push notifications are critical for streak reminders and rest timer alerts; haptic feedback makes battle animations and evolution celebrations feel impactful; the Expo managed workflow with EAS handles builds and OTA updates without touching Xcode/Android Studio directly; React Native SVG and Reanimated provide the rendering and animation capabilities needed for geometric pets; and Hermes (included by default) ensures fast startup times, which matters when opening the app between sets.

The trade-off is more initial setup compared to a PWA, but it avoids a painful migration later and gives access to native capabilities that the pet system specifically needs.

**7.2 Technology Stack**

  ---------------------------- ------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------
  **Layer**                    **Technology**                  **Rationale**

  **Framework**                React Native + Expo (Managed)   Single codebase for iOS/Android. EAS for builds. OTA updates for rapid iteration. Familiar React paradigm

  **Language**                 TypeScript (end-to-end)         Type safety across game state, FP calculations, battle formulas. Prevents entire categories of bugs in stat math

  **JS Engine**                Hermes (default in Expo)        Faster startup, lower memory. Critical for between-sets app opening speed

  **Pet Rendering**            React Native SVG                Parameterized geometric shapes. Resolution-independent. Stat-driven morphology. No sprite assets needed

  **Animations**               React Native Reanimated v3      60fps gesture-driven and layout animations. Pet idle loops, evolution morphs, battle sequences, UI transitions

  **Advanced Graphics**        React Native Skia (Phase 2+)    Reserved for Apex-stage pets with particle fields and fractal rendering. Not needed for MVP

  **Interactive Animations**   Rive (Phase 3+)                 Evolution sequences, battle effect animations, UI celebrations. Pre-authored vector animations for polish moments

  **State Management**         Zustand                         Lightweight, no boilerplate. Perfect for game state (pet stats, FP balance, tower progress, workout session)

  **Local Persistence**        AsyncStorage + MMKV             AsyncStorage for workout history and complex data. MMKV for high-frequency reads (pet stats, FP balance, UI state) that need instant load

  **Backend**                  Supabase (Phase 3)              Managed PostgreSQL, built-in auth, real-time subscriptions for leaderboards. Matches the Node.js/TypeScript/Postgres pattern. Not needed for MVP

  **Notifications**            Expo Notifications              Streak reminders, pet hunger alerts, rest timer completion. Native push on both platforms via Expo
  ---------------------------- ------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------

**7.3 Data Model**

**Core Entities**

-   **Player:** Profile info, settings, total FP balance (generic + typed), streak data, achievement list

-   **Pet:** Stat array (Power, Guard, Speed, Vigor, Focus, Spirit), evolution stage, EvoXP, hunger level, mood, visual seed, learned abilities, cosmetic items

-   **WorkoutLog:** Timestamp, workout type, exercises with sets/reps/weight, duration, FP earned (generic + typed), PRs flagged

-   **TowerProgress:** Current floor, best floor cleared, attempt count, boss kill history

-   **Achievement:** Array of unlocked IDs with unlock timestamps

> *All entities should include UUIDs, created_at, updated_at, and soft delete flags from the start. Even though Phase 1 is local-only, designing for eventual cloud sync avoids a painful data migration in Phase 3.*

**8. Development Roadmap**

**8.1 Phase 1: The Tracker + The Pet (Weeks 1-5)**

Goal: a workout tracker you actually use every session, plus a pet that visibly responds to your training.

-   Expo project scaffolding with TypeScript, Reanimated, RN SVG

-   Workout tracker: quest board, exercise flow, rep logging, rest timer with haptics

-   FP calculation engine: base + volume + streak + PR detection

-   The Den: pet home screen with idle animation, hunger display, mood indicator

-   Feeding system with 3-4 food tiers

-   Stat allocation UI: spend typed FP to raise pet stats, see visual changes in real-time

-   Pet SVG renderer: parameterized geometric creature from stat array + seed

-   Evolution stages 1-2 (Shard and Form) with morph animation

-   Local data persistence (AsyncStorage + MMKV)

-   Pre-loaded 6-day PPL program

> **PHASE 1 EXIT CRITERIA:** You use the app for every workout for 2 consecutive weeks. The tracker is faster than your current method. The pet feels worth caring about.

**8.2 Phase 2: The Tower (Weeks 6-10)**

Goal: a battle system that makes you want to train harder to climb higher.

-   Auto-battle engine: stat comparison, damage formulas, turn sequencing, ability effects

-   Tower floor generation: procedural enemy creation scaled to floor number

-   Battle animation system: pet vs enemy with ability visuals, HP bars, hit effects

-   Ability system: 4 slots unlocked through evolution milestones

-   Tower attempt economy: 1 attempt per workout, max 7 stored

-   Boss floor mechanics (every 10th floor)

-   Tower rewards: bonus FP, cosmetic unlocks

-   Evolution stages 3-4 (Prime and Apex)

-   Achievement system: 20+ badges across all categories

-   Pet training mini-interactions in The Den

**8.3 Phase 3: Polish + Social (Weeks 11-14)**

-   Supabase integration: auth, cloud sync, cross-device data

-   Leaderboard: tower floor rankings, total FP earned, longest streaks

-   Share card: generate a shareable image of your pet with stats and tower floor

-   Push notifications: streak reminders, pet hunger alerts, weekly summary

-   Sound design: battle effects, evolution fanfare, feeding sounds, UI feedback

-   Workout history charts: volume over time, stat progression, FP earning trends

-   React Native Skia upgrade for Apex-stage pet rendering

-   Rive animations for evolution sequences and battle celebrations

**8.4 Phase 4: Expansion (Post-Launch)**

-   Multiple pet slots with different training program bindings

-   PvP: async matchmaking against other players\' pets

-   Custom workout program builder with exercise tagging

-   Apple Health / Google Fit integration for passive activity bonuses

-   Seasonal tower events with time-limited rewards and themed enemies

-   Pet cosmetic shop: spend FP on color overlays, accessories, particle effects

-   Import from existing apps (Strong, Hevy) via CSV/API

**9. Effort & Complexity Estimates**

  ---------------------------------------- ---------------- ---------------- -------------------------------------------------------------------
  **Component**                            **Complexity**   **Est. Hours**   **Notes**

  Expo setup + navigation + base UI        Low              12-16h           Expo Router, screen structure, design tokens

  Workout tracker (full flow)              Medium           30-40h           Existing HTML prototype covers \~30% of logic. Needs RN rebuild

  FP calculation engine                    Low              8-12h            TypeScript math functions. Well-scoped

  The Den (pet home + feeding + mood)      Medium           25-30h           Interactive pet screen, food selection, stat allocation UI

  Pet SVG renderer (stat-driven)           High             40-55h           Most creative work. Prototype early. Iterate heavily

  Evolution system + animations            Medium           15-20h           SVG morph via Reanimated. 4 stages

  Auto-battle engine                       Medium           25-35h           Turn logic, damage formulas, ability effects

  Battle animation system                  High             30-40h           Visual sequences. Second biggest visual effort after pet renderer

  Tower generation + progression           Low-Med          10-15h           Procedural enemy scaling. Floor/boss logic

  Data persistence (MMKV + AsyncStorage)   Low              8-10h            Local storage layer with sync-ready schema

  Achievement system                       Low              8-12h            Condition checks, notification popups

  Push notifications                       Low              6-8h             Expo Notifications handles heavy lifting

  Supabase backend + auth + sync           Medium           20-25h           Phase 3. Schema design matters early even if backend is later

  Leaderboard + share card                 Medium           12-16h           Phase 3. Depends on Supabase
  ---------------------------------------- ---------------- ---------------- -------------------------------------------------------------------

**Phase 1 (Tracker + Pet): \~140-185 hours. At 10-15h/week side project pace: 10-18 weeks.**

**Phase 1+2 (adds Tower): \~205-275 hours total. At 10-15h/week: 14-27 weeks.**

**Full MVP through Phase 3: \~250-325 hours. At 10-15h/week: 17-32 weeks.**

> *The pet SVG renderer is the highest-risk, highest-uncertainty item. It should be prototyped in isolation (even as a web playground) before integrating into the Expo app. If the geometric generation doesn\'t feel right after 20 hours of work, consider simplifying to pre-defined shape templates with stat-driven color/size variation as a fallback.*

**10. Risks & Mitigations**

  ----------------------------------- -------------- ------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------
  **Risk**                            **Severity**   **Impact**                                                    **Mitigation**

  Pet renderer doesn\'t feel good     **HIGH**       Core visual hook fails. Pet feels generic                     Prototype in isolation first. Define \'good enough\' early. Fallback to template-based shapes with stat-driven scaling

  FP economy is unbalanced            **MEDIUM**     Pet grows too fast (no challenge) or too slow (frustrating)   All FP values in a single config file. Playtest for 2 weeks before locking numbers. Err toward generous early

  Tracker adds friction to workouts   **HIGH**       Users stop logging, entire game data stops flowing            Obsessive UX focus on input speed. User testing with real workout sessions. If logging takes \>5 sec between sets, redesign

  Pet care feels like a chore         **MEDIUM**     Tamagotchi fatigue. Player resents feeding obligation         Hunger decay is slow (24h per bar). Pet never dies or loses stats permanently. Auto-feed option as a QoL unlock at floor 25

  Scope creep into Phase 4            **HIGH**       Project never ships                                           Strict phase gates. Phase 1 must pass exit criteria before Phase 2 starts. Keep a \'cool ideas\' list separate from the backlog

  85 lb dumbbell ceiling              **LOW**        Real strength plateaus, FP earning slows                      FP rewards volume and consistency, not just weight. Tempo and technique modifiers. Single-limb variation bonuses
  ----------------------------------- -------------- ------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------

**11. Success Metrics**

This is a personal project. Success is measured by whether it actually changes behavior, not by downloads or revenue.

**Phase 1 Success (after 4 weeks of real use)**

-   **Tracker adoption:** Am I using Iron Quest for every workout instead of a notes app or spreadsheet?

-   **Logging speed:** Can I log a set in under 3 seconds without looking away from the weight rack?

-   **Pet attachment:** Do I check The Den after workouts? Do I care about feeding my pet?

-   **Streak motivation:** Has the streak system prevented me from skipping at least one workout I otherwise would have?

**Phase 2 Success (after 4 weeks with the tower)**

-   **Tower engagement:** Do I spend my battle attempts? Do I look forward to seeing how far my pet can climb?

-   **Stat choices:** Am I thinking strategically about FP allocation, or just dumping everything into one stat?

-   **Evolution excitement:** Did the Form evolution feel like a genuine reward?

-   **Shareability:** Would I show this to a training partner? Would they want it?

If the answer to all Phase 1 questions is yes, proceed to Phase 2. If any answer is no, fix that specific problem before adding more features.

**12. Open Questions**

-   Should there be an auto-feed option to reduce Tamagotchi maintenance, or does the manual feeding ritual add to the emotional bond?

-   Should tower progress reset seasonally (quarterly prestige) or be permanent? Prestige resets create recurring goals but risk frustrating long-term players

-   Is there value in multiple pet types with different visual themes (crystalline vs organic vs mechanical), or does one base type with stat-driven variation provide enough uniqueness?

-   Should the app integrate with existing workout apps (Strong, Hevy) via data import, or is a self-contained tracker preferable for data integrity?

-   What happens to the pet if the player takes a 2-week vacation? Should there be a \'hibernation\' mode that pauses hunger decay?

-   Should FP be spendable on cosmetics (color overlays, particle effects) or only on functional pet upgrades? Cosmetic spending could extend engagement but dilutes the workout-to-strength pipeline

-   Is there a role for Claude/AI integration (e.g., workout recommendations based on pet stat imbalances, battle strategy tips)?

-   How should the app handle weight progression tracking for the 85 lb dumbbell ceiling? Should it suggest tempo/volume modifications automatically?

*End of Document \| Iron Quest PRD v2.0*

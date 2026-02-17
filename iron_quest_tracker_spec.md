**IRON QUEST**

Workout Tracker Design Spec

*Templates, Session Flow, Pre-Session Modifiers & Cardio Integration*

Companion to Iron Quest PRD v2.0 + Addendum v2.1 \| February 2026

**1. Workout Template Library**

Templates solve the cold-start problem. A new user should be able to open the app, pick a template that matches their goals and schedule, and start training within 60 seconds. Templates also communicate the game consequences of each choice: which pet stats will grow fastest, what type of FP they will earn, and how balanced or specialized their pet build will become.

**1.1 Template Browser**

The template browser is the first screen a new user sees after creating their pet. It presents templates as cards, each showing the program name, training days per week, difficulty level, a visual FP distribution chart (small radar/spider chart showing which pet stats this program feeds), and a one-line description. The user can tap any template to see the full exercise list, then either adopt it as-is or copy it into a custom program to edit.

> **UX RULE:** Every template card must show the pet stat distribution at a glance. This transforms workout selection from a fitness decision into a strategic game decision. The user isn\'t just picking a routine; they\'re choosing how their pet will grow.

**1.2 Template Collection**

The app ships with 8-10 curated templates spanning different schedules, goals, and experience levels. All templates are equipment-tagged so the app can filter based on what the user has available.

**1.2.1 Resistance Training Templates**

  ----------------------- ---------------- ---------- --------------- ----------------------- -----------------------------------------------------------------------------------------
  **Template**            **Split Type**   **Days**   **Level**       **Primary FP Types**    **Description**

  **Powerbuilding PPL**   Push/Pull/Legs   6          Intermediate    Balanced across all     The default program. Heavy compounds + rest-pause volume. Builds all pet stats evenly

  **PPL Home Edition**    Push/Pull/Legs   6          Intermediate    Balanced across all     Dumbbell + bench only adaptation. Same structure for home gym setups

  **Upper / Lower**       Upper/Lower      4          Beginner+       Power + Guard heavy     Classic 4-day split. Strong upper body FP generation. Good entry point for structure

  **Full Body Basics**    Full Body        3          Beginner        Even, lower volume      3 days per week, compound-focused. Ideal for new lifters. Moderate FP across all types

  **Bro Split**           Body Part        5-6        Intermediate    Varies by day           Traditional bodybuilding split. High isolation volume. Strong Focus FP from arm days

  **Strength Focus**      Powerlifting     4          Intermediate+   Power + Speed heavy     Squat/Bench/Deadlift/OHP focused. Low rep, high weight. Maximizes Power FP per session

  **Hypertrophy Block**   Push/Pull/Legs   6          Intermediate    Balanced, high volume   High volume (15-20 sets/muscle/week), moderate weight. Max total FP from volume bonuses

  **Minimalist**          Full Body        2-3        Beginner        Even, very low volume   Bare minimum effective training. 30-min sessions. For busy schedules or easing back in
  ----------------------- ---------------- ---------- --------------- ----------------------- -----------------------------------------------------------------------------------------

**1.2.2 Cardio Templates**

  ------------------------- ---------- ---------- -------------- ----------------------- --------------------------------------------------------------------------------------------
  **Template**              **Type**   **Days**   **Level**      **Primary FP Types**    **Description**

  **LISS Steady State**     Cardio     2-4        Any            Vigor + Spirit          Walking, easy cycling, light jogging. 30-60 min. Recovery-friendly FP generation

  **HIIT Intervals**        Cardio     2-3        Intermediate   Speed + Vigor           Sprints, bike intervals, rowing. 20-30 min. Highest FP-per-minute ratio of any cardio type

  **Hybrid Conditioning**   Mixed      1-2        Intermediate   Speed + Vigor + Power   Circuit-style: kettlebell swings, burpees, battle ropes. Bridges cardio and resistance
  ------------------------- ---------- ---------- -------------- ----------------------- --------------------------------------------------------------------------------------------

> *Templates are starting points, not prescriptions. The app should make it obvious that copying and customizing is expected. A prominent \"Make It Mine\" button on every template opens the editor with that template pre-loaded.*

**1.3 FP Distribution Preview**

Each template card displays a small radar chart showing the relative FP distribution across the six pet stats (Power, Guard, Speed, Vigor, Focus, Spirit). This chart is computed from the exercises in the template and their muscle group tags. A Push/Pull/Legs program shows a roughly even hexagon. A Powerlifting template shows spikes in Power and Speed with lower Focus and Spirit. This makes the strategic consequence of each template immediately visible without reading exercise lists.

**1.4 Template Management**

**1.4.1 Adopt**

Selecting \"Start This Program\" adds the template to the user\'s active programs. Players can have up to 3 active programs (e.g., a lifting program plus a cardio template plus a custom accessory day). Active programs appear on the Quest Board for easy session selection.

**1.4.2 Copy & Customize**

\"Make It Mine\" creates an editable copy. The user can rename exercises, swap exercises (with muscle group tag suggestions from same-category alternatives), adjust sets and rep targets, reorder exercises, add or remove exercises, and change the weekly schedule. The FP distribution radar updates in real-time as they edit, so they can see exactly how their modifications shift the pet stat balance.

**1.4.3 Build From Scratch**

Advanced users can create a program from a blank slate. The editor provides exercise search with muscle group filtering, the ability to organize exercises into named workout days, set default sets/reps/rest per exercise, and tag each day with its primary muscle groups. The same radar chart preview is available during creation.

> **IMPORTANT:** Custom programs must still have muscle group tags on every exercise for FP calculation to work. The app auto-suggests tags based on exercise name matching and flags any untagged exercises before the program can be activated.

**2. Pre-Session Configuration**

Everything that could distract the player during their workout is handled before the session starts. Once they tap \"Begin Quest,\" the only interactions are: log reps, advance set, and occasionally note the weight used. Nothing else.

**2.1 The Loadout Screen**

When a player selects a workout from the Quest Board, they land on the Loadout Screen. This is a single pre-session screen that handles all configuration. The name \"Loadout\" reinforces the game metaphor: you\'re equipping before a mission.

**2.1.1 Loadout Components**

  ----------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Component**           **What It Does**                                                                                                                                         **UX Detail**

  **Workout Preview**     Shows today\'s exercise list with target sets/reps and the weight used last time for each exercise                                                       Scrollable list. Player sees the full session before committing

  **Session Intent**      Multi-select toggles: Normal / Tempo Focus / Pause Reps / Deload / Drop Sets / Rest-Pause. Sets the default modifier for every exercise in the session   Large tappable chips. Default is Normal. Multiple intents can be combined (e.g., Tempo + Drop Sets). Selection persists as session default with per-exercise override available

  **Quick Adjustments**   Swap or skip exercises before starting. Tap an exercise to replace it from a filtered list of same-muscle-group alternatives                             For days when equipment is busy or an exercise causes discomfort. Swap preserves muscle group tags and FP distribution

  **FP Forecast**         Shows estimated FP range based on program, current streak multiplier, and selected intent modifier                                                       Displayed as \"\~130-180 FP expected.\" Motivates the player by previewing the reward

  **Begin Quest**         Locks in the loadout and starts the session timer. All interactions after this are streamlined for mid-workout speed                                     Large, prominent button. Slight haptic feedback on tap. This is the point of no return
  ----------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**2.2 Session Intent Modifiers**

The Session Intent is the most important UX decision in the pre-session flow. By choosing an intent before starting, the player tells the app how to interpret their performance and which FP bonuses to apply. No toggles mid-workout. No distractions between sets.

  ----------------- ----------------------------------------------------------------------------- ------------------------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------
  **Intent**        **What It Means**                                                             **FP Bonus**                                            **Validation Method**

  **Normal**        Standard training. No special technique emphasis. The default                 None (base FP)                                          No special validation

  **Tempo Focus**   Slow eccentrics (3-4 sec lowering). Player commits to controlling every rep   +15 FP/exercise                                         Rest timer tracks set duration. Anomalously fast sets flagged (completed in \<40% expected time based on rep count x tempo)

  **Pause Reps**    1-3 second hold at the hardest position of each rep                           +15 FP/exercise                                         Soft time validation. Optional single-tap confirm: \"Paused? Yes/No\" on set completion

  **Deload**        Intentional recovery session. Lighter weight, lower intensity                 Flat 80 FP total, no volume calc, baseline unaffected   No validation. Trust the player. Tracked separately in history for periodization

  **Drop Sets**     Weight reductions mid-set to extend volume past failure                       +20 FP per drop set                                     During session, a \"Drop\" button appears next to rep input. Tapping logs current reps and prompts next weight/rep entry within the same set

  **Rest-Pause**    Brief 10-15s micro-rests within sets to push volume past failure              +10 FP per RP set                                       A \"Pause & Continue\" button appears. Starts 10-15s micro-timer, then player continues the same set
  ----------------- ----------------------------------------------------------------------------- ------------------------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------

Multiple intents can be combined. A player could select Tempo Focus + Drop Sets for an intense hypertrophy session. The FP bonuses stack. Active intents display as small badges at the top of the session screen as a reminder, but require no further interaction.

> *Intent selection is optional. If a player just wants to train without thinking about modifiers, they tap \"Begin Quest\" with Normal selected and the experience is identical to a standard workout tracker. The game layer never adds cognitive load during training.*

**2.3 Per-Exercise Override**

While the Session Intent sets the default for the whole workout, individual exercises can be overridden. During the session, a small icon next to each exercise name shows the active modifier. Tapping it cycles through the available intents for that specific exercise only. This handles the common scenario where a player does tempo squats but normal-speed calf raises in the same leg session. The override is a single tap, not a menu.

**3. In-Session Experience**

Once \"Begin Quest\" is tapped, the app enters a focused, minimal-distraction mode. The session screen is designed for one-handed operation with sweaty fingers on a phone held between sets.

**3.1 Session Screen Layout**

The screen is divided into three zones optimized for quick glancing and one-thumb operation:

**Top Zone (Glanceable Info)**

-   **Exercise name + set counter:** \"DB Floor Press (Heavy) --- Set 3/5\"

-   **Active intent badge:** Small pill showing \"TEMPO\" or \"NORMAL\" etc.

-   **Session progress bar:** Thin bar at the very top showing overall workout completion percentage

-   **FP accumulator:** Running total of FP earned so far this session, updating after each logged set

**Middle Zone (Action Area)**

-   **Weight input:** Displays last session\'s weight as default. Tap to change. Large +/- buttons for 5 lb increments

-   **Rep input:** Large number display with a numeric keypad below it. This is the primary interaction

-   **Log Set button:** Full-width button below the rep input. One tap logs the set and advances. Haptic confirmation

**Bottom Zone (Context)**

-   **Rest timer:** Appears immediately after logging a set. Counts down with programmed rest for this exercise. Audio pulse at 10s, double pulse at 0s. Tap anywhere to dismiss early

-   **Next exercise preview:** Shows upcoming exercise name and target during rest so the player can prepare equipment

-   **Quick notes:** Collapsible field for optional per-set notes (e.g., \"left shoulder tight\", \"easy set\")

> **3-SECOND RULE:** Logging a set must be completable in 3 seconds or less: glance at reps done, tap the number, hit Log. If any common set-logging interaction takes longer, the UX has failed.

**3.2 Auto-Advance Logic**

After logging the last set of an exercise, the app automatically advances to the next exercise after the rest timer completes. If no rest timer applies (last set of the workout, or a superset transition), it advances immediately. The player never manually navigates between exercises. The session flows forward on its own.

**3.3 Weight Memory & Progression Suggestions**

For every exercise, the app remembers the weight used in the most recent session and pre-fills it as the default. If the player\'s baseline system detects progressive overload is due (all rep targets hit last time), the app subtly suggests the next weight up with a small upward arrow and the new weight displayed in gold. Tapping the arrow accepts the increase. This is gentle coaching, not a requirement.

**3.4 Superset & Circuit Support**

Some programs include supersets (two exercises alternating) or circuits (three or more in rotation). The session flow handles this by grouping superset exercises and alternating between them automatically. After completing a set of Exercise A, the app shows Exercise B with a short transition (no full rest timer). After Exercise B\'s set, the standard rest timer starts before returning to Exercise A. Both exercises in the group display with a visual bracket connecting them.

**3.5 Mid-Session Adjustments**

Sometimes things change during a workout. The app supports two mid-session adjustments without breaking flow:

-   **Skip Exercise:** Swipe left on the current exercise to skip it (with confirmation tap). Logged as skipped, no FP earned for it. Useful when equipment is taken or something hurts

-   **Add Exercise:** A small \"+\" button in the bottom zone allows adding an exercise to the end of the session. Handles spontaneous accessory work not in the program

Both adjustments take under 5 seconds and don\'t interrupt the current set flow.

**4. Cardio Integration**

Cardio is a first-class citizen in Iron Quest, not an afterthought. Players who do cardio alongside their lifting, or as their primary training, should earn meaningful FP and see their pet benefit from the effort.

**4.1 Cardio FP Mapping**

Cardio doesn\'t produce typed FP the same way lifting does. Instead of mapping to specific muscle groups, cardio generates FP that feeds into stats reflecting endurance and conditioning.

  ----------------------------------------------------- --------------------------- ------------------------ -------------------------------------------------------------------------------------------
  **Cardio Type**                                       **Primary FP Types**        **Secondary FP Types**   **Rationale**

  **LISS (Walking, Easy Cycling, Light Jog)**           Vigor (endurance, HP)       Spirit (consistency)     Low intensity, long duration. Rewards showing up. Great recovery that still feeds the pet

  **HIIT (Sprints, Intervals, Rowing)**                 Speed (turn order, dodge)   Vigor (stamina regen)    High intensity, short duration. Mirrors the explosive nature of Speed. High FP per minute

  **Hybrid Conditioning (Circuits, KB Swings)**         Speed + Power (mixed)       Vigor                    Bridges cardio and resistance. Generates some Power FP from loaded movements

  **Sport / Activity (Basketball, Swimming, Hiking)**   Vigor + Speed (general)     Spirit                   Catch-all for active days. Lower FP rate but recognizes all movement as valuable
  ----------------------------------------------------- --------------------------- ------------------------ -------------------------------------------------------------------------------------------

**4.2 Cardio Session Logging**

Cardio sessions use a different logging interface than lifting, optimized for the metrics that matter in cardio work.

**4.2.1 Cardio Loadout Screen**

Before starting, the player selects the cardio type (LISS, HIIT, Hybrid, or Sport/Activity) and sets a target duration. The Loadout shows estimated FP range based on duration and type, plus which pet stats will benefit. For HIIT specifically, the player can configure interval structure (e.g., 30 sec work / 60 sec rest, 8 rounds).

**4.2.2 Cardio Session Screens**

  ---------------------- ---------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------
  **Cardio Type**        **Session Screen**                                                                                                     **Player Interaction**

  **LISS**               Large running timer. FP accumulating in real-time as duration milestones are hit                                       Minimal: start and stop. Optional RPE (1-10 effort rating) every 10 minutes

  **HIIT**               Interval timer with work/rest phases: red = work, blue = rest. Round counter. Audio cues for transitions               Start only. Timer handles everything. Optional RPE after each round. Log rounds completed at end if different from target

  **Hybrid**             Circuit-style exercise list with running timer. Similar to lifting but shorter rest and continuous movement emphasis   Log reps per exercise in circuit (like lifting). Rest timer between rounds. Total rounds tracked

  **Sport / Activity**   Simple running timer with duration milestones. Freeform activity tracking                                              Start, stop, optional activity description. RPE at end. Duration is the primary metric
  ---------------------- ---------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------------------

**4.3 Cardio FP Calculation**

Cardio FP is primarily duration-based with intensity multipliers for higher-effort session types.

  ----------------------- ------------------ ------------------ ------------------ ------------------
  **FP Component**        **LISS**           **HIIT**           **Hybrid**         **Sport**

  **Base Rate**           2 FP/min           4 FP/min           3 FP/min           1.5 FP/min

  **Min Duration**        20 min             10 min             15 min             20 min

  **Duration Cap**        60 min (120 max)   30 min (120 max)   45 min (135 max)   90 min (135 max)

  **Completion Bonus**    +20 FP             +30 FP             +25 FP             +15 FP

  **Streak Multiplier**   Same as lifting    Same as lifting    Same as lifting    Same as lifting
  ----------------------- ------------------ ------------------ ------------------ ------------------

**Example: 30-min LISS walk = (30 x 2) + 20 completion = 80 FP. With 5-day streak (1.5x): 120 FP. A 20-min HIIT session = (20 x 4) + 30 = 110 FP. With same streak: 165 FP.**

> *HIIT earns more per minute to reflect higher intensity, but the shorter duration cap prevents it from dramatically out-earning lifting. A full lifting session (typically 150-250 FP) should always earn more than cardio alone. Lifting is the primary FP engine; cardio is a meaningful supplement.*

**4.4 Mixed Days**

Players can do both a lifting session and a cardio session on the same day. Each generates its own FP independently. The streak multiplier applies to both. Both sessions appear separately in workout history but the daily FP summary combines them. This encourages the common pattern of lifting first, then finishing with 20 minutes of cardio.

**5. Post-Session Summary**

The completion screen is a celebration moment. It should feel like a victory screen after a boss fight, not a clinical data readout.

**5.1 Summary Screen Components**

-   **Quest Complete banner:** Animated text with the workout name. Confetti or particle effect for the first 2 seconds

-   **Session stats:** Duration, total volume (weight x reps), sets completed, exercises completed

-   **FP earned breakdown:** Visual breakdown: base FP, volume bonus, intent modifier bonus, streak multiplier, PR bonuses. Each line animates in sequentially like a score tally in a fighting game

-   **Typed FP distribution:** Small radar chart showing where the FP went (which pet stats this session fed). Animates from empty to filled

-   **PR callouts:** Any new personal records highlighted with gold flash and \"NEW PR!\" badge

-   **Streak update:** Current streak with multiplier shown. New streak milestones (3, 7, 14, 30 days) are celebrated with their own animation

-   **Next action prompt:** Gentle: \"Head to The Den to invest your FP\" or \"Your pet is hungry!\" or \"Rest up for tomorrow\"

**5.2 Quick Actions**

-   **Go to The Den:** Opens pet care screen to immediately spend earned FP while satisfaction is fresh

-   **Done:** Returns to home screen. FP is banked for later. No pressure to spend immediately

> *The summary screen is not dismissible by accident. It requires a deliberate tap on either action button. This prevents players from skipping past their FP breakdown and PR celebrations, which are key motivation moments.*

**6. Exercise Database & Tagging**

Every exercise in the app is tagged with muscle groups that determine which typed FP it generates. The tagging system is the bridge between the workout tracker and the pet stat system.

**6.1 Muscle Group Tags**

  --------------------------- ----------------------- ---------------- ---------------------------------
  **Muscle Group**            **FP Type Generated**   **Tag Weight**   **Example Exercises**

  **Chest**                   Power                   Primary          Bench Press, DB Flyes, Push-ups

  **Shoulders**               Power                   Primary          OHP, Lateral Raises, Face Pulls

  **Back (Lats/Rhomboids)**   Guard                   Primary          Rows, Pull-ups, Pullovers

  **Traps**                   Guard                   Secondary        Shrugs, Deadlifts (secondary)

  **Quads**                   Speed                   Primary          Squats, Lunges, Leg Press

  **Hamstrings**              Speed                   Primary          RDL, Leg Curls, Nordic Curls

  **Calves**                  Vigor                   Secondary        Calf Raises, Box Jumps

  **Core / Abs**              Vigor                   Primary          Planks, Leg Raises, Ab Rollouts

  **Biceps**                  Focus                   Primary          Curls, Chin-ups (secondary)

  **Triceps**                 Focus                   Primary          Pushdowns, Dips, CGBP
  --------------------------- ----------------------- ---------------- ---------------------------------

Each exercise can have one Primary tag (full FP rate) and up to two Secondary tags (30% FP rate). Example: Barbell Rows = Primary: Back (Guard), Secondary: Biceps (Focus), Secondary: Traps (Guard). This ensures compound movements generate FP for all muscles they work.

**6.2 Auto-Tagging**

When a player creates a custom exercise, the app auto-suggests tags based on a fuzzy name match against a dictionary of common exercises. \"Incline DB Press\" would suggest Primary: Chest (Power), Secondary: Shoulders (Power), Secondary: Triceps (Focus). The player can accept, modify, or override. Any exercise without at least one tag is flagged and cannot generate typed FP until tagged.

**6.3 Spirit FP Generation**

Spirit FP comes exclusively from the streak system and consistency metrics, not from any exercise or muscle group. This is deliberate: Spirit represents discipline and commitment, not physical capability. It cannot be trained directly, only earned through sustained effort over time. This makes it the most prestigious stat and hardest to build.

**7. Weekly Quest System**

Weekly quests are rotating mini-challenges that add variety and bonus FP to the standard training loop. They refresh every Monday and provide small, achievable goals that reward different types of engagement.

**7.1 Quest Types**

  -------------------- ---------------------------------------------------------------------------------------- --------------- ------------------------------------------------------------
  **Quest Category**   **Example Quests**                                                                       **FP Reward**   **Design Intent**

  **Volume**           \"Log 500 total reps this week\" or \"Complete 20 sets of pulling exercises\"            25-50 FP        Encourages consistent training volume

  **Consistency**      \"Train 4 days this week\" or \"Don\'t miss a scheduled day\"                            25-50 FP        Rewards showing up on schedule

  **Technique**        \"Complete 3 sessions with Tempo intent\" or \"Do pause reps on all compound lifts\"     30-60 FP        Encourages training variety and intent usage

  **Balance**          \"Do at least one Push, Pull, and Leg session\" or \"Log cardio twice this week\"        30-50 FP        Prevents over-specialization, promotes balanced pet growth

  **Pet**              \"Feed your pet 3 times\" or \"Allocate 50 FP to stats\" or \"Attempt 2 tower floors\"   20-40 FP        Drives engagement with pet and tower systems
  -------------------- ---------------------------------------------------------------------------------------- --------------- ------------------------------------------------------------

Each week presents 3 quests (one easy, one medium, one hard). Completing all three awards a bonus 25 FP. Quests are algorithmically generated based on the player\'s active program and history to ensure they are always achievable within the player\'s normal training pattern.

> *Quests should never require the player to train more than their program prescribes. A player on a 3-day program should not get a quest requiring 5 training days. The system adapts to the player\'s schedule, not the other way around.*

**8. Implementation Priority**

Not all systems need to ship in Phase 1. Here is the recommended build order, aligned with the PRD roadmap:

  ----------------------------------------------------------------------------- ----------- -------------- ------------------------------------------------------------------------
  **Feature**                                                                   **Phase**   **Priority**   **Notes**

  **Core session flow (exercise list, rep logging, rest timer)**                Phase 1     **P0**         Absolute foundation. Nothing works without this

  **Weight memory + auto-fill from last session**                               Phase 1     **P0**         Essential for speed. Players expect this from any tracker

  **Template browser with 4 core templates (PPL, UL, Full Body, Minimalist)**   Phase 1     **P0**         Needed for onboarding. Start with 4, expand later

  **FP calculation engine (base + volume + streak)**                            Phase 1     **P0**         Core economy. Must ship with tracker

  **Post-session summary screen with FP breakdown**                             Phase 1     **P0**         The celebration moment. Critical for motivation loop

  **Loadout screen with Session Intent (Normal + Deload only)**                 Phase 1     **P1**         Start with Normal and Deload. Add Tempo/Pause/Drop in Phase 2

  **Copy & Customize template editing**                                         Phase 1     **P1**         Important for retention. Power users need this early

  **Personal Baseline system + relative FP scaling**                            Phase 1     **P1**         Establishes during first 3 sessions. Needed for fairness

  **FP distribution radar chart on templates**                                  Phase 1     **P1**         Makes template selection strategic. Can ship as simple bar chart first

  **Full Session Intent suite (Tempo, Pause, Drop Set, Rest-Pause)**            Phase 2     **P1**         Advanced modifiers. Adds depth after core loop is proven

  **Cardio session logging (all 4 types)**                                      Phase 2     **P1**         Important for balanced pet growth. LISS first, then HIIT/Hybrid

  **Superset & circuit support**                                                Phase 2     **P2**         Nice-to-have. Many programs don\'t use supersets

  **Weekly quest system**                                                       Phase 2     **P2**         Adds variety after the core loop is established

  **Build-from-scratch program editor**                                         Phase 2     **P2**         Power user feature. Copy & Customize covers most cases

  **Auto-tagging engine for custom exercises**                                  Phase 2     **P2**         Quality of life. Manual tagging works for MVP

  **Progressive overload suggestions (gold weight arrow)**                      Phase 3     **P2**         Smart coaching feature. Requires several weeks of data first

  **Expanded template library (8-10 total)**                                    Phase 3     **P2**         Content expansion. 4 templates covers MVP
  ----------------------------------------------------------------------------- ----------- -------------- ------------------------------------------------------------------------

**P0 = Must ship in Phase 1. P1 = Should ship in target phase, critical for experience. P2 = Nice-to-have, can slip without blocking launch.**

*End of Document \| Iron Quest Workout Tracker Design Spec v1.0*

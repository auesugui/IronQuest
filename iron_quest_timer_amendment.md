**IRON QUEST**

Tracker Spec Amendment

*Spirit FP Correction & Smart Rest Timer System*

Amends: Tracker Design Spec v1.0 (Sections 4, 3) \| PRD Addendum v2.1 (Section B) \| February 2026

**Amendment 1: Spirit FP Exclusivity**

**1.1 The Problem**

In the current Tracker Spec v1.0, Section 4.1 assigns Spirit as a secondary FP type for LISS cardio and Sport/Activity sessions. This contradicts the core design established in PRD Addendum v2.1, Section B, which states: \"Spirit FP comes exclusively from the streak system and consistency metrics, not from any exercise or muscle group.\" If LISS cardio generates Spirit FP, players can inflate their Spirit stat by logging daily walks without maintaining a real lifting streak. This undermines Spirit\'s intended role as the rarest, most prestigious stat that proves sustained multi-dimensional commitment.

**1.2 The Fix**

**Remove Spirit from all exercise and cardio FP generation. Spirit FP is earned only through the streak system. No exceptions.**

**1.2.1 Corrected Cardio FP Table**

The following replaces Tracker Spec Section 4.1:

  ----------------------------------------------------- --------------------------- --------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Cardio Type**                                       **Primary FP Types**        **Secondary FP Types**            **Rationale (Updated)**

  **LISS (Walking, Easy Cycling, Light Jog)**           Vigor (endurance, HP)       Focus (mental clarity)            LISS is meditative and improves concentration. Focus FP gives cardio-only players a secondary stat they wouldn\'t otherwise build from low-intensity work

  **HIIT (Sprints, Intervals, Rowing)**                 Speed (turn order, dodge)   Vigor (stamina regen)             No change from original spec. HIIT correctly maps to explosive, speed-based attributes

  **Hybrid Conditioning (Circuits, KB Swings)**         Speed + Power (mixed)       Vigor                             No change. Hybrid work involves loaded movements that justify Power generation alongside Speed

  **Sport / Activity (Basketball, Swimming, Hiking)**   Vigor + Speed (general)     Focus (coordination, awareness)   Changed from Spirit to Focus. Sports require coordination and spatial awareness, which maps better to Focus (crit rate, accuracy) than to Spirit (discipline)
  ----------------------------------------------------- --------------------------- --------------------------------- ---------------------------------------------------------------------------------------------------------------------------------------------------------------

**1.2.2 Updated Spirit Generation Rules**

Spirit FP is generated exclusively through the following mechanisms. No exercise, cardio session, food item, or shop purchase can generate Spirit FP:

  ------------------------------ -------------------------------------------------------------------------- ------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------
  **Spirit Source**              **FP Amount**                                                              **Frequency**                   **Design Intent**

  **Daily Streak Maintenance**   5 Spirit FP per consecutive training day                                   Daily (on workout completion)   The core drip. Shows up every day, train every day, Spirit grows steadily

  **Streak Milestones**          Bonus Spirit: 15 FP at 7-day, 30 FP at 14-day, 50 FP at 30-day             On milestone hit                Celebrates long streaks with meaningful Spirit injections. The 30-day milestone is a big deal

  **Weekly Completion Bonus**    10 Spirit FP if all scheduled workouts for the week are completed          Weekly (Sunday check)           Rewards program adherence, not just volume. Completing 3/3 scheduled workouts earns this even if someone else did 6 unstructured sessions

  **Monthly Consistency**        25 Spirit FP if 90%+ of scheduled workouts completed in a calendar month   Monthly                         The long game. Allows missing a day or two while still rewarding overall commitment
  ------------------------------ -------------------------------------------------------------------------- ------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------

**Example: A player on a 6-day PPL program who trains consistently for one month earns approximately: (26 training days x 5 daily) + (3 weekly milestones x 15/30) + (4 weekly completions x 10) + (1 monthly bonus x 25) = 130 + 45 + 40 + 25 = 240 Spirit FP in a month.**

At 10 FP per Spirit stat point (as established in PRD v2.0 Section 4.1.2), that\'s roughly 24 Spirit stat points per month of perfect consistency. Compare this to Power or Guard, where a dedicated lifter might earn 400+ typed FP per month. Spirit grows at roughly half the rate of physical stats, which is exactly the intended design: it is the slowest-growing, most prestigious stat.

> *The weekly completion bonus specifically rewards completing SCHEDULED workouts, not just any workouts. A player who schedules 3 days and hits all 3 earns the bonus. A player who schedules 6 and hits 4 does not. This encourages realistic scheduling rather than aspirational overcounting.*

**1.3 Impact on Pet Balance**

With Spirit removed from cardio, players who only do cardio will have a noticeable Spirit gap compared to those who maintain lifting streaks. This is intentional and creates a meaningful distinction between casual movers and committed trainees. However, cardio-only players still earn Spirit from their own streaks (consecutive cardio days count), so they are not completely locked out. The gap narrows for anyone who shows up consistently, regardless of training modality.

**Amendment 2: Smart Rest Timer System**

**2.1 The Problem**

The current Tracker Spec (Section 3.1) describes the rest timer as a simple countdown that starts after logging a set and ends with audio cues. This works perfectly in a home gym where you control the environment. In a commercial gym, reality intrudes: the bench you need is occupied, someone is using the dumbbells you need next, you need to adjust a rack, refill water, or move to a different area. A rigid countdown timer in these situations creates pressure that has nothing to do with the actual workout. The player feels rushed, annoyed, or like they are \"failing\" because the timer expired while they were waiting for equipment. Over time, this friction compounds into resentment toward the app.

**2.2 Design Principles**

-   **The timer is a tool, not a judge:** It should help the player track rest, not punish them for real-world delays

-   **No FP penalty for pausing:** Extended rest between sets should never reduce FP earnings. The app rewards effort (reps completed), not speed

-   **Distinguish rest from delay:** The system should understand the difference between intentional rest (recovering between sets) and situational pauses (gym logistics)

-   **Zero-tap handling for common scenarios:** The most frequent interruptions (equipment wait, setup time) should be handleable with one tap at most

**2.3 Timer Modes**

The rest timer operates in three modes. The player can move between them fluidly with minimal interaction.

**2.3.1 Active Rest (Default)**

This is the standard countdown timer that starts automatically after logging a set. It counts down from the programmed rest period for the current exercise (e.g., 90 seconds for heavy compounds, 60 seconds for accessories). Audio/haptic cues fire at 10 seconds remaining and at zero. When it reaches zero, the app gently transitions to the \"Ready\" state, showing the next set\'s target. It does not auto-start anything or create urgency. The display simply shifts from a countdown to an indication that the rest period is complete.

> **KEY CHANGE:** When the timer reaches zero, it does NOT beep insistently or flash warnings. It plays a single gentle chime and transitions to a calm \"Ready when you are\" state. The timer then counts UP (showing elapsed time past the rest target) as a passive reference, not a stress indicator. The up-count is displayed in a muted color, not red or warning tones.

**2.3.2 Pause Mode**

A single tap on the timer (or a dedicated pause icon) enters Pause Mode. The countdown freezes. The screen displays a calm \"Paused\" indicator with the time frozen. This is the universal solution for any interruption: equipment wait, bathroom, water refill, conversation with a gym buddy, adjusting a rack, or simply needing more time. There is no limit on pause duration. Paused time is tracked separately in the session data (as \"transition time\") so the player can see their actual rest versus total elapsed time in their workout history, but it has zero impact on FP calculations.

Resuming from Pause Mode is also a single tap. The countdown resumes from where it left off (not from the beginning). If the remaining time was 30 seconds when paused, it resumes at 30 seconds.

**2.3.3 Extend Mode**

Sometimes you want more rest without fully pausing. Holding the timer (long press) or tapping a \"+30s\" button adds 30 seconds to the current countdown. This handles the scenario where you know you need a bit more recovery but don\'t want to enter a full pause. The extension is logged as additional rest time. Again, no FP impact.

**2.4 Smart Timer Behaviors**

Beyond the three modes, the timer has several intelligent behaviors that reduce friction:

**2.4.1 Equipment Transition Detection**

When the next exercise in the session uses different equipment than the current one (e.g., moving from DB Floor Press to DB Rows), the timer automatically adds a configurable transition buffer (default: 30 seconds) on top of the programmed rest. The display shows this as \"Rest: 90s + Setup: 30s\" so the player understands why the timer is longer. This buffer accounts for walking to a different area, grabbing new dumbbells, and getting into position. The transition buffer is customizable in settings and can be set per-equipment-type.

  ---------------------------------------- --------------------------- ------------------- -----------------------------------------------------
  **Transition Scenario**                  **Default Buffer**          **Customizable?**   **Example**

  **Same exercise, next set**              0s (programmed rest only)   No                  Set 2 of DB Press after Set 1

  **Same equipment, different exercise**   +15s buffer                 Yes                 DB Press to DB Flyes (same dumbbells)

  **Different equipment, same area**       +30s buffer                 Yes                 DB Press to Barbell Rows (both in free weight area)

  **Different area of gym**                +45s buffer                 Yes                 Free weights to cable station

  **Major equipment change**               +60s buffer                 Yes                 Barbell squat rack to dumbbell area
  ---------------------------------------- --------------------------- ------------------- -----------------------------------------------------

> *Equipment transition detection requires exercises to be tagged with an equipment type (dumbbell, barbell, cable, machine, bodyweight, bench, rack). This tag is part of the exercise database and auto-suggested during template creation. Home gym users with a fixed setup can disable transition buffers entirely in settings.*

**2.4.2 Overrun Handling**

When the rest timer reaches zero and the player hasn\'t started their next set, the timer enters a passive count-up state. The display shifts from the countdown color to a neutral muted gray and shows time elapsed past the target rest. There are no alerts, no flashing, and no notifications. The count-up serves purely as informational reference for players who want to track their actual rest periods.

If the overrun exceeds 3 minutes, the app displays a single, non-intrusive prompt: \"Still going? Tap when ready.\" This is not a judgment; it\'s a check to prevent forgotten sessions from running indefinitely (e.g., the player set their phone down and walked away). Tapping \"Still going\" dismisses the prompt. The session continues normally. If no interaction occurs for 10 minutes, the session auto-pauses to preserve battery and data integrity, with a gentle notification: \"Session paused. Tap to resume whenever you\'re ready.\"

**2.4.3 Gym Rush Mode**

An optional mode accessible from the session settings (small gear icon in the top zone). When Gym Rush Mode is activated, the rest timer cuts all programmed rest times by 25% and hides the transition buffers. This is for days when the gym is packed and you want to move fast to keep equipment. It\'s entirely opt-in and can be toggled mid-session. Gym Rush Mode earns the Reduced Rest Period FP bonus (+10 FP per exercise) as described in the PRD Addendum v2.1 Section B.3.

**2.5 Timer Visual Design**

The timer\'s visual treatment communicates its state without requiring the player to read numbers:

  -------------------------------- -------------------------------------------------------------------------------------------------------------------------- ----------------------------------------------------- --------------------------------------------------------------------------
  **Timer State**                  **Visual Treatment**                                                                                                       **Sound/Haptic**                                      **Player Feeling**

  **Counting Down (\>10s)**        Calm blue gradient. Circular progress ring depleting smoothly. Large time display                                          None. Silent countdown                                Relaxed, recovering. No pressure

  **Approaching Ready (10s-0s)**   Ring transitions from blue to soft gold. Subtle pulse animation                                                            Gentle pulse haptic at 10s. Single soft chime at 0s   Aware that rest is ending. Preparing mentally

  **Ready (0s, just hit zero)**    Full gold ring. \"Ready when you are\" text replaces timer. Next set info displayed                                        Single chime at transition. Then silence              Clear signal that rest is done, but zero urgency to rush

  **Overrun (past 0s)**            Muted gray count-up. Smaller font than the countdown. Recedes visually so it doesn\'t dominate the screen                  None. Completely silent                               Informational only. The app is patient. It will wait as long as needed

  **Paused**                       Frozen display with a calm \"Paused\" badge. Muted colors. Frozen ring position                                            None                                                  The workout is on hold. No judgment. Life is happening

  **Transition Buffer Active**     Two-segment ring: blue segment for rest, purple segment for setup time. Labels visible: \"Rest: 60s\" and \"Setup: 30s\"   Chime only when full timer (rest + setup) hits zero   The app understands they are moving to new equipment and gives them time
  -------------------------------- -------------------------------------------------------------------------------------------------------------------------- ----------------------------------------------------- --------------------------------------------------------------------------

**2.6 FP Interaction with Timer**

**This is the critical rule: rest time and pause time have ZERO impact on FP calculations.**

FP is calculated from reps completed, weight used, personal baseline comparison, intent modifiers, and streak multiplier. It is never calculated from time. A player who rests 60 seconds between sets and a player who rests 4 minutes between the same sets earn identical FP for the same reps and weight. The only timer-related FP bonus is the Reduced Rest Period modifier (Gym Rush Mode or manually shortening rest), which is purely additive and never penalizes normal or extended rest.

> *This is a deliberate philosophical choice. Many workout apps gamify speed (\"finish your workout in under 45 minutes!\"). Iron Quest does not. Rushing through a workout to beat a clock is the opposite of quality training. The app rewards effort quality, not speed. Rest as long as you need.*

**2.7 Session Duration Tracking**

While rest time doesn\'t affect FP, the app still tracks total session duration for the player\'s own records. The session summary breaks time into three categories:

-   **Active Time:** Total time spent actually performing sets (estimated from set count x average set duration based on rep count and intent modifier)

-   **Rest Time:** Total time in Active Rest mode (countdown running)

-   **Transition Time:** Total time in Pause Mode, overrun, and equipment transition buffers

This breakdown appears in the workout history and helps players understand their session efficiency over time. Some players will find value in seeing \"I spent 15 minutes in transition today, maybe I should reorganize my exercise order.\" Others will ignore it entirely. Both are fine. The data is available but never used as a judgment.

**Summary of Document Changes**

  ----------------------- ------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Document**            **Section Affected**                        **Change**

  **Tracker Spec v1.0**   Section 4.1 (Cardio FP Mapping)             LISS secondary changed from Spirit to Focus. Sport/Activity secondary changed from Spirit to Focus. All other cardio FP assignments unchanged

  **Tracker Spec v1.0**   Section 4.3 (Cardio FP Calculation)         No numerical changes. FP rates remain the same. Only the type assignment for secondary FP is corrected per above

  **Tracker Spec v1.0**   Section 3.1 (Rest Timer)                    Replaced simple countdown description with full Smart Timer system: Pause Mode, Extend Mode, Equipment Transition Detection, Overrun Handling, Gym Rush Mode, and visual design spec

  **PRD Addendum v2.1**   Section B.3 (Training Variable Modifiers)   Reduced Rest Period bonus now explicitly tied to Gym Rush Mode toggle rather than passive detection. Clarifies opt-in nature

  **PRD v2.0**            Section 4.1.2 (Stat Allocation)             Spirit cost note now references the detailed Spirit generation table from this amendment. Spirit remains the most expensive stat at 10 FP per point

  **Tracker Spec v1.0**   Section 6.3 (Spirit FP Generation)          Expanded from a paragraph to a full generation table with daily, weekly, and monthly Spirit sources. Reinforces exclusivity from streak/consistency only
  ----------------------- ------------------------------------------- --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

*End of Amendment \| Iron Quest Tracker Spec Amendment v1.0*

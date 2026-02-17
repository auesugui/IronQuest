**IRON QUEST**

PRD Addendum v2.1

*Resolved Decisions, New Systems & Balance Design*

Companion to Iron Quest PRD v2.0 \| February 2026

**A. Resolved Decisions**

The following open questions from PRD v2.0 Section 12 have been resolved. Each decision includes the rationale and its impact on the product design.

**A1. Auto-Feed + Cosmetic Emotional Bond**

**Decision: Auto-feed will be available. The emotional connection with the pet will come from cosmetic customization (skins, accessories, visual effects) rather than manual feeding rituals.**

Rationale: manual feeding adds friction without meaningful decision-making. Choosing to buy your pet a crystalline armor skin or a flame particle trail is a much more personal expression of attachment than tapping a \"feed\" button daily. The auto-feed feature ensures the pet never suffers from neglect while the player focuses on what actually matters: training and making strategic spending choices.

Implementation: auto-feed can be toggled on in settings. When enabled, the cheapest available food is automatically applied when hunger drops below 50%. Players can still manually feed premium food for stat buffs. The cosmetic shop becomes the primary emotional investment channel.

**A2. Prestige System with Badges**

**Decision: Quarterly prestige resets. Tower progress resets every 3 months. Players earn a prestige badge for their highest floor reached, and the badge is permanent and visible on their profile.**

Rationale: the Call of Duty prestige model works here because the badge system makes the reset feel like a promotion rather than a loss. Each prestige tier has a distinct visual badge (Bronze Star, Silver Shield, Gold Crown, etc.) that signals to other players how many seasons you\'ve been climbing and how high you\'ve reached. The tower resetting also prevents late-game stagnation where a maxed-out player has nothing to push for.

Key details: pet stats, evolution stage, and cosmetics are never reset. Only tower floor progress resets. This means the player\'s investment in their pet is permanent, but the tower provides a fresh challenge each season. Players who reach certain floors before the reset earn exclusive seasonal cosmetics that can never be obtained again, creating genuine rarity.

  ------------------- ----------------------------- ----------------- ------------------------------- ------------------------
  **Prestige Tier**   **Requirement**               **Badge Style**   **Permanent Reward**            **Seasonal Exclusive**

  **Prestige I**      Clear floor 10 in a season    Bronze Star       +2% base FP bonus               Bronze pet aura

  **Prestige II**     Clear floor 25 in a season    Silver Shield     +5% base FP bonus               Silver trail effect

  **Prestige III**    Clear floor 50 in a season    Gold Crown        +8% base FP + auto-feed free    Gold evolution skin

  **Prestige IV**     Clear floor 75 in a season    Platinum Emblem   +12% base FP + unique ability   Platinum particle set

  **Prestige V**      Clear floor 100 in a season   Diamond Crest     +15% base FP + title            Legendary cosmetic set
  ------------------- ----------------------------- ----------------- ------------------------------- ------------------------

> *Prestige FP bonuses stack across seasons. A player who has earned Prestige III in two different seasons has +16% base FP permanently. This means veteran players earn faster, but the advantage is moderate, not overwhelming.*

**A3. Pet Types with Elemental Affinities**

**Decision: Players choose a pet type at game start. The choice affects visual theme, starting ability, and type matchups in the battle tower.**

Rationale: choosing a type at the beginning creates an immediate sense of identity and investment. It also adds a strategic layer to the tower where some floors are easier or harder depending on your type. Crucially, type disadvantages should feel like a challenge to overcome through harder training, not an unfair wall. A player with a type disadvantage against a floor\'s enemies needs more stats to compensate, which means more workouts, which is exactly the behavior we want to incentivize.

  ----------- ------------------------------------------------------------------------------- -------------------------------- ------------------------------- -------------------
  **Type**    **Visual Theme**                                                                **Strong Against**               **Weak Against**                **Stat Affinity**

  **Ferro**   Metallic, angular, industrial. Sharp edges, chrome gradients, spark particles   Flux (metal cuts energy)         Terra (earth grounds metal)     Power + Focus

  **Terra**   Organic, rounded, natural. Moss textures, earth tones, growth animations        Ferro (earth grounds metal)      Flux (energy disrupts nature)   Guard + Vigor

  **Flux**    Energetic, fluid, electric. Neon glows, wave patterns, pulse animations         Terra (energy disrupts nature)   Ferro (metal cuts energy)       Speed + Spirit
  ----------- ------------------------------------------------------------------------------- -------------------------------- ------------------------------- -------------------

The three-type triangle (Ferro \> Flux \> Terra \> Ferro) is intentionally simple. It mirrors the classic rock-paper-scissors model that works in Pokemon, Fire Emblem, and dozens of other games because it\'s immediately intuitive without needing a reference chart. Tower enemies are assigned types, and the player can see the enemy\'s type before committing a battle attempt.

**Type Advantage Mechanics**

When a pet has a type advantage, it deals 1.3x damage and takes 0.8x damage. When at a disadvantage, it deals 0.8x damage and takes 1.3x damage. Neutral matchups are 1.0x on both. These numbers are intentionally moderate. A type disadvantage is a speed bump, not a wall. A well-trained pet can brute-force through a bad matchup with enough stats. The advantage just means a player with the right type needs fewer stats to clear the same floor, creating a natural incentive for type-diverse training.

> *Future expansion idea: allow players to raise a second pet of a different type. This would require double the workout investment but provides coverage against all matchups. This is a Phase 4+ feature and should not be designed into the MVP.*

**A4. Self-Contained Tracker**

**Decision: No integration with external workout apps. Iron Quest is a fully self-contained ecosystem.**

Rationale: data integrity is essential for the game economy. If players could import inflated numbers from other apps, it would break the FP system. Additionally, owning the full data pipeline means we can capture exactly the metadata needed for FP calculations (timestamps between sets, tempo indicators, rest durations) that external apps don\'t reliably provide. The tracker needs to be good enough that players don\'t want to use anything else alongside it.

**A5. Vacation Mode**

**Decision: No punishment for inactivity. Gentle opt-in vacation reminders instead of hunger decay.**

Rationale: life happens. A player who takes two weeks off for a family trip shouldn\'t come back to a miserable, weakened pet. That experience would feel punishing and could cause permanent churn. Instead, the system handles inactivity gracefully.

**How It Works**

-   **Vacation toggle:** Player can set a vacation period (1-30 days) in settings. During vacation, hunger decay pauses completely, streak resets are forgiven (streak resumes where it left off when they return), and the pet enters a visible \"resting\" animation in The Den

-   **Gentle nudges:** If a vacation is set, the app sends a single friendly notification halfway through: \"Your pet is resting up! Ready to get back to it?\" and another on the return date: \"Welcome back! Your pet missed you.\" No guilt, no urgency

-   **Unplanned absences:** If a player simply stops opening the app without setting vacation, hunger still decays slowly but the pet never drops below a \"drowsy\" state. No stat loss, no permanent consequences. When the player returns, one feeding restores everything. The streak resets but the app celebrates the return: \"Welcome back, warrior. Let\'s rebuild that streak\"

-   **No gaming the system:** Vacation mode does not generate FP or progress. It simply freezes decay. Players cannot advance their pet while on vacation. The only way forward is training

> **PHILOSOPHY:** Iron Quest should always feel like an app that wants you to come back, never one that punishes you for leaving. The incentive to train comes from wanting to grow your pet, not from fearing its decline.

**A6. Cosmetic + Functional FP Spending**

**Decision: FP is spendable on both functional stat upgrades and cosmetic items. Two separate shops with one shared currency.**

Rationale: cosmetics extend engagement and create visible personalization that stats alone can\'t provide. A player who has invested 500 FP into a flame trail for their pet has made that creature genuinely theirs. The key is that cosmetics are never required for progression. They\'re purely expressive. The functional shop (stat allocation, feeding, training) is where battle power comes from.

**Cosmetic Shop Categories**

-   **Color Palettes:** Override the pet\'s stat-derived color scheme with custom palettes (50-100 FP each)

-   **Particle Effects:** Trailing sparks, ambient glow, orbiting shapes (100-200 FP each)

-   **Accessories:** Geometric \"armor\" overlays, crown shapes, eye modifications (150-300 FP each)

-   **Evolution Skins:** Alternate visual themes for each evolution stage (500 FP each, only available after reaching that stage)

-   **Seasonal Exclusives:** Time-limited cosmetics earned from prestige or tower milestones (not purchasable, only earnable)

> *Cosmetic prices should be calibrated so a player can afford one meaningful cosmetic every 1-2 weeks of consistent training. Cosmetics should feel like treats, not obligations. The total FP economy needs to support both functional spending and occasional cosmetic purchases without either feeling starved.*

**A7. AI Integration (Future)**

**Decision: AI-assisted features planned for post-stabilization (Phase 4+). Two primary use cases identified.**

-   **Battle Advisor:** When a player is stuck on a tower floor for multiple attempts, an AI assistant could analyze their pet\'s stats vs the enemy\'s profile and suggest stat allocation priorities or ability configurations to break through

-   **Workout Coach:** An AI feature that looks at the player\'s pet stat distribution and training history, identifies imbalances, and suggests workout modifications or new exercises to target underdeveloped areas. Example: \"Your pet\'s Speed is lagging behind its Power. Adding more leg volume this week would help balance your build\"

These features require a stable game economy and sufficient training data to be useful. They should not be attempted before the core loop is proven and the FP balance is tuned.

**B. Relative Effort Scaling System**

**This is the most critical balance system in the entire product. It determines whether Iron Quest feels fair for a brand new lifter and a 10-year veteran using the same app.**

**B1. The Problem**

A raw numbers-based FP system is fundamentally broken. If FP scales linearly with weight lifted, a seasoned lifter benching 225 lbs earns dramatically more than a beginner pressing 65 lbs. This creates two problems: new players feel the game is unfairly slow, and experienced players who plateau or intentionally deload (a normal part of smart training) feel punished by lower FP earnings during those phases.

Real-world training is not a straight line up. Lifters periodize: they go through volume blocks with lighter weight and more reps, intensity blocks with heavier weight and fewer reps, deload weeks where everything drops, and technique phases where the focus is form quality, not load. All of these are productive training. The FP system must recognize all of them as valuable effort.

**B2. The Solution: Personal Baseline System**

Every player has a Personal Baseline (PB) for each exercise. The baseline is established from their first 3 sessions performing that exercise and updates gradually over time using a rolling average. FP is calculated relative to this baseline, not absolute numbers.

**How the Baseline Works**

When a player first logs an exercise, the app records their working weight, rep count, and estimated volume (weight x reps x sets). After 3 sessions, the average becomes their baseline. All future FP calculations compare the current session against this baseline. The baseline slowly adjusts over time (moving average weighted toward recent sessions) so it naturally tracks the player\'s progression without manual input.

  ----------------------------- -------------------------------------------------------------------- ------------------------------------------------------- -------------------------------------------------------
  **FP Source**                 **How It Scales**                                                    **Beginner Example**                                    **Veteran Example**

  **Base Completion**           Flat 100 FP. Same for everyone                                       100 FP                                                  100 FP

  **Volume vs Baseline**        \% above/below personal baseline volume. +20% above = +20 bonus FP   65 lb x 10 x 3 = 1950. Baseline was 1800. +8% = +8 FP   225 lb x 5 x 5 = 5625. Baseline was 5400. +4% = +4 FP

  **Personal Record**           50 FP for any new PR (weight OR reps at a given weight)              First time doing 70 lb = PR. +50 FP                     First time 8 reps at 225 = PR. +50 FP

  **Rep PR (same weight)**      25 FP for beating your rep record at a specific weight               Did 12 reps at 65 (old best: 10) = +25 FP               Did 6 reps at 225 (old best: 5) = +25 FP

  **Streak Multiplier**         Same for all. 1.0x + 0.1x per day, max 2.0x                          3-day streak: 1.3x                                      3-day streak: 1.3x

  **Training Variable Bonus**   15 FP for logging a modifier (tempo, pause, dropset)                 Logged slow eccentric: +15 FP                           Logged 4-sec tempo: +15 FP
  ----------------------------- -------------------------------------------------------------------- ------------------------------------------------------- -------------------------------------------------------

> **KEY INSIGHT:** A beginner going from 65 to 70 lbs on bench press and a veteran going from 225 to 230 are both experiencing the same relative challenge. Both earn the same PR bonus. Both move their baselines up by a similar percentage. The system recognizes effort relative to the individual, not absolute strength.

**B3. Training Variable Modifiers**

One of the smartest things about your observation is that seasoned lifters often need to change variables other than weight. Iron Quest should recognize and reward these training modifications as legitimate effort.

  --------------------------- -------------------------------------------- ------------------------------------------- -----------------------------------------
  **Modifier**                **What It Means**                            **FP Bonus**                                **How to Log**

  **Slow Tempo**              3-4+ second eccentric (lowering phase)       15 FP per exercise where applied            Toggle before exercise. Timer validates

  **Pause Reps**              1-3 second hold at the hardest point         15 FP per exercise                          Toggle before exercise

  **Drop Set**                Reduce weight mid-set, continue reps         20 FP per drop set logged                   Log as special set type

  **Rest-Pause**              Brief rest (10-15s) then continue the set    10 FP per rest-pause set                    Log as special set type

  **Reduced Rest Period**     Intentionally shorter rest than programmed   10 FP if rest is 25%+ shorter than target   Auto-detected by rest timer

  **Single-Limb Variation**   Unilateral version of a bilateral exercise   15 FP per exercise                          Exercise tagged as unilateral
  --------------------------- -------------------------------------------- ------------------------------------------- -----------------------------------------

These modifiers serve a dual purpose: they reward advanced training techniques that don\'t show up in raw weight numbers, and they give plateaued lifters a way to keep earning meaningful FP without needing heavier equipment. A lifter who has maxed out their dumbbells can switch to slow tempo Bulgarian split squats and earn just as much as they did when they were adding weight every week.

**B4. Deload & Recovery Recognition**

Smart training includes planned deload weeks where volume and intensity intentionally decrease. Iron Quest should not punish this. When a player\'s session volume is significantly below their baseline (more than 30% lower), the app should recognize this as a potential deload and offer a \"recovery session\" tag. Tagged recovery sessions earn a flat 80 FP (slightly below the 100 base) with no volume penalty, and they don\'t negatively affect the player\'s rolling baseline. This prevents the baseline from being dragged down by intentional deloads.

> *The app should never force a deload tag. If a player just had a bad day and lifted lighter, they can skip the tag and take the normal (lower) FP calculation. The tag is an opt-in acknowledgment that this was planned.*

**B5. Anti-Gaming Measures**

The relative scaling system needs guardrails to prevent exploitation:

-   **Rep ceiling:** No single set above 50 reps earns volume FP beyond the 50-rep mark. This prevents inflated bodyweight rep counts from dominating

-   **Session floor:** Sessions under 15 minutes earn only 50% base FP. This prevents rapid fake logging

-   **Baseline manipulation:** If a player intentionally sandbagged early sessions to set a low baseline and then performs normally to get huge percentage bonuses, the rolling average self-corrects within 2-3 sessions. Additionally, the maximum volume bonus per session is capped at +50 FP regardless of percentage

-   **Rapid PR detection:** If a player\'s logged weight jumps more than 40% in a single session with no history of that weight, the PR flag is delayed until confirmed in a subsequent session. This catches typos and intentional inflation

**C. Cosmetic Shop & Pet Personalization**

The cosmetic shop is where emotional attachment to the pet gets expressed. It is the answer to the question \"how do I make my pet feel like MINE?\" while keeping all gameplay advantages in the functional stat system.

**C1. Shop Structure**

The shop has three sections: a rotating Featured collection (3-5 items, refreshes weekly), a permanent Catalog organized by category, and a Seasonal Vault that holds prestige and event-exclusive items the player has earned. All items are purchased with FP, the same currency used for functional upgrades. This creates a genuine spending tension: do I invest in my pet\'s battle stats or make it look incredible? That tension is the point. Players who prioritize cosmetics progress slower in the tower but have a more personalized pet. Players who invest purely in stats have a stronger fighter but a more generic-looking creature.

**C2. Price Calibration**

A player earning roughly 150-200 FP per workout session (with streak bonuses) should be able to afford one mid-tier cosmetic every 7-10 workouts while still keeping up with basic stat allocation and feeding. This means cosmetics range from 50 FP (small color accents) to 500 FP (full evolution skins). The most expensive items represent roughly 3-4 weeks of dedicated earning, making them aspirational but achievable.

**C3. Seasonal Exclusives & Earned-Only Items**

Some cosmetics can never be purchased. They can only be earned through prestige milestones, tower achievements, or seasonal events. These function as status symbols and bragging rights. When another player sees a Gold Crown badge with the Season 1 flame trail, they know that player cleared floor 50 in the first quarter. That kind of earned exclusivity drives engagement far more than purchased items.

**D. Impact on PRD v2.0**

The following sections of the v2.0 PRD are affected by these decisions and should be updated:

  -------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------
  **PRD Section**            **Change Required**                                                                                                                                            **Priority**

  **3.2 FP Economy**         Replace absolute volume bonus with relative baseline system. Add training variable modifiers. Add deload recognition                                           Critical. This changes the core earning formula

  **4.1.1 Feeding**          Add auto-feed toggle. Simplify feeding to maintenance action rather than emotional ritual                                                                      Medium. Feeding still exists, just streamlined

  **4.1 Pet Care**           Add cosmetic shop as new spending category alongside stat allocation and training                                                                              Medium. New section needed

  **4.3 Rendering**          Add pet type selection at creation. Three base geometric themes. Type-driven color palettes and shape language                                                 High. Affects the SVG renderer architecture

  **5.1 Tower Structure**    Add type matchups to enemy generation. Add quarterly prestige reset cycle. Add seasonal exclusive rewards                                                      High. Changes tower progression design

  **7.2 Tech Stack**         No changes. Expo + RN SVG + Reanimated stack supports all new features without additions                                                                       None

  **8. Roadmap**             Phase 1 adds: pet type selection, auto-feed, baseline calibration. Phase 2 adds: type matchups, prestige system, cosmetic shop. Phase 4 adds: AI integration   Medium. Scope increases slightly for Phase 1-2

  **New: Vacation System**   Add new subsection under Pet Care for vacation mode, gentle notifications, and absence handling                                                                Low complexity, high impact on retention
  -------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------- -------------------------------------------------

**D1. Revised Effort Estimate Impact**

The resolved decisions add approximately 30-45 hours to the total project scope, distributed as follows:

-   **Pet type system (3 types, selection UI, type-influenced rendering):** +15-20h across Phases 1-2

-   **Relative effort scaling + baseline engine:** +8-12h in Phase 1

-   **Cosmetic shop UI + item system:** +10-15h in Phase 2

-   **Prestige system + seasonal logic:** +5-8h in Phase 2

-   **Vacation mode:** +3-5h in Phase 1

**Updated total estimate: Phase 1 at \~155-205 hours. Phases 1+2 at \~240-320 hours. Full MVP through Phase 3 at \~290-375 hours.**

*End of Addendum \| Iron Quest PRD v2.1*

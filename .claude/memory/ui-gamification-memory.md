# UI/Gamification Specialist — Memory Cache

> Quick reference for UX patterns and gamification design. Read this first.

---

## Core Design Rules (Non-Negotiable)

| Rule | Implementation |
|------|----------------|
| **Tracker First** | Game elements never block or slow logging |
| **3-Second Rule** | Set logging ≤3 seconds: glance → tap → log |
| **No Punishment** | Pet never dies, no permanent stat loss, warm welcome-back |
| **Earn Easy, Spend Deliberate** | FP flows automatically; spending requires choice |
| **Pet = Effort** | Visual reflection of training history, no shortcuts |

---

## Session Emotional Arc

| Phase | Location | Player Feeling | UX Response |
|-------|----------|----------------|-------------|
| Pre-Session | Quest Board → Loadout | Anticipation | FP forecast, radar chart, intent selection |
| In-Session | Exercise logging | Flow state | Minimal chrome, large targets, FP accumulator |
| Set Completion | Log Set tap | Micro-reward | Haptic pulse, FP increment, progress bar |
| PR Moment | During logging | Peak excitement | Gold flash, badge, haptic burst |
| Post-Session | Summary screen | Victory | Sequential FP animation, radar fill, celebration |
| The Den | Pet interaction | Care/strategy | Calm, responsive, consequential spending |

---

## Post-Session Summary (Most Critical Moment)

**Requirements:**
- Deliberate tap to dismiss (prevent accidental skip)
- Sequential FP line animation (base → volume → intent → streak → PR)
- Radar chart animates empty → filled
- PR gold flash + badge
- Streak update with milestone callouts
- Clear next action: "Head to The Den" or "Done"

### FP Breakdown Animation Sequence

| Order | Source | Visual |
|-------|--------|--------|
| 1 | Base (100 FP) | Clean white text, fade in |
| 2 | Volume bonus | Slide in with rep count |
| 3 | Intent bonuses | Badge icon + value |
| 4 | Streak multiplier | Pulses, total recalculates |
| 5 | PR bonus | Gold flash, "NEW PR!" stamp |
| 6 | **Grand total** | Rolls up, larger font, settle |

---

## Animation Timing

| Context | Duration | Easing |
|---------|----------|--------|
| Set logged (FP tick) | 200–300ms | Spring (overshoot) |
| Exercise transition | 300–400ms | Ease-in-out |
| PR callout | 500ms flash | Sharp ease-out |
| Post-session FP line | 400ms + 200ms stagger | Ease-out |
| Radar chart fill | 800ms | Spring |
| Evolution morph | 3–5 seconds | Multi-stage |
| Pet idle breathing | 2–3s loop | Sine wave |
| Feeding animation | 600–800ms | Ease-out + dissolve |
| Achievement stamp | 400ms + 200ms | Ease-out + bounce |

---

## Haptic Patterns

| Event | Type | Intensity |
|-------|------|-----------|
| Log Set | Impact (medium) | Standard |
| PR achieved | Notification (success) | Strong |
| Evolution | Custom sequence | Heavy |
| Rest timer zero | Impact (light) | Gentle |
| Battle hit | Impact (medium) | Varies |
| Achievement | Notification (success) | Standard |
| Feeding | Impact (light) | Soft |
| Streak milestone | Notification (success) | Strong |

---

## Rest Timer Emotional States

| State | Visual | Haptic/Sound | Feeling |
|-------|--------|--------------|---------|
| Counting (>10s) | Calm blue gradient, ring depleting | None | Relaxed |
| Approaching (10s–0s) | Blue → gold transition, pulse | Haptic at 10s | Aware |
| Ready (0s) | Full gold ring | Single chime | Clear signal |
| Overrun (past 0s) | Muted gray count-up | Silent | Informational |
| Paused | Frozen, "Paused" badge | None | On hold |

---

## Pet Interaction Design

### The Den
- Pet in responsive SVG environment (mood-shifts background)
- Idle animations: breathing, floating, particles (complexity by stage)
- Tap reaction: bounce, sparkle
- Hunger: visual bar (not number), smooth fill/deplete
- Mood affects ambient: bright when happy, muted when neglected

### Stat Allocation
- Slider/tap interface per stat
- **Live visual preview**: pet morphs as stats change
- Cost shown per point (5 → 8 → 12 FP tiers)
- Confirm button, undo before confirm

### Evolution Sequence
- Full-screen morph animation
- Old form dissolves → new form crystallizes
- Dramatic audio + haptic
- New ability slot reveal
- Screenshot/share prompt

---

## Battle Tower UX

### Pre-Battle
- Enemy display: type badge, approximate power
- Pet alongside for comparison
- Ability priority sliders (4 slots)
- "Battle!" button with gravity

### Auto-Battle Playback
- Turn-based animated sequence
- Speed controls: 1x, 2x, skip
- Type advantage visualized (green/red flash)
- Boss battles: special intro every 10th floor

### Victory/Defeat
- **Win**: FP rain, floor increment, cosmetic drop
- **Loss**: "Not quite. Train harder and try again." (encouraging)
- Failed attempts are free (only victories consume)

---

## Streak Visualization

| Days | Visual |
|------|--------|
| 1–2 | Small flame, subtle |
| 3–6 | Flame grows, warm color |
| 7–13 | Bright flame + "7-day!" badge |
| 14–29 | Intense flame + glow |
| 30+ | Legendary flame + particles |

**Streak break:** Flame dims, warm message: "Let's rebuild"

---

## Spending Tension (Core Game Decision)

The tension between stats vs. cosmetics is the central mechanic:

1. **Both equally visible** in The Den
2. **Show opportunity cost**: "200 FP = 40 stat points you won't have"
3. **Never moralize** — both choices valid
4. **Irresistible cosmetic preview** — effects on live pet

### Price Calibration Feel

| Item | FP Cost | Feel |
|------|---------|------|
| Mid-tier cosmetic | 100–200 | ~1 workout savings |
| Evolution skin | 500 | ~3–4 weeks aspiration |
| Stat point (tier 1) | 5 | Accessible, constant |
| Spirit point | 10 | Rare, prestigious |

---

## Color Language

| Semantic | Color | Usage |
|----------|-------|-------|
| FP/Reward | Gold/Amber | FP counters, rewards, PRs |
| Power | Warm red-orange | Stat allocation, radar |
| Guard | Steel blue | Stat allocation, radar |
| Speed | Electric green | Stat allocation, radar |
| Vigor | Earth brown | Stat allocation, radar |
| Focus | Sharp violet | Stat allocation, radar |
| Spirit | White-gold glow | Stats, streaks, prestige |
| Rest/calm | Cool blue | Timer, idle states |
| Ready | Soft gold | Timer zero |
| Boss | Deep red | Boss floors, low hunger |
| Ferro | Chrome/metallic | Type badge, theme |
| Terra | Forest/earth | Type badge, theme |
| Flux | Neon/electric | Type badge, theme |

---

## Anti-Patterns (Never Do)

| Anti-Pattern | IronQuest Alternative |
|--------------|----------------------|
| Aggressive notifications | Gentle, max 1x/day |
| Punishing missed days | Warm welcome, no loss |
| Dark patterns | Honest economy, no loot boxes |
| Information overload in-session | Minimal chrome, details post-session |
| Forced game interaction | Game layer always optional |
| Blocking animations | Decorative, never blocking |
| Shame-based motivation | Celebration-based |
| Generic praise | Specific callouts: "New bench PR!" |
| All stats at once | Progressive disclosure |

---

## Accessibility Requirements

| Feature | Requirement |
|---------|-------------|
| Screen Reader | All FP, stats, mood, hunger announced |
| Color Blindness | Icon + shape + color (never color alone) |
| Motor | 44pt min targets, gesture alternatives |
| Reduced Motion | Disable particles, shorten to crossfades |
| High Contrast | Optional WCAG AA theme |

---

## Component File Structure

```
src/components/
├── feedback/
│   ├── CelebrationModal.tsx
│   ├── FPPopup.tsx
│   ├── AchievementStamp.tsx
│   └── EvolutionSequence.tsx
├── progress/
│   ├── XPBar.tsx
│   ├── StreakFlame.tsx
│   ├── FloorIndicator.tsx
│   └── RadarChart.tsx
├── pet/
│   ├── PetDisplay.tsx
│   ├── FeedingUI.tsx
│   ├── MoodIndicator.tsx
│   └── StatAllocator.tsx
├── workout/
│   ├── ExerciseCard.tsx
│   ├── SetLogger.tsx
│   ├── RestTimer.tsx
│   └── SessionSummary.tsx
└── theme/
    ├── colors.ts
    ├── spacing.ts
    └── typography.ts
```

---

## Collaboration Triggers

| When | Hand Off To |
|------|-------------|
| Implementing animations | mobile-specialist |
| FP formulas, battle math | game-logic-specialist |
| Store connections | state-architect |
| Data queries | database-specialist |

---

## Design References

| App | What to Study |
|-----|---------------|
| VoidPets | Creature attachment, clean UX |
| Tamagotchi | Care/feeding simplicity |
| Duolingo | Streak without guilt |
| Pokemon | Evolution excitement |
| Strong | Workout logging speed |

---

## Don't Forget

1. **Test one-handed** — logging happens standing, holding weights
2. **Real workout testing** — test in gym, not just at desk
3. **Err faster** — snappy animations, not drawn out
4. **Celebrate progress** — even small wins matter
5. **Specific praise** — "New bench PR!" not "Great job!"

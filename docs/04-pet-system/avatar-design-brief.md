# Avatar Design Brief — Making a Pet Worth Caring About

> **Status:** Living doc, co-authored. Phase 2 item 9 (avatar identity pass).
> **Maturity legend:** ✅ AFFIRMED (Adrian confirmed) · 🟡 DRAFT (my hypothesis, react to it) · 🔴 OPEN (needs Adrian's input)
> **Origin:** Born from the 2026-07-04 design deep-dive. Supersedes the procedural-only framing of Phase 1; operationalizes ADR-0006 (hybrid rendering).
> **Rev 2:** 2026-07-04 — Adrian answered §11 questions; sections 2/3/4/6/7/10 updated; new questions raised (see §11).

---

## 0. How to use this doc

This is the source of truth for the pet's **art direction and emotional intent**. Visual choices (silhouette, color, face, motion) get evaluated against the principles here — not against "looks cool." If a proposed visual serves Sections 3-5, it's in. If it doesn't, it's out, no matter how polished.

Sections graduate from 🟡/🔴 to ✅ as they stabilize. ✅ sections become hard constraints on Higgsfield prompts and overlay code.

---

## 1. Why this is the make-or-break decision

The 2026-07 audit put it plainly: *"the result reads as clipart, not creature."* Phase 1's procedural renderer works technically but failed the art-direction bar — exactly the risk the docs' own register predicted. **IronQuest's defensibility depends on the pet earning attachment.** A tracker with a clipart pet is just Strong/Hevy with a coat of paint, and lifters won't switch.

The market research is clear on the niche: no shipping app makes a creature whose *body* is a function of your training. The wedge is open. Capturing it requires a pet that's (a) worth caring about and (b) visibly yours. This brief is about (a); item 12 (typed-FP recalibration, PR #43) is about (b).

---

## 2. Target user — ✅ AFFIRMED

**Both** the 4–6 day/week intermediate *and* the newer lifter who needs motivation to build consistency.

This dual persona shapes the emotional register:
- **Newer lifter:** the pet must motivate early consistency. Stage 1 can't read as "you have nothing" — it must read as *"you started, and this is the beginning of something."* The first 2–3 weeks (habit formation window) need celebration density, not austerity.
- **Intermediate:** the pet makes meticulously-tracked data emotionally legible. Their spreadsheet finally *feels* like something. Pride in accumulated work.

The pet serves both by being a **mirror with a growth arc** — early encouragement curving into mature pride. The same creature reads differently as it accumulates.

---

## 3. Emotional goal — ✅ AFFIRMED

**Pride and recognition** — *"I built this. I earned this. This is a reflection of me."* The pet is a mirror reflecting accumulated effort back, made visible.

Refined by the dual persona (§2): for newer lifters, the pride is *forward-looking* ("I'm becoming someone who trains"); for intermediates, it's *backward-looking* ("I've built this over time"). The pet serves both by making the arc visible at every stage.

This is why "fun/cute" is the wrong axis — it's the casual-gamification register (Wokamon, GymPet, Habitica pets) and infantilizes. Pride is heavier and survives the 6-month novelty cliff.

---

## 4. The "not a chore" principle — ✅ AFFIRMED (hardened)

> *"I don't want it to feel like a considerable chore — like I'm managing myself AND my avatar. But I want it to feel rewarding."* — Adrian, 2026-07-04

**Hard constraint**, equal weight to "No Punishment for Absence." Hardened in Rev 2: **hunger/mood/feeding are dropped from v1 entirely.** The pet's state changes **only from workouts** (passive progression via the FP engine). No survival mechanics, no decay, no feeding obligation.

| Chore pattern (reject) | Rewarding pattern (keep) |
|---|---|
| Pet decays / looks pathetic if you don't log in | Pet reflects what you've *done*, never what you *owe* |
| Feeding / hunger / mood maintenance | **Dropped from v1 — pet changes only from workouts** |
| Guilt-tripping copy ("your pet missed you") | Honest mirror with no judgment tone |
| Penalty for absence | Vacation mode unnecessary (no decay to freeze) |

**Implication for the visual:** the pet never looks needy, starving, or pleading. Its resting state is *earned composure*. There's no "hungry" or "sad" visual state to design around — only growth states.

**Scope impact:** ticket #41 (pet-care depth) is gutted by this decision. Mood, food tiers, auto-feed, and vacation mode are all out. Only "tap reaction" survives from #41's original scope — and that may roll into #40 (celebration). See §11.

---

## 5. Psychological levers 🟡

Three mechanisms, in priority order:

1. **The IKEA effect** (primary) — we overvalue what we help build. Every workout *builds* the pet. The pet must feel *constructed by effort*, not gifted. Stat-driven visual changes must survive in overlay form (tier swap, tint, growth, **gear**).

2. **Endowment / ownership** — we overvalue things once they're "ours." The pet must feel *unique to me*. Typed-FP calibration (#39/#43) is the engine: if every pet converges, ownership breaks.

3. **Mirror / identity** — we bond with representations of self. Heavy leg days → visibly leg-developed creature. The mirroring makes data self-relevant in a way no chart achieves.

**Refused:** the Tamagotchi/Neopets guilt-and-decay loop. Incompatible with §4.

---

## 6. Reference triangulation — ✅ AFFIRMED

Adrian's anchors: **Pokémon, World of Warcraft gear acquisition, Undertale.** The through-line is **progression worn visibly on the character** — effort made into a body.

| Reference | What we steal | How it shows up in IronQuest |
|---|---|---|
| **World of Warcraft (gear)** | Progression is *worn*. Each piece of gear is a visible achievement on the character. | **Overlays = gear slots.** Each training achievement (PR, streak milestone, stat threshold) adds/changes a visible element on the pet — aura, marking, accessory, weapon-equivalent. This is richer than "tint the sprite" — it's a readable résumé. |
| **Pokémon** | Evolution as a beloved, earned milestone. Type system. Gender-neutral creature archetypes (Pikachu, Lucario — none heavily coded). | Macro progression = evolution (Stage 1→4). Type triangle (Ferro/Flux/Terra). **Gender-neutral by default** (see §10) — avoid heavy gender coding. |
| **Undertale** | Deep personality via minimal geometry — face + timing + writing, not detail. | The face is the leverage (audit §5.2). A few shapes, animated well, beat a detailed static illustration. |

**The synthesis:** the pet is a character whose **macro** progression is Pokémon-style evolution (stage swaps) and whose **micro** progression is WoW-gear-style accumulation (visible achievement layers between evolutions). Both encode effort. Both are readable.

---

## 7. Evolution arc — ✅ AFFIRMED

> *"Why not both? It is a reflection of me in a sense, but we want it to be formidable when we scale the battle tower. People should not be able to evolve quickly. It has to be earned considerably."* — Adrian, 2026-07-04

**Both identity AND formidable.** The pet is a self-portrait *and* a battle-ready creature. These aren't in tension — your specific training produces a specific creature that is formidable *in its own way* (a leg-day beast is formidable differently than a bench-press monster).

**Evolution must be earned slowly.** Current thresholds (500/2000/5000 FP) may be too fast — at ~100 FP/workout, Stage 2 hits in ~5 workouts (~1 week). That's not "earned considerably." **🔴 Open: raise thresholds?** (see §11, Q3).

Stages tell a hybrid story (identity + formidability):
- **Stage 1 — Shard:** nascent, promising. Reads to a newer lifter as "this is the beginning of something," not "you have nothing."
- **Stage 2 — Form:** defined. Type + build become legible. "Your training is shaping this."
- **Stage 3 — Prime:** visibly formidable. Stats maxed in places; looks like it could hold its own. Pride of construction.
- **Stage 4 — Apex:** unmistakably *yours* and unmistakably powerful. A creature only your specific training history could produce — and one ready for the Tower.

**Forward constraint:** the avatar art must support the battle-tower use case (Phase 3). Silhouettes need readable strength/power, not just expression. The pet has to look like it could fight.

---

## 8. Visual principles 🟡 (downstream of 3–7)

Each principle traces to a settled section. Rev 2 additions in bold.

- **Silhouette before detail.** Recognition from silhouette; personalization from deformation. One base body per type, deformed by stats + worn gear.
- **Face is the leverage.** ~90% of geometric-character charm is eyes + timing. The face conveys *earned composure* — confident, not pleading. Never "sad puppy eyes."
- **Color = stat language.** `colors.stats.*` carried onto the pet so radar, stat rows, and creature speak one language.
- **Stat changes are legible at the moment of spend.** Survives via overlays (ADR-0006).
- **No pathetic resting state.** Default expression is composed (§4).
- **Overlays = gear slots (NEW, from §6).** Each achievement adds a visible element (aura ring, marking notch, accessory, weapon-equivalent). The pet accumulates "gear" the way a WoW character does — readable as a training résumé.
- **Gender-neutral by default (NEW, from §10).** No heavy gender coding in the base art. Proportions, features, and expressions stay neutral. Personalization (if ever) is a future feature, not v1.
- **Motion is mandatory (NEW, from §10).** No static pets. Breathing, idle micro-motion, tap reactions, achievement bursts — all required. A static sprite is a sticker, not a creature.
- **Training résumé markings.** Subtle accumulation marks for streaks/milestones (audit §5.4) — one per week of ≥3 workouts, glow intensity from current streak.

---

## 9. The glance test 🟡

The UX spec's promise: *a training partner can glance at your pet and read "high-volume leg-day consistency freak."*

| Signal | What it conveys |
|---|---|
| Silhouette proportions | Which body region is developed |
| Color distribution | Which stats dominate (warm = power, cool = speed/control) |
| **Gear / markings** | Specific achievements (PR count, streak weeks, milestones) |
| Size / evolution stage | Total accumulated effort |
| Type (Ferro/Flux/Terra) | Training *character* — explosive vs endurance vs control |

The pet must be a readable training résumé at a 2-second glance. Every visual decision auditable against: *"can someone read this off the pet quickly?"*

---

## 10. Anti-patterns — ✅ AFFIRMED

What we explicitly refuse. Rev 2 additions in bold.

- **Generic AI mascot** — the smoke-test result. Warm starburst with dot eyes, indistinguishable from any icon pack.
- **Needy / pleading expression** — Tamagotchi guilt-bait. Violates §4.
- **Gender-coded by the system (NEW)** — a user's workout split must not generate a pet that reads as feminine (or masculine) in a way that alienates them. **The user cannot be at the whim of the system's design here.** Default to gender-neutral; if personalization is wanted later, it's a user *choice*, not a system output.
- **Too juvenile** — risks infantilizing the "serious lifter" pride.
- **Too dark/edgy** — pride isn't grimness.
- **Realism** — stylized/geometric is the lane, not photoreal.
- **Static (NEW, emphasized)** — a pet without animation is a sticker. Motion is mandatory.
- **Identical across users** — breaks mirror/ownership levers.

---

## 11. Open questions (Rev 2)

Graduated to ✅ in Rev 2: persona (§2), hunger/mood dropped (§4), references (§6), evolution arc (§7), anti-patterns (§10).

**New questions raised by those answers:**

1. **Gear slot taxonomy (from §6/§8):** what are the visible "gear" layers? Candidates: aura ring (Spirit/streak), shoulder spikes (Power), chest plate (Guard), leg streamlines (Speed), forearm bands (Focus), core gem (Vigor). Need to define the slots before designing them.

2. **Gender-neutral design constraints (from §10):** what specific art-direction rules keep the base neutral? Avoid: pronounced curves/waists, eyelash detail, certain proportions. Lean on: geometric strength, abstract creature forms (Pokémon-style). Worth pinning down concretely before Higgsfield prompts.

3. **Evolution thresholds (from §7):** are 500/2000/5000 FP too fast for "earned considerably"? At ~100 FP/workout, Stage 2 = ~1 week. Should we raise 5–10×? This is a game-economy decision that affects feel. Connects to `src/config/fp-values.ts`.

4. **Ticket #41 disposition (from §4):** mood/food/vacation all dropped. Options: (a) close #41, roll "tap reaction" into #40 (celebration); (b) repurpose #41 to "personalization v0" — a basic character-customization path addressing §10's gender-sensitivity concern (let user pick aesthetic traits within type constraints). (b) is more ambitious but directly addresses a real user concern.

5. **Newer-lifter Stage 1 tone (from §2):** how does the Stage 1 pet read to someone who's never lifted? Needs to feel promising, not pathetic or empty. Affects the Stage 1 illustration prompt specifically.

---

## 12. What this doc governs downstream

Once sections stabilize, they constrain:
- **Higgsfield prompts** for the 12 base illustrations (ADR-0006) — vibe language comes from §3/§6/§8
- **Overlay system** (procedural, on top of base sprites) — gear slots come from §6/§8/§9
- **Pet-care ticket (#41) scope** — §4 gutted it; §11 Q4 decides disposition
- **Celebration layer (#40) animation vocabulary** — face/eye + achievement-burst reactions come from §8
- **FP economy** — §7/§11 Q3 may raise evolution thresholds

No Higgsfield generation until §8 (visual principles incl. gear + gender-neutral + motion) is pinned to concrete rules. Prompts without intent produce clipart (the smoke test proved this).

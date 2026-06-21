# Battle Tower

> Sources: PRD v2.0 §5 · Addendum v2.1 §A2

---

## Overview

The Battle Tower is **optional but recommended**. It's the competitive endgame where pet investment pays off. Answers: *how strong am I actually getting?*

---

## Tower Structure

Endless series of floors with scaling difficulty. Every 10th floor = Boss.

| Floors | Tier | Enemies | Unlocks |
|--------|------|---------|---------|
| 1–10 | Bronze | Basic shapes, single-type, predictable | Tutorial tier. Shard-stage pets can clear |
| 11–25 | Silver | Dual-type, status effects introduced | Rare Treats unlocked at floor 25. Requires Form |
| 26–50 | Gold | Multi-shape composites, healing, paired fights | Cosmetic rewards. Requires Prime |
| 51–100 | Platinum | Fractal enemies, adaptive scaling, boss rush | Prestige title. Requires Apex |

---

## Battle Mechanics

Battles are **auto-resolved with pre-battle player input**:

1. Player sees enemy's **type** and **approximate power level**
2. Assigns **priority weights** to pet's four abilities (e.g., 40% offense, 30% defense, 20% speed, 10% special)
3. Battle plays out as **animated turn-based sequence**

> Deliberate design: auto-battle with strategic pre-configuration keeps the game meaningful without requiring mastery of a combat system.

---

## Tower Attempts

- Each completed **real workout** grants **1 tower attempt**
- Attempts stack up to **maximum 7**
- **Failed attempts are NOT consumed** — player simply doesn't advance
- Zero penalty for trying a floor you're not ready for

---

## Tower Rewards

| Source | Rewards |
|--------|---------|
| **Floor clears** | Bonus FP, cosmetic items (color overlays, particles, accessories), achievement badges |
| **Boss floors** | Significantly more FP + exclusive cosmetics |

Rewards feed back into the pet care loop: more FP → more feeding/stats → higher floors → more rewards.

---

## Prestige System (Decision A2)

### Quarterly Resets

- Tower floor progress resets **every 3 months**
- **Pet stats, evolution stage, and cosmetics are NEVER reset**
- Creates fresh challenge each season, prevents late-game stagnation

### Prestige Badges

| Tier | Requirement | Badge | Permanent Reward | Seasonal Exclusive |
|------|------------|-------|-----------------|-------------------|
| **Prestige I** | Clear floor 10 | Bronze Star | +2% base FP | Bronze pet aura |
| **Prestige II** | Clear floor 25 | Silver Shield | +5% base FP | Silver trail effect |
| **Prestige III** | Clear floor 50 | Gold Crown | +8% base FP + auto-feed free | Gold evolution skin |
| **Prestige IV** | Clear floor 75 | Platinum Emblem | +12% base FP + unique ability | Platinum particle set |
| **Prestige V** | Clear floor 100 | Diamond Crest | +15% base FP + title | Legendary cosmetic set |

### Key Details

- Prestige badges are **permanent and visible** on profile
- FP bonuses **stack across seasons** (e.g., Prestige III in two seasons = +16% base FP permanently)
- Seasonal cosmetics are **exclusive** — can never be obtained again
- Veteran advantage is **moderate, not overwhelming**

---

## Battle Implementation Formulas

> Phase 2 implementation reference. Documented here for forward planning; do not implement until Phase 2.

### Damage Calculation

```typescript
function calculateDamage(
  attacker: Pet,
  defender: Pet,
  typeMultiplier: number
): number {
  const baseDamage = attacker.stats.power * typeMultiplier;
  const defense = defender.stats.guard * getDefenseMultiplier(attacker, defender);
  return Math.max(1, Math.floor(baseDamage - defense));
}
```

### Turn Order (Speed-based)

```typescript
function determineTurnOrder(player: Pet, enemy: Pet): 'player' | 'enemy' {
  return player.stats.speed >= enemy.stats.speed ? 'player' : 'enemy';
}
```

### Critical Hit Chance (Focus-based)

```typescript
function getCritChance(focus: number): number {
  // Base 5% + 0.5% per focus point
  return 0.05 + (focus * 0.005);
}
```

### Accuracy (Focus-based)

```typescript
function getAccuracy(focus: number): number {
  // Base 95% + 0.2% per focus point
  return 0.95 + (focus * 0.002);
}
```

### Max HP (Vigor-based)

```typescript
function getMaxHP(vigor: number): number {
  // Base 100 + 10 per vigor point
  return 100 + (vigor * 10);
}
```

### Enemy Scaling by Floor Tier

| Floors | Enemy Power vs Player | Tier |
|--------|----------------------|------|
| 1–10 | 50–70% | Tutorial |
| 11–30 | 70–90% | Normal |
| 31–50 | 90–110% | Challenge |
| 51+ | 110%+ | Endless |

### Boss Floors (Every 10th)

- Special enemy with ability
- Stats at 120% of normal floor baseline
- Bonus rewards on victory

### Type Triangle (Recap)

```
Ferro → Flux → Terra → Ferro (cyclic)
advantage: 1.3x damage dealt, 0.8x taken
disadvantage: 0.8x damage dealt, 1.3x taken
neutral: 1.0x both ways
```

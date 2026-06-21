# Pet Evolution & Geometric Rendering

> Sources: PRD v2.0 §§4.2, 4.3

---

## Evolution Stages

Pets evolve through **four permanent stages**, triggered by accumulating Evolution XP (EvoXP).

| Stage | Name | EvoXP Needed | Visual Description | Real-World Timeline |
|-------|------|-------------|-------------------|-------------------|
| 1 | **Shard** | 0 (start) | Simple 3–4 sided polygon, single color, gentle float | Day 1 |
| 2 | **Form** | 500 EvoXP | 6–8 sided shape, gradient fills, orbiting particles | ~2–3 weeks |
| 3 | **Prime** | 2,000 EvoXP | Multi-shape composite, inner glow, animated edges | ~6–8 weeks |
| 4 | **Apex** | 5,000 EvoXP | Fractal-like recursion, dynamic color shifts, particle field | ~16–20 weeks |

### Evolution Details
- **Permanent** — never reverts
- Celebrated with **full-screen morph animation**
- Each stage unlocks a **new ability slot** for battle
- Visual transformation is the primary reward; mechanical upgrade adds tower impact

### EvoXP Sources
| Source | EvoXP Amount |
|--------|-------------|
| Pet training sessions (The Den) | Primary source |
| Rare Treats | Bonus EvoXP |
| Stat allocation | Small amounts |
| Feeding | Small amounts |

> **Trade-off:** Direct stat allocation is more FP-efficient for battle stats, but pet training is the primary way to earn EvoXP.

---

## Geometric Rendering Pipeline

```
Pet Stat Array + Visual Seed → SVG Parameterization → Unique Creature
```

### Technology
- Built with **React Native SVG**
- Animated via **React Native Reanimated**
- **React Native Skia** reserved for Apex-stage particles/fractals (Phase 2+)
- **Rive** for evolution sequences and battle celebrations (Phase 3+)

### How Stats Shape Geometry

| Stat Emphasis | Geometric Result | Color Influence |
|--------------|-----------------|----------------|
| High **Power** | Angular, aggressive forms | Warm colors |
| High **Guard** | Rounded, layered shells | Cool tones |
| High **Speed** | Elongated, motion-suggesting asymmetry | — |
| High **Vigor** | Symmetrical, stable base | — |
| High **Focus** | Sharp points, eye details | — |
| High **Spirit** | Glow intensity, particle density | — |

### Visual Seed
- Derived from **creation timestamp**
- Adds randomness so identically-statted pets have visual personality differences
- Ensures no two pets look exactly alike

### Complexity by Evolution Stage

| Stage | Shape Count | Visual Features |
|-------|-----------|----------------|
| Shard | 3–4 basic polygons | Single color, simple form |
| Form | 6–8 shapes | Gradient fills, orbiting particles |
| Prime | Multi-shape composites | Inner details, stat-influenced morphology |
| Apex | Recursive patterns | Approaching fractal complexity, dynamic |

### Morph Animation
- Uses **interpolated SVG path transitions**
- Animated via Reanimated for smooth, satisfying evolution sequences

---

## EvoXP Earning Formula

```typescript
function calculateEvoXP(session: WorkoutSession): number {
  // Base: 10 EvoXP per workout
  // Bonus: 1 EvoXP per 50 FP earned
  return 10 + Math.floor(session.totalFP / 50);
}
```

### Ability Slots by Evolution Stage

| Stage | Ability Slots |
|-------|---------------|
| 1 (Shard) | 1 |
| 2 (Form) | 2 |
| 3 (Prime) | 3 |
| 4 (Apex) | 4 |

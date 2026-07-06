// =============================================================================
// Template Typed-FP Distribution Regression Tests (issue #39 / audit C5)
// =============================================================================
// Audit finding C5: every built-in template's radar converged on a Focus-heavy
// shape (Focus 32–40%, Power 11–15%) because compound exercises split their FP
// equally across type arrays (e.g. bench = ['power','focus'] → 50/50), leaking
// the secondary type into every push/pull movement. Pets therefore all looked
// the same — neutering the "your pet reflects your split" differentiator.
//
// These tests pin the fix:
//   1. No single FP type dominates any built-in template (≤ ~35%).
//   2. Spirit is never produced by an exercise or a template (streak-only).
//   3. Each exercise's weighted fpDistribution is well-formed (sums to 1.0,
//      compounds have a primary mover ≥ 0.7, isolations are single-type).
//   4. Templates produce visibly DIFFERENT radar shapes — no two identical.
// =============================================================================

import { describe, expect, it } from '@jest/globals';

import { EXERCISE_DATABASE } from '@/data/exercises';
import { WORKOUT_TEMPLATES } from '@/data/templates';
import type { StatType } from '@/types';

// "~35%" per the issue. Rounded percentages can push a true 35.x up by 1, and
// small templates (2-day Minimalist) have fewer samples so they round more
// coarsely. 36 gives one point of rounding grace without weakening the bar —
// the old Focus skew was 32–40%, so anything ≤ 36 is a clear, visible fix.
const MAX_TYPE_PERCENT = 36;

const PHYSICAL_TYPES: StatType[] = ['power', 'guard', 'speed', 'vigor', 'focus'];

describe('exercise fpDistribution data integrity (issue #39)', () => {
  it('every exercise has a non-empty fpDistribution', () => {
    for (const ex of EXERCISE_DATABASE) {
      const entries = Object.entries(ex.fpDistribution).filter(([, v]) => (v ?? 0) > 0);
      expect(entries.length).toBeGreaterThan(0);
    }
  });

  it('no exercise emits Spirit (Spirit is streak-only)', () => {
    for (const ex of EXERCISE_DATABASE) {
      expect(ex.fpDistribution.spirit ?? 0).toBe(0);
    }
  });

  it('each fpDistribution sums to ~1.0', () => {
    for (const ex of EXERCISE_DATABASE) {
      const sum = PHYSICAL_TYPES.reduce((acc, t) => acc + (ex.fpDistribution[t] ?? 0), 0);
      expect(sum).toBeGreaterThan(0.99);
      expect(sum).toBeLessThan(1.01);
    }
  });

  it('compound exercises have a primary mover ≥ 0.7', () => {
    const compounds = EXERCISE_DATABASE.filter((e) => e.isCompound);
    expect(compounds.length).toBeGreaterThan(0);
    for (const ex of compounds) {
      const max = Math.max(...PHYSICAL_TYPES.map((t) => ex.fpDistribution[t] ?? 0));
      expect(max).toBeGreaterThanOrEqual(0.7);
    }
  });

  it('isolation exercises are single-type (one type at 1.0)', () => {
    const isolations = EXERCISE_DATABASE.filter((e) => !e.isCompound);
    expect(isolations.length).toBeGreaterThan(0);
    for (const ex of isolations) {
      const nonzero = PHYSICAL_TYPES.filter((t) => (ex.fpDistribution[t] ?? 0) > 0);
      expect(nonzero).toHaveLength(1);
      expect(ex.fpDistribution[nonzero[0]]).toBe(1.0);
    }
  });
});

describe('built-in template FP distribution calibration (audit C5)', () => {
  it('Spirit is 0 across every template, day, and exercise', () => {
    for (const template of WORKOUT_TEMPLATES) {
      expect(template.totalFpDistribution.spirit).toBe(0);
      for (const day of template.days) {
        expect(day.fpDistribution.spirit).toBe(0);
      }
    }
  });

  it('no single FP type exceeds ~35% in any built-in template', () => {
    const violations: string[] = [];
    for (const template of WORKOUT_TEMPLATES) {
      for (const type of PHYSICAL_TYPES) {
        const pct = template.totalFpDistribution[type];
        if (pct > MAX_TYPE_PERCENT) {
          violations.push(`${template.name}: ${type} at ${pct}% (cap ${MAX_TYPE_PERCENT}%)`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('each template total distribution rounds to 100% across the five physical types', () => {
    for (const template of WORKOUT_TEMPLATES) {
      const sum = PHYSICAL_TYPES.reduce((acc, t) => acc + template.totalFpDistribution[t], 0);
      // Rounding can drift by ±2 across five rounded values.
      expect(sum).toBeGreaterThanOrEqual(99);
      expect(sum).toBeLessThanOrEqual(101);
    }
  });

  it('every template day distribution rounds to ~100% across the five physical types', () => {
    for (const template of WORKOUT_TEMPLATES) {
      for (const day of template.days) {
        const sum = PHYSICAL_TYPES.reduce((acc, t) => acc + day.fpDistribution[t], 0);
        expect(sum).toBeGreaterThanOrEqual(99);
        expect(sum).toBeLessThanOrEqual(101);
      }
    }
  });

  it('no two built-in templates share an identical radar shape', () => {
    // Two templates with the same 5-type distribution would render the same
    // radar polygon — the C5 convergence bug. This guards against regression.
    const shapes = WORKOUT_TEMPLATES.map((t) => ({
      name: t.name,
      signature: PHYSICAL_TYPES.map((type) => t.totalFpDistribution[type]).join(','),
    }));

    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        expect({
          a: shapes[i].name,
          b: shapes[j].name,
          same: shapes[i].signature === shapes[j].signature,
        }).toEqual({ a: shapes[i].name, b: shapes[j].name, same: false });
      }
    }
  });

  it('templates cover meaningfully different emphasis (not allFocus-heavy)', () => {
    // The C5 symptom: Focus was the top type for every template. After the fix,
    // at least two different types should appear as the #1 type across the set,
    // proving the radars diverge in more than just magnitude.
    const topTypes = WORKOUT_TEMPLATES.map((t) => {
      const sorted = [...PHYSICAL_TYPES].sort(
        (a, b) => t.totalFpDistribution[b] - t.totalFpDistribution[a]
      );
      return sorted[0];
    });
    const uniqueTops = new Set(topTypes).size;
    expect(uniqueTops).toBeGreaterThanOrEqual(2);
  });
});

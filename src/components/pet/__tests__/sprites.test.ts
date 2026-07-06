// =============================================================================
// Sprite registry integrity (ADR-0006)
// =============================================================================
// A type either has a COMPLETE stage column (all 4) or none — a partial column
// would flip a pet between sprite and procedural rendering mid-progression,
// which is exactly the identity break the hybrid model exists to prevent.

import { describe, expect, it } from '@jest/globals';

import type { PetType } from '@/types';
import { getSprite, hasSpriteSet } from '../sprites';

const ALL_TYPES: PetType[] = ['ferro', 'flux', 'terra'];
const ALL_STAGES = [1, 2, 3, 4] as const;

describe('pet sprite registry', () => {
  it('flux has a complete sprite column (affirmed 2026-07-06, ADR-0009)', () => {
    expect(hasSpriteSet('flux')).toBe(true);
    for (const stage of ALL_STAGES) {
      expect(getSprite('flux', stage)).toBeDefined();
    }
  });

  it('every registered type has all 4 stages — no partial columns', () => {
    for (const type of ALL_TYPES) {
      if (!hasSpriteSet(type)) continue;
      for (const stage of ALL_STAGES) {
        expect(getSprite(type, stage)).toBeDefined();
      }
    }
  });

  it('unregistered types return undefined so PetAvatar falls back to procedural', () => {
    for (const type of ALL_TYPES.filter((t) => !hasSpriteSet(t))) {
      for (const stage of ALL_STAGES) {
        expect(getSprite(type, stage)).toBeUndefined();
      }
    }
  });
});

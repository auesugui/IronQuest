// =============================================================================
// IronQuest Pet Sprite Registry (ADR-0006 hybrid rendering)
// =============================================================================
// Base art = AI-generated illustrations (Higgsfield, prompts governed by
// docs/04-pet-system/avatar-design-brief.md §8). One entry per type × stage.
// Types absent from this registry fall back to the procedural renderer —
// PetAvatar dispatches on `getSprite()`, so wiring a new type in is just
// adding its four require() lines once the art column is affirmed.

import type { ImageSourcePropType } from 'react-native';

import type { PetType } from '@/types';

export type SpriteStage = 1 | 2 | 3 | 4;

const PET_SPRITES: Partial<Record<PetType, Record<SpriteStage, ImageSourcePropType>>> = {
  // Flux column affirmed 2026-07-06 (ADR-0009, brief §8.3): v4 anchor + stage
  // derivations. Ferro/Terra columns are pending their own posture language
  // (brief §8.2 is Flux-specific) and render procedurally until generated.
  flux: {
    1: require('../../../assets/pets/flux/stage1.png'),
    2: require('../../../assets/pets/flux/stage2.png'),
    3: require('../../../assets/pets/flux/stage3.png'),
    4: require('../../../assets/pets/flux/stage4.png'),
  },
};

export function getSprite(type: PetType, stage: SpriteStage): ImageSourcePropType | undefined {
  return PET_SPRITES[type]?.[stage];
}

export function hasSpriteSet(type: PetType): boolean {
  return PET_SPRITES[type] !== undefined;
}

// =============================================================================
// IronQuest Pet Components - Main Export
// =============================================================================

export {
  PetAvatar,
  createDefaultStats,
  validateStats,
  type PetType,
  type EvolutionStage,
  type PetStats,
  type PetAvatarProps,
} from './PetAvatar';

export {
  PetShapeGenerator,
  PET_TYPE_COLORS,
  EVOLUTION_MULTIPLIERS,
  type ShapeConfig,
  type PetShapeGenerator as PetShapeGeneratorType,
} from './PetShapes';

export { PetSprite } from './PetSprite';
export { getSprite, hasSpriteSet, type SpriteStage } from './sprites';

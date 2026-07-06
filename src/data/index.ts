// =============================================================================
// IronQuest Data Module - Main Export
// =============================================================================

export {
  EXERCISE_DATABASE,
  getExerciseById,
  getExercisesByMuscle,
  getExercisesByPattern,
  getExercisesByEquipment,
  searchExercises,
} from './exercises';

export type {
  MuscleGroup,
  MovementPattern,
  Equipment,
  ExerciseDefinition,
  FPDistribution,
} from './exercises';

export {
  WORKOUT_TEMPLATES,
  getTemplateById,
  getTemplatesByDaysPerWeek,
  getTemplatesByDifficulty,
  calculateDayFPDistribution,
  calculateTotalFPDistribution,
} from './templates';

export type {
  TemplateExercise,
  TemplateDay,
  WorkoutTemplateDefinition,
} from './templates';

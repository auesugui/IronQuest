// =============================================================================
// IronQuest Data Module - Main Export
// =============================================================================

export {
  EXERCISE_DATABASE,
  MUSCLE_TO_FP,
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
} from './exercises';

export {
  WORKOUT_TEMPLATES,
  getTemplateById,
  getTemplatesByDaysPerWeek,
  getTemplatesByDifficulty,
} from './templates';

export type {
  TemplateExercise,
  TemplateDay,
  WorkoutTemplateDefinition,
} from './templates';

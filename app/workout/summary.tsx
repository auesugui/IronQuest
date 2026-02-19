// =============================================================================
// IronQuest Workout Summary Screen
// =============================================================================

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';

import { colors, spacing, textStyles, radius } from '@/theme';
import { haptics } from '@/utils/haptics';
import { useWorkoutStore, usePlayerStore, usePetStore } from '@/stores';
import type { Exercise, FPBalances } from '@/types';

interface WorkoutSummary {
  totalFP: number;
  breakdown: {
    base: number;
    volumeBonus: number;
    prBonus: number;
    streakMultiplier: number;
  };
  typedFP: Partial<FPBalances>; // FP distributed by muscle groups
  exercises: Exercise[];
  duration: number;
  totalReps: number;
  totalSets: number;
}

export default function WorkoutSummaryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const hasCalculated = useRef(false);

  useEffect(() => {
    // Only calculate once
    if (hasCalculated.current) return;

    // Parse workout data from params (passed before navigation)
    if (params.exercises && params.duration) {
      hasCalculated.current = true;
      try {
        const exercises = JSON.parse(params.exercises as string) as Exercise[];
        const duration = parseInt(params.duration as string, 10);
        const streakDays = parseInt((params.streakDays as string) || '0', 10);

        const workoutSummary = calculateWorkoutSummary(exercises, duration, streakDays);
        setSummary(workoutSummary);
      } catch (e) {
        console.error('Failed to parse workout summary:', e);
      }
    }
  }, [params.exercises, params.duration, params.streakDays]);

  const handleFinish = () => {
    haptics.success();

    // Award FP to player
    if (summary) {
      // Add typed FP to player balance (distributed by muscle groups)
      usePlayerStore.getState().addMultipleFP(summary.typedFP);

      // Add to pet's total FP earned (for evolution)
      usePetStore.getState().addFP(summary.totalFP);

      // Update streak
      usePlayerStore.getState().updateStreak(true);

      // Increment workout count
      usePlayerStore.getState().incrementWorkoutCount();
    }

    // End the session and go home
    useWorkoutStore.getState().endSession();
    router.replace('/(tabs)');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!summary) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[6] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.celebration}>Workout Complete!</Text>
          <Text style={styles.subtitle}>Great work getting stronger</Text>
        </View>

        {/* FP Earned Card */}
        <View style={styles.fpCard}>
          <Text style={styles.fpLabel}>Forge Points Earned</Text>
          <Text style={styles.fpValue}>{summary.totalFP}</Text>
          <Text style={styles.fpUnit}>FP</Text>
        </View>

        {/* FP Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Breakdown</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Base completion</Text>
            <Text style={styles.breakdownValue}>{summary.breakdown.base} FP</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Volume bonus</Text>
            <Text style={styles.breakdownValue}>+{summary.breakdown.volumeBonus} FP</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>PR bonuses</Text>
            <Text style={styles.breakdownValue}>+{summary.breakdown.prBonus} FP</Text>
          </View>

          {summary.breakdown.streakMultiplier > 1 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Streak multiplier</Text>
              <Text style={styles.breakdownValueHighlight}>x{summary.breakdown.streakMultiplier.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(summary.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.totalSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.totalReps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
        </View>

        {/* Exercise Summary */}
        <View style={styles.exercisesCard}>
          <Text style={styles.exercisesTitle}>Exercises Completed</Text>

          {summary.exercises.map((exercise, index) => {
            const loggedSets = exercise.sets.filter(s => s.logged);
            const exerciseReps = loggedSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);

            return (
              <View key={exercise.id} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseSets}>
                    {loggedSets.length} sets · {exerciseReps} reps
                  </Text>
                </View>
                {exercise.sets.some(s => s.isPR) && (
                  <View style={styles.prTag}>
                    <Text style={styles.prTagText}>PR</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Finish Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Pressable style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Claim Rewards</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Muscle group to FP type mapping
// Push (Chest/Shoulders) → Power + Focus
// Pull (Back/Traps) → Guard + Focus
// Legs (Quads/Hams/Calves) → Speed + Vigor
// Arms (Biceps/Triceps) → Focus
// Core → Vigor
const MUSCLE_TO_FP_TYPE: Record<string, (keyof FPBalances)[]> = {
  // Push muscles
  chest: ['power', 'focus'],
  shoulders: ['power', 'focus'],
  triceps: ['focus'],
  // Pull muscles
  back: ['guard', 'focus'],
  traps: ['guard', 'focus'],
  lats: ['guard', 'focus'],
  biceps: ['focus'],
  // Leg muscles
  quads: ['speed', 'vigor'],
  hamstrings: ['speed', 'vigor'],
  glutes: ['speed', 'vigor'],
  calves: ['vigor'],
  // Core
  core: ['vigor'],
  abs: ['vigor'],
};

// Calculate workout summary from exercises
function calculateWorkoutSummary(
  exercises: Exercise[],
  duration: number,
  streakDays: number
): WorkoutSummary {
  let totalBase = 0;
  let totalVolumeBonus = 0;
  let totalPRBonus = 0;
  let totalReps = 0;
  let totalSets = 0;

  // Track typed FP with weights (count muscle group occurrences)
  const typeWeights: Record<keyof FPBalances, number> = {
    generic: 0,
    power: 0,
    guard: 0,
    speed: 0,
    vigor: 0,
    focus: 0,
    spirit: 0, // Spirit only from streaks, not workouts
  };

  for (const exercise of exercises) {
    const loggedSets = exercise.sets.filter(s => s.logged);

    if (loggedSets.length > 0) {
      // Base FP: 100 per exercise with at least one logged set
      totalBase += 100;

      // Volume bonus: 1 FP per 10 reps
      const exerciseReps = loggedSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
      totalVolumeBonus += Math.floor(exerciseReps / 10);
      totalReps += exerciseReps;

      // PR bonus (simplified - would need historical data for real PR detection)
      for (const set of loggedSets) {
        if (set.isPR) totalPRBonus += 50;
        if (set.isRepPR) totalPRBonus += 25;
      }

      totalSets += loggedSets.length;

      // Count FP types from muscle groups (weighted distribution)
      for (const muscle of exercise.muscleGroups) {
        const types = MUSCLE_TO_FP_TYPE[muscle.toLowerCase()];
        if (types) {
          types.forEach(t => typeWeights[t]++);
        }
      }
    }
  }

  // Streak multiplier: 1.0 + 0.1 * days, max 2.0
  const streakMultiplier = Math.min(1.0 + 0.1 * streakDays, 2.0);

  // Total with multiplier
  const subTotal = totalBase + totalVolumeBonus + totalPRBonus;
  const totalFP = Math.floor(subTotal * streakMultiplier);

  // Distribute FP proportionally based on muscle group weights
  const typedFP: Partial<FPBalances> = {};
  const totalWeight = Object.entries(typeWeights)
    .filter(([key]) => key !== 'spirit') // Spirit not from workouts
    .reduce((sum, [, weight]) => sum + weight, 0);

  if (totalWeight === 0) {
    // No muscle groups mapped, use generic
    typedFP.generic = totalFP;
  } else {
    let distributed = 0;
    const fpTypes = Object.keys(typeWeights) as (keyof FPBalances)[];

    for (const type of fpTypes) {
      if (type === 'spirit') continue; // Skip spirit - only from streaks

      const weight = typeWeights[type];
      if (weight > 0) {
        // Proportional allocation
        const amount = Math.floor((weight / totalWeight) * totalFP);
        typedFP[type] = amount;
        distributed += amount;
      }
    }

    // Distribute remainder (due to floor) to the highest weighted type
    const remainder = totalFP - distributed;
    if (remainder > 0) {
      const highestType = Object.entries(typeWeights)
        .filter(([key]) => key !== 'spirit')
        .sort((a, b) => b[1] - a[1])[0]?.[0] as keyof FPBalances | undefined;

      if (highestType && typedFP[highestType] !== undefined) {
        typedFP[highestType] = (typedFP[highestType] ?? 0) + remainder;
      }
    }
  }

  return {
    totalFP,
    breakdown: {
      base: totalBase,
      volumeBonus: totalVolumeBonus,
      prBonus: totalPRBonus,
      streakMultiplier,
    },
    typedFP,
    exercises,
    duration,
    totalReps,
    totalSets,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[4],
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  celebration: {
    ...textStyles.h1,
    color: colors.reward.fp,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  fpCard: {
    backgroundColor: colors.reward.fp + '20',
    borderRadius: radius.xl,
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[4],
    borderWidth: 2,
    borderColor: colors.reward.fp,
  },
  fpLabel: {
    ...textStyles.label,
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },
  fpValue: {
    ...textStyles.hero,
    color: colors.reward.fp,
  },
  fpUnit: {
    ...textStyles.body,
    color: colors.reward.fp,
  },
  breakdownCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  breakdownTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  breakdownLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  breakdownValue: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  breakdownValueHighlight: {
    ...textStyles.body,
    color: colors.reward.fp,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.muted,
    marginTop: spacing[1],
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.ui.border,
    marginHorizontal: spacing[2],
  },
  exercisesCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  exercisesTitle: {
    ...textStyles.h3,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  exerciseSets: {
    ...textStyles.caption,
    color: colors.text.muted,
    marginTop: spacing[1],
  },
  prTag: {
    backgroundColor: colors.reward.pr + '20',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.sm,
  },
  prTagText: {
    ...textStyles.caption,
    color: colors.reward.pr,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    backgroundColor: colors.background.primary,
  },
  finishButton: {
    backgroundColor: colors.reward.fp,
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  finishButtonText: {
    ...textStyles.buttonLarge,
    color: colors.background.primary,
  },
});

// =============================================================================
// IronQuest Workout Summary Screen
// =============================================================================

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type WorkoutSummary, calculateWorkoutSummary } from '@/lib/workout-summary';
import { usePetStore, usePlayerStore, useWorkoutStore } from '@/stores';
import { colors, radius, spacing, textStyles } from '@/theme';
import type { Exercise, SessionIntent } from '@/types';
import { haptics } from '@/utils/haptics';

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
        const duration = Number.parseInt(params.duration as string, 10);
        const streakDays = Number.parseInt((params.streakDays as string) || '0', 10);
        const intent = ((params.intent as string) || 'normal') as SessionIntent;

        const workoutSummary = calculateWorkoutSummary(exercises, duration, streakDays, intent);
        setSummary(workoutSummary);
      } catch (e) {
        console.error('Failed to parse workout summary:', e);
      }
    }
  }, [params.exercises, params.duration, params.streakDays, params.intent]);

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
              <Text style={styles.breakdownValueHighlight}>
                x{summary.breakdown.streakMultiplier.toFixed(1)}
              </Text>
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
            const loggedSets = exercise.sets.filter((s) => s.logged);
            const exerciseReps = loggedSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);

            return (
              <View key={exercise.id} style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseSets}>
                    {loggedSets.length} sets · {exerciseReps} reps
                  </Text>
                </View>
                {exercise.sets.some((s) => s.isPR) && (
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

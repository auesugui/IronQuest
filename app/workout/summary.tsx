// =============================================================================
// IronQuest Workout Summary Screen
// =============================================================================
// Reads a workout by ID (never a full payload from URL params), renders the FP
// breakdown, and claims rewards exactly once. The idempotency guard lives in
// the history store's `claimRewards` (checks `claimedAt`); this screen only
// awards FP when that call returns a log. Reloading the summary URL restores
// the already-claimed log from storage, so a second "claim" is a no-op.

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type WorkoutSummary, calculateWorkoutSummary } from '@/lib/workout-summary';
import {
  useBaselineStore,
  usePetStore,
  usePlayerStore,
  useWorkoutHistoryStore,
  useWorkoutStore,
} from '@/stores';
import { colors, radius, spacing, textStyles } from '@/theme';
import { haptics } from '@/utils/haptics';

export default function WorkoutSummaryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const workoutId = typeof params.workoutId === 'string' ? params.workoutId : undefined;

  // Reactive lookup: undefined until the store hydrates (on reload) or if the
  // id is invalid. The found log reference is stable until claim mutates it.
  const log = useWorkoutHistoryStore((s) =>
    workoutId ? s.logs.find((l) => l.id === workoutId) : undefined
  );
  const hydrated = useWorkoutHistoryStore((s) => s.hydrated);

  const summary: WorkoutSummary | null = useMemo(() => {
    if (!log) return null;

    // Collect per-exercise baselines for relative FP scaling. Null baselines
    // are omitted; the engine falls back to absolute volume calc for those.
    const baselineStore = useBaselineStore.getState();
    const baselines: Record<string, number> = {};
    for (const ex of log.exercises) {
      const b = baselineStore.getBaseline(ex.id);
      if (b !== null) baselines[ex.id] = b;
    }

    return calculateWorkoutSummary(
      log.exercises,
      log.durationSeconds,
      log.streakDays,
      log.sessionIntent,
      Object.keys(baselines).length > 0 ? baselines : undefined
    );
  }, [log]);

  const handleFinish = () => {
    if (!summary || !log) return;

    // Idempotency boundary: first claim returns the log, every replay returns
    // null and we no-op (no FP, no navigation). This is the URL-replay fix.
    const claimed = useWorkoutHistoryStore.getState().claimRewards(log.id, {
      totalFP: summary.totalFP,
      fpEarned: summary.typedFP,
    });
    if (!claimed) return;

    haptics.success();

    // Add typed FP to player balance (distributed by muscle groups + Spirit)
    usePlayerStore.getState().addMultipleFP(summary.typedFP);

    // Add to pet's total FP earned (for evolution)
    usePetStore.getState().addFP(summary.totalFP);

    // Update streak
    usePlayerStore.getState().updateStreak(true);

    // Increment workout count
    usePlayerStore.getState().incrementWorkoutCount();

    // Update per-exercise baselines for future relative-FP scaling.
    // Session max = highest weight × reps across logged sets.
    const baselineStore = useBaselineStore.getState();
    for (const ex of summary.exercises) {
      const loggedSets = ex.sets.filter((s) => s.logged);
      if (loggedSets.length === 0) continue;
      const sessionMax = loggedSets.reduce(
        (max, s) => Math.max(max, (s.weight ?? 0) * (s.reps ?? 0)),
        0
      );
      if (sessionMax > 0) baselineStore.recordSession(ex.id, sessionMax);
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

  // Loading state while the history store rehydrates from storage (reload path).
  if (!hydrated) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      </View>
    );
  }

  // No log for this id (e.g. stale/invalid link) — nothing to claim, nothing
  // to re-award. This is the safe fallback for the replay exploit.
  if (!log || !summary) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Workout not found.</Text>
          <Pressable style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.backButtonText}>Go Home</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const alreadyClaimed = log.claimedAt !== null;

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

          {summary.spiritFP > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Spirit (streak bonus)</Text>
              <Text style={styles.breakdownValueHighlight}>+{summary.spiritFP} Spirit FP</Text>
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

          {summary.exercises.map((exercise) => {
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
        <Pressable
          style={[styles.finishButton, alreadyClaimed && styles.finishButtonClaimed]}
          onPress={handleFinish}
          disabled={alreadyClaimed}
        >
          <Text style={styles.finishButtonText}>
            {alreadyClaimed ? 'Rewards Claimed' : 'Claim Rewards'}
          </Text>
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
    marginBottom: spacing[4],
  },
  backButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
  },
  backButtonText: {
    ...textStyles.button,
    color: colors.text.primary,
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
  finishButtonClaimed: {
    backgroundColor: colors.background.tertiary,
  },
  finishButtonText: {
    ...textStyles.buttonLarge,
    color: colors.background.primary,
  },
});

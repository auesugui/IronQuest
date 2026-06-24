// =============================================================================
// IronQuest Quest Board (Home Tab)
// =============================================================================

import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TemplateCard } from '@/components/workout/TemplateCard';
import { WORKOUT_TEMPLATES } from '@/data';
import { selectTotalFP, usePlayerStore } from '@/stores';
import { colors, radius, spacing, textStyles } from '@/theme';

export default function QuestBoardScreen() {
  const totalFP = usePlayerStore(selectTotalFP);
  const streak = usePlayerStore((state) => state.streak.current);
  const totalWorkouts = usePlayerStore((state) => state.totalWorkouts);

  const handleTemplatePress = (templateId: string) => {
    router.push(`/workout/template/${templateId}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* FP Counter */}
      <View style={styles.fpCard}>
        <Text style={styles.fpLabel}>Total FP</Text>
        <Text style={styles.fpValue}>{totalFP.toLocaleString()}</Text>
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakValue}>{streak}</Text>
        <Text style={styles.streakLabel}>day streak</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Workouts" value={totalWorkouts.toString()} />
          <StatCard label="This Week" value="0" />
          <StatCard label="PRs" value="0" />
          <StatCard label="Tower Floor" value="1" />
        </View>
      </View>

      {/* Templates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Templates</Text>
        <Text style={styles.sectionSubtitle}>
          Choose a program that fits your schedule. Each shows the FP distribution you'll earn.
        </Text>

        {WORKOUT_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onPress={() => handleTemplatePress(template.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  fpCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  fpLabel: {
    ...textStyles.label,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  fpValue: {
    ...textStyles.numberLarge,
    color: colors.reward.fp,
  },
  streakCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakValue: {
    ...textStyles.number,
    color: colors.text.primary,
  },
  streakLabel: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  sectionSubtitle: {
    ...textStyles.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  statCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing[3],
    width: '47%',
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.numberSmall,
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
});

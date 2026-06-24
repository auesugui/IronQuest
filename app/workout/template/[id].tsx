// =============================================================================
// IronQuest Template Detail Screen
// =============================================================================

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RadarChart } from '@/components/progress/RadarChart';
import { type WorkoutTemplateDefinition, getExerciseById, getTemplateById } from '@/data';
import { colors, radius, spacing, textStyles } from '@/theme';
import { haptics } from '@/utils/haptics';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [template, setTemplate] = useState<WorkoutTemplateDefinition | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    if (id) {
      const found = getTemplateById(id);
      setTemplate(found ?? null);
    }
  }, [id]);

  if (!template) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Template not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const selectedDay = template.days[selectedDayIndex];

  const handleStartWorkout = () => {
    haptics.success();
    router.push({
      pathname: '/workout/loadout',
      params: { templateId: template.id, dayIndex: selectedDayIndex.toString() },
    });
  };

  const handleDaySelect = (index: number) => {
    haptics.selection();
    setSelectedDayIndex(index);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.templateName}>{template.name}</Text>
        <Text style={styles.templateDescription}>{template.description}</Text>

        <View style={styles.templateMeta}>
          <MetaChip label={`${template.daysPerWeek} days/week`} />
          <MetaChip label={`${template.estimatedDuration} min`} />
          <MetaChip label={template.difficulty} />
        </View>
      </View>

      {/* Overall FP Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall FP Distribution</Text>
        <View style={styles.radarContainer}>
          <RadarChart values={template.totalFpDistribution} size={180} showLabels={true} />
        </View>
      </View>

      {/* Day Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Session</Text>
        <View style={styles.dayTabs}>
          {template.days.map((day, index) => (
            <Pressable
              key={day.id}
              style={[styles.dayTab, index === selectedDayIndex && styles.dayTabActive]}
              onPress={() => handleDaySelect(index)}
            >
              <Text
                style={[styles.dayTabText, index === selectedDayIndex && styles.dayTabTextActive]}
              >
                {day.shortName}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Selected Day Details */}
      {selectedDay && (
        <View style={styles.section}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{selectedDay.name}</Text>
            <View style={styles.miniRadar}>
              <RadarChart values={selectedDay.fpDistribution} size={80} showLabels={false} />
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {selectedDay.exercises.map((templateEx, index) => {
              const exercise = getExerciseById(templateEx.exerciseId);
              return (
                <View key={`${templateEx.exerciseId}-${index}`} style={styles.exerciseRow}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise?.name ?? 'Unknown'}</Text>
                    <Text style={styles.exerciseDetails}>
                      {templateEx.sets} sets × {templateEx.reps} reps
                    </Text>
                  </View>
                  <Text style={styles.restTime}>{Math.floor(templateEx.restSeconds / 60)}m</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Start Button */}
      <View style={styles.startSection}>
        <Pressable style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>Review {selectedDay?.shortName} & Start</Text>
        </Pressable>
        <Text style={styles.startHint}>
          {selectedDay?.exercises.length ?? 0} exercises • ~{template.estimatedDuration} min
        </Text>
      </View>
    </ScrollView>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{label}</Text>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  emptyText: {
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
    marginBottom: spacing[6],
  },
  templateName: {
    ...textStyles.h1,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  templateDescription: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  templateMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  metaChip: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  metaChipText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  radarContainer: {
    alignItems: 'center',
  },
  dayTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  dayTab: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: colors.reward.fp,
  },
  dayTabText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  dayTabTextActive: {
    color: colors.background.primary,
    fontWeight: '600',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  dayName: {
    ...textStyles.h3,
    color: colors.text.primary,
  },
  miniRadar: {},
  exerciseList: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  exerciseNumberText: {
    ...textStyles.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  exerciseDetails: {
    ...textStyles.caption,
    color: colors.text.muted,
  },
  restTime: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },
  startSection: {
    marginTop: spacing[4],
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: colors.reward.fp,
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    ...textStyles.buttonLarge,
    color: colors.background.primary,
  },
  startHint: {
    ...textStyles.caption,
    color: colors.text.muted,
    marginTop: spacing[2],
  },
});

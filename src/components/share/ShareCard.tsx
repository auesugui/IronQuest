// =============================================================================
// IronQuest Share Card (Phase 2 — promoted from Phase 3, decision 2026-07-04)
// =============================================================================
// The static, capture-ready portrait of a pet: the cheapest organic
// acquisition mechanic the product has. Fixed dimensions so captures are
// consistent; renders through PetAvatar so it always shows the best
// available art (sprite column or procedural fallback).

import { StyleSheet, Text, View } from 'react-native';

import { PetAvatar, type PetStats } from '@/components/pet';
import { RadarChart } from '@/components/progress/RadarChart';
import { colors, radius, spacing, textStyles } from '@/theme';
import type { PetType } from '@/types';

export const SHARE_CARD_WIDTH = 340;

const STAGE_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: 'Shard',
  2: 'Form',
  3: 'Prime',
  4: 'Apex',
};

interface ShareCardProps {
  petType: PetType;
  petName: string;
  stats: PetStats;
  evolutionStage: 1 | 2 | 3 | 4;
  streakDays: number;
  totalWorkouts: number;
  totalFPEarned: number;
}

export function ShareCard({
  petType,
  petName,
  stats,
  evolutionStage,
  streakDays,
  totalWorkouts,
  totalFPEarned,
}: ShareCardProps) {
  // Pet stats are 0-50; radar expects 0-100.
  const radarValues = Object.fromEntries(
    Object.entries(stats).map(([k, v]) => [k, Math.min(100, v * 2)])
  );

  return (
    <View style={styles.card}>
      <Text style={styles.brand}>IRONQUEST</Text>

      <View style={styles.petBlock}>
        <PetAvatar
          petType={petType}
          stats={stats}
          evolutionStage={evolutionStage}
          size={130}
          animated={false}
        />
      </View>

      <Text style={styles.petName}>{petName || 'My Companion'}</Text>
      <Text style={styles.petMeta}>
        Stage {evolutionStage}: {STAGE_NAMES[evolutionStage]} · {petType} type
      </Text>

      <View style={styles.radarBlock}>
        <RadarChart values={radarValues} size={150} showLabels={true} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>🔥 {streakDays}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalFPEarned.toLocaleString()}</Text>
          <Text style={styles.statLabel}>FP forged</Text>
        </View>
      </View>

      <Text style={styles.tagline}>Every rep forges the beast.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    backgroundColor: colors.background.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.reward.fp,
    padding: spacing[5],
    alignItems: 'center',
  },
  brand: {
    ...textStyles.label,
    color: colors.reward.fp,
    letterSpacing: 6,
    marginBottom: spacing[3],
  },
  petBlock: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName: {
    ...textStyles.h2,
    color: colors.text.primary,
    marginTop: spacing[2],
  },
  petMeta: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[1],
    textTransform: 'capitalize',
  },
  radarBlock: {
    marginTop: spacing[3],
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing[4],
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h4,
    color: colors.text.primary,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.muted,
    marginTop: spacing[1],
  },
  tagline: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing[4],
    fontStyle: 'italic',
  },
});

// =============================================================================
// Evolution Ceremony (major tier — Zelda-style reveal, avatar brief §6/§8)
// =============================================================================
// The acquisition IS the memory: full-screen hold, glow blooms, the evolved
// pet scales in with a spring settle, stage name displayed. The continue
// button unlocks only after a minimum hold — evolution is never rushed past.
// No dismissal by tapping the backdrop; this moment took weeks to earn.

import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { PetAvatar, type PetStats } from '@/components/pet';
import { useSettingsStore } from '@/stores/settingsStore';
import { colors, radius, spacing, textStyles } from '@/theme';
import type { PetType } from '@/types';
import { haptics } from '@/utils/haptics';
import { CELEBRATION, STAGE_NAMES } from './vocabulary';

interface EvolutionCeremonyProps {
  visible: boolean;
  petType: PetType;
  petName: string;
  stats: PetStats;
  newStage: 1 | 2 | 3 | 4;
  onDone: () => void;
}

const GLOW_SIZE = 340;

export function EvolutionCeremony({
  visible,
  petType,
  petName,
  stats,
  newStage,
  onDone,
}: EvolutionCeremonyProps) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const [canContinue, setCanContinue] = useState(false);

  const glow = useSharedValue(0);
  const sprite = useSharedValue(0);
  const text = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    haptics.celebration();
    setCanContinue(false);

    if (reducedMotion) {
      glow.value = 1;
      sprite.value = 1;
      text.value = 1;
      setCanContinue(true);
      return;
    }

    glow.value = 0;
    sprite.value = 0;
    text.value = 0;
    glow.value = withTiming(1, { duration: CELEBRATION.ceremony.glowInMs });
    sprite.value = withDelay(CELEBRATION.ceremony.glowInMs, withSpring(1, CELEBRATION.settle));
    text.value = withDelay(
      CELEBRATION.ceremony.glowInMs + CELEBRATION.ceremony.spriteInMs,
      withTiming(1, { duration: 400 })
    );

    const timer = setTimeout(() => setCanContinue(true), CELEBRATION.ceremony.minHoldMs);
    return () => clearTimeout(timer);
  }, [visible, reducedMotion, glow, sprite, text]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const spriteStyle = useAnimatedStyle(() => ({
    opacity: sprite.value,
    transform: [{ scale: 0.4 + sprite.value * 0.6 }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: text.value,
    transform: [{ translateY: (1 - text.value) * 12 }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        {/* Gold bloom behind the evolved pet */}
        <Animated.View style={[styles.glowWrapper, glowStyle]} pointerEvents="none">
          <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
            <Defs>
              <RadialGradient id="ceremonyGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={CELEBRATION.flash.color} stopOpacity={0.45} />
                <Stop offset="60%" stopColor={CELEBRATION.flash.color} stopOpacity={0.15} />
                <Stop offset="100%" stopColor={CELEBRATION.flash.color} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle
              cx={GLOW_SIZE / 2}
              cy={GLOW_SIZE / 2}
              r={GLOW_SIZE / 2}
              fill="url(#ceremonyGlow)"
            />
          </Svg>
        </Animated.View>

        <Animated.View style={spriteStyle}>
          <PetAvatar
            petType={petType}
            stats={stats}
            evolutionStage={newStage}
            size={200}
            animated={!reducedMotion}
          />
        </Animated.View>

        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.evolvedLabel}>EVOLUTION</Text>
          <Text style={styles.petName}>{petName || 'Your companion'}</Text>
          <Text style={styles.stageName}>
            Stage {newStage}: {STAGE_NAMES[newStage]}
          </Text>
        </Animated.View>

        <Pressable
          style={[styles.continueButton, !canContinue && styles.continueDisabled]}
          onPress={onDone}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.continueText}>{canContinue ? 'Continue' : '...'}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  glowWrapper: {
    position: 'absolute',
  },
  textBlock: {
    alignItems: 'center',
    marginTop: spacing[6],
  },
  evolvedLabel: {
    ...textStyles.label,
    color: CELEBRATION.flash.color,
    letterSpacing: 4,
    marginBottom: spacing[2],
  },
  petName: {
    ...textStyles.h1,
    color: colors.text.primary,
  },
  stageName: {
    ...textStyles.h3,
    color: colors.reward.fp,
    marginTop: spacing[1],
  },
  continueButton: {
    marginTop: spacing[8],
    backgroundColor: colors.reward.fp,
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
  },
  continueDisabled: {
    opacity: 0.25,
  },
  continueText: {
    ...textStyles.buttonLarge,
    color: colors.background.primary,
  },
});

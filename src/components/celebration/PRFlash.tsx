// =============================================================================
// PR gold flash (micro ceremony tier — celebration vocabulary)
// =============================================================================
// Wraps a just-logged PR set row: gold flash in, slow decay out, spring-free
// (the row itself doesn't move — the flash is the event). Fires on mount when
// `active`; a non-PR row renders children untouched.

import { type ReactNode, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useSettingsStore } from '@/stores/settingsStore';
import { haptics } from '@/utils/haptics';
import { CELEBRATION } from './vocabulary';

interface PRFlashProps {
  active: boolean;
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function PRFlash({ active, children, style }: PRFlashProps) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    // Haptic burst fires even under reduced motion — it's not motion.
    haptics.celebration();
    if (reducedMotion) return;
    flash.value = withSequence(
      withTiming(1, { duration: CELEBRATION.flash.inMs }),
      withTiming(0, { duration: CELEBRATION.flash.outMs })
    );
  }, [active, flash, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      flash.value,
      [0, 1],
      ['transparent', `${CELEBRATION.flash.color}55`]
    ),
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

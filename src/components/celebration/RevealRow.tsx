// =============================================================================
// Staggered reveal wrapper (celebration vocabulary)
// =============================================================================
// Wraps a row so a list can enter sequentially (base → volume → PR → streak),
// the UX spec's "animate each FP line item sequentially". `index` sets the
// stagger slot. Reduced motion renders children immediately.

import { type ReactNode, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useSettingsStore } from '@/stores/settingsStore';
import { CELEBRATION } from './vocabulary';

interface RevealRowProps {
  index: number;
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function RevealRow({ index, children, style }: RevealRowProps) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      index * CELEBRATION.reveal.staggerMs,
      withTiming(1, {
        duration: CELEBRATION.reveal.durationMs,
        easing: CELEBRATION.reveal.easing,
      })
    );
  }, [index, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * CELEBRATION.reveal.translateY }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

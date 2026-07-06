// =============================================================================
// Rolling-number count-up (celebration vocabulary)
// =============================================================================
// rAF-driven so it needs no extra dependencies. Respects reduced motion by
// rendering the final value immediately.

import { useEffect, useRef, useState } from 'react';
import { Text, type TextStyle } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';
import { CELEBRATION } from './vocabulary';

interface CountUpTextProps {
  value: number;
  style?: TextStyle | TextStyle[];
  durationMs?: number;
  prefix?: string;
  suffix?: string;
}

export function CountUpText({
  value,
  style,
  durationMs = CELEBRATION.countUp.durationMs,
  prefix = '',
  suffix = '',
}: CountUpTextProps) {
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const start = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / durationMs);
      // ease-out cubic: fast start, satisfying settle on the final digits
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(value * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs, reducedMotion]);

  return (
    <Text style={style}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </Text>
  );
}

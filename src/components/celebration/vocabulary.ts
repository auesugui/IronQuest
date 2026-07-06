// =============================================================================
// IronQuest Celebration Vocabulary (issue #40 / audit §5.6)
// =============================================================================
// ONE shared animation language for every reward moment, so celebrations are
// instantly recognizable: gold flash + haptic burst + spring settle.
// Ceremony tiers (avatar brief §8): micro = PR gold flash, minor = gear
// materializes (Phase: gear system), major = full evolution reveal.

import { Easing } from 'react-native-reanimated';

export const CELEBRATION = {
  // Gold flash (micro tier)
  flash: {
    color: '#FBBF24', // colors.reward.pr
    inMs: 120,
    outMs: 700,
  },

  // Spring settle — the shared "landing" for any celebrated element
  settle: {
    damping: 12,
    stiffness: 180,
    mass: 0.8,
  },

  // Sequential reveal (summary breakdown lines)
  reveal: {
    staggerMs: 260,
    durationMs: 360,
    easing: Easing.out(Easing.cubic),
    translateY: 14,
  },

  // Rolling number count-up
  countUp: {
    durationMs: 900,
  },

  // Major tier: evolution ceremony (Zelda-style — time spent deliberately)
  ceremony: {
    minHoldMs: 3200, // continue button unlocks after this
    glowInMs: 700,
    spriteInMs: 900,
  },
} as const;

export const STAGE_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: 'Shard',
  2: 'Form',
  3: 'Prime',
  4: 'Apex',
};

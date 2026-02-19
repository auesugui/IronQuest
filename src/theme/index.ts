// =============================================================================
// IronQuest Theme - Main Export
// =============================================================================

import colors, { colors as colorsType } from './colors';
import {
  spacing,
  layout,
  touchTarget,
  radius,
  shadows,
  type Spacing,
  type Layout,
  type TouchTarget,
  type Radius,
  type Shadows,
} from './spacing';
import {
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  textStyles,
  type FontSize,
  type TextStyle,
} from './typography';

export const theme = {
  colors,
  spacing,
  layout,
  touchTarget,
  radius,
  shadows,
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  textStyles,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colorsType;

// Re-export individual modules
export { colors, spacing, layout, touchTarget, radius, shadows };
export { fontFamilies, fontSizes, lineHeights, fontWeights, textStyles };

// Type exports
export type { Spacing, Layout, TouchTarget, Radius, Shadows };
export type { FontSize, TextStyle };

export default theme;

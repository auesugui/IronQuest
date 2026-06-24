// =============================================================================
// IronQuest Theme - Main Export
// =============================================================================

import colors, { type colors as colorsType } from './colors';
import {
  type Layout,
  type Radius,
  type Shadows,
  type Spacing,
  type TouchTarget,
  layout,
  radius,
  shadows,
  spacing,
  touchTarget,
} from './spacing';
import {
  type FontSize,
  type TextStyle,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  textStyles,
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

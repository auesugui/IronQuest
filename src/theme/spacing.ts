// =============================================================================
// IronQuest Spacing System
// =============================================================================

export const spacing = {
  // Base unit: 4px
  0: 0,
  0.5: 2, // 2px
  1: 4, // 4px
  1.5: 6, // 6px
  2: 8, // 8px
  2.5: 10, // 10px
  3: 12, // 12px
  4: 16, // 16px
  5: 20, // 20px
  6: 24, // 24px
  7: 28, // 28px
  8: 32, // 32px
  9: 36, // 36px
  10: 40, // 40px
  12: 48, // 48px
  14: 56, // 56px
  16: 64, // 64px
  20: 80, // 80px
  24: 96, // 96px
  32: 128, // 128px
} as const;

// Semantic spacing
export const layout = {
  screenPadding: spacing[4], // 16px
  cardPadding: spacing[4], // 16px
  listItemPadding: spacing[3], // 12px
  sectionGap: spacing[6], // 24px
  elementGap: spacing[3], // 12px
  inlineGap: spacing[2], // 8px
} as const;

// Touch target sizes (minimum 44pt for accessibility)
export const touchTarget = {
  minimum: 44,
  small: 44,
  medium: 48,
  large: 56,
  xl: 64,
} as const;

// Border radius
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Shadows (for elevation)
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 10.32,
    elevation: 12,
  },
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type TouchTarget = typeof touchTarget;
export type Radius = typeof radius;
export type Shadows = typeof shadows;

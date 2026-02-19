// =============================================================================
// IronQuest Color System
// =============================================================================

export const colors = {
  // Primary palette
  primary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Primary gold/amber
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Background colors
  background: {
    primary: '#0F172A', // Deep navy
    secondary: '#1E293B',
    tertiary: '#334155',
    surface: '#1E293B',
    elevated: '#334155',
  },

  // Text colors
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0F172A',
  },

  // Stat colors (for radar chart and stat allocation)
  stats: {
    power: '#EF4444', // Warm red-orange
    guard: '#3B82F6', // Steel blue
    speed: '#22C55E', // Electric green
    vigor: '#A16207', // Earth brown
    focus: '#8B5CF6', // Sharp violet
    spirit: '#FEF08A', // White-gold glow
  },

  // FP/Reward colors
  reward: {
    fp: '#F59E0B', // Gold/amber
    pr: '#FBBF24', // Bright gold for PRs
    streak: '#F97316', // Orange flame
  },

  // Type colors (for pet types)
  types: {
    ferro: '#94A3B8', // Chrome/metallic
    terra: '#22C55E', // Forest/earth
    flux: '#A855F7', // Neon/electric
  },

  // Semantic colors
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Timer colors
  timer: {
    resting: '#60A5FA', // Cool blue
    approaching: '#FBBF24', // Soft gold
    ready: '#FBBF24', // Full gold
    overrun: '#64748B', // Muted gray
    paused: '#475569', // Darker gray
    transition: '#A855F7', // Purple for equipment setup
  },

  // UI colors
  ui: {
    border: '#334155',
    borderLight: '#475569',
    divider: '#1E293B',
    overlay: 'rgba(15, 23, 42, 0.8)',
    card: '#1E293B',
    input: '#334155',
    placeholder: '#64748B',
  },

  // Boss/Danger colors
  danger: {
    light: '#FCA5A5',
    DEFAULT: '#EF4444',
    dark: '#B91C1C',
  },
} as const;

// Light theme colors (for future use)
export const lightColors = {
  background: {
    primary: '#F8FAFC',
    secondary: '#F1F5F9',
    tertiary: '#E2E8F0',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#334155',
    tertiary: '#475569',
    muted: '#94A3B8',
    inverse: '#F8FAFC',
  },
  // ... other colors same as dark
} as const;

export type ColorTheme = typeof colors;
export default colors;

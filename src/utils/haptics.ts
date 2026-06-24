// =============================================================================
// IronQuest Haptics Utility
// =============================================================================

import { useSettingsStore } from '@/stores';
import * as Haptics from 'expo-haptics';

// Haptic feedback types
export type HapticStyle =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

// Map style to expo-haptics methods
const hapticMap = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};

// Trigger haptic feedback if enabled
export function triggerHaptic(style: HapticStyle): void {
  const hapticsEnabled = useSettingsStore.getState().haptics;

  if (hapticsEnabled) {
    hapticMap[style]().catch(() => {
      // Silently fail on devices without haptic support
    });
  }
}

// Convenience hooks for common haptics
export const haptics = {
  // Button taps
  tap: () => triggerHaptic('light'),

  // Set logged, exercise completed
  success: () => triggerHaptic('success'),

  // PR achieved, evolution
  celebration: () => triggerHaptic('heavy'),

  // Navigation, tab switches
  selection: () => triggerHaptic('selection'),

  // Errors, warnings
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),

  // Rest timer complete
  notification: () => triggerHaptic('medium'),

  // Direct access
  light: () => triggerHaptic('light'),
  medium: () => triggerHaptic('medium'),
  heavy: () => triggerHaptic('heavy'),
};

// =============================================================================
// IronQuest Cross-Platform Alert
// =============================================================================
// react-native-web's `Alert.alert` is a no-op (empty static method), so a
// confirmation dialog built on it is invisible during web verification. The
// session-abandon guard (issue #20) is a UI-surfacing safety feature that
// MUST be verifiable in the browser, so this wrapper:
//   - native: delegates straight to react-native's Alert.alert (identical
//     native dialog behavior — the real OS dialog).
//   - web: renders an equivalent DOM dialog via `showWebAlert` so CDT/
//     Playwright can drive the same Cancel / Discard & End buttons.
//
// Call sites import `showAlert` from here instead of `Alert` from
// 'react-native' so the platform split lives in exactly one place. The pure
// guard logic (`confirmEndSession`) only ever sees the `ShowAlert` contract,
// keeping it renderer-agnostic and unit-testable.

import { Alert, Platform } from 'react-native';

import type { AlertConfig } from '@/workout/endSessionGuard';
import { showWebAlert } from './webAlert';

export const showAlert = (config: AlertConfig): void => {
  if (Platform.OS === 'web') {
    showWebAlert(config);
    return;
  }
  Alert.alert(config.title, config.message, config.buttons, config.options);
};

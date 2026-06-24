// =============================================================================
// IronQuest Splash/Index Screen
// =============================================================================

import { Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';

import { usePlayerStore } from '@/stores';
import { colors } from '@/theme';

export default function IndexScreen() {
  const hydrated = usePlayerStore((state) => state.fp.generic !== undefined);

  // For now, just redirect to tabs
  // In the future, this could show a splash screen while hydrating
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});

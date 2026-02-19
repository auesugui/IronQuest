// =============================================================================
// IronQuest App Root Layout
// =============================================================================

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { usePlayerStore, usePetStore, useWorkoutStore, useSettingsStore, useWeightHistoryStore } from '@/stores';
import { migrateStorage } from '@/utils/storage';
import { colors } from '@/theme';

export default function RootLayout() {
  const hydratePlayer = usePlayerStore((state) => state.hydrate);
  const hydratePet = usePetStore((state) => state.hydrate);
  const hydrateWorkout = useWorkoutStore((state) => state.hydrate);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const hydrateWeightHistory = useWeightHistoryStore((state) => state.hydrate);
  const theme = useSettingsStore((state) => state.theme);

  // Hydrate all stores on mount
  useEffect(() => {
    const init = async () => {
      try {
        await migrateStorage();
        await Promise.all([
          hydratePlayer(),
          hydratePet(),
          hydrateWorkout(),
          hydrateSettings(),
          hydrateWeightHistory(),
        ]);
      } catch (error) {
        console.warn('Storage initialization error:', error);
      }
    };

    init();
  }, [hydratePlayer, hydratePet, hydrateWorkout, hydrateSettings, hydrateWeightHistory]);

  // Determine color scheme
  const isDark = theme === 'dark' || theme === 'system';

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background.primary,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="workout/session"
          options={{
            headerShown: true,
            headerTitle: 'Workout',
            presentation: 'fullScreenModal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

// =============================================================================
// IronQuest Tab Navigation Layout
// =============================================================================

import { Tabs, router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.ui.border,
          borderTopWidth: 1,
          // Dynamic height based on device safe areas
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.reward.fp,
        tabBarInactiveTintColor: colors.text.muted,
        // Ensure content doesn't go under the tab bar
        tabBarItemStyle: {
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quest Board',
          tabBarIcon: ({ color }) => <TabIcon name="clipboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="den"
        options={{
          title: 'The Den',
          tabBarIcon: ({ color }) => <TabIcon name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tower"
        options={{
          title: 'Tower',
          tabBarIcon: ({ color }) => <TabIcon name="triangle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
      {/* History is reachable from the home screen, not the tab bar. `href:
          null` keeps the route resolvable via router.push while hiding it as a
          tab. The explicit header back affordance returns to the Quest Board
          (tab navigators don't provide one themselves). */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Workout History',
          href: null,
          headerLeft: () => (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.headerBack}>‹ Back</Text>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

// Simple icon component (will be replaced with proper icons)
function TabIcon({ name, color }: { name: string; color: string }) {
  // Placeholder - will use expo-symbols or react-native-vector-icons
  return (
    <View
      style={[
        styles.iconPlaceholder,
        { backgroundColor: color + '30' }, // 30 = 19% opacity in hex
      ]}
    />
  );
}

const styles = StyleSheet.create({
  iconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  headerBack: {
    fontSize: 17,
    color: colors.reward.fp,
    marginLeft: spacing[2],
  },
});

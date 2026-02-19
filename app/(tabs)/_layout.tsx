// =============================================================================
// IronQuest Tab Navigation Layout
// =============================================================================

import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

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
});

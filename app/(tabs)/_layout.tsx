import { Tabs } from 'expo-router';
import React from 'react';

import { useTheme } from '@/theme';

/**
 * Phase 0 ships two tabs. Map, Recommendations, My List and Friends get
 * added as their phases land.
 */
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

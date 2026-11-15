import { Tabs } from 'expo-router';
import React from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

/** Small tab glyphs, drawn to match the category icons. */
function TabIcon({
  name,
  color,
}: {
  name: 'home' | 'map' | 'discover' | 'profile';
  color: ColorValue;
}) {
  const stroke = { stroke: color, strokeWidth: 2, fill: 'none' as const };
  const round = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {name === 'home' ? (
        <Path d="M4 10.5 L12 4 L20 10.5 L20 20 L4 20 Z" {...stroke} {...round} />
      ) : null}
      {name === 'map' ? (
        <>
          <Path
            d="M9 4 L3 6.5 L3 20 L9 17.5 L15 20 L21 17.5 L21 4 L15 6.5 Z"
            {...stroke}
            {...round}
          />
          <Path d="M9 4 L9 17.5 M15 6.5 L15 20" {...stroke} {...round} />
        </>
      ) : null}
      {name === 'discover' ? (
        <>
          <Circle cx="11" cy="11" r="7" {...stroke} />
          <Path d="M16.5 16.5 L21 21" {...stroke} {...round} />
        </>
      ) : null}
      {name === 'profile' ? (
        <>
          <Circle cx="12" cy="8.5" r="4" {...stroke} />
          <Path
            d="M4.5 20 C4.5 15.8 7.9 13.5 12 13.5 C16.1 13.5 19.5 15.8 19.5 20"
            {...stroke}
            {...round}
          />
        </>
      ) : null}
    </Svg>
  );
}

/**
 * Four tabs after Phase 1. My List, Friends and the rest arrive with their
 * own phases.
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <TabIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabIcon name="discover" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
        }}
      />
    </Tabs>
  );
}

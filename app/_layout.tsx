import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ThemeProvider, useTheme } from '@/theme';

import { AuthGate } from './_auth-gate';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const theme = useTheme();
  const { initialising } = useAuth();

  useEffect(() => {
    if (!initialising) void SplashScreen.hideAsync();
  }, [initialising]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

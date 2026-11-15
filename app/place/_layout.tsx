import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function PlaceLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTitle: '',
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add" options={{ headerTitle: 'Add a spot' }} />
      <Stack.Screen name="suggest/[id]" options={{ headerTitle: 'Suggest a correction' }} />
    </Stack>
  );
}

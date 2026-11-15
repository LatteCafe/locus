import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/providers/OnboardingProvider';
import { useTheme } from '@/theme';

export default function OnboardingLayout() {
  const theme = useTheme();
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </OnboardingProvider>
  );
}

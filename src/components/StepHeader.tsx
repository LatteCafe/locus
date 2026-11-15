import React from 'react';
import { View } from 'react-native';

import { ONBOARDING_STEPS } from '@/providers/OnboardingProvider';
import { useTheme } from '@/theme';

import { Text } from './Text';

/** Title, subtitle and a progress bar, shared by the onboarding screens. */
export function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        {Array.from({ length: ONBOARDING_STEPS }, (_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 3,
              borderRadius: theme.radius.pill,
              backgroundColor: index < step ? theme.colors.accent : theme.colors.border,
            }}
          />
        ))}
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="body" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

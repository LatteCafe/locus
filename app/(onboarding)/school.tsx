import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Screen, StepHeader, Text } from '@/components';
import { SCHOOLS } from '@/config';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useTheme } from '@/theme';

export default function SchoolStep() {
  const theme = useTheme();
  const router = useRouter();
  const { draft, update } = useOnboarding();

  // Only one school for now, so preselect it rather than make them tap.
  const [schoolId, setSchoolId] = useState(draft.schoolId ?? SCHOOLS[0].id);

  function onNext() {
    update({ schoolId });
    router.push('/(onboarding)/courses');
  }

  return (
    <Screen footer={<Button title="Continue" onPress={onNext} disabled={!schoolId} />}>
      <StepHeader step={3} title="Where do you study?" />

      <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}>
        {SCHOOLS.map((school) => {
          const selected = school.id === schoolId;
          return (
            <Pressable
              key={school.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setSchoolId(school.id)}
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radius.md,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? theme.colors.accent : theme.colors.border,
                backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
                gap: theme.spacing.xs,
              }}
            >
              <Text variant="bodyMedium">{school.shortName}</Text>
              <Text variant="caption" tone="muted">
                {school.name}
              </Text>
            </Pressable>
          );
        })}

        <Text variant="caption" tone="faint" style={{ marginTop: theme.spacing.sm }}>
          More campuses are coming. Locus starts at St. George.
        </Text>
      </View>
    </Screen>
  );
}

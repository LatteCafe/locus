import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Screen, StepHeader, Text, TextField } from '@/components';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useTheme } from '@/theme';

const MAX_COURSES = 20;

/** Course codes look like ECO102, MAT137Y1, CSC108. */
function normaliseCourse(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12);
}

export default function CoursesStep() {
  const theme = useTheme();
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const [courses, setCourses] = useState<string[]>(draft.courses);
  const [entry, setEntry] = useState('');

  const candidate = normaliseCourse(entry);
  const canAdd =
    candidate.length >= 3 && !courses.includes(candidate) && courses.length < MAX_COURSES;

  function addCourse() {
    if (!canAdd) return;
    setCourses((current) => [...current, candidate]);
    setEntry('');
  }

  function removeCourse(code: string) {
    setCourses((current) => current.filter((c) => c !== code));
  }

  function onNext() {
    update({ courses });
    router.push('/(onboarding)/volume');
  }

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          <Button title="Continue" onPress={onNext} />
          {courses.length === 0 ? (
            <Text variant="caption" tone="faint" center>
              You can add these later in settings.
            </Text>
          ) : null}
        </View>
      }
    >
      <StepHeader
        step={4}
        title="What are you taking?"
        subtitle="We use your courses to match you with people studying the same thing. Optional."
      />

      <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Course code"
              value={entry}
              onChangeText={setEntry}
              placeholder="ECO102"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              returnKeyType="done"
              onSubmitEditing={addCourse}
            />
          </View>
          <Button title="Add" onPress={addCourse} disabled={!canAdd} fullWidth={false} />
        </View>

        {courses.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {courses.map((code) => (
              <Pressable
                key={code}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${code}`}
                onPress={() => removeCourse(code)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.pill,
                  backgroundColor: theme.colors.accentSoft,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text variant="label" tone="accent">
                  {code}
                </Text>
                <Text variant="label" tone="faint">
                  ✕
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, StepHeader, TextField } from '@/components';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useTheme } from '@/theme';

export default function NameStep() {
  const theme = useTheme();
  const router = useRouter();
  const { draft, update } = useOnboarding();
  const { session } = useAuth();

  // Apple and Google hand us a name on first sign-in; use it so this step is
  // one tap. The session already exists by the time onboarding renders, so
  // this can be a plain initial value rather than an effect.
  const [firstName, setFirstName] = useState(() => {
    if (draft.firstName) return draft.firstName;
    const metadata = session?.user.user_metadata ?? {};
    const suggested = metadata.apple_given_name ?? metadata.given_name;
    return typeof suggested === 'string' ? suggested : '';
  });

  const trimmed = firstName.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 40;

  function onNext() {
    update({
      firstName: trimmed,
      // Display name defaults to the first name; the profile screen can
      // change it later without touching the rank copy, which uses firstName.
      displayName: draft.displayName.trim() || trimmed,
    });
    router.push('/(onboarding)/username');
  }

  return (
    <Screen footer={<Button title="Continue" onPress={onNext} disabled={!valid} />} scroll={false}>
      <StepHeader
        step={1}
        title="What should we call you?"
        subtitle="Your first name shows up on leaderboards and in your top weekly rank."
      />

      <View style={{ marginTop: theme.spacing.xl }}>
        <TextField
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Michael"
          autoCapitalize="words"
          autoComplete="given-name"
          autoFocus
          maxLength={40}
          returnKeyType="next"
          onSubmitEditing={() => valid && onNext()}
        />
      </View>
    </Screen>
  );
}

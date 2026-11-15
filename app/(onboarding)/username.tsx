import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, StepHeader, Text, TextField } from '@/components';
import { supabase } from '@/lib/supabase';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useTheme } from '@/theme';

type Availability = 'idle' | 'checking' | 'free' | 'taken' | 'invalid';

/** The answer we got back for one particular username. */
type CheckedName = { value: string; available: boolean };

export default function UsernameStep() {
  const theme = useTheme();
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const [username, setUsername] = useState(draft.username);
  const [checked, setChecked] = useState<CheckedName | null>(null);

  const normalised = username.trim().toLowerCase();
  const wellFormed = /^[a-z0-9_]{3,20}$/.test(normalised);

  /**
   * Availability is derived, not stored: anything we have not heard back
   * about yet is "checking". That keeps the effect below free of synchronous
   * state updates, which would cause a cascading render on every keystroke.
   */
  const state: Availability =
    normalised.length === 0
      ? 'idle'
      : !wellFormed
        ? 'invalid'
        : checked?.value === normalised
          ? checked.available
            ? 'free'
            : 'taken'
          : 'checking';

  // Debounced lookup, so we are not hitting the database on every keystroke.
  useEffect(() => {
    if (!wellFormed) return;
    if (checked?.value === normalised) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void supabase.rpc('username_available', { candidate: normalised }).then(({ data, error }) => {
        if (cancelled || error) return;
        setChecked({ value: normalised, available: !!data });
      });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalised, wellFormed, checked]);

  const message =
    state === 'invalid'
      ? '3–20 characters: letters, numbers and underscores only.'
      : state === 'taken'
        ? 'That one is taken.'
        : null;

  const hint =
    state === 'checking' ? 'Checking…' : state === 'free' ? `${normalised} is free.` : null;

  function onNext() {
    update({ username: normalised });
    router.push('/(onboarding)/school');
  }

  return (
    <Screen
      footer={<Button title="Continue" onPress={onNext} disabled={state !== 'free'} />}
      scroll={false}
    >
      <StepHeader
        step={2}
        title="Pick a username"
        subtitle="This is how friends find you. You can change it later."
      />

      <View style={{ marginTop: theme.spacing.xl }}>
        <TextField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="michael"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          maxLength={20}
          error={message}
          hint={hint}
        />
        <Text variant="caption" tone="faint" style={{ marginTop: theme.spacing.sm }}>
          Friends will search for you as @{normalised || 'username'}
        </Text>
      </View>
    </Screen>
  );
}

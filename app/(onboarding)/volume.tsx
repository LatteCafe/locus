import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Screen, StepHeader, Text, TextField } from '@/components';
import { VOLUME_OPTIONS, type VolumeLevel } from '@/config';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useTheme } from '@/theme';

const VOLUME_BLURBS: Record<VolumeLevel, string> = {
  silent: 'Pin-drop quiet. Keyboard taps are pushing it.',
  quiet: 'Low murmur. A coffee machine in the distance is fine.',
  loud: 'Buzz and chatter. You like the background noise.',
};

export default function VolumeStep() {
  const theme = useTheme();
  const { draft, update } = useOnboarding();
  const { refreshProfile } = useAuth();

  const [preferred, setPreferred] = useState<VolumeLevel>(draft.preferredVolume);
  const [referralCode, setReferralCode] = useState(draft.referralCode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish() {
    setError(null);

    // The school step always sets this, so this is a belt-and-braces guard
    // rather than something a user can reach.
    if (!draft.schoolId) {
      setError('Go back and pick your school.');
      return;
    }

    setSaving(true);
    update({ preferredVolume: preferred, referralCode });

    const { error: rpcError } = await supabase.rpc('complete_onboarding', {
      p_first_name: draft.firstName,
      p_display_name: draft.displayName || draft.firstName,
      p_username: draft.username,
      p_school_id: draft.schoolId,
      p_courses: draft.courses,
      p_preferred_volume: preferred,
      p_referral_code: referralCode.trim() ? referralCode.trim().toUpperCase() : undefined,
    });

    if (rpcError) {
      setSaving(false);
      setError(
        rpcError.message.includes('profiles_username_key')
          ? 'That username was just taken. Go back and pick another.'
          : rpcError.message
      );
      return;
    }

    // Reloading the profile flips `onboarded`, and the AuthGate takes it
    // from there.
    await refreshProfile();
    setSaving(false);
  }

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          <Button title="Start studying" onPress={onFinish} loading={saving} />
          {error ? (
            <Text variant="caption" tone="danger" center>
              {error}
            </Text>
          ) : null}
        </View>
      }
    >
      <StepHeader
        step={5}
        title="How quiet do you like it?"
        subtitle="We score places against your preference, so a silent library is not everyone's A+."
      />

      <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}>
        {VOLUME_OPTIONS.map((option) => {
          const selected = option.value === preferred;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setPreferred(option.value)}
              style={{
                padding: theme.spacing.lg,
                borderRadius: theme.radius.md,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? theme.colors.accent : theme.colors.border,
                backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
                gap: theme.spacing.xs,
              }}
            >
              <Text variant="bodyMedium">{option.label}</Text>
              <Text variant="caption" tone="muted">
                {VOLUME_BLURBS[option.value]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <TextField
          label="Referral code (optional)"
          value={referralCode}
          onChangeText={(next) => setReferralCode(next.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="ABCD2345"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
          hint="Got a code from a friend? It unlocks profile frames for them."
        />
      </View>
    </Screen>
  );
}

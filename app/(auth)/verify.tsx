import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, Text, TextField } from '@/components';
import { sendEmailCode, verifyEmailCode } from '@/lib/auth-methods';
import { useTheme } from '@/theme';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function onVerify(value: string) {
    if (!email) {
      setError('Something went wrong. Go back and enter your email again.');
      return;
    }
    setError(null);
    setChecking(true);
    const result = await verifyEmailCode(email, value);
    setChecking(false);

    // On success the auth listener picks up the new session and the AuthGate
    // moves us on, so there is nothing to navigate to here.
    if (!result.ok) {
      setError(result.message);
      setCode('');
    }
  }

  async function onResend() {
    if (!email) return;
    setError(null);
    setResending(true);
    const result = await sendEmailCode(email);
    setResending(false);
    if (result.ok) setResent(true);
    else setError(result.message);
  }

  return (
    <Screen>
      <View style={{ marginTop: theme.spacing.xxl, gap: theme.spacing.sm }}>
        <Text variant="title">Check your email</Text>
        <Text variant="body" tone="muted">
          We sent a {CODE_LENGTH}-digit code to {email ?? 'your inbox'}.
        </Text>
      </View>

      <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.md }}>
        <TextField
          label="Code"
          value={code}
          onChangeText={(next) => {
            const digits = next.replace(/\D/g, '').slice(0, CODE_LENGTH);
            setCode(digits);
            setError(null);
            // Submit as soon as the code is complete — no extra tap needed.
            if (digits.length === CODE_LENGTH) void onVerify(digits);
          }}
          placeholder="123456"
          keyboardType="number-pad"
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          maxLength={CODE_LENGTH}
          autoFocus
          error={error}
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textAlign: 'center',
            fontFamily: theme.fontFamily.mono,
          }}
        />

        <Button
          title="Continue"
          onPress={() => onVerify(code)}
          loading={checking}
          disabled={code.length !== CODE_LENGTH}
        />

        <Button
          title={resent ? 'Code sent again' : 'Send a new code'}
          variant="ghost"
          onPress={onResend}
          loading={resending}
          disabled={resent}
        />

        <Button title="Use a different email" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

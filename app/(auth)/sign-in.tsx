import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { Button, LocusLogo, Screen, Text, TextField } from '@/components';
import {
  CANCELLED,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  isAppleSignInAvailable,
  isGoogleConfigured,
  sendEmailCode,
  signInWithApple,
  signInWithGoogleIdToken,
} from '@/lib/auth-methods';
import { useTheme } from '@/theme';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [busyProvider, setBusyProvider] = useState<'apple' | 'google' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    void isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  // Google OAuth, which needs hooks and so lives in the screen. We read the
  // result from promptAsync rather than watching the response, which keeps
  // all the state updates inside an event handler.
  const [googleRequest, , promptGoogle] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    clientId: GOOGLE_WEB_CLIENT_ID || undefined,
  });

  async function onSendCode() {
    setError(null);
    setSending(true);
    const result = await sendEmailCode(email);
    setSending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push({ pathname: '/(auth)/verify', params: { email: email.trim().toLowerCase() } });
  }

  async function onApple() {
    setError(null);
    setBusyProvider('apple');
    const result = await signInWithApple();
    setBusyProvider(null);
    if (!result.ok && result.message !== CANCELLED) setError(result.message);
  }

  async function onGoogle() {
    setError(null);
    setBusyProvider('google');

    const response = await promptGoogle();

    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) {
        setError('Google did not return a sign-in token.');
        setBusyProvider(null);
        return;
      }
      const result = await signInWithGoogleIdToken(idToken);
      if (!result.ok) setError(result.message);
    } else if (response.type === 'error') {
      setError('Google sign-in failed.');
    }
    // 'dismiss' and 'cancel' mean the user backed out; say nothing.

    setBusyProvider(null);
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: theme.spacing.xxxl, gap: theme.spacing.lg }}>
        <LocusLogo size={88} />
        <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
          <Text variant="display">Locus</Text>
          <Text variant="body" tone="muted" center>
            Find a spot. Start the clock.
          </Text>
        </View>
      </View>

      <View style={{ marginTop: theme.spacing.xxxl, gap: theme.spacing.md }}>
        <TextField
          label="Email"
          value={email}
          onChangeText={(next) => {
            setEmail(next);
            setError(null);
          }}
          placeholder="you@mail.utoronto.ca"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={onSendCode}
          error={error}
        />

        <Button
          title="Email me a code"
          onPress={onSendCode}
          loading={sending}
          disabled={email.trim().length === 0}
        />
      </View>

      {appleAvailable || isGoogleConfigured ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            marginVertical: theme.spacing.xl,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
          <Text variant="caption" tone="faint">
            or
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
        </View>
      ) : null}

      <View style={{ gap: theme.spacing.md }}>
        {appleAvailable ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={
              theme.isDark
                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={theme.radius.md}
            style={{ height: theme.hitSize.control }}
            onPress={onApple}
          />
        ) : null}

        {isGoogleConfigured ? (
          <Button
            title="Continue with Google"
            variant="secondary"
            onPress={onGoogle}
            disabled={!googleRequest}
            loading={busyProvider === 'google'}
          />
        ) : null}
      </View>

      <Text variant="caption" tone="faint" center style={{ marginTop: theme.spacing.xl }}>
        By continuing you agree to our Terms and Privacy Policy.
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: theme.spacing.lg,
          marginTop: theme.spacing.sm,
        }}
      >
        <Button
          title="Terms"
          variant="ghost"
          fullWidth={false}
          onPress={() => router.push('/settings/terms')}
        />
        <Button
          title="Privacy"
          variant="ghost"
          fullWidth={false}
          onPress={() => router.push('/settings/privacy')}
        />
      </View>

      {Platform.OS === 'ios' && !appleAvailable ? (
        <Text variant="caption" tone="faint" center style={{ marginTop: theme.spacing.md }}>
          Sign in with Apple needs a device build — it does not work in the simulator.
        </Text>
      ) : null}
    </Screen>
  );
}

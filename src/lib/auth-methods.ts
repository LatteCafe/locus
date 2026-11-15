/**
 * The three ways into Locus: a one-time code by email, Sign in with Apple,
 * and Sign in with Google.
 *
 * Each returns a plain result object instead of throwing, so screens can show
 * a message without a try/catch around every call.
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export type AuthResult = { ok: true } | { ok: false; message: string };

/** Signals the user closed the sheet themselves — not an error worth showing. */
export const CANCELLED = 'cancelled';
export type CancellableResult = AuthResult | { ok: false; message: typeof CANCELLED };

function messageFor(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const raw = String((error as { message: unknown }).message);
    // Supabase's rate-limit copy is unhelpfully technical.
    if (raw.includes('rate limit') || raw.includes('For security purposes')) {
      return 'Too many tries. Wait a minute and try again.';
    }
    if (raw.includes('Invalid login credentials') || raw.includes('Token has expired')) {
      return 'That code is wrong or has expired. Request a new one.';
    }
    return raw;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Email one-time code
// ---------------------------------------------------------------------------

export async function sendEmailCode(email: string): Promise<AuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: 'That does not look like an email address.' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      // New users are created on first sign-in; there is no separate signup.
      shouldCreateUser: true,
    },
  });

  if (error) return { ok: false, message: messageFor(error, 'Could not send the code.') };
  return { ok: true };
}

export async function verifyEmailCode(email: string, code: string): Promise<AuthResult> {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: code.trim(),
    type: 'email',
  });

  if (error) return { ok: false, message: messageFor(error, 'Could not check that code.') };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sign in with Apple
// ---------------------------------------------------------------------------

export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<CancellableResult> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { ok: false, message: 'Apple did not return a sign-in token.' };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) return { ok: false, message: messageFor(error, 'Apple sign-in failed.') };

    // Apple sends the user's name only on the very first authorisation, so we
    // stash it now for onboarding to prefill. It is not authoritative.
    const givenName = credential.fullName?.givenName ?? null;
    if (givenName) {
      await supabase.auth.updateUser({ data: { apple_given_name: givenName } });
    }

    return { ok: true };
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'ERR_REQUEST_CANCELED'
    ) {
      return { ok: false, message: CANCELLED };
    }
    return { ok: false, message: messageFor(error, 'Apple sign-in failed.') };
  }
}

// ---------------------------------------------------------------------------
// Sign in with Google
//
// The screen drives the OAuth request with expo-auth-session's Google
// provider (it needs hooks, so it cannot live here); this takes the id_token
// that comes back and hands it to Supabase.
// ---------------------------------------------------------------------------

export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

/** Google is only offered once the client IDs are configured. */
export const isGoogleConfigured = !!(GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID);

export async function signInWithGoogleIdToken(idToken: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) return { ok: false, message: messageFor(error, 'Google sign-in failed.') };
  return { ok: true };
}

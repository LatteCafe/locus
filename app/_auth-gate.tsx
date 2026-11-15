import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/providers/AuthProvider';

/**
 * Sends the user to the right part of the app for their state:
 *
 *   no session            -> (auth)
 *   session, no profile   -> (onboarding)
 *   session and onboarded -> (tabs)
 *
 * Keeping this in one place means no individual screen has to guard itself.
 * It renders nothing.
 */
export function AuthGate() {
  const { initialising, session, onboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initialising) return;

    const group = segments[0];
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (!session) {
      if (!inAuth) router.replace('/(auth)/sign-in');
      return;
    }

    if (!onboarded) {
      if (!inOnboarding) router.replace('/(onboarding)/name');
      return;
    }

    if (inAuth || inOnboarding) router.replace('/(tabs)');
  }, [initialising, session, onboarded, segments, router]);

  return null;
}

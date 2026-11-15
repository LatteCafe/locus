import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthState = {
  /** True until we know whether there is a stored session. */
  initialising: boolean;
  session: Session | null;
  profile: Profile | null;
  /** True once the user has been through onboarding. */
  onboarded: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialising, setInitialising] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // A missing profile is not fatal: the signup trigger may not have run
      // yet, and the next refresh will pick it up.
      console.warn('[auth] could not load profile:', error.message);
      return;
    }
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    // Whatever session is already on the device.
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      if (active) setInitialising(false);
    });

    // And every change from here on: sign-in, sign-out, token refresh.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
      } else {
        void loadProfile(nextSession.user.id);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user.id);
  }, [loadProfile, session?.user.id]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    // `session_not_found` just means the server already forgot us, which is
    // the state we were aiming for anyway.
    if (error && !error.message.includes('session')) throw error;
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      initialising,
      session,
      profile,
      onboarded: !!profile?.onboarding_completed_at,
      refreshProfile,
      signOut,
    }),
    [initialising, session, profile, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

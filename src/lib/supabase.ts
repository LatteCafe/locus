import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Copy .env.example to .env and fill in ' +
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart ' +
      'the dev server with `npx expo start --clear`.'
  );
}

/**
 * The one Supabase client for the app.
 *
 * The session is kept in AsyncStorage, which is what Supabase's React Native
 * guide uses. It is not encrypted at rest, so if we later decide the refresh
 * token needs hardware-backed storage, the change is to swap this `storage`
 * adapter for a chunked expo-secure-store one (SecureStore caps a value at
 * 2 KB, and a Supabase session is larger, hence the chunking).
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // There is no URL to read a session out of in a native app; leaving this
    // on makes the client hang about waiting for one.
    detectSessionInUrl: false,
  },
});

/**
 * Supabase refreshes tokens on a timer, which iOS and Android suspend in the
 * background. Tying the timer to foreground state keeps sessions alive.
 */
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}

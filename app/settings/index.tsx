import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';

import { Button, Screen, Text } from '@/components';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme';

function LinkRow({
  label,
  detail,
  onPress,
}: {
  label: string;
  detail?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: theme.hitSize.control,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
      })}
    >
      <Text variant="body">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        {detail ? (
          <Text variant="caption" tone="faint">
            {detail}
          </Text>
        ) : null}
        <Text variant="body" tone="faint">
          ›
        </Text>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, signOut, refreshProfile } = useAuth();

  const [sharing, setSharing] = useState(!!profile?.location_sharing);
  const [savingSharing, setSavingSharing] = useState(false);

  async function onToggleSharing(next: boolean) {
    // Optimistic, then reverted if the write fails — the switch should feel
    // instant.
    setSharing(next);
    setSavingSharing(true);
    const { error } = await supabase
      .from('profiles')
      .update({ location_sharing: next })
      .eq('id', profile!.id);
    setSavingSharing(false);

    if (error) {
      setSharing(!next);
      Alert.alert('Could not save that', error.message);
      return;
    }
    await refreshProfile();
  }

  function onSignOut() {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut().catch((error: Error) => Alert.alert('Could not sign out', error.message));
        },
      },
    ]);
  }

  return (
    <Screen>
      <Text variant="overline" tone="muted" style={{ marginTop: theme.spacing.md }}>
        PRIVACY
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <Text variant="body">Share sessions with friends</Text>
          <Text variant="caption" tone="muted">
            Lets accepted friends see where you are studying. Off means nobody sees it, ever.
            Leaderboards only ever show hours.
          </Text>
        </View>
        <Switch
          value={sharing}
          onValueChange={onToggleSharing}
          disabled={savingSharing || !profile}
          trackColor={{ true: theme.colors.accent, false: theme.colors.borderStrong }}
        />
      </View>

      <Text variant="overline" tone="muted" style={{ marginTop: theme.spacing.xl }}>
        ABOUT
      </Text>
      <LinkRow label="Privacy Policy" onPress={() => router.push('/settings/privacy')} />
      <LinkRow label="Terms of Use" onPress={() => router.push('/settings/terms')} />

      <Text variant="overline" tone="muted" style={{ marginTop: theme.spacing.xl }}>
        ACCOUNT
      </Text>
      <LinkRow label="Delete my account" onPress={() => router.push('/settings/delete-account')} />

      <View style={{ marginTop: theme.spacing.xl }}>
        <Button title="Sign out" variant="secondary" onPress={onSignOut} />
      </View>
    </Screen>
  );
}

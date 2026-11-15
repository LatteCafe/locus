import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components';
import { schoolById, VOLUME_OPTIONS } from '@/config';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme';

function Row({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
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
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="body" style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, session } = useAuth();

  const school = schoolById(profile?.school_id);
  const volume = VOLUME_OPTIONS.find((o) => o.value === profile?.preferred_volume);

  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.lg }}>
        <Text variant="display">{profile?.display_name ?? 'Your profile'}</Text>
        <Text variant="body" tone="muted">
          @{profile?.username ?? '…'}
        </Text>
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <Row label="Email" value={session?.user.email ?? '—'} />
        <Row label="School" value={school?.shortName ?? '—'} />
        <Row
          label="Courses"
          value={profile?.courses?.length ? profile.courses.join(', ') : 'None yet'}
        />
        <Row label="Prefers" value={volume?.label ?? '—'} />
        <Row label="Referral code" value={profile?.referral_code ?? '—'} />
        <Row label="Location sharing" value={profile?.location_sharing ? 'On' : 'Off'} />
      </View>

      <View style={{ marginTop: theme.spacing.xl }}>
        <Button title="Settings" variant="secondary" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}

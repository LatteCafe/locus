import React from 'react';
import { View } from 'react-native';

import { LocusLogo, Screen, Text } from '@/components';
import { rankDisplayName, rankForHours } from '@/config';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { profile } = useAuth();

  // Nothing has been studied yet, so this is everyone's starting rank.
  const rank = rankForHours(0);

  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.lg }}>
        <Text variant="caption" tone="muted">
          Welcome to Locus
        </Text>
        <Text variant="display">Hi {profile?.first_name ?? 'there'}</Text>
      </View>

      <View
        style={{
          marginTop: theme.spacing.xl,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          gap: theme.spacing.sm,
        }}
      >
        <Text variant="overline" tone="muted">
          THIS WEEK
        </Text>
        <Text variant="heading">{rankDisplayName(rank, profile?.first_name)}</Text>
        <Text variant="caption" tone="muted">
          {rank.description}
        </Text>
        <Text variant="caption" tone="faint">
          0 hours studied
        </Text>
      </View>

      <View
        style={{
          marginTop: theme.spacing.xl,
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.xxl,
        }}
      >
        <LocusLogo size={56} />
        <Text variant="body" tone="muted" center>
          The map and check-in arrive in the next phase.
        </Text>
      </View>
    </Screen>
  );
}

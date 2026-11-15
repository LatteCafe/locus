import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

/**
 * The letter grade badge. An ungraded place shows a dash rather than an F —
 * "nobody has rated this" and "this is bad" are different things.
 */
export function GradePill({
  grade,
  score,
  size = 'medium',
}: {
  grade: string | null;
  score: number | null;
  size?: 'medium' | 'large';
}) {
  const theme = useTheme();
  const large = size === 'large';

  return (
    <View
      style={{
        minWidth: large ? 72 : 46,
        paddingVertical: large ? theme.spacing.md : theme.spacing.sm,
        paddingHorizontal: large ? theme.spacing.md : theme.spacing.sm,
        borderRadius: theme.radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: grade ? theme.colors.accentSoft : theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text
        variant={large ? 'display' : 'heading'}
        tone={grade ? 'accent' : 'faint'}
        style={{ fontFamily: theme.fontFamily.mono }}
      >
        {grade ?? '–'}
      </Text>
      {large && score !== null ? (
        <Text variant="caption" tone="muted">
          {score}/100
        </Text>
      ) : null}
    </View>
  );
}

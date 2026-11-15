import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

/** One crowd attribute: a label, a 1–5 bar, and the number. */
export function AttributeBar({
  label,
  value,
  caption,
}: {
  label: string;
  /** 1–5, or null when nobody has rated it. */
  value: number | null;
  caption?: string | null;
}) {
  const theme = useTheme();
  const fraction = value === null ? 0 : Math.max(0, Math.min(1, (value - 1) / 4));

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="label" tone="muted">
          {label}
        </Text>
        <Text variant="label" tone={value === null ? 'faint' : 'default'}>
          {caption ?? (value === null ? 'No data' : value.toFixed(1))}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surfaceAlt,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${fraction * 100}%`,
            height: '100%',
            borderRadius: theme.radius.pill,
            backgroundColor: value === null ? 'transparent' : theme.colors.accent,
          }}
        />
      </View>
    </View>
  );
}

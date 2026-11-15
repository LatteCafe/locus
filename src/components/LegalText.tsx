import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type LegalSection = { heading: string; body: string[] };

/** Renders a legal document as headings and paragraphs. */
export function LegalText({
  updated,
  intro,
  sections,
}: {
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xl, marginTop: theme.spacing.md }}>
      <View
        style={{
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.accentSoft,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text variant="caption" tone="muted">
          Placeholder text. This needs to be replaced with a lawyer-reviewed document before Locus
          goes on the App Store.
        </Text>
      </View>

      <Text variant="caption" tone="faint">
        Last updated {updated}
      </Text>

      {intro ? (
        <Text variant="body" tone="muted">
          {intro}
        </Text>
      ) : null}

      {sections.map((section) => (
        <View key={section.heading} style={{ gap: theme.spacing.sm }}>
          <Text variant="heading">{section.heading}</Text>
          {section.body.map((paragraph, index) => (
            <Text key={index} variant="body" tone="muted">
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

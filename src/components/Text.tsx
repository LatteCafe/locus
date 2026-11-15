import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { TypographyVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  /** Picks a colour from the theme. Defaults to primary text. */
  tone?: 'default' | 'muted' | 'faint' | 'accent' | 'danger' | 'success' | 'onAccent';
  center?: boolean;
};

const toneToColorKey = {
  default: 'text',
  muted: 'textMuted',
  faint: 'textFaint',
  accent: 'accent',
  danger: 'danger',
  success: 'success',
  onAccent: 'onAccent',
} as const;

/**
 * Every piece of text in the app goes through here, so type styles and
 * colours stay in the theme rather than scattered across screens.
 */
export function Text({ variant = 'body', tone = 'default', center, style, ...rest }: TextProps) {
  const theme = useTheme();

  const base: TextStyle = {
    ...theme.typography[variant],
    color: theme.colors[toneToColorKey[tone]],
    fontFamily: theme.fontFamily.regular,
  };

  return <RNText {...rest} style={[base, center && { textAlign: 'center' }, style]} />;
}

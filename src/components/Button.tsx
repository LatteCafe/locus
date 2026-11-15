import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  /** Renders an icon or similar to the left of the label. */
  leading?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  leading,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      background: theme.colors.accent,
      pressed: theme.colors.accentPressed,
      border: 'transparent',
      tone: 'onAccent' as const,
    },
    secondary: {
      background: theme.colors.surface,
      pressed: theme.colors.surfaceAlt,
      border: theme.colors.border,
      tone: 'default' as const,
    },
    ghost: {
      background: 'transparent',
      pressed: theme.colors.surfaceAlt,
      border: 'transparent',
      tone: 'accent' as const,
    },
    danger: {
      background: theme.colors.danger,
      pressed: theme.colors.danger,
      border: 'transparent',
      tone: 'onAccent' as const,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          minHeight: theme.hitSize.control,
          borderRadius: theme.radius.md,
          borderWidth: palette.border === 'transparent' ? 0 : 1,
          borderColor: palette.border,
          backgroundColor: pressed ? palette.pressed : palette.background,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'danger'
              ? theme.colors.onAccent
              : theme.colors.accent
          }
        />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text variant="bodyMedium" tone={palette.tone}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

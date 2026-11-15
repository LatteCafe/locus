import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type TextFieldProps = TextInputProps & {
  label?: string;
  /** Shown in red under the field. */
  error?: string | null;
  /** Shown in grey under the field when there is no error. */
  hint?: string | null;
};

export function TextField({ label, error, hint, style, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      ) : null}

      <TextInput
        placeholderTextColor={theme.colors.textFaint}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          {
            minHeight: theme.hitSize.control,
            borderWidth: 1,
            borderColor: error
              ? theme.colors.danger
              : focused
                ? theme.colors.accent
                : theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            color: theme.colors.text,
            fontSize: theme.typography.body.fontSize,
          },
          style,
        ]}
        {...rest}
      />

      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

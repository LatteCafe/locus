import React from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export type ScreenProps = {
  children: React.ReactNode;
  /** Wraps the content in a ScrollView. On by default. */
  scroll?: boolean;
  /** Removes the default horizontal padding, e.g. for a full-bleed map. */
  bleed?: boolean;
  /** Pins content to the bottom of the screen as well as the top. */
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Standard screen frame: themed background, safe-area insets, consistent
 * gutters. Screens should not set their own background colour.
 */
export function Screen({ children, scroll = true, bleed = false, footer, style }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const padding = bleed ? 0 : theme.spacing.lg;

  const content = (
    <View style={[{ flex: scroll ? undefined : 1, paddingHorizontal: padding }, style]}>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xxl,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}

      {footer ? (
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

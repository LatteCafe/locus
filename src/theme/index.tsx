import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { ColorScheme, darkColors, lightColors } from './colors';
import { fontFamily, fontWeight, hitSize, radius, shadow, spacing, typography } from './tokens';

export type Theme = {
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  fontFamily: typeof fontFamily;
  fontWeight: typeof fontWeight;
  shadow: typeof shadow;
  hitSize: typeof hitSize;
  isDark: boolean;
};

function buildTheme(isDark: boolean): Theme {
  return {
    colors: isDark ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    fontFamily,
    fontWeight,
    shadow,
    hitSize,
    isDark,
  };
}

const ThemeContext = createContext<Theme>(buildTheme(false));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = useMemo(() => buildTheme(isDark), [isDark]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export * from './colors';
export * from './tokens';

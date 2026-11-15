import { Platform } from 'react-native';

/** 4pt spacing scale. Use these instead of raw numbers. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/**
 * System fonts for now. When we ship a custom typeface, load it in
 * `_layout.tsx` and change the families here only.
 */
export const fontFamily = {
  regular: Platform.select({ ios: 'System', default: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', default: 'sans-serif-medium' }),
  /** Used for transcript / score numerals. */
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Named text styles. Every bit of text in the app should use one of these. */
export const typography = {
  /** Big screen titles. */
  display: { fontSize: 32, lineHeight: 38, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: fontWeight.bold, letterSpacing: -0.3 },
  heading: { fontSize: 19, lineHeight: 25, fontWeight: fontWeight.semibold },
  body: { fontSize: 16, lineHeight: 23, fontWeight: fontWeight.regular },
  bodyMedium: { fontSize: 16, lineHeight: 23, fontWeight: fontWeight.medium },
  label: { fontSize: 14, lineHeight: 19, fontWeight: fontWeight.medium },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: fontWeight.regular },
  /** ALL CAPS section labels. */
  overline: { fontSize: 11, lineHeight: 15, fontWeight: fontWeight.semibold, letterSpacing: 0.8 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Soft shadow for cards. Subtle — the design leans on hairlines, not depth. */
export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
    default: {},
  }),
} as const;

/** Standard tappable height — keeps touch targets accessible. */
export const hitSize = {
  control: 48,
  compact: 36,
} as const;

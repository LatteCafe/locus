/**
 * Locus color palette.
 *
 * Mostly neutral "paper and ink", with a single warm coffee-brown accent.
 * Edit the values here to restyle the whole app.
 */

export type ColorScheme = {
  /** Page background. */
  background: string;
  /** Cards, sheets, raised surfaces. */
  surface: string;
  /** Secondary fills: input backgrounds, chips, table stripes. */
  surfaceAlt: string;
  /** Primary text. */
  text: string;
  /** Secondary text: labels, captions. */
  textMuted: string;
  /** Tertiary text: placeholders, disabled. */
  textFaint: string;
  /** Hairlines and dividers. */
  border: string;
  /** Stronger border, e.g. focused input. */
  borderStrong: string;
  /** The one accent: coffee brown. */
  accent: string;
  /** Pressed / darker accent. */
  accentPressed: string;
  /** Tinted accent background for chips and badges. */
  accentSoft: string;
  /** Text that sits on top of `accent`. */
  onAccent: string;
  success: string;
  warning: string;
  danger: string;
  /** Scrim behind modals. */
  overlay: string;
};

export const lightColors: ColorScheme = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F2EDE6',
  text: '#1A1715',
  textMuted: '#6B625B',
  textFaint: '#9C938B',
  border: '#E6DFD6',
  borderStrong: '#CFC5B9',
  accent: '#6F4E37',
  accentPressed: '#5A3F2C',
  accentSoft: '#F0E6DB',
  onAccent: '#FFFFFF',
  success: '#2F7D52',
  warning: '#B5781F',
  danger: '#B3392F',
  overlay: 'rgba(26, 23, 21, 0.45)',
};

export const darkColors: ColorScheme = {
  background: '#131110',
  surface: '#1D1A18',
  surfaceAlt: '#272321',
  text: '#F6F2ED',
  textMuted: '#A9A098',
  textFaint: '#776F69',
  border: '#332E2A',
  borderStrong: '#4A433E',
  accent: '#C08B5C',
  accentPressed: '#A87648',
  accentSoft: '#2B221B',
  onAccent: '#1A1310',
  success: '#5FBE86',
  warning: '#DFA64A',
  danger: '#E2695D',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

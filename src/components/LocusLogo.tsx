import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

export type LocusLogoProps = {
  size?: number;
  /** Overrides the accent colour used for the ring and hands. */
  color?: string;
};

/**
 * Placeholder Locus mark: a coffee ring stain with clock hands in the middle.
 *
 * Drawn as a deliberately uneven ring — a traced circle would read as a
 * target, not a cup mark. Replace this whole component when the real asset
 * arrives; nothing else depends on its internals.
 */
export function LocusLogo({ size = 64, color }: LocusLogoProps) {
  const theme = useTheme();
  const ink = color ?? theme.colors.accent;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityRole="image">
      {/* Outer stain: a wobbling ring, heavier on the lower left the way a
          lifted cup leaves more coffee behind. */}
      <Path
        d="M50 8
           C72 8 92 26 92 49
           C92 73 73 92 50 92
           C27 92 8 74 8 50
           C8 27 28 8 50 8 Z"
        stroke={ink}
        strokeOpacity={0.28}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      {/* A second, offset pass gives the edge the uneven darkness of a stain. */}
      <Path
        d="M50 11
           C70 12 89 28 89 50
           C89 71 71 89 50 89"
        stroke={ink}
        strokeOpacity={0.5}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M14 58
           C17 75 32 88 50 89"
        stroke={ink}
        strokeOpacity={0.35}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />

      {/* Clock hands: ten past ten, the friendliest time on a clock face. */}
      <Line x1="50" y1="50" x2="50" y2="27" stroke={ink} strokeWidth={5} strokeLinecap="round" />
      <Line x1="50" y1="50" x2="66" y2="60" stroke={ink} strokeWidth={5} strokeLinecap="round" />
      <Circle cx="50" cy="50" r="4" fill={ink} />
    </Svg>
  );
}

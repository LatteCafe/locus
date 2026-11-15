import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { PlaceCategory } from '@/config';
import { useTheme } from '@/theme';

/**
 * Six small category glyphs, drawn rather than imported: an icon font would
 * be a whole dependency for shapes this simple, and these inherit the theme.
 * All are drawn on a 24x24 grid with a 2px stroke.
 */
export function CategoryIcon({
  category,
  size = 20,
  color,
}: {
  category: PlaceCategory;
  size?: number;
  color?: string;
}) {
  const theme = useTheme();
  const ink = color ?? theme.colors.accent;
  const stroke = { stroke: ink, strokeWidth: 2, fill: 'none' as const };
  const round = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {category === 'library' ? (
        // An open book.
        <>
          <Path d="M12 6.5 C10 5 7 4.5 4 5 L4 18 C7 17.5 10 18 12 19.5" {...stroke} {...round} />
          <Path
            d="M12 6.5 C14 5 17 4.5 20 5 L20 18 C17 17.5 14 18 12 19.5"
            {...stroke}
            {...round}
          />
          <Path d="M12 6.5 L12 19.5" {...stroke} {...round} />
        </>
      ) : null}

      {category === 'cafe' ? (
        // A cup with a handle and a wisp of steam.
        <>
          <Path
            d="M5 9 L17 9 L17 15 A4 4 0 0 1 13 19 L9 19 A4 4 0 0 1 5 15 Z"
            {...stroke}
            {...round}
          />
          <Path d="M17 10.5 L19 10.5 A2.5 2.5 0 0 1 19 15.5 L17 15.5" {...stroke} {...round} />
          <Path d="M9 3 C9 4.5 10.5 4.5 10.5 6" {...stroke} {...round} />
          <Path d="M13 3 C13 4.5 14.5 4.5 14.5 6" {...stroke} {...round} />
        </>
      ) : null}

      {category === 'dining_hall' ? (
        // Fork and knife.
        <>
          <Path d="M8 3 L8 11 M6 3 L6 7 A2 2 0 0 0 10 7 L10 3" {...stroke} {...round} />
          <Path d="M8 11 L8 21" {...stroke} {...round} />
          <Path d="M16 3 C18 5 18 9 16 11 L16 21" {...stroke} {...round} />
        </>
      ) : null}

      {category === 'classroom' ? (
        // A board on legs.
        <>
          <Rect x="3" y="4" width="18" height="12" rx="1.5" {...stroke} />
          <Path d="M12 16 L12 20 M8 20 L16 20" {...stroke} {...round} />
          <Path d="M7 8 L13 8 M7 11.5 L11 11.5" {...stroke} {...round} />
        </>
      ) : null}

      {category === 'coworking' ? (
        // A laptop.
        <>
          <Path d="M6 6 L18 6 L18 15 L6 15 Z" {...stroke} {...round} />
          <Path d="M3 18 L21 18" {...stroke} {...round} />
          <Path d="M6 15 L3 18 M18 15 L21 18" {...stroke} {...round} />
        </>
      ) : null}

      {category === 'outdoor' ? (
        // A tree.
        <>
          <Circle cx="12" cy="9" r="5.5" {...stroke} />
          <Path d="M12 14.5 L12 21" {...stroke} {...round} />
          <Path d="M12 17.5 L9 15 M12 18.5 L15 16" {...stroke} {...round} />
        </>
      ) : null}
    </Svg>
  );
}

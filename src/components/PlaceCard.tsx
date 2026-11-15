import React from 'react';
import { Pressable, View } from 'react-native';

import { categoryLabel } from '@/config';
import { formatDistance, walkingMinutes } from '@/lib/geo';
import { openStateLabel } from '@/lib/hours';
import type { Place } from '@/lib/places';
import { useTheme } from '@/theme';

import { CategoryIcon } from './CategoryIcon';
import { GradePill } from './GradePill';
import { Text } from './Text';

/** One place in a list: grade, category, distance and whether it is open. */
export function PlaceCard({ place, onPress }: { place: Place; onPress: () => void }) {
  const theme = useTheme();

  const distance = formatDistance(place.distanceM);
  const walk = place.distanceM !== null ? `${walkingMinutes(place.distanceM)} min walk` : null;

  const openTone =
    place.openState.status === 'open'
      ? place.openState.closingSoon
        ? 'warning'
        : 'success'
      : place.openState.status === 'closed'
        ? 'danger'
        : 'faint';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${categoryLabel(place.category)}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.sm,
          backgroundColor: theme.colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CategoryIcon category={place.category} size={22} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {place.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Text
            variant="caption"
            tone={openTone === 'warning' ? 'default' : (openTone as 'success' | 'danger' | 'faint')}
            style={openTone === 'warning' ? { color: theme.colors.warning } : undefined}
          >
            {openStateLabel(place.openState)}
          </Text>
          {distance ? (
            <Text variant="caption" tone="faint">
              · {distance}
            </Text>
          ) : null}
        </View>

        <Text variant="caption" tone="faint" numberOfLines={1}>
          {categoryLabel(place.category)}
          {walk ? ` · ${walk}` : ''}
          {place.stats.rating_count > 0
            ? ` · ${place.stats.rating_count} rating${place.stats.rating_count === 1 ? '' : 's'}`
            : ' · Not graded yet'}
        </Text>
      </View>

      <GradePill grade={place.grade} score={place.score} />
    </Pressable>
  );
}

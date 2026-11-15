import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';

import { Button, CategoryIcon, PlaceCard, Screen, Text } from '@/components';
import { PLACE_CATEGORIES, type PlaceCategory } from '@/config';
import { usePlaces } from '@/hooks/usePlaces';
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  recommendPlaces,
  type PlaceFilters,
} from '@/lib/recommendations';
import { useTheme } from '@/theme';

function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.pill,
        backgroundColor: active ? theme.colors.accent : theme.colors.surface,
        borderWidth: 1,
        borderColor: active ? theme.colors.accent : theme.colors.border,
      }}
    >
      {icon}
      <Text variant="caption" tone={active ? 'onAccent' : 'default'}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { places, loading, error, userLocation, locationDenied, refresh } = usePlaces();

  const [filters, setFilters] = useState<PlaceFilters>(DEFAULT_FILTERS);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const results = useMemo(() => recommendPlaces(places, filters), [places, filters]);

  function toggleCategory(category: PlaceCategory) {
    setFilters((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((c) => c !== category)
        : [...current.categories, category],
    }));
  }

  const header = (
    <View style={{ gap: theme.spacing.md, paddingBottom: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
        <Text variant="display">Where to?</Text>
        <Text variant="body" tone="muted">
          {filters.openNow ? 'Open right now' : 'All spots'}
          {userLocation ? ', closest and best first' : ''}
        </Text>
      </View>

      {locationDenied ? (
        <Pressable
          onPress={refresh}
          style={{
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.accentSoft,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text variant="caption" tone="muted">
            Location is off, so these are sorted by rating alone. Tap to turn it on.
          </Text>
        </Pressable>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.xs }}
      >
        <Chip
          label="Open now"
          active={filters.openNow}
          onPress={() => setFilters((c) => ({ ...c, openNow: !c.openNow }))}
        />
        <Chip
          label="Fast wifi"
          active={filters.wifi === 'fast'}
          onPress={() => setFilters((c) => ({ ...c, wifi: c.wifi === 'fast' ? 'any' : 'fast' }))}
        />
        <Chip
          label="Food"
          active={filters.hasFood}
          onPress={() => setFilters((c) => ({ ...c, hasFood: !c.hasFood }))}
        />
        <Chip
          label="Roomy"
          active={filters.minSpace !== null}
          onPress={() => setFilters((c) => ({ ...c, minSpace: c.minSpace === null ? 4 : null }))}
        />
        <Chip
          label="Walkable"
          active={filters.maxDistanceM !== null}
          onPress={() =>
            setFilters((c) => ({ ...c, maxDistanceM: c.maxDistanceM === null ? 800 : null }))
          }
        />
        <Chip
          label={showAllFilters ? 'Fewer' : 'Category'}
          active={filters.categories.length > 0}
          onPress={() => setShowAllFilters((v) => !v)}
        />
      </ScrollView>

      {showAllFilters ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {PLACE_CATEGORIES.map((category) => (
            <Chip
              key={category.id}
              label={category.plural}
              active={filters.categories.includes(category.id)}
              onPress={() => toggleCategory(category.id)}
              icon={
                <CategoryIcon
                  category={category.id}
                  size={15}
                  color={
                    filters.categories.includes(category.id)
                      ? theme.colors.onAccent
                      : theme.colors.accent
                  }
                />
              }
            />
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="caption" tone="faint">
          {loading ? 'Loading…' : `${results.length} spot${results.length === 1 ? '' : 's'}`}
        </Text>
        {activeFilterCount(filters) > 0 ? (
          <Pressable onPress={() => setFilters(DEFAULT_FILTERS)}>
            <Text variant="caption" tone="accent">
              Reset filters
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  if (loading && places.length === 0) {
    return (
      <Screen scroll={false}>
        {header}
        <View style={{ paddingVertical: theme.spacing.xxxl, alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={results}
        keyExtractor={(place) => place.id}
        ListHeaderComponent={header}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
          gap: theme.spacing.sm,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.accent}
          />
        }
        renderItem={({ item }) => (
          <PlaceCard place={item} onPress={() => router.push(`/place/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              gap: theme.spacing.md,
              paddingVertical: theme.spacing.xxl,
            }}
          >
            <Text variant="body" tone="muted" center>
              {error
                ? 'Could not load study spots.'
                : places.length === 0
                  ? 'No study spots yet. Has the seed script been run?'
                  : 'Nothing matches those filters.'}
            </Text>
            <Button
              title={error ? 'Try again' : 'Reset filters'}
              variant="secondary"
              fullWidth={false}
              onPress={() => (error ? refresh() : setFilters(DEFAULT_FILTERS))}
            />
          </View>
        }
      />
    </View>
  );
}

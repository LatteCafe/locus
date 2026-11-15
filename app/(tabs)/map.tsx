import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryIcon, PlaceCard, Text } from '@/components';
import { DEFAULT_SCHOOL, PLACE_CATEGORIES, type PlaceCategory } from '@/config';
import { usePlaces } from '@/hooks/usePlaces';
import { useTheme } from '@/theme';

export default function MapScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { places, loading, error, userLocation, refresh } = usePlaces({ requestLocation: true });

  const [selectedCategories, setSelectedCategories] = useState<PlaceCategory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      selectedCategories.length === 0
        ? places
        : places.filter((p) => selectedCategories.includes(p.category)),
    [places, selectedCategories]
  );

  const selected = useMemo(
    () => visible.find((p) => p.id === selectedId) ?? null,
    [visible, selectedId]
  );

  function toggleCategory(category: PlaceCategory) {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category]
    );
    setSelectedId(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MapView
        // Apple Maps on iOS, Google Maps on Android, per the stack decision.
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: DEFAULT_SCHOOL.center.lat,
          longitude: DEFAULT_SCHOOL.center.lng,
          latitudeDelta: 0.022,
          longitudeDelta: 0.022,
        }}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        onPress={() => setSelectedId(null)}
      >
        {visible.map((place) => {
          const isSelected = place.id === selectedId;
          const isOpen = place.openState.status === 'open';
          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              onPress={() => setSelectedId(place.id)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={{
                  width: isSelected ? 42 : 34,
                  height: isSelected ? 42 : 34,
                  borderRadius: theme.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.surface,
                  borderWidth: isSelected ? 2.5 : 1.5,
                  borderColor: isSelected ? theme.colors.accent : theme.colors.borderStrong,
                  // Closed places fade back rather than disappear.
                  opacity: isOpen || place.openState.status === 'unknown' ? 1 : 0.55,
                  ...theme.shadow.card,
                }}
              >
                <CategoryIcon category={place.category} size={isSelected ? 24 : 19} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Category filter strip */}
      <View style={{ position: 'absolute', top: insets.top + theme.spacing.sm, left: 0, right: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}
        >
          {PLACE_CATEGORIES.map((category) => {
            const active = selectedCategories.includes(category.id);
            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => toggleCategory(category.id)}
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
                  ...theme.shadow.card,
                }}
              >
                <CategoryIcon
                  category={category.id}
                  size={16}
                  color={active ? theme.colors.onAccent : theme.colors.accent}
                />
                <Text variant="caption" tone={active ? 'onAccent' : 'default'}>
                  {category.plural}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Status / selected place */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
          gap: theme.spacing.sm,
        }}
      >
        {loading ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              alignSelf: 'center',
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.lg,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <ActivityIndicator color={theme.colors.accent} />
            <Text variant="caption" tone="muted">
              Loading study spots…
            </Text>
          </View>
        ) : null}

        {error ? (
          <Pressable
            onPress={refresh}
            style={{
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.danger,
            }}
          >
            <Text variant="caption" tone="danger">
              Could not load places. Tap to try again.
            </Text>
          </Pressable>
        ) : null}

        {selected ? (
          <PlaceCard place={selected} onPress={() => router.push(`/place/${selected.id}`)} />
        ) : !loading && !error ? (
          <Text variant="caption" tone="faint" center>
            {visible.length} study spot{visible.length === 1 ? '' : 's'} · tap a pin
          </Text>
        ) : null}
      </View>
    </View>
  );
}

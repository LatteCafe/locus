import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, View } from 'react-native';

import { AttributeBar, Button, CategoryIcon, GradePill, Screen, Text } from '@/components';
import { categoryLabel, VOLUME_OPTIONS, WIFI_OPTIONS } from '@/config';
import type { RatingWeights, VolumeLevel } from '@/config';
import { formatDistance, walkingMinutes } from '@/lib/geo';
import { openStateLabel, weeklySchedule } from '@/lib/hours';
import { getCurrentLocation } from '@/lib/location';
import { fetchPlace, type Place } from '@/lib/places';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme';

export default function PlaceDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadToken, setReloadToken] = useState(0);

  const preferredVolume = profile?.preferred_volume as VolumeLevel | undefined;
  const weights = (profile?.rating_weights ?? null) as Partial<RatingWeights> | null;

  // Fetching and state-setting are kept apart: the effect starts the work and
  // only the promise callback touches state, so the first render cannot
  // cascade.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const run = async () => {
      const location = await getCurrentLocation({ withoutPrompting: true });
      return fetchPlace(id, {
        userLocation: location.status === 'ok' ? location.coords : null,
        viewer: { preferredVolume, weights },
      });
    };

    run()
      .then((result) => {
        if (cancelled) return;
        setPlace(result);
        setError(result ? null : 'That study spot no longer exists.');
        setLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, preferredVolume, weights, reloadToken]);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      </Screen>
    );
  }

  if (!place) {
    return (
      <Screen>
        <View style={{ marginTop: theme.spacing.xxl, gap: theme.spacing.lg }}>
          <Text variant="body" tone="muted" center>
            {error ?? 'Not found.'}
          </Text>
          <Button
            title="Try again"
            variant="secondary"
            onPress={() => {
              setLoading(true);
              setError(null);
              setReloadToken((n) => n + 1);
            }}
          />
        </View>
      </Screen>
    );
  }

  const schedule = weeklySchedule(place.openingHours);
  const distance = formatDistance(place.distanceM);
  const openTone =
    place.openState.status === 'open'
      ? 'success'
      : place.openState.status === 'closed'
        ? 'danger'
        : 'faint';

  const wifiLabel = place.stats.modal_wifi
    ? (WIFI_OPTIONS.find((o) => o.value === place.stats.modal_wifi)?.label ?? null)
    : null;
  const volumeLabel = place.stats.modal_volume
    ? (VOLUME_OPTIONS.find((o) => o.value === place.stats.modal_volume)?.label ?? null)
    : null;

  return (
    <Screen>
      {place.photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}
        >
          {place.photos.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              style={{
                width: 240,
                height: 160,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.surfaceAlt,
              }}
            />
          ))}
        </ScrollView>
      ) : null}

      {/* Header */}
      <View style={{ flexDirection: 'row', gap: theme.spacing.lg, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <CategoryIcon category={place.category} size={16} />
            <Text variant="overline" tone="muted">
              {categoryLabel(place.category).toUpperCase()}
            </Text>
          </View>
          <Text variant="title">{place.name}</Text>
          {place.address ? (
            <Text variant="caption" tone="muted">
              {place.address}
            </Text>
          ) : null}
        </View>
        <GradePill grade={place.grade} score={place.score} size="large" />
      </View>

      {/* Open now + distance */}
      <View
        style={{
          flexDirection: 'row',
          gap: theme.spacing.lg,
          marginTop: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="caption" tone="faint">
            Right now
          </Text>
          <Text variant="bodyMedium" tone={openTone as 'success' | 'danger' | 'faint'}>
            {openStateLabel(place.openState)}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="caption" tone="faint">
            Distance
          </Text>
          <Text variant="bodyMedium">
            {distance ? `${distance} · ${walkingMinutes(place.distanceM!)} min` : 'Unknown'}
          </Text>
        </View>
      </View>

      {place.hoursNote ? (
        <Text variant="caption" tone="muted" style={{ marginTop: theme.spacing.md }}>
          {place.hoursNote}
        </Text>
      ) : null}

      {/* Crowd attributes */}
      <Text variant="overline" tone="muted" style={{ marginTop: theme.spacing.xl }}>
        WHAT PEOPLE SAY
      </Text>

      {place.stats.rating_count === 0 ? (
        <View
          style={{
            marginTop: theme.spacing.md,
            padding: theme.spacing.lg,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text variant="body" tone="muted">
            Nobody has rated this spot yet. Study here and you will be asked first.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
          <Text variant="caption" tone="faint">
            From {place.stats.rating_count} rating
            {place.stats.rating_count === 1 ? '' : 's'}
          </Text>
          <AttributeBar label="Atmosphere" value={place.stats.avg_atmosphere} />
          <AttributeBar label="Wifi" value={null} caption={wifiLabel ?? 'No data'} />
          <AttributeBar label="Volume" value={null} caption={volumeLabel ?? 'No data'} />
          <AttributeBar label="Space" value={place.stats.avg_space} />
          <AttributeBar label="Outlets" value={place.stats.avg_outlets} />
          <AttributeBar label="Food" value={place.stats.avg_food} />
          <AttributeBar label="Accessibility" value={place.stats.avg_accessibility} />
          <AttributeBar label="Smell" value={place.stats.avg_smell} />
          <AttributeBar label="Washroom" value={place.stats.avg_washroom} />
        </View>
      )}

      {/* Hours */}
      <Text variant="overline" tone="muted" style={{ marginTop: theme.spacing.xl }}>
        HOURS
      </Text>
      <View style={{ marginTop: theme.spacing.md }}>
        {schedule ? (
          schedule.map((row) => (
            <View
              key={row.day}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: theme.spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text variant="body" tone="muted">
                {row.day}
              </Text>
              <Text variant="body">{row.hours}</Text>
            </View>
          ))
        ) : (
          <Text variant="body" tone="muted">
            Hours not known yet.
          </Text>
        )}
      </View>

      <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.sm }}>
        <Button
          title="Suggest a correction"
          variant="secondary"
          onPress={() => router.push(`/place/suggest/${place.id}`)}
        />
        <Text variant="caption" tone="faint" center>
          Checking in and timing a session arrives in the next phase.
        </Text>
      </View>

      {place.sessions30d > 0 ? (
        <Text variant="caption" tone="faint" center style={{ marginTop: theme.spacing.lg }}>
          {place.sessions30d} session{place.sessions30d === 1 ? '' : 's'} here in the last 30 days
        </Text>
      ) : null}
    </Screen>
  );
}

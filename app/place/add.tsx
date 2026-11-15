import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, CategoryIcon, Screen, Text, TextField } from '@/components';
import { PLACE_CATEGORIES, type PlaceCategory } from '@/config';
import { getCurrentLocation } from '@/lib/location';
import { addPlace } from '@/lib/places';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/theme';

export default function AddPlaceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A new spot is pinned where the user is standing, which is nearly always
  // the right answer and saves them dragging a map pin.
  //
  // The state updates live in the promise callback rather than the effect
  // body, so the first render does not cascade.
  useEffect(() => {
    let cancelled = false;
    getCurrentLocation().then((result) => {
      if (cancelled) return;
      if (result.status === 'ok') setCoords(result.coords);
      setLocating(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The retry button is an event handler, so it can set state directly.
  const retryLocate = useCallback(async () => {
    setLocating(true);
    const result = await getCurrentLocation();
    if (result.status === 'ok') setCoords(result.coords);
    setLocating(false);
  }, []);

  const canSave = name.trim().length >= 2 && category !== null && coords !== null && !saving;

  async function onSave() {
    if (!canSave || !session) return;
    setSaving(true);
    setError(null);

    const result = await addPlace({
      name,
      category: category!,
      lat: coords!.lat,
      lng: coords!.lng,
      address,
      openingHours,
      userId: session.user.id,
    });

    setSaving(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    Alert.alert('Added', `${name.trim()} is on the map.`, [
      { text: 'OK', onPress: () => router.replace(`/place/${result.id}`) },
    ]);
  }

  return (
    <Screen
      footer={
        <View style={{ gap: theme.spacing.sm }}>
          <Button title="Add this spot" onPress={onSave} disabled={!canSave} loading={saving} />
          {error ? (
            <Text variant="caption" tone="danger" center>
              {error}
            </Text>
          ) : null}
        </View>
      }
    >
      <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.md }}>
        <Text variant="body" tone="muted">
          Found somewhere good that is not on the map? Add it where you are standing.
        </Text>

        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Gerstein 3rd floor reading room"
          autoCapitalize="words"
          maxLength={80}
        />

        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="label" tone="muted">
            Category
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {PLACE_CATEGORIES.map((option) => {
              const active = option.id === category;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => setCategory(option.id)}
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
                  <CategoryIcon
                    category={option.id}
                    size={16}
                    color={active ? theme.colors.onAccent : theme.colors.accent}
                  />
                  <Text variant="caption" tone={active ? 'onAccent' : 'default'}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TextField
          label="Address (optional)"
          value={address}
          onChangeText={setAddress}
          placeholder="9 King's College Circle"
          maxLength={120}
        />

        <TextField
          label="Opening hours (optional)"
          value={openingHours}
          onChangeText={setOpeningHours}
          placeholder="Mo-Fr 08:30-22:00; Sa-Su 10:00-18:00"
          autoCapitalize="none"
          autoCorrect={false}
          hint="Leave blank if you are not sure — wrong hours are worse than none."
        />

        <View
          style={{
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: coords ? theme.colors.border : theme.colors.danger,
            gap: theme.spacing.xs,
          }}
        >
          <Text variant="label" tone="muted">
            Location
          </Text>
          {locating ? (
            <Text variant="caption" tone="faint">
              Finding where you are…
            </Text>
          ) : coords ? (
            <Text variant="caption" tone="muted">
              Pinned where you are standing ({coords.lat.toFixed(5)}, {coords.lng.toFixed(5)})
            </Text>
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="caption" tone="danger">
                Locus needs your location to pin this spot.
              </Text>
              <Button
                title="Try again"
                variant="secondary"
                fullWidth={false}
                onPress={retryLocate}
              />
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

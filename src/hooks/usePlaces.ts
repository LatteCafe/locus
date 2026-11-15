import { useCallback, useEffect, useRef, useState } from 'react';

import type { RatingWeights, VolumeLevel } from '@/config';
import type { Coords } from '@/lib/geo';
import { getCurrentLocation } from '@/lib/location';
import { fetchPlaces, type Place } from '@/lib/places';
import { useAuth } from '@/providers/AuthProvider';

type PlacesState = {
  places: Place[];
  loading: boolean;
  error: string | null;
  /** Null until the user allows location, or if they decline. */
  userLocation: Coords | null;
  locationDenied: boolean;
};

/**
 * Loads every place for the school, scored for this viewer and measured from
 * wherever they are.
 *
 * Location is optional throughout: if the user says no, the list still works,
 * just without distances. We ask only when `requestLocation` is true, so the
 * map can prompt while a background refresh does not.
 */
export function usePlaces(options?: { requestLocation?: boolean }) {
  const { profile } = useAuth();
  const requestLocation = options?.requestLocation ?? false;

  const [state, setState] = useState<PlacesState>({
    places: [],
    loading: true,
    error: null,
    userLocation: null,
    locationDenied: false,
  });

  // Keeps a slow response from overwriting a newer one.
  const requestId = useRef(0);

  const preferredVolume = profile?.preferred_volume as VolumeLevel | undefined;
  const weights = (profile?.rating_weights ?? null) as Partial<RatingWeights> | null;

  const load = useCallback(
    async (opts?: { prompt?: boolean }) => {
      const id = ++requestId.current;

      let coords: Coords | null = null;
      let denied = false;

      const location = await getCurrentLocation({ withoutPrompting: !opts?.prompt });
      if (location.status === 'ok') coords = location.coords;
      else if (location.status === 'denied') denied = true;

      try {
        const places = await fetchPlaces({
          userLocation: coords,
          viewer: { preferredVolume, weights },
        });
        if (id !== requestId.current) return;
        setState({
          places,
          loading: false,
          error: null,
          userLocation: coords,
          locationDenied: denied,
        });
      } catch (error) {
        if (id !== requestId.current) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: (error as Error).message,
          userLocation: coords,
          locationDenied: denied,
        }));
      }
    },
    [preferredVolume, weights]
  );

  useEffect(() => {
    // `load` is async, so every state update happens after an await rather
    // than synchronously inside the effect.
    void load({ prompt: requestLocation });
  }, [load, requestLocation]);

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, loading: true }));
    return load({ prompt: true });
  }, [load]);

  return { ...state, refresh };
}

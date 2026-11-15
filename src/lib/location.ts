/**
 * Location, used for two things only: sorting places by distance, and
 * recording where a check-in happened.
 *
 * We ask for "while using the app" permission and nothing more. There is no
 * background tracking anywhere in Locus, and nothing here runs unless a
 * screen asks it to.
 */
import * as Location from 'expo-location';

import type { Coords } from './geo';

export type LocationResult =
  | { status: 'ok'; coords: Coords; accuracy: number | null }
  | { status: 'denied' }
  | { status: 'unavailable'; message: string };

/** Whether we already hold permission, without prompting for it. */
export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

/**
 * Asks for permission if we do not have it, then takes a single reading.
 * Never throws: a screen that cannot get a location should carry on without
 * one rather than break.
 */
export async function getCurrentLocation(options?: {
  /** Skip the prompt and fail quietly if permission is not already given. */
  withoutPrompting?: boolean;
}): Promise<LocationResult> {
  try {
    const existing = await Location.getForegroundPermissionsAsync();
    let granted = existing.status === Location.PermissionStatus.GRANTED;

    if (!granted) {
      if (options?.withoutPrompting || !existing.canAskAgain) return { status: 'denied' };
      const requested = await Location.requestForegroundPermissionsAsync();
      granted = requested.status === Location.PermissionStatus.GRANTED;
    }

    if (!granted) return { status: 'denied' };

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      status: 'ok',
      coords: { lat: position.coords.latitude, lng: position.coords.longitude },
      accuracy: position.coords.accuracy ?? null,
    };
  } catch (error) {
    return { status: 'unavailable', message: (error as Error).message };
  }
}

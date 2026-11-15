/**
 * Reading and writing study spots.
 *
 * The 0–100 score is never read from the database: it is computed here from
 * the crowd's aggregated attributes, weighted by the viewer's own
 * preferences, so there is exactly one scoring formula in the codebase
 * (src/config/ratings.ts).
 */
import {
  computePlaceScoreFromStats,
  DEFAULT_SCHOOL,
  letterForScore,
  type PlaceAttributeStats,
  type PlaceCategory,
  type RatingWeights,
  type VolumeLevel,
} from '@/config';

import type { Database } from './database.types';
import { distanceMetres, type Coords } from './geo';
import { getOpenState, type OpenState } from './hours';
import { supabase } from './supabase';

export type PlaceWithStatsRow = Database['public']['Views']['places_with_stats']['Row'];

/** A place as the screens want it: scored, graded, measured and timed. */
export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address: string | null;
  openingHours: string | null;
  hoursNote: string | null;
  photos: string[];
  verified: boolean;
  createdBy: string | null;

  stats: PlaceAttributeStats;
  /** 0–100, or null when nobody has rated it yet. */
  score: number | null;
  /** Letter grade, or null when unrated. */
  grade: string | null;

  /** Metres from the user, or null when we have no location. */
  distanceM: number | null;
  openState: OpenState;

  sessions30d: number;
  activeSessions: number;
};

export type ViewerPreferences = {
  preferredVolume?: VolumeLevel;
  weights?: Partial<RatingWeights> | null;
};

function toStats(row: PlaceWithStatsRow): PlaceAttributeStats {
  // The view returns numerics as strings over the wire; Number() on null
  // would give 0, which would read as "rated 0", so nulls are preserved.
  const num = (value: number | string | null) => (value === null ? null : Number(value));

  return {
    rating_count: Number(row.rating_count ?? 0),
    avg_atmosphere: num(row.avg_atmosphere),
    avg_space: num(row.avg_space),
    avg_food: num(row.avg_food),
    avg_accessibility: num(row.avg_accessibility),
    avg_outlets: num(row.avg_outlets),
    avg_smell: num(row.avg_smell),
    avg_washroom: num(row.avg_washroom),
    wifi_fast_count: Number(row.wifi_fast_count ?? 0),
    wifi_slow_count: Number(row.wifi_slow_count ?? 0),
    wifi_none_count: Number(row.wifi_none_count ?? 0),
    volume_loud_count: Number(row.volume_loud_count ?? 0),
    volume_quiet_count: Number(row.volume_quiet_count ?? 0),
    volume_silent_count: Number(row.volume_silent_count ?? 0),
    modal_wifi: row.modal_wifi,
    modal_volume: row.modal_volume,
  };
}

export function toPlace(
  row: PlaceWithStatsRow,
  options?: { userLocation?: Coords | null; viewer?: ViewerPreferences; now?: Date }
): Place {
  const stats = toStats(row);
  const score = computePlaceScoreFromStats(stats, {
    preferredVolume: options?.viewer?.preferredVolume,
    weights: options?.viewer?.weights ?? undefined,
  });

  const coords = { lat: Number(row.lat), lng: Number(row.lng) };

  return {
    id: row.id!,
    name: row.name!,
    category: row.category as PlaceCategory,
    lat: coords.lat,
    lng: coords.lng,
    address: row.address,
    openingHours: row.opening_hours,
    hoursNote: row.hours_note,
    photos: row.photos ?? [],
    verified: !!row.verified,
    createdBy: row.created_by,
    stats,
    score,
    grade: score === null ? null : letterForScore(score),
    distanceM: options?.userLocation ? distanceMetres(options.userLocation, coords) : null,
    openState: getOpenState(row.opening_hours, options?.now),
    sessions30d: Number(row.sessions_30d ?? 0),
    activeSessions: Number(row.active_sessions ?? 0),
  };
}

/** Every place at the school. There are a few hundred, so one fetch is fine. */
export async function fetchPlaces(options?: {
  userLocation?: Coords | null;
  viewer?: ViewerPreferences;
  schoolId?: string;
}): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places_with_stats')
    .select('*')
    .eq('school_id', options?.schoolId ?? DEFAULT_SCHOOL.id)
    .order('name');

  if (error) throw new Error(error.message);

  const now = new Date();
  return (data ?? []).map((row) =>
    toPlace(row, { userLocation: options?.userLocation, viewer: options?.viewer, now })
  );
}

export async function fetchPlace(
  id: string,
  options?: { userLocation?: Coords | null; viewer?: ViewerPreferences }
): Promise<Place | null> {
  const { data, error } = await supabase
    .from('places_with_stats')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return toPlace(data, { userLocation: options?.userLocation, viewer: options?.viewer });
}

// ---------------------------------------------------------------------------
// Contributions
// ---------------------------------------------------------------------------

export async function addPlace(input: {
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address?: string | null;
  openingHours?: string | null;
  userId: string;
}): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from('places')
    .insert({
      name: input.name.trim(),
      category: input.category,
      lat: input.lat,
      lng: input.lng,
      address: input.address?.trim() || null,
      opening_hours: input.openingHours?.trim() || null,
      school_id: DEFAULT_SCHOOL.id,
      created_by: input.userId,
      // A user-added place is unverified until someone checks it.
      verified: false,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function suggestCorrection(input: {
  placeId: string;
  userId: string;
  kind: 'hours' | 'name' | 'category' | 'closed' | 'other';
  suggestedOpeningHours?: string | null;
  message?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const { error } = await supabase.from('place_suggestions').insert({
    place_id: input.placeId,
    user_id: input.userId,
    kind: input.kind,
    suggested_opening_hours: input.suggestedOpeningHours?.trim() || null,
    message: input.message?.trim() || null,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

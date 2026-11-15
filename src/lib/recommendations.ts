/**
 * Filtering and ranking for the Recommendations screen.
 * The blend of distance and rating lives in src/config/recommendations.ts.
 */
import { RECOMMENDATION_CONFIG, recommendationScore, type PlaceCategory } from '@/config';

import type { Place } from './places';

export type PlaceFilters = {
  /** Empty means every category. */
  categories: PlaceCategory[];
  /** Hide anything that is shut right now. Places with unknown hours stay. */
  openNow: boolean;
  /** Minimum acceptable wifi, by the crowd's average. */
  wifi: 'any' | 'working' | 'fast';
  /** Only places the crowd says have something to eat or drink. */
  hasFood: boolean;
  /** Minimum crowd rating for space, 1–5. */
  minSpace: number | null;
  /** Metres. Null means no limit beyond the config maximum. */
  maxDistanceM: number | null;
};

export const DEFAULT_FILTERS: PlaceFilters = {
  categories: [],
  openNow: true,
  wifi: 'any',
  hasFood: false,
  minSpace: null,
  maxDistanceM: null,
};

export function activeFilterCount(filters: PlaceFilters): number {
  let count = 0;
  if (filters.categories.length > 0) count++;
  if (!filters.openNow) count++;
  if (filters.wifi !== 'any') count++;
  if (filters.hasFood) count++;
  if (filters.minSpace !== null) count++;
  if (filters.maxDistanceM !== null) count++;
  return count;
}

/** The crowd's average wifi score, 1–5, or null if nobody has said. */
function wifiScore(place: Place): number | null {
  const { wifi_fast_count: fast, wifi_slow_count: slow, wifi_none_count: none } = place.stats;
  const total = fast + slow + none;
  if (total === 0) return null;
  return (fast * 5 + slow * 3 + none * 1) / total;
}

export function matchesFilters(place: Place, filters: PlaceFilters): boolean {
  if (filters.categories.length > 0 && !filters.categories.includes(place.category)) {
    return false;
  }

  if (filters.openNow && place.openState.status === 'closed') return false;

  if (filters.wifi !== 'any') {
    const score = wifiScore(place);
    // Unrated wifi is not a reason to hide a place; we simply do not know.
    if (score !== null) {
      if (filters.wifi === 'fast' && score < 4) return false;
      if (filters.wifi === 'working' && score < 2.5) return false;
    }
  }

  if (filters.hasFood) {
    const food = place.stats.avg_food;
    if (food !== null && food < 3) return false;
    // A cafe or dining hall obviously has food even before anyone rates it.
    if (food === null && place.category !== 'cafe' && place.category !== 'dining_hall') {
      return false;
    }
  }

  if (filters.minSpace !== null) {
    const space = place.stats.avg_space;
    if (space !== null && space < filters.minSpace) return false;
  }

  const limit = filters.maxDistanceM ?? RECOMMENDATION_CONFIG.maxDistanceMetres;
  if (place.distanceM !== null && place.distanceM > limit) return false;

  return true;
}

/** Filters, then sorts best-first. */
export function recommendPlaces(places: Place[], filters: PlaceFilters): Place[] {
  return places
    .filter((place) => matchesFilters(place, filters))
    .map((place) => ({
      place,
      rank: recommendationScore({ placeScore: place.score, distanceMetres: place.distanceM }),
    }))
    .sort((a, b) => {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return a.place.name.localeCompare(b.place.name);
    })
    .map((entry) => entry.place);
}

/** Schools we support. Launch market is U of T St. George only. */

export type School = {
  id: string;
  name: string;
  shortName: string;
  /** Bounding box used by the place seed script and the map's initial region. */
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  center: { lat: number; lng: number };
};

export const SCHOOLS: School[] = [
  {
    id: 'uoft_stg',
    name: 'University of Toronto — St. George',
    shortName: 'U of T St. George',
    bounds: { minLat: 43.6525, maxLat: 43.6735, minLng: -79.4075, maxLng: -79.3885 },
    center: { lat: 43.6629, lng: -79.3957 },
  },
];

export const DEFAULT_SCHOOL = SCHOOLS[0];

export function schoolById(id: string | null | undefined): School | null {
  if (!id) return null;
  return SCHOOLS.find((s) => s.id === id) ?? null;
}

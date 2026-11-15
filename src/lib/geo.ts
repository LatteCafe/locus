/** Distance helpers. Mirrors app.distance_metres in the database. */

const EARTH_RADIUS_M = 6_371_000;

export type Coords = { lat: number; lng: number };

/** Great-circle distance in metres. */
export function distanceMetres(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** "250 m" / "1.2 km", or null when we do not know where the user is. */
export function formatDistance(metres: number | null): string | null {
  if (metres === null) return null;
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** Rough walking time, at a student's 80 m/min. */
export function walkingMinutes(metres: number): number {
  return Math.max(1, Math.round(metres / 80));
}

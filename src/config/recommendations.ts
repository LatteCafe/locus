/**
 * How the Recommendations screen ranks places.
 *
 * Each candidate gets a 0–1 rating term and a 0–1 proximity term, blended by
 * the weights below. Only places that are open right now are considered.
 */

export const RECOMMENDATION_CONFIG = {
  /** Weight on the place's 0–100 crowd score. */
  ratingWeight: 0.65,
  /** Weight on how close the place is. */
  distanceWeight: 0.35,
  /**
   * Distance at which the proximity term hits zero, in metres. Anything this
   * far or further scores 0 for proximity (but can still win on rating).
   */
  distanceFalloffMetres: 2000,
  /** Places beyond this are not shown at all, in metres. */
  maxDistanceMetres: 5000,
  /** Score given to a place nobody has rated yet, so new places still appear. */
  unratedScore: 70,
} as const;

/**
 * Blended 0–1 score. Higher is a better recommendation.
 */
export function recommendationScore(input: {
  /** 0–100 place score, or null when unrated. */
  placeScore: number | null;
  /** Metres from the user, or null when location is unknown. */
  distanceMetres: number | null;
}): number {
  const { ratingWeight, distanceWeight, distanceFalloffMetres, unratedScore } =
    RECOMMENDATION_CONFIG;

  const ratingTerm = (input.placeScore ?? unratedScore) / 100;

  // With no location we fall back to rating alone rather than guessing.
  if (input.distanceMetres === null) return ratingTerm;

  const proximityTerm = Math.max(0, 1 - input.distanceMetres / distanceFalloffMetres);
  return ratingTerm * ratingWeight + proximityTerm * distanceWeight;
}

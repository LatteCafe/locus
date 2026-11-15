/**
 * Rating attributes, how they are scored, and the default weights used to
 * turn a user's rating into a 0–100 place score.
 *
 * Users are only asked to rate a place on their FIRST session there. They can
 * change it later via "Rerank" on the end-of-session screen.
 */

export type VolumeLevel = 'loud' | 'quiet' | 'silent';
export type WifiLevel = 'fast' | 'slow' | 'none';

/** Every rateable attribute. These ids match columns in `place_ratings`. */
export type RatingAttributeId =
  | 'atmosphere'
  | 'wifi'
  | 'volume'
  | 'space'
  | 'food'
  | 'accessibility'
  | 'outlets'
  | 'smell'
  | 'washroom';

export type RatingAttribute = {
  id: RatingAttributeId;
  label: string;
  /** Short hint shown under the label on the rating screen. */
  hint: string;
  /**
   * `stars` — 1–5 star row.
   * `scale` — 1–5 labelled buttons.
   * `choice` — one of a fixed set (wifi, volume).
   */
  input: 'stars' | 'scale' | 'choice';
  /** Atmosphere is the only required attribute; everything else is skippable. */
  required: boolean;
  /** For `scale` inputs: what 1 and 5 mean. */
  scaleLabels?: { low: string; high: string };
};

export const RATING_ATTRIBUTES: RatingAttribute[] = [
  {
    id: 'atmosphere',
    label: 'Atmosphere',
    hint: 'Would you want to spend four hours here?',
    input: 'stars',
    required: true,
  },
  {
    id: 'wifi',
    label: 'Wifi',
    hint: 'How was the connection?',
    input: 'choice',
    required: false,
  },
  {
    id: 'volume',
    label: 'Volume',
    hint: 'How loud was it?',
    input: 'choice',
    required: false,
  },
  {
    id: 'space',
    label: 'Space',
    hint: 'Room to spread out and find a seat.',
    input: 'scale',
    required: false,
    scaleLabels: { low: 'Cramped', high: 'Roomy' },
  },
  {
    id: 'food',
    label: 'Food',
    hint: 'Anything to eat or drink nearby.',
    input: 'scale',
    required: false,
    scaleLabels: { low: 'None', high: 'Great' },
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    hint: 'Step-free access, lifts, door widths.',
    input: 'scale',
    required: false,
    scaleLabels: { low: 'Poor', high: 'Excellent' },
  },
  {
    id: 'outlets',
    label: 'Outlets',
    hint: 'Could you plug in?',
    input: 'scale',
    required: false,
    scaleLabels: { low: 'None', high: 'Everywhere' },
  },
  {
    id: 'smell',
    label: 'Smell',
    hint: 'Be honest.',
    input: 'scale',
    required: false,
    scaleLabels: { low: 'Rough', high: 'Lovely' },
  },
  {
    id: 'washroom',
    label: 'Washroom',
    hint: 'Clean, close, and open?',
    input: 'scale',
    required: false,
    scaleLabels: { low: 'Avoid', high: 'Pristine' },
  },
];

/** Wifi choices, in the order they appear on screen, with their 1–5 score. */
export const WIFI_OPTIONS: { value: WifiLevel; label: string; score: number }[] = [
  { value: 'fast', label: 'Fast', score: 5 },
  { value: 'slow', label: 'Slow', score: 3 },
  { value: 'none', label: 'None', score: 1 },
];

/** Volume choices. Volume is stored as a category, not a score. */
export const VOLUME_OPTIONS: { value: VolumeLevel; label: string }[] = [
  { value: 'loud', label: 'Loud' },
  { value: 'quiet', label: 'Quiet' },
  { value: 'silent', label: 'Silent' },
];

/**
 * How a volume category scores, per the user's own preference.
 *
 * A user who prefers silence scores a silent room 5; a user who likes a bit of
 * buzz can flip this in settings. The key is the user's preferred volume.
 */
export const VOLUME_SCORES: Record<VolumeLevel, Record<VolumeLevel, number>> = {
  silent: { silent: 5, quiet: 4, loud: 2 },
  quiet: { silent: 4, quiet: 5, loud: 3 },
  loud: { silent: 3, quiet: 4, loud: 5 },
};

/** Default preferred volume for a new account. */
export const DEFAULT_PREFERRED_VOLUME: VolumeLevel = 'silent';

export type RatingWeights = Record<RatingAttributeId, number>;

/**
 * Default attribute weights. Relative, so they need not sum to anything in
 * particular — the score renormalises over whichever attributes were rated.
 * Users will later be able to override these (`profiles.rating_weights`).
 */
export const DEFAULT_RATING_WEIGHTS: RatingWeights = {
  atmosphere: 20,
  wifi: 15,
  volume: 15,
  space: 12,
  outlets: 12,
  food: 8,
  accessibility: 6,
  smell: 6,
  washroom: 6,
};

/**
 * A 1–5 attribute average becomes a 0–100 score as `avg * 20`, so a place
 * rated straight 3s lands on 60 (a C-) rather than a fail. Change the
 * formula here if the grade distribution feels wrong.
 */
export function attributeAverageToPercent(average: number): number {
  return Math.round(Math.max(0, Math.min(5, average)) * 20);
}

export type RatingInput = {
  atmosphere: number | null;
  wifi: WifiLevel | null;
  volume: VolumeLevel | null;
  space: number | null;
  food: number | null;
  accessibility: number | null;
  outlets: number | null;
  smell: number | null;
  washroom: number | null;
};

export const EMPTY_RATING: RatingInput = {
  atmosphere: null,
  wifi: null,
  volume: null,
  space: null,
  food: null,
  accessibility: null,
  outlets: null,
  smell: null,
  washroom: null,
};

/** Turns one attribute of a rating into a 1–5 score, or null if skipped. */
export function attributeScore(
  id: RatingAttributeId,
  rating: RatingInput,
  preferredVolume: VolumeLevel
): number | null {
  if (id === 'wifi') {
    if (!rating.wifi) return null;
    return WIFI_OPTIONS.find((o) => o.value === rating.wifi)?.score ?? null;
  }
  if (id === 'volume') {
    if (!rating.volume) return null;
    return VOLUME_SCORES[preferredVolume][rating.volume];
  }
  const value = rating[id];
  return typeof value === 'number' ? value : null;
}

/**
 * Weighted 0–100 score for one user's rating of one place.
 * Returns null if nothing was rated at all.
 */
export function computePlaceScore(
  rating: RatingInput,
  options?: { preferredVolume?: VolumeLevel; weights?: Partial<RatingWeights> }
): number | null {
  const preferredVolume = options?.preferredVolume ?? DEFAULT_PREFERRED_VOLUME;
  const weights = { ...DEFAULT_RATING_WEIGHTS, ...(options?.weights ?? {}) };

  let weightedSum = 0;
  let weightTotal = 0;

  for (const attribute of RATING_ATTRIBUTES) {
    const score = attributeScore(attribute.id, rating, preferredVolume);
    if (score === null) continue;
    const weight = weights[attribute.id] ?? 0;
    if (weight <= 0) continue;
    weightedSum += score * weight;
    weightTotal += weight;
  }

  if (weightTotal === 0) return null;
  return attributeAverageToPercent(weightedSum / weightTotal);
}

/**
 * U of T letter grade scale, applied to 0–100 place scores.
 */

export type GradeBand = {
  letter: string;
  /** Inclusive lower bound. */
  min: number;
  /** Grade points, for the transcript GPA. */
  points: number;
};

export const GRADE_SCALE: GradeBand[] = [
  { letter: 'A+', min: 90, points: 4.0 },
  { letter: 'A', min: 85, points: 4.0 },
  { letter: 'A-', min: 80, points: 3.7 },
  { letter: 'B+', min: 77, points: 3.3 },
  { letter: 'B', min: 73, points: 3.0 },
  { letter: 'B-', min: 70, points: 2.7 },
  { letter: 'C+', min: 67, points: 2.3 },
  { letter: 'C', min: 63, points: 2.0 },
  { letter: 'C-', min: 60, points: 1.7 },
  { letter: 'D+', min: 57, points: 1.3 },
  { letter: 'D', min: 53, points: 1.0 },
  { letter: 'D-', min: 50, points: 0.7 },
  { letter: 'F', min: 0, points: 0.0 },
];

export function gradeForScore(score: number): GradeBand {
  const clamped = Math.max(0, Math.min(100, score));
  return GRADE_SCALE.find((band) => clamped >= band.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
}

export function letterForScore(score: number): string {
  return gradeForScore(score).letter;
}

/**
 * Transcript GPA: grade points averaged across places, weighted by
 * hours studied there (so your regular spot counts more than a one-off).
 */
export function computeGpa(entries: { score: number; hours: number }[]): number | null {
  if (entries.length === 0) return null;
  const totalWeight = entries.reduce((sum, e) => sum + Math.max(e.hours, 0.01), 0);
  if (totalWeight <= 0) return null;
  const weighted = entries.reduce(
    (sum, e) => sum + gradeForScore(e.score).points * Math.max(e.hours, 0.01),
    0
  );
  return Math.round((weighted / totalWeight) * 100) / 100;
}

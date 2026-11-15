/** Study session, pomodoro and streak settings. */

export const SESSION_CONFIG = {
  /** Default pomodoro focus block, in minutes. */
  pomodoroFocusMinutes: 25,
  /** Default pomodoro break, in minutes. */
  pomodoroBreakMinutes: 5,
  /** Minimum session length that keeps a streak alive, in minutes. */
  streakMinimumMinutes: 25,
  /**
   * Sessions longer than this are almost certainly a forgotten timer. We still
   * keep them, but the end-of-session screen asks the user to confirm.
   */
  suspiciousSessionHours: 12,
  /**
   * A check-in further than this from the place (metres) is still allowed —
   * we never block a check-in — but it is surfaced in the admin review view.
   */
  farCheckInMetres: 300,
} as const;

/** Place categories. The id is what lands in `places.category`. */
export type PlaceCategory =
  'library' | 'cafe' | 'dining_hall' | 'classroom' | 'coworking' | 'outdoor';

export const PLACE_CATEGORIES: { id: PlaceCategory; label: string; plural: string }[] = [
  { id: 'library', label: 'Library', plural: 'Libraries' },
  { id: 'cafe', label: 'Cafe', plural: 'Cafes' },
  { id: 'dining_hall', label: 'Dining hall', plural: 'Dining halls' },
  { id: 'classroom', label: 'Classroom', plural: 'Classrooms' },
  { id: 'coworking', label: 'Coworking', plural: 'Coworking spaces' },
  { id: 'outdoor', label: 'Outdoor', plural: 'Outdoor' },
];

export function categoryLabel(id: string): string {
  return PLACE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/**
 * Monthly personality type, awarded on the number of DISTINCT places
 * studied at during the calendar month (America/Toronto).
 */

export type PersonalityType = {
  id: string;
  /** Inclusive lower bound on distinct places. */
  minPlaces: number;
  name: string;
};

export const PERSONALITY_TYPES: PersonalityType[] = [
  { id: 'same_seat', minPlaces: 1, name: 'Same Seat Since September' },
  { id: 'back_row', minPlaces: 3, name: 'Back Row Regular' },
  { id: 'wherever_open', minPlaces: 5, name: "Sits Wherever's Open" },
  { id: 'seat_hopper', minPlaces: 7, name: 'Seat Hopper' },
  { id: 'switches_sections', minPlaces: 9, name: 'Switches Sections Midterm' },
  { id: 'sits_in', minPlaces: 11, name: "Sits In on Lectures They're Not Enrolled In" },
];

/** Null when the user studied nowhere that month. */
export function personalityForPlaceCount(distinctPlaces: number): PersonalityType | null {
  if (distinctPlaces < 1) return null;
  let earned = PERSONALITY_TYPES[0];
  for (const type of PERSONALITY_TYPES) {
    if (distinctPlaces >= type.minPlaces) earned = type;
    else break;
  }
  return earned;
}

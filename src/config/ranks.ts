/**
 * Weekly ranks, awarded on total hours studied in the current week
 * (all places combined). Weeks run Monday 00:00 America/Toronto.
 *
 * Edit names, thresholds and blurbs here — no logic lives in this file.
 */

export type WeeklyRank = {
  /** Stable id. Never change these once shipped: they may end up in the DB. */
  id: string;
  /** Inclusive lower bound, in hours. */
  minHours: number;
  /** Display name. `{firstName}` is replaced with the user's first name. */
  name: string;
  description: string;
};

export const WEEKLY_RANKS: WeeklyRank[] = [
  {
    id: 'inventor',
    minHours: 0,
    name: 'The Inventor',
    description: "You don't study the material, you wrote it.",
  },
  {
    id: 'syllabus_viewer',
    minHours: 1,
    name: 'Syllabus Viewer',
    description: 'You visited, took a photo, and left.',
  },
  {
    id: 'sparknotes_reviewer',
    minHours: 3,
    name: 'Sparknotes Reviewer',
    description: 'You know the plot, not the book.',
  },
  {
    id: 'wifi_password_knower',
    minHours: 6,
    name: 'WiFi Password Knower',
    description: 'Barista-level familiarity with the place.',
  },
  {
    id: 'vibe_coder',
    minHours: 10,
    name: 'Vibe Coder',
    description: 'Performative studier.',
  },
  {
    id: 'library_larper',
    minHours: 15,
    name: 'Library Larper',
    description: 'You are now a larper.',
  },
  {
    id: 'seasonal_decor',
    minHours: 20,
    name: 'Seasonal Decor',
    description: 'Staff think you came with the building.',
  },
  {
    id: 'beast',
    minHours: 30,
    name: '{firstName}GPT',
    description: 'YOU ARE A BEAST.',
  },
];

/** The rank earned for a given number of hours this week. */
export function rankForHours(hours: number): WeeklyRank {
  let earned = WEEKLY_RANKS[0];
  for (const rank of WEEKLY_RANKS) {
    if (hours >= rank.minHours) earned = rank;
    else break;
  }
  return earned;
}

/** The next rank up, or null if already at the top. */
export function nextRankForHours(hours: number): WeeklyRank | null {
  return WEEKLY_RANKS.find((rank) => rank.minHours > hours) ?? null;
}

/** Substitutes `{firstName}` in a rank name. */
export function rankDisplayName(rank: WeeklyRank, firstName: string | null | undefined): string {
  return rank.name.replace('{firstName}', (firstName ?? 'You').trim());
}

/** 0–1 progress through the current rank band. 1 when at the top rank. */
export function rankProgress(hours: number): number {
  const current = rankForHours(hours);
  const next = nextRankForHours(hours);
  if (!next) return 1;
  const span = next.minHours - current.minHours;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (hours - current.minHours) / span));
}

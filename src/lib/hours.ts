/**
 * "Open now" and friends, from OpenStreetMap `opening_hours` strings.
 *
 * Two things to know:
 *
 *  - Plenty of places have no hours at all. That is a real state, not an
 *    error, and it is never treated as "closed": we say we do not know.
 *  - OSM strings are user-written and some are malformed. A bad string must
 *    never crash a screen, so every parse is wrapped.
 */
import OpeningHours from 'opening_hours';

import { DEFAULT_SCHOOL } from '@/config';

export type OpenState =
  | { status: 'open'; until: Date | null; closingSoon: boolean }
  | { status: 'closed'; opensAt: Date | null }
  | { status: 'unknown'; reason: 'no-hours' | 'unparseable' };

/** Minutes before closing at which we start warning the user. */
const CLOSING_SOON_MINUTES = 60;

/**
 * Parsing is given the campus location so holidays and any timezone-sensitive
 * rules resolve for Toronto, not for wherever the phone happens to be.
 */
const LOCATION = {
  lat: DEFAULT_SCHOOL.center.lat,
  lon: DEFAULT_SCHOOL.center.lng,
  address: { country_code: 'ca', state: 'Ontario' },
};

/** Cache: parsing is not free and the map re-renders often. */
const cache = new Map<string, OpeningHours | null>();

function parse(value: string): OpeningHours | null {
  const cached = cache.get(value);
  if (cached !== undefined) return cached;

  let parsed: OpeningHours | null = null;
  try {
    parsed = new OpeningHours(value, LOCATION);
  } catch {
    // Malformed string in OSM. Nothing to do but treat the hours as unknown.
    parsed = null;
  }
  cache.set(value, parsed);
  return parsed;
}

export function getOpenState(
  openingHours: string | null | undefined,
  now: Date = new Date()
): OpenState {
  if (!openingHours || !openingHours.trim()) {
    return { status: 'unknown', reason: 'no-hours' };
  }

  const parsed = parse(openingHours);
  if (!parsed) return { status: 'unknown', reason: 'unparseable' };

  try {
    const isOpen = parsed.getState(now);
    const nextChange = parsed.getNextChange(now) ?? null;

    if (isOpen) {
      const closingSoon =
        nextChange !== null &&
        nextChange.getTime() - now.getTime() <= CLOSING_SOON_MINUTES * 60 * 1000;
      return { status: 'open', until: nextChange, closingSoon };
    }
    return { status: 'closed', opensAt: nextChange };
  } catch {
    return { status: 'unknown', reason: 'unparseable' };
  }
}

export function isOpenNow(openingHours: string | null | undefined, now?: Date): boolean {
  return getOpenState(openingHours, now).status === 'open';
}

/** Short label for a pin or a list row: "Open until 10pm", "Opens 8:30am". */
export function openStateLabel(state: OpenState): string {
  switch (state.status) {
    case 'open':
      return state.until ? `Open until ${formatTime(state.until)}` : 'Open';
    case 'closed':
      return state.opensAt ? `Opens ${formatWhen(state.opensAt)}` : 'Closed';
    case 'unknown':
      return 'Hours not known';
  }
}

function formatTime(date: Date): string {
  return (
    date
      .toLocaleTimeString('en-CA', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Toronto',
      })
      // "10:00 p.m." -> "10pm". en-CA writes p.m. with periods, and separates
      // it with a narrow no-break space that /\s/ does not match.
      .replace(':00', '')
      .replace(/[\s\u202f\u00a0]/g, '')
      .replace(/\./g, '')
      .toLowerCase()
  );
}

/** "10pm" when it is today, "Mon 8:30am" when it is not. */
function formatWhen(date: Date, now: Date = new Date()): string {
  const sameDay =
    date.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }) ===
    now.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });

  if (sameDay) return formatTime(date);

  const weekday = date.toLocaleDateString('en-CA', {
    weekday: 'short',
    timeZone: 'America/Toronto',
  });
  return `${weekday} ${formatTime(date)}`;
}

/**
 * The week as readable rows, for the place detail screen.
 * Returns null when there are no usable hours.
 */
export function weeklySchedule(
  openingHours: string | null | undefined
): { day: string; hours: string }[] | null {
  if (!openingHours?.trim()) return null;
  const parsed = parse(openingHours);
  if (!parsed) return null;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const rows: { day: string; hours: string }[] = [];

  // Walk the next seven days from the most recent Monday.
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);

  try {
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(start);
      dayStart.setDate(start.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const intervals = parsed.getOpenIntervals(dayStart, dayEnd);
      rows.push({
        day: days[i],
        hours:
          intervals.length === 0
            ? 'Closed'
            : intervals.map(([from, to]) => `${formatTime(from)}–${formatTime(to)}`).join(', '),
      });
    }
  } catch {
    return null;
  }

  return rows;
}

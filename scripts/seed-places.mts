/**
 * One-time (re-runnable) import of study spots into the `places` table.
 *
 * Sources, in this order:
 *   1. OpenStreetMap, via the Overpass API, inside the school's bounding box.
 *   2. seed/manual_places.json, for anything OSM misses or mis-tags.
 *
 * Every place is keyed by `osm_id`, which is unique, so running this twice
 * updates rather than duplicates. A manual entry carries the id
 * `manual/<key>` unless it names a real OSM id, in which case it updates that
 * record instead.
 *
 * Run it with:
 *   node --env-file=.env scripts/seed-places.mts
 *
 * It needs SUPABASE_SERVICE_ROLE_KEY, because the security rules only let a
 * signed-in user create places under their own name — which is correct, and
 * not something to relax just for a seeding script. That key bypasses every
 * rule, so it stays out of .env's EXPO_PUBLIC_ variables and never reaches
 * the app bundle.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { DEFAULT_SCHOOL } from '../src/config/schools.ts';
import type { PlaceCategory } from '../src/config/sessions.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(HERE, '..');

// Overpass is a free, shared service that is often at capacity. We try the
// mirrors in turn and back off, rather than failing the whole import.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const MAX_ATTEMPTS = 4;
const USER_AGENT = 'locus-seed/1.0';

type OsmElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type PlaceRow = {
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address: string | null;
  opening_hours: string | null;
  hours_note: string | null;
  school_id: string;
  osm_id: string;
  verified: boolean;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// OpenStreetMap
// ---------------------------------------------------------------------------

function buildQuery(): string {
  const { minLat, minLng, maxLat, maxLng } = DEFAULT_SCHOOL.bounds;
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;

  // `nwr` covers nodes, ways and relations; `out center` gives one coordinate
  // per result, including for buildings mapped as shapes.
  return `
[out:json][timeout:90];
(
  nwr["amenity"="library"](${bbox});
  nwr["amenity"="cafe"](${bbox});
  nwr["amenity"="coworking_space"](${bbox});
  nwr["office"="coworking"](${bbox});
  nwr["amenity"="food_court"](${bbox});
  nwr["leisure"="park"](${bbox});
);
out center tags;`.trim();
}

async function fetchFromOverpass(): Promise<OsmElement[]> {
  const query = buildQuery();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // Overpass rejects requests without one of these.
            'User-Agent': USER_AGENT,
          },
          body: new URLSearchParams({ data: query }).toString(),
          signal: AbortSignal.timeout(120_000),
        });

        if (response.ok) {
          const payload = (await response.json()) as { elements?: OsmElement[] };
          const elements = payload.elements ?? [];
          console.log(`  OpenStreetMap returned ${elements.length} results from ${endpoint}`);
          return elements;
        }

        // 429 and 504 mean "busy", which is worth retrying elsewhere.
        console.log(`  ${endpoint} -> HTTP ${response.status}`);
      } catch (error) {
        console.log(`  ${endpoint} -> ${(error as Error).message}`);
      }
    }

    if (attempt < MAX_ATTEMPTS) {
      const waitSeconds = 10 * 2 ** (attempt - 1);
      console.log(
        `  all mirrors busy; waiting ${waitSeconds}s (attempt ${attempt}/${MAX_ATTEMPTS})`
      );
      await sleep(waitSeconds * 1000);
    }
  }

  throw new Error(
    'Overpass is unavailable on every mirror. It is a free shared service and ' +
      'is sometimes at capacity — try again in a few minutes. The manual ' +
      'places can still be imported with --manual-only.'
  );
}

/** Maps OSM tags onto our six categories. Returns null for things to skip. */
function categoryFor(tags: Record<string, string>): PlaceCategory | null {
  if (tags.amenity === 'library') return 'library';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.amenity === 'coworking_space' || tags.office === 'coworking') return 'coworking';
  if (tags.amenity === 'food_court') return 'dining_hall';
  if (tags.leisure === 'park') return 'outdoor';
  return null;
}

function addressFrom(tags: Record<string, string>): string | null {
  const number = tags['addr:housenumber'];
  const street = tags['addr:street'];
  if (number && street) return `${number} ${street}`;
  return street ?? null;
}

function osmToPlace(element: OsmElement): PlaceRow | null {
  const tags = element.tags ?? {};
  const name = tags.name?.trim();
  // An unnamed bench in a park is not a study spot anyone can look for.
  if (!name) return null;

  const category = categoryFor(tags);
  if (!category) return null;

  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  return {
    name,
    category,
    lat,
    lng,
    address: addressFrom(tags),
    opening_hours: tags.opening_hours ?? null,
    hours_note: null,
    school_id: DEFAULT_SCHOOL.id,
    osm_id: `${element.type}/${element.id}`,
    verified: true,
  };
}

// ---------------------------------------------------------------------------
// Hand-maintained places
// ---------------------------------------------------------------------------

type ManualPlace = {
  key: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  osm_id?: string;
  address?: string;
  opening_hours?: string;
  hours_note?: string;
};

function loadManualPlaces(): PlaceRow[] {
  const path = join(PROJECT_ROOT, 'seed', 'manual_places.json');
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as { places?: ManualPlace[] };
  const places = parsed.places ?? [];

  return places.map((place) => {
    if (!place.key || !place.name || !place.category) {
      throw new Error(`manual_places.json: entry missing key, name or category: ${place.key}`);
    }
    return {
      name: place.name,
      category: place.category,
      lat: place.lat,
      lng: place.lng,
      address: place.address ?? null,
      opening_hours: place.opening_hours ?? null,
      hours_note: place.hours_note ?? null,
      school_id: DEFAULT_SCHOOL.id,
      // Using the real OSM id when we know it means this entry updates that
      // record rather than sitting beside it as a duplicate.
      osm_id: place.osm_id ?? `manual/${place.key}`,
      verified: true,
    };
  });
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

async function main() {
  const manualOnly = process.argv.includes('--manual-only');
  const dryRun = process.argv.includes('--dry-run');

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('EXPO_PUBLIC_SUPABASE_URL is not set. Run with --env-file=.env');
  if (!serviceKey && !dryRun) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set.\n' +
        'Find it in the Supabase dashboard under Project Settings -> API Keys -> service_role,\n' +
        'and add it to .env as:\n' +
        '  SUPABASE_SERVICE_ROLE_KEY=...\n' +
        'Note there is no EXPO_PUBLIC_ prefix: that key must never reach the app.'
    );
  }

  console.log(`Seeding places for ${DEFAULT_SCHOOL.shortName}`);

  const manual = loadManualPlaces();
  console.log(`  ${manual.length} places from seed/manual_places.json`);

  let fromOsm: PlaceRow[] = [];
  if (!manualOnly) {
    console.log('  querying OpenStreetMap...');
    const elements = await fetchFromOverpass();
    fromOsm = elements.map(osmToPlace).filter((p): p is PlaceRow => p !== null);
    console.log(`  ${fromOsm.length} usable study spots after filtering`);
  }

  // Manual entries win: they are the ones a human checked.
  const byOsmId = new Map<string, PlaceRow>();
  for (const place of fromOsm) byOsmId.set(place.osm_id, place);
  for (const place of manual) {
    const existing = byOsmId.get(place.osm_id);
    byOsmId.set(
      place.osm_id,
      existing
        ? {
            ...existing,
            ...place,
            // Keep OSM's opening hours when the manual entry has none, since
            // we deliberately leave those blank rather than guess.
            opening_hours: place.opening_hours ?? existing.opening_hours,
            address: place.address ?? existing.address,
          }
        : place
    );
  }

  const rows = [...byOsmId.values()];
  const counts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.category] = (acc[row.category] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`\n  ${rows.length} places to import:`);
  for (const [category, count] of Object.entries(counts).sort()) {
    console.log(`    ${category.padEnd(12)} ${count}`);
  }
  console.log(`    ${'with hours'.padEnd(12)} ${rows.filter((r) => r.opening_hours).length}`);

  if (dryRun) {
    console.log('\n  --dry-run: nothing written.');
    return;
  }

  const supabase = createClient(url, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Chunked, so one oversized request cannot fail the whole import.
  const CHUNK = 100;
  let written = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from('places').upsert(chunk, { onConflict: 'osm_id' });
    if (error) throw new Error(`Import failed at row ${i}: ${error.message}`);
    written += chunk.length;
    console.log(`  wrote ${written}/${rows.length}`);
  }

  const { count } = await supabase.from('places').select('*', { count: 'exact', head: true });
  console.log(`\nDone. ${count ?? '?'} places in the database.`);
}

main().catch((error: Error) => {
  console.error(`\nSeed failed: ${error.message}`);
  process.exit(1);
});

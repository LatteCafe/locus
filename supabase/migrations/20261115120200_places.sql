-- Locus: study places, photos, and hours corrections.

create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category place_category not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  -- OSM opening_hours syntax, e.g. 'Mo-Fr 08:00-23:00; Sa-Su 10:00-18:00'.
  -- Parsed on the client with the `opening_hours` npm package.
  opening_hours text,
  -- Free text for things opening_hours cannot express, e.g. 'Closes early
  -- during reading week'.
  hours_note text,
  school_id text,
  -- e.g. 'node/1234567', so the seed script can re-run without duplicating.
  osm_id text unique,
  photos text[] not null default '{}',
  created_by uuid references auth.users (id) on delete set null,
  -- Places from the seed script are trusted; user-added ones start unverified.
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lat_range check (lat between -90 and 90),
  constraint lng_range check (lng between -180 and 180),
  constraint name_not_blank check (btrim(name) <> '')
);

create index places_category_idx on places (category);
create index places_school_idx on places (school_id);
-- Cheap bounding-box prefilter for "places near me".
create index places_latlng_idx on places (lat, lng);

create trigger places_touch_updated_at
  before update on places
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Hours corrections and other suggested edits. Anyone can file one; only
-- admins can act on it. Keeps the places table from being editable by all.
-- ---------------------------------------------------------------------------

create table place_suggestions (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- 'hours' | 'name' | 'category' | 'closed' | 'other'
  kind text not null,
  suggested_opening_hours text,
  message text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint kind_allowed check (kind in ('hours', 'name', 'category', 'closed', 'other'))
);

create index place_suggestions_place_idx on place_suggestions (place_id);
create index place_suggestions_open_idx on place_suggestions (created_at) where resolved_at is null;

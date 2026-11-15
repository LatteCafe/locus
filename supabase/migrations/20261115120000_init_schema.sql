-- Locus: extensions, private helper schema, and enums.

create extension if not exists "pgcrypto";

-- Private schema for helper functions. Not exposed over the API.
create schema if not exists app;
revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type place_category as enum (
  'library',
  'cafe',
  'dining_hall',
  'classroom',
  'coworking',
  'outdoor'
);

create type volume_level as enum ('loud', 'quiet', 'silent');

create type wifi_level as enum ('fast', 'slow', 'none');

create type friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');

-- ---------------------------------------------------------------------------
-- Time helpers. All week and month boundaries are America/Toronto, and weeks
-- start Monday 00:00 (Postgres date_trunc('week') is Monday-based).
--
-- These are STABLE rather than IMMUTABLE because timezone conversion depends
-- on the server's tz database, so they must not be used in index expressions.
-- ---------------------------------------------------------------------------

create or replace function app.local_date(ts timestamptz)
returns date
language sql
stable
set search_path = ''
as $$
  select (ts at time zone 'America/Toronto')::date;
$$;

create or replace function app.week_start(ts timestamptz)
returns date
language sql
stable
set search_path = ''
as $$
  select (date_trunc('week', ts at time zone 'America/Toronto'))::date;
$$;

create or replace function app.month_start(ts timestamptz)
returns date
language sql
stable
set search_path = ''
as $$
  select (date_trunc('month', ts at time zone 'America/Toronto'))::date;
$$;

comment on function app.week_start(timestamptz) is
  'Monday 00:00 America/Toronto of the week containing ts.';

-- ---------------------------------------------------------------------------
-- Distance helper: metres between two lat/lng pairs (haversine).
-- We avoid PostGIS: one formula is cheaper than an extension.
-- ---------------------------------------------------------------------------

create or replace function app.distance_metres(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
returns double precision
language sql
immutable
set search_path = ''
as $$
  select case
    when lat1 is null or lng1 is null or lat2 is null or lng2 is null then null
    else 6371000 * 2 * asin(
      sqrt(
        power(sin(radians(lat2 - lat1) / 2), 2) +
        cos(radians(lat1)) * cos(radians(lat2)) *
        power(sin(radians(lng2 - lng1) / 2), 2)
      )
    )
  end;
$$;

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function app.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

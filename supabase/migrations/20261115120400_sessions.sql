-- Locus: study sessions.
--
-- The timer is never a running counter. started_at, paused_seconds and
-- paused_at are the whole truth, so elapsed time is always computed from
-- timestamps and survives the app being killed or the phone locking.

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references places (id) on delete restrict,
  -- Optional course code, e.g. 'ECO102'.
  subject text,

  started_at timestamptz not null default now(),
  ended_at timestamptz,
  -- Total seconds spent paused and already banked.
  paused_seconds integer not null default 0,
  -- Set while the session is paused; null while it is running.
  paused_at timestamptz,

  pomodoro_used boolean not null default false,

  -- Where the user actually was at check-in, and how far that was from the
  -- place. We never block a check-in on this; it exists for review only.
  checkin_lat double precision,
  checkin_lng double precision,
  checkin_distance_m double precision,

  -- Flagged sessions still count in the user's own stats, but are excluded
  -- from every leaderboard.
  flagged boolean not null default false,
  flagged_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Duration, in seconds, net of pauses. Null until the session ends.
  duration_seconds integer generated always as (
    case
      when ended_at is null then null
      else greatest(
        0,
        floor(extract(epoch from (ended_at - started_at)))::integer - paused_seconds
      )
    end
  ) stored,

  constraint ends_after_start check (ended_at is null or ended_at >= started_at),
  constraint paused_seconds_sane check (paused_seconds >= 0),
  constraint not_paused_after_end check (ended_at is null or paused_at is null),
  constraint subject_length check (subject is null or char_length(subject) <= 20)
);

-- One live session per user. This is what stops a double check-in.
create unique index sessions_one_active_per_user
  on sessions (user_id)
  where ended_at is null;

create index sessions_user_started_idx on sessions (user_id, started_at desc);
create index sessions_place_idx on sessions (place_id);
create index sessions_started_idx on sessions (started_at desc);

create trigger sessions_touch_updated_at
  before update on sessions
  for each row execute function app.touch_updated_at();

-- Fill in checkin_distance_m from the place's coordinates, so the client
-- cannot understate how far away it was.
create or replace function app.set_checkin_distance()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  place_lat double precision;
  place_lng double precision;
begin
  if new.checkin_lat is null or new.checkin_lng is null then
    new.checkin_distance_m := null;
    return new;
  end if;

  select lat, lng into place_lat, place_lng
  from public.places
  where id = new.place_id;

  new.checkin_distance_m := app.distance_metres(
    new.checkin_lat, new.checkin_lng, place_lat, place_lng
  );
  return new;
end;
$$;

create trigger sessions_set_checkin_distance
  before insert on sessions
  for each row execute function app.set_checkin_distance();

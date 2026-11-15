-- Locus: everything derived. Hours, ranks, streaks and leaderboards are
-- computed from `sessions` here — never stored by hand.

-- ---------------------------------------------------------------------------
-- Crowd attributes per place.
--
-- security_invoker = false on purpose: this view runs as its owner so it can
-- aggregate every user's rating while `place_ratings` itself stays private.
-- It exposes only averages and counts, never which user said what.
--
-- The public 0–100 place score is computed from these aggregates on the
-- client (computePlaceScoreFromStats in src/config/ratings.ts) so that one
-- formula, with the app's default weights, is the single source of truth.
-- ---------------------------------------------------------------------------

create view place_attribute_stats with (security_invoker = false) as
select
  p.id as place_id,
  count(r.id) as rating_count,
  avg(r.atmosphere)::numeric(4, 2) as avg_atmosphere,
  avg(r.space)::numeric(4, 2) as avg_space,
  avg(r.food)::numeric(4, 2) as avg_food,
  avg(r.accessibility)::numeric(4, 2) as avg_accessibility,
  avg(r.outlets)::numeric(4, 2) as avg_outlets,
  avg(r.smell)::numeric(4, 2) as avg_smell,
  avg(r.washroom)::numeric(4, 2) as avg_washroom,
  count(*) filter (where r.wifi = 'fast') as wifi_fast_count,
  count(*) filter (where r.wifi = 'slow') as wifi_slow_count,
  count(*) filter (where r.wifi = 'none') as wifi_none_count,
  count(*) filter (where r.volume = 'loud') as volume_loud_count,
  count(*) filter (where r.volume = 'quiet') as volume_quiet_count,
  count(*) filter (where r.volume = 'silent') as volume_silent_count,
  mode() within group (order by r.wifi) as modal_wifi,
  mode() within group (order by r.volume) as modal_volume,
  -- Indicative only: the mean of raters' personal scores.
  avg(r.score)::numeric(5, 2) as avg_user_score
from places p
left join place_ratings r on r.place_id = p.id
group by p.id;

grant select on place_attribute_stats to authenticated;

-- How busy a place has been lately, for the map and place detail.
create view place_session_stats with (security_invoker = false) as
select
  p.id as place_id,
  count(s.id) filter (where s.started_at > now() - interval '30 days') as sessions_30d,
  count(distinct s.user_id) filter (where s.started_at > now() - interval '30 days')
    as unique_studiers_30d,
  count(s.id) filter (where s.ended_at is null) as active_sessions
from places p
left join sessions s on s.place_id = p.id
group by p.id;

grant select on place_session_stats to authenticated;

-- ---------------------------------------------------------------------------
-- The signed-in user's own transcript: one row per place they have studied at.
-- security_invoker = true, so the sessions/ratings RLS policies apply and a
-- user can only ever see their own rows.
-- ---------------------------------------------------------------------------

create view my_transcript with (security_invoker = true) as
select
  s.place_id,
  pl.name as place_name,
  pl.category,
  count(*) as session_count,
  sum(coalesce(s.duration_seconds, 0)) / 3600.0 as hours,
  min(s.started_at) as first_session_at,
  max(s.started_at) as last_session_at,
  r.score,
  r.updated_at as rated_at
from sessions s
join places pl on pl.id = s.place_id
left join place_ratings r on r.place_id = s.place_id and r.user_id = s.user_id
where s.user_id = auth.uid()
  and s.ended_at is not null
group by s.place_id, pl.name, pl.category, r.score, r.updated_at;

grant select on my_transcript to authenticated;

-- ---------------------------------------------------------------------------
-- Weekly hours per user. Flagged sessions are excluded, so this feeds the
-- leaderboards. A user's own stats use `my_weekly_hours` below, which counts
-- everything including flagged sessions.
-- ---------------------------------------------------------------------------

create view weekly_hours with (security_invoker = false) as
select
  s.user_id,
  app.week_start(s.started_at) as week_start,
  sum(coalesce(s.duration_seconds, 0)) / 3600.0 as hours,
  count(*) as session_count,
  count(distinct s.place_id) as distinct_places
from sessions s
where s.ended_at is not null
  and s.flagged = false
group by s.user_id, app.week_start(s.started_at);

-- Not granted to authenticated: reached only through the functions below,
-- which decide who may see whose hours.
revoke all on weekly_hours from authenticated;

-- ---------------------------------------------------------------------------
-- Current user's stats. These include flagged sessions: being flagged keeps
-- you off the leaderboards, it does not erase your own history.
-- ---------------------------------------------------------------------------

create or replace function my_week_stats(week_of timestamptz default now())
returns table (
  week_start date,
  hours numeric,
  session_count bigint,
  distinct_places bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    app.week_start(week_of) as week_start,
    coalesce(sum(coalesce(s.duration_seconds, 0)) / 3600.0, 0)::numeric as hours,
    count(s.id) as session_count,
    count(distinct s.place_id) as distinct_places
  from sessions s
  where s.user_id = auth.uid()
    and s.ended_at is not null
    and app.week_start(s.started_at) = app.week_start(week_of);
$$;

create or replace function my_month_stats(month_of timestamptz default now())
returns table (
  month_start date,
  hours numeric,
  session_count bigint,
  distinct_places bigint,
  distinct_subjects bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    app.month_start(month_of) as month_start,
    coalesce(sum(coalesce(s.duration_seconds, 0)) / 3600.0, 0)::numeric as hours,
    count(s.id) as session_count,
    count(distinct s.place_id) as distinct_places,
    count(distinct s.subject) as distinct_subjects
  from sessions s
  where s.user_id = auth.uid()
    and s.ended_at is not null
    and app.month_start(s.started_at) = app.month_start(month_of);
$$;

-- ---------------------------------------------------------------------------
-- Streaks: consecutive days (America/Toronto) with at least one qualifying
-- session. `min_minutes` defaults to 25, matching SESSION_CONFIG.
-- ---------------------------------------------------------------------------

create or replace function app.current_streak(p_user uuid, p_min_minutes integer default 25)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  with qualifying_days as (
    select distinct app.local_date(s.started_at) as day
    from public.sessions s
    where s.user_id = p_user
      and s.ended_at is not null
      and coalesce(s.duration_seconds, 0) >= p_min_minutes * 60
  ),
  islands as (
    select day, day - (row_number() over (order by day))::integer as grp
    from qualifying_days
  ),
  runs as (
    select grp, max(day) as last_day, count(*)::integer as length
    from islands
    group by grp
  )
  -- A run counts as current if it reaches today or yesterday: today is not
  -- over yet, so missing it does not break the streak until tomorrow.
  select coalesce(
    (
      select length
      from runs
      where last_day >= app.local_date(now()) - 1
      order by last_day desc
      limit 1
    ),
    0
  );
$$;

create or replace function my_streak(min_minutes integer default 25)
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select app.current_streak(auth.uid(), min_minutes);
$$;

-- ---------------------------------------------------------------------------
-- Leaderboards. Hours and streaks only — never a place, never a location.
-- `scope` is 'friends' (accepted friends plus yourself) or 'school'
-- (everyone at the caller's school).
-- ---------------------------------------------------------------------------

create or replace function weekly_hours_leaderboard(
  scope text default 'friends',
  week_of timestamptz default now(),
  max_rows integer default 100
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  equipped_cosmetic_id uuid,
  hours numeric,
  is_me boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select p.id, p.school_id from public.profiles p where p.id = auth.uid()
  ),
  eligible as (
    select p.id, p.display_name, p.username, p.avatar_url, p.equipped_cosmetic_id
    from public.profiles p, me
    where p.onboarding_completed_at is not null
      and (
        (scope = 'school' and p.school_id is not distinct from me.school_id)
        or (scope = 'friends' and (p.id = me.id or app.are_friends(me.id, p.id)))
      )
  )
  select
    e.id,
    e.display_name,
    e.username,
    e.avatar_url,
    e.equipped_cosmetic_id,
    coalesce(w.hours, 0)::numeric as hours,
    e.id = auth.uid() as is_me
  from eligible e
  left join public.weekly_hours w
    on w.user_id = e.id and w.week_start = app.week_start(week_of)
  where coalesce(w.hours, 0) > 0 or e.id = auth.uid()
  order by coalesce(w.hours, 0) desc, e.username asc
  limit greatest(1, least(max_rows, 500));
$$;

create or replace function streak_leaderboard(
  scope text default 'friends',
  min_minutes integer default 25,
  max_rows integer default 100
)
returns table (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  equipped_cosmetic_id uuid,
  streak_days integer,
  is_me boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (
    select p.id, p.school_id from public.profiles p where p.id = auth.uid()
  ),
  eligible as (
    select p.id, p.display_name, p.username, p.avatar_url, p.equipped_cosmetic_id
    from public.profiles p, me
    where p.onboarding_completed_at is not null
      and (
        (scope = 'school' and p.school_id is not distinct from me.school_id)
        or (scope = 'friends' and (p.id = me.id or app.are_friends(me.id, p.id)))
      )
  )
  select
    e.id,
    e.display_name,
    e.username,
    e.avatar_url,
    e.equipped_cosmetic_id,
    app.current_streak(e.id, min_minutes) as streak_days,
    e.id = auth.uid() as is_me
  from eligible e
  order by app.current_streak(e.id, min_minutes) desc, e.username asc
  limit greatest(1, least(max_rows, 500));
$$;

grant execute on function my_week_stats(timestamptz) to authenticated;
grant execute on function my_month_stats(timestamptz) to authenticated;
grant execute on function my_streak(integer) to authenticated;
grant execute on function weekly_hours_leaderboard(text, timestamptz, integer) to authenticated;
grant execute on function streak_leaderboard(text, integer, integer) to authenticated;

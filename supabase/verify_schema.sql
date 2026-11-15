-- Locus schema check.
--
-- Paste this whole file into the Supabase dashboard's SQL Editor and run it.
-- Every row should say OK. Anything that says MISSING means that migration
-- did not get applied.

with expected as (
  select 'table' as kind, unnest(array[
    'app_admins','cosmetics','friendships','invitation_joins','invitations',
    'place_ratings','place_suggestions','places','profiles','referrals',
    'sessions','user_cosmetics'
  ]) as name
  union all
  select 'view', unnest(array[
    'admin_suspicious_weeks','my_transcript','place_attribute_stats',
    'place_session_stats','weekly_hours'
  ])
  union all
  select 'function', unnest(array[
    'admin_suspicious_weeks_list','complete_onboarding','delete_my_account',
    'my_month_stats','my_streak','my_week_stats','streak_leaderboard',
    'username_available','weekly_hours_leaderboard'
  ])
),
actual as (
  select 'table' as kind, tablename as name from pg_tables where schemaname = 'public'
  union all
  select 'view', viewname from pg_views where schemaname = 'public'
  union all
  select 'function', p.proname
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
)
select
  e.kind,
  e.name,
  case when a.name is null then 'MISSING' else 'OK' end as status
from expected e
left join actual a on a.kind = e.kind and a.name = e.name

union all

-- Every table must have Row Level Security switched on.
select
  'rls',
  tablename,
  case when rowsecurity then 'OK' else 'MISSING - RLS IS OFF' end
from pg_tables
where schemaname = 'public'

union all

select
  'policy count',
  'expect 34',
  case when count(*) >= 34 then 'OK (' || count(*) || ')' else 'MISSING (only ' || count(*) || ')' end
from pg_policies where schemaname = 'public'

union all

select
  'storage buckets',
  'avatars + place-photos',
  case when count(*) >= 2 then 'OK' else 'MISSING (only ' || count(*) || ')' end
from storage.buckets where id in ('avatars', 'place-photos')

union all

-- Weeks must start Monday in Toronto time. 2026-11-15 23:00 Toronto is a
-- Sunday night, so it still belongs to the week starting Monday 2026-11-09.
select
  'week boundary',
  'Toronto Monday start',
  case
    when app.week_start('2026-11-15 23:00:00-05'::timestamptz) = '2026-11-09'::date
    then 'OK'
    else 'WRONG: got ' || app.week_start('2026-11-15 23:00:00-05'::timestamptz)
  end

order by 1, 2;

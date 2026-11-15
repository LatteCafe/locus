-- Locus: the anti-cheat review view, and in-app account deletion.

-- ---------------------------------------------------------------------------
-- Anti-cheat review.
--
-- We never block a check-in on GPS: accuracy indoors is bad, and a student
-- stuck behind a stone library wall is not a cheater. Instead every session
-- records how far the check-in was from the place, and this view surfaces the
-- users whose week is mostly made of far-away check-ins, so they can be
-- reviewed by hand.
--
-- Flagging is a manual step:
--   update sessions set flagged = true, flagged_reason = 'gps'
--   where user_id = '<uuid>' and started_at >= '<date>';
--
-- Flagged sessions drop out of every leaderboard but still count in the
-- user's own stats.
-- ---------------------------------------------------------------------------

create view admin_suspicious_weeks with (security_invoker = false) as
with scored as (
  select
    s.user_id,
    app.week_start(s.started_at) as week_start,
    coalesce(s.duration_seconds, 0) as duration_seconds,
    s.checkin_distance_m,
    -- A session counts as "far" when we have a location for it and it was
    -- further than the threshold in SESSION_CONFIG.farCheckInMetres.
    (s.checkin_distance_m is not null and s.checkin_distance_m > 300) as is_far,
    (s.checkin_distance_m is null) as is_unlocated
  from sessions s
  where s.ended_at is not null
)
select
  scored.user_id,
  p.username,
  p.display_name,
  scored.week_start,
  round((sum(scored.duration_seconds) / 3600.0)::numeric, 2) as total_hours,
  round((sum(scored.duration_seconds) filter (where scored.is_far) / 3600.0)::numeric, 2)
    as far_hours,
  round(
    (
      100.0 * sum(scored.duration_seconds) filter (where scored.is_far)
      / nullif(sum(scored.duration_seconds), 0)
    )::numeric,
    1
  ) as far_hours_pct,
  count(*) as session_count,
  count(*) filter (where scored.is_far) as far_session_count,
  count(*) filter (where scored.is_unlocated) as unlocated_session_count,
  round(max(scored.checkin_distance_m)::numeric, 0) as max_distance_m
from scored
join profiles p on p.id = scored.user_id
group by scored.user_id, p.username, p.display_name, scored.week_start
having sum(scored.duration_seconds) > 0
   and sum(scored.duration_seconds) filter (where scored.is_far)
       > 0.5 * sum(scored.duration_seconds)
order by far_hours desc;

comment on view admin_suspicious_weeks is
  'Users whose weekly hours come mostly from check-ins more than 300 m from the place. Review by hand; nothing here is flagged automatically.';

-- Admins only. The view bypasses RLS to aggregate, so the gate lives here.
create or replace function admin_suspicious_weeks_list()
returns setof admin_suspicious_weeks
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.admin_suspicious_weeks where app.is_admin();
$$;

revoke all on admin_suspicious_weeks from authenticated;
grant execute on function admin_suspicious_weeks_list() to authenticated;

-- ---------------------------------------------------------------------------
-- In-app account deletion. Apple requires this, and it has to be real: this
-- deletes the auth user, which cascades to the profile, sessions, ratings,
-- friendships, invitations, referrals and cosmetic unlocks.
--
-- Places the user added are kept (other people rely on them) with their
-- created_by set to null by the existing foreign key.
-- ---------------------------------------------------------------------------

create or replace function delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  -- Explicit, so the intent is on the record even though the cascades from
  -- auth.users would handle most of it.
  delete from public.sessions where user_id = uid;
  delete from public.place_ratings where user_id = uid;
  delete from public.invitation_joins where user_id = uid;
  delete from public.invitations where user_id = uid;
  delete from public.friendships where requester_id = uid or addressee_id = uid;
  delete from public.user_cosmetics where user_id = uid;
  delete from public.referrals where referrer_id = uid or referred_user_id = uid;
  delete from public.place_suggestions where user_id = uid;
  delete from public.profiles where id = uid;

  -- Cascades away everything else, and signs the user out everywhere.
  delete from auth.users where id = uid;
end;
$$;

grant execute on function delete_my_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Username availability. Usernames are unique but profiles are readable, so
-- this is only a convenience for the onboarding screen.
-- ---------------------------------------------------------------------------

create or replace function username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate is not null
    and lower(btrim(candidate)) ~ '^[a-z0-9_]{3,20}$'
    and not exists (
      select 1 from public.profiles
      where username = lower(btrim(candidate))
        and id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
    );
$$;

grant execute on function username_available(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Finishing onboarding. Done in one function so the referral row and the
-- profile update cannot disagree.
-- ---------------------------------------------------------------------------

create or replace function complete_onboarding(
  p_first_name text,
  p_display_name text,
  p_username text,
  p_school_id text,
  p_courses text[],
  p_preferred_volume volume_level,
  p_referral_code text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  referrer uuid;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  if p_referral_code is not null and btrim(p_referral_code) <> '' then
    select id into referrer
    from public.profiles
    where referral_code = upper(btrim(p_referral_code))
      and id <> uid;
  end if;

  update public.profiles
  set first_name = btrim(p_first_name),
      display_name = btrim(p_display_name),
      username = p_username,
      school_id = p_school_id,
      courses = coalesce(p_courses, '{}'),
      preferred_volume = p_preferred_volume,
      referred_by = coalesce(referred_by, referrer),
      onboarding_completed_at = coalesce(onboarding_completed_at, now())
  where id = uid;

  if referrer is not null then
    insert into public.referrals (referrer_id, referred_user_id)
    values (referrer, uid)
    on conflict (referred_user_id) do nothing;
  end if;
end;
$$;

grant execute on function complete_onboarding(text, text, text, text, text[], volume_level, text)
  to authenticated;

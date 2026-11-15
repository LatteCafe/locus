-- Locus: user profiles and admin list.

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  first_name text,
  -- Always stored lowercase (normalised by a trigger), so a plain unique
  -- index gives us case-insensitive usernames without the citext extension.
  username text unique,
  avatar_url text,
  school_id text,
  courses text[] not null default '{}',
  preferred_volume volume_level not null default 'silent',
  -- Per-user attribute weights, e.g. {"atmosphere": 20, "wifi": 10}.
  -- Null means "use the app defaults" (see src/config/ratings.ts).
  rating_weights jsonb,
  equipped_cosmetic_id uuid,
  referral_code text not null unique,
  referred_by uuid references auth.users (id) on delete set null,
  -- Opt-in, friends-only. Off by default, and nothing but this flag ever
  -- exposes a user's sessions to a friend.
  location_sharing boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (
    username is null or username ~ '^[a-z0-9_]{3,20}$'
  ),
  constraint courses_length check (array_length(courses, 1) is null or array_length(courses, 1) <= 20)
);

comment on column profiles.rating_weights is
  'Nullable per-user attribute weights. Null = app defaults.';

create index profiles_school_idx on profiles (school_id);
create index profiles_referred_by_idx on profiles (referred_by);

create trigger profiles_touch_updated_at
  before update on profiles
  for each row execute function app.touch_updated_at();

-- Usernames are case-insensitive: we lowercase and trim on the way in.
create or replace function app.normalise_username()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.username is not null then
    new.username := lower(btrim(new.username));
    if new.username = '' then
      new.username := null;
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_normalise_username
  before insert or update of username on profiles
  for each row execute function app.normalise_username();

-- ---------------------------------------------------------------------------
-- Referral codes: 8 characters from an unambiguous alphabet (no I, O, 0, 1).
-- ---------------------------------------------------------------------------

create or replace function app.generate_referral_code()
returns text
language plpgsql
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  attempt integer := 0;
begin
  loop
    candidate := '';
    for i in 1..8 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;

    exit when not exists (select 1 from public.profiles where referral_code = candidate);

    attempt := attempt + 1;
    if attempt > 20 then
      raise exception 'could not generate a unique referral code';
    end if;
  end loop;

  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- Every auth user gets a bare profile row immediately. Onboarding fills in
-- the rest and stamps onboarding_completed_at.
-- ---------------------------------------------------------------------------

create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, referral_code)
  values (new.id, app.generate_referral_code())
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();

-- ---------------------------------------------------------------------------
-- Admins. Rows are added by hand in the Supabase SQL editor:
--   insert into app_admins (user_id) values ('<uuid>');
-- ---------------------------------------------------------------------------

create table app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function app.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.app_admins where user_id = auth.uid());
$$;

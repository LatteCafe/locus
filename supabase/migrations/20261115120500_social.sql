-- Locus: friendships, invitations, referrals.

-- ---------------------------------------------------------------------------
-- Friendships. One row per pair, always stored with the requester first.
-- ---------------------------------------------------------------------------

create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_friendship check (requester_id <> addressee_id)
);

-- At most one friendship row per unordered pair, in either direction.
create unique index friendships_pair_idx
  on friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index friendships_requester_idx on friendships (requester_id, status);
create index friendships_addressee_idx on friendships (addressee_id, status);

create trigger friendships_touch_updated_at
  before update on friendships
  for each row execute function app.touch_updated_at();

-- True when the two users have an accepted friendship. Security definer so
-- RLS policies can use it without recursing into friendships' own policies.
create or replace function app.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = a and f.addressee_id = b) or
        (f.requester_id = b and f.addressee_id = a)
      )
  );
$$;

-- True when `owner` shares their sessions and `viewer` is an accepted friend.
create or replace function app.can_see_sessions_of(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    owner = auth.uid()
    or (
      exists (
        select 1 from public.profiles p
        where p.id = owner and p.location_sharing = true
      )
      and app.are_friends(auth.uid(), owner)
    );
$$;

-- ---------------------------------------------------------------------------
-- "Come study with me" invitations, and who joined.
-- ---------------------------------------------------------------------------

create table invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references places (id) on delete cascade,
  subject text,
  message text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  school_id text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expires_after_start check (expires_at > starts_at),
  constraint message_length check (message is null or char_length(message) <= 280),
  constraint invitation_subject_length check (subject is null or char_length(subject) <= 20)
);

create index invitations_open_idx on invitations (expires_at desc) where cancelled_at is null;
create index invitations_subject_idx on invitations (subject);
create index invitations_user_idx on invitations (user_id);

create trigger invitations_touch_updated_at
  before update on invitations
  for each row execute function app.touch_updated_at();

create table invitation_joins (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (invitation_id, user_id)
);

create index invitation_joins_invitation_idx on invitation_joins (invitation_id);

-- ---------------------------------------------------------------------------
-- Referrals. One row per referred user, written when they finish onboarding.
-- ---------------------------------------------------------------------------

create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users (id) on delete cascade,
  referred_user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint no_self_referral check (referrer_id <> referred_user_id)
);

create index referrals_referrer_idx on referrals (referrer_id);

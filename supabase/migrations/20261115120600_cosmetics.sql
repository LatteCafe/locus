-- Locus: cosmetics. New items are added as rows, never as app releases, so
-- the client renders whatever the catalogue says.

create table cosmetics (
  id uuid primary key default gen_random_uuid(),
  -- Stable string the client uses to pick a renderer, e.g. 'frame'.
  kind text not null,
  -- Stable key, e.g. 'open_to_work'.
  key text not null unique,
  name text not null,
  description text,
  -- How it is drawn: colours, label, border style. Shape depends on `kind`.
  -- e.g. {"label": "OPEN TO WORK", "ringColor": "#6F4E37"}
  style jsonb not null default '{}',
  -- How it is earned: 'referrals' with {"count": 3}, or 'default'.
  unlock_rule text not null default 'default',
  unlock_params jsonb not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint cosmetic_kind_allowed check (kind in ('frame', 'badge')),
  constraint unlock_rule_allowed check (unlock_rule in ('default', 'referrals'))
);

create table user_cosmetics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cosmetic_id uuid not null references cosmetics (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, cosmetic_id)
);

create index user_cosmetics_user_idx on user_cosmetics (user_id);

alter table profiles
  add constraint profiles_equipped_cosmetic_fkey
  foreign key (equipped_cosmetic_id) references cosmetics (id) on delete set null;

-- The first cosmetic. Phase 8 adds the unlock logic; this is the catalogue row.
insert into cosmetics (kind, key, name, description, style, unlock_rule, unlock_params, sort_order)
values (
  'frame',
  'open_to_work',
  'Open to Work',
  'For the perpetually available.',
  '{"label": "OPEN TO WORK", "ringColor": "#6F4E37", "labelColor": "#FFFFFF"}',
  'referrals',
  '{"count": 3}',
  10
);

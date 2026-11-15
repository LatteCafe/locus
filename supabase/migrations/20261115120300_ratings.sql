-- Locus: one rating row per user per place. "Rerank" updates the row.

create table place_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references places (id) on delete cascade,

  -- Atmosphere is the only required attribute; everything else is skippable
  -- and stays null.
  atmosphere smallint not null,
  wifi wifi_level,
  -- Stored as a category. It becomes a score using the rater's preferred
  -- volume, so the same room scores differently for different people.
  volume volume_level,
  space smallint,
  food smallint,
  accessibility smallint,
  outlets smallint,
  smell smallint,
  washroom smallint,

  -- The rater's own 0–100 score, computed on the client with their weights
  -- and volume preference (see computePlaceScore in src/config/ratings.ts).
  -- This powers their transcript. The public score for a place is derived
  -- from aggregated attributes instead, so it does not depend on who rated.
  score smallint,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, place_id),
  constraint atmosphere_range check (atmosphere between 1 and 5),
  constraint space_range check (space is null or space between 1 and 5),
  constraint food_range check (food is null or food between 1 and 5),
  constraint accessibility_range check (accessibility is null or accessibility between 1 and 5),
  constraint outlets_range check (outlets is null or outlets between 1 and 5),
  constraint smell_range check (smell is null or smell between 1 and 5),
  constraint washroom_range check (washroom is null or washroom between 1 and 5),
  constraint score_range check (score is null or score between 0 and 100)
);

create index place_ratings_place_idx on place_ratings (place_id);
create index place_ratings_user_idx on place_ratings (user_id);

create trigger place_ratings_touch_updated_at
  before update on place_ratings
  for each row execute function app.touch_updated_at();

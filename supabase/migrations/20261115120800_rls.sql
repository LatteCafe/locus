-- Locus: Row Level Security. RLS is on for every table, and the default is
-- "no access" — each policy below is a deliberate exception.
--
-- The two rules that matter most:
--   * A user can only ever write their own rows.
--   * A friend can see your sessions only while your location_sharing is on,
--     and nobody — friend or not — can see where you are right now unless
--     you turned that on. Leaderboards expose hours and streaks, never places.

alter table profiles enable row level security;
alter table app_admins enable row level security;
alter table places enable row level security;
alter table place_suggestions enable row level security;
alter table place_ratings enable row level security;
alter table sessions enable row level security;
alter table friendships enable row level security;
alter table invitations enable row level security;
alter table invitation_joins enable row level security;
alter table referrals enable row level security;
alter table cosmetics enable row level security;
alter table user_cosmetics enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: readable by any signed-in user (friend search, leaderboards,
-- feed). Profiles hold no location data. Writable only by their owner.
-- ---------------------------------------------------------------------------

create policy profiles_select_authenticated on profiles
  for select to authenticated
  using (true);

create policy profiles_insert_own on profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_own on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_delete_own on profiles
  for delete to authenticated
  using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- app_admins: you can see whether you are an admin, nothing else. Rows are
-- added by hand in the SQL editor.
-- ---------------------------------------------------------------------------

create policy app_admins_select_self on app_admins
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- places: everyone reads. Anyone can add a missing place; only its creator
-- (or an admin) can edit it. Corrections to someone else's place go through
-- place_suggestions.
-- ---------------------------------------------------------------------------

create policy places_select_authenticated on places
  for select to authenticated
  using (true);

create policy places_insert_own on places
  for insert to authenticated
  with check (created_by = auth.uid());

create policy places_update_own_or_admin on places
  for update to authenticated
  using (created_by = auth.uid() or app.is_admin())
  with check (created_by = auth.uid() or app.is_admin());

create policy places_delete_admin on places
  for delete to authenticated
  using (app.is_admin());

-- ---------------------------------------------------------------------------
-- place_suggestions: file your own, see your own (admins see all).
-- ---------------------------------------------------------------------------

create policy place_suggestions_select_own_or_admin on place_suggestions
  for select to authenticated
  using (user_id = auth.uid() or app.is_admin());

create policy place_suggestions_insert_own on place_suggestions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy place_suggestions_update_admin on place_suggestions
  for update to authenticated
  using (app.is_admin())
  with check (app.is_admin());

-- ---------------------------------------------------------------------------
-- place_ratings: your own rows, plus a sharing friend's. Crowd attributes
-- reach everyone through the place_attribute_stats view, which aggregates
-- without revealing who rated what.
-- ---------------------------------------------------------------------------

create policy place_ratings_select_own_or_friend on place_ratings
  for select to authenticated
  using (user_id = auth.uid() or app.can_see_sessions_of(user_id));

create policy place_ratings_insert_own on place_ratings
  for insert to authenticated
  with check (user_id = auth.uid());

create policy place_ratings_update_own on place_ratings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy place_ratings_delete_own on place_ratings
  for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- sessions: your own always. A friend's only while that friend has
-- location_sharing on. This is the one table that reveals where someone is.
-- ---------------------------------------------------------------------------

create policy sessions_select_own_or_sharing_friend on sessions
  for select to authenticated
  using (user_id = auth.uid() or app.can_see_sessions_of(user_id));

create policy sessions_insert_own on sessions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy sessions_update_own on sessions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy sessions_delete_own on sessions
  for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- friendships: both parties see the row. The requester creates and cancels;
-- the addressee accepts or declines.
-- ---------------------------------------------------------------------------

create policy friendships_select_involved on friendships
  for select to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy friendships_insert_as_requester on friendships
  for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pending');

create policy friendships_update_involved on friendships
  for update to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid())
  with check (requester_id = auth.uid() or addressee_id = auth.uid());

create policy friendships_delete_involved on friendships
  for delete to authenticated
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- ---------------------------------------------------------------------------
-- invitations: deliberately discoverable across the school — the whole point
-- is finding someone in your course. An invitation names a place the poster
-- chose to publish, which is not the same as live location sharing.
-- ---------------------------------------------------------------------------

create policy invitations_select_school on invitations
  for select to authenticated
  using (
    user_id = auth.uid()
    or school_id is not distinct from (
      select p.school_id from profiles p where p.id = auth.uid()
    )
  );

create policy invitations_insert_own on invitations
  for insert to authenticated
  with check (user_id = auth.uid());

create policy invitations_update_own on invitations
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy invitations_delete_own on invitations
  for delete to authenticated
  using (user_id = auth.uid());

-- invitation_joins: the poster sees who joined; joiners see their own row.
create policy invitation_joins_select_related on invitation_joins
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );

create policy invitation_joins_insert_own on invitation_joins
  for insert to authenticated
  with check (user_id = auth.uid());

create policy invitation_joins_delete_own on invitation_joins
  for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- referrals: see referrals you made and the one that brought you in. Rows
-- are written by a trigger, not by the client.
-- ---------------------------------------------------------------------------

create policy referrals_select_involved on referrals
  for select to authenticated
  using (referrer_id = auth.uid() or referred_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- cosmetics: the catalogue is public to signed-in users. Unlocks are granted
-- server-side, so there is no insert policy for users.
-- ---------------------------------------------------------------------------

create policy cosmetics_select_active on cosmetics
  for select to authenticated
  using (active = true);

create policy user_cosmetics_select_visible on user_cosmetics
  for select to authenticated
  using (true);

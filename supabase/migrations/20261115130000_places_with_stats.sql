-- Locus: one row per place, with its crowd attributes and activity attached.
--
-- The map and the recommendations screen both want a place plus its ratings
-- summary plus how busy it has been. Without this they would need three
-- round trips and a client-side join.
--
-- security_invoker = false, like the views it builds on: it aggregates every
-- user's ratings while `place_ratings` itself stays private. Nothing here
-- identifies who rated what.

create view places_with_stats with (security_invoker = false) as
select
  p.id,
  p.name,
  p.category,
  p.lat,
  p.lng,
  p.address,
  p.opening_hours,
  p.hours_note,
  p.school_id,
  p.osm_id,
  p.photos,
  p.verified,
  p.created_by,
  p.created_at,

  coalesce(s.rating_count, 0) as rating_count,
  s.avg_atmosphere,
  s.avg_space,
  s.avg_food,
  s.avg_accessibility,
  s.avg_outlets,
  s.avg_smell,
  s.avg_washroom,
  coalesce(s.wifi_fast_count, 0) as wifi_fast_count,
  coalesce(s.wifi_slow_count, 0) as wifi_slow_count,
  coalesce(s.wifi_none_count, 0) as wifi_none_count,
  coalesce(s.volume_loud_count, 0) as volume_loud_count,
  coalesce(s.volume_quiet_count, 0) as volume_quiet_count,
  coalesce(s.volume_silent_count, 0) as volume_silent_count,
  s.modal_wifi,
  s.modal_volume,

  coalesce(a.sessions_30d, 0) as sessions_30d,
  coalesce(a.unique_studiers_30d, 0) as unique_studiers_30d,
  coalesce(a.active_sessions, 0) as active_sessions
from places p
left join place_attribute_stats s on s.place_id = p.id
left join place_session_stats a on a.place_id = p.id;

grant select on places_with_stats to authenticated;

comment on view places_with_stats is
  'Places plus aggregated crowd attributes and recent activity. The 0-100 score is computed on the client, weighted by the viewer''s own preferences.';

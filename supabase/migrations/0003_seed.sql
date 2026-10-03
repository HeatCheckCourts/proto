-- ============================================================================
--  HEATCHECK · 0003 — seed data
--  The rules row and the 5 prototype courts. Safe to re-run: existing rows
--  are updated in place rather than duplicated.
--
--  Coordinates are APPROXIMATE (roughly where each park's courts are). Check-in
--  only works within checkin_radius_m (150 m), so before real use, drop a pin on
--  the actual court in Google Maps and update lat/lng in the Table Editor.
-- ============================================================================

insert into public.app_config (id) values (true)
on conflict (id) do nothing;  -- keeps any rule values you've already tuned

insert into public.courts (id, name, area, lat, lng, surface, capacity, checkin_radius_m) values
  ('clissold',     'Clissold Park',   'Stoke Newington · N16', 51.5615, -0.0865, 'Tarmac · 2 full courts',          12, 150),
  ('londonfields', 'London Fields',   'Hackney · E8',          51.5418, -0.0607, 'Painted concrete · 1 full court',  10, 150),
  ('clapham',      'Clapham Common',  'Clapham · SW4',         51.4598, -0.1460, 'Tarmac · 2 half courts',           10, 150),
  ('haggerston',   'Haggerston Park', 'Hackney · E2',          51.5330, -0.0680, 'Rubberised · 1 full court',        10, 150),
  ('finsbury',     'Finsbury Park',   'Finsbury Park · N4',    51.5675, -0.1035, 'Tarmac · 3 hoops',                  9, 150)
on conflict (id) do update set
  name = excluded.name, area = excluded.area, lat = excluded.lat, lng = excluded.lng,
  surface = excluded.surface, capacity = excluded.capacity, checkin_radius_m = excluded.checkin_radius_m;

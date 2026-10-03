-- ============================================================================
--  HEATCHECK · 0002 — row level security and column permissions
--
--  Supabase gives the public roles (anon = signed out, authenticated = signed
--  in) full access to new tables by default. We take that away and grant back
--  only what each role needs. RLS then decides which ROWS they can touch.
--
--  Check-ins and intents have NO client write access at all: they can only be
--  created/changed through server functions (Stage 4) that verify distance,
--  timing and the one-active-per-user rules. That's how "never trust the
--  client" is enforced — a user can't just insert a check-in row directly.
-- ============================================================================

alter table public.app_config  enable row level security;
alter table public.profiles    enable row level security;
alter table public.courts      enable row level security;
alter table public.checkins    enable row level security;
alter table public.intents     enable row level security;
alter table public.runs        enable row level security;
alter table public.run_signups enable row level security;

revoke all on public.app_config, public.profiles, public.courts, public.checkins,
              public.intents, public.runs, public.run_signups
  from anon, authenticated;

-- ---------------------------------------------------------------------------
-- app_config + courts: anyone can read, nobody can write from the app.
-- (You edit them in the Supabase dashboard, which bypasses RLS.)
-- ---------------------------------------------------------------------------
grant select on public.app_config, public.courts to anon, authenticated;

create policy "Anyone can read the rules" on public.app_config
  for select to anon, authenticated using (true);

create policy "Anyone can read courts" on public.courts
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- profiles: public "player card" columns are readable by anyone (needed to
-- show who's on court and who's hosting). Birth year and show-up stats are
-- private: readable only by the owner via my_profile() below.
-- Users can create and edit only their own profile, and only these columns —
-- they can't touch their stats, and birth year is set once at sign-up.
-- ---------------------------------------------------------------------------
grant select (id, display_name, photo_url, skill_level) on public.profiles to anon, authenticated;
grant insert (id, display_name, photo_url, skill_level, birth_year) on public.profiles to authenticated;
grant update (display_name, photo_url, skill_level) on public.profiles to authenticated;

create policy "Anyone can read player cards" on public.profiles
  for select to anon, authenticated using (true);

create policy "Users create their own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

create policy "Users edit their own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- The signed-in user's full profile, including private columns.
create function public.my_profile() returns setof public.profiles
language sql stable security definer set search_path = '' as $$
  select * from public.profiles where id = auth.uid();
$$;
revoke execute on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;

-- ---------------------------------------------------------------------------
-- checkins + intents: users can read their OWN rows only. Nobody can insert,
-- update or delete from the app — Stage 4's server functions do that.
-- Court-level numbers (heat, who's on court) are exposed by Stage 4 functions.
-- ---------------------------------------------------------------------------
grant select on public.checkins, public.intents to authenticated;

create policy "Users read their own check-ins" on public.checkins
  for select to authenticated using (user_id = auth.uid());

create policy "Users read their own intents" on public.intents
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- runs: anyone can read. Signed-in users can post runs as themselves, and
-- edit/cancel only runs they host. No hard deletes — set cancelled_at.
-- ---------------------------------------------------------------------------
grant select on public.runs to anon, authenticated;
grant insert (court_id, host_id, starts_at, skill, format, spots) on public.runs to authenticated;
grant update (starts_at, skill, format, spots, cancelled_at) on public.runs to authenticated;

create policy "Anyone can read runs" on public.runs
  for select to anon, authenticated using (true);

create policy "Users host runs as themselves" on public.runs
  for insert to authenticated with check (host_id = auth.uid());

create policy "Hosts edit their own runs" on public.runs
  for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());

-- ---------------------------------------------------------------------------
-- run_signups: anyone can read (to show spots left). Signed-in users can
-- join or leave runs as themselves only.
-- ---------------------------------------------------------------------------
grant select on public.run_signups to anon, authenticated;
grant insert (run_id, user_id) on public.run_signups to authenticated;
grant delete on public.run_signups to authenticated;

create policy "Anyone can read signups" on public.run_signups
  for select to anon, authenticated using (true);

create policy "Users join runs as themselves" on public.run_signups
  for insert to authenticated with check (user_id = auth.uid());

create policy "Users leave runs they joined" on public.run_signups
  for delete to authenticated using (user_id = auth.uid());

-- Trigger functions run as the caller; they must not be callable directly.
revoke execute on function public.enforce_min_age(), public.enforce_run_signup() from public, anon, authenticated;

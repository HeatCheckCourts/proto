-- ============================================================================
--  HEATCHECK · 0001 — core schema
--  Tables, constraints and indexes. No security rules here (see 0002) and no
--  data (see 0003). Safe to run once on a fresh project.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- app_config — exactly one row holding the game rules, so they can be tuned
-- without redeploying the app. Server functions (Stage 4/5) read from here.
-- ---------------------------------------------------------------------------
create table public.app_config (
  id                     boolean primary key default true check (id),  -- forces a single row
  checkin_radius_m       int not null default 150 check (checkin_radius_m > 0),   -- default radius for new courts
  max_accuracy_m         int not null default 250 check (max_accuracy_m > 0),     -- reject GPS fixes less accurate than this
  checkin_cooldown_min   int not null default 10  check (checkin_cooldown_min >= 0), -- wait after leaving before checking in at a different court
  checkin_max_min        int not null default 90  check (checkin_max_min > 0),    -- check-ins auto-end after this
  still_here_prompt_min  int not null default 80  check (still_here_prompt_min > 0), -- app asks "still here?" at this age
  intent_grace_min       int not null default 30  check (intent_grace_min >= 0),  -- "on my way" expires at ETA + this
  intent_window_min      int not null default 60  check (intent_window_min > 0),  -- only ETAs within this window count toward projected heat
  check (still_here_prompt_min < checkin_max_min)
);

-- ---------------------------------------------------------------------------
-- profiles — one per signed-in user (id = auth user id).
-- Show-up stats are maintained by server functions only, never by the client.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text not null check (char_length(btrim(display_name)) between 1 and 30),
  photo_url        text,
  skill_level      text not null check (skill_level in ('beginner', 'intermediate', 'advanced')),
  birth_year       int  not null check (birth_year between 1900 and 2100),
  intents_total    int  not null default 0 check (intents_total >= 0),   -- "on my way"s that have resolved as arrived or expired
  intents_arrived  int  not null default 0 check (intents_arrived >= 0), -- ...of which the user actually checked in
  created_at       timestamptz not null default now(),
  check (intents_arrived <= intents_total)
);

-- Under-13s are blocked. Birth year alone can't tell whether this year's
-- birthday has passed, so we only accept people who are certainly 13+.
create function public.enforce_min_age() returns trigger
language plpgsql as $$
begin
  if extract(year from now())::int - new.birth_year < 14 then
    raise exception 'HeatCheck is for players aged 13 and over.'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger profiles_min_age
  before insert or update of birth_year on public.profiles
  for each row execute function public.enforce_min_age();

-- ---------------------------------------------------------------------------
-- courts — the venues. id is a readable slug used in URLs (/court/clissold).
-- ---------------------------------------------------------------------------
create table public.courts (
  id                text primary key check (id ~ '^[a-z0-9-]+$'),
  name              text not null,
  area              text not null,
  lat               double precision not null check (lat between -90 and 90),
  lng               double precision not null check (lng between -180 and 180),
  surface           text not null,
  capacity          int  not null check (capacity > 0),
  checkin_radius_m  int  not null default 150 check (checkin_radius_m > 0)
);

-- ---------------------------------------------------------------------------
-- checkins — "I'm on court now". Active while ended_at is null.
-- ---------------------------------------------------------------------------
create table public.checkins (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  court_id    text not null references public.courts (id) on delete cascade,
  created_at  timestamptz not null default now(),
  ended_at    timestamptz,
  end_reason  text check (end_reason in ('left', 'expired', 'moved')),  -- moved = checked in somewhere else
  check ((ended_at is null) = (end_reason is null)),
  check (ended_at is null or ended_at >= created_at)
);

-- One active check-in per user.
create unique index checkins_one_active_per_user on public.checkins (user_id) where ended_at is null;
create index checkins_active_by_court on public.checkins (court_id) where ended_at is null;

-- ---------------------------------------------------------------------------
-- intents — "on my way, there by <eta>". Active while resolved_at is null.
-- ---------------------------------------------------------------------------
create table public.intents (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  court_id     text not null references public.courts (id) on delete cascade,
  eta          timestamptz not null,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  outcome      text check (outcome in ('arrived', 'expired', 'cancelled')),
  check ((resolved_at is null) = (outcome is null))
);

-- One active intent per user.
create unique index intents_one_active_per_user on public.intents (user_id) where resolved_at is null;
create index intents_active_by_court on public.intents (court_id, eta) where resolved_at is null;

-- ---------------------------------------------------------------------------
-- runs — a scheduled game someone is hosting.
-- spots = open places for other players (the host isn't counted).
-- ---------------------------------------------------------------------------
create table public.runs (
  id            uuid primary key default gen_random_uuid(),
  court_id      text not null references public.courts (id) on delete cascade,
  host_id       uuid not null references public.profiles (id) on delete cascade,
  starts_at     timestamptz not null,
  skill         text not null check (skill in ('Beginner friendly', 'All levels', 'Intermediate', 'Advanced')),
  format        text not null check (format in ('3v3', '5v5', '21 / King of Court')),
  spots         int  not null check (spots between 1 and 20),
  created_at    timestamptz not null default now(),
  cancelled_at  timestamptz
);

create index runs_upcoming_by_court on public.runs (court_id, starts_at) where cancelled_at is null;

-- ---------------------------------------------------------------------------
-- run_signups — who has joined which run.
-- ---------------------------------------------------------------------------
create table public.run_signups (
  run_id      uuid not null references public.runs (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (run_id, user_id)
);

create index run_signups_by_user on public.run_signups (user_id);

-- Joining a run: not your own, not cancelled, not already started, not full.
-- The run row is locked so two people can't grab the last spot at once.
-- security definer: the joining player isn't the host, so RLS wouldn't let
-- them lock the run row themselves.
create function public.enforce_run_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  r public.runs;
  taken int;
begin
  select * into r from public.runs where id = new.run_id for update;
  if r.host_id = new.user_id then
    raise exception 'You''re hosting this run.' using errcode = 'check_violation';
  end if;
  if r.cancelled_at is not null then
    raise exception 'This run was cancelled.' using errcode = 'check_violation';
  end if;
  if r.starts_at <= now() then
    raise exception 'This run has already started.' using errcode = 'check_violation';
  end if;
  select count(*) into taken from public.run_signups where run_id = new.run_id;
  if taken >= r.spots then
    raise exception 'This run is full.' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger run_signups_enforce
  before insert on public.run_signups
  for each row execute function public.enforce_run_signup();

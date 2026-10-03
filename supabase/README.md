# Supabase

## Running the migrations

In the Supabase dashboard open **SQL Editor → New query**, paste each file in
order and click **Run**:

1. `migrations/0001_schema.sql`: tables, constraints, indexes
2. `migrations/0002_security.sql`: row level security and permissions
3. `migrations/0003_seed.sql`: rules row + the 5 courts (safe to re-run)

`0001` and `0002` are meant to run once on a fresh project. Later stages add
new numbered files; run only the new ones.

## Rules (`app_config`)

| Column | Default | Meaning |
| --- | --- | --- |
| `checkin_radius_m` | 150 | Default check-in radius for new courts (each court also has its own `checkin_radius_m`) |
| `max_accuracy_m` | 250 | GPS fixes less accurate than this are rejected |
| `checkin_cooldown_min` | 10 | After leaving a court, wait this long before checking in at a *different* court |
| `checkin_max_min` | 90 | Check-ins end automatically after this |
| `still_here_prompt_min` | 80 | App asks "still here?" at this age |
| `intent_grace_min` | 30 | "On my way" expires at ETA + this |
| `intent_window_min` | 60 | Only ETAs within this window count toward projected heat |

Edit them in **Table Editor → app_config**.

## Who can see and do what

- **Signed out:** read courts, rules, runs, run signups, and player cards (name, photo, skill).
- **Signed in:** create/edit their own profile; post, edit and cancel their own runs; join/leave runs as themselves.
- **Private:** birth year and show-up stats (only the owner, via `my_profile()`), and check-ins/intents (only the owner's own rows).
- **Server-only writes:** check-ins and intents can't be written from the app at all. They go through server functions that verify location and timing.

## Env vars

Copy `.env.example` to `.env.local` for local dev. On Vercel, add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Project → Settings →
Environment Variables**, then redeploy.

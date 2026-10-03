import { createClient } from "@supabase/supabase-js";

/* ============================================================================
   SUPABASE CLIENT — one shared instance for the whole app.
   Values come from .env.local locally and from Vercel env vars in deploys.
   ========================================================================= */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn("HeatCheck: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — see .env.example.");
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

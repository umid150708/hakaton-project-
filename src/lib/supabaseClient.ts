/**
 * supabaseClient.ts — browser Supabase client (auth + own-row data access).
 *
 * Uses the publishable/anon key, which is safe to expose to the browser.
 * Row-level security on user_profiles ensures a signed-in user can only
 * read/write their own row. Sessions are persisted and auto-refreshed by
 * the SDK.
 */

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // handles the OAuth redirect callback
  },
});

/**
 * supabaseClient.ts — browser Supabase client using the anon key (safe to expose).
 * RLS on user_profiles restricts users to their own row.
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

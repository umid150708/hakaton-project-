/**
 * _supabase.ts — Minimal server-side Supabase REST client (PostgREST)
 *
 * Uses plain fetch (no SDK) to stay consistent with how we call Groq/Gemini
 * and to keep the edge bundle tiny. The service_role key is server-only —
 * it bypasses RLS, so this file must NEVER be imported into client code.
 *
 * Exposes the two operations we actually need:
 *   • sbSelect  — read rows (optionally filtered)
 *   • sbUpsert  — insert or merge rows by primary key
 */

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function assertConfig(): { url: string; key: string } {
  if (!URL || !SERVICE_KEY) throw new Error('Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)');
  return { url: URL, key: SERVICE_KEY };
}

const baseHeaders = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
});

/**
 * Select rows from a table.
 * @param table  table name
 * @param query  raw PostgREST query string, e.g. "date=eq.2026-06-30&limit=1"
 */
export async function sbSelect<T>(table: string, query = ''): Promise<T[]> {
  const { url, key } = assertConfig();
  const res = await fetch(`${url}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    headers: baseHeaders(key),
  });
  if (!res.ok) throw new Error(`Supabase select ${table} ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T[]>;
}

/**
 * Insert or merge a single row (upsert on the table's primary key).
 * Returns the stored row.
 */
export async function sbUpsert<T>(table: string, row: Record<string, unknown>): Promise<T | null> {
  const { url, key } = assertConfig();
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...baseHeaders(key),
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase upsert ${table} ${res.status}: ${await res.text()}`);
  const rows = (await res.json()) as T[];
  return rows[0] ?? null;
}

export const hasSupabase = Boolean(URL && SERVICE_KEY);

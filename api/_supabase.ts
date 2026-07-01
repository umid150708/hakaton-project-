/**
 * _supabase.ts — Minimal server-side Supabase REST (PostgREST) client via fetch.
 * Uses the service_role key, which bypasses RLS — never import into client code.
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
export async function sbUpsert<T extends object>(table: string, row: T): Promise<T | null> {
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

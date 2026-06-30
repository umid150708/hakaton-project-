/**
 * profile.ts — Per-user context learned from the chatbot conversation.
 *
 * As the user answers the bot (or clicks chips), we pattern-match facts
 * about them — disability group, location, revenue, employees, business
 * type — and store them on their UserProfile. This context is then sent
 * to the AI so advice is tailored to the exact person.
 *
 * Storage: localStorage (fast, via auth.ts) + Supabase (cross-device,
 * via /api/profile). localStorage is the cache; Supabase is the source
 * of truth that follows the user across devices.
 */

import { updateProfile, type UserProfile, BIZ_TYPE_LABELS, type BizType } from './auth';

// ── Known Uzbek regions for location detection ────────────────────────────────

const REGIONS = [
  'Toshkent', 'Samarqand', "Farg'ona", 'Andijon', 'Namangan', 'Buxoro',
  'Nukus', 'Qarshi', 'Jizzax', 'Navoiy', 'Sirdaryo', 'Xorazm', 'Termiz',
  'Qashqadaryo', 'Surxondaryo', 'Guliston', 'Urganch', 'Qo\'qon', 'Chirchiq',
];

const BIZ_KEYWORDS: { match: RegExp; type: BizType }[] = [
  { match: /savdo|do'kon|ulgurji|magazin/i,        type: 'savdo' },
  { match: /ishlab chiqar|zavod|fabrika|produksiya/i, type: 'ishlab_chiqarish' },
  { match: /xizmat|servis|ko'rsat/i,                type: 'xizmat' },
  { match: /qishloq|fermer|dehqon|hosil/i,          type: 'qishloq' },
  { match: /qurilish|qurol|stroitel/i,              type: 'qurilish' },
];

/**
 * Extract any learnable facts from a single user message.
 * Returns only the fields it's confident about (omits the rest).
 */
export function extractProfile(text: string): Partial<UserProfile> {
  const t = text.toLowerCase();
  const patch: Partial<UserProfile> = {};

  // Disability group — "I guruh", "II guruh", "III guruh"
  if (/\biii\s*guruh\b/i.test(text))      patch.disability = 'III';
  else if (/\bii\s*guruh\b/i.test(text))  patch.disability = 'II';
  else if (/\bi\s*guruh\b/i.test(text))   patch.disability = 'I';

  // Location — first matching region name
  const region = REGIONS.find(r => text.toLowerCase().includes(r.toLowerCase()));
  if (region) patch.location = region;

  // Revenue band
  if (/1\s*mlrd.*ko'p|1\s*milliard.*ko'p|>\s*1\s*mlrd/i.test(t)) patch.revenueBand = '>1mlrd';
  else if (/500\s*mln.*1\s*mlrd|500\s*mln\s*[–-]\s*1/i.test(t))   patch.revenueBand = '500mln-1mlrd';
  else if (/500\s*mln.*kam|<\s*500|kam.*500/i.test(t))           patch.revenueBand = '<500mln';

  // Employees
  if (/20\s*\+|20\s*dan\s*ko'p/i.test(t))         patch.employees = '20+';
  else if (/5\s*[–-]\s*20|5\s*dan\s*20/i.test(t)) patch.employees = '5-20';
  else if (/1\s*[–-]\s*5/i.test(t))               patch.employees = '1-5';
  else if (/faqat\s*o'zim|0\s*\(/i.test(t))       patch.employees = '0';

  // Business type
  const biz = BIZ_KEYWORDS.find(b => b.match.test(text));
  if (biz) patch.bizType = biz.type;

  return patch;
}

/**
 * Apply extracted facts to the stored profile and persist to Supabase.
 * Returns the updated profile (or null if user not signed up / nothing learned).
 */
export function learnFromMessage(text: string): UserProfile | null {
  const patch = extractProfile(text);
  if (Object.keys(patch).length === 0) return null;
  const updated = updateProfile(patch);
  if (updated) syncProfile(updated);
  return updated;
}

/**
 * Build a one-line Uzbek context string describing the user, for AI injection.
 * Returns '' if we know nothing yet.
 */
export function profileSummary(u: UserProfile | null): string {
  if (!u) return '';
  const parts: string[] = [];
  if (u.bizType)     parts.push(BIZ_TYPE_LABELS[u.bizType]);
  if (u.location)    parts.push(u.location);
  if (u.disability)  parts.push(`${u.disability} guruh nogironlik`);
  if (u.revenueBand) parts.push(`yillik daromad ${u.revenueBand}`);
  if (u.employees)   parts.push(`${u.employees} xodim`);
  return parts.join(', ');
}

// ── Supabase sync (cross-device persistence) ──────────────────────────────────

/** Fire-and-forget: persist the profile to Supabase by phone. */
export function syncProfile(u: UserProfile): void {
  if (!u.phone) return;
  fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone:        u.phone,
      name:         u.name,
      biz_type:     u.bizType,
      disability:   u.disability ?? null,
      location:     u.location ?? null,
      revenue_band: u.revenueBand ?? null,
      employees:    u.employees ?? null,
    }),
  }).catch(() => { /* silent — localStorage is the working copy */ });
}

/** Hydrate localStorage profile from Supabase (e.g. user on a new device). */
export async function hydrateProfile(phone: string): Promise<void> {
  try {
    const res = await fetch(`/api/profile?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) return;
    const row = await res.json();
    if (!row || !row.phone) return;
    updateProfile({
      disability:  row.disability ?? undefined,
      location:    row.location ?? undefined,
      revenueBand: row.revenue_band ?? undefined,
      employees:   row.employees ?? undefined,
    });
  } catch { /* offline / not found — keep local copy */ }
}

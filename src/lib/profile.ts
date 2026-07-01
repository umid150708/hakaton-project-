/**
 * profile.ts — Learns per-user context from chatbot messages by pattern-matching
 * facts (disability, location, revenue, employees, business type) and merging
 * them onto the profile via updateProfile(). Powers tailored AI answers.
 */

import { updateProfile, type UserProfile, BIZ_TYPE_LABELS, COLLATERAL_LABELS, type BizType } from './auth';

const REGIONS = [
  'Toshkent', 'Samarqand', "Farg'ona", 'Andijon', 'Namangan', 'Buxoro',
  'Nukus', 'Qarshi', 'Jizzax', 'Navoiy', 'Sirdaryo', 'Xorazm', 'Termiz',
  'Qashqadaryo', 'Surxondaryo', 'Guliston', 'Urganch', "Qo'qon", 'Chirchiq',
];

const BIZ_KEYWORDS: { match: RegExp; type: BizType }[] = [
  { match: /savdo|do'kon|ulgurji|magazin/i,          type: 'savdo' },
  { match: /ishlab chiqar|zavod|fabrika|produksiya/i, type: 'ishlab_chiqarish' },
  { match: /xizmat|servis|ko'rsat/i,                  type: 'xizmat' },
  { match: /qishloq|fermer|dehqon|hosil/i,            type: 'qishloq' },
  { match: /qurilish|qurol|stroitel/i,                type: 'qurilish' },
];

/**
 * Extract any learnable facts from a single user message.
 * Returns only the fields it's confident about (omits the rest).
 */
export function extractProfile(text: string): Partial<UserProfile> {
  const t = text.toLowerCase();
  const patch: Partial<UserProfile> = {};

  // Disability group
  if (/\biii\s*guruh\b/i.test(text))      patch.disability = 'III';
  else if (/\bii\s*guruh\b/i.test(text))  patch.disability = 'II';
  else if (/\bi\s*guruh\b/i.test(text))   patch.disability = 'I';

  // Location
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
 * Apply extracted facts to the profile (persists to Supabase).
 * Returns the updated profile, or null if nothing learned / not signed in.
 */
export function learnFromMessage(text: string): UserProfile | null {
  const patch = extractProfile(text);
  if (Object.keys(patch).length === 0) return null;
  return updateProfile(patch);
}

/**
 * One-line Uzbek context string describing the user, for AI injection.
 * Returns '' if we know nothing yet.
 */
export function profileSummary(u: UserProfile | null): string {
  if (!u) return '';
  const parts: string[] = [];
  if (u.businessName) parts.push(`"${u.businessName}"`);
  if (u.bizType)      parts.push(BIZ_TYPE_LABELS[u.bizType]);
  if (u.regType)      parts.push(u.regType.toUpperCase());
  if (u.location)     parts.push(u.location);
  if (u.yearsInBiz)   parts.push(`biznes yoshi: ${u.yearsInBiz} yil`);
  if (u.employees)    parts.push(`${u.employees} xodim`);
  if (u.revenueBand)  parts.push(`daromad ${u.revenueBand}`);
  if (u.collateral && u.collateral !== 'none') parts.push(`garov: ${COLLATERAL_LABELS[u.collateral]}`);
  if (u.disability)   parts.push(`${u.disability} guruh nogironlik`);
  if (u.bio)          parts.push(`qo'shimcha: ${u.bio.slice(0, 120)}`);
  return parts.join(', ');
}

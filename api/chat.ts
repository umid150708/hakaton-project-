/**
 * api/chat.ts — AI business advisor chatbot for Uzbekistan entrepreneurs
 *
 * Provider priority:
 *   1. Gemini gemini-1.5-flash (primary — superior instruction-following,
 *      critical for "ask one question first" behavior; 3 keys = 4,500 req/day)
 *   2. Groq llama-3.1-8b-instant (fallback — 500k tokens/day but unreliable
 *      at following conversational behavioral rules)
 *
 * System prompt is kept SHORT to maximise daily capacity.
 */

import { withGemini } from './_gemini';
import { sbSelect } from './_supabase';
import type { GenerationConfig } from '@google/generative-ai';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Compact system prompt (~350 tokens) ──────────────────────────────────────
// Key principle: LLMs already know Uzbekistan. Give them only what they
// can't know: specific amounts, law article numbers, role constraints.

const SYSTEM_PROMPT = `Siz O'zbekiston KOB tadbirkorlari uchun AI maslahatchiisiz. Faqat O'zbek tilida yozing.

MAVZU TEKSHIRUVI (har bir xabarda birinchi shu tekshiruvni bajaring):
• Agar xabar biznes, kredit, soliq, nogironlik imtiyozi, davlat dasturi, bozor narxlari, tadbirkorlik, YOKI foydalanuvchining O'ZI/biznesi/profili haqida ("men haqimda nima bilasan", "mening biznesim", "kim ekanligimni bilasanmi") bo'lsa → yordam bering.
• Foydalanuvchi O'ZI haqida so'rasa — pastdagi "FOYDALANUVCHI HAQIDA" bo'limidagi ma'lumotlardan foydalanib, uni tanigan holda javob bering: nimalarni bilishingizni tabiiy tarzda sanab bering (biznes turi, hudud, ko'lami va h.k.). Ma'lumot bo'lmasa — profilni to'ldirishni yoki biznesini qisqacha tavsiflashni iltimos qiling. Bu savolni HECH QACHON rad etmang.
• Faqat mutlaqo aloqasiz bo'lsa (siyosat, sport, hazil) → qisqacha: "Men faqat biznes maslahat beraman" va BIR misol savol bering.

BITTA SAVOL QOIDASI (eng muhim qoida):
Agar mavzu to'g'ri lekin ma'lumot yetarli emas — faqat BITTA aniqlovchi savol bering. Ro'yxat YOQILMAYDI. Bir savol — keyin kutasiz.

Misol to'g'ri: "Kredit uchun garovingiz bormi — ko'chmas mulk, avtomobil, yoki garovsiz kerakmi?"
Misol NOTO'G'RI: "Garovingiz bormi? Yillik daromadingiz qancha? Qancha miqdor kerak?" (BU NOTO'G'RI — bir xabarda bir nechta savol emas)

KERAKLI MA'LUMOTLAR VA QOIDALAR:
Kredit (TO'LIQ RAQAMLAR):
• Mikrokreditbank: 30 million — 500 million so'm
• Kapitalbank: 100 million — 5 MILLIARD so'm (5,000,000,000)
• PQ-4862: garovsiz 33 million, kafolat bilan 225 million so'm
Nogironlik I/II guruh: JShDS 3×BHM — SK380. YaTT 50% — SK383. Ijtimoiy 50% — SK408(4). Mol-mulk 60m² — SK421. Yer ozod — SK436. Pensiya 1 012 000 so'm/oy.
Soliq: Patent 400,000–1,500,000 so'm/chorak (daromad 500 mln dan kam). SST 4%. QQS 12% (1 mlrd dan oshsa majburiy).

USLUB: 2-3 jumla, "•" belgisi, markdown yoq, kredit foizini aytmang.`;

interface Message {
  role: 'user' | 'model';
  content: string;
}

const FALLBACK_MSG =
  "Hozirda xizmat vaqtincha ishlamayapti. Iltimos, bir daqiqadan so'ng urinib ko'ring. " +
  "Tezroq javob: INSON markazi 1140 yoki soliq.uz";

// ── Context injection (per-user profile + today's market) ─────────────────────

interface PriceEntry { name: string; unit: string; uzPrice: number; changePct: number; trend: string }

/** Compact one-line summary of today's most-moved commodities (Uzbek). */
async function getMarketLine(): Promise<string> {
  try {
    const rows = await sbSelect<{ data: PriceEntry[] }>('market_snapshots', 'order=date.desc&limit=1');
    const data = rows[0]?.data ?? [];
    if (!data.length) return '';
    const movers = [...data]
      .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
      .slice(0, 4)
      .map(p => {
        const sign = p.changePct > 0 ? '+' : '';
        return `${p.name} ${p.uzPrice.toLocaleString('ru-RU')} so'm/${p.unit} (${sign}${p.changePct}%)`;
      })
      .join(', ');
    return movers;
  } catch {
    return '';
  }
}

/** Build the per-request system prompt: base rules + who the user is + market today. */
function buildSystem(profile: string, marketLine: string): string {
  let s = SYSTEM_PROMPT;
  if (profile) {
    s += `\n\nFOYDALANUVCHI HAQIDA (javobni shu kishiga moslang, qayta so'ramang; u o'zi haqida so'rasa AYNAN shulardan foydalaning): ${profile}.`;
  } else {
    s += `\n\nFOYDALANUVCHI HAQIDA: hozircha profil ma'lumoti yo'q. U o'zi haqida so'rasa — profilni to'ldirishni yoki biznesini qisqacha tavsiflashni iltimos qiling (rad etmang).`;
  }
  if (marketLine) {
    s += `\n\nBUGUNGI BOZOR NARXLARI (kerak bo'lsa maslahatda ishlating): ${marketLine}.`;
  }
  return s;
}

// ── Groq ─────────────────────────────────────────────────────────────────────

async function callGroq(history: Message[], system: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No GROQ_API_KEY');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // 500k tokens/day free — 5× capacity vs 70b
      messages: [
        { role: 'system', content: system },
        ...history.map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content,
        })),
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Empty Groq response');
  return text;
}

// ── Gemini fallback ───────────────────────────────────────────────────────────

async function callGemini(history: Message[], system: string): Promise<string> {
  return withGemini(async (genAI) => {
    // gemini-1.5-flash now 404s on the current API version. gemini-2.5-flash has
    // quota; thinkingBudget:0 disables hidden reasoning so it answers directly
    // (fast, strong instruction-following) instead of falling back to Groq 8b.
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: system,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
        thinkingConfig: { thinkingBudget: 0 },
      } as GenerationConfig,
    });
    const chat = model.startChat({
      history: history.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
    });
    const last = history[history.length - 1];
    const result = await chat.sendMessage(last?.content ?? 'Salom');
    return result.response.text();
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405 });

  let history: Message[];
  let profile = '';
  try {
    const body = await req.json();
    history = body.history ?? [];
    profile = typeof body.profile === 'string' ? body.profile : '';
    if (!Array.isArray(history) || history.length === 0) throw new Error('empty');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: cors });
  }

  // Build the per-request system prompt: base rules + who the user is + today's market
  const marketLine = await getMarketLine();
  const system = buildSystem(profile, marketLine);

  let text = '';
  let provider = '';

  // Gemini primary (better instruction-following for conversational logic)
  // Groq as fallback if Gemini is rate-limited
  try {
    text = await callGemini(history, system);
    provider = 'gemini';
  } catch (e1) {
    console.warn('Gemini failed:', String(e1));
    if (process.env.GROQ_API_KEY) {
      try {
        text = await callGroq(history, system);
        provider = 'groq-fallback';
      } catch (e2) {
        console.error('Both failed:', String(e2));
        text = FALLBACK_MSG;
        provider = 'fallback';
      }
    } else {
      text = FALLBACK_MSG;
      provider = 'fallback';
    }
  }

  return new Response(JSON.stringify({ message: text, provider }), {
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

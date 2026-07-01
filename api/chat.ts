/**
 * api/chat.ts — AI business advisor chatbot for Uzbekistan entrepreneurs
 *
 * Topic enforcement is NOT left to the model's own goodwill. A soft prompt
 * instruction ("only answer business questions") is guidance, not a
 * guarantee — fast/low-reasoning models (gemini-2.5-flash with
 * thinkingBudget:0, and the Groq 8b fallback) will happily comply with an
 * off-topic request ("write me a JS function") despite being told not to.
 * So topic gating happens in TWO code-enforced layers, neither of which
 * trusts the model to police its own answer text:
 *
 *   1. Deterministic regex pre-filter — catches obvious off-topic asks
 *      (write code, translate, poems, recipes, trivia) before any LLM call.
 *   2. Structured classification — the model must return
 *      { on_topic: boolean, reply: string }. When on_topic is false we
 *      DISCARD the model's reply text entirely and substitute our own
 *      fixed refusal message. The model only has to get a boolean right,
 *      which is far more reliable than getting free-text refusal right.
 *
 * Provider priority:
 *   1. Gemini gemini-2.5-flash (primary)
 *   2. Groq llama-3.1-8b-instant (fallback)
 */

import { withGemini } from './_gemini';
import { sbSelect } from './_supabase';
import type { GenerationConfig } from '@google/generative-ai';
import { SchemaType } from '@google/generative-ai';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

function getApiKeyFromReq(req: Request): string | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const x = req.headers.get('x-api-key') || req.headers.get('X-API-Key');
  return x ? x.trim() : null;
}

function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...cors } });
}

// ── Layer 1: deterministic off-topic pre-filter ──────────────────────────────
// Blatant "do an unrelated task for me" requests — blocked before any LLM call.

const OFF_TOPIC_PATTERNS: RegExp[] = [
  // Programming / code generation
  /\b(javascript|python|typescript|html|css|sql|c\+\+|c#|java|php|golang|rust|kotlin|swift)\b/i,
  /\b(kod|script|dastur|funksiya|function|algoritm|regex)\s*(yoz|yarat|write)/i,
  /\bwrite\s+(me\s+)?(a\s+)?(js|javascript|python|code|script|function|program)\b/i,
  // Creative writing / translation for hire
  /\b(she'?r|qo'?shiq|hikoya|insho|referat|ertak)\s*(yoz|yarat)/i,
  /\btarjima\s*qil/i,
  /\btranslate\s+(this|the following|it)\b/i,
  // Trivia / entertainment / homework unrelated to business
  /\b(retsept|taom tayyorlash)\s*(ber|ayt|yoz)/i,
  /\b(film|kino|serial)\s*(tavsiya|haqida)/i,
  /\bfutbol\s*(natija|hisob)/i,
];

function isObviouslyOffTopic(message: string): boolean {
  return OFF_TOPIC_PATTERNS.some(re => re.test(message));
}

const REFUSAL_MSG =
  "Men faqat biznes maslahat beraman — kredit, soliq, nogironlik imtiyozlari, davlat dasturlari yoki bozor narxlari bo'yicha. " +
  "Masalan: \"Garovsiz kredit olish uchun qanday hujjatlar kerak?\"";

// ── Compact system prompt (~380 tokens) ──────────────────────────────────────
// Key principle: LLMs already know Uzbekistan. Give them only what they
// can't know: specific amounts, law article numbers, role constraints.

const SYSTEM_PROMPT = `Siz O'zbekiston KOB tadbirkorlari uchun AI maslahatchiisiz. Faqat O'zbek tilida yozing.

Javobni FAQAT quyidagi JSON formatda qaytaring: {"on_topic": true yoki false, "reply": "..."}

MAVZU TEKSHIRUVI (har bir xabarda birinchi shu tekshiruvni bajaring — on_topic maydonini shunga qarab belgilang):
• Agar xabar biznes, kredit, soliq, nogironlik imtiyozi, davlat dasturi, bozor narxlari, tadbirkorlik, YOKI foydalanuvchining O'ZI/biznesi/profili haqida ("men haqimda nima bilasan", "mening biznesim", "kim ekanligimni bilasanmi") bo'lsa → on_topic: true, yordam bering.
• Foydalanuvchi O'ZI haqida so'rasa — pastdagi "FOYDALANUVCHI HAQIDA" bo'limidagi ma'lumotlardan foydalanib, uni tanigan holda javob bering. Bu on_topic: true. Ma'lumot bo'lmasa — profilni to'ldirishni so'rang. Bu savolni HECH QACHON rad etmang.
• Aks holda — kod yozish, tarjima, ijodiy matn, retsept, sport, siyosat, film, umumiy bilim va h.k. barcha mavzudan tashqari so'rovlar uchun → on_topic: false (reply maydoniga hech narsa yozish shart emas, u ishlatilmaydi).

BITTA SAVOL QOIDASI (eng muhim qoida, on_topic true bo'lganda amal qiladi):
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

USLUB (reply matnida): 2-3 jumla, "•" belgisi, markdown yoq, kredit foizini aytmang.`;

interface Message {
  role: 'user' | 'model';
  content: string;
}

const FALLBACK_MSG =
  "Hozirda xizmat vaqtincha ishlamayapti. Iltimos, bir daqiqadan so'ng urinib ko'ring. " +
  "Tezroq javob: INSON markazi 1140 yoki soliq.uz";

interface ChatResult {
  onTopic: boolean;
  reply: string;
}

/** Best-effort parse of the model's `{on_topic, reply}` JSON. Never throws. */
function parseChatResult(raw: string): ChatResult {
  try {
    const cleaned = raw.trim().replace(/^```json\s*|```$/g, '');
    const parsed = JSON.parse(cleaned) as { on_topic?: unknown; reply?: unknown };
    return {
      onTopic: parsed.on_topic !== false, // default to true so a malformed-but-relevant reply isn't silently dropped
      reply: typeof parsed.reply === 'string' ? parsed.reply : '',
    };
  } catch {
    // Model didn't return valid JSON — treat the raw text as the reply and
    // trust it (both providers are instructed to always emit JSON; this is
    // only a safety net for a malformed response, not the topic gate itself).
    return { onTopic: true, reply: raw };
  }
}

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

async function callGroq(history: Message[], system: string): Promise<ChatResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No GROQ_API_KEY');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // 500k tokens/day free — 5× capacity vs 70b
      response_format: { type: 'json_object' },
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
  return parseChatResult(text);
}

// ── Gemini fallback ───────────────────────────────────────────────────────────

async function callGemini(history: Message[], system: string): Promise<ChatResult> {
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
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            on_topic: { type: SchemaType.BOOLEAN },
            reply: { type: SchemaType.STRING },
          },
          required: ['on_topic', 'reply'],
        },
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
    return parseChatResult(result.response.text());
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: cors });

  // API key validation: accept `Authorization: Bearer <key>` or `x-api-key` header.
  const provided = getApiKeyFromReq(req);
  const serverKey = process.env.SERVER_API_KEY;
  if (serverKey) {
    if (!provided || provided !== serverKey) return unauthorizedResponse();
  }

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

  // Layer 1 — deterministic pre-filter. Blocks obvious off-topic asks
  // ("write me a JS function") without spending an LLM call at all, and
  // without depending on the model choosing to refuse.
  const lastUserMsg = [...history].reverse().find(m => m.role === 'user')?.content ?? '';
  if (isObviouslyOffTopic(lastUserMsg)) {
    return new Response(JSON.stringify({ message: REFUSAL_MSG, provider: 'blocked' }), {
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  // Build the per-request system prompt: base rules + who the user is + today's market
  const marketLine = await getMarketLine();
  const system = buildSystem(profile, marketLine);

  let result: ChatResult | null = null;
  let provider = '';

  // Gemini primary (better instruction-following for conversational logic)
  // Groq as fallback if Gemini is rate-limited
  try {
    result = await callGemini(history, system);
    provider = 'gemini';
  } catch (e1) {
    console.warn('Gemini failed:', String(e1));
    if (process.env.GROQ_API_KEY) {
      try {
        result = await callGroq(history, system);
        provider = 'groq-fallback';
      } catch (e2) {
        console.error('Both failed:', String(e2));
        provider = 'fallback';
      }
    } else {
      provider = 'fallback';
    }
  }

  // Layer 2 — structured classification. Even if the model complies with an
  // off-topic request in `reply`, we never surface that text: on_topic:false
  // always resolves to our own fixed refusal message.
  const text = result === null
    ? FALLBACK_MSG
    : result.onTopic
      ? (result.reply || FALLBACK_MSG)
      : REFUSAL_MSG;

  return new Response(JSON.stringify({ message: text, provider }), {
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

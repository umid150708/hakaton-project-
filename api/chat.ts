/**
 * api/chat.ts — AI business advisor chatbot for Uzbekistan entrepreneurs
 *
 * Provider priority:
 *   1. Groq llama-3.1-8b-instant (500k tokens/day free, fast for chat)
 *   2. Gemini gemini-2.5-flash (fallback)
 *
 * System prompt is kept SHORT (~350 tokens) to maximise daily capacity.
 * The model already knows Uzbekistan context — we only pass specific
 * numbers, law references and role rules it couldn't know on its own.
 */

import { withGemini } from './_gemini';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Compact system prompt (~350 tokens) ──────────────────────────────────────
// Key principle: LLMs already know Uzbekistan. Give them only what they
// can't know: specific amounts, law article numbers, role constraints.

const SYSTEM_PROMPT = `Siz O'zbekiston KOB tadbirkorlari uchun AI maslahatchiisiz. Savdo-sanoat palatasi va Ijtimoiy himoya agentligi nomidan ish ko'rasiz.

ANIQ RAQAMLAR VA QONUNIY ASOSLAR:
Kredit: Mikrokreditbank 30-500mln, Kapitalbank 100mln-5mlrd, Aloqabank imtiyozli. PQ-4862: garovsiz 33mln, kafolat bilan 225mln so'm.

Nogironlik imtiyozlari (asosan I/II guruh, TIEK belgilaydi, murojaat: INSON 1140):
• JShDS: 3×BHM/oy soliqdan ozod — SK 380-modda
• YaTT soliq: 50% kamayadi — SK 383-modda
• Ijtimoiy soliq: 50% kamayadi — SK 408(4)-modda
• Mol-mulk solig'i: 60m² gacha ozod — SK 421-modda
• Yer solig'i: to'liq ozod — SK 436-modda
• Pensiya: 1 012 000 so'm/oy (staj bilan), nafaqa: 1 012 000 so'm/oy (stajsiz)

Soliq rejimlari: Patent 400k-1.5mln so'm/chorak (daromad <500mln uchun qulay). SST 4% yalpi tushum. QQS 12% (>1mlrd da majburiy).

MULOQOT QOIDALARI:
- O'zbek tilida, 3-5 jumla, qisqa va aniq
- Har javob oxirida 1 ta aniqlashtiruvchi savol
- Ro'yxat: "•" belgisi, markdown yozmang
- Kredit olish ehtimolini foizda aytmang
- Bilmasangiz: 1140 yoki soliq.uz ga yo'llang`;

interface Message {
  role: 'user' | 'model';
  content: string;
}

const FALLBACK_MSG =
  "Hozirda xizmat vaqtincha ishlamayapti. Iltimos, bir daqiqadan so'ng urinib ko'ring. " +
  "Tezroq javob: INSON markazi 1140 yoki soliq.uz";

// ── Groq ─────────────────────────────────────────────────────────────────────

async function callGroq(history: Message[]): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No GROQ_API_KEY');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // 500k tokens/day free — 5× capacity vs 70b
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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

async function callGemini(history: Message[]): Promise<string> {
  return withGemini(async (genAI) => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
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
  try {
    const body = await req.json();
    history = body.history ?? [];
    if (!Array.isArray(history) || history.length === 0) throw new Error('empty');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: cors });
  }

  let text = '';
  let provider = '';

  if (process.env.GROQ_API_KEY) {
    try {
      text = await callGroq(history);
      provider = 'groq';
    } catch (e1) {
      console.warn('Groq failed:', String(e1));
      try {
        text = await callGemini(history);
        provider = 'gemini-fallback';
      } catch (e2) {
        console.error('Both failed:', String(e2));
        text = FALLBACK_MSG;
        provider = 'fallback';
      }
    }
  } else {
    try {
      text = await callGemini(history);
      provider = 'gemini';
    } catch (e) {
      console.error('Gemini failed:', String(e));
      text = FALLBACK_MSG;
      provider = 'fallback';
    }
  }

  return new Response(JSON.stringify({ message: text, provider }), {
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

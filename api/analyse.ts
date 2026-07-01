/**
 * api/analyse.ts — AI market analysis endpoint
 *
 * Provider priority:
 *   1. Groq  (free, 14,400 req/day, llama-3.3-70b) — if GROQ_API_KEY is set
 *   2. Gemini (free, ~500 req/day per key)          — automatic fallback
 *
 * Accepts an optional `system` field so the caller can teach the model
 * writing style before passing market data, and an optional `maxTokens`
 * so deep multi-section analyses can request a longer answer than the
 * short market brief.
 */

import { withGemini } from './_gemini';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Groq ──────────────────────────────────────────────────────────────────────

async function callGroq(system: string, prompt: string, maxTokens: number): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not configured');

  const messages = [
    { role: 'system', content: system },
    { role: 'user',   content: prompt },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: maxTokens,
      temperature: 0.6,
    }),
  });

  if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Groq returned empty content');
  return text;
}

// ── Gemini fallback ───────────────────────────────────────────────────────────

async function callGemini(system: string, prompt: string, maxTokens: number): Promise<string> {
  return withGemini(async (genAI) => {
    // gemini-1.5-flash is NON-thinking: the whole token budget goes to the
    // visible answer. (gemini-2.5-flash spends the budget on hidden reasoning
    // first, which truncated short briefs to a useless fragment.)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.6 },
      systemInstruction: system,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405 });

  let prompt: string;
  let system: string;
  let maxTokens: number;
  try {
    const body = await req.json();
    prompt = String(body.prompt ?? '').slice(0, 4000);
    system = String(body.system ?? '').slice(0, 6000);
    // Default 400 (short market brief); deep analyses may request up to 1500.
    maxTokens = Math.min(Math.max(Math.round(Number(body.maxTokens)) || 400, 100), 1500);
    if (!prompt) throw new Error('empty prompt');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: cors });
  }

  try {
    let text: string;
    let provider: string;

    if (process.env.GROQ_API_KEY) {
      try {
        text = await callGroq(system, prompt, maxTokens);
        provider = 'groq';
      } catch (err) {
        console.warn('Groq failed, falling back to Gemini:', String(err));
        text = await callGemini(system, prompt, maxTokens);
        provider = 'gemini-fallback';
      }
    } else {
      text = await callGemini(system, prompt, maxTokens);
      provider = 'gemini';
    }

    return new Response(JSON.stringify({ text, provider }), {
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'AI error', detail: String(err) }),
      { status: 500, headers: cors },
    );
  }
}

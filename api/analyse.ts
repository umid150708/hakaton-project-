/**
 * api/analyse.ts — AI market analysis endpoint
 *
 * Provider priority:
 *   1. Groq  (free, 14,400 req/day, llama-3.3-70b) — if GROQ_API_KEY is set
 *   2. Gemini (free, ~500 req/day per key)          — automatic fallback
 *
 * Accepts an optional `system` field so the caller can teach the model
 * writing style before passing market data.
 */

import { withGemini } from './_gemini';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Groq ──────────────────────────────────────────────────────────────────────

async function callGroq(system: string, prompt: string): Promise<string> {
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
      max_tokens: 300,
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

async function callGemini(system: string, prompt: string): Promise<string> {
  return withGemini(async (genAI) => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 300, temperature: 0.6 },
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
  try {
    const body = await req.json();
    prompt = String(body.prompt ?? '').slice(0, 2000);
    system = String(body.system ?? '').slice(0, 3000);
    if (!prompt) throw new Error('empty prompt');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: cors });
  }

  try {
    let text: string;
    let provider: string;

    if (process.env.GROQ_API_KEY) {
      try {
        text = await callGroq(system, prompt);
        provider = 'groq';
      } catch (err) {
        console.warn('Groq failed, falling back to Gemini:', String(err));
        text = await callGemini(system, prompt);
        provider = 'gemini-fallback';
      }
    } else {
      text = await callGemini(system, prompt);
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

/**
 * api/analyse.ts — AI market analysis endpoint.
 * Groq (llama-3.3-70b) primary, Gemini fallback. Accepts optional `system`
 * and `maxTokens` so deep analyses can override the default short brief.
 */

import { withGemini } from './_gemini';
import type { GenerationConfig } from '@google/generative-ai';

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

async function callGemini(system: string, prompt: string, maxTokens: number): Promise<string> {
  return withGemini(async (genAI) => {
    // thinkingBudget:0 disables hidden reasoning so the whole budget goes to
    // the visible answer. gemini-1.5-flash 404s on the current API version.
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.6,
        thinkingConfig: { thinkingBudget: 0 },
      } as GenerationConfig,
      systemInstruction: system,
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: cors });

  // Accept `Authorization: Bearer <key>` or `x-api-key`.
  const provided = getApiKeyFromReq(req);
  const serverKey = process.env.SERVER_API_KEY;
  if (serverKey) {
    if (!provided || provided !== serverKey) return unauthorizedResponse();
  }

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

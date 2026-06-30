/**
 * api/analyse.ts — AI market analysis endpoint for Bozor-Analitika
 * Routes Gemini calls through the server so the API key stays hidden.
 */
import { withGemini } from './_gemini';

export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let prompt: string;
  try {
    const body = await req.json();
    prompt = String(body.prompt ?? '').slice(0, 1000);
    if (!prompt) throw new Error('Empty prompt');
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });
  }

  try {
    const text = await withGemini(async (genAI) => {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    });
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'AI error', detail: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
}

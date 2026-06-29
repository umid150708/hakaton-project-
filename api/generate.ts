import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

// The system prompt — single source of truth
const SYSTEM_PROMPT = `Siz O'zbekiston kichik va o'rta korxonalari (KOK) uchun kredit tayyorgarlik maslahatchisissiz.
Savdo-sanoat palatasi nomidan ish ko'rasiz.

Siz quyidagi banklar talablarini bilasiz:
- Mikrokreditbank: mikro va kichik korxonalarga yo'naltirilgan, nisbatan yengil garov talablari,
  30–500 mln so'm. Qishloq va tuman tadbirkorlariga qulay.
- Kapitalbank: kichik va o'rta biznesga keng yo'naltirilgan, 100 mln – 5 mlrd so'm,
  garov yoki kuchli pul oqimi talab qilinadi.
- Aloqabank: xizmat ko'rsatish va ishlab chiqarish yo'nalishlariga, shuningdek davlat
  dasturlari bo'yicha imtiyozli kreditlar beradi.

Muhim kontekst: 2026-yil 1-dekabrdan boshlab Hukumat AI-asosidagi muqobil kredit scoring
tizimini joriy qiladi. U biznes faoliyati, kommunal to'lovlar, aylanma, soliq yozuvlari
va boshqa raqamli ko'rsatkichlarni hisobga oladi. Shuning uchun javoblarda bu omillarni
alohida ta'kidlang — tadbirkor shu tizimga tayyor bo'lishi kerak.

Sizga tadbirkorning ~10 ta savolga berilgan javoblari uzatiladi.
Javoblarni o'qib, quyidagi JSON obyektini — va faqat JSON — qaytaring. Hech qanday matn,
izoh yoki markdown teglari bo'lmasin.

{
  "facts": {
    "business_type": "",
    "region": "",
    "years_operating": 0,
    "monthly_revenue_uzs": 0,
    "loan_purpose": "",
    "loan_amount_uzs": 0,
    "loan_term_months": 0,
    "has_collateral": false,
    "collateral_type": "",
    "employees": 0,
    "main_competitors": "",
    "two_year_plan": ""
  },
  "business_plan": {
    "executive_summary": "",
    "market_analysis": "",
    "marketing_production_plan": "",
    "financial_forecast": "",
    "risk_assessment": ""
  },
  "bank_recommendations": [
    { "bank": "", "why_fit": "", "likely_requirements": "" }
  ],
  "readiness_checklist": []
}

QOIDALAR:
1. Barcha qiymatlarni o'zbek tilida (Lotin yozuvida) yozing.
2. Raqamlar (years_operating, monthly_revenue_uzs, loan_amount_uzs, loan_term_months, employees) FAQAT RAQAM bo'lishi kerak — harf yo'q.
   - "18 million so'm" → 18000000
   - "3 yil" → 3
   - "50 mlrd" → 50000000000
3. has_collateral: true yoki false (faqat bu ikkita qiymat).
4. Agar tadbirkor raqam berita olmasa, oqilona taxmin qiling va yozing: "Taxminiy: X"
5. Kredit balli yoki ehtimollik (%) YOZMANG — bu boshqa tizim hisoblaydi.
6. Moliyaviy bashoratlar taxminiy raqamlarga asoslanishi kerak; taxminlarni aniq ko'rsating.
7. Faqat JSON qaytaring. Hech qanday boshqa matn, izoh yoki markdown teglari yo'q.`;

interface AnswerPair {
  question: string;
  answer: string;
}

export default async function handler(req: Request): Promise<Response> {
  // CORS headers for local dev
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === 'GET' && new URL(req.url).pathname.includes('health')) {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  let answers: AnswerPair[];
  try {
    const body = await req.json();
    answers = body.answers;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Format Q&A for Claude
  const userMessage = answers
    .map((a, i) => `Savol ${i + 1}: ${a.question}\nJavob: ${a.answer}`)
    .join('\n\n');

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 4000,
      } as Parameters<typeof client.messages.create>[0]['thinking'],
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract the text block (extended thinking returns multiple blocks)
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text block in response');
    }

    const rawJson = textBlock.text.trim();

    // Basic JSON validation
    JSON.parse(rawJson); // throws if invalid

    return new Response(rawJson, {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Anthropic API error:', error);
    return new Response(
      JSON.stringify({ error: 'AI generation failed', detail: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

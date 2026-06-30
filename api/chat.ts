/**
 * api/chat.ts — Gemini-powered conversational interview
 *
 * Gemini acts as a financial advisor, drives the conversation naturally,
 * asks follow-up questions, probes vague answers, and when it has
 * collected enough info it outputs [DONE] + the full AIResult JSON.
 *
 * Enhanced with: relevant business plan examples from Supabase for better training.
 */
import { withGemini } from './_gemini';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

function getSystemPrompt(exampleContext: string = ''): string {
  return `Siz O'zbekiston kichik va o'rta biznes (KOB) tadbirkorlari uchun moliyaviy maslahatchi chatbotsiz. O'zbekiston Savdo-sanoat palatasi nomidan ish ko'rasiz.

MAQSAD: Tadbirkor bilan tabiiy suhbat orqali kredit ariza va biznes-reja uchun kerakli ma'lumotlarni yig'ing.

YIGISH KERAK BO'LGAN MA'LUMOTLAR (hammasini bir vaqtda so'ramang):
1. Biznes turi va tavsifi
2. Viloyat / shahar
3. Qancha vaqtdan beri faoliyat yuritadi
4. Oylik tushum (aniq raqam kerak)
5. Kredit maqsadi
6. Kredit miqdori va muddati
7. Garov bor-yo'qligi (ko'chmas mulk, avtomobil va h.k.)
8. Xodimlar soni
9. Asosiy raqobatchilar
10. 2 yillik rivojlanish rejasi

MULOQOT QOIDALARI:
- Har safar faqat 1-2 ta savol bering — tabiiy suhbat kabi
- Noaniq yoki kam ma'lumotli javoblarga qo'shimcha savol bering
- Raqam berilmasa (daromad, kredit) — "Taxminan bo'lsa ham yozing" deb iltimos qiling
- O'zbek tilida (lotin yozuvi) gaplashing
- Qisqa, samimiy va qo'llab-quvvatlovchi bo'ling
- Har bir javobni tasdiqlab, keyin savol bering: "Tushunarli! ..." yoki "Ajoyib, ..."

BARCHA MA'LUMOTLAR YIGILGANDA:
Avval suhbatni yakunlang: "Rahmat! Endi biznes-rejangizni tayyorlayapman..."
Keyin FAQAT quyidagi JSON ni chiqaring — hech qanday boshqa matn yo'q:

[BIZNES_REJA_START]
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
[BIZNES_REJA_END]

JSON QOIDALARI:
- Raqamlar faqat raqam: "18 million" → 18000000
- has_collateral: true yoki false
- Barcha matnlar o'zbek tilida (lotin yozuvi)
- business_plan bo'limlarini to'liq va batafsil yozing${exampleContext}`;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let history: Message[];
  try {
    const body = await req.json();
    history = body.history ?? [];
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });
  }

  try {
    // ── RAG: find relevant business plan examples from Supabase ──────────────
    let exampleContext = '';
    try {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

      if (supabaseUrl && supabaseKey) {
        const supabase  = createClient(supabaseUrl, supabaseKey);

        // Build query text from conversation so far
        const userText  = history.filter(h => h.role === 'user')
                                 .map(h => h.content).join(' ').slice(0, 500);

        // Generate embedding for the current conversation context
        // Note: uses GEMINI_API_KEY_2 (AIzaSy format) — AQ. keys don't support embeddings
        const embedKey  = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY || '';
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI     = new GoogleGenerativeAI(embedKey);
        const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        const embedRes  = await embedModel.embedContent({
          content: { parts: [{ text: userText || 'biznes reja Uzbekiston' }], role: 'user' },
          taskType: 'RETRIEVAL_QUERY' as any,
          outputDimensionality: 768,
        } as any);
        const queryEmbedding = Array.from(embedRes.embedding.values);

        // Vector similarity search via Supabase RPC
        const { data: plans } = await supabase.rpc('match_business_plans', {
          query_embedding: queryEmbedding,
          match_count: 3,
          match_threshold: 0.5,
        });

        if (plans && plans.length > 0) {
          const blocks = (plans as Array<{title: string; category: string; content: string}>)
            .map(
              (p, i) =>
                `\n\n📖 NAMUNA ${i + 1} — ${p.title || p.category}:\n${p.content.slice(0, 250)}`
            )
            .join('');
          exampleContext =
            `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` +
            `\nSIZ UCHUN BIZNES-REJA NAMUNALARI (ushbu namunaviy rejalardan ilhom oling — tuzilma, til va batafsil tavsifdan foydalaning):` +
            blocks +
            `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        }
      }
    } catch (err) {
      // Non-fatal — chat still works without RAG context
      console.warn('RAG context unavailable:', String(err).slice(0, 100));
    }

    const text = await withGemini(async (genAI) => {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: getSystemPrompt(exampleContext),
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      });
      const chat = model.startChat({
        history: history.slice(0, -1).map(m => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      });
      const lastMessage = history[history.length - 1];
      const result = await chat.sendMessage(lastMessage?.content ?? 'Salom');
      return result.response.text();
    });

    // Check if Gemini finished collecting and produced the JSON
    const isDone = text.includes('[BIZNES_REJA_START]') && text.includes('[BIZNES_REJA_END]');

    let planJson: string | null = null;
    let chatMessage = text;

    if (isDone) {
      const start = text.indexOf('[BIZNES_REJA_START]') + '[BIZNES_REJA_START]'.length;
      const end   = text.indexOf('[BIZNES_REJA_END]');
      planJson = text.slice(start, end).trim();
      // Show the "tayyor" message without the JSON block
      chatMessage = text.slice(0, text.indexOf('[BIZNES_REJA_START]')).trim();
    }

    return new Response(
      JSON.stringify({ message: chatMessage, done: isDone, planJson }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    console.error('Chat error:', err);
    return new Response(
      JSON.stringify({ error: 'AI error', detail: String(err) }),
      { status: 500, headers: corsHeaders }
    );
  }
}

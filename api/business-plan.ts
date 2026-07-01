/**
 * api/business-plan.ts — Generate a structured business plan (biznes reja).
 *
 * POST { profile, answers } → { plan: { title, sections:[{heading, body}] } }
 *
 * Uses gemini-2.5-flash (thinking off) to write a full plan tailored to the
 * entrepreneur's profile + interview answers. RAG grounding on the ingested
 * `business_plans` corpus can be layered in later (retrieve → prepend examples).
 */

import { withGemini } from './_gemini';
import type { GenerationConfig } from '@google/generative-ai';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...cors } });

const SYSTEM = `Siz O'zbekiston kichik va o'rta biznesi (KOB) uchun professional biznes-reja tuzuvchi ekspertsiz. Bank kreditiga tayyorgarlikni ham hisobga olasiz (Mikrokreditbank, Kapitalbank, davlat dasturlari).

Faqat quyidagi JSON formatni qaytaring (boshqa matn yo'q):
{"title":"...", "sections":[{"heading":"1. Rezyume","body":"..."}, ...]}

Aynan shu 9 bo'limni shu tartibda yozing:
1. Rezyume — biznes mohiyati, qisqa (loyihaning eng muhim 3-4 jihati).
2. Biznes tavsifi — nima, qayerda, qanday shaklda (YaTT/MChJ), tadbirkor tajribasi.
3. Bozor va raqobat tahlili — talab, maqsadli mijozlar, raqobatchilar, ustunlik.
4. Mahsulot yoki xizmat — nima taklif qilinadi, sifat, narx pozitsiyasi.
5. Marketing va sotuv — mijozlarni qanday jalb qilish, kanallar, narx strategiyasi.
6. Operatsion reja — joylashuv, jihoz, xom ashyo, xodimlar, jarayon.
7. Moliyaviy reja — ANIQ RAQAMLAR: boshlang'ich xarajatlar ro'yxati (so'mda), oylik/yillik daromad prognozi, xarajatlar, sof foyda, o'zini oqlash muddati. Berilgan investitsiya summasiga asoslaning.
8. Risklar va yechimlar — 3-4 asosiy risk va ularni kamaytirish yo'llari.
9. Moliyalashtirish — qancha mablag' kerak, qaysi manba (o'z/kredit/grant), mos bank va taxminiy shartlar.

QOIDALAR: har bir "body" — 2-4 abzas yoki "•" bilan punktlar. Professional o'zbek tilida. Raqamlarni aniq va real O'zbekiston sharoitiga mos bering. Umumiy bo'sh gaplardan qoching.`;

async function generate(userPrompt: string): Promise<string> {
  return withGemini(async (genAI) => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
        maxOutputTokens: 6000,
        thinkingConfig: { thinkingBudget: 0 },
      } as GenerationConfig,
    });
    const r = await model.generateContent(userPrompt);
    return r.response.text();
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json();
    const profile: string = typeof body.profile === 'string' ? body.profile : '';
    const a = body.answers ?? {};

    const userPrompt = `TADBIRKOR PROFILI: ${profile || "ma'lumot cheklangan"}

BIZNES G'OYASI: ${a.idea ?? '-'}
BOSHLANG'ICH INVESTITSIYA (so'm): ${a.investment ?? '-'}
MABLAG' MANBAI: ${a.funding ?? '-'}
MAQSADLI MIJOZLAR / BOZOR: ${a.market ?? '-'}
1 YILLIK MAQSAD: ${a.goal ?? '-'}
${a.extra ? `QO'SHIMCHA: ${a.extra}` : ''}

Ushbu ma'lumotlar asosida to'liq, professional biznes-reja tuz. Moliyaviy bo'limda berilgan investitsiya summasidan kelib chiqib aniq raqamlar bilan hisob-kitob qil.`;

    const raw = await generate(userPrompt);
    let plan: unknown;
    try { plan = JSON.parse(raw); }
    catch { return json({ error: 'parse', detail: raw.slice(0, 300) }, 502); }

    return json({ plan });
  } catch (err) {
    return json({ error: 'business-plan error', detail: String(err) }, 500);
  }
}

/**
 * ApiDocs.tsx — REST API reference page: lists each /api/* endpoint with its
 * method, request body, and response shape for external integrators.
 */

import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Brand } from '../components/Logo';

type Method = 'GET' | 'POST' | 'PUT';

const METHOD_STYLE: Record<Method, string> = {
  GET:  'bg-sky/10 text-sky border-sky/30',
  POST: 'bg-brand-soft text-brand border-brand',
  PUT:  'bg-gold-soft text-gold border-line-strong',
};

function MethodBadge({ method }: { method: Method }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold tracking-wide ${METHOD_STYLE[method]}`}>
      {method}
    </span>
  );
}

interface Endpoint {
  method: Method;
  path: string;
  summary: string;
  auth?: string;
  request?: string;
  response: string;
  notes?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/ads?type=buy|sell&category=grain',
    summary: "Faol e'lonlar ro'yxati (kontakt raqamsiz)",
    response: `{ "ads": [{
  "id": "uuid", "owner_id": "uuid|null", "type": "buy"|"sell",
  "category": "grain", "product": "Bug'doy",
  "quantity_value": 20, "quantity_max": 22, "quantity_unit": "tonna", "quantity_freq": null,
  "region": "Farg'ona", "district": "Marg'ilon", "location": null,
  "price_value": 3200000, "price_max": null, "price_unit": "tonna",
  "status": "active", "created_at": "2026-07-01T10:00:00Z"
}] }`,
  },
  {
    method: 'POST',
    path: '/api/ads',
    summary: "Yangi e'lon joylashtirish — moslik tekshiruvi va bildirishnomalarni ishga tushiradi",
    request: `{ "ad": {
  "type": "sell", "category": "grain", "product": "Bug'doy",
  "quantityValue": 20, "quantityMax": 22, "quantityUnit": "tonna", "quantityFreq": null,
  "region": "Farg'ona", "district": "Marg'ilon", "location": null,
  "priceValue": 3200000, "priceMax": null, "priceUnit": "tonna",
  "contact": "+998901234567"
}, "ownerId": "uuid" }`,
    response: `{ "ad": {...}, "matches": [{ "ad": {...}, "score": 92 }] }`,
    notes: "score ≥ 85 bo'lgan qarama-qarshi tomon egalariga avtomatik bildirishnoma yuboriladi.",
  },
  {
    method: 'PUT',
    path: '/api/ads',
    summary: "O'z e'loningizni yangilash (narx, miqdor, holat) — faqat egasi",
    request: `{ "id": "uuid", "ownerId": "uuid", "patch": {
  "status": "closed",      // "active" | "closed"
  "priceValue": 3300000,
  "quantityValue": 18
  // faqat o'zgartirmoqchi bo'lgan maydonlarni yuboring
} }`,
    response: `{ "ad": {...} }`,
    notes: "ownerId e'lon egasiga mos kelmasa — 403. E'lon topilmasa — 404.",
  },
  {
    method: 'POST',
    path: '/api/reveal',
    summary: "E'lon egasining kontaktini ochish (huquq tekshiruvi bilan)",
    request: `{ "userId": "uuid", "adId": "uuid" }`,
    response: `{ "contact": "+998901234567", "freeLeft": 2 }
// yoki: { "paywall": "signup" | "subscribe" | "payfee", "fee": 45000 }`,
    notes: "Bepul reja: 3 marta. Obuna: cheklovsiz. Bitim foizi rejasi: shu e'lon uchun to'lov qilingandan keyin.",
  },
  {
    method: 'POST',
    path: '/api/deal',
    summary: "Bitim uchun platforma to'lovini yozib qo'yish (hozircha simulyatsiya)",
    request: `{ "userId": "uuid", "adId": "uuid" }`,
    response: `{ "ok": true, "amount": 45000 }`,
  },
  {
    method: 'GET',
    path: '/api/notifications?userId=uuid',
    summary: "Foydalanuvchining oxirgi 50 ta bildirishnomasi",
    response: `{ "notifications": [{
  "id": "uuid", "kind": "match", "ad_id": "uuid", "my_ad_id": "uuid",
  "score": 92, "title": "Bu bitim sizni qiziqtiradimi?", "body": "...",
  "read": false, "created_at": "2026-07-01T10:00:00Z"
}], "unread": 3 }`,
  },
  {
    method: 'POST',
    path: '/api/notifications',
    summary: "Bitta (id bilan) yoki barcha bildirishnomalarni o'qilgan deb belgilash",
    request: `{ "userId": "uuid", "id": "uuid" }  // id bo'lmasa — hammasi o'qilgan deb belgilanadi`,
    response: `{ "ok": true }`,
  },
  {
    method: 'GET',
    path: '/api/market-prices',
    summary: "Bugungi bozor narxlari (ulgurji) va AI tahlili — keshlanadi",
    response: `{ "date": "2026-07-01", "data": [{
  "name": "Qand shakar", "unit": "kg", "uzPrice": 5100, "changePct": 2, "trend": "up"
}], "analysis": "..." }`,
  },
  {
    method: 'POST',
    path: '/api/chat',
    summary: 'AI biznes-maslahatchi — faqat biznes/kredit/soliq/imtiyoz mavzusida javob beradi',
    auth: 'SERVER_API_KEY o\'rnatilgan bo\'lsa: Authorization: Bearer <key>',
    request: `{ "history": [{ "role": "user"|"model", "content": "..." }], "profile": "ixtiyoriy, foydalanuvchi tavsifi" }`,
    response: `{ "message": "...", "provider": "gemini"|"groq-fallback"|"blocked"|"fallback" }`,
    notes: 'Mavzudan tashqari so\'rovlar (kod yozish, tarjima va h.k.) kodda bloklanadi — modelga ishonilmaydi.',
  },
  {
    method: 'POST',
    path: '/api/analyse',
    summary: "Bozor tahlili (xarid/sotuv, tanlangan kategoriya bo'yicha qisqa AI brifing)",
    auth: 'SERVER_API_KEY o\'rnatilgan bo\'lsa: Authorization: Bearer <key>',
    request: `{ "prompt": "...", "system": "ixtiyoriy uslub ko'rsatmasi", "maxTokens": 400 }`,
    response: `{ "text": "...", "provider": "groq"|"gemini-fallback"|"gemini" }`,
  },
  {
    method: 'POST',
    path: '/api/business-plan',
    summary: "To'liq biznes-reja generatsiyasi (9 bo'lim, RAG bilan asoslangan)",
    request: `{ "profile": {...}, "answers": {...} }`,
    response: `{ "plan": { "title": "...", "sections": [{ "heading": "1. Rezyume", "body": "..." }] } }`,
  },
];

export default function ApiDocs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-faint hover:text-ink text-xl leading-none btn-icon">←</button>
            <Brand size={28} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black tracking-tight mb-2">API ma'lumotnomasi</h1>
        <p className="text-muted text-sm leading-relaxed mb-2">
          Bozorboy backend — Vercel edge funksiyalari orqali ishlaydigan REST API. Barcha so'rovlar JSON qabul qiladi
          va JSON qaytaradi.
        </p>
        <p className="text-faint text-xs mb-10">
          Bazaviy manzil: <code className="text-gold">https://biznesplan-ai.vercel.app</code>
        </p>

        <div className="space-y-4">
          {ENDPOINTS.map(e => (
            <section key={e.method + e.path} className="bg-surface border border-line rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <MethodBadge method={e.method} />
                <code className="text-ink font-semibold text-sm">{e.path}</code>
              </div>
              <p className="text-muted text-sm mb-3">{e.summary}</p>

              {e.auth && (
                <p className="text-faint text-xs mb-3">🔒 {e.auth}</p>
              )}

              {e.request && (
                <div className="mb-3">
                  <p className="text-faint text-[11px] uppercase tracking-wide font-semibold mb-1">So'rov (request body)</p>
                  <pre className="bg-elevated border border-line rounded-xl p-3 text-xs text-muted overflow-x-auto whitespace-pre">{e.request}</pre>
                </div>
              )}

              <div>
                <p className="text-faint text-[11px] uppercase tracking-wide font-semibold mb-1">Javob (response)</p>
                <pre className="bg-elevated border border-line rounded-xl p-3 text-xs text-muted overflow-x-auto whitespace-pre">{e.response}</pre>
              </div>

              {e.notes && <p className="text-faint text-xs mt-3">ℹ️ {e.notes}</p>}
            </section>
          ))}
        </div>

        <p className="text-faint text-xs mt-12 text-center">
          Savol yoki xatolik topsangiz — <a href="mailto:norqoziyevumid99@gmail.com" className="text-gold hover:opacity-80 link-quiet">murojaat qiling</a>.
        </p>
      </main>
    </div>
  );
}

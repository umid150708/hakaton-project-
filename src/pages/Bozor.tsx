/**
 * Bozor.tsx — B2B Marketplace page (Muammo 14)
 *
 * Responsibilities: tab/filter state, auth gate, routing to /pricing.
 * Data lives in src/lib/bozorData.ts.
 * All sub-components live in src/components/.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getUser, useDealContact, FREE_LIMIT, type UserProfile } from '../lib/auth';
import { CATEGORIES, SAMPLE_BUY, SAMPLE_SELL, loadUserAds, type Ad, type Category } from '../lib/bozorData';

import AdCard      from '../components/AdCard';
import PostAdModal from '../components/PostAdModal';
import AIStrip     from '../components/AIStrip';
import SignUpModal from '../components/SignUpModal';

// ─── Deal modal (terms → gated contact reveal) ─────────────────────────────────

type DealMode = 'signup' | 'reveal' | 'subscribe';

/**
 * DealModal — two-stage deal flow.
 *   Stage 1: show deal conditions/terms; contact stays HIDDEN.
 *   Stage 2 (after agreeing): contact is revealed — only reached if the user
 *   is eligible (active subscription, deal-fee plan, or free trial left).
 * Non-eligible users are routed to Pricing instead of seeing the contact.
 */
function DealModal({
  ad, revealed, mode, freeLeft, onAgree, onClose,
}: {
  ad: Ad;
  revealed: boolean;
  mode: DealMode;
  freeLeft: number | null;
  onAgree: () => void;
  onClose: () => void;
}) {
  const isBuy = ad.type === 'buy';
  const accent = isBuy ? 'text-blue-400' : 'text-emerald-400';
  const btnCls = isBuy ? 'bg-blue-700 hover:bg-blue-600' : 'bg-emerald-700 hover:bg-emerald-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-bold leading-tight">{ad.product}</p>
            <span className={`text-[11px] font-semibold ${accent}`}>{isBuy ? '🛒 Xaridor' : '💰 Sotuvchi'}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white shrink-0">✕</button>
        </div>

        {/* Deal facts */}
        <div className="space-y-2 text-sm bg-zinc-800/50 rounded-xl p-3">
          <p className="text-zinc-300">📦 {ad.quantity}</p>
          <p className="text-zinc-300">📍 {ad.location}</p>
          {ad.price && <p className={`font-bold ${accent}`}>💵 {ad.price}</p>}
        </div>

        {revealed ? (
          /* ── Stage 2: contact revealed ── */
          <>
            <a href={`tel:${ad.contact.replace(/\s/g, '')}`}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-colors ${btnCls}`}>
              📞 {ad.contact}
            </a>
            <p className="text-zinc-600 text-xs text-center">
              Kontakt ochildi{freeLeft !== null && ' — 1 ta bepul aloqa sarflandi'}. Bevosita bog'laning.
            </p>
          </>
        ) : (
          /* ── Stage 1: terms + gated action ── */
          <>
            <div className="rounded-xl border border-zinc-700/60 p-3 space-y-1.5">
              <p className="text-zinc-300 text-xs font-semibold mb-1">Bitim shartlari</p>
              {[
                "Platforma xaridor va sotuvchini bevosita bog'laydi.",
                'Sifat, narx va yetkazib berish tomonlar kelishuviga bog\'liq.',
                'Kontakt faqat obuna yoki bepul limit orqali ochiladi.',
                'Yopilgan bitimdan platforma xizmat haqi olinadi.',
              ].map(t => (
                <div key={t} className="flex items-start gap-2">
                  <span className={`shrink-0 text-xs ${accent}`}>•</span>
                  <span className="text-zinc-400 text-xs leading-relaxed">{t}</span>
                </div>
              ))}
            </div>

            {/* Contact locked */}
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800/60 border border-dashed border-zinc-700 text-zinc-500 text-sm">
              🔒 +998 •• ••• •• ••
            </div>

            {mode === 'reveal' && (
              <button onClick={onAgree} className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${btnCls}`}>
                ✓ Roziman — kontaktni ochish
              </button>
            )}
            {mode === 'subscribe' && (
              <button onClick={onAgree} className="w-full py-3 rounded-xl text-white text-sm font-bold bg-purple-700 hover:bg-purple-600 transition-all active:scale-95">
                🔒 Ochish uchun obuna tanlash
              </button>
            )}
            {mode === 'signup' && (
              <button onClick={onAgree} className="w-full py-3 rounded-xl text-white text-sm font-bold bg-emerald-700 hover:bg-emerald-600 transition-all active:scale-95">
                Ro'yxatdan o'tib ochish
              </button>
            )}

            <p className="text-zinc-600 text-xs text-center">
              {mode === 'reveal' && freeLeft !== null && `Bepul limit: ${freeLeft} ta qoldi`}
              {mode === 'reveal' && freeLeft === null && 'Obunangiz faol — cheksiz aloqa'}
              {mode === 'subscribe' && "Bepul limitingiz tugadi — kontaktni ochish uchun to'lov kerak"}
              {mode === 'signup' && "Kontaktni ochish uchun avval ro'yxatdan o'ting"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Bozor() {
  const navigate = useNavigate();

  // Tabs & filters
  const [tab, setTab]     = useState<'buy' | 'sell'>('buy');
  const [cat, setCat]     = useState<Category>('all');
  const [search, setSearch] = useState('');

  // Ads
  const [userAds, setUserAds]   = useState<Ad[]>(loadUserAds);
  const [showPostModal, setShowPostModal] = useState(false);

  // Auth gate + deal flow
  const [authUser, setAuthUser]         = useState<UserProfile | null>(getUser);
  const [showSignUp, setShowSignUp]     = useState(false);
  const [dealAd, setDealAd]             = useState<Ad | null>(null);   // ad shown in DealModal
  const [dealRevealed, setDealRevealed] = useState(false);            // contact unlocked?
  const [pendingAd, setPendingAd]       = useState<Ad | null>(null);  // ad awaiting post-signup

  // Reload user ads when post modal closes
  useEffect(() => { if (!showPostModal) setUserAds(loadUserAds()); }, [showPostModal]);

  const isBuy = tab === 'buy';

  // ── Derived ad lists ──────────────────────────────────────────────────────────

  const baseAds: Ad[] = isBuy
    ? [...userAds.filter(a => a.type === 'buy'),  ...SAMPLE_BUY]
    : [...userAds.filter(a => a.type === 'sell'), ...SAMPLE_SELL];

  const countByCat = (c: Category) =>
    c === 'all' ? baseAds.length : baseAds.filter(a => a.category === c).length;

  const q = search.toLowerCase().trim();
  const visibleAds = baseAds
    .filter(a => cat === 'all' || a.category === cat)
    .filter(a => !q || a.product.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));

  // ── Deal flow ───────────────────────────────────────────────────────────────
  // Clicking "Batafsil" opens the terms stage — contact stays hidden. The user
  // only reaches the contact after agreeing AND being eligible (subscription or
  // free trial). Ineligible users are routed to Pricing.

  const openDeal = (ad: Ad) => {
    setDealAd(ad);
    setDealRevealed(false);
  };

  // ── Free counter label ────────────────────────────────────────────────────────

  const freeLeft = authUser?.plan === 'free'
    ? Math.max(0, FREE_LIMIT - (authUser.dealContactsUsed ?? 0))
    : null;

  // What the DealModal's action button should do for the current user
  const dealMode: DealMode = !authUser
    ? 'signup'
    : authUser.plan !== 'free' || (freeLeft ?? 0) > 0
      ? 'reveal'
      : 'subscribe';

  const agreeDeal = () => {
    if (!dealAd) return;
    if (dealMode === 'signup')    { setPendingAd(dealAd); setDealAd(null); setShowSignUp(true); return; }
    if (dealMode === 'subscribe') { setDealAd(null); navigate('/pricing'); return; }
    // reveal — consume a free contact (no-op for subscribers) then show
    const result = useDealContact();
    if (result === 'paywall') { setDealAd(null); navigate('/pricing'); return; }
    setAuthUser(getUser());
    setDealRevealed(true);
  };

  const onSignUpSuccess = () => {
    setShowSignUp(false);
    setAuthUser(getUser());
    if (pendingAd) { openDeal(pendingAd); setPendingAd(null); }  // resume at terms stage
  };

  const switchTab = (t: 'buy' | 'sell') => { setTab(t); setCat('all'); setSearch(''); };

  const totalBuy  = [...userAds.filter(a => a.type === 'buy'),  ...SAMPLE_BUY].length;
  const totalSell = [...userAds.filter(a => a.type === 'sell'), ...SAMPLE_SELL].length;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white text-xl leading-none shrink-0">←</button>

          {/* Buy / Sell toggle */}
          <div className="flex bg-zinc-900 border border-zinc-700 rounded-xl p-1 gap-1 shrink-0">
            <button onClick={() => switchTab('buy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isBuy ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-zinc-400 hover:text-white'}`}>
              🛒 Xaridorlar
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isBuy ? 'bg-blue-500/40 text-blue-100' : 'bg-zinc-800 text-zinc-500'}`}>
                {totalBuy}
              </span>
            </button>
            <button onClick={() => switchTab('sell')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                !isBuy ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-zinc-400 hover:text-white'}`}>
              💰 Sotuvchilar
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!isBuy ? 'bg-emerald-500/40 text-emerald-100' : 'bg-zinc-800 text-zinc-500'}`}>
                {totalSell}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Mahsulot yoki shahar..."
              className="w-full pl-9 pr-8 py-2 bg-zinc-800 border border-zinc-700 focus:border-blue-600 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs">✕</button>}
          </div>

          {/* Free counter / plan badge */}
          {!authUser ? (
            <button onClick={() => setShowSignUp(true)}
              className="shrink-0 px-3 py-1.5 bg-emerald-800/50 hover:bg-emerald-700/60 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-700/50 transition-colors">
              🎁 Bepul kirish
            </button>
          ) : freeLeft !== null ? (
            <button onClick={() => navigate('/pricing')}
              className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                freeLeft === 0
                  ? 'bg-red-900/40 border-red-700/50 text-red-400 hover:bg-red-800/40'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}>
              {freeLeft === 0 ? '🔒 Limit tugadi' : `🎁 ${freeLeft} ta bepul`}
            </button>
          ) : (
            <span className="shrink-0 px-2.5 py-1 bg-purple-900/30 text-purple-400 text-xs font-semibold rounded-lg border border-purple-800/50">⭐ Pro</span>
          )}

          {/* Post ad */}
          <button onClick={() => setShowPostModal(true)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${
              isBuy ? 'bg-blue-700 hover:bg-blue-600' : 'bg-emerald-700 hover:bg-emerald-600'}`}>
            <span>+</span>
            <span className="hidden sm:inline">E'lon</span>
          </button>

          <button onClick={() => navigate('/interview')} title="AI Maslahat" className="shrink-0 text-zinc-500 hover:text-white text-lg transition-colors">🤖</button>
        </div>

        {/* ── Category filter strip ── */}
        <div className="border-t border-zinc-800/60 bg-zinc-950/80">
          <div className="max-w-5xl mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto">
            {CATEGORIES.map(c => {
              const count = countByCat(c.id);
              const active = cat === c.id;
              const disabled = count === 0 && c.id !== 'all';
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  disabled={disabled}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0
                    ${active
                      ? isBuy ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                      : disabled
                        ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500'
                    }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                  {c.id !== 'all' && count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-700 text-zinc-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 space-y-4">

        {/* AI market strip — re-mounts when tab or category changes */}
        <AIStrip key={`${tab}-${cat}`} tab={tab} cat={cat} ads={visibleAds} />

        {/* Result count + clear */}
        <div className="flex items-center justify-between">
          <p className="text-zinc-500 text-sm">
            <span className={`font-semibold ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>{visibleAds.length}</span>
            {' '}ta {q || cat !== 'all' ? 'natija' : isBuy ? "xarid e'loni" : "sotuv e'loni"}
            {cat !== 'all' && <> · <span className="text-white">{CATEGORIES.find(c => c.id === cat)?.label}</span></>}
            {q && <> · "<span className="text-white">{search}</span>"</>}
          </p>
          {(q || cat !== 'all') && (
            <button onClick={() => { setSearch(''); setCat('all'); }} className="text-xs text-zinc-500 hover:text-white transition-colors">
              Filtrni tozalash ✕
            </button>
          )}
        </div>

        {/* Ads grid */}
        {visibleAds.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-zinc-300 font-semibold mb-1">Hech narsa topilmadi</p>
            <p className="text-zinc-600 text-sm">Filtr yoki qidiruvni o'zgartiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleAds.map(ad => (
              <AdCard key={ad.id} ad={ad} onOpen={() => openDeal(ad)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showPostModal  && <PostAdModal type={tab} onClose={() => setShowPostModal(false)} onPost={() => setUserAds(loadUserAds())} />}
      {showSignUp     && <SignUpModal onSuccess={onSignUpSuccess} onClose={() => { setShowSignUp(false); setPendingAd(null); }} />}
      {dealAd         && <DealModal ad={dealAd} revealed={dealRevealed} mode={dealMode} freeLeft={freeLeft} onAgree={agreeDeal} onClose={() => setDealAd(null)} />}

      <footer className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-center">
        <p className="text-zinc-700 text-xs">Chorsu · Ipodrom ulgurji bozori · 2026-yil iyun · BiznesPlan AI</p>
      </footer>
    </div>
  );
}

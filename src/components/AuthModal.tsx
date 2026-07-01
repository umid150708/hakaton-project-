/**
 * AuthModal.tsx — sign-up + sign-in gate.
 *
 * Sign-up: name + phone + business type → creates the local profile and
 *   persists it to Supabase (so it can be restored later / on other devices).
 * Sign-in: phone only → restores the profile from Supabase.
 *
 * The captured profile is what powers the chatbot's personalized answers.
 */

import { useState } from 'react';
import { signUp, getUser, BIZ_TYPE_LABELS, type BizType } from '../lib/auth';
import { signInByPhone, syncProfile } from '../lib/profile';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  initialMode?: 'signup' | 'signin';
}

const BIZ_TYPES = Object.entries(BIZ_TYPE_LABELS) as [BizType, string][];

export default function AuthModal({ onSuccess, onClose, initialMode = 'signup' }: Props) {
  const [mode, setMode]       = useState<'signup' | 'signin'>(initialMode);
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [bizType, setBizType] = useState<BizType>('savdo');
  const [step, setStep]       = useState<'form' | 'done'>('form');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');

  const canSignUp = name.trim().length >= 2 && phone.trim().length >= 9;
  const canSignIn = phone.trim().length >= 9;

  const doSignUp = () => {
    if (!canSignUp) return;
    signUp(name.trim(), phone.trim(), bizType);
    const u = getUser();
    if (u) syncProfile(u);              // persist so sign-in works later
    setStep('done');
    setTimeout(onSuccess, 900);
  };

  const doSignIn = async () => {
    if (!canSignIn || busy) return;
    setBusy(true);
    setError('');
    const u = await signInByPhone(phone.trim());
    setBusy(false);
    if (!u) {
      setError("Bu raqam topilmadi. Iltimos, ro'yxatdan o'ting.");
      return;
    }
    setStep('done');
    setTimeout(onSuccess, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>

        {step === 'done' ? (
          <div className="p-8 text-center space-y-3">
            <div className="text-5xl">{mode === 'signup' ? '🎉' : '👋'}</div>
            <p className="text-white font-bold text-lg">
              {mode === 'signup' ? 'Xush kelibsiz!' : 'Qaytganingizdan xursandmiz!'}
            </p>
            <p className="text-slate-400 text-sm">
              {mode === 'signup'
                ? <>Sizga 3 ta <span className="text-white font-semibold">bepul aloqa</span> berildi.</>
                : 'Profilingiz tiklandi — AI endi sizga moslashtirilgan javob beradi.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header + mode tabs */}
            <div className="bg-emerald-900/25 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1">
                <button onClick={() => { setMode('signup'); setError(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'signup' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                  Ro'yxatdan o'tish
                </button>
                <button onClick={() => { setMode('signin'); setError(''); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'signin' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                  Kirish
                </button>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-5 space-y-4">

              {mode === 'signup' && (
                <div className="flex gap-2 justify-center py-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-full bg-emerald-900/40 border-2 border-emerald-600 flex items-center justify-center text-emerald-400 font-bold text-sm">{i}</div>
                      <span className="text-slate-600 text-[10px]">bepul</span>
                    </div>
                  ))}
                </div>
              )}

              {mode === 'signin' && (
                <p className="text-slate-400 text-xs text-center leading-relaxed">
                  Telefon raqamingizni kiriting — profilingiz va biznes ma'lumotlaringiz tiklanadi.
                </p>
              )}

              {/* Name — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1.5 block">Ismingiz <span className="text-red-400">*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jasur Karimov" autoFocus
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors" />
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Telefon <span className="text-red-400">*</span></label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67" type="tel"
                  autoFocus={mode === 'signin'}
                  onKeyDown={e => { if (e.key === 'Enter' && mode === 'signin') doSignIn(); }}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors" />
              </div>

              {/* Business type — signup only */}
              {mode === 'signup' && (
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-2 block">Biznes turi</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BIZ_TYPES.map(([id, label]) => (
                      <button key={id} onClick={() => setBizType(id)}
                        className={`py-2 px-1 rounded-xl border text-xs font-medium transition-all text-center
                          ${bizType === id
                            ? 'bg-emerald-700/40 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              {mode === 'signup' ? (
                <button onClick={doSignUp} disabled={!canSignUp}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all active:scale-95">
                  Bepul boshlash — 3 ta aloqa 🎁
                </button>
              ) : (
                <button onClick={doSignIn} disabled={!canSignIn || busy}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all active:scale-95">
                  {busy ? 'Tekshirilmoqda…' : 'Kirish →'}
                </button>
              )}

              <p className="text-slate-700 text-[11px] text-center leading-relaxed">
                {mode === 'signup'
                  ? "Ro'yxatdan o'tish bilan foydalanish shartlarini qabul qilasiz. Karta talab qilinmaydi."
                  : "Hisobingiz yo'qmi? Yuqoridan \"Ro'yxatdan o'tish\"ni tanlang."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

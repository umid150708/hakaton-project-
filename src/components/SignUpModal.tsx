/**
 * SignUpModal.tsx — lightweight sign-up gate
 * Shown when an anonymous user tries to contact a seller/buyer.
 * Stores data in localStorage via auth.ts.
 */

import { useState } from 'react';
import { signUp, BIZ_TYPE_LABELS, type BizType } from '../lib/auth';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const BIZ_TYPES = Object.entries(BIZ_TYPE_LABELS) as [BizType, string][];

export default function SignUpModal({ onSuccess, onClose }: Props) {
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [bizType, setBizType] = useState<BizType>('savdo');
  const [step, setStep]       = useState<'form' | 'done'>('form');

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 9;

  const submit = () => {
    if (!canSubmit) return;
    signUp(name.trim(), phone.trim(), bizType);
    setStep('done');
    setTimeout(onSuccess, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

        {step === 'done' ? (
          <div className="p-8 text-center space-y-3">
            <div className="text-5xl">🎉</div>
            <p className="text-white font-bold text-lg">Xush kelibsiz!</p>
            <p className="text-slate-400 text-sm">Sizga 3 ta <span className="text-white font-semibold">bepul aloqa</span> berildi.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-emerald-900/25 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-emerald-400 font-bold text-base">🎁 Bepul ro'yxatdan o'tish</p>
                <p className="text-slate-500 text-xs mt-0.5">Birinchi 3 ta aloqa mutlaqo bepul</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="p-5 space-y-4">

              {/* Free deal counter visual */}
              <div className="flex gap-2 justify-center py-2">
                {[1,2,3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-900/40 border-2 border-emerald-600 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {i}
                    </div>
                    <span className="text-slate-600 text-[10px]">bepul</span>
                  </div>
                ))}
              </div>

              {/* Name */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Ismingiz <span className="text-red-400">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jasur Karimov"
                  autoFocus
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors" />
              </div>

              {/* Phone */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block">Telefon <span className="text-red-400">*</span></label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  type="tel"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors" />
              </div>

              {/* Business type */}
              <div>
                <label className="text-slate-400 text-xs font-medium mb-2 block">Biznes turi</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {BIZ_TYPES.map(([id, label]) => (
                    <button key={id} onClick={() => setBizType(id)}
                      className={`py-2 px-1 rounded-xl border text-xs font-medium transition-all text-center
                        ${bizType === id
                          ? 'bg-emerald-700/40 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                        }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={submit} disabled={!canSubmit}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all active:scale-95">
                Bepul boshlash — 3 ta aloqa 🎁
              </button>

              <p className="text-slate-700 text-[11px] text-center leading-relaxed">
                Ro'yxatdan o'tish bilan siz foydalanish shartlarini qabul qilasiz.
                Karta ma'lumotlari talab qilinmaydi.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

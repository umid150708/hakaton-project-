/**
 * analysis.ts — Three market-analysis modes for the AI maslahatchi. Each is a
 * system-prompt framework plus a per-user prompt injecting the entrepreneur's
 * profile: bozor (market), raqobat (competition), sanoat (industry).
 * Output is markdown-ish (## headings, "•" bullets) that Interview.formatText renders.
 */

import {
  getUser, BIZ_TYPE_LABELS, REG_TYPE_LABELS, COLLATERAL_LABELS,
  type UserProfile,
} from './auth';

export type AnalysisType = 'bozor' | 'raqobat' | 'sanoat';

export const ANALYSIS_META: Record<AnalysisType, { label: string; sub: string; icon: string }> = {
  bozor:   { label: 'Bozor tahlili',   sub: 'Talab, narx, mijozlar',       icon: 'chart-bar'  },
  raqobat: { label: 'Raqobat tahlili', sub: 'Raqobatchilar, ustunlik',     icon: 'swords'     },
  sanoat:  { label: 'Sanoat tahlili',  sub: '5 kuch, tartibga solish',     icon: 'building'   },
};

// Expert frameworks: teach the model how each analysis is done.
const COMMON_RULES = `
UMUMIY QOIDALAR:
• Faqat O'zbek tilida yoz.
• Har bo'limni "## Sarlavha" ko'rinishida ber, ichida 2-3 ta "•" punkt.
• Aniq bo'l — raqam, diapazon, foiz keltir (taxminiy bo'lsa "taxminan" deb belgila). Umumiy "bozorni o'rganing" kabi bo'sh gaplar YOZMA.
• Foydalanuvchining hududi, biznes turi va ko'lamiga aniq moslab yoz.
• Oxirida "## Tavsiya" bo'limida FAQAT BITTA aniq, bugun bajariladigan qadam ber.`;

const BOZOR_SYSTEM = `Siz O'zbekiston bozorlari bo'yicha professional bozor tahlilchisisiz (market analyst). Foydalanuvchining biznesi uchun BOZOR TAHLILI yozing.

Quyidagi tuzilishda yozing:
## Talab va bozor hajmi
• Ushbu mahsulot/xizmatga foydalanuvchi hududida va O'zbekistonda talab darajasi (yuqori/o'rta/past) va sababi.
## Narx dinamikasi
• Hozirgi narx darajasi va yo'nalishi (oshmoqda/barqaror/tushmoqda), mavsumiylik ta'siri.
## Maqsadli mijozlar
• Kim asosiy xaridor (segmentlar) va ular nimaga e'tibor beradi.
## Imkoniyat va risklar
• 1-2 asosiy o'sish imkoniyati va 1-2 xavf.
${COMMON_RULES}`;

const RAQOBAT_SYSTEM = `Siz raqobat tahlili bo'yicha strategsiz (competition analyst). Foydalanuvchining biznesi uchun RAQOBAT TAHLILI yozing.

Quyidagi tuzilishda yozing:
## Raqobatchilar
• Ushbu sohadagi asosiy raqobatchi turlari (bozordagi mayda sotuvchilar, yirik firmalar, import mahsulotlari).
## Narx va joylashuv
• Raqobatchilarning narx darajasi va bozordagi o'rni.
## Raqobat zichligi
• Raqobat qanchalik kuchli — yangi kirish qanchalik oson, o'rnini bosuvchi mahsulotlar bormi.
## Sizning ustunligingiz
• Foydalanuvchi profiliga qarab (ko'lami, hududi, imtiyozlari, garovi) qanday real ustunliklari va zaif tomonlari bor.
## Farqlanish strategiyasi
• BITTA aniq farqlanish (differentiation) yo'li — narx, sifat, xizmat yoki nisha.
${COMMON_RULES}`;

const SANOAT_SYSTEM = `Siz sanoat tahlili bo'yicha ekspertsiz (industry analyst). Porter'ning beshta kuchi (Five Forces) va tartibga solish muhitidan foydalaning. Foydalanuvchining sohasi uchun SANOAT TAHLILI yozing.

Quyidagi tuzilishda yozing:
## Sanoat sharhi
• O'zbekistonda ushbu sohaning holati, o'sish sur'ati va yetukligi.
## Beshta kuch (Porter)
• Yetkazib beruvchilar kuchi, xaridorlar kuchi, yangi kiruvchilar tahdidi, o'rnini bosuvchilar va mavjud raqobat — har birini bitta jumlada baholang.
## Tartibga solish va soliq
• Ushbu sohaga tegishli O'zbekiston qonun, soliq, litsenziya yoki sertifikat talablari.
## Kelajak yo'nalishlari
• Texnologiya, davlat dasturlari va trendlar sohani qanday o'zgartiryapti.
${COMMON_RULES}`;

const SYSTEMS: Record<AnalysisType, string> = {
  bozor:   BOZOR_SYSTEM,
  raqobat: RAQOBAT_SYSTEM,
  sanoat:  SANOAT_SYSTEM,
};

export function analysisSystem(type: AnalysisType): string {
  return SYSTEMS[type];
}

/** A labelled dump of everything we know about the user, for the analysis. */
function profileBlock(u: UserProfile): string {
  const lines: string[] = [];
  if (u.businessName) lines.push(`• Biznes nomi: ${u.businessName}`);
  if (u.bizType)      lines.push(`• Faoliyat turi: ${BIZ_TYPE_LABELS[u.bizType]}`);
  if (u.location)     lines.push(`• Hudud: ${u.location}`);
  if (u.regType)      lines.push(`• Ro'yxat shakli: ${REG_TYPE_LABELS[u.regType]}`);
  if (u.yearsInBiz)   lines.push(`• Biznes tajribasi: ${u.yearsInBiz} yil`);
  if (u.employees)    lines.push(`• Xodimlar soni: ${u.employees === '0' ? "faqat o'zi" : u.employees}`);
  if (u.revenueBand)  lines.push(`• Yillik daromad: ${u.revenueBand}`);
  if (u.collateral && u.collateral !== 'none') lines.push(`• Kredit garovi: ${COLLATERAL_LABELS[u.collateral]}`);
  if (u.disability)   lines.push(`• Nogironlik guruhi: ${u.disability} (soliq/kredit imtiyozlari bor)`);
  if (u.bio)          lines.push(`• Qo'shimcha: ${u.bio.slice(0, 300)}`);
  return lines.join('\n');
}

const TASK_LINE: Record<AnalysisType, string> = {
  bozor:   'Ushbu tadbirkor uchun BOZOR tahlilini yuqoridagi tuzilishda yoz.',
  raqobat: 'Ushbu tadbirkor uchun RAQOBAT tahlilini yuqoridagi tuzilishda yoz.',
  sanoat:  'Ushbu tadbirkorning sohasi uchun SANOAT tahlilini yuqoridagi tuzilishda yoz.',
};

export function buildAnalysisPrompt(type: AnalysisType, u: UserProfile): string {
  return `TADBIRKOR MA'LUMOTLARI:
${profileBlock(u)}

${TASK_LINE[type]}`;
}

/** True when we know enough to run a *tailored* analysis (need at least the sector). */
export function canAnalyse(u: UserProfile | null): u is UserProfile {
  return !!u && !!u.bizType;
}

/** Convenience: current user, or null. */
export function currentUser(): UserProfile | null {
  return getUser();
}

/**
 * templatePlan — generate a full AIResult from extracted facts.
 * Never echoes nonsense back. All text is conditional on data quality.
 */

import type { AIResult, Facts } from './schema';

// ─── Sanitizer ────────────────────────────────────────────────────────────────

const NONSENSE = /^(hech\s*(nimaga?|narsa)?|yo'q albatta|bilmadim|bilmayman|ko'ramiz|ko'rinar|noma'lum|nothing|none|no|ha|ok+|bor|yoq|-|\.+|\?+|x+)$/i;

function clean(text: string, fallback: string): string {
  if (!text || text.trim().length < 3 || NONSENSE.test(text.trim())) return fallback;
  return text.trim();
}

function fmt(uzs: number): string {
  if (uzs === 0) return "aniqlanmagan";
  if (uzs >= 1_000_000_000) return `${(uzs / 1_000_000_000).toFixed(1)} mlrd so'm`;
  if (uzs >= 1_000_000) return `${(uzs / 1_000_000).toFixed(0)} mln so'm`;
  return `${uzs.toLocaleString()} so'm`;
}

// ─── Bank selector ────────────────────────────────────────────────────────────

function selectBanks(f: Facts): AIResult['bank_recommendations'] {
  const amt = f.loan_amount_uzs;
  const bt  = f.business_type.toLowerCase();

  const isFood = /novvoy|oziq|go'sht|sut|sabzavot|meva|qishloq|ferma|dehqon/.test(bt);
  const isService = /xizmat|ta'lim|tibbiy|salomatlik|dastur|axborot/.test(bt);
  const isMfg = /ishlab chiqar|fabrika|zavod|sex\b/.test(bt);

  const banks: AIResult['bank_recommendations'] = [];

  // Mikrokreditbank — best for small loans
  if (amt <= 500_000_000 || amt === 0) {
    banks.push({
      bank: 'Mikrokreditbank',
      why_fit:
        `${f.region}da kichik biznes uchun eng qulay bank. ` +
        (f.has_collateral
          ? "Ko'chmas mulk garovinggiz mavjud — afzal shartlar olish imkoniyati yuqori."
          : "Garovsiz yoki kafil asosida kreditlash dasturlari mavjud.") +
        (amt > 0 && amt <= 200_000_000 ? " Sizning kredit miqdoringiz ularning asosiy yo'nalishi." : ""),
      likely_requirements:
        `• Pasport + STIR\n• Biznes faoliyat guvohnomasi\n• Oxirgi 6 oy bank ko'chirmasi\n` +
        (f.has_collateral ? `• Garov hujjatlari (${clean(f.collateral_type, "mol-mulk")})\n` : "• Kafil (1–2 nafar) talab qilinishi mumkin\n") +
        `• Ushbu biznes-reja`,
    });
  }

  // Kapitalbank — medium to large
  if (amt >= 100_000_000 || (!f.has_collateral && amt > 0)) {
    banks.push({
      bank: 'Kapitalbank',
      why_fit:
        `KOK kreditlash bo'yicha yirik tijorat banki. ` +
        (f.has_collateral
          ? "Garov mavjudligi yaxshi shartlar uchun asos beradi."
          : "Garov bo'lmasa kuchli moliyaviy ko'rsatkichlar talab qilinadi.") +
        (amt >= 500_000_000 ? " Katta hajmdagi kreditlarga ixtisoslashgan." : ""),
      likely_requirements:
        `• Moliyaviy hisobotlar (oxirgi 1 yil)\n• STIR + pasport\n• Biznes faoliyat guvohnomasi\n` +
        (f.has_collateral ? `• Garov baholash xulosasi\n` : "") +
        `• To'liq biznes-reja`,
    });
  }

  // Aloqabank — food, services, manufacturing, or when we need a 3rd
  if (isFood || isService || isMfg || banks.length < 2) {
    banks.push({
      bank: 'Aloqabank',
      why_fit:
        (isFood ? "Oziq-ovqat ishlab chiqarish uchun davlat subsidiyali kreditlar mavjud. " : "") +
        (isService ? "Xizmat sohasiga imtiyozli foiz stavkalari taklif etiladi. " : "") +
        (isMfg ? "Ishlab chiqarish korxonalari uchun maxsus qo'llab-quvvatlash dasturlari bor. " : "") +
        (!isFood && !isService && !isMfg ? "Barcha soha uchun qulay kredit dasturlari mavjud. " : "") +
        "Barqaror foiz stavkalari va uzun muddat imkoniyati.",
      likely_requirements:
        `• Pasport + STIR\n• Soha litsenziyasi (talab qilinsa)\n• Oxirgi 6 oy tushum ma'lumoti\n` +
        (f.has_collateral ? `• Garov hujjatlari\n` : "") +
        `• Ushbu biznes-reja`,
    });
  }

  return banks.slice(0, 3);
}

// ─── Checklist ────────────────────────────────────────────────────────────────

function generateChecklist(f: Facts): string[] {
  const items: string[] = [
    "Pasport nusxasi (barcha sahifalari) — fuqarolik xizmatlar markazidan",
    "STIR (soliq to'lovchi raqami) — soliq inspeksiyasidan",
    "Yakka tadbirkor guvohnomasi yoki MChJ ro'yxatdan o'tganlik hujjati",
    "Oxirgi 6 oylik bank ko'chirmasi yoki kassa daftarchasi",
    "Ushbu biznes-reja (BiznesPlan AI tomonidan tayyorlangan)",
  ];

  if (f.has_collateral && f.collateral_type) {
    const ct = f.collateral_type.toLowerCase();
    if (/uy|ko'chmas|mulk|zamin|er|dala|kvartira/.test(ct)) {
      items.push("Ko'chmas mulk texnik pasporti va kadastir hujjatlari");
      items.push("Ko'chmas mulkni baholash xulosasi (sertifikatlangan baholovchidan)");
    } else if (/avto|mashin|transport|yuk/.test(ct)) {
      items.push("Avtomobil texnik pasporti va mulk dalolatnomasi");
    } else {
      items.push(`Garov ob'ekti hujjatlari va baholash xulosasi`);
    }
  } else {
    items.push("Kafil shaxslarning pasporti va daromad ma'lumotnomasi (2 nafar)");
  }

  if (f.employees >= 2) {
    items.push("Xodimlar ro'yxati va mehnat shartnomalari nusxalari");
  }
  if (f.years_operating >= 1) {
    items.push("Oxirgi 1 yillik soliq hisoboti — soliq inspeksiyasidan");
  }
  if (f.monthly_revenue_uzs > 0) {
    items.push("Daromad-xarajat daftarchasi yoki hisoboti (oxirgi 3–6 oy)");
  }

  return items;
}

// ─── Business plan text ───────────────────────────────────────────────────────

export function buildTemplatePlan(f: Facts): AIResult {
  const btype   = clean(f.business_type, "biznes");
  const region  = clean(f.region, "mintaqa");
  const purpose = clean(f.loan_purpose, "");
  const plan2yr = clean(f.two_year_plan, "");
  const rivals  = clean(f.main_competitors, "");

  const revStr  = fmt(f.monthly_revenue_uzs);
  const loanStr = fmt(f.loan_amount_uzs);
  const hasRev  = f.monthly_revenue_uzs > 0;
  const hasLoan = f.loan_amount_uzs > 0;

  const coverage = hasRev && hasLoan
    ? f.monthly_revenue_uzs * f.loan_term_months / f.loan_amount_uzs
    : null;

  // ── Executive Summary ──────────────────────────────────────────────────────
  const executive_summary = [
    `${region}da faoliyat yurituvchi "${btype}"`,
    f.years_operating > 0
      ? `${f.years_operating} yildan beri ishlamoqda.`
      : `nisbatan yangi biznes bo'lib, rivojlanish bosqichida.`,
    hasRev ? `Hozirgi oylik tushum ${revStr}.` : "",
    hasLoan && purpose
      ? `Kredit maqsadi: ${purpose}. Buning uchun ${f.loan_term_months} oyga ${loanStr} so'ralmoqda.`
      : hasLoan
      ? `${loanStr} kredit ${f.loan_term_months} oyga so'ralmoqda.`
      : "",
    f.has_collateral
      ? `Garov sifatida ${clean(f.collateral_type, "mol-mulk")} taqdim etilishi rejalashtirilgan.`
      : "Hozircha garov mo'ljallanmagan — kafil yoki mikrokreditlash dasturi ko'rib chiqilishi kerak.",
  ].filter(Boolean).join(" ");

  // ── Market Analysis ────────────────────────────────────────────────────────
  const market_analysis = [
    `${region} mintaqasida "${btype}" sohasida mahalliy talab barqaror.`,
    f.employees > 1
      ? `${f.employees} nafar xodim bilan faoliyat yuritilmoqda — bu biznesning ma'lum darajada tarkiblashganligini ko'rsatadi.`
      : "Hozircha yakka tartibda faoliyat ko'rsatilmoqda.",
    rivals
      ? `Raqobat muhiti: ${rivals}. Sifat, narx va mijozlarga munosabat orqali farqlanish muhim.`
      : "Raqiblar aniq ko'rsatilmagan — bozor pozitsiyasi va raqobat strategiyasini aniqlash tavsiya etiladi.",
    `${region} mintaqasida kichik biznesni qo'llab-quvvatlash uchun mahalliy hokimiyat va Savdo-sanoat palatasi dasturlari mavjud.`,
  ].filter(Boolean).join(" ");

  // ── Marketing & Production Plan ────────────────────────────────────────────
  const marketing_production_plan = [
    hasRev
      ? `Joriy oylik tushum ${revStr} — bu biznesning barqarorligini ko'rsatadi.`
      : "Hozirgi moliyaviy ko'rsatkichlar aniqlanmagan.",
    purpose
      ? `Kredit mablag'lari ${purpose} uchun yo'naltiriladi.`
      : "Kredit maqsadi aniqlanmagan — bu bankka murojaat qilishdan oldin albatta belgilanishi kerak.",
    purpose
      ? `Bu qadam "${btype}" uchun xizmat yoki ishlab chiqarish hajmini oshirib, tushumni ko'paytirish imkonini beradi.`
      : "",
    plan2yr
      ? `2 yillik strategiya: ${plan2yr}.`
      : "Kelajak rejasi ko'rsatilmagan — bank uzoq muddatli maqsadlarni ko'rishni talab qiladi.",
  ].filter(Boolean).join(" ");

  // ── Financial Forecast ─────────────────────────────────────────────────────
  const financialLines: string[] = [];

  if (hasRev) {
    financialLines.push(`Joriy oylik tushum: ${revStr} (tadbirkor ma'lumoti asosida).`);
  }
  if (hasLoan) {
    const monthly = (f.loan_amount_uzs / f.loan_term_months / 1_000_000).toFixed(1);
    financialLines.push(`Kredit: ${loanStr}, muddat: ${f.loan_term_months} oy. Taxminiy oylik to'lov: ${monthly} mln so'm (asosiy qarz, foizsiz).`);
  }
  if (coverage !== null) {
    if (coverage >= 2) {
      financialLines.push(`Tushum/kredit qoplash nisbati: ${coverage.toFixed(1)}x — kredit to'lovi ishonchli qoplanadi.`);
    } else if (coverage >= 1) {
      financialLines.push(`Tushum/kredit nisbati: ${coverage.toFixed(1)}x — to'lov qoplanadi, lekin moliyaviy zaxira chegaralangan. Xarajatlarni nazorat qilish muhim.`);
    } else {
      financialLines.push(`Diqqat: hozirgi tushum kredit to'lovini to'liq qoplay olmaydi (nisbat: ${coverage.toFixed(1)}x). Kredit miqdorini kamaytirish yoki muddatni uzaytirish tavsiya etiladi.`);
    }
  }

  if (purpose) {
    financialLines.push(`Investitsiya ta'siri: ${purpose} natijasida 1-yil davomida tushum 15–30% o'sishi kutilmoqda (soha o'rtacha ko'rsatkichi asosida).`);
  }
  financialLines.push("Barcha prognozlar taxminiy bo'lib, haqiqiy natija bozor sharoitiga bog'liq.");

  const financial_forecast = financialLines.join(" ");

  // ── Risk Assessment ────────────────────────────────────────────────────────
  const riskLines: string[] = [];
  riskLines.push("Asosiy risklar va boshqaruv choralari:");

  if (rivals) {
    riskLines.push(`Raqobat riski: ${rivals} — farqli xizmat, sifat va narx strategiyasi orqali yechiladi.`);
  }

  if (coverage !== null && coverage < 1.5) {
    riskLines.push("To'lov riski: tushum va kredit nisbati past — xarajatlarni qisqartirish yoki qo'shimcha daromad manbai topish tavsiya etiladi.");
  }

  if (!f.has_collateral) {
    riskLines.push("Garov yo'qligi: Mikrokreditbank yoki kafil asosida murojaat qilish lozim — bu xavfni biroz oshiradi.");
  }

  if (f.years_operating < 2) {
    riskLines.push("Tajriba riski: biznes yangi — kuchli biznes-reja va shaxsiy moliyaviy tarix bu kamchilikni qoplashi mumkin.");
  }

  riskLines.push("Umumiy baho: risklar boshqarib bo'ladigan darajada, asosiy e'tibor moliyaviy intizom va bozorda barqarorlikni ta'minlashga qaratilishi kerak.");

  const risk_assessment = riskLines.join(" ");

  return {
    facts: f,
    business_plan: {
      executive_summary,
      market_analysis,
      marketing_production_plan,
      financial_forecast,
      risk_assessment,
    },
    bank_recommendations: selectBanks(f),
    readiness_checklist: generateChecklist(f),
  };
}

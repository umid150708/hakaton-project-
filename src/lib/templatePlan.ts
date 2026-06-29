/**
 * templatePlan — generate a full AIResult from extracted facts.
 * Produces a personalized, realistic business plan without any API call.
 * The AI path (api/generate) replaces this with richer narrative when available.
 */

import type { AIResult, Facts } from './schema';

// ─── Bank selector ────────────────────────────────────────────────────────────

function selectBanks(f: Facts): AIResult['bank_recommendations'] {
  const amt = f.loan_amount_uzs;
  const bt  = f.business_type.toLowerCase();

  const isFood = /novvoy|oziq|go'sht|sut|sabzavot|meva|qishloq|ferma|dehqon/.test(bt);
  const isService = /xizmat|ta'lim|tibbiy|salomatlik|dastur|axborot/.test(bt);
  const isManufacturing = /ishlab chiqar|fabrika|zavod|sexs/.test(bt);

  const banks: AIResult['bank_recommendations'] = [];

  if (amt <= 500_000_000) {
    banks.push({
      bank: 'Mikrokreditbank',
      why_fit: `${f.region}da kichik biznes uchun eng qulay bank. ${f.has_collateral ? "Garovinggiz mavjud bo'lgani uchun" : "Garovsiz kreditlarga ixtisoslashgan."} ${amt <= 100_000_000 ? 'Sizning kredit miqdoringiz ularning asosiy yo\'nalishi.' : ''}`,
      likely_requirements: `• Pasport + STIR\n• Biznes guvohnomasi\n• 6 oylik bank ko'chirmasi\n${f.has_collateral ? `• ${f.collateral_type || 'Garov'} hujjatlari\n` : '• Kafil talab qilinishi mumkin\n'}• Ushbu biznes-reja`,
    });
  }

  if (amt >= 100_000_000) {
    banks.push({
      bank: 'Kapitalbank',
      why_fit: `KOK kreditlash bo'yicha yirik bank. ${f.has_collateral ? "Garov mavjud bo'lgani uchun yaxshi shartlar taklif qilishi mumkin." : 'Kuchli pul oqimi va biznes tarixi talab qilinadi.'} ${amt >= 500_000_000 ? 'Katta hajmdagi kreditlarga ixtisoslashgan.' : ''}`,
      likely_requirements: `• Moliyaviy hisobotlar (oxirgi 1 yil)\n• STIR, pasport\n• Biznes guvohnomasi\n${f.has_collateral ? `• ${f.collateral_type || 'Garov'} baholash xulosasi\n` : ''}• To'liq biznes-reja`,
    });
  }

  if (isFood || isService || isManufacturing || amt <= 300_000_000) {
    banks.push({
      bank: 'Aloqabank',
      why_fit: `${isFood ? 'Oziq-ovqat va qishloq xo\'jaligi uchun davlat dasturlari mavjud.' : ''} ${isService ? 'Xizmat ko\'rsatish sohasiga imtiyozli kreditlar taklif etadi.' : ''} ${isManufacturing ? 'Ishlab chiqarish korxonalarini qo\'llab-quvvatlash dasturlari bor.' : ''} Barqaror foiz stavkalari.`,
      likely_requirements: `• Pasport + STIR\n• Soha litsenziyasi (agar kerak bo'lsa)\n• Oxirgi 6 oy tushum ma'lumoti\n${f.has_collateral ? `• ${f.collateral_type || 'Garov'} hujjatlari\n` : ''}• Ushbu biznes-reja`,
    });
  }

  // Always return at least 2
  if (banks.length < 2) {
    banks.push({
      bank: 'Xalq banki',
      why_fit: `Davlat banki bo'lib, barcha hududlarda filiali bor. Kichik biznes uchun qulay imtiyozli dasturlar mavjud.`,
      likely_requirements: `• Pasport + STIR\n• Biznes guvohnomasi\n• Bank ko'chirmasi\n• Biznes-reja`,
    });
  }

  return banks.slice(0, 3);
}

// ─── Checklist generator ──────────────────────────────────────────────────────

function generateChecklist(f: Facts): string[] {
  const items = [
    'Pasport nusxasi — fuqarolik xizmatlar markazidan (FUBT)',
    'STIR — soliq inspeksiyasidan',
    'Yakka tadbirkor guvohnomasi yoki yuridik shaxs ro\'yxatidan o\'tganlik hujjati',
    'Oxirgi 6 oylik bank ko\'chirmasi yoki kassa kirim-chiqim daftari',
    'Ushbu biznes-reja (BiznesPlan AI tomonidan tayyorlangan)',
  ];
  if (f.has_collateral && f.collateral_type) {
    if (/uy|ko'chmas|mulk|zamin|er/.test(f.collateral_type.toLowerCase())) {
      items.push("Ko'chmas mulk hujjatlari — kadastir organi orqali tasdiqlangan");
    } else if (/avto|mashin|transport/.test(f.collateral_type.toLowerCase())) {
      items.push('Avtomobil texnik pasporti va mulk huquqi hujjati');
    } else {
      items.push(`Garov ob\'ekti hujjatlari: ${f.collateral_type}`);
    }
  }
  if (!f.has_collateral) {
    items.push('Kafil (2 nafar): pasport va daromad ma\'lumoti bilan');
  }
  if (f.employees >= 2) {
    items.push('Xodimlar ro\'yxati va mehnat shartnomalari');
  }
  if (f.years_operating >= 1) {
    items.push("Soliq hisobotlari (oxirgi 1 yil) — soliq inspeksiyasidan");
  }
  return items;
}

// ─── Business plan template ───────────────────────────────────────────────────

export function buildTemplatePlan(f: Facts): AIResult {
  const revMln = f.monthly_revenue_uzs > 0
    ? `${(f.monthly_revenue_uzs / 1_000_000).toFixed(0)} mln so'm`
    : "aniqlanmagan";

  const loanMln = f.loan_amount_uzs > 0
    ? `${(f.loan_amount_uzs / 1_000_000).toFixed(0)} mln so'm`
    : "aniqlanmagan";

  const coverage = f.monthly_revenue_uzs > 0 && f.loan_amount_uzs > 0
    ? (f.monthly_revenue_uzs * f.loan_term_months / f.loan_amount_uzs).toFixed(1)
    : null;

  const coverageNote = coverage
    ? parseFloat(coverage) >= 2
      ? `Tushum/kredit nisbati ${coverage}x — juda kuchli ko'rsatkich.`
      : parseFloat(coverage) >= 1
      ? `Tushum/kredit nisbati ${coverage}x — kredit to'lovi qoplanadi, lekin zaxira chegaralangan.`
      : `Tushum/kredit nisbati ${coverage}x — diqqat talab qiladi; xarajatlarni kamaytirish kerak.`
    : "Moliyaviy ko'rsatkichlar ko'rsatilmagan.";

  const yearsNote = f.years_operating >= 3
    ? `${f.years_operating} yillik barqaror faoliyat — banklar uchun kuchli ishonch belgisi.`
    : f.years_operating >= 1
    ? `${f.years_operating} yillik faoliyat bor — qo'shimcha moliyaviy hujjatlar talab qilinishi mumkin.`
    : "Biznes yangi — garov yoki kafil ayniqsa muhim.";

  return {
    facts: f,
    business_plan: {
      executive_summary:
        `${f.region}da faoliyat yurituvchi "${f.business_type}" ` +
        (f.years_operating > 0 ? `${f.years_operating} yildan beri ` : 'nisbatan yangi va ') +
        `ishlab kelmoqda. Oylik tushum ${revMln}ni tashkil etadi. ` +
        `Kredit maqsadi: ${f.loan_purpose}. ` +
        `Buning uchun ${f.loan_term_months} oyga ${loanMln} kredit so'ralmoqda. ` +
        (f.has_collateral ? `Garov mavjud: ${f.collateral_type}.` : "Garov yo'q."),

      market_analysis:
        `${f.region} mintaqasida "${f.business_type}" sohasidagi bozor barqaror talabga ega. ` +
        `Mahalliy aholining kundalik ehtiyojlari va mintaqaviy o'sish sur'atlari inobatga olinganda, ` +
        `biznesni kengaytirish uchun yetarli imkoniyat mavjud. ` +
        `Asosiy raqiblar: ${f.main_competitors}. ` +
        `Raqobatda ustunlik qilish uchun sifat, narx va xizmat sifatiga e'tibor berish tavsiya etiladi.`,

      marketing_production_plan:
        `Hozirgi holat: ${f.employees} nafar xodim bilan oyiga ${revMln} daromad olinmoqda. ` +
        `Kredit mablag'lari hisobiga ${f.loan_purpose}. ` +
        `Bu qadam ishlab chiqarish yoki xizmat hajmini oshirib, tushumni ko'paytirishga xizmat qiladi. ` +
        `Kelajak rejasi: ${f.two_year_plan}.`,

      financial_forecast:
        `Joriy oylik tushum: ${revMln} (tadbirkor ko'rsatmasi asosida). ` +
        `Kredit: ${loanMln}, muddat: ${f.loan_term_months} oy. ` +
        (f.loan_amount_uzs > 0 && f.loan_term_months > 0
          ? `Taxminiy oylik to'lov (asosiy qarz): ${((f.loan_amount_uzs / f.loan_term_months) / 1_000_000).toFixed(1)} mln so'm. `
          : '') +
        coverageNote + ' ' +
        `1-yil prognozi: tushum 15–25% o'sishi kutilmoqda (investitsiya samarasi). ` +
        `2-yil: ${f.two_year_plan.substring(0, 80)}... natijasida qo'shimcha o'sish. ` +
        `Barcha raqamlar taxminiy, haqiqiy natija bozor sharoitiga bog'liq.`,

      risk_assessment:
        `Asosiy risklar va yechimlar: ` +
        `1) Bozor raqobati (${f.main_competitors}) — sifat va farqli xizmat orqali yechiladi. ` +
        `2) To'lov qobiliyati — ${coverageNote} ` +
        `3) Xom ashyo narxi o'zgarishi — muqobil ta'minotchilar bilan oldindan kelishuv tavsiya etiladi. ` +
        (f.has_collateral
          ? '4) Garov mavjud — kredit xavfi past baholanadi.'
          : '4) Garov yo\'q — Mikrokreditbank yoki kafil orqali murojaat qilish tavsiya etiladi.') +
        ' ' + yearsNote,
    },
    bank_recommendations: selectBanks(f),
    readiness_checklist: generateChecklist(f),
  };
}

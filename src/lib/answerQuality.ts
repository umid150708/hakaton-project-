/**
 * answerQuality — detect weak/nonsense answers per question index.
 * Returns a bot warning message if the answer needs improvement, null if OK.
 */

// Patterns that indicate the user isn't being serious
const NONSENSE_PATTERN = /^(hech\s*(nimaga?|narsa)?|yo'q albatta|bilmadim|bilmayman|ko'ramiz|ko'rinar|noma'lum|idk|nothing|none|no|ha|ok+|bor|yoq|-|\.+|x+|\?+)$/i;
const TOO_SHORT = (t: string) => t.length < 4;

function isNonsense(text: string): boolean {
  const t = text.trim().toLowerCase();
  return TOO_SHORT(t) || NONSENSE_PATTERN.test(t);
}

function hasNumber(text: string): boolean {
  return /\d/.test(text);
}

/**
 * Returns a warning message string if the answer is bad, null if it's OK.
 * The warning is shown as a bot reply in the chat.
 */
export function checkAnswerQuality(questionIndex: number, answer: string): string | null {
  const t = answer.trim();

  switch (questionIndex) {

    case 2: // Years operating — needs a number or clear "new" keyword
      if (!hasNumber(t) && !/yil|oy|yangi|boshla|hozirgina|endigina|bir|ikki|uch|besh|olta|yetti/.test(t.toLowerCase())) {
        return "⚠️ Biznesingiz qancha vaqtdan beri ishlamoqda? Iltimos, aniqroq javob bering — masalan: \"2 yil\", \"6 oy\", yoki \"hozirgina boshlayapman\".";
      }
      break;

    case 3: // Monthly revenue — MUST have a number
      if (!hasNumber(t)) {
        return "⚠️ Oylik tushum kredit baholashning asosiy mezoni. Iltimos, taxminiy miqdorni so'mda yozing — masalan: \"15 million so'm\" yoki \"500 ming so'm\".";
      }
      if (isNonsense(t)) {
        return "⚠️ Bu ma'lumot juda muhim. Taxminan bo'lsa ham, oylik daromadingizni ko'rsating. Masalan: \"8 million so'm\".";
      }
      break;

    case 4: // Loan purpose — must be meaningful
      if (isNonsense(t) || t.length < 8) {
        return "⚠️ Kredit maqsadini aniqroq yozing. Bank sizdan bu savolni albatta so'raydi. Masalan: \"Yangi savdo uskunalari sotib olish\" yoki \"Do'konni kengaytirish uchun ta'mirlash\".";
      }
      break;

    case 5: // Loan amount + term — must have numbers
      if (!hasNumber(t)) {
        return "⚠️ Kredit miqdori va muddatini yozing. Masalan: \"50 million so'm, 24 oyga\" — ikkala ma'lumot ham kerak.";
      }
      if (!/oy|yil/.test(t.toLowerCase())) {
        return "⚠️ Kredit muddatini ham ko'rsating. Masalan: \"50 million, 24 oyga\".";
      }
      break;

    case 6: // Collateral — must be clear yes/no
      if (isNonsense(t)) {
        return "⚠️ Garov haqida aniqroq javob bering: \"Ha, uy-joy bor\" yoki \"Yo'q, garovim yo'q\" — bank birinchi shu savolni so'raydi.";
      }
      break;

    case 7: // Employees — needs a number
      if (!hasNumber(t) && !/o'zim|yakka|men|nafar|bir|ikki|uch|besh/.test(t.toLowerCase())) {
        return "⚠️ Xodimlar soni kredit baholashda hisobga olinadi. Iltimos, aniq raqam yozing — masalan: \"3 nafar\" yoki \"faqat o'zim ishlayapman\".";
      }
      break;

    case 9: // 2-year plan — must be meaningful
      if (isNonsense(t) || t.length < 10) {
        return "⚠️ Bank kelajak rejangizni bilmoqchi. Hech bo'lmasa 1-2 ta maqsadingizni yozing — masalan: \"Yangi filial ochish\" yoki \"Eksport boshlash va ishchilar sonini 10 taga yetkazish\".";
      }
      break;
  }

  return null; // answer is acceptable
}

/**
 * Assess overall data quality after all 10 answers.
 * Returns list of issues the result page can display.
 */
export interface DataIssue {
  field: string;
  label: string;     // Uzbek label
  message: string;   // What's wrong
  fix: string;       // How to fix
  severity: 'error' | 'warning';
}

export function assessDataQuality(facts: import('./schema').Facts): DataIssue[] {
  const issues: DataIssue[] = [];

  if (facts.monthly_revenue_uzs === 0) {
    issues.push({
      field: 'monthly_revenue_uzs',
      label: 'Oylik tushum',
      message: "Oylik tushum aniqlanmadi — bu To'lov qobiliyati ballini nolga tushiradi.",
      fix: "Intervyuni qayta o'ting va 4-savolga raqam kiriting. Masalan: '15 million so'm'",
      severity: 'error',
    });
  }

  if (facts.loan_amount_uzs === 0) {
    issues.push({
      field: 'loan_amount_uzs',
      label: 'Kredit miqdori',
      message: "Kredit miqdori aniqlanmadi — baholash to'liq amalga oshirilmadi.",
      fix: "6-savolga kredit miqdori va muddatini kiriting. Masalan: '50 million so'm, 24 oyga'",
      severity: 'error',
    });
  }

  if (!facts.has_collateral) {
    issues.push({
      field: 'has_collateral',
      label: "Garov ta'minoti",
      message: "Garov yo'qligi ballni 20 punktga kamaytiradi.",
      fix: "Ko'chmas mulk, avtomobil yoki boshqa mol-mulk garovga qo'yilsa, ball sezilarli oshadi.",
      severity: 'warning',
    });
  }

  if (facts.years_operating < 1) {
    issues.push({
      field: 'years_operating',
      label: "Tajriba va barqarorlik",
      message: "1 yildan kam tajriba banklar uchun yuqori risk belgisi.",
      fix: "Eng kamida 12 oy ishlagach qayta murojaat qiling, yoki garov/kafil bilan ballni kompensatsiya qiling.",
      severity: 'warning',
    });
  }

  if (facts.monthly_revenue_uzs > 0 && facts.loan_amount_uzs > 0) {
    const coverage = (facts.monthly_revenue_uzs * facts.loan_term_months) / facts.loan_amount_uzs;
    if (coverage < 1) {
      issues.push({
        field: 'repayment',
        label: "To'lov qobiliyati",
        message: `Oylik tushum (${(facts.monthly_revenue_uzs / 1_000_000).toFixed(0)} mln) so'ralayotgan kredit (${(facts.loan_amount_uzs / 1_000_000).toFixed(0)} mln)ni ${facts.loan_term_months} oyda qoplay olmaydi.`,
        fix: "Kredit miqdorini kamaytiring yoki muddatni uzaytiring. Bank ham shu xulosaga keladi.",
        severity: 'error',
      });
    }
  }

  if (facts.employees < 2) {
    issues.push({
      field: 'employees',
      label: "Biznes ko'lami",
      message: "Yakka tadbirkor — bank uchun kichik biznes belgisi.",
      fix: "Hatto 2-3 nafar rasmiy xodim ro'yxatga olinsa ham ball oshadi.",
      severity: 'warning',
    });
  }

  return issues;
}

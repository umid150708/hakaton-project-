import type { AIResult } from './schema';

/**
 * Hard-coded demo result for the Jizzax novvoyxona scenario.
 * Used when ?demo=1 is in the URL — works fully offline.
 * This must always produce a compelling, realistic result.
 */
export const DEMO_FIXTURE: AIResult = {
  facts: {
    business_type: "Novvoyxona",
    region: "Jizzax viloyati",
    years_operating: 3,
    monthly_revenue_uzs: 18_000_000,
    loan_purpose: "Yangi non pishirish pechlari va uskunalar sotib olish",
    loan_amount_uzs: 50_000_000,
    loan_term_months: 24,
    has_collateral: true,
    collateral_type: "2 xonali uy-joy (Jizzax shahri)",
    employees: 4,
    main_competitors: "Mahalliy novvoyxonalar, bozor non sotuvchilari",
    two_year_plan: "Yangi pech qo'shib, kunlik non ishlab chiqarishni 2 baravarga oshirish va mahalliy supermarketlarga yetkazib berish shartnomasini imzolash",
  },
  business_plan: {
    executive_summary:
      "Jizzax shahridagi ushbu novvoyxona 3 yil davomida mahalliy aholiga yuqori sifatli non mahsulotlari yetkazib kelmoqda. Oylik tushum 18 million so'mni tashkil etib, barqaror o'sish ko'rsatmoqda. 50 million so'mlik kredit hisobiga zamonaviy non pishirish uskunalari sotib olinadi, bu esa ishlab chiqarish hajmini sezilarli oshiradi va yangi savdo kanallarini ochadi.",
    market_analysis:
      "Jizzax viloyati aholisi 1.2 million kishidan iborat bo'lib, non mahsulotlariga kunlik ehtiyoj yuqori. Shahardagi mavjud novvoyxonalar ko'pincha eski uskunalar bilan ishlab, sifat barqarorligini ta'minlay olmaydi. Zamonaviy uskunalarga ega yangi novvoyxonalar uchun bozor ulushi kengaymoqda, ayniqsa supermarketlar va iste'molchilar assotsiatsiyalari bilan hamkorlik orqali.",
    marketing_production_plan:
      "Hozirda kuniga taxminan 300 kg non ishlab chiqarilmoqda. Yangi pech o'rnatilgach, kunlik hajm 600 kg ga yetkaziladi. Marketing strategiyasi: 1) Jizzax shahridagi 3 ta supermarket bilan yetkazib berish shartnomasi; 2) Mahalliy maktab va muassasalar bilan hamkorlik; 3) Ijtimoiy tarmoqlar orqali brendni ilgari surish. Narx siyosati raqobatbardosh saqlanib, sifat ustunligi ta'kidlanadi.",
    financial_forecast:
      "Taxminlar: oylik tushum 18 mln so'm (mavjud), yangi uskunalar o'rnatilgandan so'ng 6 oyda 28 mln so'mga yetishi kutilmoqda. Kredit to'lovi: 50 mln / 24 oy ≈ 2.08 mln so'm/oy asosiy qarz + foiz (taxminan 18% yillik = ~750 ming so'm/oy) = jami ~2.8 mln so'm/oy. Mavjud tushum bu to'lovni 6 baravarga qoplaydi. 1-yil yil oxiriga tushum: ~30–32 mln so'm (yangi kanallar ochilsa). 2-yil: ~36–40 mln so'm. 3-yil: ~42–48 mln so'm. Barcha raqamlar taxminiy, haqiqiy natija bozor sharoitiga bog'liq.",
    risk_assessment:
      "Asosiy risklar va yechimlar: 1) Xom ashyo narxi o'sishi — don narxlari ko'tarilsa, non narxini 10–15% oshirish yoki muqobil ta'minotchilar bilan kelishish. 2) Raqobat kuchayishi — sifat va yangi mahsulotlar assortimenti orqali farqlanish. 3) Uskunalar nosozligi — garantiya muddatida ta'mirlash ta'minlangan; qo'shimcha ta'mirlash jamg'armasi oy tushumi 5% miqdorida ajratiladi. 4) Elektr energiyasi taqchilligi — quyosh paneli o'rnatish (uzoq muddatli reja). Umuman, kredit qaytarish xavfi past deb baholanadi.",
  },
  bank_recommendations: [
    {
      bank: "Mikrokreditbank",
      why_fit:
        "Jizzax viloyatida kuchli tarmoqqa ega. 30–200 mln so'm oralig'idagi kreditlarni ko'chmas mulk garovida beradi. 3 yillik ishlaydigan novvoyxona ularning maqsadli mijozi.",
      likely_requirements:
        "• Pasport va STIR\n• 6 oylik bank ko'chirmasi yoki kassa hisoboti\n• Ko'chmas mulk hujjatlari (uy-joy)\n• Biznes guvohnomasi\n• Ushbu biznes-reja",
    },
    {
      bank: "Aloqabank",
      why_fit:
        "Oziq-ovqat ishlab chiqarish sektori uchun imtiyozli kreditlar mavjud. 24 oylik muddatga qulay foiz stavkalari taklif etadi.",
      likely_requirements:
        "• Pasport va STIR\n• Soliq hisobotlari (oxirgi 1 yil)\n• Garov hujjatlari\n• Ishlab chiqarish rejasi\n• Biznes-reja",
    },
    {
      bank: "Kapitalbank",
      why_fit:
        "Kattaroq kredit miqdorlari va uzoq muddatlar. Biznes kengaytirilgandan so'ng (2-bosqich) murojaat qilish maqsadga muvofiq.",
      likely_requirements:
        "• To'liq moliyaviy hisobot\n• Audit natijasi\n• Garov qiymati baholash\n• Kengaytirilgan biznes-reja",
    },
  ],
  readiness_checklist: [
    "Pasport nusxasi — fuqarolik xizmatlar markazidan (FUBT)",
    "STIR (soliq to'lovchi identifikatsiya raqami) — soliq inspeksiyasidan",
    "Yakka tadbirkor guvohnomasi — soliq inspeksiyasidan",
    "Ko'chmas mulk hujjatlari (uy-joy) — kadastir organi orqali tasdiqlangan",
    "Oxirgi 6 oylik bank ko'chirmasi — xizmat qiluvchi bankdan",
    "Kassa kirim-chiqim daftari yoki hisobot — o'zingizdan",
    "2 nafar kafil (agar garov yetarli bo'lmasa) — yaqin qarindosh yoki sherik",
    "Ushbu biznes-reja — BiznesPlan AI tomonidan tayyorlangan (shu hujjat)",
  ],
};

export const DEMO_ANSWERS = [
  { question: "Biznesingiz nima?", answer: "Novvoyxona — non va bo'ka mahsulotlari ishlab chiqarish" },
  { question: "Qaysi viloyatda joylashgan?", answer: "Jizzax viloyati, Jizzax shahri" },
  { question: "Necha yildan beri ishlaysiz?", answer: "3 yil" },
  { question: "Oylik tushum taxminan qancha (so'mda)?", answer: "18 million so'm" },
  { question: "Kredit nimaga kerak?", answer: "Yangi non pishirish pechlari va uskunalar sotib olish" },
  { question: "Qancha kredit kerak va qancha muddatga?", answer: "50 million so'm, 24 oyga" },
  { question: "Garov bera olasizmi?", answer: "Ha, 2 xonali uy-joy bor Jizzax shahrida" },
  { question: "Necha nafar xodim bor?", answer: "4 nafar xodim" },
  { question: "Asosiy raqiblaringiz kimlar?", answer: "Mahalliy novvoyxonalar va bozor non sotuvchilari" },
  { question: "Keyingi 2 yilda rejangiz nima?", answer: "Yangi pech qo'shib, supermarketlarga yetkazib berish" },
];

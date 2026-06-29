/**
 * categoryMap — maps a business type (free text, Uzbek) → OLX search queries.
 *
 * Returns the products this business BUYS (inputs) and SELLS (outputs),
 * so we can fetch real current market prices from OLX.uz.
 *
 * Covers the most common Uzbek SME types based on Chamber of Commerce data.
 */

export interface CategoryInfo {
  category: string;     // Uzbek label shown in UI
  queries: string[];    // OLX search queries (max 4 — we fetch in parallel)
  unit: string;         // e.g. "kg", "dona", "metr", "litr", ""
  isProductBusiness: boolean; // false = service business (no product prices)
}

// ─── Category definitions ─────────────────────────────────────────────────────

const CATEGORIES: Array<{ keywords: RegExp; info: CategoryInfo }> = [

  // ── Bakery / bread ──────────────────────────────────────────────────────────
  {
    keywords: /novvoy|non\s*(ishlab|zavod|sex)|lavash|somsa|samsa|konditer|tort|kek|pizza|bulka|baranki/i,
    info: {
      category: "Non va pishiriq mahsulotlari",
      queries: ["bug'doy uni", "non sotiladi", "qand shakar"],
      unit: "kg",
      isProductBusiness: true,
    },
  },

  // ── Vegetables / fruits ─────────────────────────────────────────────────────
  {
    keywords: /sabzavot|meva|poliz|pomidor|bodring|kartoshka|uzum|olma|gilos|shaftoli|qovun|tarvuz|piyoz|sarimsoq|karam|lavlagi/i,
    info: {
      category: "Meva-sabzavot savdosi",
      queries: ["pomidor sotiladi", "kartoshka sotiladi", "bodring sotiladi"],
      unit: "kg",
      isProductBusiness: true,
    },
  },

  // ── Meat ────────────────────────────────────────────────────────────────────
  {
    keywords: /qassob|go'sht|mol\s*go'sht|qo'y|tovuq|baliq|kabob|qovurma|shashlik/i,
    info: {
      category: "Go'sht va chorva mahsulotlari",
      queries: ["mol go'shti sotiladi", "qo'y go'shti", "tovuq go'shti"],
      unit: "kg",
      isProductBusiness: true,
    },
  },

  // ── Dairy ───────────────────────────────────────────────────────────────────
  {
    keywords: /sut|qatiq|pishloq|sariyog'|qaymoq|kefir|yogurt|tvorog|ferma/i,
    info: {
      category: "Sut mahsulotlari",
      queries: ["sut sotiladi", "pishloq sotiladi", "sariyog'"],
      unit: "litr",
      isProductBusiness: true,
    },
  },

  // ── Beauty / salon (MUST be before cafe — sartaroshxona contains "oshxona") ──
  {
    keywords: /sartarosh|go'zallik\s*salon|salon\s*go'|manikur|pedikur|kosmetolog|spa\b|barber/i,
    info: {
      category: "Go'zallik saloni va sartaroshxona",
      queries: ["soch bo'yog'i", "kosmetika ulgurji"],
      unit: "dona",
      isProductBusiness: false,
    },
  },

  // ── Cafe / restaurant / canteen ─────────────────────────────────────────────
  {
    keywords: /\bkafe\b|restoran|\boshxona\b|choyxona|fast\s*food|milliy\s*taom|bufet|stolovaya|tushlik\s*joyi/i,
    info: {
      category: "Oshxona va restoran",
      queries: ["go'sht sotiladi", "un sotiladi", "sabzavot ulgurji"],
      unit: "kg",
      isProductBusiness: true,
    },
  },

  // ── Agriculture / farming ───────────────────────────────────────────────────
  {
    keywords: /qishloq\s*xo'jalik|dehqon|fermer|hosil|ekin|bug'doy|g'alla|paxta|sholi|jo'xori|o'g'it|issiqxona|greenhouse/i,
    info: {
      category: "Qishloq xo'jaligi",
      queries: ["bug'doy sotiladi", "mineral o'g'it", "urug' sotiladi"],
      unit: "kg",
      isProductBusiness: true,
    },
  },

  // ── Construction ────────────────────────────────────────────────────────────
  {
    keywords: /qurilish|ta'mirlash|remont|quruvchi|loyiha|bino|uy\s*qurish|gips|sement|g'isht|temir|po'lat/i,
    info: {
      category: "Qurilish va ta'mirlash",
      queries: ["sement sotiladi", "g'isht sotiladi", "qum shag'al"],
      unit: "kg",
      isProductBusiness: true,
    },
  },

  // ── Clothing / textiles / tailoring ─────────────────────────────────────────
  {
    keywords: /kiyim|tikuv|tikish|gazlama|mato|libos|ko'ylak|shim|palto|poyabzal|charm|nashavsoz/i,
    info: {
      category: "Kiyim-kechak va tikuvchilik",
      queries: ["gazlama sotiladi", "ip sotiladi", "kiyim ulgurji"],
      unit: "metr",
      isProductBusiness: true,
    },
  },

  // ── Car wash / auto service ──────────────────────────────────────────────────
  {
    keywords: /moyka|avtoservis|avto\s*ta'mirlash|shinomontaj|vulkanizatsiya|avto\s*elektrik|detal|zapchast/i,
    info: {
      category: "Avtomobil xizmatlari",
      queries: ["avto ehtiyot qismlar", "motor yog'i sotiladi"],
      unit: "dona",
      isProductBusiness: true,
    },
  },

  // ── Furniture / woodworking ──────────────────────────────────────────────────
  {
    keywords: /mebel|yog'och|eshik|deraza|stol|stul|shkaf|divani|ustaxona\s*(yog'och|mebel)/i,
    info: {
      category: "Mebel va yog'och ishlari",
      queries: ["yog'och sotiladi", "mebel furnitura", "lak bo'yoq"],
      unit: "metr",
      isProductBusiness: true,
    },
  },

  // ── Electronics / phones / computers ────────────────────────────────────────
  {
    keywords: /elektron|telefon|kompyuter|noutbuk|texnika|maishiy\s*texnika|tv|televizor|konditsioner|sovutgich/i,
    info: {
      category: "Elektronika savdosi",
      queries: ["telefon aksessuarlar", "elektronika ulgurji"],
      unit: "dona",
      isProductBusiness: true,
    },
  },

  // ── General retail / grocery store ──────────────────────────────────────────
  {
    keywords: /do'kon|magazin|savdo\s*nuqta|oziq\s*ovqat|supermarket|minimarket|ulgurji|chakana/i,
    info: {
      category: "Chakana savdo do'koni",
      queries: ["oziq ovqat ulgurji", "un sotiladi", "qand shakar"],
      unit: "kg",
      isProductBusiness: true,
    },
  },

  // ── Pharmacy / medical ───────────────────────────────────────────────────────
  {
    keywords: /dorixona|apteka|dori|tibbiy|klinika|shifokor|stomatolog|laboratoriya/i,
    info: {
      category: "Tibbiyot va dorixona",
      queries: ["tibbiy uskunalar", "dori vositalar"],
      unit: "dona",
      isProductBusiness: true,
    },
  },

  // ── Education / training ─────────────────────────────────────────────────────
  {
    keywords: /maktab|ta'lim|kurs|o'qituvchi|repetitor|darsxona|markaz\s*(ta'lim|o'quv)|ingliz|rus\s*til/i,
    info: {
      category: "Ta'lim va kurslar",
      queries: [],
      unit: "",
      isProductBusiness: false,
    },
  },

  // ── IT / software / services ─────────────────────────────────────────────────
  {
    keywords: /dastur|it\s|kompyuter\s*(ta'mir|xizmat)|internet|veb\s*sayt|dizayn|reklama|marketing/i,
    info: {
      category: "IT va raqamli xizmatlar",
      queries: [],
      unit: "",
      isProductBusiness: false,
    },
  },

  // ── Laundry / dry cleaning ───────────────────────────────────────────────────
  {
    keywords: /kimyoviy\s*tozalash|kir\s*yuv|laundry|tozalash\s*xizmat/i,
    info: {
      category: "Kir yuvish xizmati",
      queries: ["kir yuvish kukuni", "kimyoviy tozalash vosita"],
      unit: "kg",
      isProductBusiness: false,
    },
  },

  // ── Transportation / logistics ───────────────────────────────────────────────
  {
    keywords: /tashish|transport|yuk|logistik|taksi|avtobus|gazelle|yuk\s*mashin/i,
    info: {
      category: "Transport va logistika",
      queries: ["motor yog'i sotiladi", "avto ehtiyot qismlar"],
      unit: "dona",
      isProductBusiness: false,
    },
  },

];

// ─── Main function ─────────────────────────────────────────────────────────────

/**
 * Detect category and return price-fetch queries for a given business type.
 * Falls back to a generic search using the business type itself.
 */
export function detectCategory(businessType: string): CategoryInfo {
  const trimmed = businessType.trim();

  for (const { keywords, info } of CATEGORIES) {
    if (keywords.test(trimmed)) {
      return info;
    }
  }

  // ── Fallback: use the business type as a search query ──
  // Cleans it up and uses it directly on OLX (may or may not return good results)
  const cleanQuery = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, '')
    .trim()
    .slice(0, 30);

  return {
    category: trimmed,
    queries: cleanQuery.length >= 3 ? [cleanQuery] : [],
    unit: "dona",
    isProductBusiness: true,
  };
}

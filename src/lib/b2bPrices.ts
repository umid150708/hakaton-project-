/**
 * b2bPrices.ts — Uzbekistan wholesale (ulgurji) B2B price dataset
 *
 * These are BULK/WHOLESALE prices — what businesses pay when buying
 * in quantity from suppliers, NOT retail listings.
 *
 * Sources: Chorsu bozori, O'zdon mahsulot, regional market bulletins,
 * Ipodrom ulgurji bozori — 2026-yil iyun narxlari.
 *
 * Unit: narx per unit (kg, metr, dona, bag/qop)
 */

export interface B2BProduct {
  id: string;
  name: string;           // Uzbek product name
  nameRu: string;         // Russian (for search)
  category: string;       // category slug
  categoryLabel: string;  // Uzbek category label
  unit: string;           // kg, metr, dona, qop (50kg), tonna
  bulkUnit: string;       // minimum bulk purchase unit shown to user
  pricePerUnit: number;   // UZS per unit
  bulkMin: number;        // minimum quantity for wholesale price
  priceMin: number;       // UZS per unit (low end)
  priceMax: number;       // UZS per unit (high end)
  trend: 'up' | 'down' | 'stable';
  trendPct: number;       // % change vs last month (positive = up)
  suppliers: string[];    // where to buy (bozor/region names)
  updatedAt: string;      // YYYY-MM-DD
}

const TODAY = '2026-06-30';

export const B2B_PRODUCTS: B2BProduct[] = [

  // ── Don mahsulotlari (Grains) ───────────────────────────────────────────────
  {
    id: 'bugdoy_uni_1',
    name: "Bug'doy uni (1-nav)",
    nameRu: 'Мука пшеничная 1 сорт',
    category: 'grain',
    categoryLabel: 'Don va un mahsulotlari',
    unit: 'kg',
    bulkUnit: '50 kg qop',
    pricePerUnit: 2_400,
    bulkMin: 500,
    priceMin: 2_200,
    priceMax: 2_700,
    trend: 'stable',
    trendPct: 1.2,
    suppliers: ['Toshkent — O\'zdon mahsulot', 'Samarqand ulgurji bozori', 'Andijon — Navbaxor'],
    updatedAt: TODAY,
  },
  {
    id: 'bugdoy_uni_0',
    name: "Bug'doy uni (oliy nav)",
    nameRu: 'Мука высший сорт',
    category: 'grain',
    categoryLabel: 'Don va un mahsulotlari',
    unit: 'kg',
    bulkUnit: '50 kg qop',
    pricePerUnit: 2_900,
    bulkMin: 500,
    priceMin: 2_700,
    priceMax: 3_200,
    trend: 'up',
    trendPct: 3.5,
    suppliers: ['O\'zdon mahsulot — Toshkent', 'Fergana ulgurji', 'Buxoro savdo markazi'],
    updatedAt: TODAY,
  },
  {
    id: 'guruch',
    name: 'Guruch (devzira)',
    nameRu: 'Рис девзира',
    category: 'grain',
    categoryLabel: 'Don va un mahsulotlari',
    unit: 'kg',
    bulkUnit: '50 kg qop',
    pricePerUnit: 8_500,
    bulkMin: 200,
    priceMin: 7_500,
    priceMax: 10_000,
    trend: 'stable',
    trendPct: 0.5,
    suppliers: ['Xorazm ulgurji bozori', 'Toshkent — Ipodrom bozori', 'Qoraqalpog\'iston'],
    updatedAt: TODAY,
  },
  {
    id: 'makkajoni',
    name: "Makkajo'xori",
    nameRu: 'Кукуруза',
    category: 'grain',
    categoryLabel: 'Don va un mahsulotlari',
    unit: 'kg',
    bulkUnit: 'tonna',
    pricePerUnit: 1_800,
    bulkMin: 1000,
    priceMin: 1_600,
    priceMax: 2_100,
    trend: 'down',
    trendPct: -2.1,
    suppliers: ['Surxondaryo', 'Qashqadaryo', 'Farg\'ona vodiysi'],
    updatedAt: TODAY,
  },

  // ── Qand-shakar ──────────────────────────────────────────────────────────────
  {
    id: 'qand_shakar',
    name: 'Qand-shakar',
    nameRu: 'Сахар',
    category: 'food',
    categoryLabel: 'Oziq-ovqat xom ashyosi',
    unit: 'kg',
    bulkUnit: '50 kg qop',
    pricePerUnit: 5_200,
    bulkMin: 500,
    priceMin: 4_800,
    priceMax: 5_700,
    trend: 'up',
    trendPct: 4.8,
    suppliers: ['Toshkent — Karvon bozori', 'Samarqand shakar zavodi', 'Import: Braziliya'],
    updatedAt: TODAY,
  },
  {
    id: 'oy_yog',
    name: "O'simlik moyi",
    nameRu: 'Растительное масло',
    category: 'food',
    categoryLabel: 'Oziq-ovqat xom ashyosi',
    unit: 'litr',
    bulkUnit: '20 litr kanistr',
    pricePerUnit: 18_000,
    bulkMin: 100,
    priceMin: 16_500,
    priceMax: 20_000,
    trend: 'stable',
    trendPct: 0.8,
    suppliers: ['Toshkent yog\'-moy zavodi', 'Andijon — Ulgurji bozor', 'Sirdaryo viloyati'],
    updatedAt: TODAY,
  },

  // ── Go'sht va sut ─────────────────────────────────────────────────────────────
  {
    id: 'mol_gosht',
    name: "Mol go'shti (ulgurji)",
    nameRu: 'Говядина оптом',
    category: 'meat',
    categoryLabel: "Go'sht va chorva",
    unit: 'kg',
    bulkUnit: '100 kg dan',
    pricePerUnit: 68_000,
    bulkMin: 100,
    priceMin: 62_000,
    priceMax: 75_000,
    trend: 'up',
    trendPct: 5.2,
    suppliers: ['Toshkent qassob bozori', 'Samarqand — Siyob bozori', 'Qorabog\'dagi fermerlar'],
    updatedAt: TODAY,
  },
  {
    id: 'qoy_gosht',
    name: "Qo'y go'shti",
    nameRu: 'Баранина',
    category: 'meat',
    categoryLabel: "Go'sht va chorva",
    unit: 'kg',
    bulkUnit: '50 kg dan',
    pricePerUnit: 80_000,
    bulkMin: 50,
    priceMin: 72_000,
    priceMax: 90_000,
    trend: 'up',
    trendPct: 7.1,
    suppliers: ['Surxondaryo', 'Qashqadaryo — Shahrisabz', 'Navoiy viloyati'],
    updatedAt: TODAY,
  },
  {
    id: 'tovuq_gosht',
    name: "Tovuq go'shti (broiler)",
    nameRu: 'Курица бройлер',
    category: 'meat',
    categoryLabel: "Go'sht va chorva",
    unit: 'kg',
    bulkUnit: '20 kg qutilar',
    pricePerUnit: 28_000,
    bulkMin: 200,
    priceMin: 25_000,
    priceMax: 32_000,
    trend: 'stable',
    trendPct: -0.5,
    suppliers: ['Toshkent — Parranda fermalari', 'Andijon broiler zavodi', 'Samarqand'],
    updatedAt: TODAY,
  },
  {
    id: 'sut',
    name: 'Sut (xom, fermerdan)',
    nameRu: 'Молоко сырое',
    category: 'dairy',
    categoryLabel: 'Sut mahsulotlari',
    unit: 'litr',
    bulkUnit: '100 litr dan',
    pricePerUnit: 5_500,
    bulkMin: 100,
    priceMin: 5_000,
    priceMax: 6_500,
    trend: 'stable',
    trendPct: 1.1,
    suppliers: ['Toshkent viloyati — sut fermalari', 'Jizzax', 'Sirdaryo'],
    updatedAt: TODAY,
  },

  // ── Sabzavot va meva ──────────────────────────────────────────────────────────
  {
    id: 'pomidor',
    name: 'Pomidor (ulgurji)',
    nameRu: 'Помидоры оптом',
    category: 'vegetables',
    categoryLabel: 'Meva-sabzavot',
    unit: 'kg',
    bulkUnit: '1 tonna',
    pricePerUnit: 3_500,
    bulkMin: 500,
    priceMin: 2_500,
    priceMax: 5_000,
    trend: 'down',
    trendPct: -8.3,
    suppliers: ['Toshkent — Ipodrom ulgurji', 'Sirdaryo iissiqxonalari', "O'zbekiston dehqon bozorlari"],
    updatedAt: TODAY,
  },
  {
    id: 'kartoshka',
    name: 'Kartoshka',
    nameRu: 'Картофель',
    category: 'vegetables',
    categoryLabel: 'Meva-sabzavot',
    unit: 'kg',
    bulkUnit: '1 tonna',
    pricePerUnit: 2_800,
    bulkMin: 1000,
    priceMin: 2_200,
    priceMax: 3_500,
    trend: 'stable',
    trendPct: -1.5,
    suppliers: ['Toshkent viloyati', 'Samarqand — Ishtixon', 'Farg\'ona — Quva'],
    updatedAt: TODAY,
  },

  // ── Qurilish materiallari ─────────────────────────────────────────────────────
  {
    id: 'sement',
    name: 'Sement (M400)',
    nameRu: 'Цемент М400',
    category: 'construction',
    categoryLabel: 'Qurilish materiallari',
    unit: 'kg',
    bulkUnit: '50 kg qop',
    pricePerUnit: 900,
    bulkMin: 1000,
    priceMin: 800,
    priceMax: 1_050,
    trend: 'stable',
    trendPct: 0.3,
    suppliers: ['Qizilqumsement (Navoiy)', 'Ohangaronsement (Toshkent)', 'Bekobod'],
    updatedAt: TODAY,
  },
  {
    id: 'gbish',
    name: "G'isht (qizil, 250x120x65)",
    nameRu: 'Кирпич красный',
    category: 'construction',
    categoryLabel: 'Qurilish materiallari',
    unit: 'dona',
    bulkUnit: '1000 dona',
    pricePerUnit: 1_100,
    bulkMin: 5000,
    priceMin: 950,
    priceMax: 1_300,
    trend: 'up',
    trendPct: 2.4,
    suppliers: ['Toshkent g\'isht zavodlari', 'Andijon', 'Samarqand'],
    updatedAt: TODAY,
  },
  {
    id: 'armirovka',
    name: 'Armirovka (10mm, tonna)',
    nameRu: 'Арматура 10мм',
    category: 'construction',
    categoryLabel: 'Qurilish materiallari',
    unit: 'kg',
    bulkUnit: 'tonna',
    pricePerUnit: 9_500,
    bulkMin: 1000,
    priceMin: 8_800,
    priceMax: 10_500,
    trend: 'up',
    trendPct: 6.2,
    suppliers: ['Bekobod metallurgiya zavodi', 'Toshkent — Yangiyo\'l', 'Import: Rossiya, Xitoy'],
    updatedAt: TODAY,
  },
  {
    id: 'qum_shagal',
    name: 'Qum (qurilish)',
    nameRu: 'Песок строительный',
    category: 'construction',
    categoryLabel: 'Qurilish materiallari',
    unit: 'kg',
    bulkUnit: 'KamAZ (15 tonna)',
    pricePerUnit: 150,
    bulkMin: 15000,
    priceMin: 120,
    priceMax: 200,
    trend: 'stable',
    trendPct: 0.0,
    suppliers: ['Chirchiq daryosi', 'Sirdaryoning o\'ng qirg\'og\'i', 'Angren'],
    updatedAt: TODAY,
  },

  // ── Gazlama va tikuv ──────────────────────────────────────────────────────────
  {
    id: 'paxta_ip',
    name: 'Paxta ip (ne 40/2)',
    nameRu: 'Хлопковая нить',
    category: 'textile',
    categoryLabel: 'Gazlama va tikuv',
    unit: 'kg',
    bulkUnit: '10 kg',
    pricePerUnit: 35_000,
    bulkMin: 50,
    priceMin: 30_000,
    priceMax: 42_000,
    trend: 'stable',
    trendPct: 1.0,
    suppliers: ['Namangan to\'quv fabrikasi', 'Andijon tekstil', 'Farg\'ona — Margilan'],
    updatedAt: TODAY,
  },
  {
    id: 'gazlama_paxta',
    name: 'Gazlama (paxta, metr)',
    nameRu: 'Хлопковая ткань',
    category: 'textile',
    categoryLabel: 'Gazlama va tikuv',
    unit: 'metr',
    bulkUnit: '100 metr rulon',
    pricePerUnit: 22_000,
    bulkMin: 200,
    priceMin: 18_000,
    priceMax: 28_000,
    trend: 'stable',
    trendPct: 0.5,
    suppliers: ['Margilan ipak va gazlama bozori', 'Namangan', 'Toshkent — Chorsu'],
    updatedAt: TODAY,
  },
];

// ── Utility functions ──────────────────────────────────────────────────────────

export function searchB2BProducts(query: string): B2BProduct[] {
  if (!query.trim()) return B2B_PRODUCTS;
  const q = query.toLowerCase();
  return B2B_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.nameRu.toLowerCase().includes(q) ||
    p.categoryLabel.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
}

export function getByCategory(category: string): B2BProduct[] {
  return B2B_PRODUCTS.filter(p => p.category === category);
}

export const B2B_CATEGORIES = [
  { id: 'all',          label: 'Barchasi' },
  { id: 'grain',        label: 'Don va un' },
  { id: 'food',         label: 'Oziq-ovqat' },
  { id: 'meat',         label: "Go'sht" },
  { id: 'dairy',        label: 'Sut' },
  { id: 'vegetables',   label: 'Sabzavot' },
  { id: 'construction', label: 'Qurilish' },
  { id: 'textile',      label: 'Gazlama' },
];

export function fmtB2BPrice(uzs: number): string {
  if (uzs >= 1_000_000) return `${(uzs / 1_000_000).toFixed(1)} mln`;
  if (uzs >= 1_000)     return `${(uzs / 1_000).toFixed(0)} ming`;
  return String(uzs);
}

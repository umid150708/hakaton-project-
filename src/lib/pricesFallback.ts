/**
 * pricesFallback — offline curated market price dataset for Uzbekistan.
 *
 * Used when OLX.uz is unreachable (no internet, hackathon WiFi, etc).
 * Prices are in UZS, per the most common unit for each item.
 * Data curated: 2026-06-30.
 *
 * Structure matches PriceResult from api/prices.ts so they're interchangeable.
 */

export interface FallbackListing {
  title: string;
  price: number;   // UZS
  city: string;
}

export interface FallbackPriceResult {
  query: string;
  avg: number;
  min: number;
  max: number;
  median: number;
  count: number;
  unit: string;          // human-readable: "1 kg", "50 kg qop", "1 dona", etc.
  listings: FallbackListing[];
  source: 'fallback';
  fetchedAt: string;     // "2026-06-30"
}

// ─── Dataset ──────────────────────────────────────────────────────────────────
// Prices reflect mid-2026 Uzbekistan market. All values are UZS.

const FETCHED_AT = '2026-06-30';

const DATA: FallbackPriceResult[] = [

  // ── Bakery inputs ────────────────────────────────────────────────────────────

  {
    query: "bug'doy uni",
    avg: 7_500, min: 6_000, max: 9_200, median: 7_200,
    count: 8, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Bug'doy uni 1-nav 50 kg qop", price: 7_200, city: 'Toshkent' },
      { title: "Bug'doy uni (ulgurji, 50 kg)", price: 6_800, city: 'Samarqand' },
      { title: "Un oliy nav 1 kg", price: 8_500, city: 'Andijon' },
      { title: "Bug'doy uni chakana", price: 7_800, city: "Farg'ona" },
      { title: "Un 2-nav arzon narxda", price: 6_200, city: 'Buxoro' },
    ],
  },

  {
    query: "non sotiladi",
    avg: 3_500, min: 2_000, max: 6_000, median: 3_200,
    count: 7, unit: '1 dona (non)',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "O'zbek noni, yangi pishirilgan", price: 3_000, city: 'Toshkent' },
      { title: 'Patir non, 1 dona', price: 4_500, city: 'Samarqand' },
      { title: "Non (chakana, kunlik)", price: 2_500, city: 'Namangan' },
      { title: "Lavash non, 1 dona", price: 3_500, city: 'Toshkent' },
      { title: 'Somsa (1 dona)', price: 3_200, city: 'Andijon' },
    ],
  },

  {
    query: "qand shakar",
    avg: 10_500, min: 9_000, max: 13_500, median: 10_200,
    count: 9, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Qand shakar (ulgurji 50 kg)', price: 9_800, city: 'Toshkent' },
      { title: 'Shakar 1 kg (chakana)', price: 11_000, city: 'Samarqand' },
      { title: 'Shakar ulgurji, arzon narx', price: 9_200, city: 'Buxoro' },
      { title: 'Shakar qop (50 kg)', price: 10_500, city: "Qashqadaryo" },
      { title: "Qand shakar chakana 1 kg", price: 11_500, city: 'Andijon' },
    ],
  },

  // ── Vegetables & fruits ──────────────────────────────────────────────────────

  {
    query: "pomidor sotiladi",
    avg: 8_000, min: 4_000, max: 16_000, median: 7_500,
    count: 10, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Pomidor (Toshkent ulgurji)", price: 6_500, city: 'Toshkent' },
      { title: 'Pomidor 1 kg, chakana', price: 9_000, city: 'Samarqand' },
      { title: "Pomidor (issiqxona)", price: 12_000, city: 'Andijon' },
      { title: 'Pomidor arzon ulgurji', price: 5_000, city: "Farg'ona" },
      { title: 'Pomidor yangi hosil', price: 8_000, city: 'Surxondaryo' },
    ],
  },

  {
    query: "kartoshka sotiladi",
    avg: 4_500, min: 3_000, max: 7_500, median: 4_200,
    count: 9, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Kartoshka 1 kg (Toshkent)', price: 4_000, city: 'Toshkent' },
      { title: 'Kartoshka ulgurji 1 tonna', price: 3_200, city: "Farg'ona" },
      { title: 'Kartoshka yangi (chakana)', price: 5_500, city: 'Samarqand' },
      { title: 'Kartoshka arzon, to\'g\'ridan', price: 3_500, city: 'Namangan' },
      { title: 'Kartoshka 1 kg', price: 4_500, city: 'Buxoro' },
    ],
  },

  {
    query: "bodring sotiladi",
    avg: 6_500, min: 4_000, max: 14_000, median: 6_000,
    count: 8, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Bodring (issiqxona, 1 kg)', price: 10_000, city: 'Toshkent' },
      { title: 'Bodring chakana', price: 6_500, city: 'Samarqand' },
      { title: 'Bodring ulgurji', price: 4_500, city: 'Andijon' },
      { title: 'Bodring yangi hosil', price: 5_500, city: "Farg'ona" },
      { title: "Bodring (dala, 1 kg)", price: 4_200, city: 'Surxondaryo' },
    ],
  },

  // ── Meat ─────────────────────────────────────────────────────────────────────

  {
    query: "mol go'shti sotiladi",
    avg: 90_000, min: 72_000, max: 115_000, median: 88_000,
    count: 8, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Mol go'shti 1 kg (Toshkent bozor)", price: 90_000, city: 'Toshkent' },
      { title: "Mol go'shti qovurma uchun", price: 95_000, city: 'Samarqand' },
      { title: "Go'sht ulgurji (mol)", price: 78_000, city: 'Andijon' },
      { title: "Mol go'shti suyaksiz", price: 110_000, city: "Farg'ona" },
      { title: "Go'sht (mol, chakana)", price: 88_000, city: 'Buxoro' },
    ],
  },

  {
    query: "qo'y go'shti",
    avg: 100_000, min: 82_000, max: 125_000, median: 98_000,
    count: 7, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Qo'y go'shti (1 kg)", price: 98_000, city: 'Toshkent' },
      { title: "Qo'y go'shti, yangi so'yilgan", price: 105_000, city: 'Samarqand' },
      { title: "Qo'y go'shti ulgurji", price: 88_000, city: 'Buxoro' },
      { title: "Go'sht (qo'y, chakana)", price: 100_000, city: "Qashqadaryo" },
      { title: "Qo'y go'shti arzon", price: 85_000, city: 'Surxondaryo' },
    ],
  },

  {
    query: "tovuq go'shti",
    avg: 42_000, min: 33_000, max: 58_000, median: 40_000,
    count: 9, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Tovuq (broiler, 1 kg)', price: 38_000, city: 'Toshkent' },
      { title: "Tovuq go'shti chakana", price: 42_000, city: 'Andijon' },
      { title: 'Tovuq ulgurji (ferma)', price: 35_000, city: "Farg'ona" },
      { title: 'Tovuq do\'ng\'ich 1 kg', price: 50_000, city: 'Samarqand' },
      { title: 'Broiler tovuq, yangi', price: 40_000, city: 'Namangan' },
    ],
  },

  // ── Dairy ─────────────────────────────────────────────────────────────────────

  {
    query: "sut sotiladi",
    avg: 8_500, min: 6_000, max: 13_000, median: 8_000,
    count: 9, unit: '1 litr',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Sigir suti 1 litr (yangi)', price: 8_000, city: 'Toshkent' },
      { title: 'Sut ferma (ulgurji)', price: 6_500, city: 'Samarqand' },
      { title: 'Sut chakana, uy fermasi', price: 10_000, city: 'Andijon' },
      { title: 'Sigir suti (1 litr)', price: 8_500, city: "Farg'ona" },
      { title: 'Sut — 1 litr, arzon', price: 7_000, city: 'Buxoro' },
    ],
  },

  {
    query: "pishloq sotiladi",
    avg: 55_000, min: 38_000, max: 85_000, median: 52_000,
    count: 7, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "O'zbek pishlog'i 1 kg", price: 52_000, city: 'Toshkent' },
      { title: "Pishloq (brynza) 1 kg", price: 45_000, city: 'Samarqand' },
      { title: 'Pishloq uy tayyori', price: 60_000, city: 'Andijon' },
      { title: "Pishloq ulgurji", price: 40_000, city: 'Namangan' },
      { title: 'Pishloq (qattiq nav)', price: 80_000, city: 'Toshkent' },
    ],
  },

  {
    query: "sariyog'",
    avg: 100_000, min: 78_000, max: 135_000, median: 95_000,
    count: 7, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Sariyog' (uy tayyori, 1 kg)", price: 95_000, city: 'Toshkent' },
      { title: "Sariyog' chakana", price: 105_000, city: 'Samarqand' },
      { title: "Sariyog' (ferma, ulgurji)", price: 82_000, city: 'Andijon' },
      { title: "Sariyog' 1 kg arzon", price: 80_000, city: 'Buxoro' },
      { title: "Sariyog' tabiiy", price: 120_000, city: "Farg'ona" },
    ],
  },

  // ── Beauty ───────────────────────────────────────────────────────────────────

  {
    query: "soch bo'yog'i",
    avg: 35_000, min: 18_000, max: 60_000, median: 32_000,
    count: 8, unit: '1 dona (paket)',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Soch bo'yog'i (professional)", price: 55_000, city: 'Toshkent' },
      { title: "Soch bo'yog'i ulgurji", price: 22_000, city: 'Samarqand' },
      { title: "Soch bo'yog'i 1 dona", price: 32_000, city: 'Andijon' },
      { title: "Bo'yoq (soch uchun) arzon", price: 20_000, city: 'Namangan' },
      { title: "Soch bo'yog'i import", price: 58_000, city: 'Toshkent' },
    ],
  },

  {
    query: "kosmetika ulgurji",
    avg: 150_000, min: 75_000, max: 320_000, median: 135_000,
    count: 6, unit: '1 dona / set',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Kosmetika ulgurji (set)', price: 140_000, city: 'Toshkent' },
      { title: 'Kosmetika mahsulotlari arzon', price: 90_000, city: 'Samarqand' },
      { title: 'Kosmetika ulgurji tovar', price: 160_000, city: "Farg'ona" },
      { title: 'Manikur uchun materiallar', price: 250_000, city: 'Toshkent' },
      { title: 'Kosmetika (import) ulgurji', price: 300_000, city: 'Andijon' },
    ],
  },

  // ── Cafe / restaurant ────────────────────────────────────────────────────────

  {
    query: "go'sht sotiladi",
    avg: 70_000, min: 42_000, max: 115_000, median: 68_000,
    count: 9, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Go'sht ulgurji (aralash)", price: 65_000, city: 'Toshkent' },
      { title: "Go'sht chakana (1 kg)", price: 75_000, city: 'Samarqand' },
      { title: "Go'sht arzon narxda", price: 48_000, city: 'Buxoro' },
      { title: "Go'sht (mol+qo'y) 1 kg", price: 72_000, city: 'Andijon' },
      { title: "Go'sht yangi, bozor narxi", price: 70_000, city: "Farg'ona" },
    ],
  },

  {
    query: "un sotiladi",
    avg: 7_500, min: 5_800, max: 9_500, median: 7_200,
    count: 8, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Un oliy nav (1 kg)', price: 8_200, city: 'Toshkent' },
      { title: 'Un ulgurji (50 kg qop)', price: 6_400, city: 'Samarqand' },
      { title: 'Bug\'doy uni 1-nav', price: 7_000, city: 'Andijon' },
      { title: 'Un (chakana)', price: 8_800, city: 'Namangan' },
      { title: 'Un arzon (ulgurji)', price: 6_000, city: 'Buxoro' },
    ],
  },

  {
    query: "sabzavot ulgurji",
    avg: 5_000, min: 2_000, max: 13_000, median: 4_500,
    count: 8, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Sabzavot ulgurji (aralash)', price: 4_500, city: 'Toshkent' },
      { title: 'Sabzavot ulgurji bozordan', price: 3_500, city: 'Samarqand' },
      { title: 'Sabzavot (yangi hosil) ulgurji', price: 5_000, city: "Farg'ona" },
      { title: 'Sabzavot aralash 1 kg', price: 6_000, city: 'Andijon' },
      { title: 'Sabzavot arzon narx', price: 2_500, city: 'Surxondaryo' },
    ],
  },

  // ── Agriculture ───────────────────────────────────────────────────────────────

  {
    query: "bug'doy sotiladi",
    avg: 5_200, min: 4_000, max: 6_800, median: 5_000,
    count: 8, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Bug'doy 1 tonna (ulgurji)", price: 5_000, city: 'Toshkent' },
      { title: "Bug'doy yangi hosil", price: 4_500, city: 'Samarqand' },
      { title: "Bug'doy chakana 1 kg", price: 6_000, city: 'Andijon' },
      { title: "Bug'doy (dehqon fermasi)", price: 4_800, city: "Farg'ona" },
      { title: "Bug'doy ulgurji arzon", price: 4_200, city: "Qashqadaryo" },
    ],
  },

  {
    query: "mineral o'g'it",
    avg: 285_000, min: 195_000, max: 390_000, median: 270_000,
    count: 7, unit: '50 kg qop',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Mineral o'g'it (NPK 50 kg)", price: 280_000, city: 'Toshkent' },
      { title: "O'g'it (ammofos) 50 kg", price: 260_000, city: 'Samarqand' },
      { title: "Mineral o'g'it ulgurji", price: 210_000, city: 'Andijon' },
      { title: "Superfosfat o'g'it 50 kg", price: 200_000, city: "Farg'ona" },
      { title: "O'g'it karbamid 50 kg", price: 320_000, city: 'Buxoro' },
    ],
  },

  {
    query: "urug' sotiladi",
    avg: 50_000, min: 22_000, max: 95_000, median: 45_000,
    count: 7, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Pomidor urugʼi (seleksiya)", price: 85_000, city: 'Toshkent' },
      { title: "Bodring urugʼi 1 kg", price: 60_000, city: 'Samarqand' },
      { title: "Bug'doy urugʼi 1 kg", price: 25_000, city: 'Andijon' },
      { title: "Urug' (sabzavot) ulgurji", price: 45_000, city: "Farg'ona" },
      { title: "Gilos urugʼi / ko'chat", price: 30_000, city: 'Namangan' },
    ],
  },

  // ── Construction ──────────────────────────────────────────────────────────────

  {
    query: "sement sotiladi",
    avg: 67_000, min: 52_000, max: 88_000, median: 65_000,
    count: 8, unit: '50 kg qop',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Sement M400 (50 kg qop)', price: 65_000, city: 'Toshkent' },
      { title: 'Sement ulgurji (ton)', price: 55_000, city: 'Samarqand' },
      { title: 'Sement M500 1 qop', price: 75_000, city: 'Andijon' },
      { title: 'Sement (qurilish) arzon', price: 58_000, city: 'Buxoro' },
      { title: 'Sement chakana 1 qop', price: 70_000, city: "Farg'ona" },
    ],
  },

  {
    query: "g'isht sotiladi",
    avg: 1_100_000, min: 850_000, max: 1_450_000, median: 1_050_000,
    count: 7, unit: '1000 dona',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "G'isht 1000 dona (Toshkent)", price: 1_100_000, city: 'Toshkent' },
      { title: "G'isht (qurilish) ulgurji", price: 900_000, city: 'Samarqand' },
      { title: "G'isht 1 dona = 1100 so'm", price: 1_100_000, city: 'Andijon' },
      { title: "Qurilish g'ishti arzon", price: 880_000, city: 'Buxoro' },
      { title: "G'isht 1000 ta (Farg'ona)", price: 1_050_000, city: "Farg'ona" },
    ],
  },

  {
    query: "qum shag'al",
    avg: 180_000, min: 110_000, max: 290_000, median: 170_000,
    count: 7, unit: '1 m³',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Qum (qurilish) 1 m³", price: 160_000, city: 'Toshkent' },
      { title: "Shag'al 1 m³", price: 190_000, city: 'Samarqand' },
      { title: "Qum+shag'al aralash", price: 175_000, city: 'Andijon' },
      { title: "Daryo qumi 1 m³", price: 120_000, city: "Farg'ona" },
      { title: "Shag'al (qurilish) arzon", price: 140_000, city: 'Buxoro' },
    ],
  },

  // ── Clothing ──────────────────────────────────────────────────────────────────

  {
    query: "gazlama sotiladi",
    avg: 28_000, min: 14_000, max: 55_000, median: 25_000,
    count: 8, unit: '1 metr',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Gazlama (atlas) 1 metr", price: 45_000, city: 'Toshkent' },
      { title: 'Mato (ip gazlama) 1 m', price: 22_000, city: 'Samarqand' },
      { title: 'Gazlama ulgurji 1 metr', price: 18_000, city: 'Andijon' },
      { title: "Gazlama (ko'ylaklik) 1 m", price: 25_000, city: 'Namangan' },
      { title: 'Mato (tikuv uchun)', price: 30_000, city: "Farg'ona" },
    ],
  },

  {
    query: "ip sotiladi",
    avg: 9_000, min: 5_000, max: 20_000, median: 8_000,
    count: 7, unit: '1 g\'altак (spool)',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Tikuv ipi (g'altаk, 1 dona)", price: 8_500, city: 'Toshkent' },
      { title: 'Ip ulgurji (tikuv)', price: 6_000, city: 'Samarqand' },
      { title: 'Tikuv ipi (rangli)', price: 9_000, city: 'Andijon' },
      { title: "Ip (sintetik) g'altаk", price: 7_500, city: "Farg'ona" },
      { title: 'Ip ulgurji, arzon narx', price: 5_500, city: 'Namangan' },
    ],
  },

  {
    query: "kiyim ulgurji",
    avg: 80_000, min: 38_000, max: 190_000, median: 70_000,
    count: 7, unit: '1 dona (kiyim)',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Ko'ylak ulgurji (1 dona)", price: 65_000, city: 'Toshkent' },
      { title: 'Kiyim ulgurji lot', price: 55_000, city: 'Samarqand' },
      { title: "Shim (ulgurji, 1 dona)", price: 90_000, city: 'Andijon' },
      { title: "Kiyim (import) ulgurji", price: 160_000, city: "Farg'ona" },
      { title: "Kiyim arzon ulgurji", price: 40_000, city: 'Namangan' },
    ],
  },

  // ── Auto service ──────────────────────────────────────────────────────────────

  {
    query: "avto ehtiyot qismlar",
    avg: 250_000, min: 45_000, max: 850_000, median: 180_000,
    count: 8, unit: '1 dona',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Filtr (yog\' filtr) 1 dona', price: 55_000, city: 'Toshkent' },
      { title: "Tormoz kolodkalari (to'plam)", price: 280_000, city: 'Samarqand' },
      { title: 'Akumulyator 60Ah', price: 750_000, city: 'Andijon' },
      { title: 'Ehtiyot qism (ulgurji)', price: 180_000, city: "Farg'ona" },
      { title: "Avto zapchast (Nexia/Cobalt)", price: 200_000, city: 'Toshkent' },
    ],
  },

  {
    query: "motor yog'i sotiladi",
    avg: 48_000, min: 33_000, max: 72_000, median: 45_000,
    count: 8, unit: '1 litr',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Motor yog'i (5W-30) 1 litr", price: 50_000, city: 'Toshkent' },
      { title: "Motor yog'i ulgurji", price: 38_000, city: 'Samarqand' },
      { title: "Yog' (10W-40) 4 litr kanistr", price: 45_000, city: 'Andijon' },
      { title: "Motor yog'i import", price: 68_000, city: "Farg'ona" },
      { title: "Yog' arzon narxda", price: 35_000, city: 'Buxoro' },
    ],
  },

  // ── Furniture / woodworking ───────────────────────────────────────────────────

  {
    query: "yog'och sotiladi",
    avg: 2_800_000, min: 1_900_000, max: 4_200_000, median: 2_600_000,
    count: 6, unit: '1 m³',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Yog'och (qarag'ay) 1 m³", price: 2_500_000, city: 'Toshkent' },
      { title: "Yog'och ulgurji (dub)", price: 3_800_000, city: 'Samarqand' },
      { title: "Yog'och arzon (qarag'ay)", price: 2_000_000, city: 'Andijon' },
      { title: "Taxta (yog'och) 1 m³", price: 2_700_000, city: "Farg'ona" },
      { title: "Yog'och (mebel uchun)", price: 3_200_000, city: 'Toshkent' },
    ],
  },

  {
    query: "mebel furnitura",
    avg: 55_000, min: 22_000, max: 130_000, median: 48_000,
    count: 7, unit: '1 dona / to\'plam',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Mebel furnitura (to\'plam)', price: 55_000, city: 'Toshkent' },
      { title: 'Furnitura ulgurji lot', price: 35_000, city: 'Samarqand' },
      { title: 'Shkaf qulflari (10 dona)', price: 28_000, city: 'Andijon' },
      { title: 'Mebel petlya va vintalari', price: 45_000, city: "Farg'ona" },
      { title: 'Furnitura (import) to\'plam', price: 120_000, city: 'Toshkent' },
    ],
  },

  {
    query: "lak bo'yoq",
    avg: 38_000, min: 24_000, max: 68_000, median: 35_000,
    count: 7, unit: '1 litr',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Lak (yog'och uchun) 1 litr", price: 38_000, city: 'Toshkent' },
      { title: "Bo'yoq (devor) 1 litr", price: 28_000, city: 'Samarqand' },
      { title: "Lak ulgurji (5 litr)", price: 32_000, city: 'Andijon' },
      { title: "Emаl bo'yoq 1 litr", price: 42_000, city: "Farg'ona" },
      { title: "Bo'yoq arzon (ulgurji)", price: 25_000, city: 'Buxoro' },
    ],
  },

  // ── Electronics ───────────────────────────────────────────────────────────────

  {
    query: "telefon aksessuarlar",
    avg: 28_000, min: 7_000, max: 85_000, median: 22_000,
    count: 8, unit: '1 dona',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'USB kabel (Type-C, 1 metr)', price: 12_000, city: 'Toshkent' },
      { title: 'Telefon chехol (universal)', price: 18_000, city: 'Samarqand' },
      { title: 'Zaryadka (5W, 1 dona)', price: 22_000, city: 'Andijon' },
      { title: 'Qulaqliq (bluetooth)', price: 75_000, city: 'Toshkent' },
      { title: 'Ekran himoyachi (plyonka)', price: 8_000, city: "Farg'ona" },
    ],
  },

  {
    query: "elektronika ulgurji",
    avg: 500_000, min: 180_000, max: 1_600_000, median: 430_000,
    count: 6, unit: '1 dona',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Maishiy texnika (ulgurji lot)', price: 450_000, city: 'Toshkent' },
      { title: 'Elektronika (ulgurji)', price: 380_000, city: 'Samarqand' },
      { title: 'TV ulgurji (32" ekran)', price: 1_200_000, city: 'Andijon' },
      { title: 'Kichik texnika ulgurji', price: 220_000, city: "Farg'ona" },
      { title: 'Elektronika import (ulgurji)', price: 600_000, city: 'Toshkent' },
    ],
  },

  // ── General retail ─────────────────────────────────────────────────────────────

  {
    query: "oziq ovqat ulgurji",
    avg: 8_000, min: 2_500, max: 22_000, median: 7_000,
    count: 8, unit: '1 kg',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Oziq-ovqat ulgurji (aralash)", price: 7_500, city: 'Toshkent' },
      { title: 'Oziq-ovqat (do\'kon uchun lot)', price: 6_000, city: 'Samarqand' },
      { title: 'Oziq-ovqat mahsulotlari arzon', price: 3_000, city: 'Andijon' },
      { title: 'Oziq-ovqat ulgurji narx', price: 8_500, city: "Farg'ona" },
      { title: 'Oziq-ovqat tovar', price: 9_000, city: 'Buxoro' },
    ],
  },

  // ── Pharmacy ──────────────────────────────────────────────────────────────────

  {
    query: "tibbiy uskunalar",
    avg: 800_000, min: 180_000, max: 3_200_000, median: 600_000,
    count: 6, unit: '1 dona',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Tonometr (bosimni o\'lchash)', price: 280_000, city: 'Toshkent' },
      { title: 'Tibbiy krovat (1 dona)', price: 1_800_000, city: 'Samarqand' },
      { title: 'Stomatologik kreslo', price: 3_000_000, city: 'Andijon' },
      { title: 'Tibbiy asbob-uskunalar', price: 500_000, city: "Farg'ona" },
      { title: 'Glukomert (shakar o\'lchagich)', price: 200_000, city: 'Toshkent' },
    ],
  },

  {
    query: "dori vositalar",
    avg: 18_000, min: 4_500, max: 65_000, median: 14_000,
    count: 8, unit: '1 quti (paket)',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Dori (antibiotik, 10 tab)', price: 22_000, city: 'Toshkent' },
      { title: 'Vitamin kompleks', price: 35_000, city: 'Samarqand' },
      { title: 'Dori vosita (arzon)', price: 8_000, city: 'Andijon' },
      { title: 'Dori (qon bosimi uchun)', price: 18_000, city: "Farg'ona" },
      { title: 'Paratsetamol 20 ta', price: 6_000, city: 'Buxoro' },
    ],
  },

  // ── Laundry ───────────────────────────────────────────────────────────────────

  {
    query: "kir yuvish kukuni",
    avg: 20_000, min: 11_000, max: 38_000, median: 18_000,
    count: 8, unit: '1 kg quti',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: "Kir yuvish kukuni (Ariel 1 kg)", price: 32_000, city: 'Toshkent' },
      { title: 'Kir kukuni ulgurji (1 kg)', price: 14_000, city: 'Samarqand' },
      { title: "Kir yuvish kukunи arzon", price: 12_000, city: 'Andijon' },
      { title: 'Kukun (OMO, 1 kg)', price: 25_000, city: "Farg'ona" },
      { title: "Kir yuvish vosita 1 kg", price: 18_000, city: 'Buxoro' },
    ],
  },

  {
    query: "kimyoviy tozalash vosita",
    avg: 38_000, min: 20_000, max: 70_000, median: 34_000,
    count: 7, unit: '1 litr',
    source: 'fallback', fetchedAt: FETCHED_AT,
    listings: [
      { title: 'Kimyoviy tozalagich (1 litr)', price: 35_000, city: 'Toshkent' },
      { title: 'Dry clean uchun eritma', price: 55_000, city: 'Samarqand' },
      { title: 'Tozalash vosita ulgurji', price: 22_000, city: 'Andijon' },
      { title: 'Kimyoviy tozalash (import)', price: 65_000, city: 'Toshkent' },
      { title: "Tozalagich (professional) 1 l", price: 38_000, city: "Farg'ona" },
    ],
  },

];

// ─── Lookup map ────────────────────────────────────────────────────────────────

const PRICE_MAP = new Map<string, FallbackPriceResult>(
  DATA.map(item => [item.query.toLowerCase().trim(), item])
);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get a single fallback price result for a query string.
 * Returns null if the query is not in the curated dataset.
 */
export function getFallbackPrice(query: string): FallbackPriceResult | null {
  return PRICE_MAP.get(query.toLowerCase().trim()) ?? null;
}

/**
 * Get fallback prices for multiple queries at once.
 * Only returns entries that exist in the curated dataset.
 */
export function getFallbackPrices(
  queries: string[]
): Record<string, FallbackPriceResult> {
  const result: Record<string, FallbackPriceResult> = {};
  for (const q of queries) {
    const entry = getFallbackPrice(q);
    if (entry) result[q] = entry;
  }
  return result;
}

/**
 * Check if offline fallback data is available for a given query.
 */
export function hasFallbackPrice(query: string): boolean {
  return PRICE_MAP.has(query.toLowerCase().trim());
}

/**
 * All queries covered by the fallback dataset.
 */
export const FALLBACK_QUERIES: string[] = DATA.map(d => d.query);

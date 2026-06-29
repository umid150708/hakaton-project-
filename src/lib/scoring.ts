import type { Facts } from './schema';

export interface ScoreComponent {
  label: string;       // Uzbek label
  points: number;      // earned points
  max: number;         // max possible
  note: string;        // Uzbek explanation
}

export interface ScoreResult {
  total: number;
  band: 'Past' | "O'rta" | 'Yuqori';
  color: 'red' | 'amber' | 'green';
  advice: string;      // Uzbek band-specific advice
  breakdown: ScoreComponent[];
}

function trackRecord(facts: Facts): ScoreComponent {
  const y = facts.years_operating;
  let points = 0;
  let note = '';

  if (y >= 5) { points = 20; note = "Kuchli: 5+ yillik tajriba bankka ishonch beradi."; }
  else if (y >= 3) { points = 16; note = "Yaxshi: 3+ yillik barqaror faoliyat."; }
  else if (y >= 1) { points = 10; note = "O'rtacha: 1–3 yillik tajriba. Ko'proq moliyaviy hujjat kerak."; }
  else if (y >= 0.5) { points = 5; note = "Kam: 6 oy – 1 yil. Bank yangi biznesni yuqori risk deb ko'radi."; }
  else { points = 2; note = "Juda kam: yangi biznes. Qo'shimcha garov yoki kafillik kerak bo'ladi."; }

  return { label: "Tajriba va barqarorlik", points, max: 20, note };
}

function repaymentCapacity(facts: Facts): ScoreComponent {
  const { monthly_revenue_uzs, loan_amount_uzs, loan_term_months } = facts;
  let points = 0;
  let note = '';

  // Guard against invalid inputs
  if (loan_amount_uzs <= 0 || loan_term_months <= 0 || monthly_revenue_uzs <= 0) {
    return { label: "To'lov qobiliyati", points: 0, max: 25,
      note: "Kredit miqdori, muddati yoki tushum ko'rsatilmagan." };
  }

  const coverage = (monthly_revenue_uzs * loan_term_months) / loan_amount_uzs;

  if (coverage >= 3.0) {
    points = 25; note = `Juda kuchli: tushum kredit miqdoridan ${coverage.toFixed(1)}x ko'p.`;
  } else if (coverage >= 2.0) {
    points = 20; note = `Kuchli: tushum/kredit nisbati ${coverage.toFixed(1)}x.`;
  } else if (coverage >= 1.5) {
    points = 14; note = `O'rtacha: tushum/kredit nisbati ${coverage.toFixed(1)}x. Xarajatlar kamaysa yaxshiroq.`;
  } else if (coverage >= 1.0) {
    points = 8; note = `Zaif: tushum kredit to'lovini zo'rg'a qoplaydi (${coverage.toFixed(1)}x). Risk yuqori.`;
  } else {
    points = 2; note = `Xavfli: tushum (${(monthly_revenue_uzs/1_000_000).toFixed(1)} mln) kredit uchun yetarli emas.`;
  }

  return { label: "To'lov qobiliyati", points, max: 25, note };
}

function collateral(facts: Facts): ScoreComponent {
  let points = 0;
  let note = '';

  if (!facts.has_collateral) {
    points = 0;
    note = "Garov yo'q. Mikrokreditbank yoki kafil orqali ko'rish mumkin.";
  } else {
    const ct = facts.collateral_type.toLowerCase().replace(/[''`]/g, "'");
    const isRealEstate = ct.includes("ko'chmas") || ct.includes("kochmas") ||
                         ct.includes("uy") || ct.includes("er") ||
                         ct.includes("mulk") || ct.includes("zamin");
    const isVehicle = ct.includes("avto") || ct.includes("mashin") || ct.includes("transport");
    const isMachinery = ct.includes("uskunalar") || ct.includes("uskuna") ||
                        ct.includes("detallar") || ct.includes("agregat");

    if (isRealEstate) {
      points = 20;
      note = `Ko'chmas mulk garov — banklar uchun eng kuchli kafolat.`;
    } else if (isVehicle) {
      points = 16;
      note = `Avtomobil yoki transport garov — qabul qilinadi, lekin ko'chmas mulkdan kam qiymatli.`;
    } else if (isMachinery) {
      points = 12;
      note = `Uskunalar garov — qabul qilinadi, lekin qiymatini aniqlash kerak.`;
    } else {
      points = 13;
      note = `${facts.collateral_type} qabul qilinishi mumkin, lekin ko'chmas mulk afzal.`;
    }
  }

  return { label: "Garov ta'minoti", points, max: 20, note };
}

function businessScale(facts: Facts): ScoreComponent {
  const e = facts.employees;
  let points = 0;
  let note = '';

  if (e >= 10) { points = 15; note = "Katta jamoa — barqaror biznes belgisi."; }
  else if (e >= 5) { points = 11; note = "O'rta jamoa. Ish joylarini rasmiy ro'yxatdan o'tkazing."; }
  else if (e >= 2) { points = 7; note = "Kichik jamoa. Ishchilar mehnat shartnomalari kerak."; }
  else { points = 3; note = "Yakka tadbirkor. Biznesni kengaytirish rejasini ko'rsating."; }

  return { label: "Biznes ko'lami", points, max: 15, note };
}

function sectorOutlook(facts: Facts): ScoreComponent {
  const bt = facts.business_type.toLowerCase().replace(/[''`]/g, "'"); // normalize quotes
  let points = 0;
  let note = '';

  const foodAndAgri = ['novvoy', 'qishloq', 'dehqon', 'oziq', 'gosht', 'go\'sht', 'sut', 'sabzavot', 'meva', 'ishlab', 'chiqar', 'qazon'];
  const services = ['xizmat', 'talim', 'ta\'lim', 'tibbiy', 'salomatlik', 'axborot', 'dastur', 'konsultant'];
  const retail = ['dokon', 'do\'kon', 'savdo', 'bozor', 'magazin', 'sotuvchi'];
  const construction = ['qurilish', 'tamirlash', 'ta\'mirlash', 'dekoratsiya'];

  if (foodAndAgri.some(k => bt.includes(k))) {
    points = 10; note = "Oziq-ovqat/ishlab chiqarish — banklar tomonidan qo'llab-quvvatlanadigan soha.";
  } else if (services.some(k => bt.includes(k))) {
    points = 8; note = "Xizmat ko'rsatish — barqaror soha, davlat dasturlari mavjud.";
  } else if (retail.some(k => bt.includes(k))) {
    points = 6; note = "Savdo — raqobat yuqori, lekin bank kreditiga kirish mumkin.";
  } else if (construction.some(k => bt.includes(k))) {
    points = 5; note = "Qurilish — mavsumiy xatarlar tufayli bank ehtiyotkor.";
  } else {
    points = 5; note = "Soha aniqlandi. Qo'shimcha soha tavsifini qo'shing.";
  }

  return { label: "Soha istiqboli", points, max: 10, note };
}

function digitalFootprint(facts: Facts): ScoreComponent {
  // Proxy for Dec-2026 AI scoring readiness
  const hasRevenue = facts.monthly_revenue_uzs > 0;
  const hasHistory = facts.years_operating > 0;
  const hasTeam = facts.employees > 0;

  let points = 0;
  let note = '';

  if (hasRevenue && hasHistory && hasTeam) {
    points = 10;
    note = "Yaxshi: aylanma, ish tajribasi va xodimlar mavjud — 2026-yil AI scoring uchun tayyor.";
  } else if (hasRevenue && hasHistory) {
    points = 6;
    note = "O'rtacha: xodimlarni rasmiy ro'yxatdan o'tkaring — AI scoring uchun muhim.";
  } else {
    points = 2;
    note = "Kam: soliq va kommunal to'lovlarni rasmiy hisob orqali o'tkazing — AI scoring bu ma'lumotlarni tekshiradi.";
  }

  return { label: "Raqamli iz (2026 AI scoring)", points, max: 10, note };
}

export function computeScore(facts: Facts): ScoreResult {
  const components: ScoreComponent[] = [
    trackRecord(facts),
    repaymentCapacity(facts),
    collateral(facts),
    businessScale(facts),
    sectorOutlook(facts),
    digitalFootprint(facts),
  ];

  const total = components.reduce((sum, c) => sum + c.points, 0);

  let band: ScoreResult['band'];
  let color: ScoreResult['color'];
  let advice: string;

  if (total >= 65) {
    band = 'Yuqori';
    color = 'green';
    advice = "Tabriklaymiz! Siz kredit olish uchun yaxshi tayyorgarlansiz. Hujjatlarni to'plab, bank bilan bog'laning.";
  } else if (total >= 40) {
    band = "O'rta";
    color = 'amber';
    advice = "Yaxshi asos bor. Quyida ko'rsatilgan 1–2 zaif tomonni kuchaytiring, kredit olish imkoniyati oshadi.";
  } else {
    band = 'Past';
    color = 'red';
    advice = "Kredit olishdan oldin tayyorgarlik kerak. Garov, aylanma va rasmiylashtirish masalalariga e'tibor bering.";
  }

  return { total, band, color, advice, breakdown: components };
}

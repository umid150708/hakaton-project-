/**
 * bozorData.ts — All static data for the B2B marketplace
 *
 * Keeps Bozor.tsx free of data so it only handles UI logic.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Category =
  | 'all'
  | 'grain'    // 🌾 Don & Un
  | 'meat'     // 🥩 Go'sht & Sut
  | 'veg'      // 🥦 Sabzavot & Meva
  | 'build'    // 🏗️ Qurilish
  | 'food'     // 🍯 Oziq-ovqat
  | 'textile'  // 👗 Gazlama
  | 'agri'     // 🌱 Qishloq xo'jaligi
  | 'other';   // 📦 Boshqa

export interface Ad {
  id: string;
  type: 'buy' | 'sell';
  category: Category;
  product: string;
  quantity: string;
  location: string;
  price: string;
  contact: string;
  date: string;
  sample?: boolean;
}

// ─── Categories ────────────────────────────────────────────────────────────────

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'all',     label: 'Barchasi',        icon: '🗂️' },
  { id: 'grain',   label: "Don & Un",        icon: '🌾' },
  { id: 'build',   label: 'Qurilish',        icon: '🏗️' },
  { id: 'meat',    label: "Go'sht & Sut",    icon: '🥩' },
  { id: 'veg',     label: 'Sabzavot & Meva', icon: '🥦' },
  { id: 'food',    label: 'Oziq-ovqat',      icon: '🍯' },
  { id: 'textile', label: 'Gazlama',         icon: '👗' },
  { id: 'agri',    label: "Qishloq xo'j.",   icon: '🌱' },
  { id: 'other',   label: 'Boshqa',          icon: '📦' },
];

// ─── Unit selectors ────────────────────────────────────────────────────────────

export const UNIT_GROUPS: { label: string; units: string[] }[] = [
  { label: "⚖️ Og'irlik", units: ['kg', 'tonna', 'gramm', 'sentner', 'kvintal'] },
  { label: '🪣 Hajm',     units: ['litr', 'm³', 'sm³'] },
  { label: '📏 Uzunlik',  units: ['metr', 'sm', 'km'] },
  { label: '📐 Maydon',   units: ['m²', 'gektar', 'sotix'] },
  { label: '🔢 Sanoq',    units: ['dona', 'ta', 'juft', "o'ram", 'qop', 'blok', 'quti', 'pallet', 'komplekt'] },
];

export const ALL_UNITS = UNIT_GROUPS.flatMap(g => g.units);

export const FREQ_OPTIONS: { value: string; label: string }[] = [
  { value: '',       label: '(bir marta)' },
  { value: '/kun',   label: '/kun' },
  { value: '/hafta', label: '/hafta' },
  { value: '/oy',    label: '/oy' },
  { value: '/yil',   label: '/yil' },
];

// ─── LocalStorage ──────────────────────────────────────────────────────────────

const ADS_KEY = 'b2b_user_ads_v2';

export function loadUserAds(): Ad[] {
  try { return JSON.parse(localStorage.getItem(ADS_KEY) ?? '[]'); }
  catch { return []; }
}

export function saveUserAd(ad: Ad): void {
  const all = loadUserAds();
  all.unshift(ad);
  localStorage.setItem(ADS_KEY, JSON.stringify(all.slice(0, 200)));
}

// ─── Sample ads ────────────────────────────────────────────────────────────────

export const SAMPLE_BUY: Ad[] = [
  { id:'b1',  type:'buy', category:'grain',   product:"Bug'doy uni (1-nav)",   quantity:'20 tonna',     location:'Toshkent',          price:'',                 contact:'+998 90 123 45 67', date:'30.06.2026', sample:true },
  { id:'b2',  type:'buy', category:'build',   product:'Sement (M400)',          quantity:'50 tonna',     location:'Samarqand',         price:'',                 contact:'+998 91 234 56 78', date:'30.06.2026', sample:true },
  { id:'b3',  type:'buy', category:'meat',    product:"Mol go'shti",            quantity:'500 kg',       location:'Namangan',          price:"75 000 so'm/kg",   contact:'+998 93 345 67 89', date:'29.06.2026', sample:true },
  { id:'b4',  type:'buy', category:'build',   product:'Armitura (d12)',          quantity:'10 tonna',     location:'Jizzax',            price:'',                 contact:'+998 94 456 78 90', date:'29.06.2026', sample:true },
  { id:'b5',  type:'buy', category:'food',    product:'Qand shakar',             quantity:'5 tonna',      location:"Farg'ona",          price:"5 000 so'm/kg",    contact:'+998 95 567 89 01', date:'28.06.2026', sample:true },
  { id:'b6',  type:'buy', category:'food',    product:'Paxta yogi',              quantity:'2 tonna',      location:'Buxoro',            price:'',                 contact:'+998 97 678 90 12', date:'28.06.2026', sample:true },
  { id:'b7',  type:'buy', category:'veg',     product:'Kartoshka',               quantity:'15 tonna',     location:'Andijon',           price:"2 500 so'm/kg",    contact:'+998 99 789 01 23', date:'27.06.2026', sample:true },
  { id:'b8',  type:'buy', category:'build',   product:"G'isht (qizil)",          quantity:'50 000 dona',  location:'Toshkent vil.',     price:'',                 contact:'+998 90 890 12 34', date:'27.06.2026', sample:true },
  { id:'b9',  type:'buy', category:'veg',     product:'Pomidor',                 quantity:'8 tonna',      location:'Qarshi',            price:'',                 contact:'+998 91 901 23 45', date:'26.06.2026', sample:true },
  { id:'b10', type:'buy', category:'meat',    product:"Tovuq go'shti",           quantity:'1 tonna',      location:'Nukus',             price:"30 000 so'm/kg",   contact:'+998 93 012 34 56', date:'26.06.2026', sample:true },
  { id:'b11', type:'buy', category:'grain',   product:"Makkajo'xori",            quantity:'30 tonna',     location:'Termiz',            price:'',                 contact:'+998 94 123 45 60', date:'25.06.2026', sample:true },
  { id:'b12', type:'buy', category:'textile', product:'Gazlama (zigir)',          quantity:'500 metr',     location:'Namangan',          price:'',                 contact:'+998 95 234 56 71', date:'25.06.2026', sample:true },
  { id:'b13', type:'buy', category:'build',   product:"Yog'och (qayin)",         quantity:'5 m³',         location:'Toshkent',          price:'',                 contact:'+998 97 345 67 82', date:'24.06.2026', sample:true },
  { id:'b14', type:'buy', category:'agri',    product:"Mineral o'g'it",          quantity:'10 tonna',     location:'Sirdaryo',          price:'',                 contact:'+998 99 456 78 93', date:'24.06.2026', sample:true },
  { id:'b15', type:'buy', category:'veg',     product:'Qovoq',                   quantity:'3 tonna',      location:'Xorazm',            price:'',                 contact:'+998 90 567 89 04', date:'23.06.2026', sample:true },
  { id:'b16', type:'buy', category:'meat',    product:'Sut (pasterizatsiya)',     quantity:'500 litr/kun', location:'Toshkent',          price:"5 500 so'm/litr",  contact:'+998 91 678 90 15', date:'23.06.2026', sample:true },
  { id:'b17', type:'buy', category:'build',   product:'Temir profil',             quantity:'8 tonna',      location:"Farg'ona",          price:'',                 contact:'+998 93 789 01 26', date:'22.06.2026', sample:true },
  { id:'b18', type:'buy', category:'agri',    product:"Qovoq urug'i",            quantity:'200 kg',       location:'Qashqadaryo',       price:'',                 contact:'+998 94 890 12 37', date:'22.06.2026', sample:true },
  { id:'b19', type:'buy', category:'other',   product:'Polietilen paket',         quantity:'100 000 dona', location:'Andijon',           price:'',                 contact:'+998 95 901 23 48', date:'21.06.2026', sample:true },
  { id:'b20', type:'buy', category:'build',   product:"Shifer (7 to'lqin)",      quantity:'2 000 dona',   location:'Samarqand',         price:'',                 contact:'+998 97 012 34 59', date:'21.06.2026', sample:true },
];

export const SAMPLE_SELL: Ad[] = [
  { id:'s1',  type:'sell', category:'grain',   product:"Bug'doy uni (oliy nav)",  quantity:'50 tonna/oy',    location:"Toshkent — Yunusobod",  price:"2 400 so'm/kg",    contact:'+998 90 111 22 33', date:'30.06.2026', sample:true },
  { id:'s2',  type:'sell', category:'build',   product:'Sement (M500, Ohorli)',   quantity:'200 tonna',      location:"Quvasoy, Farg'ona",     price:"950 so'm/kg",      contact:'+998 91 222 33 44', date:'30.06.2026', sample:true },
  { id:'s3',  type:'sell', category:'meat',    product:"Mol go'shti (sifatli)",   quantity:'2 tonna/hafta',  location:'Toshkent — Chorsu',     price:"78 000 so'm/kg",   contact:'+998 93 333 44 55', date:'29.06.2026', sample:true },
  { id:'s4',  type:'sell', category:'build',   product:'Armitura (d10-d16)',       quantity:'30 tonna',       location:'Bektemir, Toshkent',    price:"9 200 so'm/kg",    contact:'+998 94 444 55 66', date:'29.06.2026', sample:true },
  { id:'s5',  type:'sell', category:'food',    product:'Qand shakar (import)',     quantity:'20 tonna',       location:'Samarqand — ombor',     price:"5 100 so'm/kg",    contact:'+998 95 555 66 77', date:'28.06.2026', sample:true },
  { id:'s6',  type:'sell', category:'food',    product:"Paxta yog'i (rafinir)",   quantity:'5 tonna',        location:'Andijon — zavod',        price:"15 500 so'm/litr", contact:'+998 97 666 77 88', date:'28.06.2026', sample:true },
  { id:'s7',  type:'sell', category:'veg',     product:'Kartoshka (yangi hosil)', quantity:'40 tonna',       location:'Toshkent vil. — Zangi', price:"2 800 so'm/kg",    contact:'+998 99 777 88 99', date:'27.06.2026', sample:true },
  { id:'s8',  type:'sell', category:'build',   product:"G'isht (250×120×65)",    quantity:'100 000 dona',   location:'Samarqand — zavod',     price:"950 so'm/dona",    contact:'+998 90 888 99 00', date:'27.06.2026', sample:true },
  { id:'s9',  type:'sell', category:'veg',     product:'Pomidor (issiqxona)',     quantity:'5 tonna/hafta',  location:'Sirdaryo — Guliston',   price:"5 500 so'm/kg",    contact:'+998 91 999 00 11', date:'26.06.2026', sample:true },
  { id:'s10', type:'sell', category:'meat',    product:"Tovuq go'shti (ferma)",  quantity:'3 tonna',        location:'Toshkent — Sergeli',    price:"33 000 so'm/kg",   contact:'+998 93 000 11 22', date:'26.06.2026', sample:true },
  { id:'s11', type:'sell', category:'grain',   product:"Makkajo'xori (quruq)",   quantity:'100 tonna',      location:'Jizzax viloyati',        price:"1 900 so'm/kg",    contact:'+998 94 111 22 30', date:'25.06.2026', sample:true },
  { id:'s12', type:'sell', category:'textile', product:'Gazlama (chintz, 80g)',  quantity:'2 000 metr',     location:'Namangan — bozor',       price:"12 000 so'm/metr", contact:'+998 95 222 33 41', date:'25.06.2026', sample:true },
  { id:'s13', type:'sell', category:'build',   product:"Yog'och (eman, quruq)",  quantity:'20 m³',          location:'Toshkent — Ipodrom',    price:"3 500 000 so'm/m³",contact:'+998 97 333 44 52', date:'24.06.2026', sample:true },
  { id:'s14', type:'sell', category:'agri',    product:"Azot o'g'it (karbam)",   quantity:'20 tonna',       location:'Navoiy — Karbamid',     price:"3 200 so'm/kg",    contact:'+998 99 444 55 63', date:'24.06.2026', sample:true },
  { id:'s15', type:'sell', category:'veg',     product:'Tarvuz (Mitan, katta)',  quantity:'15 tonna',       location:'Xorazm — Urganch',      price:"1 200 so'm/kg",    contact:'+998 90 555 66 74', date:'23.06.2026', sample:true },
  { id:'s16', type:'sell', category:'meat',    product:"Sut (ferma, yangi)",     quantity:'1 000 litr/kun', location:"Toshkent vil. — Bo'ka", price:"5 800 so'm/litr",  contact:'+998 91 666 77 85', date:'23.06.2026', sample:true },
  { id:'s17', type:'sell', category:'build',   product:'Temir profil (kvadrat)', quantity:'15 tonna',       location:'Chirchiq — zavod',       price:"8 900 so'm/kg",    contact:'+998 93 777 88 96', date:'22.06.2026', sample:true },
  { id:'s18', type:'sell', category:'grain',   product:'Osh (Devzira)',          quantity:'10 tonna',       location:"Farg'ona — Qo'qon",     price:"7 500 so'm/kg",    contact:'+998 94 888 99 07', date:'22.06.2026', sample:true },
  { id:'s19', type:'sell', category:'build',   product:'PVC quvur (d110)',       quantity:'500 metr',       location:'Toshkent — Yunusobod',  price:"28 000 so'm/m",    contact:'+998 95 999 00 18', date:'21.06.2026', sample:true },
  { id:'s20', type:'sell', category:'food',    product:"Yong'oq (yangi hosil)",  quantity:'500 kg',         location:'Namangan — Kosonsoy',   price:"45 000 so'm/kg",   contact:'+998 97 000 11 29', date:'21.06.2026', sample:true },
];

export interface Question {
  id: number;
  text: string;
  placeholder: string;
  example: string; // clickable example — helps judges & non-Uzbek speakers test quickly
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Biznesingiz nima?",
    placeholder: "Masalan: Novvoyxona, kiyim tikish ustaxonasi, oziq-ovqat do'koni...",
    example: "Meva-sabzavot do'koni",
  },
  {
    id: 2,
    text: "Qaysi viloyatda joylashgan?",
    placeholder: "Masalan: Jizzax, Toshkent, Farg'ona, Samarqand...",
    example: "Samarqand viloyati",
  },
  {
    id: 3,
    text: "Necha yildan beri ishlaysiz?",
    placeholder: "Masalan: 3 yil, 6 oy, hozirgina boshladim...",
    example: "2 yil",
  },
  {
    id: 4,
    text: "Oylik tushum taxminan qancha?",
    placeholder: "Masalan: 15 million so'm, 50 million so'm...",
    example: "25 million so'm",
  },
  {
    id: 5,
    text: "Kredit nimaga kerak?",
    placeholder: "Masalan: Yangi uskunalar sotib olish, do'kon kengaytirish, tovar ombori...",
    example: "Yangi sovutgich va javonlar sotib olish",
  },
  {
    id: 6,
    text: "Qancha kredit kerak va qancha muddatga?",
    placeholder: "Masalan: 50 million so'm, 24 oyga...",
    example: "80 million so'm, 36 oyga",
  },
  {
    id: 7,
    text: "Garov bera olasizmi?",
    placeholder: "Masalan: Uy-joy, avtomobil, uskuna. Yoki: garovim yo'q",
    example: "Ha, 3 xonali uy bor",
  },
  {
    id: 8,
    text: "Necha nafar xodim bor?",
    placeholder: "Masalan: 4 nafar, yoki faqat o'zim ishlayapman",
    example: "3 nafar xodim",
  },
  {
    id: 9,
    text: "Asosiy raqiblaringiz kimlar?",
    placeholder: "Masalan: Yonidagi do'konlar, bozor sotuvchilari, shu sohadagi korxonalar",
    example: "Yaqin atrofdagi 2-3 ta do'kon",
  },
  {
    id: 10,
    text: "Keyingi 2 yilda rejangiz nima?",
    placeholder: "Masalan: Yangi filial ochish, ishlab chiqarishni kengaytirish, eksport...",
    example: "Assortimentni kengaytirib, yetkazib berish xizmatini qo'shish",
  },
];

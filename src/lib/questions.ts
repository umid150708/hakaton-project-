export interface Question {
  id: number;
  text: string;
  placeholder: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Biznesingiz nima?",
    placeholder: "Masalan: Novvoyxona, kiyim tikish ustaxonasi, oziq-ovqat do'koni...",
  },
  {
    id: 2,
    text: "Qaysi viloyatda joylashgan?",
    placeholder: "Masalan: Jizzax, Toshkent, Farg'ona, Samarqand...",
  },
  {
    id: 3,
    text: "Necha yildan beri ishlaysiz?",
    placeholder: "Masalan: 3 yil, 6 oy, hozirgina boshlayapman...",
  },
  {
    id: 4,
    text: "Oylik tushum taxminan qancha (so'mda)?",
    placeholder: "Masalan: 15,000,000 so'm yoki 15 million so'm",
  },
  {
    id: 5,
    text: "Kredit nimaga kerak?",
    placeholder: "Masalan: Yangi uskunalar sotib olish, do'kon kengaytirish, tovar ombori...",
  },
  {
    id: 6,
    text: "Qancha kredit kerak va qancha muddatga?",
    placeholder: "Masalan: 50 million so'm, 24 oyga",
  },
  {
    id: 7,
    text: "Garov bera olasizmi?",
    placeholder: "Masalan: Uy-joy, avtomobil, uskuna. Yoki: garovim yo'q",
  },
  {
    id: 8,
    text: "Necha nafar xodim bor?",
    placeholder: "Masalan: 4 nafar, yoki faqat o'zim ishlayapman",
  },
  {
    id: 9,
    text: "Asosiy raqiblaringiz kimlar?",
    placeholder: "Masalan: Yonidagi do'konlar, bozor sotuvchilari, shu sohadagi boshqa korxonalar",
  },
  {
    id: 10,
    text: "Keyingi 2 yilda rejangiz nima?",
    placeholder: "Masalan: Yangi filial ochish, ishlab chiqarishni kengaytirish, eksport qilish...",
  },
];

/**
 * learningContent.ts — Editable content config for O'quv markazi.
 *
 * To add a real video ID: find the lesson by id and replace "TODO_VIDEO_ID"
 * with the 11-character YouTube video ID (e.g. "dQw4w9WgXcQ").
 * See LEARNING_README.md for the full lesson-to-channel mapping.
 */

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  channel: string;
  channelUrl: string;
  videoId: string;
  durationNote: string;
  xp: number;
  toolLink?: string;
  toolCta?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: 'single-choice' | 'true-false';
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  lessons: Lesson[];
  quiz: {
    id: string;
    questions: QuizQuestion[];
  };
}

export interface Track {
  id: string;
  title: string;
  levels: Level[];
}

export const PASS_THRESHOLD = 70; // %
export const LESSON_XP = 50;

// ─── TRACK ────────────────────────────────────────────────────────────────────

export const track: Track = {
  id: 'biznes-moliya',
  title: "O'quv markazi",
  levels: [

    // ═══════════════════════════════════════════════════════════════════════════
    // LEVEL 1 — Moliyaviy asoslar
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 1,
      title: 'Moliyaviy asoslar',
      subtitle: 'Pul boshqaruvining birinchi qadamlari',
      icon: '💰',
      accentColor: 'emerald',
      lessons: [
        {
          id: 'l1-1',
          title: 'Shaxsiy va biznes moliyasini ajratish',
          summary:
            "Ko'pgina tadbirkorlar shaxsiy va biznes pullarini aralashtirib yuboradi — bu hisob-kitobni qiyinlashtiradi, soliq muammolariga olib keladi va biznesning haqiqiy holatini ko'rishga to'sqinlik qiladi. Biznes uchun alohida hisob raqami ochish moliyaviy tartibning birinchi va eng muhim qadamidir.",
          keyTakeaways: [
            "Biznes uchun alohida bank hisob raqami oching va faqat biznes operatsiyalari uchun ishlating.",
            "O'zingizga oylik 'ish haqi' belgilang — bu biznes xarajati hisoblanadi va aralashmaslikka yordam beradi.",
            "Shaxsiy xarajatlar uchun hech qachon kassa yoki biznes hisobidan foydalanmang.",
            "Barcha biznes kvitansiyalari va hujjatlarini alohida papkada saqlang.",
            "Oylik yakunlarda biznes va shaxsiy balansni alohida-alohida tekshiring.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~10 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l1-2',
          title: 'Daromad va xarajatlarni kuzatish',
          summary:
            "Biznesingiz qancha pul kiritayotgani va sarflayotganini bilmay turib, to'g'ri qaror qabul qilib bo'lmaydi. Kunlik daromad va xarajatlarni kuzatish — moliyaviy nazoratning asosi va barcha tahlillarning boshlang'ich nuqtasidir.",
          keyTakeaways: [
            "Har bir daromad va xarajatni yozib boring — daftarcha, Excel yoki telefon ilovasi orqali.",
            "Xarajatlarni turlarga ajrating: mahsulot, ish haqi, ijara, kommunal, transport va boshqalar.",
            "Oylik daromad va xarajat hisobotini tayyorlang va tahlil qiling.",
            "Kutilmagan xarajatlar uchun 'qo'shimcha xarajatlar' rubrikasini kiriting.",
            "Faqat naqd pulni emas, naqdsiz to'lovlarni ham yozib boring.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~12 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l1-3',
          title: 'Byudjet tuzish',
          summary:
            "Byudjet — biznesingiz kelgusida qancha pul kirib-chiqishini oldindan rejalashtirish vositasi. U sizga kutilmagan xarajatlarga tayyorlanish, maqsadlarga erishish va pul oqimini boshqarish imkonini beradi.",
          keyTakeaways: [
            "Oylik byudjetni oldingi oy haqiqiy raqamlari asosida tuzing.",
            "Har bir xarajat kategoriyasi uchun chegara (limit) belgilang.",
            "Byudjetdagi farqlarni (plan va fakt) har oy tahlil qiling.",
            "Mavsumiy o'zgarishlarni hisobga oling — bahor va kuz ko'pincha moliyaviy jihatdan farq qiladi.",
            "Byudjet qat'iy qonun emas — vaziyatga qarab moslashtiring, lekin har doim yozma saqlang.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~15 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l1-4',
          title: "Jamg'arma va moliyaviy yostiq",
          summary:
            "Moliyaviy yostiq — biznesingizni kutilmagan qiyinchiliklar (savdo pasayishi, uskunalar buzilishi, bozor inqirozi) paytida himoya qiladigan zaxira fonddir. Har bir biznes kamida 3 oylik xarajatni yostiq sifatida saqlashi kerak.",
          keyTakeaways: [
            "Har oylik sof daromaddan kamida 10% ni zaxira fondga ajrating.",
            "Moliyaviy yostiq maqsadi: kamida 3 oylik doimiy xarajatlar miqdori.",
            "Yostiqni alohida, maxsus hisob raqamida saqlang — kundalik foydalanmang.",
            "Yostiqdan faqat haqiqiy favqulodda hollarda foydalaning.",
            "Yostiqdan foydalangach, uni to'ldirish rejasini darhol tuzing.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~10 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l1-5',
          title: "Moliyaviy maqsad qo'yish",
          summary:
            "Aniq moliyaviy maqsadlar biznesingizni to'g'ri yo'naltirishga yordam beradi. 'Ko'proq pul ishlash' emas, balki '12 oy ichida oylik foyda 20 million so'mga yetkazish' kabi SMART maqsadlar qo'ying.",
          keyTakeaways: [
            "Maqsadlar SMART bo'lishi kerak: aniq, o'lchanadigan, erishilishi mumkin, real va muddatli.",
            "Qisqa muddatli (1–3 oy), o'rta muddatli (6–12 oy) va uzoq muddatli (1–3 yil) maqsadlarni ajrating.",
            "Har bir moliyaviy maqsad uchun oylik harakatlar rejasini tuzing.",
            "Maqsadlarga erishishni har oy tekshiring va kerak bo'lsa tuzating.",
            "Maqsadlaringizni yozib, ko'rinadigan joyga ilib qo'ying — bu motivatsiyani oshiradi.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~13 daqiqa',
          xp: LESSON_XP,
        },
      ],
      quiz: {
        id: 'q1',
        questions: [
          {
            id: 'q1-1',
            prompt: "Ko'p tadbirkorlarning asosiy moliyaviy xatosi qaysi?",
            type: 'single-choice',
            options: [
              "Haddan ko'p tejash",
              "Shaxsiy va biznes moliyasini aralashtirish",
              "Kredit olmaslik",
              "Hujjatlarni saqlash",
            ],
            correctIndex: 1,
            explanation:
              "Shaxsiy va biznes moliyasini aralashtirish — eng keng tarqalgan xato. Bu hisob-kitobni qiyinlashtiradi, soliq muammolariga olib keladi va biznesning haqiqiy ahvolini ko'rishga to'sqinlik qiladi.",
          },
          {
            id: 'q1-2',
            prompt: "Moliyaviy yostiq kamida qancha miqdorda bo'lishi tavsiya etiladi?",
            type: 'single-choice',
            options: [
              "1 oylik xarajatlar",
              "3 oylik xarajatlar",
              "6 oylik xarajatlar",
              "1 yillik xarajatlar",
            ],
            correctIndex: 1,
            explanation:
              "Moliyaviy ekspertlar kamida 3 oylik doimiy xarajatlarni yostiq sifatida saqlashni tavsiya qiladi. Bu savdo pasayganda yoki kutilmagan xarajatlar chiqqanda biznesni davom ettirish imkonini beradi.",
          },
          {
            id: 'q1-3',
            prompt: "Byudjet tuzishning asosiy maqsadi nima?",
            type: 'single-choice',
            options: [
              "Pul sarflashni to'liq to'xtatish",
              "Daromad va xarajatlarni oldindan rejalashtirish",
              "Bankdan kredit olish uchun hujjat tayyorlash",
              "Soliq to'lashni kamaytirish",
            ],
            correctIndex: 1,
            explanation:
              "Byudjet — daromad va xarajatlarni oldindan rejalashtirish vositasi. U kutilmagan xarajatlarga tayyorlanish, moliyaviy maqsadlarga erishish va pul oqimini boshqarish imkonini beradi.",
          },
          {
            id: 'q1-4',
            prompt: "SMART maqsad qo'yishda 'M' harfi nimani bildiradi?",
            type: 'single-choice',
            options: [
              "Muhim (Important)",
              "O'lchanadigan (Measurable)",
              "Motivatsiyali (Motivating)",
              "Muddatli (Time-bound)",
            ],
            correctIndex: 1,
            explanation:
              "SMARTda 'M' — Measurable (O'lchanadigan). 'Ko'proq daromad qilish' emas, 'oyiga 15 million so'm daromad qilish' — o'lchanadigan maqsad. Buni faqat aniq raqamlar bilan o'lchash mumkin.",
          },
          {
            id: 'q1-5',
            prompt: "O'zingizga 'ish haqi' belgilashning asosiy sababi nima?",
            type: 'single-choice',
            options: [
              "Soliq kam to'lash uchun",
              "Shaxsiy va biznes moliyasini ajratish uchun",
              "Xodimlardan ko'p maosh olish uchun",
              "Bankka ko'rsatish uchun",
            ],
            correctIndex: 1,
            explanation:
              "Tadbirkor o'ziga aniq ish haqi belgilasa, shaxsiy va biznes moliyasi aralashmaydi. Bu biznesning haqiqiy daromadi va xarajatlarini aniq ko'rishga yordam beradi.",
          },
          {
            id: 'q1-6',
            prompt: "Daromad va xarajatlarni kuzatish uchun qaysi usul ENG ishonchli?",
            type: 'single-choice',
            options: [
              "Xotirada saqlash",
              "Faqat katta summalarni yozish",
              "Muntazam yozib borish (daftar, Excel yoki ilova)",
              "Yil oxirida hisoblab chiqish",
            ],
            correctIndex: 2,
            explanation:
              "Muntazam yozib borish — eng ishonchli usul. Kichik summalar ham to'planib katta miqdorga etadi. Oylik tahlil uchun barcha operatsiyalar yozilgan bo'lishi shart.",
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LEVEL 2 — Biznesni rejalashtirish
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 2,
      title: 'Biznesni rejalashtirish',
      subtitle: "Muvaffaqiyatli biznesning yo'lxaritasi",
      icon: '📋',
      accentColor: 'blue',
      lessons: [
        {
          id: 'l2-1',
          title: 'Biznes-reja nima va nega kerak',
          summary:
            "Biznes-reja — kompaniyangizning kelajak yo'lxaritasi. U maqsadlarni aniq belgilash, resurslarni to'g'ri taqsimlash va potentsial muammolarni oldindan ko'rish imkonini beradi. Biznes-reja faqat bank uchun emas — avvalambor sizning o'zingiz uchun.",
          keyTakeaways: [
            "Biznes-reja faqat bank uchun emas — u sizning o'zingiz uchun strategik yo'lxarita.",
            "Asosiy qismlar: kompaniya tavsifi, bozor tahlili, mahsulot/xizmat, marketing, moliyaviy prognoz.",
            "Biznes-rejani yiliga kamida bir marta ko'rib chiqing va yangilab turing.",
            "Qisqa muddatli (1 yil) va uzoq muddatli (3–5 yil) rejalarni alohida tuzing.",
            "Moliyaviy prognozni 3 stsenariyde hisoblang: pessimistik, real va optimistik.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~14 daqiqa',
          xp: LESSON_XP,
          toolLink: '/interview',
          toolCta: "Amaliyot: Biznes-reja tuzuvchiga o'ting",
        },
        {
          id: 'l2-2',
          title: 'Bozor va mijozni tushunish',
          summary:
            "Muvaffaqiyatli biznes bozor ehtiyojiga javob beradi. Mijozlaringiz kim, nima xohlaydi va nima uchun sizdan sotib olishini tushunish — barcha marketing va savdo strategiyasining asosi.",
          keyTakeaways: [
            "Maqsadli auditoriyangizni aniq belgilang: yoshi, joylashuvi, daromad darajasi va ehtiyoji.",
            "Raqobatchilaringizni o'rganing: ular nima qiladi, narxlari qanday, zaif tomonlari nima.",
            "Mijozlardan so'rovnoma oling yoki bevosita suhbatlashing — bu eng arzon tadqiqot.",
            "Bozor hajmini hisoblang: potentsial mijozlar soni × o'rtacha xarid summasi.",
            "Mijozlarning asosiy 'og'riq nuqtasi' (muammosi)ni toping va uni hal qiling.",
          ],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~16 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l2-3',
          title: 'Xarajat tahlili va narx belgilash',
          summary:
            "Narxni to'g'ri belgilash biznesingizning rentabelligini ta'minlaydi. Narx juda past bo'lsa zarar ko'rasiz, juda baland bo'lsa mijoz yo'qotasiz. To'g'ri narx — xarajat, foyda va bozor muvozanatidir.",
          keyTakeaways: [
            "Barcha xarajatlarni hisoblang: to'g'ri (tovar, ishlab chiqarish) va bilvosita (ijara, ish haqi, kommunal).",
            "Narxni 'xarajat + foydali ustama' formulasi bilan hisoblang va bozor narxi bilan solishtiring.",
            "Raqobatchilar narxini bilingiz — lekin ko'r-ko'rona ergashmang.",
            "Turli mijoz segmentlari uchun turli narx strategiyalarini ko'rib chiqing.",
            "10% chegirma ko'p hollarda 20–30% foyda yo'qotishini anglatadi — diqqatli bo'ling.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~15 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l2-4',
          title: 'Pul oqimi (Cash Flow)',
          summary:
            "Biznes daromadli bo'lsa ham, pul oqimi to'g'ri boshqarilmasa bankrot bo'lishi mumkin. Pul oqimi — qo'lingizda haqiqatan naqd pul qancha borligini ko'rsatuvchi ko'rsatkich.",
          keyTakeaways: [
            "Pul oqimi = kirim − chiqim (faqat haqiqatan amalga oshgan operatsiyalar).",
            "Oylik pul oqimi prognozini tuzing: qaysi oy ko'p pul kiradi, qaysi oy kam.",
            "Debitorlik (sizga qarz) va kreditorlik (siz qarz) muddatlarini nazorat qiling.",
            "Muddatidan oldin to'lovga chegirma berib, pul oqimini yaxshilash mumkin.",
            "Mavsumiy biznesda past davrlar uchun moliyaviy yostiq saqlab turish shart.",
          ],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~18 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l2-5',
          title: 'Zararsizlik nuqtasi (Break-even)',
          summary:
            "Zararsizlik nuqtasi — biznesingiz na foyda, na zarar ko'radigan sotish hajmi. Bu ko'rsatkichni bilmasdan, maqsadli daromadga erishib bo'lmaydi va yangi mahsulot/xizmat kiritishda katta xavfga duch kelasiz.",
          keyTakeaways: [
            "Formulasi: Zararsizlik nuqtasi = Doimiy xarajatlar ÷ (Birlik narxi − Birlik o'zgaruvchan xarajati).",
            "Doimiy xarajatlar (ijara, ish haqi) sotish hajmidan qat'iy nazar to'lanadi.",
            "O'zgaruvchan xarajatlar (tovar, paket) sotish miqdoriga qarab o'zgaradi.",
            "Zararsizlik nuqtasidan oshgan har bir so'm — sof foyda.",
            "Yangi mahsulot yoki xizmat kiritganda, avval uning zararsizlik nuqtasini hisoblang.",
          ],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~12 daqiqa',
          xp: LESSON_XP,
          toolLink: '/interview',
          toolCta: "Amaliyot: AI maslahatchi bilan break-even hisoblang",
        },
      ],
      quiz: {
        id: 'q2',
        questions: [
          {
            id: 'q2-1',
            prompt: "Biznes-rejaning asosiy maqsadi nima?",
            type: 'single-choice',
            options: [
              "Faqat bankdan kredit olish uchun",
              "Investor topish",
              "Biznesning strategik yo'lxaritasi va rejasi",
              "Soliq deklaratsiyasi tayyorlash",
            ],
            correctIndex: 2,
            explanation:
              "Biznes-reja — kompaniyangizning kelajak yo'lxaritasi. Bank uchun ham kerak, lekin asosan siz uchun: maqsadlar, strategiya va moliyaviy reja.",
          },
          {
            id: 'q2-2',
            prompt: "Maqsadli bozorni aniqlashning to'g'ri yo'li qaysi?",
            type: 'single-choice',
            options: [
              "Har kimga sotishga harakat qilish",
              "Mijozlarni o'rganib, aniq segment tanlash",
              "Eng katta raqobatchi bozorini takrorlash",
              "Ijtimoiy tarmoqlarda reklama berib ko'rish",
            ],
            correctIndex: 1,
            explanation:
              "Muvaffaqiyatli biznes aniq maqsadli auditoriyaga xizmat qiladi. Mijozlarni o'rganish (yoshi, joylashuvi, ehtiyoji, daromadi) orqali ularning muammosini eng yaxshi hal qila olasiz.",
          },
          {
            id: 'q2-3',
            prompt: "Narx belgilashda qaysi yondashuv to'g'riroq?",
            type: 'single-choice',
            options: [
              "Faqat raqobatchi narxiga qarab belgilash",
              "Xarajat + Foyda marjasi asosida belgilash",
              "Mijoz to'lashga tayyor bo'lgan maksimal summani olish",
              "Tasodifiy belgilash va keyin tuzatish",
            ],
            correctIndex: 1,
            explanation:
              "To'g'ri narx xarajatlar + foydali ustama asosida hisoblanadi va bozor narxi bilan muvozanatda bo'ladi. Faqat raqobatchilar narxiga ergashish zarar keltirishi mumkin.",
          },
          {
            id: 'q2-4',
            prompt: "Pul oqimi (cash flow) va foyda o'rtasidagi asosiy farq nima?",
            type: 'single-choice',
            options: [
              "Farq yo'q, ular bir xil narsa",
              "Foyda daromad−xarajat, pul oqimi haqiqiy naqd pul harakati",
              "Pul oqimi doim foydadan katta bo'ladi",
              "Foyda naqd pul, pul oqimi qog'ozdagi ko'rsatkich",
            ],
            correctIndex: 1,
            explanation:
              "Foyda — hisob-kitob ko'rsatkichi. Pul oqimi esa haqiqatan qo'lingizda naqd pul qancha ekanligini ko'rsatadi. Daromadli biznes ham pul oqimi muammosi sababli to'lovlarga qiynalishi mumkin.",
          },
          {
            id: 'q2-5',
            prompt: "Zararsizlik nuqtasiga erishilgandan keyingi sotuvlar nimani bildiradi?",
            type: 'single-choice',
            options: [
              "Yangi xarajatlar paydo bo'ladi",
              "Sof foyda olinadi",
              "Zarar ko'riladi",
              "Doimiy xarajatlar oshadi",
            ],
            correctIndex: 1,
            explanation:
              "Zararsizlik nuqtasida barcha xarajatlar qoplanadi. Bundan keyingi har bir sotuvdan tushgan pul — sof foydadir (o'zgaruvchan xarajatlarni chegirib tashlagan holda).",
          },
          {
            id: 'q2-6',
            prompt: "Biznes daromadli bo'lsa ham qaysi holda moliyaviy muammoga uchraydi?",
            type: 'single-choice',
            options: [
              "Sotish hajmi ko'p bo'lganda",
              "Pul oqimi salbiy bo'lganda",
              "Xarajatlar past bo'lganda",
              "Mijozlar ko'p bo'lganda",
            ],
            correctIndex: 1,
            explanation:
              "Hisobda daromad ko'rinishi va haqiqiy naqd pulning qo'lda bo'lishi boshqa narsa. Mijozlar to'lovni kechiktirsa yoki katta xarajatlar bir vaqtda kelib tushsa, pul oqimi salbiy bo'lib, to'lovlarga qiynalishi mumkin.",
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LEVEL 3 — Kredit va moliyalashtirish
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 3,
      title: 'Kredit va moliyalashtirish',
      subtitle: "Aqlli qarz — o'sish vositasi",
      icon: '🏦',
      accentColor: 'violet',
      lessons: [
        {
          id: 'l3-1',
          title: 'Kredit turlari',
          summary:
            "O'zbekistonda kichik va o'rta biznes uchun turli kredit mahsulotlari mavjud: mikrokreditdan tortib investitsion kreditlargacha. To'g'ri kredit turini tanlash moliyaviy yukni sezilarli kamaytiradi.",
          keyTakeaways: [
            "Mikrokreditlar: odatda 200 mln so'mgacha, garovsiz yoki minimal garov bilan.",
            "Tadbirkorlik kreditlari: biznes-reja va garov asosida, katta summalar uchun.",
            "Investitsion kreditlar: uskunalar yoki infratuzilma uchun, uzoq muddatli (5–10 yil).",
            "Davlat dasturlari: imtiyozli foiz stavkasi bilan subsidiyalangan kreditlar.",
            "Lizing: uskunani sotib olmay, oylik to'lov evaziga ishlatish imkoniyati.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~14 daqiqa',
          xp: LESSON_XP,
          toolLink: '/interview',
          toolCta: "Amaliyot: Kredit turi bo'yicha AI maslahat oling",
        },
        {
          id: 'l3-2',
          title: 'Foiz stavkasi va uni hisoblash',
          summary:
            "Kredit foizi — qarzning haqiqiy narxi. Foizni to'g'ri hisoblash kreditning biznesingizga mosligini baholash uchun zarur. Nominal stavka bilan effektiv stavka (APR) o'rtasidagi farqni bilish muhim.",
          keyTakeaways: [
            "Oddiy foiz: Foiz = Asosiy qarz × Stavka × Muddat.",
            "Murakkab foiz: Foiz asosiy qarzga ham, to'plangan foizga ham hisoblanadi.",
            "Effektiv foiz stavkasi (APR) — barcha to'lov va komissiyalarni hisobga olgan haqiqiy narx.",
            "'Kamayuvchi qoldiq' metodi: har oy foiz kamaygan asosiy qarzdan hisoblanadi — bu foydali.",
            "Kreditni muddatidan oldin to'lash foizni sezilarli kamaytiradi.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~16 daqiqa',
          xp: LESSON_XP,
          toolLink: '/interview',
          toolCta: "Amaliyot: Kredit kalkulyatorida foizingizni hisoblang",
        },
        {
          id: 'l3-3',
          title: 'Kreditga tayyorgarlik',
          summary:
            "Bank sizga kredit berish yoki bermasligini bir necha mezon asosida baholaydi: daromad, garov, kredit tarixi, biznes-reja. Bu mezonlarga oldindan tayyorlanish kredit olish ehtimolini sezilarli oshiradi.",
          keyTakeaways: [
            "Zarur hujjatlar: passport, STIR, biznes ro'yxatdan o'tish guvohnomasi, soliq deklaratsiyalari.",
            "Oxirgi 6–12 oylik bank hisobvarag'i ko'chirmasi (bank turnover)ni tayyorlang.",
            "Biznes-reja va moliyaviy prognozni professional tarzda tuzing.",
            "Garovingizni baholating — bozor qiymatini bilish kerak.",
            "Kredit tarix tekshiruviga (NBKI) oldindan murojaat qiling va muammolarni hal qiling.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~18 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l3-4',
          title: "Qarzni boshqarish",
          summary:
            "Kredit olish — mas'uliyat. Qarzni to'g'ri boshqarmaslik biznesingizni va shaxsiy moliyangizni xavf ostiga qo'yadi. Qarzni boshqarish strategiyasi kredit olishdan avval belgilanishi kerak.",
          keyTakeaways: [
            "Oylik to'lovni daromadingizning 30–35% dan oshirmaslikka rejalashtiring.",
            "Muddatli to'lovlarni avtomat to'lovga o'tkazing — kechiktirishdan saqlaning.",
            "Kreditni maqsad bo'yicha ishlating: daromad keltiruvchi aktivlar uchun.",
            "Bir vaqtda bir necha kredit olishdan saqlaning — 'kredit tuzog'i'dan ehtiyot bo'ling.",
            "Qarzingiz ortib ketayotganini sezsa, bankka murojaat qiling — qayta moliyalash imkonini so'rang.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~12 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l3-5',
          title: 'Kredit tarixi',
          summary:
            "Kredit tarixi — sizning oldingi qarzlarni to'lash tartibi haqidagi ma'lumot. Yaxshi kredit tarixi kelajakda kredit olishni osonlashtiradi va foiz stavkasini pastlashtiradi.",
          keyTakeaways: [
            "Kredit tarixi NBKI (Milliy kredit byurosi)da saqlanadi — tekshirish bepul va tavsiya etiladi.",
            "Har qanday kechiktirilgan to'lov kredit tarixingizni yomonlashtiradi.",
            "Hatto kichik kreditni o'z vaqtida to'lash kredit tarixingizni yaxshilaydi.",
            "Kredit tarixida xato bo'lsa, uni to'g'rilash uchun rasmiy ariza bering.",
            "Kredit tarixini yaxshilash uchun kichik limitli kredit kartadan boshlash mumkin.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~11 daqiqa',
          xp: LESSON_XP,
        },
      ],
      quiz: {
        id: 'q3',
        questions: [
          {
            id: 'q3-1',
            prompt: "O'zbekistonda garovsiz mikrokreditning odatiy maksimal miqdori qancha?",
            type: 'single-choice',
            options: [
              "50 mln so'm",
              "100 mln so'm",
              "200 mln so'm",
              "500 mln so'm",
            ],
            correctIndex: 2,
            explanation:
              "O'zbekistonda garovsiz mikrokreditlar odatda 200 mln so'mgacha taqdim etiladi. Bundan katta summalar uchun garov yoki kafillik talab qilinadi.",
          },
          {
            id: 'q3-2',
            prompt: "Effektiv foiz stavkasi (APR) nima?",
            type: 'single-choice',
            options: [
              "Bankda ko'rsatilgan nominal stavka",
              "Barcha komissiya va to'lovlarni hisobga olgan haqiqiy kredit narxi",
              "Davlat belgilagan maksimal stavka",
              "Faqat asosiy foiz stavkasi",
            ],
            correctIndex: 1,
            explanation:
              "APR (Annual Percentage Rate) — kredit narxining to'liq ko'rsatkichi. U nominal stavka + barcha komissiyalar + xizmat haqlari dan iborat. Kreditlarni solishtirishda nominal emas, APRga qarang.",
          },
          {
            id: 'q3-3',
            prompt: "Kreditga ariza berishda birinchi navbatda nima qilinishi kerak?",
            type: 'single-choice',
            options: [
              "Darhol bankka borib ariza topshirish",
              "Kredit tarixini tekshirish va hujjatlarni tayyorlash",
              "Mumkin bo'lgan eng katta miqdorni so'rash",
              "Bir vaqtda bir necha bankka murojaat qilish",
            ],
            correctIndex: 1,
            explanation:
              "Avval kredit tarixingizni tekshiring (NBKI), keyin hujjatlar (passport, STIR, soliq deklaratsiyasi, bank ko'chirmasi)ni tayyorlang. Tayyorlanib borilsa, kredit olish ehtimoli sezilarli oshadi.",
          },
          {
            id: 'q3-4',
            prompt: "Oylik kredit to'lovi qancha bo'lishi tavsiya etiladi?",
            type: 'single-choice',
            options: [
              "Daromadning 10% dan kam",
              "Daromadning 30–35% dan oshmaslik",
              "Daromadning 50% gacha",
              "Miqdordan qat'iy nazar",
            ],
            correctIndex: 1,
            explanation:
              "Moliyaviy maslahatchilar kredit to'lovini oylik daromadning 30–35% dan oshirmaslikni tavsiya qiladi. Bu moliyaviy qulay bo'lib, boshqa xarajatlar va jamg'arma uchun ham pul qoladi.",
          },
          {
            id: 'q3-5',
            prompt: "Kredit tarixingiz qayerda saqlanadi?",
            type: 'single-choice',
            options: [
              "Faqat sizning bankingizda",
              "NBKI — Milliy kredit byurosida",
              "Soliq organlarida",
              "Adliya vazirligida",
            ],
            correctIndex: 1,
            explanation:
              "O'zbekistonda kredit tarixi NBKI (Milliy bank kredit axborot tizimi)da saqlanadi. Barcha banklar kredit berish oldidan shu tizimni tekshiradi.",
          },
          {
            id: 'q3-6',
            prompt: "Lizing nima?",
            type: 'single-choice',
            options: [
              "Uzoq muddatli kredit turi",
              "Aktivni sotib olmay, oylik to'lov evaziga foydalanish shartnomasi",
              "Davlat subsidiyasi",
              "Kafillik shakli",
            ],
            correctIndex: 1,
            explanation:
              "Lizing — aktivni (uskuna, transport) sotib olmay, davriy to'lov evaziga uzoq muddatga foydalanish. Boshlang'ich kapital kamligi bilan kerakli uskunaga ega bo'lish imkonini beradi.",
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LEVEL 4 — Soliq va hisob-kitob
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 4,
      title: 'Soliq va hisob-kitob',
      subtitle: "Qonuniy, aniq, xavfsiz",
      icon: '🧾',
      accentColor: 'amber',
      lessons: [
        {
          id: 'l4-1',
          title: "O'zbekistonda kichik biznes uchun soliq rejimlari",
          summary:
            "O'zbekistonda tadbirkorlar uchun bir necha soliq rejimi mavjud: patent, soddalashtirilgan soliq tizimi (SST) va umumiy tartib. To'g'ri rejim tanlash soliq yukingizni sezilarli kamaytiradi va buxgalteriyani soddalashtiradi.",
          keyTakeaways: [
            "Patent: eng sodda — oylik yoki yillik belgilangan to'lov, minimal hisobot.",
            "SST (Soddalashtirilgan Soliq Tizimi): daromad yoki foyda foizi (1–4%). Yillik 1 mlrd so'mgacha uchun.",
            "Umumiy tartib: QQS, foyda solig'i va boshqalar — yirik firmalar uchun.",
            "Xarajatlari past bo'lsa patent, xarajatlari ko'p bo'lsa SST foydali bo'lishi mumkin.",
            "Soliq rejimini yil boshida o'zgartirish mumkin — har yili tahlil qiling.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~20 daqiqa',
          xp: LESSON_XP,
          toolLink: '/interview',
          toolCta: "Amaliyot: AI maslahatchi bilan soliq rejimingiznni hisoblang",
        },
        {
          id: 'l4-2',
          title: 'Asosiy soliq turlari',
          summary:
            "Har bir tadbirkor to'lashi lozim bo'lgan soliqlar: daromad solig'i, ijtimoiy to'lovlar, QQS va boshqalar. Ularni bilmaslik 'bilmay to'lash' emas — jarima demakdir.",
          keyTakeaways: [
            "YaTT uchun: daromad solig'i 12%, ijtimoiy to'lov — tasdiqlangan miqdor.",
            "MChJ uchun: foyda solig'i 15%, ish haqi soliqlari (JSHIR + ijtimoiy sug'urta).",
            "QQS: yillik aylanmasi 1 mlrd so'mdan oshsa to'lash majburiy (20% stavka).",
            "Mulk va er soliqlari — hududiy organlar belgilaydi.",
            "Soliq imtiyozlari: nogironligi bor tadbirkorlar, yangi korxonalar va sanoat zonalari uchun mavjud.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~17 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l4-3',
          title: 'Buxgalteriya asoslari',
          summary:
            "Buxgalteriya hisobi — barcha moliyaviy operatsiyalarni yozib borish tizimi. Bu oddiy daftardan boshlanib, murakkab dasturlarga qadar kengayishi mumkin. Asosiy tamoyillarni bilish har qanday tadbirkor uchun zarur.",
          keyTakeaways: [
            "Har bir operatsiyani hujjat asosida yozing: kvitansiya, shartnoma, faktura.",
            "Aktiv (nima bor) va passiv (nima qarz) balansini har oy tekshiring.",
            "Sodda buxgalteriya uchun 1C, Excel yoki Soliq.uz kabi dasturlardan foydalaning.",
            "Kassir va buxgalter vazifasini ajrating — nazorat va xavfsizlik uchun muhim.",
            "Barcha hujjatlarni 5 yil saqlang — soliq tekshiruvi uchun zarur.",
          ],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~15 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l4-4',
          title: 'Moliyaviy hisobotlar',
          summary:
            "Moliyaviy hisobotlar — biznesingizning sog'liq ko'rsatkichi. Uchta asosiy hisobot: Daromad-zarar hisoboti (P&L), Balans va Pul oqimi hisoboti. Ularni tushunish to'g'ri qaror qabul qilish uchun zarur.",
          keyTakeaways: [
            "P&L (Daromad-zarar hisoboti): Daromad − Xarajat = Foyda/Zarar.",
            "Balans: Aktivlar = Passivlar + Kapital. Moliyaviy barqarorlikni ko'rsatadi.",
            "Pul oqimi hisoboti: haqiqiy naqd pulning kirimi va chiqimi.",
            "Har chorak moliyaviy hisobotni ko'rib chiqish tavsiya etiladi.",
            "Moliyaviy hisobotlarni banklar, investorlar va soliq organlari talab qilishi mumkin.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~18 daqiqa',
          xp: LESSON_XP,
        },
      ],
      quiz: {
        id: 'q4',
        questions: [
          {
            id: 'q4-1',
            prompt: "Patent soliq rejimining asosiy afzalligi nima?",
            type: 'single-choice',
            options: [
              "Soliq umuman to'lanmaydi",
              "Belgilangan to'lov va minimal hisobot",
              "Daromad oshsa soliq pasayadi",
              "Faqat yirik firmalar uchun mos",
            ],
            correctIndex: 1,
            explanation:
              "Patent rejimida yillik yoki oylik belgilangan miqdor to'lanadi, daromad miqdoridan qat'iy nazar. Minimal hisobot talablari tufayli oddiy savdo bilan shug'ullanuvchi tadbirkorlar uchun juda qulay.",
          },
          {
            id: 'q4-2',
            prompt: "QQS (qo'shilgan qiymat solig'i) to'lash qachon majburiy bo'ladi?",
            type: 'single-choice',
            options: [
              "Doim, har qanday biznes uchun",
              "Yillik aylanma 1 mlrd so'mdan oshsa",
              "Xodimlar soni 10 dan oshsa",
              "Faqat import bilan shug'ullanuvchilar uchun",
            ],
            correctIndex: 1,
            explanation:
              "O'zbekistonda QQS (20%) yillik soliq solinadigan aylanmasi 1 mlrd so'mdan oshganda majburiy ro'yxatdan o'tishni talab qiladi. Bu chegaradan past bo'lsa, ixtiyoriy ravishda ro'yxatdan o'tish mumkin.",
          },
          {
            id: 'q4-3',
            prompt: "Moliyaviy hisobotlardagi 'P&L' nima?",
            type: 'single-choice',
            options: [
              "Patent va Lizing hisoboti",
              "Daromad va Zarar hisoboti",
              "Pul va Litsenziya hisoboti",
              "Pudrat va Lizing shartnomasi",
            ],
            correctIndex: 1,
            explanation:
              "P&L — Profit & Loss (Daromad va Zarar) hisoboti. U ma'lum davr uchun jami daromadlar va xarajatlarni ko'rsatib, sof foyda yoki zararni aniqlaydi.",
          },
          {
            id: 'q4-4',
            prompt: "Soliq hujjatlarini qancha muddat saqlash shart?",
            type: 'single-choice',
            options: ["1 yil", "2 yil", "5 yil", "10 yil"],
            correctIndex: 2,
            explanation:
              "O'zbekiston soliq qonunchiligiga ko'ra, barcha buxgalteriya va soliq hujjatlari kamida 5 yil saqlanishi shart. Bu soliq tekshiruvi yoki nizolar uchun muhim.",
          },
          {
            id: 'q4-5',
            prompt: "'Aktivlar = Passivlar + Kapital' qaysi hisobot formulasi?",
            type: 'single-choice',
            options: [
              "Pul oqimi hisoboti",
              "P&L hisoboti",
              "Balans hisoboti",
              "Soliq deklaratsiyasi",
            ],
            correctIndex: 2,
            explanation:
              "Bu Balans hisobotining asosiy formulasi. Aktivlar (kompaniya egallagan barcha narsalar) doim passivlar (qarzlar) va kapital (egalarning ulushi) yig'indisiga teng bo'lishi kerak.",
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LEVEL 5 — Sotuv va marketing
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 5,
      title: 'Sotuv va marketing',
      subtitle: "Mijozni topish va saqlab qolish",
      icon: '📢',
      accentColor: 'rose',
      lessons: [
        {
          id: 'l5-1',
          title: 'Sotuv voronkasi',
          summary:
            "Sotuv voronkasi — potentsial mijozning birinchi tanishuvdan xaridgacha bo'lgan yo'li. Voronkaning har bir bosqichini tushunish savdo hajmini oshirishga yordam beradi.",
          keyTakeaways: [
            "Voronka bosqichlari: Xabardorlik → Qiziqish → Ko'rib chiqish → Qaror → Xarid.",
            "Har bosqichda qancha odam o'tishini hisoblang — bu konversiya darajasini ko'rsatadi.",
            "Eng ko'p 'tushish' qayerda bo'layotganini toping va shu bosqichni yaxshilang.",
            "Takroriy xarid uchun voronka tugamaydi — mijozni ushlab turish ham strategik muhim.",
            "Oddiy CRM (daftar ham bo'lsa) bilan mijoz bazangizni kuzating.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~14 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l5-2',
          title: 'Mijoz bilan ishlash',
          summary:
            "Mavjud mijozni saqlab turish yangi mijoz topishdan 5–7 barobar arzon. Mijoz munosabatlarini to'g'ri boshqarish — uzoq muddatli biznes muvaffaqiyatining kaliti.",
          keyTakeaways: [
            "Har bir mijozni ism bilan bilishga harakat qiling — shaxsiy munosabat kerak.",
            "Shikoyatlarni imkoniyat deb biling — tez va to'g'ri hal qilish ishonchni mustahkamlaydi.",
            "Takroriy xaridlar uchun maxsus chegirma yoki bonus dasturi joriy qiling.",
            "Mijozdan fikr-mulohaza so'rang — bu mahsulot va xizmatni yaxshilashga yordam beradi.",
            "Vad berilgan muddatda yetkazib berish — oddiy lekin eng samarali marketing vositasi.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'Wtd5XX4kzrY',
          durationNote: '~16 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l5-3',
          title: 'Marketing kanallari',
          summary:
            "Marketing — mahsulotingiz haqida maqsadli auditoriyangizga ma'lumot yetkazish jarayoni. Barcha kanallarda bo'lish emas, o'z mijozlari bo'lgan kanalda faol bo'lish muhim.",
          keyTakeaways: [
            "Ijtimoiy tarmoqlar (Instagram, Telegram): O'zbek auditoriyasi uchun eng samarali kanal.",
            "Og'zaki marketing (word of mouth): eng ishonchli va bepul kanal — sifatli xizmat asosi.",
            "Mahalliy reklama (banner, radio): joylashuvga bog'liq bizneslar uchun samarali.",
            "B2B uchun: shaxsiy muloqot va namoyish ko'pincha reklamadan samaraliroq.",
            "Har bir marketing kanaliga sarflangan pul qaytimini (ROI) hisoblang.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: '7u4hBlzqaH8',
          durationNote: '~15 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l5-4',
          title: 'Narx strategiyasi',
          summary:
            "Narx belgilash — marketing strategiyasining muhim qismi. Narx faqat xarajatni qoplamaydi — u brend imijini, mijoz segmentini va raqobat pozitsiyasini belgilaydi.",
          keyTakeaways: [
            "Qiymat asosli narxlash: mijoz uchun yaratgan qiymatga mos narx belgilang.",
            "Psixologik narxlash: 50,000 o'rniga 49,900 so'm — bu faqat raqam emas, idrok masalasi.",
            "Paket taklif: bir necha mahsulotni birlashtirib, alohida sotishdan arzonga taklif qiling.",
            "Premium narxlash: yuqori sifat va xizmat bilan narxni oshirish mumkin.",
            "Dinamik narxlash: mavsumga, talab-taklifga qarab narxni o'zgartirish.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~13 daqiqa',
          xp: LESSON_XP,
        },
      ],
      quiz: {
        id: 'q5',
        questions: [
          {
            id: 'q5-1',
            prompt: "Sotuv voronkasining birinchi bosqichi nima?",
            type: 'single-choice',
            options: [
              "Xarid qilish",
              "Qaror qabul qilish",
              "Xabardorlik (Awareness)",
              "Ko'rib chiqish",
            ],
            correctIndex: 2,
            explanation:
              "Sotuv voronkasi xabardorlik (awareness) bilan boshlanadi — potentsial mijoz mahsulot yoki xizmat haqida birinchi marta biladi. Keyingi bosqichlar: qiziqish, ko'rib chiqish, qaror, xarid.",
          },
          {
            id: 'q5-2',
            prompt: "Mavjud mijozni ushlab turish yangi mijoz topishdan qancha arzon?",
            type: 'single-choice',
            options: ["Bir xil", "2–3 barobar", "5–7 barobar", "10 barobardan ko'p"],
            correctIndex: 2,
            explanation:
              "Tadqiqotlar shuni ko'rsatadiki, mavjud mijozni ushlab turish yangi mijoz jalb qilishdan 5–7 barobar arzon. Shu sababli mijozlar qoniqishi va takroriy xarid dasturlari strategik muhimdir.",
          },
          {
            id: 'q5-3',
            prompt: "O'zbekistonda kichik biznes uchun eng samarali marketing kanali qaysi?",
            type: 'single-choice',
            options: [
              "Televizion reklama",
              "Instagram va Telegram",
              "Gazeta e'lonlari",
              "Billboard reklamasi",
            ],
            correctIndex: 1,
            explanation:
              "O'zbekistonda Instagram va Telegram eng ko'p ishlatiladigan platformalar. Nisbatan arzon narxda aniq maqsadli auditoriyaga yetib borish mumkin. Kichik biznes uchun eng samarali kanal.",
          },
          {
            id: 'q5-4',
            prompt: "'Psixologik narxlash' deganda nima tushuniladi?",
            type: 'single-choice',
            options: [
              "Narxni psixologlar belgilashi",
              "49,900 so'm kabi narxlar bilan arzonroq ko'rsatish",
              "Faqat boy mijozlarga mo'ljallangan narxlar",
              "Narxni tez-tez o'zgartirish",
            ],
            correctIndex: 1,
            explanation:
              "Psixologik narxlash — narxni 'to'liq' raqamdan biroz past belgilash (49,900 vs 50,000). Xaridor bu narxni 49 ming deb idrok etadi, garchi amaliy farq kichik bo'lsa ham.",
          },
          {
            id: 'q5-5',
            prompt: "Marketing kanalining samaradorligini qanday baholash kerak?",
            type: 'single-choice',
            options: [
              "Faqat ko'rish (views) soniga qarab",
              "ROI (investitsiya qaytimi)ni hisoblash orqali",
              "Eng ko'p reklama bergan kanalga qarab",
              "Raqiblar qaysi kanalda bo'lsa, o'sha kanalda bo'lish",
            ],
            correctIndex: 1,
            explanation:
              "ROI (Return on Investment) — marketing samaradorligini o'lchashning asosiy usuli. Formula: (Daromad − Marketing xarajati) ÷ Marketing xarajati × 100%. Har kanalning ROIni hisoblang.",
          },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LEVEL 6 — O'sish va boshqaruv
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 6,
      title: "O'sish va boshqaruv",
      subtitle: "Kichikdan kattaga: tizimli o'sish",
      icon: '🚀',
      accentColor: 'sky',
      lessons: [
        {
          id: 'l6-1',
          title: 'Biznes rivojlanish bosqichlari',
          summary:
            "Har bir biznes muayyan rivojlanish bosqichlaridan o'tadi: start-up, o'sish, yetuklik, kengayish. Har bosqichda yuzaga keladigan muammolar va ularning echimlari farq qiladi.",
          keyTakeaways: [
            "Start-up bosqichi: asosiy vazifa — bozorda o'z joyingizni topish va birinchi daromad olish.",
            "O'sish bosqichi: tizim va jarayonlarni yaratish vaqti — hamma narsa faqat sizga bog'liq bo'lmasligi kerak.",
            "Yetuklik bosqichi: operatsiyalar barqarorlashadi, yangi bozorlar yoki mahsulotlar qidiriladi.",
            "Kengayish bosqichi: franchayzing, filiallar yoki yangi bozorlar orqali miqyoslashtirish.",
            "Har bosqichda liderlik uslubi ham o'zgarishi kerak — 'hamma narsani o'zim' dan 'tizim orqali' ga.",
          ],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~18 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l6-2',
          title: 'Jamoa va boshqaruv',
          summary:
            "Biznes ma'lum darajaga etgach, yolg'iz ishlash imkonsiz bo'ladi. To'g'ri jamoa qurib, ularni samarali boshqarish — o'sishning asosiy omillaridan biridir.",
          keyTakeaways: [
            "Birinchi yollanma xodim: sizning eng zaif tomoningizni to'ldiruvchi odam bo'lsin.",
            "Lavozim tavsifi (job description)ni yozish — yangi xodim izlashdan oldingi muhim qadam.",
            "Xodimlarni rag'batlantirish: faqat maosh emas, o'sish imkoniyati va muhit ham muhim.",
            "Haftalik 15 daqiqalik team meeting — muammolarni erta aniqlash uchun.",
            "Xodimning kuchli tomonlaridan foydalaning — zaif tomonlarini tizim bilan yoping.",
          ],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~20 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l6-3',
          title: 'Miqyoslashtirish (Scaling)',
          summary:
            "Miqyoslashtirish — resurslarni proporsional oshirmay, daromad va foyda hajmini oshirish. Bu tizimlar, texnologiya va to'g'ri jamoa orqali erishiladi.",
          keyTakeaways: [
            "Avval jarayonlarni yozib, standartlashtiring — keyin avtomatlang.",
            "Texnologiyadan foydalaning: onlayn buyurtma, to'lov tizimlari, inventarizatsiya dasturlari.",
            "Miqyoslashtirish uchun kapital kerak — uni qayerdan olishni (foyda, kredit, investor) oldindan rejalashtiring.",
            "Sifat va xizmat darajasini miqyosdayam saqlang — bu eng qiyin qism.",
            "Yaqin bozorlardan boshlang: O'zbekistonda boshqa viloyatlar, keyin Qozog'iston.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~17 daqiqa',
          xp: LESSON_XP,
          toolLink: '/bozor',
          toolCta: "Amaliyot: B2B bozorida yangi bozorlarni o'rganing",
        },
        {
          id: 'l6-4',
          title: 'Krizisni boshqarish',
          summary:
            "Har qanday biznes krizisga — iqtisodiy pasayish, raqobatchi kuchayishi, tovar yetkazib berish uzilishi — duch keladi. Krizisni oldindan rejalashtirish uni engishni ancha osonlashtiradi.",
          keyTakeaways: [
            "Krizis rejasi tuzing: 'Agar X bo'lsa, Y qilamiz' shaklida stsenariylar tayyorlang.",
            "Xarajatlarni: kesilishi mumkin bo'lgan (o'zgaruvchan) va kesilmaydigan (doimiy)larga ajrating.",
            "Krizisda birinchi navbatda naqd pulni himoya qiling — xarajatlarni qisqartiring.",
            "Mijozlaringiz va yetkazib beruvchilaringiz bilan ochiq muloqotda bo'ling.",
            "Krizis innovatsiyaga majburlaydi — raqobatchilar to'xtaganda siz oldinga chiqishingiz mumkin.",
          ],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~15 daqiqa',
          xp: LESSON_XP,
        },
        {
          id: 'l6-5',
          title: 'Bozor tahlili',
          summary:
            "Bozor doimiy o'zgarib turadi — raqobatchilar, iste'molchi xatti-harakati, texnologiya va qonunlar. Doimiy bozor monitoringi sizni o'zgarishlarga tayyorlaydi va imkoniyatlarni ko'rishga yordam beradi.",
          keyTakeaways: [
            "SWOT tahlili (Kuchli tomonlar, Zaif tomonlar, Imkoniyatlar, Tahdidlar)ni yiliga bir marta o'tkaz.",
            "Raqobatchilar narxi va mahsulotlarini muntazam kuzatib turing.",
            "Iste'molchi tendentsiyalarini ijtimoiy tarmoqlar va so'rovnomalar orqali o'rgan.",
            "Davlat siyosati va qonunlarni kuzating — ular biznesingizga to'g'ridan-to'g'ri ta'sir qiladi.",
            "Bozor tahlili natijalarini yozib, qarorlarga asoslang — his-tuyg'uga emas.",
          ],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'TODO_VIDEO_ID',
          durationNote: '~16 daqiqa',
          xp: LESSON_XP,
          toolLink: '/bozor',
          toolCta: "Amaliyot: B2B bozor narxlarini tahlil qiling",
        },
      ],
      quiz: {
        id: 'q6',
        questions: [
          {
            id: 'q6-1',
            prompt: "Biznes 'o'sish bosqichi'da eng muhim vazifa nima?",
            type: 'single-choice',
            options: [
              "Yangi mahsulot yaratish",
              "Tizim va jarayonlarni yaratish",
              "Xarajatlarni qisqartirish",
              "Darhol xalqaro bozorga chiqish",
            ],
            correctIndex: 1,
            explanation:
              "O'sish bosqichida biznes kengayadi va hamma narsa faqat asoschi ga bog'liq bo'lib qoladi. Shu sababli tizim, jarayonlar va delegatsiya muhimdir — aks holda 'o'sish domi'ga tushib qolasiz.",
          },
          {
            id: 'q6-2',
            prompt: "Birinchi xodimni yollashda qaysi mezon muhimroq?",
            type: 'single-choice',
            options: [
              "Eng arzon ishchi bo'lish",
              "O'zingizning eng zaif tomoningizni to'ldiruvchi odam",
              "Eng ko'p tajribaga ega bo'lish",
              "Yaqin qarindosh yoki do'st bo'lish",
            ],
            correctIndex: 1,
            explanation:
              "Birinchi xodim sizning kuchli tomonlaringizni emas, zaif tomonlaringizni to'ldirishi kerak. Masalan, texnikaviy bo'lsangiz — savdo insoni, savdo qiyin bo'lsa — texnik mutaxassis yollang.",
          },
          {
            id: 'q6-3',
            prompt: "'Miqyoslashtirish' (scaling) deganda nima tushuniladi?",
            type: 'single-choice',
            options: [
              "Faqat xodimlar sonini oshirish",
              "Resurslarni ko'p oshirmay, daromad va foydani oshirish",
              "Yangi bino qurish",
              "Xarajatlarni oshirish",
            ],
            correctIndex: 1,
            explanation:
              "Miqyoslashtirish — tizimlar va texnologiyalar orqali resurslarni ko'p oshirmay daromadni oshirishdir. Masalan, onlayn savdo kanali qo'shish yoki jarayonlarni avtomatlash.",
          },
          {
            id: 'q6-4',
            prompt: "Krizisda eng birinchi nima himoya qilinishi kerak?",
            type: 'single-choice',
            options: [
              "Brend obro'si",
              "Xodimlar soni",
              "Naqd pul va pul oqimi",
              "Reklama byudjeti",
            ],
            correctIndex: 2,
            explanation:
              "Krizisda biznesni tirik tutuvchi asosiy omil — naqd pul. Pul tugasa, hamma narsa to'xtaydi. Shu sababli krizis boshlanishi bilanoq xarajatlarni qisqarting va pul oqimini himoya qiling.",
          },
          {
            id: 'q6-5',
            prompt: "SWOT tahlilida 'T' nimani anglatadi?",
            type: 'single-choice',
            options: [
              "Texnologiya (Technology)",
              "Tahdid (Threat)",
              "Tendentsiya (Trend)",
              "Topshiriq (Task)",
            ],
            correctIndex: 1,
            explanation:
              "SWOT — Strengths (Kuchli tomonlar), Weaknesses (Zaif tomonlar), Opportunities (Imkoniyatlar), Threats (Tahdidlar). 'T' — Threats, ya'ni tashqi muhitdan keladigan tahdidlar.",
          },
          {
            id: 'q6-6',
            prompt: "Biznes kengayishida qaysi bozorlardan boshlash tavsiya etiladi?",
            type: 'single-choice',
            options: [
              "Darhol xalqaro bozorlar",
              "Yaqin va tanish bozorlar (boshqa viloyatlar, qo'shni mamlakatlar)",
              "Eng katta raqobat bo'lgan bozorlar",
              "Hukumat belgilagan bozorlar",
            ],
            correctIndex: 1,
            explanation:
              "Miqyoslashtirishda dastlab yaqin va ma'lum bozorlardan boshlash xavfni kamaytiradi. Masalan, Toshkentdagi biznes avval boshqa viloyatlarga, so'ng Qozog'iston yoki Qirg'izistonga chiqishi mumkin.",
          },
        ],
      },
    },
  ],
};

// ─── Helper: get all lessons flat ─────────────────────────────────────────────
export function getAllLessons(): (Lesson & { levelId: number })[] {
  return track.levels.flatMap(lv =>
    lv.lessons.map(ls => ({ ...ls, levelId: lv.id }))
  );
}

export function getLessonById(id: string): (Lesson & { levelId: number }) | undefined {
  return getAllLessons().find(l => l.id === id);
}

export function getLevelById(id: number): Level | undefined {
  return track.levels.find(l => l.id === id);
}

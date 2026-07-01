/**
 * learningContent.ts — Editable content config for O'quv markazi.
 *
 * To add a real video ID: find the lesson by id and replace "TODO_VIDEO_ID"
 * with the 11-character YouTube video ID (e.g. "dQw4w9WgXcQ").
 */

export interface LessonSection {
  heading: string;
  paragraphs: string[];
}

export interface Source {
  label: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  /** Khan Academy-style written lesson — always present, even without a video. */
  body: LessonSection[];
  keyTakeaways: string[];
  /** Cited references for the written lesson content. */
  sources: Source[];
  channel: string;
  channelUrl: string;
  /** 'TODO_VIDEO_ID' when no verified video exists yet — the video is optional. */
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

// ─── Shared, verifiable reference sources (base URLs only — no fabricated deep links)
const SRC = {
  finlit:    { label: "Finlit.uz — Markaziy bank moliyaviy savodxonlik portali", url: 'https://finlit.uz' },
  soliq:     { label: "Soliq qo'mitasi — soliq.uz", url: 'https://soliq.uz' },
  lex:       { label: "Lex.uz — O'zbekiston qonun hujjatlari bazasi", url: 'https://lex.uz' },
  gsbe:      { label: "Biznes va tadbirkorlik oliy maktabi — gsbe.uz", url: 'https://gsbe.uz' },
  cbu:       { label: "O'zbekiston Markaziy banki — cbu.uz", url: 'https://cbu.uz' },
  stat:      { label: "Statistika agentligi — stat.uz", url: 'https://stat.uz' },
  finlitYt:  { label: "Finlit.uz — YouTube kanali", url: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA' },
  mfaktorYt: { label: "MFaktor Biznes Maktabi — YouTube kanali", url: 'https://www.youtube.com/@MfaktorBiznesMaktabi' },
  gsbeYt:    { label: "Biznes va tadbirkorlik oliy maktabi — YouTube kanali", url: 'https://www.youtube.com/@gsbeuz' },
} satisfies Record<string, Source>;

// ─── TRACK ────────────────────────────────────────────────────────────────────

export const track: Track = {
  id: 'biznes-moliya',
  title: "O'quv dasturi",
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
          body: [
            {
              heading: 'Nega bu birinchi qadam?',
              paragraphs: [
                "Tasavvur qiling: do'koningiz kassasida 5 million so'm turibdi. Bu pul — biznesniki, sizniki yoki ikkalasiniki ekanini aniq ayta olasizmi? Agar yo'q bo'lsa, siz eng keng tarqalgan tadbirkorlik xatosiga yo'l qo'yayapsiz. Shaxsiy va biznes pulini aralashtirish biznesning haqiqiy foydasini yashiradi — yaxshi ko'rinayotgan biznes aslida zarar keltirayotgan bo'lishi mumkin.",
                "Pul aralashganda uchta muammo kelib chiqadi: birinchidan, biznes rentabelligini o'lchab bo'lmaydi; ikkinchidan, soliq hisob-kitobi chalkashadi; uchinchidan, kredit olmoqchi bo'lganingizda bank sizning moliyaviy holatingizni tushunolmaydi.",
              ],
            },
            {
              heading: 'Amaliy tizim: uch qadam',
              paragraphs: [
                "1) Biznes uchun alohida bank hisob-raqami oching va barcha biznes tushum-chiqimini faqat shu hisob orqali o'tkazing. 2) Kassa va shaxsiy hamyonni hech qachon aralashtirmang — biznesdan pul olsangiz, buni yozib qo'ying. 3) Har oy oxirida biznes balansi va shaxsiy balansni alohida hisoblang.",
                "Misol: oyiga biznesdan 3 mln so'm 'ish haqi' olib, uni shaxsiy hisobingizga o'tkazasiz. Shundan keyin shaxsiy xarajatlar — oziq-ovqat, ijara, kiyim — faqat shu 3 mln ichida bo'ladi. Biznes hisobi esa toza qoladi.",
              ],
            },
            {
              heading: "O'zingizga ish haqi belgilang",
              paragraphs: [
                "Ko'p tadbirkor 'biznes pulim — o'z pulim' deb o'ylaydi. Aslida siz biznesning xodimisiz ham. O'zingizga aniq oylik belgilang: bu ham biznes xarajati sifatida hisobga olinadi va sizga real foydani ko'rish imkonini beradi. Agar biznes sizga ish haqi to'lay olmasa — bu jiddiy signal.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.cbu, SRC.finlitYt],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'A-zvGoOAEbY',
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
          body: [
            {
              heading: "Nima uchun kuzatish kerak?",
              paragraphs: [
                "'Qancha ishlayapsan?' degan savolga aniq raqam bilan javob bera olasizmi? Ko'p tadbirkor faqat kassadagi pulga qarab baho beradi — bu esa chalg'ituvchi. Kassada pul ko'p bo'lishi mumkin, lekin u yetkazib beruvchiga qarz yoki ijara puli bo'lishi mumkin.",
                "Har bir kirim va chiqimni yozib borish — moliyaviy nazoratning poydevori. Yozilmagan pul — nazoratsiz pul. Tadqiqotlar shuni ko'rsatadiki, xarajatlarini yozib boradigan odam o'rtacha 15–20% kam behuda sarflaydi, chunki har bir chiqim ko'z oldida bo'ladi.",
              ],
            },
            {
              heading: "Xarajatlarni toifalarga ajrating",
              paragraphs: [
                "Barcha chiqimni bir joyga yozish yetarli emas — ularni toifalarga bo'ling: tovar/xomashyo, ish haqi, ijara, kommunal, transport, marketing, boshqa. Shunda oy oxirida qaysi toifa ko'p 'yeyayotganini' aniq ko'rasiz. Ko'pincha eng katta tejash imkoniyati aynan shu tahlildan chiqadi.",
                "Naqd va naqdsiz (plastik karta, o'tkazma) to'lovlarning hammasini yozing. Bugungi kunda operatsiyalarning yarmidan ko'pi naqdsiz — ularni unutish hisobni buzadi.",
              ],
            },
            {
              heading: "Qanday vosita bilan?",
              paragraphs: [
                "Boshlash uchun oddiy daftar ham yetadi. Keyinroq Excel jadvali yoki telefon ilovasi (masalan, xarajat kuzatuvchi ilovalar) qulayroq bo'ladi. Muhimi — vosita emas, muntazamlik: har kuni, kunning oxirida 5 daqiqa ajratib yozib boring.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.finlitYt],
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
          body: [
            {
              heading: "Byudjet — kelajakni oldindan ko'rish",
              paragraphs: [
                "Agar oldingi darsda o'tgan bo'lsangiz — daromad-xarajatni kuzatish o'tmishni ko'rsatadi. Byudjet esa aksincha: kelajakni oldindan rejalashtiradi. 'Kelasi oy qancha pul kiradi va qayerga sarflanadi?' degan savolga oldindan javob berish — byudjetning mohiyati.",
                "Byudjetsiz biznes — xaritasiz sayohat kabi. Kutilmagan xarajat chiqqanda (uskuna buzildi, ijara oshdi) tayyor bo'lmaysiz. Byudjet bu zarbalarni oldindan ko'rish va ularga pul ajratib qo'yish imkonini beradi.",
              ],
            },
            {
              heading: "Qanday tuziladi?",
              paragraphs: [
                "Eng ishonchli usul — o'tgan oyning haqiqiy raqamlaridan boshlash. O'tgan oyda qancha kirim bo'ldi, qayerga qancha ketdi? Shu asosda kelasi oyga reja tuzing va har bir xarajat toifasiga chegara (limit) belgilang. Masalan: marketing — 2 mln, transport — 1 mln.",
                "Oy oxirida rejani haqiqat bilan solishtiring: qayerda oshib ketdingiz, qayerda tejadingiz? Bu farqni tahlil qilish — byudjetning eng qimmatli qismi.",
              ],
            },
            {
              heading: "Mavsumiylikni unutmang",
              paragraphs: [
                "O'zbekistonda ko'p biznes mavsumga bog'liq — masalan, qurilish yozda jonlanadi, kiyim savdosi bayramlar oldidan oshadi. Byudjetda bu tebranishlarni hisobga oling: kuchli oylarda zaxira yig'ing, sust oylarda undan foydalaning.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.finlitYt],
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
          body: [
            {
              heading: "Moliyaviy yostiq nima?",
              paragraphs: [
                "Moliyaviy yostiq — bu biznesingizni kutilmagan zarbadan himoya qiladigan zaxira pul. Savdo birdan pasaysa, asosiy uskuna buzilsa yoki bozorda inqiroz bo'lsa — yostiq sizga panik qilmasdan, muammoni bosqichma-bosqich hal qilish vaqtini beradi.",
                "Yostiqsiz biznes har qanday kichik zarbadan qulashi mumkin. Masalan, bitta yirik mijoz to'lovni kechiktirsa va sizda zaxira bo'lmasa — ish haqi to'lay olmaysiz, kredit olishga majbur bo'lasiz, qarz tuzog'iga tushasiz.",
              ],
            },
            {
              heading: "Qancha bo'lishi kerak?",
              paragraphs: [
                "Umumiy qoida: kamida 3 oylik doimiy xarajatlar. Ya'ni, hech qanday tushum bo'lmasa ham, biznesingiz 3 oy tirik qola olishi kerak. Barqarorroq biznes uchun 6 oylik yostiq yanada xavfsiz.",
                "Uni yig'ish uchun har oylik sof daromadning kamida 10% ini ajrating. Bu pulni alohida, kundalik foydalanmaydigan hisobda saqlang — 'ko'zdan yiroq, ko'ngildan yiroq' tamoyili bu yerda foydali.",
              ],
            },
            {
              heading: "Qachon ishlatiladi?",
              paragraphs: [
                "Yostiq — favqulodda holatlar uchun, kundalik xarajat yoki yangi imkoniyatni moliyalash uchun emas. Undan foydalangan bo'lsangiz, keyingi maqsadingiz — uni imkon qadar tez qayta to'ldirish. To'ldirish rejasini darhol tuzing.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.finlitYt],
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
          body: [
            {
              heading: "Noaniq maqsad — maqsad emas",
              paragraphs: [
                "'Ko'proq pul ishlash', 'biznesni kattalashtirish' — bular istak, maqsad emas. Ularni o'lchab bo'lmaydi, shu sababli ularga erishish yoki erishmaslikni ham bilib bo'lmaydi. Aniq maqsad esa harakatni yo'naltiradi va sizga to'g'ri yo'ldaligingizni tekshirish imkonini beradi.",
              ],
            },
            {
              heading: "SMART tamoyili",
              paragraphs: [
                "Yaxshi maqsad SMART bo'ladi: Specific (aniq), Measurable (o'lchanadigan), Achievable (erishsa bo'ladigan), Relevant (o'rinli), Time-bound (muddatli). Masalan, 'ko'proq sotaman' emas, balki '6 oy ichida oylik savdoni 30 mln so'mdan 45 mln so'mga yetkazaman' — bu SMART maqsad.",
                "Har bir maqsadni muddat bo'yicha ajrating: qisqa (1–3 oy), o'rta (6–12 oy) va uzoq (1–3 yil). Katta maqsadni kichik oylik qadamlarga bo'ling — shunda u qo'rqinchli emas, bajarish mumkin bo'lib ko'rinadi.",
              ],
            },
            {
              heading: "Yozing va kuzating",
              paragraphs: [
                "Yozilmagan maqsad — orzu. Maqsadlaringizni qog'ozga tushiring, ko'rinadigan joyga iling va har oy ularga erishish darajasini tekshiring. Kerak bo'lsa tuzating — bozor o'zgaradi, maqsad ham moslashishi mumkin.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.finlitYt],
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
          body: [
            {
              heading: "Biznes-reja — o'zingiz uchun",
              paragraphs: [
                "Ko'pchilik biznes-rejani faqat bankdan kredit olish uchun tuziladigan qog'oz deb o'ylaydi. Aslida bu — biznesingizning yo'lxaritasi. U sizga qayerga borayotganingizni, buning uchun qancha resurs kerakligini va yo'lda qanday to'siqlar kutayotganini oldindan ko'rsatadi.",
                "Reja tuzish jarayonining o'zi qimmatli: u sizni har bir taxminni raqamlar bilan tekshirishga majbur qiladi. Ko'p 'ajoyib g'oya' aynan biznes-reja tuzayotganda, raqamlar mos kelmagani uchun barbod bo'ladi — bu esa yaxshi, chunki pulingizni saqlab qoladi.",
              ],
            },
            {
              heading: "Asosiy qismlar",
              paragraphs: [
                "To'liq biznes-reja quyidagilarni o'z ichiga oladi: kompaniya tavsifi (nima qilasiz), bozor tahlili (kimga sotasiz, raqobat qanday), mahsulot/xizmat, marketing strategiyasi (qanday sotasiz) va moliyaviy prognoz (raqamlar). Eng muhimi — moliyaviy qism: kirim, xarajat va foyda bashorati.",
              ],
            },
            {
              heading: "Uchta stsenariy hisoblang",
              paragraphs: [
                "Kelajakni aniq bilib bo'lmaydi, shu sababli moliyaviy prognozni uch xil hisoblang: pessimistik (hammasi yomon ketsa), real (ehtimoliy) va optimistik (hammasi yaxshi ketsa). Agar pessimistik stsenariyda ham biznes tirik qolsa — g'oyangiz mustahkam. Rejani yiliga kamida bir marta yangilab turing.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.gsbe, SRC.finlitYt],
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
          body: [
            {
              heading: "Kimga sotayotganingizni bilasizmi?",
              paragraphs: [
                "Muvaffaqiyatli biznes mahsulot bilan emas, mijoz ehtiyoji bilan boshlanadi. 'Hammaga sotaman' degan yondashuv — hech kimga sotmaslikka olib keladi. Aniq mijozni tanlang: uning yoshi, joylashuvi, daromadi va eng muhimi — qanday muammosi bor?",
                "Mijozning 'og'riq nuqtasi' — u hal qilmoqchi bo'lgan muammo. Odamlar mahsulotni emas, muammosining yechimini sotib oladi. Masalan, mijoz parmani emas, devordagi teshikni xohlaydi. Siz qanday muammoni hal qilayotganingizni bilsangiz, marketingingiz ham aniq bo'ladi.",
              ],
            },
            {
              heading: "Eng arzon tadqiqot — suhbat",
              paragraphs: [
                "Bozorni o'rganish uchun katta byudjet shart emas. Eng qimmatli ma'lumot — mijoz bilan bevosita suhbat. 10 ta potentsial mijoz bilan gaplashib, ular nimadan qiynalishini, hozir muammoni qanday hal qilishini so'rang. Bu — bepul va eng ishonchli tadqiqot.",
                "Raqobatchilaringizni ham o'rganing: ular nima taklif qiladi, narxlari qanday, mijozlar ulardan nimadan norozi? Raqobatchining zaif tomoni — sizning imkoniyatingiz.",
              ],
            },
            {
              heading: "Bozor hajmini baholang",
              paragraphs: [
                "Oddiy hisob: potentsial mijozlar soni × o'rtacha xarid summasi = bozor hajmi. Bu raqam biznesingiz o'sish imkoniyatini ko'rsatadi. Agar bozor juda kichik bo'lsa, hatto eng yaxshi mahsulot ham katta daromad keltirmaydi.",
              ],
            },
          ],
          sources: [SRC.gsbe, SRC.gsbeYt, SRC.stat],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'xIsaSmuS1Ck',
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
          body: [
            {
              heading: "Narx — muvozanat masalasi",
              paragraphs: [
                "Narx belgilash — biznesning eng nozik qarorlaridan biri. Juda past narx qo'ysangiz, har bir sotuvdan zarar ko'rasiz yoki foyda deyarli qolmaydi. Juda baland narx qo'ysangiz — mijoz raqobatchiga ketadi. To'g'ri narx — xarajat, foyda va bozor o'rtasidagi muvozanat.",
              ],
            },
            {
              heading: "Avval barcha xarajatni hisoblang",
              paragraphs: [
                "Narxni belgilashdan oldin, mahsulotning haqiqiy tannarxini biling. Bu ikki qismdan iborat: to'g'ri xarajatlar (xomashyo, tovar, ishlab chiqarish) va bilvosita xarajatlar (ijara, ish haqi, kommunal, transport). Ko'p tadbirkor faqat tovar narxini hisoblab, ijara va o'z mehnatini unutadi — natijada 'foyda' aslida zarar bo'lib chiqadi.",
                "Formula oddiy: Narx = Tannarx + Foyda ustamasi. Keyin bu narxni bozor narxi bilan solishtiring. Agar sizning hisobingizdagi narx bozordan yuqori bo'lsa — yo xarajatni kamaytiring, yo qo'shimcha qiymat qo'shing.",
              ],
            },
            {
              heading: "Chegirmaning yashirin narxi",
              paragraphs: [
                "Chegirma jozibali ko'rinadi, lekin xavfli. Agar foyda ustamangiz 30% bo'lsa va siz 10% chegirma bersangiz, bu foydangizning uchdan birini yo'qotish demakdir. Chegirma berishdan oldin, uni qoplash uchun necha dona ko'proq sotish kerakligini hisoblang — ko'pincha bu raqam kutilganidan katta bo'ladi.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.finlitYt],
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
          body: [
            {
              heading: "Foyda bor, lekin pul yo'q — qanday?",
              paragraphs: [
                "Bu ko'p tadbirkorni hayron qoldiradigan holat: hisobda foyda ko'rinadi, lekin qo'lda to'lovlarga pul yetmaydi. Sababi — foyda va pul oqimi (cash flow) boshqa-boshqa narsalar. Foyda hisob-kitob ko'rsatkichi; pul oqimi esa haqiqatan naqd pul harakati.",
                "Misol: siz 50 mln so'mlik tovar sotdingiz — hisobda foyda bor. Lekin mijoz to'lovni 2 oydan keyin qiladi, ijara va ish haqi esa bugun kerak. Foydali biznes aynan shu 'vaqt tafovuti' sababli to'lovlarga qiynalib, hatto bankrot bo'lishi mumkin.",
              ],
            },
            {
              heading: "Pul oqimini boshqarish",
              paragraphs: [
                "Oylik pul oqimi prognozini tuzing: qaysi oy ko'p pul kiradi, qaysi oy kam chiqadi. Debitorlik (sizga qarzlar) va kreditorlik (sizning qarzlaringiz) muddatlarini nazorat qiling. Ideal holat — mijozdan tez olib, yetkazib beruvchiga kechroq to'lash.",
                "Muddatidan oldin to'laganga kichik chegirma taklif qilib, pulni tezroq olishingiz mumkin. Bu foydani biroz kamaytiradi, lekin pul oqimini yaxshilaydi.",
              ],
            },
            {
              heading: "Mavsumiylikka tayyorlaning",
              paragraphs: [
                "Agar biznesingiz mavsumga bog'liq bo'lsa, kuchli oylardagi pulni sust oylarga taqsimlang. Yozda ko'p ishlaydigan biznes qish uchun zaxira yig'ishi kerak — aks holda past davrda pul oqimi salbiy bo'lib qoladi.",
              ],
            },
          ],
          sources: [SRC.gsbe, SRC.gsbeYt, SRC.finlit],
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
          body: [
            {
              heading: "Zararsizlik nuqtasi nima?",
              paragraphs: [
                "Zararsizlik nuqtasi (break-even) — biznesingiz na foyda, na zarar ko'radigan sotuv hajmi. Ya'ni, shu miqdorda sotsangiz, barcha xarajatlaringiz aynan qoplanadi. Bundan kam sotsangiz — zarar; ko'p sotsangiz — foyda. Bu raqamni bilmasdan biznes yuritish — ko'zi yopiq mashina haydashga o'xshaydi.",
              ],
            },
            {
              heading: "Qanday hisoblanadi?",
              paragraphs: [
                "Formula: Zararsizlik nuqtasi = Doimiy xarajatlar ÷ (Bir dona narxi − Bir dona o'zgaruvchan xarajati). Doimiy xarajatlar (ijara, ish haqi) sotuvdan qat'iy nazar to'lanadi. O'zgaruvchan xarajatlar (xomashyo, paket) esa har bir sotilgan donaga bog'liq.",
                "Misol: ijara + ish haqi = oyiga 10 mln so'm (doimiy). Bir mahsulotni 50 000 so'mga sotasiz, uning tannarxi 30 000 so'm. Demak, har donadan 20 000 so'm 'hissa' qoladi. 10 000 000 ÷ 20 000 = 500 dona. Ya'ni oyiga 500 dona sotsangiz — zararsizlik nuqtasiga yetasiz.",
              ],
            },
            {
              heading: "Nima uchun muhim?",
              paragraphs: [
                "Zararsizlik nuqtasidan oshgan har bir sotuv — sof foyda (o'zgaruvchan xarajatni chegirgan holda). Yangi mahsulot yoki xizmat kiritishdan oldin uning zararsizlik nuqtasini hisoblang: erishsa bo'ladiganmi yoki juda baland raqammi? Bu sizni pulni bekorga sarflashdan saqlaydi.",
              ],
            },
          ],
          sources: [SRC.gsbe, SRC.gsbeYt],
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
          body: [
            {
              heading: "Kredit — vosita, maqsad emas",
              paragraphs: [
                "To'g'ri ishlatilgan kredit biznesni o'stiradi, noto'g'ri ishlatilgani esa cho'ktiradi. Farq — maqsadda. Daromad keltiruvchi narsaga (tovar zaxirasi, uskuna, kengayish) olingan kredit — sarmoya. Iste'mol yoki eski qarzni yopish uchun olingan kredit — tuzoq. Shuning uchun avval 'bu kredit menga qancha qo'shimcha daromad keltiradi?' degan savolga javob bering.",
              ],
            },
            {
              heading: "O'zbekistondagi kredit turlari",
              paragraphs: [
                "Mikrokreditlar — odatda 200 mln so'mgacha, garovsiz yoki minimal garov bilan, kichik biznes uchun. Tadbirkorlik kreditlari — katta summalar, biznes-reja va garov asosida. Investitsion kreditlar — uskuna yoki infratuzilma uchun, uzoq muddatli (5–10 yil). Bulardan tashqari davlat imtiyozli dasturlari ham mavjud — past foiz bilan.",
                "Lizing — alohida qulay variant: uskunani darhol sotib olmay, oylik to'lov evaziga ishlatasiz. Boshlang'ich kapital kam bo'lganda kerakli uskunaga ega bo'lishning yaxshi yo'li.",
              ],
            },
            {
              heading: "To'g'ri turni tanlash",
              paragraphs: [
                "Har bir kredit turi o'z maqsadiga mos. Qisqa muddatli tovar zaxirasi uchun uzoq muddatli investitsion kredit olish — noto'g'ri. Ehtiyojingizni aniq belgilang, keyin unga mos mahsulotni tanlang. AI maslahatchimiz sizga eng mos kredit turini tanlashda yordam bera oladi.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.lex, SRC.finlitYt],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'TaIc7nYCCEI',
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
          body: [
            {
              heading: "Foiz — qarzning haqiqiy narxi",
              paragraphs: [
                "Kredit olayotganda e'lon qilingan foiz stavkasi hamma narsani ko'rsatmaydi. Haqiqiy narxni bilish uchun barcha to'lov va komissiyalarni hisobga olish kerak. 'Arzon' ko'ringan kredit yashirin to'lovlar bilan qimmatga tushishi mumkin.",
              ],
            },
            {
              heading: "Nominal va effektiv stavka",
              paragraphs: [
                "Nominal stavka — bankda e'lon qilingan foiz. Effektiv stavka (APR) — barcha komissiya, sug'urta va xizmat haqlarini qo'shgan haqiqiy yillik narx. Kreditlarni solishtirganda aynan APRga qarang, nominalga emas. Ikki bank bir xil nominal stavka e'lon qilib, effektiv stavkasi butunlay boshqacha bo'lishi mumkin.",
                "To'lov usuli ham muhim. 'Kamayuvchi qoldiq' usulida foiz har oy qolgan asosiy qarzga hisoblanadi — bu odatda foydaliroq. 'Annuitet' usulida to'lov teng bo'ladi, lekin boshida foiz ulushi katta.",
              ],
            },
            {
              heading: "Muddatidan oldin to'lash",
              paragraphs: [
                "Agar imkoniyat bo'lsa, kreditni muddatidan oldin to'lash umumiy foizni sezilarli kamaytiradi — chunki foiz vaqtga bog'liq. Shartnoma tuzayotganda muddatidan oldin to'lash uchun jarima yo'qligiga ishonch hosil qiling.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.cbu, SRC.finlitYt],
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
          body: [
            {
              heading: "Bank sizni qanday baholaydi?",
              paragraphs: [
                "Kredit berishdan oldin bank bir necha savolga javob izlaydi: bu odam qarzni qaytara oladimi (daromadi yetarlimi), qaytarmasa nima bo'ladi (garov bormi), ilgari qarzlarini qanday to'lagan (kredit tarixi) va biznesi puxta rejalanganmi (biznes-reja). Bu mezonlarga oldindan tayyorlanish — kredit olish ehtimolini keskin oshiradi.",
              ],
            },
            {
              heading: "Zarur hujjatlar",
              paragraphs: [
                "Odatiy ro'yxat: passport, STIR (soliq to'lovchi identifikatsiya raqami), biznes ro'yxatdan o'tganlik guvohnomasi, soliq deklaratsiyalari va oxirgi 6–12 oylik bank hisobvaraq ko'chirmasi (turnover). Bank hisobingizdagi muntazam aylanma — daromadingizni tasdiqlovchi eng kuchli dalil.",
                "Biznes-reja va moliyaviy prognozni professional tarzda tayyorlang. Garovingiz bo'lsa, uning bozor qiymatini oldindan bilib qo'ying.",
              ],
            },
            {
              heading: "Kredit tarixini oldindan tekshiring",
              paragraphs: [
                "Bank sizning kredit tarixingizni Kredit axborot tahliliy markazi orqali tekshiradi. Siz ham uni oldindan tekshirib, agar xato yoki eski muammo bo'lsa, hal qiling. Kutilmagan 'yomon tarix' bilan ariza rad etilishidan ko'ra, oldindan tayyorlanish afzal.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.cbu, SRC.lex],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'H1WhdrVcIa4',
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
          body: [
            {
              heading: "Kredit — mas'uliyat",
              paragraphs: [
                "Kredit olish oson, uni to'g'ri boshqarish qiyin. Qarzni noto'g'ri boshqarish nafaqat biznesni, balki shaxsiy hayotingizni ham xavf ostiga qo'yadi. Shuning uchun qarzni boshqarish strategiyasi kredit olishdan oldin belgilanishi kerak, keyin emas.",
              ],
            },
            {
              heading: "Oltin qoida: 30–35%",
              paragraphs: [
                "Oylik kredit to'lovi daromadingizning 30–35% idan oshmasligi kerak. Bu chegara sizga boshqa xarajatlar va zaxira uchun ham joy qoldiradi. Agar to'lov daromadning yarmini yeb qo'ysa — bir oy savdo pasaysa, darhol qiyinchilikka tushasiz.",
                "Bir vaqtning o'zida bir necha kredit olishdan saqlaning — bu 'kredit tuzog'i'ning boshlanishi. Muddatli to'lovlarni avtomat to'lovga ulang, shunda kechikish va jarima bo'lmaydi.",
              ],
            },
            {
              heading: "Qiyinchilikni yashirmang",
              paragraphs: [
                "Agar to'lovlar og'irlashayotganini sezsangiz, bankdan qochmang — aksincha, o'zingiz murojaat qiling. Ko'p bank qayta moliyalash (refinancing) yoki to'lov jadvalini yumshatish imkonini beradi. Muammoni erta aytgan mijozga bank ko'proq yordam beradi.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.finlitYt],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'lnM_LTRf1bo',
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
          body: [
            {
              heading: "Kredit tarixi — moliyaviy obro'ingiz",
              paragraphs: [
                "Kredit tarixi — sizning oldingi qarzlarni qanday to'laganingiz haqidagi rasmiy yozuv. Bu — moliyaviy dunyodagi obro'ingiz. Yaxshi tarix kelajakda kredit olishni osonlashtiradi va past foiz stavkasi olishga yordam beradi. Yomon tarix esa eshiklarni yopadi.",
                "O'zbekistonda kredit tarixi Kredit axborot tahliliy markazida saqlanadi va barcha banklar kredit berishdan oldin uni tekshiradi.",
              ],
            },
            {
              heading: "Tarixni nima buzadi va nima tuzatadi?",
              paragraphs: [
                "Har bir kechiktirilgan to'lov tarixni yomonlashtiradi — hatto kichik summa bo'lsa ham. Aksincha, hatto kichik kreditni o'z vaqtida to'lash tarixni yaxshilaydi. Ya'ni tarix o'z-o'zidan yaxshi bo'lmaydi — uni izchil, o'z vaqtidagi to'lovlar bilan quriladi.",
              ],
            },
            {
              heading: "Noldan tarix qurish",
              paragraphs: [
                "Agar sizda umuman kredit tarixi bo'lmasa, bank sizni baholay olmaydi — bu ham to'siq. Tarixni qurish uchun kichik limitli kredit karta yoki kichik kreditdan boshlang va uni intizom bilan to'lang. Tarixda xato ko'rsangiz, uni tuzatish uchun rasmiy ariza berish huquqingiz bor.",
              ],
            },
          ],
          sources: [SRC.finlit, SRC.cbu, SRC.lex],
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
          body: [
            {
              heading: "To'g'ri rejim — katta tejamkorlik",
              paragraphs: [
                "O'zbekistonda tadbirkor bir necha soliq rejimidan birini tanlashi mumkin. To'g'ri tanlov soliq yukini sezilarli kamaytiradi va buxgalteriyani soddalashtiradi. Noto'g'ri tanlov esa ortiqcha soliq yoki keraksiz murakkablikka olib keladi. Shu sababli bu — har bir tadbirkor tushunishi shart bo'lgan mavzu.",
              ],
            },
            {
              heading: "Asosiy rejimlar",
              paragraphs: [
                "Patent — eng sodda: oylik yoki yillik belgilangan to'lov, minimal hisobot. Belgilangan faoliyat turlari uchun mos, daromad miqdoridan qat'iy nazar. Aylanma soliq (soddalashtirilgan tizim) — yillik aylanma 1 mlrd so'mgacha bo'lgan bizneslar uchun, daromadning ma'lum foizi to'lanadi. Umumiy tartib — QQS va foyda solig'i bilan, yirik korxonalar uchun.",
                "Qaysi biri foydali? Bu sizning xarajat tuzilmangizga bog'liq. Xarajatlari kam bo'lgan oddiy savdo uchun ko'pincha patent qulay. Xarajatlari va aylanmasi katta biznes uchun aylanma soliq yoki umumiy tartib hisob-kitob qilinishi kerak.",
              ],
            },
            {
              heading: "Har yili qayta baholang",
              paragraphs: [
                "Soliq rejimini odatda yil boshida o'zgartirish mumkin. Biznesingiz o'sgani sari eng foydali rejim ham o'zgaradi. Shu sababli har yili tahlil qiling. Aniq hisob-kitob uchun soliq.uz rasmiy portalidan yoki AI maslahatchimizdan foydalaning — soliq stavkalari vaqti-vaqti bilan yangilanadi.",
              ],
            },
          ],
          sources: [SRC.soliq, SRC.lex, SRC.finlit],
          channel: 'Finlit.uz',
          channelUrl: 'https://www.youtube.com/channel/UCNs4B8FabHPZVNwOkgWnthA',
          videoId: 'M4Ti92ufsy4',
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
          body: [
            {
              heading: "Bilmaslik — jarimadan himoya emas",
              paragraphs: [
                "Soliq to'lamaslik yoki 'bilmay' xato qilish javobgarlikdan ozod qilmaydi — aksincha, jarima keltiradi. Shu sababli har bir tadbirkor o'z biznesiga tegishli asosiy soliqlarni bilishi shart. Bu murakkab ko'rinsa-da, aslida bir necha asosiy tur bilan cheklanadi.",
              ],
            },
            {
              heading: "Asosiy soliq turlari",
              paragraphs: [
                "Yakka tartibdagi tadbirkor (YaTT) va yuridik shaxs (masalan, MChJ) uchun soliqlar farq qiladi. Umuman olganda ular: daromad yoki foyda solig'i, ish haqiga bog'liq to'lovlar (jismoniy shaxs daromad solig'i va ijtimoiy sug'urta), hamda aylanma 1 mlrd so'mdan oshsa — qo'shilgan qiymat solig'i (QQS). Mulk va yer soliqlari hududiy organlar tomonidan belgilanadi.",
                "Aniq stavkalar vaqti-vaqti bilan yangilanadi, shu sababli bu darsdagi tafsilotlarni yakuniy haqiqat deb qabul qilmang — har doim soliq.uz rasmiy portalidan joriy stavkalarni tekshiring yoki AI maslahatchimizdan so'rang.",
              ],
            },
            {
              heading: "Imtiyozlarni o'tkazib yubormang",
              paragraphs: [
                "O'zbekistonda ayrim toifalar uchun soliq imtiyozlari mavjud: nogironligi bor tadbirkorlar, yangi tashkil etilgan korxonalar, ayrim sanoat va hududiy zonalar. Ko'p tadbirkor o'ziga tegishli imtiyozdan xabarsizligi tufayli ortiqcha soliq to'laydi. O'z toifangizga mos imtiyozlarni aniqlab oling.",
              ],
            },
          ],
          sources: [SRC.soliq, SRC.lex],
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
          body: [
            {
              heading: "Buxgalteriya nima uchun kerak?",
              paragraphs: [
                "Buxgalteriya hisobi — barcha moliyaviy operatsiyalarni tartibli yozib borish tizimi. U faqat soliq uchun emas: sizga biznesning haqiqiy holatini ko'rish, to'g'ri qaror qabul qilish va nizolarda o'zingizni himoya qilish imkonini beradi. Oddiy daftardan boshlanib, maxsus dasturlargacha kengayishi mumkin.",
              ],
            },
            {
              heading: "Asosiy tamoyillar",
              paragraphs: [
                "Har bir operatsiyani hujjat asosida yozing: kvitansiya, shartnoma, faktura. Hujjatsiz yozuv — ishonchsiz yozuv. Aktiv (biznesda nima bor) va passiv (nima qarz) balansini muntazam tekshiring. Muhim xavfsizlik qoidasi: kassa (pulni qabul qiluvchi) va buxgalter (hisobni yurituvchi) vazifalarini imkon qadar ajrating — bu nazoratni kuchaytiradi va suiiste'molning oldini oladi.",
              ],
            },
            {
              heading: "Vositalar va hujjatlarni saqlash",
              paragraphs: [
                "Sodda buxgalteriya uchun Excel yetarli; keyinroq 1C yoki soliq.uz platformasidagi elektron xizmatlar qulayroq. Qaysi vositani tanlasangiz ham, barcha buxgalteriya va soliq hujjatlarini kamida 5 yil saqlang — soliq tekshiruvi yoki nizo yuzaga kelsa, ular zarur bo'ladi.",
              ],
            },
          ],
          sources: [SRC.soliq, SRC.finlit, SRC.lex],
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
          body: [
            {
              heading: "Uchta asosiy hisobot",
              paragraphs: [
                "Moliyaviy hisobotlar — biznesingizning 'tibbiy tekshiruvi'. Uchta asosiy hisobot bor. Daromad-zarar hisoboti (P&L): ma'lum davrda daromad minus xarajat teng foyda yoki zarar. Balans: aktivlar teng passivlar plus kapital — biznesning muayyan paytdagi holati. Pul oqimi hisoboti: haqiqiy naqd pulning kirim-chiqimi.",
              ],
            },
            {
              heading: "Har biri nimani ko'rsatadi?",
              paragraphs: [
                "P&L — biznes foyda keltiryaptimi yoki yo'qmi, degan savolga javob beradi. Balans — biznes moliyaviy jihatdan barqarormi, qancha qarzi bor, degan savolga. Pul oqimi hisoboti — qo'lda to'lovlarga yetarli pul bormi, degan savolga. Uchalasi birga biznesning to'liq manzarasini beradi; faqat bittasiga qarab xulosa chiqarish xato.",
              ],
            },
            {
              heading: "Muntazam ko'rib chiqing",
              paragraphs: [
                "Moliyaviy hisobotlarni yiliga bir marta emas, kamida har chorakda ko'rib chiqish tavsiya etiladi. Bu sizga muammoni erta payqash imkonini beradi. Bundan tashqari, kredit olayotganda banklar, sarmoya izlaganda investorlar va tekshiruvda soliq organlari bu hisobotlarni talab qiladi — tayyor bo'lgan biznes ustunlikka ega.",
              ],
            },
          ],
          sources: [SRC.soliq, SRC.finlit, SRC.gsbe],
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
          body: [
            {
              heading: "Voronka nima?",
              paragraphs: [
                "Sotuv voronkasi — potentsial mijozning birinchi tanishuvdan xaridgacha bosib o'tadigan yo'li. U 'voronka' deb ataladi, chunki har bosqichda odamlar kamayadi: ko'p kishi mahsulotni ko'radi, kamrog'i qiziqadi, undan ozrog'i sotib oladi. Bu yo'lni tushunish — savdoni oshirishning kaliti.",
                "Odatiy bosqichlar: Xabardorlik (bilib qoldi) → Qiziqish → Ko'rib chiqish (taqqoslaydi) → Qaror → Xarid. Ba'zan bunga sodiqlik (takroriy xarid) bosqichi ham qo'shiladi.",
              ],
            },
            {
              heading: "Qayerda mijoz yo'qolyapti?",
              paragraphs: [
                "Voronkaning kuchi — o'lchashda. Har bosqichda qancha odam keyingisiga o'tayotganini sanang. Masalan, 100 kishi do'konga kirsa, 40 tasi narx so'rasa, 10 tasi sotib olsa — konversiya darajangiz aniq bo'ladi. Eng ko'p 'tushish' qayerda bo'layotganini toping va aynan o'sha bosqichni yaxshilang. Ko'pincha kichik tuzatish katta natija beradi.",
              ],
            },
            {
              heading: "Mijoz bazangizni yuriting",
              paragraphs: [
                "Voronkani kuzatish uchun murakkab tizim shart emas — hatto oddiy daftar yoki Excel ham CRM vazifasini bajaradi. Muhimi — har bir mijoz va uning bosqichini yozib borish. Xarid tugagach voronka tugamaydi: mijozni ushlab turish va takroriy xaridga qaytarish ham strategik muhim.",
              ],
            },
          ],
          sources: [SRC.mfaktorYt, SRC.gsbe],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'T6SDZwAtbmk',
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
          body: [
            {
              heading: "Eski mijoz — oltin mijoz",
              paragraphs: [
                "Tadqiqotlar shuni ko'rsatadiki, mavjud mijozni saqlab qolish yangi mijoz jalb qilishdan 5–7 barobar arzon. Yangi mijoz uchun reklama, ishonch qozonish, tushuntirish kerak; eski mijoz esa sizni allaqachon biladi va ishonadi. Shu sababli mijoz munosabatlari — uzoq muddatli muvaffaqiyatning asosi.",
              ],
            },
            {
              heading: "Ishonchni qanday quriladi?",
              paragraphs: [
                "Har bir mijozni imkon qadar ism bilan biling — shaxsiy munosabat kuchli ta'sir qiladi. Shikoyatni tahdid emas, imkoniyat deb qarang: tez va adolatli hal qilingan shikoyat mijozni yanada sodiq qiladi. Va'da qilingan muddatda yetkazib berish — oddiy ko'rinsa-da, eng kuchli marketing: u so'zsiz ishonch quradi.",
                "Mijozdan muntazam fikr-mulohaza so'rang. Bu nafaqat mahsulotni yaxshilaydi, balki mijozga 'fikrim muhim' degan tuyg'u beradi.",
              ],
            },
            {
              heading: "E'tirozlar bilan ishlash",
              paragraphs: [
                "'Qimmat', 'o'ylab ko'raman', 'keyinroq' — bu e'tirozlar sotuvning tabiiy qismi, rad javob emas. Ko'p sotuvchi aynan shu bosqichda taslim bo'ladi. Yaxshi sotuvchi esa e'tiroz ortidagi haqiqiy sababni tushunib, unga javob beradi. Ushbu darsning videosida e'tirozlar bilan ishlash amaliy misollar bilan ko'rsatilgan.",
              ],
            },
          ],
          sources: [SRC.mfaktorYt, SRC.gsbe],
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
          body: [
            {
              heading: "Hamma joyda emas — to'g'ri joyda bo'ling",
              paragraphs: [
                "Marketing — mahsulotingiz haqida to'g'ri odamlarga xabar yetkazish. Ko'p tadbirkor 'hamma kanalda bo'lish kerak' deb o'ylab, kuch va pulini sochib yuboradi. Aslida muhimi — sizning mijozingiz qayerda bo'lsa, o'sha joyda faol bo'lish. Bir kuchli kanal o'nta zaif kanaldan yaxshiroq.",
              ],
            },
            {
              heading: "O'zbekistonda qaysi kanallar ishlaydi?",
              paragraphs: [
                "Ijtimoiy tarmoqlar (Instagram, Telegram) — O'zbek auditoriyasi uchun eng samarali va nisbatan arzon kanal. Og'zaki marketing (word of mouth) — eng ishonchli va bepul: u sifatli xizmatdan tug'iladi. Joylashuvga bog'liq bizneslar uchun mahalliy reklama, B2B bizneslar uchun esa shaxsiy muloqot va namoyish ko'pincha ommaviy reklamadan samaraliroq.",
              ],
            },
            {
              heading: "ROI — har bir so'mni o'lchang",
              paragraphs: [
                "Marketingda eng katta xato — natijani o'lchamaslik. Har bir kanalga sarflangan pulning qaytimini (ROI) hisoblang: (Kanaldan kelgan daromad − Kanal xarajati) ÷ Kanal xarajati. Qaysi kanal ko'p daromad keltirsa — unga ko'proq sarmoya kiriting, ishlamayotganini to'xtating. Bu oddiy intizom marketing byudjetingizni bir necha barobar samaraliroq qiladi.",
              ],
            },
          ],
          sources: [SRC.mfaktorYt, SRC.gsbe],
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
          body: [
            {
              heading: "Narx — bu ham xabar",
              paragraphs: [
                "Narx faqat xarajatni qoplaydigan raqam emas — u mijozga mahsulot haqida xabar beradi. Juda past narx 'sifatsiz' degan taassurot uyg'otishi, oqilona yuqori narx esa 'sifatli, ishonchli' degan signal berishi mumkin. Shuning uchun narx marketing strategiyasining ajralmas qismidir.",
              ],
            },
            {
              heading: "Narx strategiyalari",
              paragraphs: [
                "Qiymat asosli narxlash — mijoz uchun yaratgan qiymatga qarab narx qo'yish (nafaqat tannarxga). Psixologik narxlash — 50 000 o'rniga 49 900 so'm: farq kichik, lekin idrok boshqacha. Paket taklif — bir necha mahsulotni birlashtirib, alohidadan arzonroqqa taklif qilish. Premium narxlash — yuqori sifat va xizmat evaziga yuqori narx.",
                "Dinamik narxlash — mavsum va talabga qarab narxni o'zgartirish. Masalan, talab yuqori davrda narx biroz oshadi, sust davrda chegirma bilan sotuv rag'batlantiriladi.",
              ],
            },
            {
              heading: "Qaysi birini tanlash?",
              paragraphs: [
                "Bitta 'to'g'ri' strategiya yo'q — u mahsulotingiz, mijoz segmentingiz va raqobat holatiga bog'liq. Ko'pincha bir biznes turli mahsulotlar uchun turli strategiyalarni birlashtiradi. Muhimi — narxni tasodifan emas, ongli ravishda tanlash va natijani kuzatib borish.",
              ],
            },
          ],
          sources: [SRC.mfaktorYt, SRC.finlit],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'HqLQP-uVxLY',
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
          body: [
            {
              heading: "Har biznes bosqichlardan o'tadi",
              paragraphs: [
                "Biznes tirik organizm kabi rivojlanadi va har bosqichda boshqacha muammoga duch keladi. To'rt asosiy bosqich: start-up (boshlanish), o'sish, yetuklik va kengayish. Bir bosqichda ishlagan yechim boshqasida ishlamaydi — shu sababli qaysi bosqichda ekaningizni bilish muhim.",
              ],
            },
            {
              heading: "Har bosqichning asosiy vazifasi",
              paragraphs: [
                "Start-up bosqichida asosiy vazifa — bozorda o'z o'rningizni topish va birinchi barqaror daromadga erishish. O'sish bosqichida — tizim va jarayonlar qurish, toki biznes faqat sizga bog'liq bo'lib qolmasin. Yetuklikda operatsiyalar barqarorlashadi, yangi mahsulot yoki bozor qidiriladi. Kengayishda — franchayzing, filiallar yoki yangi hududlar orqali miqyoslashtirish.",
              ],
            },
            {
              heading: "Liderlik ham o'zgaradi",
              paragraphs: [
                "Ko'p asoschi bir tuzoqqa tushadi: biznes o'sadi, lekin ular hali ham 'hamma narsani o'zim qilaman' deb ishlaydi. Natijada asoschi biznesning 'bo'g'zi' bo'lib qoladi — hamma qaror unga bog'liq. O'sish uchun liderlik uslubi 'o'zim qilaman'dan 'tizim va jamoa orqali qilaman'ga o'tishi shart.",
              ],
            },
          ],
          sources: [SRC.gsbe, SRC.gsbeYt],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: '41s2x3d0ggs',
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
          body: [
            {
              heading: "Yolg'iz uzoqqa bora olmaysiz",
              paragraphs: [
                "Biznes ma'lum darajaga yetgach, bir kishi hamma ishni bajara olmaydi. O'sishning asosiy to'sig'i ko'pincha pul emas, balki to'g'ri jamoa yo'qligidir. Xodim yollash — xarajat emas, sarmoya: to'g'ri odam biznesga o'zi olayotgan maoshidan ko'proq qiymat qo'shadi.",
              ],
            },
            {
              heading: "Birinchi xodim — zaif tomoningizni to'ldirsin",
              paragraphs: [
                "Birinchi yollanadigan odam sizning eng zaif tomoningizni to'ldirishi kerak. Agar siz texnik mutaxassis bo'lsangiz-u, savdo qiyin bo'lsa — savdo insonini yollang. Yollashdan oldin lavozim tavsifini (job description) yozing: bu odam aniq nima qilishini oldindan belgilang, aks holda noto'g'ri odam yollash xavfi katta.",
              ],
            },
            {
              heading: "Boshqarish va rag'batlantirish",
              paragraphs: [
                "Xodimni faqat maosh ushlab turmaydi — o'sish imkoniyati, hurmat va yaxshi muhit ham muhim. Haftalik qisqa (15 daqiqalik) uchrashuv muammolarni erta aniqlashga yordam beradi. Har bir xodimning kuchli tomonidan foydalaning va zaif tomonini tizim yoki boshqa xodim bilan yoping — hech kim hamma narsada zo'r bo'lmaydi.",
              ],
            },
          ],
          sources: [SRC.gsbe, SRC.gsbeYt],
          channel: "Biznes va tadbirkorlik oliy maktabi",
          channelUrl: 'https://www.youtube.com/@gsbeuz',
          videoId: 'txdn0SnNM8Y',
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
          body: [
            {
              heading: "O'sish emas — miqyoslashtirish",
              paragraphs: [
                "Oddiy o'sish — ko'proq xodim, ko'proq xarajat evaziga ko'proq daromad. Miqyoslashtirish (scaling) esa boshqacha: resurslarni proporsional oshirmay, daromad va foydani ko'paytirish. Ya'ni sotuvingiz ikki barobar oshsa-yu, xarajatingiz atigi 20% oshsa — bu miqyoslashtirish. Bunga tizim, texnologiya va to'g'ri jamoa orqali erishiladi.",
              ],
            },
            {
              heading: "Avval standartlashtiring, keyin avtomatlang",
              paragraphs: [
                "Tartibsiz jarayonni avtomatlashtirish — tartibsizlikni tezlashtirish. Shu sababli avval har bir jarayonni yozib, standartlashtiring: 'buni qanday qilamiz' aniq bo'lsin. Keyin texnologiyadan foydalaning — onlayn buyurtma, to'lov tizimlari, inventarizatsiya dasturlari. Standartlashtirilgan jarayon yangi xodimni tez o'rgatish imkonini ham beradi.",
                "Miqyoslashtirish kapital talab qiladi. Uni qayerdan olishni (o'z foydangiz, kredit yoki investor) oldindan rejalashtiring — pul tugab qolgan o'rtada to'xtash xavflidir.",
              ],
            },
            {
              heading: "Sifatni saqlang, yaqindan boshlang",
              paragraphs: [
                "Miqyoslashtirishning eng qiyin qismi — o'sish paytida sifat va xizmat darajasini saqlash. Ko'p biznes tez o'sib, sifatni yo'qotib, mijozdan ayriladi. Yangi bozorlarni yaqindan boshlang: avval O'zbekistonning boshqa viloyatlari, keyin qo'shni davlatlar (Qozog'iston, Qirg'iziston). B2B bozorimizda yangi hududlarni o'rganib ko'rishingiz mumkin.",
              ],
            },
          ],
          sources: [SRC.mfaktorYt, SRC.gsbe],
          channel: 'MFaktor Biznes Maktabi',
          channelUrl: 'https://www.youtube.com/@MfaktorBiznesMaktabi',
          videoId: 'bYyShUzDb_g',
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
          body: [
            {
              heading: "Krizis — 'agar' emas, 'qachon'",
              paragraphs: [
                "Har qanday biznes ertami-kechmi krizisga duch keladi: iqtisodiy pasayish, kuchli raqobatchi, tovar yetkazib berish uzilishi yoki kutilmagan voqea. Savol krizis bo'ladimi emas, qachon bo'ladi. Shuning uchun uni oldindan rejalashtirish — panik paytida emas, sovuqqonlik bilan — uni engishni ancha osonlashtiradi.",
              ],
            },
            {
              heading: "Krizis rejasini oldindan tuzing",
              paragraphs: [
                "'Agar X bo'lsa, biz Y qilamiz' shaklida stsenariylar tayyorlang. Masalan: 'Agar savdo 30% pasaysa, avval qaysi xarajatlarni qisqartiramiz?' Buning uchun xarajatlarni ikkiga ajrating: kesilishi mumkin bo'lganlar (o'zgaruvchan — marketing, qo'shimcha xizmatlar) va kesib bo'lmaydiganlar (doimiy — ijara, asosiy ish haqi).",
                "Krizisda birinchi himoya qilinadigan narsa — naqd pul. Pul tugasa, hamma narsa to'xtaydi. Shu sababli krizis boshlanishi bilan xarajatni qisqartiring va pul oqimini nazoratga oling.",
              ],
            },
            {
              heading: "Ochiqlik va imkoniyat",
              paragraphs: [
                "Krizisda mijozlaringiz va yetkazib beruvchilaringiz bilan ochiq muloqotda bo'ling — yashirish ishonchni buzadi. Va shuni unutmang: krizis innovatsiyaga majburlaydi. Ko'p raqobatchi qo'rquvdan to'xtab qolganda, tayyor va epchil biznes aynan shu paytda oldinga chiqishi mumkin.",
              ],
            },
          ],
          sources: [SRC.gsbe, SRC.gsbeYt, SRC.finlit],
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
          body: [
            {
              heading: "Bozor to'xtab turmaydi",
              paragraphs: [
                "Bugun ishlagan strategiya ertaga ishlamasligi mumkin — bozor doimo o'zgaradi: raqobatchilar, iste'molchi didi, texnologiya va qonunlar. Doimiy bozor monitoringi sizni o'zgarishlarga tayyorlaydi va boshqalar ko'rmagan imkoniyatlarni payqash imkonini beradi. Tahlilsiz biznes — orqaga qaramay yo'l bosayotgan haydovchi kabi.",
              ],
            },
            {
              heading: "SWOT — sodda, kuchli vosita",
              paragraphs: [
                "SWOT tahlili to'rt tomonni ko'radi: Kuchli tomonlar (Strengths), Zaif tomonlar (Weaknesses), Imkoniyatlar (Opportunities), Tahdidlar (Threats). Birinchi ikkitasi ichki (siz nazorat qilasiz), oxirgi ikkitasi tashqi (bozordan keladi). Uni yiliga kamida bir marta o'tkazing — bu biznesingiz holatini bir sahifada ko'rsatadi.",
                "Raqobatchilar narxi va mahsulotlarini muntazam kuzating; iste'molchi tendentsiyalarini ijtimoiy tarmoq va so'rovnomalar orqali o'rganing; davlat siyosati va qonunlarni nazoratda tuting — ular biznesingizga bevosita ta'sir qiladi.",
              ],
            },
            {
              heading: "Qaror — dalilga asoslansin",
              paragraphs: [
                "Bozor tahlili natijalarini yozib boring va qarorlarni his-tuyg'uga emas, dalilga asoslang. Bizning B2B bozorimizdagi real narx ma'lumotlari va AI tahlil vositalari sizga bozordagi holatni raqamlar bilan ko'rish imkonini beradi.",
              ],
            },
          ],
          sources: [SRC.mfaktorYt, SRC.stat, SRC.gsbe],
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

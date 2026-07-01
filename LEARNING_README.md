# O'quv markazi — Content Model & Maintenance Guide

## How to add real video IDs

Open `src/data/learningContent.ts` and find the lesson by `id`. Replace the `"TODO_VIDEO_ID"` string with the 11-character YouTube video ID (found in the video URL after `v=`).

Example:
```ts
videoId: 'dQw4w9WgXcQ',  // youtube.com/watch?v=dQw4w9WgXcQ
```

The embed uses `https://www.youtube-nocookie.com/embed/{videoId}` (privacy-enhanced mode). Never put a full URL — only the 11-character ID.

---

## Lessons by channel — paste video IDs here

### Finlit.uz (`https://www.youtube.com/@finlituz`)

| Lesson ID | Title                                        | videoId (fill in) |
|-----------|----------------------------------------------|-------------------|
| l1-1      | Shaxsiy va biznes moliyasini ajratish        | TODO_VIDEO_ID     |
| l1-2      | Daromad va xarajatlarni kuzatish             | TODO_VIDEO_ID     |
| l1-3      | Byudjet tuzish                               | TODO_VIDEO_ID     |
| l1-4      | Jamg'arma va moliyaviy yostiq                | TODO_VIDEO_ID     |
| l1-5      | Moliyaviy maqsad qo'yish                    | TODO_VIDEO_ID     |
| l2-1      | Biznes-reja nima va nega kerak               | TODO_VIDEO_ID     |
| l2-3      | Xarajat tahlili va narx belgilash            | TODO_VIDEO_ID     |
| l3-1      | Kredit turlari                               | TODO_VIDEO_ID     |
| l3-2      | Foiz stavkasi va uni hisoblash               | TODO_VIDEO_ID     |
| l3-3      | Kreditga tayyorgarlik                        | TODO_VIDEO_ID     |
| l3-4      | Qarzni boshqarish                            | TODO_VIDEO_ID     |
| l3-5      | Kredit tarixi                                | TODO_VIDEO_ID     |
| l4-1      | O'zbekistonda kichik biznes uchun soliq rejimlari | TODO_VIDEO_ID |
| l4-3      | Buxgalteriya asoslari                        | TODO_VIDEO_ID     |

### Biznes va tadbirkorlik oliy maktabi (GSBE) (`https://www.youtube.com/@gsbeuz`)

| Lesson ID | Title                                        | videoId (fill in) |
|-----------|----------------------------------------------|-------------------|
| l2-2      | Bozor va mijozni tushunish                   | TODO_VIDEO_ID     |
| l2-4      | Pul oqimi (Cash Flow)                        | TODO_VIDEO_ID     |
| l2-5      | Zararsizlik nuqtasi (Break-even)             | TODO_VIDEO_ID     |
| l6-1      | Biznes rivojlanish bosqichlari               | TODO_VIDEO_ID     |
| l6-2      | Jamoa va boshqaruv                           | TODO_VIDEO_ID     |
| l6-4      | Krizisni boshqarish                          | TODO_VIDEO_ID     |

### MFaktor Biznes Maktabi (`https://www.youtube.com/@mfaktorbiznes`)

| Lesson ID | Title                                        | videoId (fill in) |
|-----------|----------------------------------------------|-------------------|
| l4-2      | Asosiy soliq turlari                         | TODO_VIDEO_ID     |
| l4-4      | Moliyaviy hisobotlar                         | TODO_VIDEO_ID     |
| l5-1      | Sotuv voronkasi                              | TODO_VIDEO_ID     |
| l5-2      | Mijoz bilan ishlash                          | TODO_VIDEO_ID     |
| l5-3      | Marketing kanallari                          | TODO_VIDEO_ID     |
| l5-4      | Narx strategiyasi                            | TODO_VIDEO_ID     |
| l6-3      | Miqyoslashtirish (Scaling)                   | TODO_VIDEO_ID     |
| l6-5      | Bozor tahlili                                | TODO_VIDEO_ID     |

---

## Content model

```
Track
└── Level[]  (id: 1–6, title, subtitle, icon, accentColor)
    ├── Lesson[]
    │   ├── id           — unique, e.g. "l1-1"
    │   ├── title        — Uzbek (Latin)
    │   ├── summary      — 2–3 sentence Uzbek summary
    │   ├── keyTakeaways — string[] (3–5 items)
    │   ├── channel      — one of the 3 approved channels
    │   ├── channelUrl   — YouTube channel URL
    │   ├── videoId      — 11-char YouTube ID or "TODO_VIDEO_ID"
    │   ├── durationNote — e.g. "~12 daqiqa"
    │   ├── xp           — awarded on completion (default: 50)
    │   ├── toolLink?    — optional deep link to platform tool
    │   └── toolCta?     — CTA label for the tool link
    └── Quiz
        └── QuizQuestion[]
            ├── id
            ├── prompt       — Uzbek question
            ├── type         — "single-choice" | "true-false"
            ├── options[]    — Uzbek answer options
            ├── correctIndex — 0-based index of correct option
            └── explanation  — Uzbek explanation shown after answering
```

## How to add a new lesson

1. Open `src/data/learningContent.ts`
2. Find the level in `track.levels`
3. Push a new object to `level.lessons` following the `Lesson` interface
4. Assign a unique `id` (e.g. `l2-6`)
5. Set `videoId: 'TODO_VIDEO_ID'` until the real ID is available

## How to add a new level

1. Push a new object to `track.levels` following the `Level` interface
2. Give it `id: 7` (or next sequential number)
3. Add lessons and quiz questions
4. Add an `accentColor` key to the `ACCENT` map in `src/pages/Learning.tsx`
5. Level 1 is always unlocked; levels 2–N unlock when the previous level's quiz passes ≥70%

## Progress persistence

Progress is stored in `localStorage` under the key `oqitish_progress_v1`.

The abstraction is in `src/lib/learnProgress.ts`. To swap for Supabase persistence, replace the `load()` and `save()` functions in that file — the `completeLesson()`, `saveQuizScore()` and hook-based API remain unchanged.

## Scoring

- Each lesson completion: **+50 XP**
- Each quiz pass (≥70%): **+100 XP** (once per level)
- Quiz re-takes store the best score only; XP is not awarded again

## Routes

| Path                          | Component      |
|-------------------------------|----------------|
| `/oqitish`                    | `Learning`     |
| `/oqitish/dars/:lessonId`     | `LessonView`   |
| `/oqitish/test/:levelId`      | `QuizPage`     |

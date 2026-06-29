# Claude Code Checkpoints

Paste each prompt into Claude Code in order.
**Never advance until the "Done when" test passes.**

---

## CP1 — Scaffold & API wiring

**Paste this into Claude Code:**
```
Read CLAUDE.md first. Then:

1. Set up the Vite + React + TypeScript project using the existing package.json.
   Install all dependencies.

2. Create src/main.tsx and src/App.tsx with react-router-dom v6 routing:
   - "/" → Landing page (placeholder)
   - "/interview" → Interview page (placeholder)
   - "/result" → Result page (placeholder)

3. Create api/generate.ts as a Vercel serverless function that:
   - Accepts POST with body: { answers: Array<{question: string, answer: string}> }
   - Reads ANTHROPIC_API_KEY from process.env
   - Calls the Anthropic Messages API using @anthropic-ai/sdk
   - Uses the system prompt from docs/system-prompt.md (read the file and hardcode it in the function)
   - Enables extended thinking: { type: "enabled", budget_tokens: 8000 }
   - Model: "claude-sonnet-4-6"
   - Returns the raw JSON string from Claude as the response body
   - Has proper CORS headers for local dev

4. Create .env.local from .env.example (user fills in their key)

5. Add a simple /api/health GET endpoint that returns { status: "ok" }
```

**Done when:**
- `npm run dev` shows all 3 routes
- `curl -X GET http://localhost:3001/api/health` returns `{"status":"ok"}`
- TypeScript compiles with no errors: `npm run typecheck`

---

## CP2 — Interview flow

**Paste this into Claude Code:**
```
Read CLAUDE.md. Now build the Interview flow:

1. Create src/lib/questions.ts:
   Export an array of 10 questions as:
   type Question = { id: number; text: string; placeholder: string; }
   Questions (in Uzbek, Latin script):
   1. "Biznesingiz nima?" / "Masalan: Novvoyxona, kiyim tikish ustaxonasi..."
   2. "Qaysi viloyatda joylashgan?" / "Masalan: Jizzax, Toshkent, Farg'ona..."
   3. "Necha yildan beri ishlaysiz?" / "Masalan: 2 yil, 6 oy..."
   4. "Oylik tushum taxminan qancha (so'mda)?" / "Masalan: 15,000,000 so'm"
   5. "Kredit nimaga kerak?" / "Masalan: Uskunalar sotib olish, do'kon kengaytirish..."
   6. "Qancha kredit kerak va qancha muddatga?" / "Masalan: 50 mln so'm, 24 oy"
   7. "Garov bera olasizmi? (ko'chmas mulk, uskuna yoki boshqa)" / "Masalan: Uy-joy, avtomobil, yoki yo'q"
   8. "Necha nafar xodim bor?" / "Masalan: 3 nafar, yoki faqat o'zim"
   9. "Asosiy raqiblaringiz kimlar?" / "Masalan: Yonidagi do'konlar, bozor sotuvchilari"
   10. "Keyingi 2 yilda rejangiz nima?" / "Masalan: Yangi xona ochish, eksport qilish..."

2. Create src/stores/appStore.ts (Zustand):
   State:
   - answers: Array<{question: string, answer: string}>
   - result: AIResult | null  (import type from schema.ts — create a placeholder type for now)
   - status: 'idle' | 'interviewing' | 'loading' | 'done' | 'error'
   - errorMessage: string
   Actions:
   - setAnswer(index: number, answer: string)
   - setResult(result: AIResult)
   - setStatus(status)
   - reset()

3. Create src/pages/Interview.tsx:
   - Shows one question at a time in a chat-style layout
   - User types into a textarea (NOT a form element — use onChange + onKeyDown)
   - "Keyingi" (Next) button advances; "Yuborish" (Submit) on the last question
   - Shows a progress bar (e.g. "3 / 10")
   - Stores each answer via setAnswer()
   - On Submit: sets status to 'loading', calls POST /api/generate with answers,
     parses response, calls setResult(), navigates to /result
   - On error: shows Uzbek error message, allows retry
   - Typing Enter (without Shift) should advance to next / submit

4. Style it with Tailwind: dark background (#0f172a), clean card for the question,
   prominent progress indicator. Professional but warm — this is someone's livelihood.
```

**Done when:**
- You can click through all 10 questions, answers are saved in Zustand
- Submit fires a real POST to /api/generate (check Network tab)
- If API is unavailable, a friendly Uzbek error message appears (not a crash)

---

## CP3 — AI result rendering

**Paste this into Claude Code:**
```
Read CLAUDE.md. Now build the schema validation and Result page:

1. Create src/lib/schema.ts with a Zod schema matching docs/schema.md exactly.
   Export: FactsSchema, BusinessPlanSchema, AIResultSchema, and the TypeScript type AIResult.

2. Update src/pages/Interview.tsx: after receiving the API response, parse and validate
   with AIResultSchema.parse(). On ZodError, show: "Natija to'g'ri kelmadi. Qayta urinib ko'ring."

3. Create src/pages/Result.tsx with these sections:
   a) Header: business_type + region, score band badge (placeholder — score computed in CP4)
   b) Business Plan accordion: 5 sections (executive_summary, market_analysis,
      marketing_production_plan, financial_forecast, risk_assessment), each expandable
   c) Bank Recommendations: 2–3 cards showing bank name, why_fit, likely_requirements
   d) Readiness Checklist: numbered list of checklist items with checkboxes (visual only)
   e) "PDF yuklash" button (wired in CP5)
   f) "Yangi reja" button that calls reset() and navigates to /interview

4. Create src/lib/demoFixture.ts — a hard-coded AIResult for this scenario:
   "Jizzax viloyatida novvoyxona. 3 yildan beri ishlamoqda. Oylik tushum 18,000,000 so'm.
    50,000,000 so'm kredit kerak, 24 oyga. Garov: 2 xonali uy. 4 xodim."
   Fill ALL fields with realistic Uzbek content.

5. In src/App.tsx: if URL has ?demo=1, skip the interview and load demoFixture directly
   into the store, then redirect to /result.
```

**Done when:**
- Full flow works: Landing → Interview → (real API call) → Result
- `/?demo=1` navigates straight to /result with full fixture data rendered
- Zod validation catches malformed JSON gracefully
- All 5 plan sections render with real Uzbek text

---

## CP4 — Scoring engine + scorecard UI

**Paste this into Claude Code:**
```
Read CLAUDE.md and docs/scoring.md carefully. Now implement the scoring system:

1. Create src/lib/scoring.ts:
   - Export function computeScore(facts: Facts): ScoreResult
   - Implement ALL 6 components from docs/scoring.md exactly
   - The function is pure — no side effects, no API calls
   - Export the ScoreResult type

2. Create src/components/result/ScoreGauge.tsx:
   - Uses Recharts RadialBarChart or PieChart to show a gauge/arc
   - Displays the total score (big number) in the center
   - Color matches the band: red / amber / green
   - Animated fill on mount

3. Create src/components/result/ScoreBreakdown.tsx:
   - Shows each of the 6 components as a horizontal bar
   - Label | filled bar (proportional to points/max) | "X / Y pts" | note
   - Uzbek labels and notes
   - This is the "explainability" centerpiece — judges will ask about it

4. Wire into Result.tsx:
   - Call computeScore(result.facts) when result is set
   - Show ScoreGauge prominently at the top of the page
   - Show ScoreBreakdown below it
   - Show the band label + color badge: "Yuqori | O'rta | Past"
   - Show tailored advice text based on the band (e.g. for Past: which specific
     components to improve)

5. Verify with the demo fixture: Jizzax novvoyxona should score roughly 65–75.
   If it's outside that range, check your component calculations.
```

**Done when:**
- Score is computed from facts only (verify: no score field in the API response)
- Every component has a label, points, and note visible in the UI
- Changing a component value in demoFixture.ts changes the score predictably
- The gauge animates on page load

---

## CP5 — PDF export

**Paste this into Claude Code:**
```
Read CLAUDE.md. Now implement PDF export:

1. Download a Unicode-compatible font for jsPDF that supports Uzbek Latin characters
   (especially: O', G', o', g', Sh, Ch, ng). Options:
   - Roboto Regular from Google Fonts (subset or full)
   - DejaVu Sans
   Save as public/fonts/font.ttf

2. Create src/lib/pdfExport.ts:
   - Export async function exportToPDF(result: AIResult, score: ScoreResult): Promise<void>
   - Use jsPDF with the custom font registered
   - Document structure:
     HEADER: "BIZNES-REJA" + business_type + region + date
     SCORE BOX: total score + band (colored background)
     SECTION 1–5: business plan sections (heading + body text with line wrapping)
     BANK TAVSIYALARI: bank recommendation cards
     TAYYORLIK RO'YXATI: numbered checklist
     FOOTER: "BiznesPlan AI tomonidan tayyorlandi | biznesplan.uz"
   - Filename: `BiznesReja_${business_type}_${date}.pdf`

3. Wire "PDF yuklash" button in Result.tsx to call exportToPDF.
   Show a loading spinner while generating.

4. CRITICAL TEST: Open the PDF — verify Uzbek characters (O', g', sh, ch) are
   NOT garbled. If they are, the font is not embedded correctly. Fix before moving on.
```

**Done when:**
- Clicking "PDF yuklash" downloads a real PDF
- The PDF contains all 5 business plan sections + score + bank recs + checklist
- Uzbek special characters (O', G', o', g') render correctly in the downloaded PDF
- The PDF looks professional enough to hand to a bank teller

---

## CP6 — Demo hardening + polish

**Paste this into Claude Code:**
```
Read CLAUDE.md. Final polish pass:

1. Landing page (src/pages/Landing.tsx):
   - Hero headline: "10 daqiqada bankka tayyor biznes-reja"
   - 3 key stats: "90% KOK", "$6 mlrd kamomad", "1 dekabrdan yangi kredit scoring"
   - CTA button: "Boshlash →" → navigates to /interview
   - Brief explanation of the 3-step process (suhbat → tahlil → reja)
   - Dark, professional design — this is someone's financial future, not a game

2. Loading state (while waiting for Claude):
   - Full-screen overlay on the Result page while status === 'loading'
   - Animated progress with rotating Uzbek messages:
     "Biznesingiz tahlil qilinmoqda..."
     "Bozor ma'lumotlari tekshirilmoqda..."
     "Bank talablari solishtirilmoqda..."
     "Biznes-reja tuzilmoqda..."
   - Estimated time: "~20–30 soniya"

3. Error handling:
   - API timeout (>45s): show retry button + "Tarmoq sekin, qayta urinib ko'ring"
   - Zod parse failure: show retry + log raw response to console
   - Network error: show retry

4. Mobile responsiveness:
   - Interview: full-screen question cards work on 375px viewport
   - Result: all cards stack vertically, score gauge is readable
   - PDF button is thumb-accessible

5. Demo mode refinement:
   - ?demo=1 should show a subtle "Demo rejimi" badge in the top corner
   - The demo fixture should be perfect — re-read it and make sure every field
     has compelling, realistic Uzbek content a judge would believe

6. Final check — run through this full flow without errors:
   Landing → click Boshlash → answer all 10 questions → see result with score +
   breakdown + plan + banks + checklist → download PDF → verify PDF content
```

**Done when:**
- Full flow runs without errors or console warnings
- ?demo=1 works perfectly with wifi OFF (true offline test)
- PDF of the demo scenario is presentable — you would hand this to a bank
- Mobile layout is usable on a phone screen

---

## Final pre-pitch checklist
- [ ] Demo mode works offline (?demo=1 → full result → PDF download)
- [ ] Real API flow works (answer 10 questions → result in ~25s)
- [ ] Score breakdown shows all 6 components with Uzbek labels
- [ ] PDF has no garbled characters
- [ ] Landing page shows the 3 killer stats ($6B gap, 90% KOK, Dec 2026)
- [ ] App is deployed on Vercel (`vercel --prod`)
- [ ] You have rehearsed the Jizzax novvoyxona demo 10 times

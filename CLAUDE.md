# BiznesPlan AI — Claude Code Project Brief

## What we're building
An Uzbek-language AI advisor for SMEs that turns a 10-question conversation into:
1. A bank-ready business plan (PDF export)
2. An explainable loan-readiness score (0–100, computed in CODE not by AI)
3. A "which bank + what documents to bring" checklist

**Positioning:** We are the *preparation layer* for the government's Dec 1, 2026 AI credit scoring platform.
The state platform scores and matches borrowers; we make unbankable entrepreneurs ready to apply.
Distributed through the Chamber of Commerce (O'zbekiston Savdo-sanoat palatasi) as its digital SME advisor.

---

## Stack (never substitute)
- **Vite + React + TypeScript** — `npm create vite@latest`
- **Tailwind CSS v4** — utility classes only, no arbitrary values
- **Zustand** — global state (interview answers + result)
- **Recharts** — scorecard visualization (gauge + bar breakdown)
- **jsPDF + html2canvas** — client-side PDF export
- **Vercel serverless function** at `api/generate.ts` — the ONLY place the Anthropic API is called
- **Zod** — runtime validation of the JSON schema Claude returns

## Absolute rules
1. **NEVER call Anthropic API from the browser.** All AI calls go through `/api/generate`.
   The key lives only in the serverless function env: `ANTHROPIC_API_KEY`.
2. **The loan-readiness SCORE is computed in `src/lib/scoring.ts`** — a pure TypeScript function.
   Claude returns `facts`; scoring.ts turns facts into points. Claude must NOT output a score or %.
3. **All user-facing strings are in Uzbek (Latin script).** Code, comments, variable names in English.
4. **One hard-coded demo fixture** lives in `src/lib/demoFixture.ts`. The app has a hidden
   `?demo=1` query param that bypasses the API entirely and uses the fixture. This is the demo
   safety net — it must work perfectly offline.
5. **Do not over-engineer.** This is a 3-day hackathon MVP. Prefer simple, working code over
   elegant abstractions.

---

## File map
```
biznesplan-ai/
├── CLAUDE.md                    ← this file (read first every session)
├── .env.example                 ← env template (never commit real keys)
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── api/
│   └── generate.ts              ← Vercel serverless function (Anthropic proxy)
├── docs/
│   ├── schema.md                ← exact JSON contract between AI and frontend
│   ├── scoring.md               ← scoring rubric documentation
│   └── system-prompt.md         ← the full system prompt (single source of truth)
├── src/
│   ├── main.tsx
│   ├── App.tsx                  ← routing: Landing / Interview / Result
│   ├── stores/
│   │   └── appStore.ts          ← Zustand store: answers[], result, status
│   ├── lib/
│   │   ├── questions.ts         ← the 10 Uzbek questions (typed)
│   │   ├── scoring.ts           ← RULE-BASED score computation
│   │   ├── demoFixture.ts       ← hard-coded fallback result (Jizzax novvoyxona)
│   │   ├── schema.ts            ← Zod schema for AI response validation
│   │   └── pdfExport.ts         ← jsPDF + html2canvas export logic
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Interview.tsx
│   │   └── Result.tsx
│   └── components/
│       ├── ui/                  ← Button, Card, ProgressBar, Badge
│       ├── interview/           ← ChatBubble, QuestionCard, AnswerInput
│       └── result/              ← ScoreGauge, ScoreBreakdown, BankCard,
│                                    ChecklistItem, PlanSection, ExportButton
└── public/
    └── fonts/                   ← DejaVu or Roboto font for jsPDF (Uzbek chars)
```

---

## Build order (checkpoints)
Work in order. Run the "done when" check before moving on.

**CP1** — Scaffold & wiring
**CP2** — Interview flow (10-question chat UI)
**CP3** — API call + JSON parsing + result rendering
**CP4** — Scoring engine + scorecard UI
**CP5** — PDF export
**CP6** — Demo mode + polish + mobile responsive

See `docs/checkpoints.md` for full prompts.

---

## Key data for pitch (verified Dec 2025 – May 2026)
- MSMEs = >90% of businesses, ~75% of employment, ~55% of GDP (World Bank FINGROW, Dec 2025)
- Only 10% small / 16% medium enterprises can access loans (World Bank FINGROW)
- MSME credit demand $13B, gap $6B (World Bank FINGROW)
- World Bank approved $100M loan + $5M grant (FINGROW, Dec 15 2025)
- Government AI credit scoring launches **Dec 1, 2026** using turnover, tax records,
  utility payments, business activity — we prepare entrepreneurs for exactly these metrics
  (Times of Central Asia, May 2026)

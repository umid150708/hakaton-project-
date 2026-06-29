# START HERE — BiznesPlan AI

## You have a complete project scaffold. Here's how to run it.

### Step 1 — Install
```bash
npm install
```

### Step 2 — Set up your API key
```bash
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key
```

### Step 3 — Run locally
```bash
# Terminal 1: Vercel dev (runs both the React app AND the serverless function)
npx vercel dev

# The app will be at http://localhost:3000
# Test demo mode: http://localhost:3000/?demo=1
```

### Step 4 — Verify everything works
1. Open http://localhost:3000 — Landing page appears
2. Open http://localhost:3000/?demo=1 — Result page loads with Jizzax novvoyxona data
3. Check the score shows ~68–75/100
4. Click "PDF yuklash" — PDF downloads
5. Go through all 10 interview questions with a real API key — result appears in ~25s

---

## What's already built
- ✅ All 3 pages: Landing, Interview, Result
- ✅ Zustand state management
- ✅ 10 Uzbek interview questions
- ✅ Serverless API proxy (api/generate.ts)
- ✅ Zod schema validation
- ✅ Rule-based scoring engine (6 components, 100 pts)
- ✅ Score gauge + breakdown UI
- ✅ PDF export
- ✅ Demo fixture (Jizzax novvoyxona)
- ✅ Demo mode (?demo=1)

## What Claude Code should do next
Open Claude Code and paste prompts from **docs/checkpoints.md** in order (CP1 through CP6).
The checkpoints will wire everything together, fix any TypeScript errors, and polish the UI.

## Key files
- `CLAUDE.md` — project brief (Claude Code reads this first)
- `docs/checkpoints.md` — step-by-step prompts to paste into Claude Code
- `docs/system-prompt.md` — the AI system prompt
- `docs/schema.md` — JSON contract
- `docs/scoring.md` — scoring rubric
- `src/lib/demoFixture.ts` — the offline demo scenario

## Hackathon demo script
1. Open http://localhost:3000/?demo=1
2. Show the score gauge (should be green, ~70+)
3. Expand "Rezyume" plan section — show real Uzbek content
4. Show score breakdown — explain each component
5. Show bank recommendations — Mikrokreditbank first
6. Click PDF yuklash — show the downloaded PDF
7. Say: "Jizzaxdagi novvoyxona egasi bugun Mikrokreditbankka bora oladi."

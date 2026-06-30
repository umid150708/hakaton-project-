# 📚 Business Plan Training Setup

This document explains how to teach your Gemini AI about your sample business plans using RAG (Retrieval Augmented Generation).

---

## **How It Works**

1. **Extract** text from your 20 PDF/DOC files
2. **Split** into 500-char chunks
3. **Generate embeddings** using Google's free API
4. **Store** in Supabase with pgvector (vector database)
5. **On each chat**, query the top similar examples
6. **Inject** into Gemini's system prompt

Result: Gemini learns from **real examples** → more tailored, professional business plans.

---

## **Step 1: Prepare Your Files**

Create a folder with your business plans:

```bash
mkdir -p ~/Desktop/business-plans
# Copy your 20 PDFs and DOCs here
# e.g., Coffee-Shop-2026.pdf, Tech-Startup.docx, etc.
```

File name format helps with categorization:
- `Bakery-Bread-Shop-2026.pdf` → extracted as "Bakery"
- `Tech-Startup-SoftDev-2026.docx` → extracted as "Tech"
- `Cafe-Restaurant-2026.pdf` → extracted as "Cafe"

---

## **Step 2: Get Supabase Credentials**

Go to **[supabase.com](https://supabase.com)** → Sign in → Your Project:

1. Click **Settings** (bottom left)
2. Click **API** tab
3. Copy:
   - **Project URL** (e.g., `https://xxxxxx.supabase.co`)
   - **anon key** (under "Project API keys")

---

## **Step 3: Create Supabase Table**

Go to your Supabase dashboard → **SQL Editor** → Run this:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE business_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_file TEXT NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  title TEXT,
  category TEXT,
  embedding vector(768),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(source_file, chunk_index)
);

CREATE INDEX ON business_plans 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

---

## **Step 4: Update `.env.local`**

Add to `/Users/user/Desktop/biznesplan-ai/.env.local`:

```bash
# Existing keys
GEMINI_API_KEY=...
GEMINI_API_KEY_2=...

# NEW: Supabase
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJh...xxxxx
BUSINESS_PLANS_DIR=/Users/user/Desktop/business-plans
```

Replace `xxxxxx` with your actual credentials from Step 2.

---

## **Step 5: Ingest Business Plans**

Run the ingestion script to process all 20 files:

```bash
cd /Users/user/Desktop/biznesplan-ai
npx ts-node scripts/ingest-business-plans.ts
```

**Output will show:**
- ✓ Files extracted
- ✓ Chunks created
- ✓ Embeddings generated
- ✓ Stored in Supabase

This takes ~1–2 minutes for 20 files.

---

## **Step 6: Deploy**

Push to Vercel:

```bash
npx vercel --prod
```

Make sure Vercel environment variables include:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## **Testing**

Go to **[https://biznesplan-ai.vercel.app/interview](https://biznesplan-ai.vercel.app/interview)**

Start a conversation about a business type that matches your samples (e.g., "Kafe, Toshkent"):

- Gemini will **silently retrieve** 2 relevant business plan examples
- It will **use them** to shape the generated plan
- The plans will be **more professional** and **closer to your samples**

---

## **Troubleshooting**

| Issue | Solution |
|---|---|
| "Missing SUPABASE_URL" | Add to `.env.local` |
| "Embedding failed" | Check GEMINI_API_KEY is valid |
| "Table already exists" | Drop table first: `DROP TABLE IF EXISTS business_plans;` |
| Files not found | Check `BUSINESS_PLANS_DIR` path is correct |

---

## **Advanced: How to Check Ingestion**

Go to Supabase dashboard → **Table Editor** → `business_plans`:

You should see ~100–200 rows (5–10 chunks per file).

To test search:
```sql
SELECT source_file, content, title 
FROM business_plans 
WHERE category ILIKE '%cafe%'
LIMIT 3;
```

---

## **Performance Notes**

- **Free tier**: ~500 requests/minute to Supabase ✓ (plenty)
- **Gemini rate limit**: Dual key rotation handles it ✓
- **Latency**: +200–300ms per chat (Supabase query) ✓ Acceptable

---

## **Next Steps (Optional)**

1. **Add more files** → Re-run ingestion script
2. **Improve categories** → Edit file names with clear types
3. **Fine-tune examples** → Manually curate best 3–5 chunks per category
4. **Vector similarity** → Later, upgrade query to use actual vector search (RPC function)

---

**Questions?** Check `/Users/user/Desktop/biznesplan-ai/scripts/ingest-business-plans.ts` for details.

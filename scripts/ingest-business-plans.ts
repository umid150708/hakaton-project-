/**
 * scripts/ingest-business-plans.ts
 *
 * Run with:  npx tsx scripts/ingest-business-plans.ts
 *
 * What it does:
 *   1. Reads all PDF / DOCX / DOC files from BUSINESS_PLANS_DIR
 *   2. Extracts text
 *   3. Splits into chunks
 *   4. Generates embeddings with Google's embedding-001 model
 *   5. Upserts into Supabase business_plans table
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
const mammoth  = require('mammoth')  as { extractRawText: (opts: { path: string }) => Promise<{ value: string }> };

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL      = process.env.SUPABASE_URL      ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
// Use GEMINI_API_KEY_2 (AIzaSy... format) — the AQ. key doesn't support embeddings
const GEMINI_KEY        = process.env.GEMINI_API_KEY_2 ?? process.env.GEMINI_API_KEY ?? '';
const FILES_DIR         = process.env.BUSINESS_PLANS_DIR ?? path.join(process.env.HOME ?? '', 'Desktop/Business plans and idea');

const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMS  = 768;   // truncated via MRL (max ivfflat supports is 2000)

const CHUNK_SIZE    = 600;   // chars per chunk
const CHUNK_OVERLAP = 120;   // overlap between chunks
const DELAY_MS      = 1200;  // pause between Gemini embedding calls (rate limit safety)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/** Recursively find all PDF/DOCX files in a directory */
function findFiles(dir: string): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recurse into subdirectories
      results.push(...findFiles(fullPath));
    } else if (/\.(pdf|docx?)$/i.test(item)) {
      results.push(fullPath);
    }
  }

  return results;
}

/** Quality check: is this text a real business plan? */
function isQualityContent(text: string): { ok: boolean; reason?: string } {
  // Minimum length
  if (text.length < 500) return { ok: false, reason: 'too short' };

  // Must contain business-related keywords (in Uzbek or English)
  const keywords = /(biznes|business|reja|plan|daromad|revenue|kredit|loan|bozor|market|moliya|finance|tahlil|analiz|analysis|xodim|employee|narx|price|solig'i|tax|foyda|profit|xarajat|cost|toshkent|uzbekistan|o'zbekiston)/i;

  if (!keywords.test(text)) {
    return { ok: false, reason: 'no business keywords' };
  }

  // Reject if mostly gibberish/corrupted
  const words = text.split(/\s+/);
  const avgWordLen = text.length / words.length;
  if (avgWordLen > 15 || avgWordLen < 2) {
    return { ok: false, reason: 'corrupted text' };
  }

  return { ok: true };
}


function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + CHUNK_SIZE).trim();
    if (chunk.length > 50) chunks.push(chunk);   // skip tiny fragments
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

/** Guess category from filename */
function guessCategory(fileName: string): string {
  const n = fileName.toLowerCase();
  if (/cafe|kafe|restoran|restaurant|coffee/.test(n)) return 'cafe';
  if (/bakery|pekarn|non|novvoy/.test(n))              return 'bakery';
  if (/retail|do.kon|magazin|shop/.test(n))             return 'retail';
  if (/qurilish|construct|build/.test(n))               return 'construction';
  if (/it|tech|software|dastur/.test(n))                return 'tech';
  if (/ferma|farm|qishloq|agro/.test(n))                return 'agriculture';
  if (/tikuv|sewing|garment|kiyim/.test(n))             return 'garment';
  return 'general';
}

// ─── Text extraction ──────────────────────────────────────────────────────────

async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    return data.text as string;
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value as string;
  }

  if (ext === '.doc') {
    // .doc (Word 97-2003) — mammoth handles some .doc files too
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value as string;
    } catch {
      console.warn(`   ⚠ Could not parse .doc: ${path.basename(filePath)}`);
      return '';
    }
  }

  return '';
}

// ─── Embedding ────────────────────────────────────────────────────────────────

async function embed(text: string, genAI: GoogleGenerativeAI): Promise<number[] | null> {
  try {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const res   = await model.embedContent({
      content: { parts: [{ text: text.slice(0, 2000) }], role: 'user' },
      taskType: 'RETRIEVAL_DOCUMENT' as any,
      outputDimensionality: EMBEDDING_DIMS,
    } as any);
    return Array.from(res.embedding.values);
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes('429') || msg.includes('quota')) {
      console.warn('   ⏳ Rate limited — waiting 10s...');
      await sleep(10_000);
      return embed(text, genAI);   // retry once
    }
    console.error('   ✗ Embedding error:', msg);
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📚  Business Plan Ingestion');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Validate
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
  if (!GEMINI_KEY)
    throw new Error('Missing GEMINI_API_KEY in .env.local');
  if (!fs.existsSync(FILES_DIR))
    throw new Error(`Folder not found: ${FILES_DIR}\nCreate it and copy your PDF/DOC files there.`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const genAI    = new GoogleGenerativeAI(GEMINI_KEY);

  // List files recursively (including subdirectories)
  const files = findFiles(FILES_DIR);

  if (files.length === 0)
    throw new Error(`No PDF/DOCX files found in ${FILES_DIR}`);

  console.log(`📂  Directory : ${FILES_DIR}`);
  console.log(`📄  Files     : ${files.length}\n`);

  let totalChunks = 0;
  let totalErrors = 0;

  for (let fi = 0; fi < files.length; fi++) {
    const filePath = files[fi];
    const fileName = path.basename(filePath);
    console.log(`[${fi + 1}/${files.length}] ${fileName}`);

    // Extract text
    let text = '';
    try {
      text = await extractText(filePath);
      text = text.replace(/\s+/g, ' ').trim();
    } catch (err) {
      console.error(`  ✗ Extract failed: ${err}`);
      totalErrors++;
      continue;
    }

    if (!text || text.length < 100) {
      console.warn(`  ⚠ Too little text (${text.length} chars), skipping`);
      totalErrors++;
      continue;
    }

    // Quality check
    const quality = isQualityContent(text);
    if (!quality.ok) {
      console.warn(`  ⚠ Rejected: ${quality.reason} — skipping`);
      totalErrors++;
      continue;
    }

    const chunks   = chunkText(text);
    const category = guessCategory(fileName);
    const title    = path.basename(fileName, path.extname(fileName)).replace(/[-_]/g, ' ');

    console.log(`  ✓ ${text.length} chars → ${chunks.length} chunks  [${category}]`);

    let chunkOK = 0;
    for (let ci = 0; ci < chunks.length; ci++) {
      process.stdout.write(`  ↳ chunk ${ci + 1}/${chunks.length} … `);

      const embedding = await embed(chunks[ci], genAI);
      if (!embedding) { console.log('skip'); totalErrors++; continue; }

      const { error } = await supabase
        .from('business_plans')
        .upsert(
          {
            source_file: fileName,
            chunk_index: ci,
            content:     chunks[ci],
            title,
            category,
            embedding,
          },
          { onConflict: 'source_file,chunk_index' }
        );

      if (error) {
        console.log(`✗ ${error.message}`);
        totalErrors++;
      } else {
        console.log('✓');
        chunkOK++;
        totalChunks++;
      }

      await sleep(DELAY_MS);  // stay under 60 RPM free-tier limit
    }

    console.log(`  ✅ ${chunkOK}/${chunks.length} chunks stored\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅  Done!  Chunks stored: ${totalChunks}  Errors: ${totalErrors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch(err => { console.error('\n❌ Fatal:', err); process.exit(1); });

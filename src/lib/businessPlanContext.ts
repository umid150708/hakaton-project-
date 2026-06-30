/**
 * businessPlanContext.ts — Query Supabase for relevant business plan examples
 *
 * On each chat turn, we retrieve 3–5 similar business plan chunks
 * and include them in Gemini's system prompt so it learns from real examples.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

interface BusinessPlanRef {
  source_file: string;
  content: string;
  title: string;
  similarity: number;
}

/**
 * Query similar business plan chunks using vector similarity.
 * Returns the top 3–5 most relevant examples for the given business type.
 */
export async function findSimilarPlans(
  businessType: string,
  category: string,
  limit: number = 3
): Promise<BusinessPlanRef[]> {
  // Skip if Supabase not configured
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured — skipping business plan context');
    return [];
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Simple keyword-based filter for now (can be upgraded to vector search later)
    // Query business plans that match the category
    const { data, error } = await supabase
      .from('business_plans')
      .select('source_file, content, title, category')
      .or(
        `category.ilike.%${category}%, title.ilike.%${businessType}%, content.ilike.%${businessType}%`
      )
      .limit(limit);

    if (error) {
      console.warn('Business plan query failed:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      source_file: row.source_file,
      content: row.content,
      title: row.title || row.source_file,
      similarity: 0.8, // Placeholder; would be populated by vector similarity
    }));
  } catch (err) {
    console.error('Business plan context error:', err);
    return [];
  }
}

/**
 * Format retrieved plans into a helpful context string for Gemini.
 */
export function formatPlanContext(plans: BusinessPlanRef[]): string {
  if (plans.length === 0) return '';

  const examples = plans
    .slice(0, 3)
    .map(
      (p, i) =>
        `\n[EXAMPLE ${i + 1}: ${p.title}]\n${p.content.slice(0, 300)}...\n`
    )
    .join('');

  return `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nREFERENCE BUSINESS PLAN EXAMPLES (for style & structure guidance):\n${examples}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

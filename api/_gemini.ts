/**
 * _gemini.ts — Gemini client with automatic key rotation
 *
 * Strategy:
 *  1. Pick a key randomly (distributes load 50/50 across both keys)
 *  2. If that key hits a rate limit (429) or quota error, instantly retry with the other key
 *  3. If both keys fail, throw the last error
 *
 * This doubles the effective quota:
 *  - Key 1 (AQ.Ab8...): ~250 req/day, 10 RPM
 *  - Key 2 (AIzaSy...): ~250 req/day, 15 RPM (standard format key has higher RPM)
 *  - Combined: ~500 req/day, up to 25 RPM effective
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

function getKeys(): string[] {
  const keys: string[] = [];
  if (process.env.GEMINI_API_KEY)   keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
  if (keys.length === 0) throw new Error('No Gemini API keys configured');
  return keys;
}

function isRateLimitError(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests')
  );
}

type GeminiCallFn<T> = (client: GoogleGenerativeAI) => Promise<T>;

/**
 * Run a Gemini API call with automatic key rotation on rate limit errors.
 * Pass a function that receives a GoogleGenerativeAI instance and returns a promise.
 */
export async function withGemini<T>(fn: GeminiCallFn<T>): Promise<T> {
  const keys = getKeys();

  // Shuffle so load is distributed across keys over time
  const shuffled = keys.length > 1 && Math.random() > 0.5
    ? [keys[1], keys[0]]
    : [...keys];

  let lastError: unknown;

  for (const key of shuffled) {
    try {
      const client = new GoogleGenerativeAI(key);
      return await fn(client);
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err) && shuffled.indexOf(key) < shuffled.length - 1) {
        // Rate limited on this key — try the next one
        console.warn(`Key ${key.slice(0, 8)}... rate limited, switching to next key`);
        continue;
      }
      // Non-rate-limit error — don't retry
      throw err;
    }
  }

  throw lastError;
}

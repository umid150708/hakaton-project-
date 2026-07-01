/**
 * _gemini.ts — Gemini client with automatic key rotation.
 * Shuffles configured keys and rotates to the next on rate-limit errors.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

function getKeys(): string[] {
  const keys: string[] = [];
  if (process.env.GEMINI_API_KEY)   keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
  if (process.env.GEMINI_API_KEY_3) keys.push(process.env.GEMINI_API_KEY_3);
  if (keys.length === 0) throw new Error('No Gemini API keys configured');
  return keys;
}

/** Fisher-Yates shuffle. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  const keys = shuffle(getKeys());
  let lastError: unknown;

  for (let i = 0; i < keys.length; i++) {
    try {
      const client = new GoogleGenerativeAI(keys[i]);
      return await fn(client);
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err) && i < keys.length - 1) {
        console.warn(`Gemini key ${keys[i].slice(0, 8)}... rate limited, switching to key ${i + 2}`);
        continue;
      }
      // Non-rate-limit error — don't retry with other keys.
      throw err;
    }
  }

  throw lastError;
}

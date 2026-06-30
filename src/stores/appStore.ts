import { create } from 'zustand';
import type { AIResult } from '../lib/schema';
import type { RevenueCheckResult } from '../lib/revenueCheck';

export type AppStatus = 'idle' | 'interviewing' | 'loading' | 'done' | 'error';

export interface AnswerPair {
  question: string;
  answer: string;
}

/** Price row stored in state — compatible with PriceRow, FallbackPriceResult, and live PriceResult */
export interface StoredPrice {
  query: string;
  avg: number;
  min: number;
  max: number;
  median: number;
  count: number;
  listings: { title: string; price: number; city: string }[];
  source: 'curated' | 'fallback';
  fetchedAt: string;
  unit?: string;
}

interface AppStore {
  // State
  answers: AnswerPair[];
  result: AIResult | null;
  prices: Record<string, StoredPrice>;
  revenueCheck: RevenueCheckResult | null;
  status: AppStatus;
  errorMessage: string;

  // Actions
  setAnswer: (index: number, question: string, answer: string) => void;
  setResult: (result: AIResult) => void;
  setPrices: (prices: Record<string, StoredPrice>, revenueCheck: RevenueCheckResult) => void;
  setStatus: (status: AppStatus) => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  answers: [],
  result: null,
  prices: {},
  revenueCheck: null,
  status: 'idle',
  errorMessage: '',

  setAnswer: (index, question, answer) =>
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[index] = { question, answer };
      return { answers: newAnswers };
    }),

  setResult: (result) => set({ result, status: 'done' }),

  setPrices: (prices, revenueCheck) => set({ prices, revenueCheck }),

  setStatus: (status) => set({ status }),

  setError: (message) => set({ status: 'error', errorMessage: message }),

  reset: () => set({
    answers: [], result: null, prices: {}, revenueCheck: null,
    status: 'idle', errorMessage: '',
  }),
}));

import { create } from 'zustand';
import type { AIResult } from '../lib/schema';

export type AppStatus = 'idle' | 'interviewing' | 'loading' | 'done' | 'error';

export interface AnswerPair {
  question: string;
  answer: string;
}

interface AppStore {
  // State
  answers: AnswerPair[];
  result: AIResult | null;
  status: AppStatus;
  errorMessage: string;

  // Actions
  setAnswer: (index: number, question: string, answer: string) => void;
  setResult: (result: AIResult) => void;
  setStatus: (status: AppStatus) => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  answers: [],
  result: null,
  status: 'idle',
  errorMessage: '',

  setAnswer: (index, question, answer) =>
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[index] = { question, answer };
      return { answers: newAnswers };
    }),

  setResult: (result) => set({ result, status: 'done' }),

  setStatus: (status) => set({ status }),

  setError: (message) => set({ status: 'error', errorMessage: message }),

  reset: () => set({ answers: [], result: null, status: 'idle', errorMessage: '' }),
}));

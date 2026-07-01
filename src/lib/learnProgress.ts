/**
 * learnProgress.ts — localStorage-first progress store.
 *
 * Follows the same pattern as auth.ts (mirror-first, reactive via
 * useSyncExternalStore). Swap the load/save functions for Supabase
 * calls if/when DB persistence is needed — the rest of the app stays unchanged.
 */

import { useSyncExternalStore } from 'react';
import { PASS_THRESHOLD, LESSON_XP, track } from '../data/learningContent';

export interface LearnProgress {
  completedLessons: string[];
  quizScores: Record<string, number>; // levelId (string) -> best score %
  unlockedLevels: number[];
  totalXp: number;
  badges: string[]; // level ids (string) that earned a badge
}

const STORAGE_KEY = 'oqitish_progress_v1';

const DEFAULT: LearnProgress = {
  completedLessons: [],
  quizScores: {},
  unlockedLevels: [1], // Level 1 is always unlocked
  totalXp: 0,
  badges: [],
};

// ─── Store ────────────────────────────────────────────────────────────────────

function load(): LearnProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<LearnProgress>;
    return {
      completedLessons: parsed.completedLessons ?? [],
      quizScores: parsed.quizScores ?? {},
      unlockedLevels: parsed.unlockedLevels ?? [1],
      totalXp: parsed.totalXp ?? 0,
      badges: parsed.badges ?? [],
    };
  } catch {
    return DEFAULT;
  }
}

function save(p: LearnProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

let _state: LearnProgress = load();
const listeners = new Set<() => void>();

function notify() { listeners.forEach(l => l()); }

function set(next: LearnProgress): void {
  _state = next;
  save(next);
  notify();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function getProgress(): LearnProgress { return _state; }

export function useProgress(): LearnProgress {
  return useSyncExternalStore(subscribe, getProgress, () => DEFAULT);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function completeLesson(lessonId: string): void {
  const p = _state;
  if (p.completedLessons.includes(lessonId)) return;
  set({
    ...p,
    completedLessons: [...p.completedLessons, lessonId],
    totalXp: p.totalXp + LESSON_XP,
  });
}

export function saveQuizScore(levelId: number, score: number): void {
  const p = _state;
  const key = String(levelId);
  const prev = p.quizScores[key] ?? 0;
  const best = Math.max(prev, score);
  const passed = best >= PASS_THRESHOLD;

  const nextScores = { ...p.quizScores, [key]: best };
  const nextBadges = passed && !p.badges.includes(key)
    ? [...p.badges, key]
    : p.badges;

  // Unlock next level when quiz passed
  const nextLevel = levelId + 1;
  const nextUnlocked =
    passed && nextLevel <= track.levels.length && !p.unlockedLevels.includes(nextLevel)
      ? [...p.unlockedLevels, nextLevel]
      : p.unlockedLevels;

  // XP for passing (only once)
  const quizXp = passed && !p.badges.includes(key) ? 100 : 0;

  set({
    ...p,
    quizScores: nextScores,
    badges: nextBadges,
    unlockedLevels: nextUnlocked,
    totalXp: p.totalXp + quizXp,
  });
}

export function resetProgress(): void {
  set(DEFAULT);
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function isLessonComplete(lessonId: string): boolean {
  return _state.completedLessons.includes(lessonId);
}

export function isLevelUnlocked(levelId: number): boolean {
  return _state.unlockedLevels.includes(levelId);
}

export function getLevelProgress(levelId: number): number {
  const level = track.levels.find(l => l.id === levelId);
  if (!level) return 0;
  const done = level.lessons.filter(ls => _state.completedLessons.includes(ls.id)).length;
  return Math.round((done / level.lessons.length) * 100);
}

export function hasBadge(levelId: number): boolean {
  return _state.badges.includes(String(levelId));
}

export function getQuizBestScore(levelId: number): number | null {
  const v = _state.quizScores[String(levelId)];
  return v !== undefined ? v : null;
}

export function overallPercent(): number {
  const total = track.levels.reduce((s, l) => s + l.lessons.length, 0);
  const done = _state.completedLessons.length;
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function nextLesson(): string | null {
  for (const level of track.levels) {
    if (!isLevelUnlocked(level.id)) break;
    for (const ls of level.lessons) {
      if (!_state.completedLessons.includes(ls.id)) return ls.id;
    }
  }
  return null;
}

import { SRSState } from './types';

const PROGRESS_KEY = 'keigo-srs-progress';
const STREAK_KEY = 'keigo-streak';

type ProgressMap = Record<string, SRSState>;

export function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCardProgress(cardId: string, state: SRSState): void {
  if (typeof window === 'undefined') return;
  const progress = loadProgress();
  progress[cardId] = state;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getCardProgress(cardId: string): SRSState | null {
  const progress = loadProgress();
  return progress[cardId] ?? null;
}

export function getStreakDays(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return 0;
    const { count, lastDate } = JSON.parse(raw);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastDate === today || lastDate === yesterday) return count;
    return 0;
  } catch {
    return 0;
  }
}

export function updateStreak(): void {
  if (typeof window === 'undefined') return;
  try {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }));
      return;
    }
    const { count, lastDate } = JSON.parse(raw);
    if (lastDate === today) return;
    if (lastDate === yesterday) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: count + 1, lastDate: today }));
    } else {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }));
    }
  } catch {
    // ignore
  }
}

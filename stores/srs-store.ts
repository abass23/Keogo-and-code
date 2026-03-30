'use client';
import { create } from 'zustand';
import type { VocabCard, SRSState, Quality } from '@/lib/types';
import { gradeCard, createInitialState, buildReviewQueue, xpForGrade } from '@/lib/srs';
import { saveCardProgress, updateStreak } from '@/lib/storage';

interface CardWithSRS {
  card: VocabCard;
  srs: SRSState;
}

interface SRSSessionState {
  queue: CardWithSRS[];
  currentIndex: number;
  sessionXP: number;
  correct: number;
  total: number;
  isFlipped: boolean;
  isComplete: boolean;

  // Actions
  initSession: (cards: VocabCard[], progress: Record<string, SRSState>) => void;
  flip: () => void;
  grade: (userId: string, quality: Quality) => Promise<void>;
  reset: () => void;
}

export const useSRSStore = create<SRSSessionState>()((set, get) => ({
  queue: [],
  currentIndex: 0,
  sessionXP: 0,
  correct: 0,
  total: 0,
  isFlipped: false,
  isComplete: false,

  initSession(cards, progress) {
    const withSRS: { id: string; srs: SRSState }[] = cards.map((c) => ({
      id: c.id,
      srs: progress[c.id] ?? createInitialState(),
    }));

    const reviewIds = new Set(buildReviewQueue(withSRS).map((c) => c.id));
    const queue = cards
      .filter((c) => reviewIds.has(c.id))
      .map((c) => ({ card: c, srs: progress[c.id] ?? createInitialState() }));

    set({ queue, currentIndex: 0, sessionXP: 0, correct: 0, total: queue.length, isFlipped: false, isComplete: queue.length === 0 });
  },

  flip() {
    set({ isFlipped: true });
  },

  async grade(userId, quality) {
    const { queue, currentIndex, sessionXP, correct } = get();
    const current = queue[currentIndex];
    if (!current) return;

    const newSRS = gradeCard(current.srs, quality);
    const xp = xpForGrade(quality);

    await saveCardProgress(userId, current.card.id, newSRS);

    const updatedQueue = queue.map((item, i) =>
      i === currentIndex ? { ...item, srs: newSRS } : item,
    );

    const nextIndex = currentIndex + 1;
    const isComplete = nextIndex >= queue.length;

    if (isComplete) {
      updateStreak();
    }

    set({
      queue: updatedQueue,
      currentIndex: nextIndex,
      sessionXP: sessionXP + xp,
      correct: quality >= 3 ? correct + 1 : correct,
      isFlipped: false,
      isComplete,
    });
  },

  reset() {
    set({ queue: [], currentIndex: 0, sessionXP: 0, correct: 0, total: 0, isFlipped: false, isComplete: false });
  },
}));

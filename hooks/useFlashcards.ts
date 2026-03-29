"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { VocabCard, Quality, SRSState, DeckFilter } from "@/lib/types";
import { gradeCard, createInitialState, isDue, isNew } from "@/lib/srs";
import { getAllCardProgress, saveCardProgress, updateStreak } from "@/lib/storage";
import { useAppStore } from "@/stores/app-store";
import { useGamificationStore } from "@/stores/gamification-store";
import { xpForGrade } from "@/lib/srs";

const ANON_USER = 'anonymous';

export interface UseFlashcardsReturn {
  queue: VocabCard[];
  currentCard: VocabCard | null;
  currentIndex: number;
  totalInSession: number;
  isRevealed: boolean;
  isSessionComplete: boolean;
  sessionXP: number;
  correctCount: number;
  getSRSState: (cardId: string) => SRSState;
  reveal: () => void;
  grade: (q: Quality) => void;
  restart: () => void;
  loading: boolean;
}

function applyFilter(cards: VocabCard[], filter?: DeckFilter): VocabCard[] {
  if (!filter) return cards;
  return cards.filter((c) => {
    if (filter.jlpt_level?.length && !filter.jlpt_level.includes(c.jlpt_level)) return false;
    if (filter.domain?.length && !filter.domain.includes(c.domain)) return false;
    if (filter.subdomain?.length && c.subdomain && !filter.subdomain.includes(c.subdomain)) return false;
    return true;
  });
}

export function useFlashcards(
  cards: VocabCard[],
  filter?: DeckFilter,
  newCardsLimit = 20,
): UseFlashcardsReturn {
  const user = useAppStore((s) => s.user);
  const userId = user?.id ?? ANON_USER;
  const addXP = useGamificationStore((s) => s.addXP);
  const unlockBadge = useGamificationStore((s) => s.unlockBadge);

  const [progress, setProgress] = useState<Record<string, SRSState>>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Load progress from IDB/localStorage
  useEffect(() => {
    getAllCardProgress(userId)
      .then((p) => { setProgress(p); })
      .catch(() => { /* IDB unavailable — start with empty progress */ })
      .finally(() => { setLoading(false); });
  }, [userId]);

  const filteredCards = useMemo(() => applyFilter(cards, filter), [cards, filter]);

  const queue = useMemo<VocabCard[]>(() => {
    if (loading) return [];
    const due = filteredCards
      .filter((c) => {
        const s = progress[c.id];
        return s && !isNew(s) && isDue(s);
      })
      .sort((a, b) => {
        const sa = progress[a.id]!;
        const sb = progress[b.id]!;
        return new Date(sa.nextReview).getTime() - new Date(sb.nextReview).getTime();
      });

    const newCards = filteredCards
      .filter((c) => !progress[c.id] || isNew(progress[c.id]))
      .slice(0, newCardsLimit);

    const combined = [...due, ...newCards];
    return combined.length > 0 ? combined : filteredCards.slice(0, newCardsLimit);
  }, [filteredCards, progress, loading, newCardsLimit]);

  const totalInSession = useMemo(() => queue.length, [queue]);
  const currentCard = queue[currentIndex] ?? null;

  const getSRSState = useCallback(
    (cardId: string): SRSState => progress[cardId] ?? createInitialState(),
    [progress],
  );

  const reveal = useCallback(() => setIsRevealed(true), []);

  const grade = useCallback(
    (q: Quality) => {
      if (!currentCard) return;
      const currentState = getSRSState(currentCard.id);
      const nextState = gradeCard(currentState, q);

      // Persist
      saveCardProgress(userId, currentCard.id, nextState);
      const newProgress = { ...progress, [currentCard.id]: nextState };
      setProgress(newProgress);

      // XP + gamification
      const xp = xpForGrade(q);
      setSessionXP((prev) => prev + xp);
      addXP(xp);
      if (q >= 3) setCorrectCount((prev) => prev + 1);

      // Log review to localStorage for heatmap
      try {
        const today = new Date().toDateString();
        const raw = localStorage.getItem('keogo-review-log');
        const log: Record<string, number> = raw ? JSON.parse(raw) : {};
        log[today] = (log[today] ?? 0) + 1;
        localStorage.setItem('keogo-review-log', JSON.stringify(log));
      } catch { /* ignore */ }

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        updateStreak();
        unlockBadge('first_review');
        setIsSessionComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setIsRevealed(false);
      }
    },
    [currentCard, currentIndex, queue.length, getSRSState, progress, userId, addXP, unlockBadge],
  );

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsSessionComplete(false);
    setSessionXP(0);
    setCorrectCount(0);
  }, []);

  return {
    queue,
    currentCard,
    currentIndex,
    totalInSession,
    isRevealed,
    isSessionComplete,
    sessionXP,
    correctCount,
    getSRSState,
    reveal,
    grade,
    restart,
    loading,
  };
}

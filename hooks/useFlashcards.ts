"use client";

import { useState, useCallback, useMemo } from "react";
import { FlashCard, Grade, SRSState } from "@/lib/types";
import { gradeCard, createInitialState, isDue } from "@/lib/srs";
import { loadProgress, saveCardProgress, updateStreak } from "@/lib/storage";

export interface UseFlashcardsReturn {
  queue: FlashCard[];
  currentCard: FlashCard | null;
  currentIndex: number;
  totalInSession: number;
  isRevealed: boolean;
  isSessionComplete: boolean;
  getSRSState: (cardId: string) => SRSState;
  reveal: () => void;
  grade: (g: Grade) => void;
  restart: () => void;
}

function buildQueue(cards: FlashCard[]): FlashCard[] {
  const progress = loadProgress();
  const due: FlashCard[] = [];
  const newCards: FlashCard[] = [];

  for (const card of cards) {
    const state = progress[card.id];
    if (!state) {
      newCards.push(card);
    } else if (isDue(state)) {
      due.push(card);
    }
  }

  // New cards first, then due cards; if nothing is due, show all cards
  const combined = [...newCards, ...due];
  return combined.length > 0 ? combined : [...cards];
}

export function useFlashcards(cards: FlashCard[]): UseFlashcardsReturn {
  const [queue, setQueue] = useState<FlashCard[]>(() => buildQueue(cards));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const totalInSession = useMemo(() => queue.length, [queue]);

  const currentCard = queue[currentIndex] ?? null;

  const getSRSState = useCallback((cardId: string): SRSState => {
    const progress = loadProgress();
    return progress[cardId] ?? createInitialState();
  }, []);

  const reveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const grade = useCallback(
    (g: Grade) => {
      if (!currentCard) return;
      const currentState = getSRSState(currentCard.id);
      const nextState = gradeCard(currentState, g);
      saveCardProgress(currentCard.id, nextState);
      updateStreak();

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        setIsSessionComplete(true);
      } else {
        setCurrentIndex(nextIndex);
        setIsRevealed(false);
      }
    },
    [currentCard, currentIndex, queue.length, getSRSState]
  );

  const restart = useCallback(() => {
    const newQueue = buildQueue(cards);
    setQueue(newQueue);
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsSessionComplete(false);
  }, [cards]);

  return {
    queue,
    currentCard,
    currentIndex,
    totalInSession,
    isRevealed,
    isSessionComplete,
    getSRSState,
    reveal,
    grade,
    restart,
  };
}

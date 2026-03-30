"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Home, Zap } from "lucide-react";
import type { VocabCard, Quality, DeckFilter } from "@/lib/types";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/strings";
import FlashCard from "./FlashCard";
import GradeButtons from "./GradeButtons";

interface FlashCardSessionProps {
  cards: VocabCard[];
  filter?: DeckFilter;
}

export default function FlashCardSession({ cards, filter }: FlashCardSessionProps) {
  const locale = useAppStore((s) => s.locale);
  const {
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
  } = useFlashcards(cards, filter);

  const progressPct = totalInSession > 0 ? Math.round((currentIndex / totalInSession) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isSessionComplete) {
    const accuracy = totalInSession > 0 ? Math.round((correctCount / totalInSession) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-cyan-400/10 border border-cyan-400/30">
          🎉
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">
            {t('session.complete', locale)}
          </h2>
          <p className="text-slate-400 text-sm">
            {totalInSession} {locale === 'fr' ? 'cartes' : 'cards'} · {accuracy}% {t('session.correct', locale)}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-slate-100 font-semibold">+{sessionXP} XP</span>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={restart}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 px-5 py-3 text-sm font-semibold text-cyan-400 hover:bg-cyan-400/10 transition-colors"
          >
            <RotateCcw size={15} />
            {locale === 'fr' ? 'Recommencer' : 'Practice again'}
          </button>
          <Link href="/">
            <button className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-zinc-800 transition-colors">
              <Home size={15} />
              {t('nav.home', locale)}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (totalInSession === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <p className="text-5xl">✅</p>
        <p className="text-slate-300">{t('session.no_due', locale)}</p>
        <Link href="/">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-zinc-800 transition-colors">
            <Home size={15} />
            {t('nav.home', locale)}
          </button>
        </Link>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={15} />
          {t('nav.home', locale)}
        </Link>
        <span className="text-xs font-mono text-slate-500">
          {currentIndex + 1} / {totalInSession}
        </span>
      </div>

      {/* Progress bar */}
      <div className="max-w-xl mx-auto w-full">
        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <FlashCard card={currentCard} isRevealed={isRevealed} onReveal={reveal} />

      {/* Grade buttons */}
      {isRevealed && (
        <div className="animate-card-reveal">
          <GradeButtons
            onGrade={(q: Quality) => grade(q)}
            currentState={getSRSState(currentCard.id)}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}

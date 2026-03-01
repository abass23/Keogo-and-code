"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, RotateCcw, Home } from "lucide-react";
import { FlashCard as FlashCardType, Track } from "@/lib/types";
import { useFlashcards } from "@/hooks/useFlashcards";
import FlashCard from "./FlashCard";
import GradeButtons from "./GradeButtons";

interface FlashCardSessionProps {
  track: Track;
  cards: FlashCardType[];
}

const TRACK_META = {
  tech: {
    label: "Tech & Keigo",
    emoji: "💻",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-400/10",
    accentBorder: "border-cyan-400/30",
  },
  life: {
    label: "Life & Travel",
    emoji: "🗾",
    accentText: "text-amber-400",
    accentBg: "bg-amber-400/10",
    accentBorder: "border-amber-400/30",
  },
};

export default function FlashCardSession({ track, cards }: FlashCardSessionProps) {
  const meta = TRACK_META[track];
  const {
    currentCard,
    currentIndex,
    totalInSession,
    isRevealed,
    isSessionComplete,
    getSRSState,
    reveal,
    grade,
    restart,
  } = useFlashcards(cards);

  const progressPct =
    totalInSession > 0 ? Math.round((currentIndex / totalInSession) * 100) : 0;

  if (isSessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${meta.accentBg} border ${meta.accentBorder}`}>
          🎉
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            Session complete!
          </h2>
          <p className="text-slate-400 text-sm max-w-xs">
            You reviewed {totalInSession} card{totalInSession !== 1 ? "s" : ""}. Keep it up — consistency is the key to fluency.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={restart}
            className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors ${meta.accentBorder} ${meta.accentText} hover:${meta.accentBg}`}
          >
            <RotateCcw size={15} />
            Practice again
          </button>
          <Link href="/">
            <button className="flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-zinc-800 transition-colors">
              <Home size={15} />
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const currentSRS = getSRSState(currentCard.id);

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Session header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </Link>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${meta.accentText}`}>
            {meta.emoji} {meta.label}
          </span>
        </div>

        <span className="text-sm font-mono text-slate-400">
          {currentIndex + 1} / {totalInSession}
        </span>
      </div>

      {/* Progress bar */}
      <div className="max-w-xl mx-auto w-full">
        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              track === "tech" ? "bg-cyan-400" : "bg-amber-400"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Flash card */}
      <FlashCard
        card={currentCard}
        isRevealed={isRevealed}
        track={track}
        onReveal={reveal}
      />

      {/* Grade buttons — only shown after reveal */}
      {isRevealed && (
        <div className="animate-card-reveal">
          <GradeButtons onGrade={grade} currentState={currentSRS} />
        </div>
      )}
    </div>
  );
}

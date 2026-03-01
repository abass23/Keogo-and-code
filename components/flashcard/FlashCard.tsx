"use client";

import { FlashCard as FlashCardType, Track } from "@/lib/types";
import { Tag, Lightbulb } from "lucide-react";

interface FlashCardProps {
  card: FlashCardType;
  isRevealed: boolean;
  track: Track;
  onReveal: () => void;
}

export default function FlashCard({ card, isRevealed, track, onReveal }: FlashCardProps) {
  const isTech = track === "tech";
  const accentText = isTech ? "text-cyan-400" : "text-amber-400";
  const accentBorder = isTech ? "border-cyan-500/30" : "border-amber-500/30";
  const accentBg = isTech ? "bg-cyan-400/5" : "bg-amber-400/5";
  const accentBtn = isTech
    ? "border-cyan-500/40 text-cyan-400 hover:bg-cyan-400/10"
    : "border-amber-500/40 text-amber-400 hover:bg-amber-400/10";

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`rounded-2xl border bg-zinc-900 overflow-hidden ${accentBorder}`}
      >
        {/* Card header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${accentBorder} ${accentBg}`}>
          <div className="flex items-center gap-2">
            <Tag size={13} className={accentText} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${accentText}`}>
              {card.subcategory ?? card.category}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">{card.id}</span>
        </div>

        {/* Front: English + French */}
        <div className="px-6 pt-7 pb-5">
          <p className="text-xl font-semibold text-slate-100 leading-snug">
            {card.english}
          </p>
          {card.french && (
            <p className="mt-1.5 text-sm text-slate-400 italic">{card.french}</p>
          )}
        </div>

        {/* Divider + Reveal zone */}
        <div className={`mx-6 border-t ${accentBorder}`} />

        {!isRevealed ? (
          <div className="px-6 py-8 flex flex-col items-center gap-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              — Japanese —
            </p>
            <button
              onClick={onReveal}
              className={`rounded-xl border px-8 py-3 text-sm font-semibold transition-all duration-200 ${accentBtn}`}
            >
              Reveal Answer
            </button>
          </div>
        ) : (
          <div className="px-6 pt-6 pb-7 animate-card-reveal">
            {/* Japanese (Kanji/Kana) */}
            <p className="font-jp text-4xl font-bold text-slate-100 text-center leading-relaxed mb-2">
              {card.japanese}
            </p>
            {/* Romaji */}
            <p className={`text-center text-sm font-medium ${accentText} mb-5`}>
              {card.romaji}
            </p>

            {/* Example sentence */}
            {card.example && (
              <div className={`rounded-xl border p-4 mt-4 ${accentBorder} ${accentBg}`}>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                  Example
                </p>
                <p className="font-jp text-base text-slate-200 leading-relaxed">
                  {card.example.japanese}
                </p>
                <p className={`text-xs mt-1 ${accentText}`}>
                  {card.example.romaji}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 italic">
                  {card.example.english}
                </p>
              </div>
            )}

            {/* Notes */}
            {card.notes && (
              <div className="flex gap-2 mt-4 text-xs text-slate-400">
                <Lightbulb size={13} className="mt-0.5 shrink-0 text-yellow-500" />
                <span>{card.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { FlashCard, Track } from "@/lib/types";
import { loadProgress } from "@/lib/storage";
import { isDue } from "@/lib/srs";

interface TrackCardProps {
  track: Track;
  cards: FlashCard[];
  title: string;
  description: string;
  subcategories: string[];
}

export default function TrackCard({
  track,
  cards,
  title,
  description,
  subcategories,
}: TrackCardProps) {
  const [dueCount, setDueCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  useEffect(() => {
    const progress = loadProgress();
    let due = 0;
    let mastered = 0;

    for (const card of cards) {
      const state = progress[card.id];
      if (!state) {
        due++;
      } else if (isDue(state)) {
        due++;
      } else if (state.interval >= 21) {
        mastered++;
      }
    }

    setDueCount(due);
    setMasteredCount(mastered);
  }, [cards]);

  const isTech = track === "tech";
  const href = `/flashcards/${track}`;

  const accentColor = isTech ? "cyan" : "amber";
  const borderClass = isTech
    ? "border-cyan-500/20 hover:border-cyan-500/50 glow-tech"
    : "border-amber-500/20 hover:border-amber-500/50 glow-life";
  const badgeClass = isTech
    ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30"
    : "bg-amber-400/10 text-amber-400 border-amber-400/30";
  const tagClass = isTech
    ? "bg-cyan-950/50 text-cyan-300 border-cyan-800/50"
    : "bg-amber-950/50 text-amber-300 border-amber-800/50";
  const btnClass = isTech
    ? "bg-cyan-400 hover:bg-cyan-300 text-zinc-950"
    : "bg-amber-400 hover:bg-amber-300 text-zinc-950";
  const progressColor = isTech ? "bg-cyan-400" : "bg-amber-400";

  const progressPct =
    cards.length > 0
      ? Math.round(((masteredCount + (cards.length - dueCount)) / (cards.length * 2)) * 100)
      : 0;
  const clampedPct = Math.min(100, Math.max(0, progressPct));

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-zinc-900/50 p-6 transition-all duration-300 ${borderClass}`}
    >
      {/* Track label */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase ${badgeClass}`}
        >
          {isTech ? "Track A" : "Track B"}
        </span>
        <span className="text-xs text-slate-500">
          {masteredCount}/{cards.length} mastered
        </span>
      </div>

      {/* Title & description */}
      <h2 className="text-xl font-bold text-slate-100 mb-1">{title}</h2>
      <p className="text-sm text-slate-400 mb-4">{description}</p>

      {/* Subcategory tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {subcategories.map((sub) => (
          <span
            key={sub}
            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${tagClass}`}
          >
            {sub}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Progress</span>
          <span>{clampedPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${clampedPct}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6 text-center">
        <div>
          <div className="text-lg font-bold text-slate-100">{cards.length}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
        <div>
          <div
            className={`text-lg font-bold ${
              dueCount > 0
                ? isTech
                  ? "text-cyan-400"
                  : "text-amber-400"
                : "text-slate-100"
            }`}
          >
            {dueCount}
          </div>
          <div className="text-xs text-slate-500">Due today</div>
        </div>
        <div>
          <div className="text-lg font-bold text-emerald-400">{masteredCount}</div>
          <div className="text-xs text-slate-500">Mastered</div>
        </div>
      </div>

      {/* CTA button */}
      <Link href={href} className="mt-auto">
        <button
          className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${btnClass}`}
        >
          {dueCount > 0 ? (
            <>
              <BookOpen size={16} />
              Study {dueCount} due card{dueCount !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Review all cards
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </Link>
    </div>
  );
}

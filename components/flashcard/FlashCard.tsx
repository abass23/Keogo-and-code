"use client";

import { useEffect } from "react";
import type { VocabCard } from "@/lib/types";
import { Tag } from "lucide-react";
import FlashCardAudio from "./FlashCardAudio";
import FuriganaText from "./FuriganaText";
import { useAppStore } from "@/stores/app-store";
import { speakJapanese } from "@/lib/audio";

interface FlashCardProps {
  card: VocabCard;
  isRevealed: boolean;
  onReveal: () => void;
}

export default function FlashCard({ card, isRevealed, onReveal }: FlashCardProps) {
  const locale = useAppStore((s) => s.locale);

  // Auto-play reading when card is revealed (no pre-recorded audio needed)
  useEffect(() => {
    if (isRevealed && !card.audio_url) {
      speakJapanese(card.hiragana);
    }
  }, [isRevealed, card.audio_url, card.hiragana]);

  const domainColors: Record<string, { text: string; border: string; bg: string; btn: string }> = {
    embedded: {
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      bg: "bg-cyan-400/5",
      btn: "border-cyan-500/40 text-cyan-400 hover:bg-cyan-400/10",
    },
    automotive: {
      text: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-400/5",
      btn: "border-blue-500/40 text-blue-400 hover:bg-blue-400/10",
    },
    business: {
      text: "text-violet-400",
      border: "border-violet-500/30",
      bg: "bg-violet-400/5",
      btn: "border-violet-500/40 text-violet-400 hover:bg-violet-400/10",
    },
    core: {
      text: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-400/5",
      btn: "border-amber-500/40 text-amber-400 hover:bg-amber-400/10",
    },
  };

  const colors = domainColors[card.domain] ?? domainColors.core;
  const meaning = locale === 'fr' ? card.meaning_fr : card.meaning_en;
  const example = card.example_sentences?.[0];

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className={`rounded-2xl border bg-zinc-900 overflow-hidden ${colors.border}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b ${colors.border} ${colors.bg}`}>
          <div className="flex items-center gap-2">
            <Tag size={13} className={colors.text} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
              {card.subdomain ?? card.domain}
            </span>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
            {card.jlpt_level}
          </span>
        </div>

        {/* Front: meaning */}
        <div className="px-6 pt-7 pb-5">
          <p className="text-xl font-semibold text-slate-100 leading-snug">{meaning}</p>
        </div>

        <div className={`mx-6 border-t ${colors.border}`} />

        {!isRevealed ? (
          <div className="px-6 py-8 flex flex-col items-center gap-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest">— 日本語 —</p>
            <button
              onClick={onReveal}
              className={`rounded-xl border px-8 py-3 text-sm font-semibold transition-all duration-200 ${colors.btn}`}
            >
              {locale === 'fr' ? 'Révéler' : 'Reveal'}
            </button>
          </div>
        ) : (
          <div className="px-6 pt-6 pb-7 animate-card-reveal">
            {/* Kanji with furigana */}
            <p className="font-jp text-4xl font-bold text-slate-100 text-center leading-relaxed mb-1">
              <FuriganaText kanji={card.kanji} hiragana={card.hiragana} />
            </p>
            {/* Romaji */}
            <p className={`text-center text-sm font-medium ${colors.text} mb-3`}>
              {card.romaji}
            </p>

            {/* Audio */}
            <FlashCardAudio text={card.hiragana} audioUrl={card.audio_url} />

            {/* Example sentence */}
            {example && (
              <div className={`rounded-xl border p-4 mt-4 ${colors.border} ${colors.bg}`}>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                  {locale === 'fr' ? 'Exemple' : 'Example'}
                </p>
                <p className="font-jp text-base text-slate-200 leading-relaxed">{example.jp}</p>
                <p className={`text-xs mt-1 ${colors.text}`}>{example.reading}</p>
                <p className="text-xs text-slate-400 mt-0.5 italic">
                  {locale === 'fr' && example.fr ? example.fr : example.en}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

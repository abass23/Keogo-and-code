"use client";

import { useAppStore } from "@/stores/app-store";

interface FuriganaTextProps {
  kanji: string;
  hiragana: string;
  className?: string;
}

/**
 * Renders kanji with hiragana ruby annotation above it.
 * The furigana toggle in useAppStore controls visibility.
 */
export default function FuriganaText({ kanji, hiragana, className = "" }: FuriganaTextProps) {
  const furiganaEnabled = useAppStore((s) => s.furiganaEnabled);

  if (!furiganaEnabled || kanji === hiragana) {
    return <span className={className}>{kanji}</span>;
  }

  return (
    <ruby className={className}>
      {kanji}
      <rt className="text-[0.45em] text-slate-400 font-normal tracking-wider">{hiragana}</rt>
    </ruby>
  );
}

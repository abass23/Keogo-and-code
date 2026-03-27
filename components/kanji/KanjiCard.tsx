"use client";

import type { KanjiEntry } from "@/lib/types";
import Link from "next/link";
import { useAppStore } from "@/stores/app-store";

interface KanjiCardProps {
  kanji: KanjiEntry;
  size?: "sm" | "md";
}

export default function KanjiCard({ kanji, size = "md" }: KanjiCardProps) {
  const locale = useAppStore((s) => s.locale);

  const jlptColors: Record<string, string> = {
    N5: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    N4: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
    N3: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    N2: "text-violet-400 border-violet-400/30 bg-violet-400/5",
  };

  const colors = jlptColors[kanji.jlpt_level] ?? jlptColors.N5;

  if (size === "sm") {
    return (
      <Link href={`/kanji/${encodeURIComponent(kanji.character)}`}>
        <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer group">
          <span className="font-jp text-2xl text-slate-100 group-hover:text-cyan-300 transition-colors">
            {kanji.character}
          </span>
          <span className="text-[10px] text-slate-500 text-center leading-tight">
            {locale === 'fr' ? kanji.meaning_fr : kanji.meaning_en}
          </span>
          <span className={`text-[9px] font-mono px-1 rounded border ${colors}`}>
            {kanji.jlpt_level}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/kanji/${encodeURIComponent(kanji.character)}`}>
      <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <span className="font-jp text-5xl text-slate-100 group-hover:text-cyan-300 transition-colors leading-none">
            {kanji.character}
          </span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${colors}`}>
            {kanji.jlpt_level}
          </span>
        </div>

        <p className="text-sm font-medium text-slate-200 mb-1">
          {locale === 'fr' ? kanji.meaning_fr : kanji.meaning_en}
        </p>

        <div className="flex gap-3 text-xs text-slate-500">
          {kanji.onyomi.length > 0 && (
            <span>音: {kanji.onyomi.join("、")}</span>
          )}
          {kanji.kunyomi.length > 0 && (
            <span>訓: {kanji.kunyomi.join("、")}</span>
          )}
        </div>

        <p className="text-xs text-slate-500 mt-2">{kanji.stroke_count} strokes</p>
      </div>
    </Link>
  );
}

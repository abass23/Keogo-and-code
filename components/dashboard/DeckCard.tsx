"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import type { VocabCard } from "@/lib/types";
import { getAllCardProgress } from "@/lib/storage";
import { isDue, isNew } from "@/lib/srs";
import { useAppStore } from "@/stores/app-store";

interface DeckCardProps {
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  cards: VocabCard[];
  href: string;
  accent: "cyan" | "violet" | "emerald" | "amber" | "blue";
  tags: string[];
}

const ACCENT = {
  cyan:    { border: "border-cyan-500/20 hover:border-cyan-500/50",    badge: "bg-cyan-400/10 text-cyan-400 border-cyan-400/30",    tag: "bg-cyan-950/50 text-cyan-300 border-cyan-800/50",    btn: "bg-cyan-400 hover:bg-cyan-300 text-zinc-950",    bar: "bg-cyan-400" },
  violet:  { border: "border-violet-500/20 hover:border-violet-500/50", badge: "bg-violet-400/10 text-violet-400 border-violet-400/30", tag: "bg-violet-950/50 text-violet-300 border-violet-800/50", btn: "bg-violet-400 hover:bg-violet-300 text-zinc-950", bar: "bg-violet-400" },
  emerald: { border: "border-emerald-500/20 hover:border-emerald-500/50", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30", tag: "bg-emerald-950/50 text-emerald-300 border-emerald-800/50", btn: "bg-emerald-400 hover:bg-emerald-300 text-zinc-950", bar: "bg-emerald-400" },
  amber:   { border: "border-amber-500/20 hover:border-amber-500/50",  badge: "bg-amber-400/10 text-amber-400 border-amber-400/30",   tag: "bg-amber-950/50 text-amber-300 border-amber-800/50",   btn: "bg-amber-400 hover:bg-amber-300 text-zinc-950",  bar: "bg-amber-400" },
  blue:    { border: "border-blue-500/20 hover:border-blue-500/50",   badge: "bg-blue-400/10 text-blue-400 border-blue-400/30",     tag: "bg-blue-950/50 text-blue-300 border-blue-800/50",     btn: "bg-blue-400 hover:bg-blue-300 text-zinc-950",    bar: "bg-blue-400" },
};

export default function DeckCard({ title_en, title_fr, description_en, description_fr, cards, href, accent, tags }: DeckCardProps) {
  const locale = useAppStore((s) => s.locale);
  const user = useAppStore((s) => s.user);
  const userId = user?.id ?? "anonymous";
  const c = ACCENT[accent];

  const [dueCount, setDueCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  useEffect(() => {
    getAllCardProgress(userId).then((progress) => {
      let due = 0;
      let mastered = 0;
      for (const card of cards) {
        const s = progress[card.id];
        if (!s || isNew(s) || isDue(s)) due++;
        if (s && s.interval >= 21) mastered++;
      }
      setDueCount(due);
      setMasteredCount(mastered);
    });
  }, [cards, userId]);

  const progressPct = cards.length > 0 ? Math.min(100, Math.round((masteredCount / cards.length) * 100)) : 0;
  const title = locale === "fr" ? title_fr : title_en;
  const description = locale === "fr" ? description_fr : description_en;

  return (
    <div className={`flex flex-col rounded-2xl border bg-zinc-900/50 p-6 transition-all duration-300 ${c.border}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${c.badge}`}>
          {masteredCount}/{cards.length}
        </span>
        <span className="text-xs text-slate-500">{dueCount} due</span>
      </div>

      <h2 className="text-xl font-bold text-slate-100 mb-1">{title}</h2>
      <p className="text-sm text-slate-400 mb-4">{description}</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {tags.map((tag) => (
          <span key={tag} className={`font-jp rounded-md border px-2 py-0.5 text-xs font-medium ${c.tag}`}>{tag}</span>
        ))}
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{locale === "fr" ? "Progrès" : "Progress"}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <Link href={href} className="mt-auto">
        <button className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${c.btn}`}>
          {dueCount > 0 ? (
            <><BookOpen size={16} />{locale === "fr" ? `Réviser ${dueCount}` : `Study ${dueCount} due`}</>
          ) : (
            <><span>{locale === "fr" ? "Tout réviser" : "Review all"}</span><ArrowRight size={16} /></>
          )}
        </button>
      </Link>
    </div>
  );
}

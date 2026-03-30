"use client";

import { useEffect, useState } from "react";
import { Flame, Zap, Calendar } from "lucide-react";
import type { VocabCard } from "@/lib/types";
import { getAllCardProgress } from "@/lib/storage";
import { isDue, isNew } from "@/lib/srs";
import { getStreakDays } from "@/lib/storage";
import { useAppStore } from "@/stores/app-store";
import { useGamificationStore, xpToLevel, xpInCurrentLevel, getLevelTitle } from "@/stores/gamification-store";
import { t } from "@/lib/i18n/strings";

const XP_PER_LEVEL = 500;

// JLPT exam dates
const JLPT_DATES = [
  { label: 'JLPT July 2026', date: new Date('2026-07-05') },
  { label: 'JLPT Dec 2026', date: new Date('2026-12-06') },
];

interface ProgressDashboardProps {
  allCards: VocabCard[];
}

export default function ProgressDashboard({ allCards }: ProgressDashboardProps) {
  const locale = useAppStore((s) => s.locale);
  const user = useAppStore((s) => s.user);
  const userId = user?.id ?? 'anonymous';
  const { totalXP } = useGamificationStore();
  const streak = getStreakDays();

  const [dueCount, setDueCount] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewedToday, setReviewedToday] = useState(0);

  useEffect(() => {
    getAllCardProgress(userId).then((progress) => {
      let due = 0;
      let mastered = 0;
      let todayReviews = 0;
      const today = new Date().toDateString();

      for (const card of allCards) {
        const s = progress[card.id];
        if (!s || isNew(s)) {
          due++;
        } else if (isDue(s)) {
          due++;
        }
        if (s && s.interval >= 21) mastered++;
        if (s?.lastReview && new Date(s.lastReview).toDateString() === today) todayReviews++;
      }
      setDueCount(due);
      setMasteredCount(mastered);
      setReviewedToday(todayReviews);
    });
  }, [allCards, userId]);

  const level = xpToLevel(totalXP);
  const xpInLevel = xpInCurrentLevel(totalXP);
  const levelPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const levelTitle = getLevelTitle(level);

  // Next JLPT countdown
  const now = new Date();
  const nextJLPT = JLPT_DATES.find((d) => d.date > now);
  const daysToJLPT = nextJLPT
    ? Math.ceil((nextJLPT.date.getTime() - now.getTime()) / 86_400_000)
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {/* Streak */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider">
          <Flame size={12} className="text-orange-400" />
          {t('dashboard.streak', locale)}
        </div>
        <p className="text-2xl font-bold text-slate-100">{streak}</p>
        <p className="text-xs text-slate-500">{locale === 'fr' ? 'jours' : 'days'}</p>
      </div>

      {/* Due */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider">
          <Calendar size={12} className="text-cyan-400" />
          {t('dashboard.due', locale)}
        </div>
        <p className={`text-2xl font-bold ${dueCount > 0 ? 'text-cyan-400' : 'text-slate-100'}`}>{dueCount}</p>
        <p className="text-xs text-slate-500">{locale === 'fr' ? 'cartes' : 'cards'}</p>
      </div>

      {/* XP */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wider">
          <Zap size={12} className="text-yellow-400" />
          {t('dashboard.xp', locale)}
        </div>
        <p className="text-2xl font-bold text-yellow-400">{reviewedToday * 12}</p>
        <div className="mt-1">
          <div className="flex justify-between text-[10px] text-slate-600 mb-1">
            <span>Lv {level}</span>
            <span>{xpInLevel}/{XP_PER_LEVEL}</span>
          </div>
          <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-yellow-400 transition-all duration-500" style={{ width: `${levelPct}%` }} />
          </div>
        </div>
      </div>

      {/* JLPT Countdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1">
        <div className="text-xs text-slate-500 uppercase tracking-wider">JLPT</div>
        {daysToJLPT ? (
          <>
            <p className="text-2xl font-bold text-violet-400">{daysToJLPT}</p>
            <p className="text-xs text-slate-500">{t('dashboard.days_until_jlpt', locale)}</p>
            <p className="text-[10px] text-slate-600">{nextJLPT?.label}</p>
          </>
        ) : (
          <p className="text-sm text-slate-400">—</p>
        )}
      </div>

      {/* Level card — full width */}
      <div className="col-span-2 sm:col-span-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">
            {locale === 'fr' ? 'Niveau' : 'Level'} {level} — {levelTitle}
          </span>
          <span className="text-xs font-mono text-slate-500">{totalXP} XP {locale === 'fr' ? 'total' : 'total'}</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-700"
            style={{ width: `${levelPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>{masteredCount} {locale === 'fr' ? 'maîtrisés' : 'mastered'}</span>
          <span>{allCards.length} {locale === 'fr' ? 'total' : 'total cards'}</span>
        </div>
      </div>
    </div>
  );
}

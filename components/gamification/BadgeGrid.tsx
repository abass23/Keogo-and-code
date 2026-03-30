"use client";

import { useGamificationStore } from "@/stores/gamification-store";
import { useAppStore } from "@/stores/app-store";
import type { BadgeId } from "@/lib/types";

const ALL_BADGES: { id: BadgeId; icon: string; label_en: string; label_fr: string; desc_en: string; desc_fr: string }[] = [
  { id: 'first_review',       icon: '🌱', label_en: 'First Review',       label_fr: 'Première révision', desc_en: 'Complete your first review session',  desc_fr: 'Terminez votre première session' },
  { id: 'streak_7',           icon: '🔥', label_en: '7-Day Streak',       label_fr: '7 jours consécutifs', desc_en: 'Study 7 days in a row',            desc_fr: '7 jours d\'affilée' },
  { id: 'streak_30',          icon: '🌟', label_en: '30-Day Streak',      label_fr: '30 jours consécutifs', desc_en: 'Study 30 days in a row',          desc_fr: '30 jours d\'affilée' },
  { id: 'kanji_50',           icon: '漢', label_en: '50 Kanji',           label_fr: '50 Kanji',           desc_en: 'Learn 50 kanji',                    desc_fr: 'Apprenez 50 kanji' },
  { id: 'kanji_100',          icon: '字', label_en: '100 Kanji',          label_fr: '100 Kanji',          desc_en: 'Learn 100 kanji',                   desc_fr: 'Apprenez 100 kanji' },
  { id: 'vocab_100',          icon: '📖', label_en: '100 Words',          label_fr: '100 Mots',           desc_en: 'Master 100 vocabulary words',       desc_fr: 'Maîtrisez 100 mots' },
  { id: 'vocab_500',          icon: '📚', label_en: '500 Words',          label_fr: '500 Mots',           desc_en: 'Master 500 vocabulary words',       desc_fr: 'Maîtrisez 500 mots' },
  { id: 'jikoshoukai_master', icon: '🎯', label_en: '自己紹介 Master',    label_fr: 'Maître自己紹介',    desc_en: 'Complete 10 jikoshoukai sessions',  desc_fr: '10 sessions自己紹介' },
  { id: 'rtos_complete',      icon: '⚙️', label_en: 'RTOS Complete',      label_fr: 'RTOS Complet',       desc_en: 'Master all RTOS vocabulary',        desc_fr: 'Maîtrisez tout le vocab RTOS' },
  { id: 'interview_ready',    icon: '💼', label_en: 'Interview Ready',    label_fr: 'Prêt pour l\'entretien', desc_en: 'Score 80%+ on interview simulator', desc_fr: '80%+ au simulateur d\'entretien' },
];

export default function BadgeGrid() {
  const locale = useAppStore((s) => s.locale);
  const { badges, hasBadge } = useGamificationStore();

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {locale === 'fr' ? 'Badges' : 'Achievements'} ({badges.length}/{ALL_BADGES.length})
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {ALL_BADGES.map((badge) => {
          const unlocked = hasBadge(badge.id);
          const label = locale === 'fr' ? badge.label_fr : badge.label_en;
          const desc = locale === 'fr' ? badge.desc_fr : badge.desc_en;

          return (
            <div
              key={badge.id}
              title={desc}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                unlocked
                  ? 'bg-zinc-900 border-zinc-700 opacity-100'
                  : 'bg-zinc-950 border-zinc-800 opacity-30 grayscale'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

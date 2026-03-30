"use client";

import type { Quality, SRSState } from "@/lib/types";
import { getIntervalLabel, gradeCard } from "@/lib/srs";

interface GradeButtonsProps {
  onGrade: (quality: Quality) => void;
  currentState: SRSState;
  locale?: 'en' | 'fr';
}

const GRADES: { value: Quality; label_en: string; label_fr: string; style: string }[] = [
  {
    value: 0,
    label_en: "Again",
    label_fr: "Encore",
    style: "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70",
  },
  {
    value: 2,
    label_en: "Hard",
    label_fr: "Difficile",
    style: "border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/70",
  },
  {
    value: 4,
    label_en: "Good",
    label_fr: "Bien",
    style: "border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/70",
  },
  {
    value: 5,
    label_en: "Easy",
    label_fr: "Facile",
    style: "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/70",
  },
];

export default function GradeButtons({ onGrade, currentState, locale = 'en' }: GradeButtonsProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-3">
        {locale === 'fr' ? 'Comment le connaissez-vous ?' : 'How well did you know it?'}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {GRADES.map(({ value, label_en, label_fr, style }) => {
          const nextState = gradeCard(currentState, value);
          const nextLabel = getIntervalLabel(nextState.interval);
          return (
            <button
              key={value}
              onClick={() => onGrade(value)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm font-semibold transition-all duration-200 ${style}`}
            >
              <span>{locale === 'fr' ? label_fr : label_en}</span>
              <span className="text-[10px] font-mono opacity-50">{nextLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

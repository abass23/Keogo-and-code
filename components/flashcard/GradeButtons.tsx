"use client";

import { Grade } from "@/lib/types";
import { getIntervalLabel } from "@/lib/srs";
import { SRSState } from "@/lib/types";
import { gradeCard } from "@/lib/srs";

interface GradeButtonsProps {
  onGrade: (grade: Grade) => void;
  currentState: SRSState;
}

export default function GradeButtons({ onGrade, currentState }: GradeButtonsProps) {
  const grades: { value: Grade; label: string; description: string; style: string }[] = [
    {
      value: "hard",
      label: "Hard",
      description: "Again tomorrow",
      style:
        "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70",
    },
    {
      value: "good",
      label: "Good",
      description: "I knew it",
      style:
        "border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/70",
    },
    {
      value: "easy",
      label: "Easy",
      description: "Too easy!",
      style:
        "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/70",
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto">
      <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-3">
        How well did you know it?
      </p>
      <div className="grid grid-cols-3 gap-3">
        {grades.map(({ value, label, description, style }) => {
          const nextState = gradeCard(currentState, value);
          const nextLabel = getIntervalLabel(nextState.interval);
          return (
            <button
              key={value}
              onClick={() => onGrade(value)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${style}`}
            >
              <span>{label}</span>
              <span className="text-xs font-normal opacity-60">{description}</span>
              <span className="text-[10px] font-mono opacity-50">+{nextLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

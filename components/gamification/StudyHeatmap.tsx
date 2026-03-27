"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/app-store";

interface DayData {
  date: string;
  count: number;
}

/** Build a 52-week grid ending today */
function buildGrid(): DayData[] {
  const today = new Date();
  const days: DayData[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toDateString(), count: 0 });
  }
  return days;
}

function intensityClass(count: number): string {
  if (count === 0) return 'bg-zinc-800';
  if (count < 5) return 'bg-cyan-900';
  if (count < 15) return 'bg-cyan-700';
  if (count < 30) return 'bg-cyan-500';
  return 'bg-cyan-400';
}

export default function StudyHeatmap() {
  const locale = useAppStore((s) => s.locale);
  const [grid, setGrid] = useState<DayData[]>([]);

  useEffect(() => {
    // Load from localStorage (review log)
    const base = buildGrid();
    try {
      const raw = localStorage.getItem('keogo-review-log');
      if (raw) {
        const log: Record<string, number> = JSON.parse(raw);
        const updated = base.map((d) => ({ ...d, count: log[d.date] ?? 0 }));
        setGrid(updated);
        return;
      }
    } catch { /* ignore */ }
    setGrid(base);
  }, []);

  // Group into weeks (7-day columns)
  const weeks: DayData[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        {locale === 'fr' ? 'Activité (52 semaines)' : 'Study Activity (52 weeks)'}
      </h2>
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} cards`}
                  className={`w-3 h-3 rounded-sm ${intensityClass(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600">
        <span>{locale === 'fr' ? 'Moins' : 'Less'}</span>
        {[0, 3, 10, 20, 40].map((v) => (
          <div key={v} className={`w-3 h-3 rounded-sm ${intensityClass(v)}`} />
        ))}
        <span>{locale === 'fr' ? 'Plus' : 'More'}</span>
      </div>
    </div>
  );
}

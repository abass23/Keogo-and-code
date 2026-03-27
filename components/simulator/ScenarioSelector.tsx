'use client';

import { SCENARIOS } from '@/lib/simulatorScenarios';
import type { ScenarioId } from '@/lib/simulatorTypes';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';

interface ScenarioSelectorProps {
  onSelect: (id: ScenarioId) => void;
}

const ACCENT_CLASSES = {
  cyan:   { border: 'border-cyan-500/20 hover:border-cyan-500/50',   badge: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',   btn: 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950' },
  violet: { border: 'border-violet-500/20 hover:border-violet-500/50', badge: 'bg-violet-400/10 text-violet-400 border-violet-400/20', btn: 'bg-violet-400 hover:bg-violet-300 text-zinc-950' },
  amber:  { border: 'border-amber-500/20 hover:border-amber-500/50', badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20', btn: 'bg-amber-400 hover:bg-amber-300 text-zinc-950' },
  blue:   { border: 'border-blue-500/20 hover:border-blue-500/50',   badge: 'bg-blue-400/10 text-blue-400 border-blue-400/20',   btn: 'bg-blue-400 hover:bg-blue-300 text-zinc-950' },
};

export default function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const locale = useAppStore((s) => s.locale);
  const scenarios = Object.values(SCENARIOS);

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-4 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">
          {locale === 'fr' ? 'Choisir un mode' : 'Choose a Mode'}
        </h2>
        <p className="text-slate-400 text-sm max-w-md">
          {locale === 'fr'
            ? "L'IA parle en premier — répondez en japonais. Corrections en temps réel."
            : 'The AI speaks first — you reply in Japanese. Real-time keigo corrections.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {scenarios.map((s) => {
          const c = ACCENT_CLASSES[s.accentColor];
          const title = locale === 'fr' ? s.title_fr : s.title_en;
          const description = locale === 'fr' ? s.description_fr : s.description_en;
          const hint = locale === 'fr' ? s.hint_fr : s.hint_en;

          return (
            <div
              key={s.id}
              className={`flex flex-col rounded-2xl border bg-zinc-900/60 p-5 transition-all duration-300 ${c.border}`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{s.icon}</span>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${c.badge}`}>
                  {locale === 'fr' ? s.aiRole_fr : s.aiRole_en}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-0.5">{title}</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed flex-1">{description}</p>

              <div className="rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-slate-400 font-jp mb-4 leading-relaxed">
                {hint}
              </div>

              <button
                onClick={() => onSelect(s.id)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${c.btn}`}
              >
                {locale === 'fr' ? 'Commencer' : 'Start Session'}
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

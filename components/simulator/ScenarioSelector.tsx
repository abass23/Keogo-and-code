'use client';

import { SCENARIOS } from '@/lib/simulatorScenarios';
import type { ScenarioId } from '@/lib/simulatorTypes';
import { Cpu, MapPin, ArrowRight } from 'lucide-react';

interface ScenarioSelectorProps {
  onSelect: (id: ScenarioId) => void;
}

export default function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const scenarios = Object.values(SCENARIOS);

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Choose a Scenario</h2>
        <p className="text-slate-400 text-sm">
          Pick a roleplay context. The AI will speak first — you reply in Japanese.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {scenarios.map((s) => {
          const isTech = s.accentColor === 'cyan';
          const borderClass = isTech
            ? 'border-cyan-500/20 hover:border-cyan-500/50'
            : 'border-amber-500/20 hover:border-amber-500/50';
          const badgeClass = isTech
            ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
            : 'bg-amber-400/10 text-amber-400 border-amber-400/20';
          const btnClass = isTech
            ? 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950'
            : 'bg-amber-400 hover:bg-amber-300 text-zinc-950';
          const Icon = isTech ? Cpu : MapPin;

          return (
            <div
              key={s.id}
              className={`flex flex-col rounded-2xl border bg-zinc-900/60 p-5 transition-all duration-300 ${borderClass}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{s.aiAvatar}</span>
                <span
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${badgeClass}`}
                >
                  <Icon size={10} />
                  {isTech ? 'Track A' : 'Track B'}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-100 mb-0.5">{s.title}</h3>
              <p className="text-xs text-slate-500 font-jp mb-3">{s.subtitle}</p>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed flex-1">{s.description}</p>

              {/* AI info */}
              <div className="text-xs text-slate-500 mb-4">
                AI: <span className="text-slate-300 font-jp">{s.aiName}</span> &middot; {s.aiRole}
              </div>

              {/* Hint */}
              <div className="rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-slate-400 font-jp mb-4 leading-relaxed">
                {s.hint}
              </div>

              <button
                onClick={() => onSelect(s.id)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${btnClass}`}
              >
                Start Session
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

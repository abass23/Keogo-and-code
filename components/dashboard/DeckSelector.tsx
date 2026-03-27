"use client";

import type { DeckFilter } from "@/lib/types";
import { useAppStore } from "@/stores/app-store";
import { t } from "@/lib/i18n/strings";

interface DeckSelectorProps {
  selected: DeckFilter;
  onChange: (filter: DeckFilter) => void;
}

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2'] as const;
const DOMAINS = [
  { id: 'core', labelKey: 'deck.all' },
  { id: 'embedded', labelKey: 'deck.embedded' },
  { id: 'automotive', labelKey: 'deck.automotive' },
  { id: 'business', labelKey: 'deck.business' },
] as const;

export default function DeckSelector({ selected, onChange }: DeckSelectorProps) {
  const locale = useAppStore((s) => s.locale);

  function toggleLevel(level: (typeof JLPT_LEVELS)[number]) {
    const current = selected.jlpt_level ?? [];
    const next = current.includes(level) ? current.filter((l) => l !== level) : [...current, level];
    onChange({ ...selected, jlpt_level: next.length ? next : undefined });
  }

  function toggleDomain(domain: (typeof DOMAINS)[number]['id']) {
    const current = selected.domain ?? [];
    if (domain === 'core') {
      onChange({ ...selected, domain: undefined });
      return;
    }
    const next = current.includes(domain as never) ? current.filter((d) => d !== domain) : [...current, domain as never];
    onChange({ ...selected, domain: next.length ? next as never[] : undefined });
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* JLPT filter */}
      <div className="flex gap-1.5">
        {JLPT_LEVELS.map((lvl) => {
          const active = selected.jlpt_level?.includes(lvl);
          return (
            <button
              key={lvl}
              onClick={() => toggleLevel(lvl)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                active
                  ? "bg-cyan-400/10 border-cyan-400/40 text-cyan-400"
                  : "border-zinc-700 text-slate-500 hover:text-slate-300 hover:border-zinc-600"
              }`}
            >
              {lvl}
            </button>
          );
        })}
      </div>

      <div className="w-px h-4 bg-zinc-700" />

      {/* Domain filter */}
      <div className="flex gap-1.5 flex-wrap">
        {DOMAINS.map(({ id, labelKey }) => {
          const active = id === 'core' ? !selected.domain?.length : selected.domain?.includes(id as never);
          return (
            <button
              key={id}
              onClick={() => toggleDomain(id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                active
                  ? "bg-violet-400/10 border-violet-400/40 text-violet-400"
                  : "border-zinc-700 text-slate-500 hover:text-slate-300 hover:border-zinc-600"
              }`}
            >
              {t(labelKey, locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

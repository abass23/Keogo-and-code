'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, X, Volume2, ExternalLink, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { speakJapanese } from '@/lib/audio';
import type { SearchResult } from '@/app/api/search/route';

const JLPT_COLORS: Record<string, string> = {
  N5: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  N4: 'text-cyan-400    border-cyan-400/30    bg-cyan-400/10',
  N3: 'text-blue-400    border-blue-400/30    bg-blue-400/10',
  N2: 'text-violet-400  border-violet-400/30  bg-violet-400/10',
  N1: 'text-rose-400    border-rose-400/30    bg-rose-400/10',
};

function FuriganaWord({ kanji, hiragana }: { kanji: string; hiragana: string }) {
  // Show ruby (furigana) only when kanji differs from hiragana
  if (!kanji || kanji === hiragana) {
    return <span className="font-jp text-3xl text-slate-100">{hiragana}</span>;
  }
  return (
    <ruby className="font-jp text-3xl text-slate-100">
      {kanji}
      <rt className="text-xs text-slate-400 font-normal">{hiragana}</rt>
    </ruby>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const { locale } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSearched(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      setResults(json.results ?? []);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 350);
  };

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" aria-hidden />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          {loading
            ? <Loader2 size={18} className="text-slate-500 animate-spin shrink-0" />
            : <Search size={18} className="text-slate-500 shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={locale === 'fr'
              ? 'Rechercher en français ou anglais… ex : voiture, water, meeting'
              : 'Search in English or French… e.g. car, eau, meeting'}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 text-sm outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              className="text-slate-600 hover:text-slate-400 transition-colors">
              <X size={16} />
            </button>
          )}
          <button onClick={onClose}
            className="text-slate-600 hover:text-slate-400 transition-colors md:hidden">
            <X size={18} />
          </button>
          <kbd className="hidden md:inline-block text-[10px] text-slate-600 border border-zinc-700 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-zinc-800/60">
          {results.length === 0 && searched && !loading && (
            <div className="py-12 text-center text-slate-600 text-sm">
              {locale === 'fr' ? 'Aucun résultat trouvé.' : 'No results found.'}
            </div>
          )}

          {results.length === 0 && !searched && !loading && (
            <div className="py-10 text-center space-y-1">
              <p className="text-slate-600 text-sm">
                {locale === 'fr'
                  ? 'Tape un mot en français ou anglais'
                  : 'Type a word in French or English'}
              </p>
              <p className="text-slate-700 text-xs">voiture → 車　　water → 水　　meeting → 会議</p>
            </div>
          )}

          {results.map((r, i) => (
            <div key={i} className="px-5 py-4 hover:bg-zinc-800/40 transition-colors group">
              {/* Top row: kanji + furigana, JLPT badge, source, audio */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-end gap-3 flex-wrap">
                  <FuriganaWord kanji={r.kanji} hiragana={r.hiragana} />
                  {r.hiragana && r.kanji !== r.hiragana && (
                    <span className="font-jp text-base text-slate-400 pb-0.5">{r.hiragana}</span>
                  )}
                  {r.romaji && (
                    <span className="text-xs text-slate-600 pb-1 italic">{r.romaji}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  {/* Audio */}
                  <button
                    onClick={() => speakJapanese(r.kanji || r.hiragana)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 hover:bg-zinc-800 transition-colors"
                    title={locale === 'fr' ? 'Écouter' : 'Listen'}
                  >
                    <Volume2 size={15} />
                  </button>

                  {/* JLPT badge */}
                  {r.jlpt_level && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${JLPT_COLORS[r.jlpt_level] ?? JLPT_COLORS.N3}`}>
                      {r.jlpt_level}
                    </span>
                  )}

                  {/* Jisho source indicator */}
                  {r.source === 'jisho' && (
                    <a href={`https://jisho.org/search/${encodeURIComponent(r.kanji || r.hiragana)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-slate-700 hover:text-slate-400 transition-colors"
                      title="Voir sur Jisho"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* Meanings */}
              <div className="mt-1.5 space-y-0.5">
                <p className="text-sm text-slate-300">
                  {locale === 'fr' ? '🇫🇷 ' : '🇬🇧 '}
                  {locale === 'fr' ? r.meaning_fr : r.meaning_en}
                </p>
                {locale === 'fr' && r.meaning_en !== r.meaning_fr && (
                  <p className="text-xs text-slate-600">🇬🇧 {r.meaning_en}</p>
                )}
              </div>

              {/* Example sentence */}
              {r.example && (
                <div className="mt-2.5 pl-3 border-l-2 border-zinc-700 space-y-0.5">
                  <p className="font-jp text-sm text-slate-300">{r.example.jp}</p>
                  <p className="text-xs text-slate-500 italic">{r.example.reading}</p>
                  <p className="text-xs text-slate-500">
                    {locale === 'fr' && r.example.fr ? r.example.fr : r.example.en}
                  </p>
                </div>
              )}

              {/* Domain tag */}
              {r.domain && r.domain !== 'core' && (
                <div className="mt-2">
                  <span className="text-[9px] uppercase tracking-wider text-slate-700 border border-zinc-700/50 rounded px-1.5 py-0.5">
                    {r.domain}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-700">
            {locale === 'fr'
              ? 'Vocabulaire local + Jisho pour les mots inconnus'
              : 'Local vocab + Jisho for unknown words'}
          </p>
          <div className="flex gap-2 text-[10px] text-slate-700">
            <span>↑↓ naviguer</span>
            <span>🔊 audio</span>
          </div>
        </div>
      </div>
    </div>
  );
}

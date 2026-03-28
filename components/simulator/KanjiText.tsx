'use client';

import { useState, useEffect, useRef } from 'react';

const KANJI_RE = /[\u4E00-\u9FFF\u3400-\u4DBF]/;
const FURIGANA_RE = /\{([^|{}]+)\|([^}]+)\}/g;

interface KanjiInfo {
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning_fr: string;
  jlpt: string;
  stroke_count: number | null;
}

interface PopupState {
  char: string;
  x: number;
  y: number;
  info: KanjiInfo | null;
  loading: boolean;
  error: boolean;
}

const cache = new Map<string, KanjiInfo | null>();

type Segment =
  | { type: 'ruby'; kanji: string; reading: string }
  | { type: 'text'; content: string };

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  const re = new RegExp(FURIGANA_RE.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'ruby', kanji: match[1], reading: match[2] });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

export default function KanjiText({ text, isStreaming }: { text: string; isStreaming?: boolean }) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleClick = async (char: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    if (cache.has(char)) {
      const info = cache.get(char) ?? null;
      setPopup({ char, x, y, info, loading: false, error: info === null });
      return;
    }

    setPopup({ char, x, y, info: null, loading: true, error: false });

    try {
      const res = await fetch(`/api/kanji/${encodeURIComponent(char)}`);
      if (!res.ok) throw new Error('not_found');
      const info: KanjiInfo = await res.json();
      cache.set(char, info);
      setPopup((prev) => prev?.char === char ? { ...prev, info, loading: false } : prev);
    } catch {
      cache.set(char, null);
      setPopup((prev) => prev?.char === char ? { ...prev, loading: false, error: true } : prev);
    }
  };

  // During streaming: show raw text without ruby (markup is incomplete)
  if (isStreaming) {
    const clean = text.replace(/\{([^|{}]+)\|[^}]*\}/g, '$1').replace(/\{[^}]*/g, '');
    return <span ref={containerRef}>{clean}</span>;
  }

  const segments = parseSegments(text);

  return (
    <span ref={containerRef}>
      {segments.map((seg, si) => {
        if (seg.type === 'ruby') {
          return (
            <ruby
              key={si}
              onClick={(e) => handleClick(seg.kanji, e)}
              className="cursor-pointer hover:text-cyan-200 transition-colors"
              style={{ rubyAlign: 'center' } as React.CSSProperties}
            >
              {seg.kanji}
              <rt className="text-cyan-300 not-italic" style={{ fontSize: '0.55em', fontStyle: 'normal' }}>
                {seg.reading}
              </rt>
            </ruby>
          );
        }
        // Plain text: wrap individual kanji in clickable spans
        return Array.from(seg.content).map((char, ci) =>
          KANJI_RE.test(char) ? (
            <span
              key={`${si}-${ci}`}
              onClick={(e) => handleClick(char, e)}
              className="cursor-pointer border-b border-dotted border-cyan-500/40 hover:text-cyan-200 transition-colors"
            >
              {char}
            </span>
          ) : (
            <span key={`${si}-${ci}`}>{char}</span>
          ),
        );
      })}
      {popup && <KanjiPopup popup={popup} onClose={() => setPopup(null)} />}
    </span>
  );
}

function KanjiPopup({ popup, onClose }: { popup: PopupState; onClose: () => void }) {
  const { char, x, y, info, loading, error } = popup;
  const left = Math.max(8, Math.min(x - 128, (typeof window !== 'undefined' ? window.innerWidth : 400) - 272));

  return (
    <div
      className="fixed z-50 w-64 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl p-4"
      style={{ left, top: y, transform: 'translateY(calc(-100% - 8px))' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-jp leading-none text-slate-100" style={{ fontSize: '3rem' }}>{char}</span>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none mt-1">×</button>
      </div>

      {loading && <span className="block text-xs text-slate-500 animate-pulse">Chargement...</span>}
      {!loading && error && <span className="block text-xs text-slate-500">Kanji introuvable dans le dictionnaire.</span>}

      {!loading && info && (
        <div className="space-y-2 text-xs">
          {info.onyomi.length > 0 && (
            <div className="flex gap-2">
              <span className="w-16 shrink-0 text-slate-500">音読み</span>
              <span className="text-cyan-300 font-jp">{info.onyomi.join('、')}</span>
            </div>
          )}
          {info.kunyomi.length > 0 && (
            <div className="flex gap-2">
              <span className="w-16 shrink-0 text-slate-500">訓読み</span>
              <span className="text-cyan-300 font-jp">{info.kunyomi.join('、')}</span>
            </div>
          )}
          {info.meaning_fr && (
            <div className="flex gap-2">
              <span className="w-16 shrink-0 text-slate-500">Sens</span>
              <span className="text-slate-200">{info.meaning_fr}</span>
            </div>
          )}
          <div className="flex gap-2">
            {info.stroke_count && (
              <>
                <span className="w-16 shrink-0 text-slate-500">Traits</span>
                <span className="text-slate-400">{info.stroke_count}</span>
              </>
            )}
            {info.jlpt && <span className="text-amber-400 ml-auto">{info.jlpt}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { Volume2, Loader2, AlertCircle } from 'lucide-react';
import type { Track } from '@/lib/types';

interface FlashCardAudioProps {
  japanese: string;
  track: Track;
}

// Cache decoded AudioBuffers — instant replay, no re-fetch
const bufferCache = new Map<string, AudioBuffer>();

export default function FlashCardAudio({ japanese, track }: FlashCardAudioProps) {
  const [loadingNormal, setLoadingNormal] = useState(false);
  const [loadingSlow, setLoadingSlow] = useState(false);
  const [error, setError] = useState(false);

  // One shared AudioContext per component instance — created on first click
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const isTech = track === 'tech';
  const accentText = isTech ? 'text-cyan-400' : 'text-amber-400';
  const accentBorder = isTech ? 'border-cyan-500/30' : 'border-amber-500/30';
  const accentHover = isTech ? 'hover:bg-cyan-400/10' : 'hover:bg-amber-400/10';

  const play = useCallback(
    async (speed: number, setLoading: (v: boolean) => void) => {
      setError(false);

      // ── 1. Unlock audio synchronously on the user gesture ──────────────
      // AudioContext must be created/resumed inside the click handler before
      // any await, otherwise mobile browsers block playback.
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // ── 2. Stop whatever is already playing ─────────────────────────────
      try { sourceRef.current?.stop(); } catch { /* already stopped */ }

      const cacheKey = `${japanese}::${speed}`;
      setLoading(true);

      try {
        // ── 3. Fetch or use cached AudioBuffer ───────────────────────────
        let audioBuffer = bufferCache.get(cacheKey);

        if (!audioBuffer) {
          const res = await fetch('/api/simulator/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: japanese, speed, voice: 'shimmer' }),
          });
          if (!res.ok) throw new Error(`TTS ${res.status}`);

          const arrayBuffer = await res.arrayBuffer();
          // decodeAudioData is async but doesn't need the gesture context
          audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          bufferCache.set(cacheKey, audioBuffer);
        }

        // ── 4. Play ───────────────────────────────────────────────────────
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(0);
        sourceRef.current = source;
      } catch (err) {
        console.error('[FlashCardAudio]', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [japanese],
  );

  const isLoading = loadingNormal || loadingSlow;

  return (
    <div className="flex flex-col items-center gap-1.5 mt-2 mb-1">
      <div className="flex items-center justify-center gap-2">
        {/* Normal speed */}
        <button
          onClick={() => play(1.0, setLoadingNormal)}
          disabled={isLoading}
          title="Listen at normal speed"
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150
            ${accentBorder} ${accentText} ${accentHover}
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {loadingNormal
            ? <Loader2 size={13} className="animate-spin" />
            : <Volume2 size={13} />}
          <span>Listen</span>
        </button>

        {/* Slow speed */}
        <button
          onClick={() => play(0.7, setLoadingSlow)}
          disabled={isLoading}
          title="Listen slowly (0.7× speed)"
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150
            border-zinc-700 text-slate-400 hover:bg-zinc-800 hover:text-slate-200
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {loadingSlow
            ? <Loader2 size={13} className="animate-spin" />
            : <Volume2 size={13} className="scale-75 opacity-70" />}
          <span>Slow</span>
        </button>
      </div>

      {/* Error feedback */}
      {error && (
        <p className="flex items-center gap-1 text-[10px] text-red-400">
          <AlertCircle size={10} />
          Audio unavailable — check OPENAI_API_KEY
        </p>
      )}
    </div>
  );
}

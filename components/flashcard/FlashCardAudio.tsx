'use client';

import { useState, useRef, useCallback } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import type { Track } from '@/lib/types';

interface FlashCardAudioProps {
  japanese: string;
  track: Track;
}

// Client-side cache: avoids re-fetching the same word at the same speed
const audioCache = new Map<string, string>();

export default function FlashCardAudio({ japanese, track }: FlashCardAudioProps) {
  const [loadingNormal, setLoadingNormal] = useState(false);
  const [loadingSlow, setLoadingSlow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isTech = track === 'tech';
  const accentText = isTech ? 'text-cyan-400' : 'text-amber-400';
  const accentBorder = isTech ? 'border-cyan-500/30' : 'border-amber-500/30';
  const accentHover = isTech ? 'hover:bg-cyan-400/10' : 'hover:bg-amber-400/10';

  const play = useCallback(
    async (speed: number, setLoading: (v: boolean) => void) => {
      const cacheKey = `${japanese}::${speed}`;

      // Stop whatever is playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Serve from cache if available
      const cached = audioCache.get(cacheKey);
      if (cached) {
        const audio = new Audio(cached);
        audioRef.current = audio;
        audio.play();
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/simulator/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: japanese, speed, voice: 'shimmer' }),
        });
        if (!res.ok) throw new Error('TTS failed');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audioCache.set(cacheKey, url);

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
      } catch (err) {
        console.error('[FlashCardAudio]', err);
      } finally {
        setLoading(false);
      }
    },
    [japanese],
  );

  const isLoading = loadingNormal || loadingSlow;

  return (
    <div className="flex items-center justify-center gap-2 mt-2 mb-1">
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
          : <Volume2 size={13} className="scale-75" />}
        <span>Slow</span>
      </button>
    </div>
  );
}

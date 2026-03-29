'use client';

import { useCallback, useRef, useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { speakJapanese } from '@/lib/audio';

interface FlashCardAudioProps {
  text: string;
  audioUrl?: string | null;
}

export default function FlashCardAudio({ text, audioUrl }: FlashCardAudioProps) {
  const [speaking, setSpeaking] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (rate: number) => {
    // Cancel any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Use pre-generated URL at normal speed if available
    if (audioUrl && rate === 1.0) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setSpeaking(true);
      setActiveSpeed(1.0);
      audio.play();
      audio.onended = () => { setSpeaking(false); setActiveSpeed(null); audioRef.current = null; };
      return;
    }

    setSpeaking(true);
    setActiveSpeed(rate);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'ja-JP-Neural2-B', speed: rate }),
      });
      if (!res.ok) throw new Error('TTS error');
      const { audioContent } = await res.json();
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); setActiveSpeed(null); audioRef.current = null; };
      audio.onerror = () => { setSpeaking(false); setActiveSpeed(null); audioRef.current = null; };
      await audio.play();
    } catch {
      // TTS API unavailable — fall back to Web Speech API
      speakJapanese(text, rate);
      setSpeaking(false);
      setActiveSpeed(null);
    }
  }, [text, audioUrl]);

  return (
    <div className="flex items-center justify-center gap-2 mt-2 mb-1">
      <button
        onClick={() => speak(1.0)}
        disabled={speaking}
        title="Listen"
        className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-400/10 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {speaking && activeSpeed === 1.0 ? <Loader2 size={13} className="animate-spin" /> : <Volume2 size={13} />}
        <span>Listen</span>
      </button>

      <button
        onClick={() => speak(0.7)}
        disabled={speaking}
        title="Listen slowly"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-zinc-800 hover:text-slate-200 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {speaking && activeSpeed === 0.7 ? <Loader2 size={13} className="animate-spin" /> : <Volume2 size={13} className="scale-75 opacity-70" />}
        <span>Slow</span>
      </button>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

interface FlashCardAudioProps {
  text: string;           // hiragana/kanji text for Web Speech API fallback
  audioUrl?: string | null; // pre-generated TTS URL (lazy loaded on reveal)
}

function pickJapaneseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const japanese = voices.filter((v) => v.lang.startsWith('ja'));
  if (!japanese.length) return null;
  const preferred = ['kyoko', 'o-ren', 'haruka', 'google 日本語', 'google japanese'];
  return japanese.find((v) => preferred.some((n) => v.name.toLowerCase().includes(n))) ?? japanese[0];
}

export default function FlashCardAudio({ text, audioUrl }: FlashCardAudioProps) {
  const [speaking, setSpeaking] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const load = () => {
      voiceRef.current = pickJapaneseVoice();
      setReady(true);
    };
    if (window.speechSynthesis.getVoices().length) {
      load();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', load, { once: true });
    }
  }, []);

  // Preload audio URL when provided (lazy on reveal)
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.preload = 'auto';
    }
  }, [audioUrl]);

  const speak = useCallback(
    (rate: number) => {
      // If pre-generated audio exists and rate is normal, use it
      if (audioUrl && audioRef.current && rate === 1.0) {
        audioRef.current.playbackRate = 1.0;
        setSpeaking(true);
        setActiveSpeed(1.0);
        audioRef.current.play();
        audioRef.current.onended = () => { setSpeaking(false); setActiveSpeed(null); };
        return;
      }

      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ja-JP';
      utter.rate = rate;
      utter.pitch = 1.1;
      if (voiceRef.current) utter.voice = voiceRef.current;

      utter.onstart = () => { setSpeaking(true); setActiveSpeed(rate); };
      utter.onend = () => { setSpeaking(false); setActiveSpeed(null); };
      utter.onerror = () => { setSpeaking(false); setActiveSpeed(null); };

      window.speechSynthesis.speak(utter);
    },
    [text, audioUrl],
  );

  if (!ready) return null;

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

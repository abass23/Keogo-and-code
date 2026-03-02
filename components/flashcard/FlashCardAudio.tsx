'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import type { Track } from '@/lib/types';

interface FlashCardAudioProps {
  japanese: string;
  track: Track;
}

/** Pick the best available Japanese female voice, fall back to any ja-JP voice. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const japanese = voices.filter((v) => v.lang.startsWith('ja'));
  if (!japanese.length) return null;

  // Prefer explicitly female / high-quality voices by name
  const femaleNames = ['kyoko', 'o-ren', 'haruka', 'ichiro', 'google 日本語', 'google japanese'];
  const female = japanese.find((v) =>
    femaleNames.some((n) => v.name.toLowerCase().includes(n)),
  );
  return female ?? japanese[0];
}

export default function FlashCardAudio({ japanese, track }: FlashCardAudioProps) {
  const [speaking, setSpeaking] = useState(false);
  const [activeSpeed, setActiveSpeed] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const isTech = track === 'tech';
  const accentText = isTech ? 'text-cyan-400' : 'text-amber-400';
  const accentBorder = isTech ? 'border-cyan-500/30' : 'border-amber-500/30';
  const accentHover = isTech ? 'hover:bg-cyan-400/10' : 'hover:bg-amber-400/10';

  // Voices load asynchronously on some browsers
  useEffect(() => {
    const load = () => {
      voiceRef.current = pickVoice();
      setReady(true);
    };
    if (window.speechSynthesis.getVoices().length) {
      load();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', load, { once: true });
    }
  }, []);

  const speak = useCallback(
    (rate: number) => {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(japanese);
      utter.lang = 'ja-JP';
      utter.rate = rate;   // 1.0 = normal, 0.7 = slow
      utter.pitch = 1.1;   // slightly higher → sounds more natural / feminine
      if (voiceRef.current) utter.voice = voiceRef.current;

      utter.onstart = () => { setSpeaking(true); setActiveSpeed(rate); };
      utter.onend = () => { setSpeaking(false); setActiveSpeed(null); };
      utter.onerror = () => { setSpeaking(false); setActiveSpeed(null); };

      window.speechSynthesis.speak(utter);
    },
    [japanese],
  );

  if (!ready) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-2 mb-1">
      {/* Normal speed */}
      <button
        onClick={() => speak(1.0)}
        disabled={speaking}
        title="Listen at normal speed"
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150
          ${accentBorder} ${accentText} ${accentHover}
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {speaking && activeSpeed === 1.0
          ? <Loader2 size={13} className="animate-spin" />
          : <Volume2 size={13} />}
        <span>Listen</span>
      </button>

      {/* Slow speed */}
      <button
        onClick={() => speak(0.7)}
        disabled={speaking}
        title="Listen slowly"
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150
          border-zinc-700 text-slate-400 hover:bg-zinc-800 hover:text-slate-200
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {speaking && activeSpeed === 0.7
          ? <Loader2 size={13} className="animate-spin" />
          : <Volume2 size={13} className="scale-75 opacity-70" />}
        <span>Slow</span>
      </button>
    </div>
  );
}

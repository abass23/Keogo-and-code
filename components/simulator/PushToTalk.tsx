'use client';

import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

type Status = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface PushToTalkProps {
  status: Status;
  transcript: string;
  hasSpeechSupport: boolean;
  accentColor: 'cyan' | 'amber' | 'violet' | 'blue';
  onStartListening: () => void;
  onStopListening: () => void;
}

export default function PushToTalk({
  status,
  transcript,
  hasSpeechSupport,
  accentColor,
  onStartListening,
  onStopListening,
}: PushToTalkProps) {
  const isTech = accentColor === 'cyan';

  const ringClass = isTech
    ? 'ring-cyan-400/60 shadow-[0_0_24px_rgba(34,211,238,0.35)]'
    : 'ring-amber-400/60 shadow-[0_0_24px_rgba(251,191,36,0.35)]';
  const btnActiveClass = isTech
    ? 'bg-cyan-400 text-zinc-950'
    : 'bg-amber-400 text-zinc-950';
  const btnIdleClass = isTech
    ? 'bg-zinc-800 border-cyan-500/30 text-cyan-400 hover:bg-cyan-400/10'
    : 'bg-zinc-800 border-amber-500/30 text-amber-400 hover:bg-amber-400/10';

  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isSpeaking = status === 'speaking';
  const isDisabled = isProcessing || isSpeaking || !hasSpeechSupport;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Transcript preview */}
      <div className="min-h-[36px] flex items-center justify-center px-4">
        {isListening && transcript && (
          <p className="text-sm text-slate-300 font-jp text-center animate-pulse">{transcript}</p>
        )}
        {isListening && !transcript && (
          <p className="text-xs text-slate-500 uppercase tracking-widest animate-pulse">Listening…</p>
        )}
        {isProcessing && (
          <p className="text-xs text-slate-500 uppercase tracking-widest">Processing…</p>
        )}
        {isSpeaking && (
          <p className="text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Volume2 size={12} className="animate-pulse" />
            AI speaking…
          </p>
        )}
      </div>

      {/* Mic button */}
      <button
        onClick={!isDisabled ? (isListening ? onStopListening : onStartListening) : undefined}
        disabled={isDisabled}
        aria-label={isListening ? 'Tap to send' : 'Tap to speak'}
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-200 select-none touch-none
          ${isListening ? `${btnActiveClass} ring-4 ${ringClass}` : btnIdleClass}
          ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isProcessing ? (
          <Loader2 size={22} className="animate-spin" />
        ) : isListening ? (
          <MicOff size={22} />
        ) : (
          <Mic size={22} />
        )}
      </button>

      <p className="text-[11px] text-slate-600 text-center">
        {!hasSpeechSupport
          ? 'Speech not supported — use Chrome'
          : isListening
          ? 'Tap to send'
          : isDisabled
          ? ''
          : 'Tap to speak'}
      </p>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import type { ScenarioId } from '@/lib/simulatorTypes';
import { SCENARIOS } from '@/lib/simulatorScenarios';
import { useSimulator } from '@/hooks/useSimulator';
import ConversationBubble from './ConversationBubble';
import PushToTalk from './PushToTalk';

interface SimulatorChatProps {
  initialScenario?: ScenarioId;
  onBack?: () => void;
}

export default function SimulatorChat({ initialScenario, onBack }: SimulatorChatProps) {
  const {
    scenario,
    messages,
    status,
    transcript,
    errorMsg,
    startScenario,
    resetScenario,
    startListening,
    stopListening,
    hasSpeechSupport,
  } = useSimulator();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-start if scenario passed
  useEffect(() => {
    if (initialScenario) startScenario(initialScenario);
  }, [initialScenario, startScenario]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!scenario) return null;

  const meta = SCENARIOS[scenario];
  const isTech = meta.accentColor === 'cyan';
  const accentText = isTech ? 'text-cyan-400' : 'text-amber-400';
  const accentBorder = isTech ? 'border-cyan-500/20' : 'border-amber-500/20';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-2xl mx-auto">
      {/* Chat header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${accentBorder} bg-zinc-950/60 backdrop-blur`}>
        <button
          onClick={() => { resetScenario(); onBack?.(); }}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={15} />
          Scenarios
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <span>{meta.aiAvatar}</span>
          <span>{meta.aiName}</span>
          <span className={`text-xs ${accentText}`}>· {meta.aiRole}</span>
        </div>
        <button
          onClick={() => startScenario(scenario)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          title="Restart scenario"
        >
          <RotateCcw size={13} />
          Restart
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.map((msg) => (
          <ConversationBubble key={msg.id} message={msg} scenario={scenario} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-700/40 bg-red-950/30 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      {/* Push-to-talk bar */}
      <div className={`border-t ${accentBorder} bg-zinc-950/80 backdrop-blur px-4 py-5`}>
        <PushToTalk
          status={status as 'idle' | 'listening' | 'processing' | 'speaking' | 'error'}
          transcript={transcript}
          hasSpeechSupport={hasSpeechSupport}
          accentColor={meta.accentColor}
          onStartListening={startListening}
          onStopListening={stopListening}
        />
      </div>
    </div>
  );
}

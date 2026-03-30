'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, AlertCircle, Send } from 'lucide-react';
import type { ScenarioId } from '@/lib/simulatorTypes';
import { SCENARIOS } from '@/lib/simulatorScenarios';
import { useSimulator } from '@/hooks/useSimulator';
import { useAppStore } from '@/stores/app-store';
import ConversationBubble from './ConversationBubble';
import PushToTalk from './PushToTalk';

interface SimulatorChatProps {
  initialScenario?: ScenarioId;
  onBack?: () => void;
}

const ACCENT_BORDER = {
  cyan:   'border-cyan-500/20',
  violet: 'border-violet-500/20',
  amber:  'border-amber-500/20',
  blue:   'border-blue-500/20',
};

export default function SimulatorChat({ initialScenario, onBack }: SimulatorChatProps) {
  const locale = useAppStore((s) => s.locale);
  const [textInput, setTextInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

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
    sendMessage,
    hasSpeechSupport,
  } = useSimulator();

  useEffect(() => {
    if (initialScenario) startScenario(initialScenario);
  }, [initialScenario, startScenario]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!scenario) return null;

  const meta = SCENARIOS[scenario];
  const accentBorder = ACCENT_BORDER[meta.accentColor];
  const isProcessing = status === 'processing';

  async function handleTextSend(e: React.FormEvent) {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const text = textInput;
    setTextInput('');
    await sendMessage(text);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${accentBorder} bg-zinc-950/60 backdrop-blur`}>
        <button
          onClick={() => { resetScenario(); onBack?.(); }}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={15} />
          {locale === 'fr' ? 'Modes' : 'Modes'}
        </button>

        <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
          <span>{meta.icon}</span>
          <span>{locale === 'fr' ? meta.title_fr : meta.title_en}</span>
        </div>

        <button
          onClick={() => startScenario(scenario)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <RotateCcw size={13} />
          {locale === 'fr' ? 'Restart' : 'Restart'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.map((msg) => (
          <ConversationBubble key={msg.id} message={msg} scenario={scenario} />
        ))}
        {isProcessing && (
          <div className="flex gap-2 items-center text-slate-500 text-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-700/40 bg-red-950/30 px-4 py-3 text-xs text-red-300">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      {/* Input bar */}
      <div className={`border-t ${accentBorder} bg-zinc-950/80 backdrop-blur px-4 py-4 space-y-3`}>
        {/* Push-to-talk */}
        <PushToTalk
          status={status as 'idle' | 'listening' | 'processing' | 'speaking' | 'error'}
          transcript={transcript}
          hasSpeechSupport={hasSpeechSupport}
          accentColor={meta.accentColor}
          onStartListening={startListening}
          onStopListening={stopListening}
        />

        {/* Text input fallback */}
        <form onSubmit={handleTextSend} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={locale === 'fr' ? 'Saisir en japonais...' : 'Type in Japanese...'}
            disabled={isProcessing}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-jp text-slate-100 placeholder-slate-600 focus:outline-none focus:border-zinc-500 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-slate-400 hover:text-slate-200 hover:border-zinc-600 disabled:opacity-40 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

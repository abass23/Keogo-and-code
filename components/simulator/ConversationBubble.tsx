'use client';

import type { SimulatorMessage, ScenarioId } from '@/lib/simulatorTypes';
import { SCENARIOS } from '@/lib/simulatorScenarios';

interface ConversationBubbleProps {
  message: SimulatorMessage;
  scenario: ScenarioId;
}

const ACCENT_CLASSES = {
  cyan:   { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-500/20' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-500/20' },
  amber:  { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20' },
  blue:   { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/20' },
};

export default function ConversationBubble({ message, scenario }: ConversationBubbleProps) {
  const meta = SCENARIOS[scenario];
  const c = ACCENT_CLASSES[meta.accentColor];

  if (message.role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%] flex flex-col gap-1 items-end">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-slate-200 font-jp leading-relaxed">
            {message.text}
          </div>
          <span className="text-[10px] text-slate-600">You</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs shrink-0 mt-0.5 font-jp">
          あ
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${c.bg} border ${c.border}`}>
        {meta.icon}
      </div>

      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className={`rounded-2xl rounded-tl-sm border px-4 py-3 ${c.border} bg-zinc-900`}>
          <p className="font-jp text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
            {message.text}
            {message.isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
            )}
          </p>
        </div>
        <span className="text-[10px] text-slate-600 pl-1">{meta.icon} AI Tutor</span>
      </div>
    </div>
  );
}

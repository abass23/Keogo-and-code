'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import type { SimulatorMessage } from '@/lib/simulatorTypes';
import type { ScenarioId } from '@/lib/simulatorTypes';
import { SCENARIOS } from '@/lib/simulatorScenarios';

interface ConversationBubbleProps {
  message: SimulatorMessage;
  scenario: ScenarioId;
}

export default function ConversationBubble({ message, scenario }: ConversationBubbleProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = SCENARIOS[scenario];
  const isTech = meta.accentColor === 'cyan';

  if (message.role === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%] flex flex-col gap-1 items-end">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-slate-200 font-jp">
            {message.text}
          </div>
          <span className="text-[10px] text-slate-600">You</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
          あ
        </div>
      </div>
    );
  }

  // AI message
  const accentText = isTech ? 'text-cyan-400' : 'text-amber-400';
  const accentBg = isTech ? 'bg-cyan-400/10' : 'bg-amber-400/10';
  const accentBorder = isTech ? 'border-cyan-500/20' : 'border-amber-500/20';
  const hasGoodFeedback = message.grammarFeedback?.toLowerCase().includes('perfect') ||
    message.grammarFeedback?.toLowerCase().includes('no correction');

  return (
    <div className="flex gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${accentBg} border ${accentBorder}`}
      >
        {meta.aiAvatar}
      </div>

      <div className="flex flex-col gap-2 max-w-[85%]">
        {/* AI reply bubble */}
        <div className={`rounded-2xl rounded-tl-sm border px-4 py-3 ${accentBorder} bg-zinc-900`}>
          <p className="font-jp text-base text-slate-100 leading-relaxed">{message.japanese}</p>
          {message.romaji && (
            <p className={`text-xs mt-1 ${accentText}`}>{message.romaji}</p>
          )}
          {message.english && (
            <p className="text-xs text-slate-500 mt-0.5 italic">{message.english}</p>
          )}
        </div>

        {/* Grammar feedback — collapsible */}
        {message.grammarFeedback && (
          <div
            className={`rounded-xl border px-3 py-2.5 text-xs leading-relaxed transition-all ${
              hasGoodFeedback
                ? 'border-emerald-700/30 bg-emerald-950/30'
                : 'border-yellow-700/30 bg-yellow-950/20'
            }`}
          >
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-between gap-2 text-left"
            >
              <span className="flex items-center gap-1.5">
                {hasGoodFeedback ? (
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle size={12} className="text-yellow-400 shrink-0" />
                )}
                <span className={hasGoodFeedback ? 'text-emerald-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                  Grammar feedback
                </span>
              </span>
              {expanded ? (
                <ChevronUp size={12} className="text-slate-500 shrink-0" />
              ) : (
                <ChevronDown size={12} className="text-slate-500 shrink-0" />
              )}
            </button>

            {expanded && (
              <div className="mt-2 space-y-1.5">
                <p className="text-slate-300">{message.grammarFeedback}</p>
                {message.correctedJapanese && (
                  <div className="mt-2 pt-2 border-t border-zinc-700/50">
                    <span className="text-slate-500">Corrected: </span>
                    <span className="font-jp text-slate-200">{message.correctedJapanese}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <span className="text-[10px] text-slate-600">{meta.aiName}</span>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import GrammarFurigana from './GrammarFurigana';
import type { GrammarExercise, ContextMatchQuestion, ContextOption } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface ContextMatchProps {
  exercise: GrammarExercise;
  locale: Locale;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

const LEVEL_LABELS: Record<ContextOption['level'], { en: string; fr: string; color: string }> = {
  casual:  { en: 'Casual (タメ口)',     fr: 'Familier (タメ口)',       color: 'text-slate-400' },
  polite:  { en: 'Polite (です/ます)',  fr: 'Poli (です/ます)',         color: 'text-blue-400'  },
  keigo:   { en: 'Keigo (敬語)',        fr: 'Keigo (敬語)',             color: 'text-violet-400' },
};

export default function ContextMatch({ exercise, locale, onAnswer }: ContextMatchProps) {
  const question = exercise.question as ContextMatchQuestion;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(index: number) {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
    const opt = question.options[index];
    onAnswer(opt.text, opt.is_correct, 1, false);
  }

  function getOptionStyle(i: number, opt: ContextOption): string {
    const base = 'w-full text-left p-4 rounded-xl border transition-all ';
    if (!revealed) {
      return base + (selected === i
        ? 'border-cyan-400 bg-cyan-950/30'
        : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 cursor-pointer');
    }
    if (opt.is_correct) return base + 'border-emerald-500 bg-emerald-950/30';
    if (selected === i) return base + 'border-red-500 bg-red-950/20';
    return base + 'border-slate-700 bg-slate-800/30 opacity-60';
  }

  return (
    <div className="space-y-5">
      {/* Situation */}
      <div className="bg-slate-800/60 rounded-2xl p-4 space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Situation' : 'Situation'}
        </p>
        <p className="text-sm text-slate-300">
          {locale === 'fr' ? question.situation_fr : question.situation_en}
        </p>
      </div>

      {/* Sentence with blank */}
      <div className="bg-slate-900/60 rounded-2xl p-4 text-center">
        <p className="text-lg font-jp text-slate-100"><GrammarFurigana text={question.sentence} /></p>
        <p className="text-xs text-slate-500 mt-2">
          {locale === 'fr' ? 'Quel niveau de politesse ?' : 'Which politeness level?'}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const levelInfo = LEVEL_LABELS[opt.level];
          return (
            <button key={i} className={getOptionStyle(i, opt)} onClick={() => handleSelect(i)}>
              <div className="flex items-start gap-3">
                <span className={`text-xs font-medium shrink-0 mt-0.5 ${levelInfo.color}`}>
                  {locale === 'fr' ? levelInfo.fr : levelInfo.en}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="font-jp text-slate-200"><GrammarFurigana text={opt.text} /></p>
                  {revealed && (
                    <p className="text-xs text-slate-400">
                      {locale === 'fr' ? opt.explanation_fr : opt.explanation_en}
                    </p>
                  )}
                </div>
                {revealed && (
                  <div className="shrink-0">
                    {opt.is_correct
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : selected === i
                      ? <XCircle className="w-5 h-5 text-red-400" />
                      : null}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

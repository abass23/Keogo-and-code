'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import GrammarFurigana from './GrammarFurigana';
import type { GrammarExercise, MCQQuestion, MCQOption } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface MCQExerciseProps {
  exercise: GrammarExercise;
  locale: Locale;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

export default function MCQExercise({ exercise, locale, onAnswer }: MCQExerciseProps) {
  const question = exercise.question as MCQQuestion;
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(index: number) {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
    const opt = question.options[index];
    onAnswer(opt.text, opt.is_correct, 1, false);
  }

  function getOptionStyle(index: number, opt: MCQOption): string {
    const base = 'w-full text-left p-4 rounded-xl border transition-all ';
    if (!revealed) {
      return base + (selected === index
        ? 'border-cyan-400 bg-cyan-950/30 text-slate-100'
        : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 text-slate-200 cursor-pointer');
    }
    if (opt.is_correct) return base + 'border-emerald-500 bg-emerald-950/30 text-emerald-300';
    if (selected === index && !opt.is_correct) return base + 'border-red-500 bg-red-950/20 text-red-300';
    return base + 'border-slate-700 bg-slate-800/40 text-slate-500';
  }

  return (
    <div className="space-y-5">
      {/* Sentence */}
      <div className="bg-slate-800/60 rounded-2xl p-5 text-center space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Choisissez la bonne forme' : 'Choose the correct form'}
        </p>
        <p className="text-xl font-jp text-slate-100"><GrammarFurigana text={question.sentence} /></p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <button key={i} className={getOptionStyle(i, opt)} onClick={() => handleSelect(i)}>
            <div className="flex items-start gap-3">
              <span className="text-slate-500 font-mono text-sm mt-0.5 shrink-0">
                {String.fromCharCode(65 + i)})
              </span>
              <div className="flex-1 space-y-1">
                <p className="font-jp">{opt.text}</p>
                {/* Show explanation for all options after answering */}
                {revealed && (
                  <p className="text-xs text-slate-400">
                    {locale === 'fr' ? opt.explanation_fr : opt.explanation_en}
                  </p>
                )}
              </div>
              {revealed && (
                <div className="shrink-0 mt-0.5">
                  {opt.is_correct
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : selected === i
                    ? <XCircle className="w-5 h-5 text-red-400" />
                    : null}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

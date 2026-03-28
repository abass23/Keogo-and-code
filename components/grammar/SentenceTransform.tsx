'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { validateAnswer, normalizeAnswer } from '@/lib/grammar-srs';
import type { GrammarExercise, TransformQuestion } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface SentenceTransformProps {
  exercise: GrammarExercise;
  locale: Locale;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

export default function SentenceTransform({ exercise, locale, onAnswer }: SentenceTransformProps) {
  const question = exercise.question as TransformQuestion;
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [shownHintIndex, setShownHintIndex] = useState(-1);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function submit() {
    if (!input.trim()) return;
    const correct = validateAnswer(input, exercise.answers);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (correct) {
      onAnswer(normalizeAnswer(input), true, newAttempts, usedHint);
      return;
    }

    triggerShake();
    if (newAttempts >= 3) {
      onAnswer(input, false, newAttempts, usedHint);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  return (
    <div className="space-y-5">
      {/* Original sentence */}
      <div className="bg-slate-800/60 rounded-2xl p-4 space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Phrase originale' : 'Original sentence'}
        </p>
        <p className="font-jp text-slate-100 text-lg">{question.original}</p>
      </div>

      {/* Instruction */}
      <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4 space-y-1">
        <p className="text-xs text-cyan-400 uppercase tracking-wide">
          {locale === 'fr' ? 'Instruction' : 'Instruction'}
        </p>
        <p className="text-sm text-slate-300">
          {locale === 'fr' ? question.instruction_fr : question.instruction_en}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-slate-500">
            {locale === 'fr' ? 'Modèle cible :' : 'Target pattern:'}
          </span>
          <span className="text-sm font-jp text-cyan-300 bg-slate-800 px-2 py-0.5 rounded">
            {question.pattern_hint}
          </span>
        </div>
      </div>

      {/* Hints */}
      {shownHintIndex >= 0 && (
        <div className="space-y-2">
          {exercise.hints.slice(0, shownHintIndex + 1).map((hint, i) => (
            <div key={i} className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3">
              <p className="text-sm text-cyan-300">💡 {hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Transform arrow + input */}
      <div className="flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
        <span className="text-xs text-slate-500">
          {locale === 'fr' ? 'Votre transformation :' : 'Your rewrite:'}
        </span>
      </div>

      <div className={shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}>
        <div className="space-y-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submit())}
            placeholder={locale === 'fr' ? 'Réécrivez la phrase...' : 'Rewrite the sentence...'}
            rows={2}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-lg font-jp text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={!input.trim()}
              className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold transition-colors"
            >
              {locale === 'fr' ? 'Soumettre' : 'Submit'}
            </button>
            {attempts > 0 && shownHintIndex < exercise.hints.length - 1 && (
              <button
                onClick={() => { setShownHintIndex((i) => i + 1); setUsedHint(true); }}
                className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
              >
                {locale === 'fr' ? 'Indice' : 'Hint'}
              </button>
            )}
          </div>
        </div>
      </div>

      {attempts > 0 && (
        <p className="text-center text-xs text-slate-500">
          {locale === 'fr' ? `Tentative ${attempts}/3` : `Attempt ${attempts}/3`}
        </p>
      )}
    </div>
  );
}

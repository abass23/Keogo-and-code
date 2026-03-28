'use client';
import { useState, useRef, useEffect } from 'react';
import { validateAnswer, isCloseAnswer, normalizeAnswer } from '@/lib/grammar-srs';
import type { GrammarExercise, FillBlankQuestion } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface FillBlankExerciseProps {
  exercise: GrammarExercise;
  locale: Locale;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

export default function FillBlankExercise({ exercise, locale, onAnswer }: FillBlankExerciseProps) {
  const question = exercise.question as FillBlankQuestion;
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [shownHintIndex, setShownHintIndex] = useState(-1);
  const [shake, setShake] = useState(false);
  const [isClose, setIsClose] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const parts = question.sentence.split('＿＿');

  function submit() {
    if (!input.trim()) return;

    const correct = validateAnswer(input, exercise.answers);
    const close = !correct && isCloseAnswer(input, exercise.answers);
    const newAttempts = attempts + 1;

    if (correct) {
      onAnswer(normalizeAnswer(input), true, newAttempts, usedHint);
      return;
    }

    if (close && newAttempts < 3) {
      setIsClose(true);
      setAttempts(newAttempts);
      triggerShake();
      return;
    }

    setIsClose(false);
    setAttempts(newAttempts);
    triggerShake();

    if (newAttempts >= 3) {
      // Reveal
      onAnswer(input, false, newAttempts, usedHint);
    }
  }

  function showNextHint() {
    const nextIdx = shownHintIndex + 1;
    if (nextIdx < exercise.hints.length) {
      setShownHintIndex(nextIdx);
      setUsedHint(true);
    }
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submit();
  }

  return (
    <div className="space-y-5">
      {/* Sentence with blank */}
      <div className="bg-slate-800/60 rounded-2xl p-5 text-center space-y-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Complétez la phrase' : 'Fill in the blank'}
        </p>
        <p className="text-xl font-jp text-slate-100 leading-relaxed">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className="inline-block min-w-[80px] border-b-2 border-cyan-400 mx-1 align-bottom text-cyan-300 font-medium">
                  {input || '\u00A0\u00A0\u00A0\u00A0'}
                </span>
              )}
            </span>
          ))}
        </p>
        {/* Hint label */}
        <p className="text-sm text-slate-400 italic">
          ({locale === 'fr' ? question.hint_fr : question.hint_en})
        </p>
      </div>

      {/* Nudge for close answers */}
      {isClose && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-center">
          <p className="text-sm text-amber-300">
            {locale === 'fr' ? 'Presque ! Vérifiez la forme...' : 'Close! Check the verb form...'}
          </p>
        </div>
      )}

      {/* Progressive hints */}
      {shownHintIndex >= 0 && (
        <div className="space-y-2">
          {exercise.hints.slice(0, shownHintIndex + 1).map((hint, i) => (
            <div key={i} className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3">
              <p className="text-sm text-cyan-300">💡 {hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={`space-y-3 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setIsClose(false); }}
          onKeyDown={handleKey}
          placeholder={locale === 'fr' ? 'Tapez votre réponse...' : 'Type your answer...'}
          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-lg font-jp text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          autoComplete="off"
          autoCorrect="off"
        />
        <div className="flex gap-3">
          <button
            onClick={submit}
            disabled={!input.trim()}
            className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {locale === 'fr' ? 'Valider' : 'Check'}
          </button>
          {attempts > 0 && shownHintIndex < exercise.hints.length - 1 && (
            <button
              onClick={showNextHint}
              className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
            >
              {locale === 'fr' ? 'Indice' : 'Hint'}
            </button>
          )}
        </div>
      </div>

      {/* Attempt counter */}
      {attempts > 0 && (
        <p className="text-center text-xs text-slate-500">
          {locale === 'fr' ? `Tentative ${attempts}/3` : `Attempt ${attempts}/3`}
        </p>
      )}
    </div>
  );
}

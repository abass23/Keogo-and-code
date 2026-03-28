'use client';
import { useState, useRef, useEffect } from 'react';
import { validateAnswer } from '@/lib/grammar-srs';
import type { GrammarExercise, ErrorSpotterQuestion } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface ErrorSpotterProps {
  exercise: GrammarExercise;
  locale: Locale;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

export default function ErrorSpotter({ exercise, locale, onAnswer }: ErrorSpotterProps) {
  const question = exercise.question as ErrorSpotterQuestion;
  const [errorSelected, setErrorSelected] = useState(false);
  const [correction, setCorrection] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [shownHintIndex, setShownHintIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Split sentence around error segment for tap highlighting
  const errorIdx = question.sentence.indexOf(question.error_segment);
  const before = errorIdx >= 0 ? question.sentence.slice(0, errorIdx) : question.sentence;
  const errorPart = errorIdx >= 0 ? question.error_segment : '';
  const after = errorIdx >= 0 ? question.sentence.slice(errorIdx + errorPart.length) : '';

  function selectError() {
    if (!errorSelected) {
      setErrorSelected(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function submitCorrection() {
    if (!correction.trim()) return;
    const correct = validateAnswer(correction, exercise.answers);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (correct || newAttempts >= 3) {
      onAnswer(correction, correct, newAttempts, usedHint);
    }
  }

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div className="bg-slate-800/60 rounded-2xl p-4 text-center space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Trouvez et corrigez l\'erreur' : 'Find and fix the error'}
        </p>
        <p className="text-sm text-slate-400">
          {locale === 'fr'
            ? 'Appuyez sur la partie incorrecte, puis tapez la correction.'
            : 'Tap the incorrect part, then type the correction.'}
        </p>
      </div>

      {/* Sentence with tappable error segment */}
      <div className="bg-slate-900/60 rounded-2xl p-5 text-center">
        <p className="text-xl font-jp text-slate-100 leading-relaxed">
          <span>{before}</span>
          <button
            onClick={selectError}
            className={`inline mx-1 px-1 rounded transition-all ${
              errorSelected
                ? 'bg-amber-500/30 border border-amber-500 text-amber-300 line-through'
                : 'bg-slate-700/60 border border-slate-600 text-slate-200 hover:bg-amber-900/30 hover:border-amber-500/50 hover:text-amber-300'
            }`}
          >
            {errorPart}
          </button>
          <span>{after}</span>
        </p>
      </div>

      {/* Correction input (shown after tapping) */}
      {errorSelected && (
        <div className="space-y-3 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500">
              {locale === 'fr' ? 'Tapez la correction' : 'Type the correction'}
            </span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCorrection()}
            placeholder={locale === 'fr' ? 'Correction...' : 'Correction...'}
            className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-4 py-3 text-lg font-jp text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      )}

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

      {/* Submit buttons */}
      {errorSelected && (
        <div className="flex gap-3">
          <button
            onClick={submitCorrection}
            disabled={!correction.trim()}
            className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold transition-colors"
          >
            {locale === 'fr' ? 'Corriger' : 'Submit'}
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
      )}

      {!errorSelected && (
        <p className="text-center text-xs text-slate-500">
          {locale === 'fr' ? '👆 Appuyez sur la partie incorrecte pour commencer' : '👆 Tap the incorrect part to start'}
        </p>
      )}
    </div>
  );
}

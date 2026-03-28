'use client';
import { useState } from 'react';
import { validateAnswer } from '@/lib/grammar-srs';
import type { GrammarExercise, SentenceBuilderQuestion } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface SentenceBuilderProps {
  exercise: GrammarExercise;
  locale: Locale;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

export default function SentenceBuilder({ exercise, locale, onAnswer }: SentenceBuilderProps) {
  const question = exercise.question as SentenceBuilderQuestion;
  const distractors = exercise.distractors ?? [];

  // Shuffle tiles on mount
  const [availableTiles, setAvailableTiles] = useState<string[]>(() =>
    [...question.tiles].sort(() => Math.random() - 0.5),
  );
  const [builtSentence, setBuiltSentence] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [shownHintIndex, setShownHintIndex] = useState(-1);

  function addTile(tile: string, fromIndex: number) {
    setAvailableTiles((prev) => prev.filter((_, i) => i !== fromIndex));
    setBuiltSentence((prev) => [...prev, tile]);
  }

  function removeTile(tile: string, fromIndex: number) {
    setBuiltSentence((prev) => prev.filter((_, i) => i !== fromIndex));
    setAvailableTiles((prev) => [...prev, tile]);
  }

  function checkAnswer() {
    const answer = builtSentence.join('');
    const correct = validateAnswer(answer, exercise.answers);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (correct || newAttempts >= 3) {
      onAnswer(answer, correct, newAttempts, usedHint);
    }
  }

  function reset() {
    setAvailableTiles([...question.tiles].sort(() => Math.random() - 0.5));
    setBuiltSentence([]);
  }

  const isDistractor = (tile: string) => distractors.includes(tile);

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div className="bg-slate-800/60 rounded-2xl p-4 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
          {locale === 'fr' ? 'Construisez la phrase' : 'Build the sentence'}
        </p>
        <p className="text-sm text-slate-400">
          {locale === 'fr'
            ? 'Tapez les tuiles dans le bon ordre. Ignorez les intrus !'
            : 'Tap the tiles in the correct order. Ignore the distractors!'}
        </p>
      </div>

      {/* Built sentence area */}
      <div className="min-h-[72px] bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-2xl p-3 flex flex-wrap gap-2 items-start">
        {builtSentence.length === 0 ? (
          <p className="text-slate-600 text-sm self-center w-full text-center">
            {locale === 'fr' ? 'Tapez une tuile pour commencer...' : 'Tap a tile to start...'}
          </p>
        ) : (
          builtSentence.map((tile, i) => (
            <button
              key={`built-${i}`}
              onClick={() => removeTile(tile, i)}
              className="bg-cyan-800/60 border border-cyan-500/40 text-cyan-200 font-jp px-3 py-1.5 rounded-lg text-sm hover:bg-cyan-700/60 hover:border-cyan-400 transition-colors"
            >
              {tile}
            </button>
          ))
        )}
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

      {/* Available tiles */}
      <div className="flex flex-wrap gap-2">
        {availableTiles.map((tile, i) => (
          <button
            key={`avail-${i}`}
            onClick={() => addTile(tile, i)}
            className={`font-jp px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              isDistractor(tile)
                ? 'bg-slate-800/40 border-slate-600/30 text-slate-500 hover:border-slate-500 hover:text-slate-400'
                : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-400'
            }`}
          >
            {tile}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={checkAnswer}
          disabled={builtSentence.length === 0}
          className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold transition-colors"
        >
          {locale === 'fr' ? 'Vérifier' : 'Check'}
        </button>
        <button
          onClick={reset}
          className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
        >
          {locale === 'fr' ? 'Réinitialiser' : 'Reset'}
        </button>
        {attempts > 0 && shownHintIndex < exercise.hints.length - 1 && (
          <button
            onClick={() => { setShownHintIndex((i) => i + 1); setUsedHint(true); }}
            className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors"
          >
            💡
          </button>
        )}
      </div>
    </div>
  );
}

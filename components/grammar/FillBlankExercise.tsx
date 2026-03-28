'use client';
import { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import { validateAnswer, isCloseAnswer, normalizeAnswer } from '@/lib/grammar-srs';
import { useJapaneseInput } from '@/hooks/useJapaneseInput';
import JapaneseKeyboard from './JapaneseKeyboard';
import GrammarFurigana from './GrammarFurigana';
import type { GrammarExercise, FillBlankQuestion } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface Props {
  exercise: GrammarExercise;
  locale: Locale;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

export default function FillBlankExercise({ exercise, locale, onAnswer }: Props) {
  const question = exercise.question as FillBlankQuestion;
  const { value: input, setValue: setInput, inputRef, keyboardVisible, toggleKeyboard, insertChar, deleteChar } = useJapaneseInput();

  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [shownHintIndex, setShownHintIndex] = useState(-1);
  const [shake, setShake] = useState(false);
  const [isClose, setIsClose] = useState(false);

  useEffect(() => { (inputRef.current as HTMLInputElement | null)?.focus(); }, []);

  const parts = question.sentence.split('＿＿');

  function submit() {
    if (!input.trim()) return;
    const correct = validateAnswer(input, exercise.answers);
    const close = !correct && isCloseAnswer(input, exercise.answers);
    const newAttempts = attempts + 1;

    if (correct) { onAnswer(normalizeAnswer(input), true, newAttempts, usedHint); return; }

    if (close && newAttempts < 3) { setIsClose(true); setAttempts(newAttempts); triggerShake(); return; }

    setIsClose(false);
    setAttempts(newAttempts);
    triggerShake();
    if (newAttempts >= 3) onAnswer(input, false, newAttempts, usedHint);
  }

  function triggerShake() { setShake(true); setTimeout(() => setShake(false), 500); }

  return (
    <div className="space-y-4">
      {/* Sentence with always-on furigana */}
      <div className="bg-slate-800/60 rounded-2xl p-5 text-center space-y-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Complétez la phrase' : 'Fill in the blank'}
        </p>
        <p className="text-xl font-jp text-slate-100 leading-loose">
          {parts.map((part, i) => (
            <span key={i}>
              <GrammarFurigana text={part} />
              {i < parts.length - 1 && (
                <span className="inline-block min-w-[80px] border-b-2 border-cyan-400 mx-1 align-bottom text-cyan-300 font-medium">
                  {input || '\u00A0\u00A0\u00A0\u00A0'}
                </span>
              )}
            </span>
          ))}
        </p>
        <p className="text-sm text-slate-400 italic">
          ({locale === 'fr' ? question.hint_fr : question.hint_en})
        </p>
      </div>

      {isClose && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-center">
          <p className="text-sm text-amber-300">
            {locale === 'fr' ? 'Presque ! Vérifiez la forme...' : 'Close! Check the verb form...'}
          </p>
        </div>
      )}

      {shownHintIndex >= 0 && (
        <div className="space-y-2">
          {exercise.hints.slice(0, shownHintIndex + 1).map((hint, i) => (
            <div key={i} className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3">
              <p className="text-sm text-cyan-300">💡 {hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className={shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setIsClose(false); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={locale === 'fr' ? 'Tapez ou utilisez le clavier JP...' : 'Type or use JP keyboard...'}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-lg font-jp text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              autoComplete="off" autoCorrect="off" autoCapitalize="off"
            />
            <button
              type="button"
              onClick={toggleKeyboard}
              className={`px-3 rounded-xl border transition-colors ${keyboardVisible ? 'bg-cyan-700/30 border-cyan-500/50 text-cyan-300' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-slate-200'}`}
              aria-label="Toggle Japanese keyboard"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={submit} disabled={!input.trim()} className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors">
              {locale === 'fr' ? 'Valider' : 'Check'}
            </button>
            {attempts > 0 && shownHintIndex < exercise.hints.length - 1 && (
              <button onClick={() => { setShownHintIndex((i) => i + 1); setUsedHint(true); }} className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-colors">
                {locale === 'fr' ? 'Indice' : 'Hint'}
              </button>
            )}
          </div>
        </div>
      </div>

      {keyboardVisible && <JapaneseKeyboard onChar={insertChar} onDelete={deleteChar} />}

      {attempts > 0 && (
        <p className="text-center text-xs text-slate-500">
          {locale === 'fr' ? `Tentative ${attempts}/3` : `Attempt ${attempts}/3`}
        </p>
      )}
    </div>
  );
}

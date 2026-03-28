'use client';
import { useState, useEffect, useRef } from 'react';
import { Timer, Keyboard } from 'lucide-react';
import { validateAnswer, isCloseAnswer, normalizeAnswer } from '@/lib/grammar-srs';
import { useJapaneseInput } from '@/hooks/useJapaneseInput';
import JapaneseKeyboard from './JapaneseKeyboard';
import type { GrammarExercise, ConjugationQuestion } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface Props {
  exercise: GrammarExercise;
  locale: Locale;
  timerMode?: boolean;
  onAnswer: (answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) => void;
}

const TIMER_SECONDS = 15;

export default function ConjugationExercise({ exercise, locale, timerMode = false, onAnswer }: Props) {
  const question = exercise.question as ConjugationQuestion;
  const { value: input, setValue: setInput, inputRef, keyboardVisible, toggleKeyboard, insertChar, deleteChar } = useJapaneseInput();

  const [attempts, setAttempts] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [shownHintIndex, setShownHintIndex] = useState(-1);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (inputRef.current as HTMLInputElement | null)?.focus();
    if (timerMode) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { clearInterval(timerRef.current!); onAnswer('', false, attempts + 1, usedHint); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function submit() {
    if (!input.trim()) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = validateAnswer(input, exercise.answers);
    const close = !correct && isCloseAnswer(input, exercise.answers);
    const newAttempts = attempts + 1;

    if (correct) { onAnswer(normalizeAnswer(input), true, newAttempts, usedHint); return; }
    setAttempts(newAttempts);
    if (close && newAttempts < 3) { triggerShake(); return; }
    triggerShake();
    if (newAttempts >= 3) onAnswer(input, false, newAttempts, usedHint);
  }

  function triggerShake() { setShake(true); setTimeout(() => setShake(false), 500); }

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timerPct > 60 ? 'bg-emerald-500' : timerPct > 30 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      {timerMode && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1"><Timer className="w-3 h-3" />{locale === 'fr' ? 'Mode chrono' : 'Timer mode'}</div>
            <span className={timeLeft <= 5 ? 'text-red-400 font-bold' : ''}>{timeLeft}s</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
          </div>
        </div>
      )}

      {/* Conjugation prompt */}
      <div className="bg-slate-800/60 rounded-2xl p-6 text-center space-y-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Conjuguez le verbe' : 'Conjugate the verb'}
        </p>
        <div className="space-y-2">
          <p className="text-4xl font-jp text-slate-100">{question.base_form}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">{question.base_type}</span>
            <span className="text-slate-500">→</span>
            <span className="text-sm font-jp text-cyan-300 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/30">{question.target_form}</span>
          </div>
        </div>
      </div>

      {shownHintIndex >= 0 && (
        <div className="space-y-2">
          {exercise.hints.slice(0, shownHintIndex + 1).map((hint, i) => (
            <div key={i} className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3">
              <p className="text-sm text-cyan-300">💡 {hint}</p>
            </div>
          ))}
        </div>
      )}

      <div className={shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder={locale === 'fr' ? 'Forme conjuguée...' : 'Conjugated form...'}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-xl font-jp text-center text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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
            <button onClick={submit} disabled={!input.trim()} className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold transition-colors">
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
    </div>
  );
}

'use client';
import { useState } from 'react';
import FillBlankExercise from './FillBlankExercise';
import MCQExercise from './MCQExercise';
import ConjugationExercise from './ConjugationExercise';
import SentenceBuilder from './SentenceBuilder';
import ErrorSpotter from './ErrorSpotter';
import ContextMatch from './ContextMatch';
import SentenceTransform from './SentenceTransform';
import FeedbackCard from './FeedbackCard';
import type { GrammarPoint, GrammarExercise, ExerciseType } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

const EXERCISE_TYPE_LABELS: Record<ExerciseType, { en: string; fr: string; icon: string }> = {
  fill_blank:       { en: 'Fill in the blank', fr: 'Compléter',         icon: '✏️' },
  sentence_builder: { en: 'Sentence Builder',  fr: 'Construire',        icon: '🧩' },
  error_spotter:    { en: 'Error Spotter',     fr: 'Trouver l\'erreur', icon: '🔍' },
  mcq:              { en: 'Multiple Choice',   fr: 'Choix multiple',    icon: '🎯' },
  conjugation:      { en: 'Conjugation',       fr: 'Conjugaison',       icon: '⚡' },
  context_match:    { en: 'Context Match',     fr: 'Registre',          icon: '🎭' },
  transform:        { en: 'Sentence Transform',fr: 'Transformer',       icon: '🔄' },
};

interface GrammarExerciseRunnerProps {
  grammarPoint: GrammarPoint;
  exercise: GrammarExercise;
  locale: Locale;
  timerMode?: boolean;
  /** Called when the user finishes the exercise (after seeing feedback) */
  onComplete: (isCorrect: boolean, attempts: number, usedHint: boolean, xp: number) => void;
}

type Phase = 'exercise' | 'feedback';

export default function GrammarExerciseRunner({
  grammarPoint,
  exercise,
  locale,
  timerMode = false,
  onComplete,
}: GrammarExerciseRunnerProps) {
  const [phase, setPhase] = useState<Phase>('exercise');
  const [result, setResult] = useState<{
    answer: string;
    isCorrect: boolean;
    attempts: number;
    usedHint: boolean;
    xp: number;
  } | null>(null);

  const typeInfo = EXERCISE_TYPE_LABELS[exercise.type];

  function handleAnswer(answer: string, isCorrect: boolean, attempts: number, usedHint: boolean) {
    // XP: first try = 15, with hint/multiple attempts = 10, cram = 5/3, wrong = 0
    const xp = !isCorrect ? 0 : attempts === 1 && !usedHint ? 15 : 10;
    setResult({ answer, isCorrect, attempts, usedHint, xp });
    setPhase('feedback');
  }

  function handleNext() {
    if (!result) return;
    onComplete(result.isCorrect, result.attempts, result.usedHint, result.xp);
  }

  return (
    <div className="space-y-4">
      {/* Exercise type badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeInfo.icon}</span>
          <span className="text-sm text-slate-400">
            {locale === 'fr' ? typeInfo.fr : typeInfo.en}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-jp bg-slate-800 px-2 py-1 rounded">
          {grammarPoint.jlpt_level}
        </div>
      </div>

      {/* Exercise or Feedback */}
      {phase === 'exercise' ? (
        <>
          {exercise.type === 'fill_blank' && (
            <FillBlankExercise exercise={exercise} locale={locale} onAnswer={handleAnswer} />
          )}
          {exercise.type === 'mcq' && (
            <MCQExercise exercise={exercise} locale={locale} onAnswer={handleAnswer} />
          )}
          {exercise.type === 'conjugation' && (
            <ConjugationExercise
              exercise={exercise}
              locale={locale}
              timerMode={timerMode}
              onAnswer={handleAnswer}
            />
          )}
          {exercise.type === 'sentence_builder' && (
            <SentenceBuilder exercise={exercise} locale={locale} onAnswer={handleAnswer} />
          )}
          {exercise.type === 'error_spotter' && (
            <ErrorSpotter exercise={exercise} locale={locale} onAnswer={handleAnswer} />
          )}
          {exercise.type === 'context_match' && (
            <ContextMatch exercise={exercise} locale={locale} onAnswer={handleAnswer} />
          )}
          {exercise.type === 'transform' && (
            <SentenceTransform exercise={exercise} locale={locale} onAnswer={handleAnswer} />
          )}
        </>
      ) : (
        result && (
          <FeedbackCard
            grammarPoint={grammarPoint}
            exercise={exercise}
            userAnswer={result.answer}
            isCorrect={result.isCorrect}
            attempts={result.attempts}
            xpEarned={result.xp}
            locale={locale}
            onNext={handleNext}
            audioUrl={grammarPoint.audio_url}
          />
        )
      )}
    </div>
  );
}

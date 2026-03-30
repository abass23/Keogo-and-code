'use client';
import Link from 'next/link';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, Volume2, BookOpen } from 'lucide-react';
import GrammarFurigana from './GrammarFurigana';
import type { GrammarPoint, GrammarExercise } from '@/lib/grammar-types';
import type { Locale } from '@/lib/types';

interface FeedbackCardProps {
  grammarPoint: GrammarPoint;
  exercise: GrammarExercise;
  userAnswer: string;
  isCorrect: boolean;
  attempts: number;
  xpEarned: number;
  locale: Locale;
  onNext: () => void;
  audioUrl?: string | null;
}

export default function FeedbackCard({
  grammarPoint,
  exercise,
  userAnswer,
  isCorrect,
  attempts,
  xpEarned,
  locale,
  onNext,
  audioUrl,
}: FeedbackCardProps) {
  const correctAnswer = exercise.answers[0];

  const wrongExplanation =
    !isCorrect && exercise.explanation.wrong[userAnswer]
      ? exercise.explanation.wrong[userAnswer]
      : null;

  function playAudio() {
    if (!audioUrl) return;
    new Audio(audioUrl).play().catch(() => {});
  }

  return (
    <div
      className={`rounded-2xl border p-5 space-y-4 transition-all ${
        isCorrect
          ? 'border-emerald-500/40 bg-emerald-950/30'
          : 'border-amber-500/40 bg-amber-950/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-amber-400 shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
            {isCorrect
              ? attempts === 1
                ? locale === 'fr' ? 'Parfait !' : 'Perfect!'
                : locale === 'fr' ? 'Correct !' : 'Correct!'
              : locale === 'fr' ? 'Pas tout à fait...' : 'Not quite...'}
          </p>
          {xpEarned > 0 && (
            <p className="text-xs text-slate-400">+{xpEarned} XP</p>
          )}
        </div>
        {audioUrl && (
          <button
            onClick={playAudio}
            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-cyan-400"
            aria-label="Play audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Correct answer (shown when wrong) */}
      {!isCorrect && (
        <div className="bg-slate-800/60 rounded-xl p-3 space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            {locale === 'fr' ? 'Réponse correcte' : 'Correct answer'}
          </p>
          <p className="text-lg font-jp text-emerald-300"><GrammarFurigana text={correctAnswer} /></p>
        </div>
      )}

      {/* Explanation */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-sm text-slate-300">{exercise.explanation.correct}</p>
        </div>

        {wrongExplanation && (
          <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-400 font-medium mb-1">
              {locale === 'fr' ? 'Pourquoi c\'est faux' : 'Why it\'s wrong'}
            </p>
            <p className="text-sm text-slate-300">{wrongExplanation}</p>
          </div>
        )}
      </div>

      {/* Grammar pattern reminder */}
      <div className="bg-slate-800/40 rounded-xl p-3 space-y-1">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          {locale === 'fr' ? 'Règle' : 'Rule'}
        </p>
        <p className="text-sm font-jp text-cyan-300">{grammarPoint.pattern}</p>
        <p className="text-xs text-slate-400">
          {locale === 'fr' ? grammarPoint.meaning_fr : grammarPoint.meaning_en}
        </p>
        {grammarPoint.formation[0] && (
          <p className="text-xs text-slate-500 mt-1">
            {grammarPoint.formation[0].rule}
          </p>
        )}
      </div>

      {/* Common mistake (if relevant) */}
      {grammarPoint.common_mistakes[0] && !isCorrect && (
        <div className="border border-slate-700/50 rounded-xl p-3 space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {locale === 'fr' ? 'Erreur fréquente' : 'Common mistake'}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400 line-through font-jp"><GrammarFurigana text={grammarPoint.common_mistakes[0].wrong} /></span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-emerald-400 font-jp"><GrammarFurigana text={grammarPoint.common_mistakes[0].correct} /></span>
          </div>
        </div>
      )}

      {/* Review lesson link (shown on wrong answer) */}
      {!isCorrect && (
        <Link
          href={`/grammar/lesson/${grammarPoint.id}`}
          className="w-full py-2.5 rounded-xl border border-slate-600/50 bg-slate-800/40 text-slate-300 hover:text-cyan-300 hover:border-cyan-600/40 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          {locale === 'fr' ? '📖 Revoir la leçon' : '📖 Review Lesson'}
        </Link>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        {locale === 'fr' ? 'Continuer' : 'Continue'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

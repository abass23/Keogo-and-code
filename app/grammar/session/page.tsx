'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Ghost, CheckCircle2, RotateCcw } from 'lucide-react';
import GrammarExerciseRunner from '@/components/grammar/GrammarExerciseRunner';
import { useGrammarStore, buildSessionItems } from '@/stores/grammar-store';
import { useAppStore } from '@/stores/app-store';
import { useGamificationStore } from '@/stores/gamification-store';
import grammarN5N4 from '@/data/grammar-n5-n4.json';
import grammarN3 from '@/data/grammar-n3.json';
import grammarN3Part2 from '@/data/grammar-n3-part2.json';
import grammarN3Part3 from '@/data/grammar-n3-part3.json';
import type { GrammarPoint, GrammarSessionItem, SessionMode, JlptLevel } from '@/lib/grammar-types';

const grammarData = [
  ...(grammarN5N4 as GrammarPoint[]),
  ...(grammarN3 as GrammarPoint[]),
  ...(grammarN3Part2 as GrammarPoint[]),
  ...(grammarN3Part3 as GrammarPoint[]),
];

// ── Session complete screen ───────────────────────────────────

function SessionComplete({
  correct,
  total,
  xp,
  ghostCount,
  locale,
  onRestart,
}: {
  correct: number;
  total: number;
  xp: number;
  ghostCount: number;
  locale: 'en' | 'fr';
  onRestart: () => void;
}) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 space-y-6">
      <div className="text-center space-y-3">
        <p className="text-5xl">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📖'}</p>
        <h2 className="text-2xl font-bold text-slate-100">
          {locale === 'fr' ? 'Session terminée !' : 'Session complete!'}
        </h2>
      </div>

      {/* Stats */}
      <div className="w-full max-w-sm space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/60 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-100">{correct}/{total}</p>
            <p className="text-xs text-slate-400 mt-1">{locale === 'fr' ? 'Correct' : 'Correct'}</p>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </p>
            <p className="text-xs text-slate-400 mt-1">{locale === 'fr' ? 'Précision' : 'Accuracy'}</p>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">+{xp}</p>
            <p className="text-xs text-slate-400 mt-1">XP</p>
          </div>
        </div>

        {ghostCount > 0 && (
          <div className="bg-violet-950/30 border border-violet-500/30 rounded-2xl p-3 flex items-center gap-3">
            <Ghost className="w-5 h-5 text-violet-400 shrink-0" />
            <p className="text-sm text-violet-300">
              {ghostCount} {locale === 'fr' ? 'fantôme(s) détecté(s) — révision renforcée activée' : `ghost${ghostCount > 1 ? 's' : ''} detected — reinforced review enabled`}
            </p>
          </div>
        )}

        {accuracy >= 70 && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">
              {locale === 'fr'
                ? 'Points atteints ≥70% ajoutés à la file SRS'
                : 'Points at ≥70% added to SRS review queue'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {locale === 'fr' ? 'Nouvelle session' : 'New session'}
        </button>
        <button
          onClick={() => router.push('/grammar')}
          className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors"
        >
          {locale === 'fr' ? 'Retour au dojo' : 'Back to Dojo'}
        </button>
      </div>
    </div>
  );
}

// ── Main session page ─────────────────────────────────────────

function GrammarSessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = (searchParams.get('mode') ?? 'learn') as SessionMode;
  const level = searchParams.get('level') as JlptLevel | null;
  const pointId = searchParams.get('point');

  const { locale } = useAppStore();
  const { addXP } = useGamificationStore();
  const { session, sessionIndex, sessionXP, sessionCorrect, sessionTotal,
          startSession, advanceSession, endSession, recordAttempt, getSRS } = useGrammarStore();

  const [ghostCount, setGhostCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timerMode, setTimerMode] = useState(false);

  // Build and start session
  useEffect(() => {
    let points = grammarData;

    if (pointId) {
      points = points.filter((p) => p.id === pointId);
    } else {
      if (level) points = points.filter((p) => p.jlpt_level === level);
    }

    const items = buildSessionItems(points, getSRS);
    if (items.length === 0) {
      setSessionComplete(true);
      return;
    }

    // For review mode: only include points that are due or new
    const filteredItems =
      mode === 'review'
        ? items.filter((item) => {
            const srs = getSRS(item.grammarPoint.id);
            return srs.is_learned && new Date(srs.nextReview) <= new Date();
          })
        : mode === 'learn'
        ? items.filter((item) => {
            const srs = getSRS(item.grammarPoint.id);
            return srs.total_reviews === 0;
          })
        : items; // cram: all

    if (filteredItems.length === 0) {
      setSessionComplete(true);
      return;
    }

    // Cap to 10 items per session
    startSession(filteredItems.slice(0, 10), mode);
  }, []);

  const currentItem = session?.[sessionIndex] ?? null;

  function handleComplete(isCorrect: boolean, attempts: number, usedHint: boolean, xp: number) {
    if (!currentItem) return;

    recordAttempt(
      currentItem.grammarPoint.id,
      currentItem.exercise.type,
      attempts,
      usedHint,
      xp,
      isCorrect,
    );
    addXP(xp);

    // Check if became ghost after this attempt
    const srs = getSRS(currentItem.grammarPoint.id);
    if (srs.is_ghost) setGhostCount((c) => c + 1);

    // Log to heatmap
    try {
      const today = new Date().toDateString();
      const raw = localStorage.getItem('keogo-review-log');
      const log: Record<string, number> = raw ? JSON.parse(raw) : {};
      log[today] = (log[today] ?? 0) + 1;
      localStorage.setItem('keogo-review-log', JSON.stringify(log));
    } catch { /* ignore */ }

    // Sync to API (fire and forget — offline store handles locally)
    if (mode !== 'cram') {
      fetch('/api/grammar/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammar_point_id: currentItem.grammarPoint.id,
          exercise_type: currentItem.exercise.type,
          is_correct: isCorrect,
          attempts,
          used_hint: usedHint,
          is_cram: false,
        }),
      }).catch(() => {});
    }

    // Advance or complete
    if (session && sessionIndex + 1 >= session.length) {
      setSessionComplete(true);
    } else {
      advanceSession();
    }
  }

  function handleRestart() {
    endSession();
    setSessionComplete(false);
    setGhostCount(0);
    router.refresh();
  }

  // Session complete screen
  if (sessionComplete) {
    return (
      <SessionComplete
        correct={sessionCorrect}
        total={sessionTotal}
        xp={sessionXP}
        ghostCount={ghostCount}
        locale={locale}
        onRestart={handleRestart}
      />
    );
  }

  if (!session || !currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400">
            {locale === 'fr' ? 'Chargement...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const progress = session.length > 0 ? ((sessionIndex) / session.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col max-w-xl mx-auto px-4 py-4">
      {/* Top bar */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/grammar" className="text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-5 h-5" />
        </Link>

        {/* Progress bar */}
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{sessionIndex + 1}/{session.length}</span>
          {timerMode && (
            <button
              onClick={() => setTimerMode(false)}
              className="text-amber-400 hover:text-amber-300"
              title="Disable timer"
            >
              ⏱️
            </button>
          )}
        </div>
      </div>

      {/* XP counter */}
      {sessionXP > 0 && (
        <div className="text-right text-xs text-cyan-400 mb-2">+{sessionXP} XP</div>
      )}

      {/* Grammar point name */}
      <div className="mb-4">
        <p className="text-xs text-slate-500">
          {locale === 'fr'
            ? `Point de grammaire ${sessionIndex + 1} sur ${session.length}`
            : `Grammar point ${sessionIndex + 1} of ${session.length}`}
        </p>
        <h2 className="text-xl font-jp text-slate-100 mt-1">
          {currentItem.grammarPoint.pattern}
          {currentItem.srs.is_ghost && (
            <span className="ml-2 text-violet-400 text-sm" title="Ghost grammar">👻</span>
          )}
        </h2>
        <p className="text-sm text-slate-400">
          {locale === 'fr'
            ? currentItem.grammarPoint.meaning_fr
            : currentItem.grammarPoint.meaning_en}
        </p>
      </div>

      {/* Exercise runner */}
      <div className="flex-1">
        <GrammarExerciseRunner
          key={`${currentItem.grammarPoint.id}-${sessionIndex}`}
          grammarPoint={currentItem.grammarPoint}
          exercise={currentItem.exercise}
          locale={locale}
          timerMode={timerMode && currentItem.exercise.type === 'conjugation'}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

export default function GrammarSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading session...</p>
      </div>
    }>
      <GrammarSessionContent />
    </Suspense>
  );
}

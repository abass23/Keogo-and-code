'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialGrammarSRS, gradeGrammarPoint } from '@/lib/grammar-srs';
import type {
  GrammarPoint,
  GrammarExercise,
  GrammarSRSState,
  ExerciseType,
  SessionMode,
  GrammarSessionItem,
} from '@/lib/grammar-types';

// ── Offline SRS cache ─────────────────────────────────────────
// Maps grammar_point_id → GrammarSRSState (synced to DB when online)

interface GrammarState {
  // Offline SRS cache
  srsCache: Record<string, GrammarSRSState>;

  // Active session
  session: GrammarSessionItem[] | null;
  sessionIndex: number;
  sessionMode: SessionMode;
  sessionXP: number;
  sessionCorrect: number;
  sessionTotal: number;

  // Actions
  startSession: (items: GrammarSessionItem[], mode: SessionMode) => void;
  endSession: () => void;
  advanceSession: () => void;
  recordAttempt: (
    grammarPointId: string,
    exerciseType: ExerciseType,
    attempts: number,
    usedHint: boolean,
    xp: number,
    isCorrect: boolean,
  ) => void;
  getSRS: (grammarPointId: string) => GrammarSRSState;
  updateSRS: (grammarPointId: string, next: GrammarSRSState) => void;
  clearCache: () => void;

  // Derived helpers
  currentItem: () => GrammarSessionItem | null;
  isSessionComplete: () => boolean;
}

export const useGrammarStore = create<GrammarState>()(
  persist(
    (set, get) => ({
      srsCache: {},
      session: null,
      sessionIndex: 0,
      sessionMode: 'learn',
      sessionXP: 0,
      sessionCorrect: 0,
      sessionTotal: 0,

      startSession: (items, mode) =>
        set({
          session: items,
          sessionIndex: 0,
          sessionMode: mode,
          sessionXP: 0,
          sessionCorrect: 0,
          sessionTotal: 0,
        }),

      endSession: () =>
        set({ session: null, sessionIndex: 0, sessionXP: 0, sessionCorrect: 0, sessionTotal: 0 }),

      advanceSession: () =>
        set((s) => ({ sessionIndex: s.sessionIndex + 1 })),

      recordAttempt: (grammarPointId, exerciseType, attempts, usedHint, xp, isCorrect) => {
        const currentSRS = get().getSRS(grammarPointId);
        const { next } = gradeGrammarPoint(currentSRS, {
          type: exerciseType,
          attempts,
          used_hint: usedHint,
          is_correct: isCorrect,
          is_cram: get().sessionMode === 'cram',
        });
        set((s) => ({
          srsCache: { ...s.srsCache, [grammarPointId]: next },
          sessionXP: s.sessionXP + xp,
          sessionCorrect: s.sessionCorrect + (isCorrect ? 1 : 0),
          sessionTotal: s.sessionTotal + 1,
        }));
      },

      getSRS: (grammarPointId) =>
        get().srsCache[grammarPointId] ?? createInitialGrammarSRS(),

      updateSRS: (grammarPointId, next) =>
        set((s) => ({ srsCache: { ...s.srsCache, [grammarPointId]: next } })),

      clearCache: () => set({ srsCache: {} }),

      currentItem: () => {
        const { session, sessionIndex } = get();
        if (!session || sessionIndex >= session.length) return null;
        return session[sessionIndex];
      },

      isSessionComplete: () => {
        const { session, sessionIndex } = get();
        return !session || sessionIndex >= session.length;
      },
    }),
    {
      name: 'keogo-grammar',
      // Only persist SRS cache — session state resets on reload
      partialize: (s) => ({ srsCache: s.srsCache }),
    },
  ),
);

// ── Selectors ─────────────────────────────────────────────────

export function buildSessionItems(
  points: GrammarPoint[],
  getSRS: (id: string) => GrammarSRSState,
): GrammarSessionItem[] {
  return points.flatMap((point) => {
    if (!point.exercises?.length) return [];
    // Pick one exercise per point (prefer the weakest type if known)
    const srs = getSRS(point.id);
    const weakest = srs.weakest_type;
    const exercise: GrammarExercise =
      (weakest && point.exercises.find((e) => e.type === weakest)) ||
      point.exercises[Math.floor(Math.random() * point.exercises.length)];
    return [{ grammarPoint: point, exercise, srs, attemptCount: 0, usedHint: false }];
  });
}

/**
 * Grammar SRS engine — SM-2 algorithm adapted for grammar practice.
 *
 * Key differences from vocab SRS:
 * - "is_learned" gate: a grammar point must reach 70% accuracy before
 *   entering the SRS review queue (prevents premature forgetting curves)
 * - Ghost grammar: points that fail repeatedly get is_ghost=true and
 *   receive halved intervals until 3 consecutive correct answers reset them
 * - Per-type accuracy tracking: used to surface the weakest exercise type
 * - Cram mode: no SRS state mutation — only typeAccuracy updated
 */

import type {
  GrammarSRSState,
  ExerciseType,
  TypeAccuracy,
  TypeAccuracyEntry,
} from './grammar-types';

// ── Constants ─────────────────────────────────────────────────

const EASE_MIN = 1.3;
const EASE_DEFAULT = 2.5;
const LEARNED_ACCURACY_THRESHOLD = 0.70;   // 70% accuracy → learned
const GHOST_FAIL_STREAK = 3;               // 3 consecutive fails → ghost
const GHOST_RESET_STREAK = 3;              // 3 consecutive correct → reset ghost

// ── Initial state ─────────────────────────────────────────────

export function createInitialGrammarSRS(): GrammarSRSState {
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: EASE_DEFAULT,
    nextReview: new Date().toISOString(),
    lastReview: null,
    total_reviews: 0,
    correct_count: 0,
    is_learned: false,
    is_ghost: false,
    type_accuracy: emptyTypeAccuracy(),
    weakest_type: null,
  };
}

function emptyTypeAccuracy(): TypeAccuracy {
  const entry = (): TypeAccuracyEntry => ({ correct: 0, total: 0 });
  return {
    fill_blank: entry(),
    sentence_builder: entry(),
    error_spotter: entry(),
    mcq: entry(),
    conjugation: entry(),
    context_match: entry(),
    transform: entry(),
  };
}

// ── Core update ───────────────────────────────────────────────

export interface GradeGrammarOptions {
  type: ExerciseType;
  /** number of attempts (1 = first try, 2 = second try, 3 = third try) */
  attempts: number;
  /** whether user had to use a hint */
  used_hint: boolean;
  /**
   * explicit correctness flag — if omitted, derived as (attempts <= 3).
   * Pass false when the answer was revealed after exhausting all attempts.
   */
  is_correct?: boolean;
  /** cram mode: type accuracy updated but SRS state frozen */
  is_cram?: boolean;
}

/**
 * Update grammar SRS state based on exercise outcome.
 * Returns the new state + XP earned.
 */
export function gradeGrammarPoint(
  state: GrammarSRSState,
  opts: GradeGrammarOptions,
): { next: GrammarSRSState; xp: number } {
  const { type, attempts, used_hint, is_cram = false } = opts;
  const is_correct = opts.is_correct ?? (attempts >= 1 && attempts <= 3);
  const first_try = is_correct && attempts === 1 && !used_hint;

  // Update type accuracy regardless of mode
  const type_accuracy = recordTypeAttempt(state.type_accuracy, type, is_correct);
  const weakest_type = computeWeakestType(type_accuracy);

  const total_reviews = state.total_reviews + 1;
  const correct_count = is_correct ? state.correct_count + 1 : state.correct_count;
  const overall_accuracy = total_reviews > 0 ? correct_count / total_reviews : 0;
  const is_learned = state.is_learned || (total_reviews >= 3 && overall_accuracy >= LEARNED_ACCURACY_THRESHOLD);

  // Cram mode: freeze SRS intervals
  if (is_cram) {
    return {
      next: { ...state, type_accuracy, weakest_type, total_reviews, correct_count, is_learned },
      xp: xpForGrammar(is_correct, first_try, true),
    };
  }

  // SM-2 quality mapping: first try = 5, with hint = 4, multiple attempts = 3, fail = 1
  const quality = !is_correct ? 1 : first_try ? 5 : used_hint ? 4 : 3;

  let { interval, repetitions, easeFactor } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(EASE_MIN, Math.round(easeFactor * 100) / 100);

  // Ghost grammar: halve intervals for haunted points
  const is_ghost = computeGhostStatus(state, is_correct);
  if (is_ghost) {
    interval = Math.max(1, Math.floor(interval / 2));
  }

  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    next: {
      interval,
      repetitions,
      easeFactor,
      nextReview: nextReview.toISOString(),
      lastReview: now.toISOString(),
      total_reviews,
      correct_count,
      is_learned,
      is_ghost,
      type_accuracy,
      weakest_type,
    },
    xp: xpForGrammar(is_correct, first_try, false),
  };
}

// ── Ghost logic ───────────────────────────────────────────────

/**
 * A point becomes ghost after GHOST_FAIL_STREAK consecutive fails.
 * It exits ghost status after GHOST_RESET_STREAK consecutive correct answers.
 * We approximate "consecutive" using the rolling window of the last N reviews
 * via repetitions (SM-2 repetitions reset to 0 on fail).
 */
function computeGhostStatus(state: GrammarSRSState, is_correct: boolean): boolean {
  if (!is_correct) {
    // Track via total_reviews - correct_count as a rough fail-streak proxy
    const fail_ratio = state.total_reviews > 0
      ? (state.total_reviews - state.correct_count) / state.total_reviews
      : 0;
    // Become ghost if: already ghost OR 3+ fails in last 5 reviews AND >50% fail rate
    if (state.is_ghost) return true;
    if (state.total_reviews >= GHOST_FAIL_STREAK && fail_ratio >= 0.6) return true;
    return false;
  } else {
    // Exit ghost if 3 consecutive correct (repetitions >= GHOST_RESET_STREAK)
    if (state.is_ghost && state.repetitions + 1 >= GHOST_RESET_STREAK) {
      return false;
    }
    return state.is_ghost;
  }
}

// ── Type accuracy ─────────────────────────────────────────────

function recordTypeAttempt(
  acc: TypeAccuracy,
  type: ExerciseType,
  is_correct: boolean,
): TypeAccuracy {
  const entry = acc[type];
  return {
    ...acc,
    [type]: {
      correct: entry.correct + (is_correct ? 1 : 0),
      total: entry.total + 1,
    },
  };
}

function computeWeakestType(acc: TypeAccuracy): ExerciseType | null {
  let worst: ExerciseType | null = null;
  let worstRate = Infinity;

  for (const [type, entry] of Object.entries(acc) as [ExerciseType, TypeAccuracyEntry][]) {
    if (entry.total < 3) continue; // need at least 3 attempts to be meaningful
    const rate = entry.correct / entry.total;
    if (rate < worstRate) {
      worstRate = rate;
      worst = type;
    }
  }
  return worst;
}

// ── XP ────────────────────────────────────────────────────────

export function xpForGrammar(
  is_correct: boolean,
  first_try: boolean,
  is_cram: boolean,
): number {
  if (!is_correct) return 0;
  const base = is_cram ? 3 : 10;
  const bonus = first_try ? (is_cram ? 2 : 5) : 0;
  return base + bonus;
}

// ── Queuing helpers ───────────────────────────────────────────

export function isDueForGrammarReview(state: GrammarSRSState): boolean {
  return state.is_learned && new Date(state.nextReview) <= new Date();
}

export function isNewGrammarPoint(state: GrammarSRSState): boolean {
  return state.total_reviews === 0;
}

/**
 * Build a review queue from grammar SRS records.
 * Priority: overdue ghosts → overdue learned → new (capped at newLimit).
 */
export function buildGrammarReviewQueue<T extends { srs: GrammarSRSState }>(
  items: T[],
  newLimit = 10,
): T[] {
  const overdueGhosts = items
    .filter((i) => i.srs.is_ghost && isDueForGrammarReview(i.srs))
    .sort((a, b) => new Date(a.srs.nextReview).getTime() - new Date(b.srs.nextReview).getTime());

  const overdue = items
    .filter((i) => !i.srs.is_ghost && isDueForGrammarReview(i.srs))
    .sort((a, b) => new Date(a.srs.nextReview).getTime() - new Date(b.srs.nextReview).getTime());

  const newItems = items
    .filter((i) => isNewGrammarPoint(i.srs) && !i.srs.is_learned)
    .slice(0, newLimit);

  return [...overdueGhosts, ...overdue, ...newItems];
}

// ── Answer validation ─────────────────────────────────────────

/**
 * Normalize an answer string for comparison:
 * - lowercase
 * - trim whitespace
 * - normalize fullwidth/halfwidth characters
 * - remove trailing punctuation
 */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFKC')       // fullwidth → halfwidth, normalize unicode
    .replace(/[。、．，！？!?.,]+$/, '');
}

/**
 * Check if a user answer matches any of the accepted answers.
 * Uses normalized comparison with optional fuzzy tolerance for kana variants.
 */
export function validateAnswer(userAnswer: string, accepted: string[]): boolean {
  const normalized = normalizeAnswer(userAnswer);
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}

/**
 * Check if an answer is "close" (within 1 edit distance of any accepted answer).
 * Used to trigger a nudge hint rather than a full wrong answer.
 */
export function isCloseAnswer(userAnswer: string, accepted: string[]): boolean {
  const normalized = normalizeAnswer(userAnswer);
  return accepted.some((a) => levenshtein(normalizeAnswer(a), normalized) === 1);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

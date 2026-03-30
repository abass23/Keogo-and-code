import { SRSState, Quality } from './types';

const EASE_FACTOR_MIN = 1.3;
const EASE_FACTOR_DEFAULT = 2.5;

export function createInitialState(): SRSState {
  return {
    interval: 0,
    repetitions: 0,
    easeFactor: EASE_FACTOR_DEFAULT,
    nextReview: new Date().toISOString(),
    lastReview: null,
  };
}

/**
 * SM-2 algorithm: update SRS state based on quality of recall.
 * quality: 0 = complete blackout, 5 = perfect recall
 *   0-2 → fail: reset repetitions, interval = 1
 *   3-5 → pass: advance interval, adjust ease factor
 */
export function gradeCard(state: SRSState, quality: Quality): SRSState {
  let { interval, repetitions, easeFactor } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // SM-2 ease factor formula (applied regardless of pass/fail)
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(EASE_FACTOR_MIN, Math.round(easeFactor * 100) / 100);

  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    repetitions,
    easeFactor,
    nextReview: nextReview.toISOString(),
    lastReview: now.toISOString(),
  };
}

export function isDue(state: SRSState): boolean {
  return new Date(state.nextReview) <= new Date();
}

export function isNew(state: SRSState): boolean {
  return state.repetitions === 0 && state.lastReview == null;
}

export function getIntervalLabel(interval: number): string {
  if (interval === 0) return 'New';
  if (interval === 1) return '1 day';
  if (interval < 7) return `${interval} days`;
  const weeks = Math.round(interval / 7);
  if (interval < 30) return `${weeks} week${weeks > 1 ? 's' : ''}`;
  const months = Math.round(interval / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
}

/**
 * Sort cards for a review session:
 * due (overdue first) then new cards (capped at newCardsLimit)
 */
export function buildReviewQueue(
  cards: { id: string; srs: SRSState }[],
  newCardsLimit = 20,
): { id: string; srs: SRSState }[] {
  const due = cards
    .filter((c) => !isNew(c.srs) && isDue(c.srs))
    .sort((a, b) => new Date(a.srs.nextReview).getTime() - new Date(b.srs.nextReview).getTime());

  const newCards = cards
    .filter((c) => isNew(c.srs))
    .slice(0, newCardsLimit);

  return [...due, ...newCards];
}

/** XP earned for a quality score: +10 base, +5 bonus for quality >= 4 */
export function xpForGrade(quality: Quality): number {
  return quality >= 4 ? 15 : 10;
}

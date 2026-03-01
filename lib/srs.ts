import { SRSState, Grade } from './types';

export function createInitialState(): SRSState {
  return {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: new Date().toISOString(),
  };
}

export function gradeCard(state: SRSState, grade: Grade): SRSState {
  const scoreMap: Record<Grade, number> = { hard: 1, good: 3, easy: 5 };
  const score = scoreMap[grade];

  let { interval, easeFactor, repetitions } = state;

  if (score < 3) {
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    repetitions = 0;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = score === 5 ? 4 : 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
      if (score === 5) {
        interval = Math.round(interval * 1.3);
      }
    }
    if (score === 5) {
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    repetitions,
    nextReview: nextReview.toISOString(),
  };
}

export function isDue(state: SRSState): boolean {
  return new Date(state.nextReview) <= new Date();
}

export function getIntervalLabel(interval: number): string {
  if (interval === 0) return 'New';
  if (interval === 1) return '1 day';
  if (interval < 7) return `${interval} days`;
  if (interval < 30) return `${Math.round(interval / 7)} week${Math.round(interval / 7) > 1 ? 's' : ''}`;
  return `${Math.round(interval / 30)} month${Math.round(interval / 30) > 1 ? 's' : ''}`;
}

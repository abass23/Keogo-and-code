import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createInitialState,
  gradeCard,
  isDue,
  isNew,
  getIntervalLabel,
  buildReviewQueue,
  xpForGrade,
} from '../srs';
import type { SRSState, Quality } from '../types';

// Fix "now" for deterministic interval tests
const FIXED_DATE = new Date('2026-04-01T10:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
});

afterEach(() => {
  vi.useRealTimers();
});

function daysFromNow(n: number): string {
  const d = new Date(FIXED_DATE);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ─── createInitialState ──────────────────────────────────────────────────────

describe('createInitialState', () => {
  it('returns interval 0, repetitions 0, easeFactor 2.5', () => {
    const s = createInitialState();
    expect(s.interval).toBe(0);
    expect(s.repetitions).toBe(0);
    expect(s.easeFactor).toBe(2.5);
    expect(s.lastReview).toBeNull();
  });

  it('sets nextReview to now', () => {
    const s = createInitialState();
    expect(new Date(s.nextReview).toISOString()).toBe(FIXED_DATE.toISOString());
  });
});

// ─── isNew ───────────────────────────────────────────────────────────────────

describe('isNew', () => {
  it('returns true for initial state', () => {
    expect(isNew(createInitialState())).toBe(true);
  });

  it('returns false after first review', () => {
    const s = gradeCard(createInitialState(), 5);
    expect(isNew(s)).toBe(false);
  });
});

// ─── gradeCard — failure (quality 0-2) ───────────────────────────────────────

describe('gradeCard — failure', () => {
  const failures: Quality[] = [0, 1, 2];

  for (const q of failures) {
    it(`quality ${q} resets repetitions to 0 and sets interval to 1`, () => {
      // Start from an advanced state
      const advanced: SRSState = {
        interval: 20,
        repetitions: 5,
        easeFactor: 2.5,
        nextReview: daysFromNow(20),
        lastReview: daysFromNow(-5),
      };
      const s = gradeCard(advanced, q);
      expect(s.repetitions).toBe(0);
      expect(s.interval).toBe(1);
    });
  }

  it('quality 0 pushes ease factor below 2.5', () => {
    const s = gradeCard(createInitialState(), 0);
    expect(s.easeFactor).toBeLessThan(2.5);
  });

  it('ease factor never drops below 1.3 (minimum floor)', () => {
    let state = createInitialState();
    // Apply quality 0 many times
    for (let i = 0; i < 20; i++) {
      state = gradeCard(state, 0);
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('sets nextReview to +1 day from now', () => {
    const s = gradeCard(createInitialState(), 1);
    expect(s.nextReview).toBe(daysFromNow(1));
  });
});

// ─── gradeCard — pass (quality 3-5) ──────────────────────────────────────────

describe('gradeCard — pass', () => {
  it('first review (rep 0→1) sets interval to 1', () => {
    const s = gradeCard(createInitialState(), 3);
    expect(s.repetitions).toBe(1);
    expect(s.interval).toBe(1);
  });

  it('second review (rep 1→2) sets interval to 6', () => {
    const s1 = gradeCard(createInitialState(), 3);
    const s2 = gradeCard(s1, 3);
    expect(s2.repetitions).toBe(2);
    expect(s2.interval).toBe(6);
  });

  it('third review multiplies interval by easeFactor', () => {
    const s1 = gradeCard(createInitialState(), 3);
    const s2 = gradeCard(s1, 3);
    const ef = s2.easeFactor;
    const s3 = gradeCard(s2, 3);
    expect(s3.interval).toBe(Math.round(6 * ef));
  });

  it('quality 5 increases ease factor', () => {
    const s = gradeCard(createInitialState(), 5);
    expect(s.easeFactor).toBeGreaterThan(2.5);
  });

  it('quality 3 decreases ease factor slightly', () => {
    const s = gradeCard(createInitialState(), 3);
    expect(s.easeFactor).toBeLessThan(2.5);
  });

  it('quality 4 keeps ease factor near 2.5 (no change at q=4)', () => {
    const s = gradeCard(createInitialState(), 4);
    // At q=4: delta = 0.1 - (5-4)*(0.08 + (5-4)*0.02) = 0.1 - 0.1 = 0
    expect(s.easeFactor).toBeCloseTo(2.5, 1);
  });

  it('sets lastReview to now', () => {
    const s = gradeCard(createInitialState(), 4);
    expect(s.lastReview).toBe(FIXED_DATE.toISOString());
  });
});

// ─── isDue ────────────────────────────────────────────────────────────────────

describe('isDue', () => {
  it('returns true when nextReview is in the past', () => {
    const s: SRSState = { ...createInitialState(), nextReview: daysFromNow(-1) };
    expect(isDue(s)).toBe(true);
  });

  it('returns true when nextReview is exactly now', () => {
    const s: SRSState = { ...createInitialState(), nextReview: FIXED_DATE.toISOString() };
    expect(isDue(s)).toBe(true);
  });

  it('returns false when nextReview is in the future', () => {
    const s: SRSState = { ...createInitialState(), nextReview: daysFromNow(1) };
    expect(isDue(s)).toBe(false);
  });
});

// ─── getIntervalLabel ────────────────────────────────────────────────────────

describe('getIntervalLabel', () => {
  it('0 → "New"', () => expect(getIntervalLabel(0)).toBe('New'));
  it('1 → "1 day"', () => expect(getIntervalLabel(1)).toBe('1 day'));
  it('3 → "3 days"', () => expect(getIntervalLabel(3)).toBe('3 days'));
  it('7 → "1 week"', () => expect(getIntervalLabel(7)).toBe('1 week'));
  it('14 → "2 weeks"', () => expect(getIntervalLabel(14)).toBe('2 weeks'));
  it('30 → "1 month"', () => expect(getIntervalLabel(30)).toBe('1 month'));
  it('60 → "2 months"', () => expect(getIntervalLabel(60)).toBe('2 months'));
});

// ─── buildReviewQueue ────────────────────────────────────────────────────────

describe('buildReviewQueue', () => {
  const makeCard = (id: string, srs: SRSState) => ({ id, srs });

  it('puts due cards before new cards', () => {
    const due = makeCard('due', { ...createInitialState(), nextReview: daysFromNow(-1), repetitions: 1, lastReview: daysFromNow(-5) });
    const newCard = makeCard('new', createInitialState());
    const queue = buildReviewQueue([newCard, due]);
    expect(queue[0].id).toBe('due');
    expect(queue[1].id).toBe('new');
  });

  it('sorts due cards by nextReview ascending (most overdue first)', () => {
    const old = makeCard('old', { ...createInitialState(), nextReview: daysFromNow(-10), repetitions: 1, lastReview: daysFromNow(-15) });
    const recent = makeCard('recent', { ...createInitialState(), nextReview: daysFromNow(-1), repetitions: 1, lastReview: daysFromNow(-6) });
    const queue = buildReviewQueue([recent, old]);
    expect(queue[0].id).toBe('old');
  });

  it('respects newCardsLimit', () => {
    const newCards = Array.from({ length: 30 }, (_, i) => makeCard(`new${i}`, createInitialState()));
    const queue = buildReviewQueue(newCards, 10);
    expect(queue.length).toBe(10);
  });

  it('excludes future (not-due, non-new) cards', () => {
    const future = makeCard('future', { ...createInitialState(), nextReview: daysFromNow(5), repetitions: 2, lastReview: daysFromNow(-1) });
    const queue = buildReviewQueue([future]);
    expect(queue.length).toBe(0);
  });
});

// ─── xpForGrade ───────────────────────────────────────────────────────────────

describe('xpForGrade', () => {
  it('quality < 4 gives 10 XP', () => {
    expect(xpForGrade(0)).toBe(10);
    expect(xpForGrade(3)).toBe(10);
  });

  it('quality >= 4 gives 15 XP', () => {
    expect(xpForGrade(4)).toBe(15);
    expect(xpForGrade(5)).toBe(15);
  });
});

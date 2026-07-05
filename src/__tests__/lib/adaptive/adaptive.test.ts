import { betaMeanSd, betaPdf, betaSample } from '@/lib/adaptive/math';
import { topicMastery, questionAB, selectNext } from '@/lib/adaptive/engine';
import { initModelState } from '@/lib/state/modelReducer';
import { QUESTIONS } from '@/data/questions';

describe('betaMeanSd', () => {
  it('returns mean 0.5 for uniform prior', () => {
    const { m } = betaMeanSd(1, 1);
    expect(m).toBeCloseTo(0.5);
  });

  it('shifts mean toward successes', () => {
    const { m } = betaMeanSd(5, 1);
    expect(m).toBeGreaterThan(0.8);
  });
});

describe('betaPdf', () => {
  it('is zero outside (0,1)', () => {
    expect(betaPdf(0, 2, 2)).toBe(0);
    expect(betaPdf(1, 2, 2)).toBe(0);
  });

  it('is positive inside the interval', () => {
    expect(betaPdf(0.5, 2, 2)).toBeGreaterThan(0);
  });
});

describe('topicMastery', () => {
  it('starts at 0.5 with no answers', () => {
    expect(topicMastery({ s: 0, f: 0 })).toBeCloseTo(0.5);
  });
});

describe('questionAB', () => {
  it('pulls toward topic mastery via partial pooling', () => {
    const ab = questionAB({ s: 0, f: 0 }, { s: 8, f: 0 });
    expect(ab.a).toBeGreaterThan(ab.b);
  });
});

describe('selectNext', () => {
  it('returns unanswered questions only', () => {
    const state = initModelState();
    const first = selectNext(QUESTIONS, state, new Set());
    expect(first).not.toBeNull();
    if (!first) return;

    const answered = new Set([first.id]);
    const second = selectNext(QUESTIONS, state, answered);
    expect(second?.id).not.toBe(first.id);
  });

  it('returns null when all questions are answered', () => {
    const state = initModelState();
    const all = new Set(QUESTIONS.map((q) => q.id));
    expect(selectNext(QUESTIONS, state, all)).toBeNull();
  });
});

describe('betaSample', () => {
  it('produces values in (0,1)', () => {
    for (let i = 0; i < 20; i++) {
      const x = betaSample(2, 5);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(1);
    }
  });
});

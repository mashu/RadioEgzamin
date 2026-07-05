import { initModelState } from '@/lib/state/modelReducer';
import { countBankProgress } from '@/lib/questions/progress';

describe('countBankProgress', () => {
  it('reports full bank size from meta', () => {
    const progress = countBankProgress(initModelState());
    expect(progress.total).toBe(521);
    expect(progress.attempted).toBe(0);
  });

  it('counts attempted questions from model state', () => {
    const base = initModelState();
    const model = {
      ...base,
      q: {
        ...base.q,
        'rt-001': { s: 1, f: 0 },
        'be-001': { s: 0, f: 1 },
      },
    };
    expect(countBankProgress(model).attempted).toBe(2);
  });
});

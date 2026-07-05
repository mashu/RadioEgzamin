import { DEFAULT_DEPARTMENTS } from '@/data/departments';
import { initModelState } from '@/lib/state/modelReducer';
import {
  buildSessionPlan,
  perDepartmentCounts,
  questionsInDepartment,
  sessionTotal,
  targetCountForDepartment,
} from '@/lib/adaptive/sessionPlan';
import { parsePersistedExamState } from '@/lib/persistence/examStorage';

describe('sessionPlan', () => {
  const model = initModelState();

  it('maps radiotechnika to 338 questions in pool', () => {
    expect(questionsInDepartment('radiotechnika').length).toBe(338);
  });

  it('targets 8 questions for bezpieczenstwo when pool is large enough', () => {
    expect(targetCountForDepartment('bezpieczenstwo')).toBe(8);
  });

  it('builds 8 questions per selected department when possible', () => {
    const plan = buildSessionPlan(['prawo'], model);
    expect(sessionTotal(plan)).toBe(8);
    expect(plan.perDepartment.prawo).toBe(8);
  });

  it('builds full session for all departments', () => {
    const plan = buildSessionPlan(DEFAULT_DEPARTMENTS, model);
    expect(plan.perDepartment.radiotechnika).toBe(8);
    expect(plan.perDepartment.bezpieczenstwo).toBe(8);
    expect(plan.perDepartment.operatorka).toBe(8);
    expect(plan.perDepartment.prawo).toBe(8);
    expect(sessionTotal(plan)).toBe(32);
  });

  it('does not repeat question ids within a department pick', () => {
    const plan = buildSessionPlan(['operatorka'], model);
    const ids = plan.queue.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('examStorage', () => {
  it('roundtrips persisted exam state json', () => {
    const model = initModelState();
    const raw = JSON.stringify({
      v: 1,
      departments: ['prawo', 'operatorka'],
      queue: ['pr-001', 'op-001'],
      answered: ['pr-001'],
      session: { n: 1, correct: 1, streak: 1 },
      model,
    });
    const parsed = parsePersistedExamState(raw);
    expect(parsed?.departments).toEqual(['prawo', 'operatorka']);
    expect(parsed?.answered).toEqual(['pr-001']);
    expect(parsed?.session.n).toBe(1);
  });

  it('rejects invalid version', () => {
    expect(parsePersistedExamState(JSON.stringify({ v: 2 }))).toBeNull();
  });
});

describe('perDepartmentCounts', () => {
  it('counts questions per department in queue', () => {
    const model = initModelState();
    const plan = buildSessionPlan(['radiotechnika', 'prawo'], model);
    const counts = perDepartmentCounts(plan.queue, plan.departments);
    expect(counts.radiotechnika).toBe(8);
    expect(counts.prawo).toBe(8);
  });
});

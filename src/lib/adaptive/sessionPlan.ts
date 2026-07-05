import { QUESTIONS } from '@/data/questions';
import {
  DEPARTMENT_TOPICS,
  QUESTIONS_PER_DEPARTMENT,
  departmentForTopic,
  type DepartmentId,
} from '@/data/departments';
import { selectNext } from '@/lib/adaptive/engine';
import type { ModelState, Question, TopicId } from '@/types/domain';

export type SessionPlan = {
  readonly departments: readonly DepartmentId[];
  readonly queue: readonly Question[];
  readonly perDepartment: Readonly<Record<DepartmentId, number>>;
};

export function questionsInDepartment(departmentId: DepartmentId): readonly Question[] {
  const topics = new Set<TopicId>(DEPARTMENT_TOPICS[departmentId]);
  return QUESTIONS.filter((q) => topics.has(q.topic));
}

export function targetCountForDepartment(departmentId: DepartmentId): number {
  const poolSize = questionsInDepartment(departmentId).length;
  return Math.min(QUESTIONS_PER_DEPARTMENT, poolSize);
}

export function pickQuestionsForDepartment(
  departmentId: DepartmentId,
  state: ModelState,
  count: number,
): readonly Question[] {
  const pool = questionsInDepartment(departmentId);
  const picked: Question[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count; i++) {
    const next = selectNext(pool, state, used);
    if (!next) break;
    picked.push(next);
    used.add(next.id);
  }

  return picked;
}

export function buildSessionPlan(
  departments: readonly DepartmentId[],
  state: ModelState,
): SessionPlan {
  const queue: Question[] = [];
  const perDepartment = {} as Record<DepartmentId, number>;

  for (const departmentId of departments) {
    const target = targetCountForDepartment(departmentId);
    const picked = pickQuestionsForDepartment(departmentId, state, target);
    perDepartment[departmentId] = picked.length;
    queue.push(...picked);
  }

  return { departments, queue, perDepartment };
}

export function reconstructQueue(ids: readonly string[]): readonly Question[] {
  const byId = new Map<string, Question>(QUESTIONS.map((q) => [q.id, q]));
  return ids.flatMap((id) => {
    const q = byId.get(id);
    return q ? [q] : [];
  });
}

export function sessionTotal(plan: SessionPlan): number {
  return plan.queue.length;
}

export function perDepartmentCounts(
  queue: readonly Question[],
  departments: readonly DepartmentId[],
): Readonly<Record<DepartmentId, number>> {
  const counts = {} as Record<DepartmentId, number>;
  for (const id of departments) counts[id] = 0;
  for (const q of queue) {
    const dept = departmentForTopic(q.topic);
    if (dept in counts) counts[dept]++;
  }
  return counts;
}

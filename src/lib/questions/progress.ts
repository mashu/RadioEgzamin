import { DEPARTMENT_ORDER, type DepartmentId } from '@/data/departments';
import { QUESTIONS, QUESTION_BANK_META } from '@/data/questions';
import type { ModelState } from '@/types/domain';

export type BankProgress = {
  readonly attempted: number;
  readonly total: number;
  readonly byDepartment: Readonly<Record<DepartmentId, { readonly attempted: number; readonly total: number }>>;
};

function isAttempted(counts: { readonly s: number; readonly f: number } | undefined): boolean {
  if (!counts) return false;
  return counts.s + counts.f > 0;
}

export function countBankProgress(model: ModelState): BankProgress {
  const byDepartment = {} as Record<DepartmentId, { attempted: number; total: number }>;
  for (const dept of DEPARTMENT_ORDER) {
    byDepartment[dept] = { attempted: 0, total: 0 };
  }

  let attempted = 0;
  for (const q of QUESTIONS) {
    const row = byDepartment[q.department];
    row.total += 1;
    if (isAttempted(model.q[q.id])) {
      row.attempted += 1;
      attempted += 1;
    }
  }

  return {
    attempted,
    total: QUESTION_BANK_META.total,
    byDepartment,
  };
}

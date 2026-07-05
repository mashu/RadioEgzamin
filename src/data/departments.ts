import type { TopicId } from '@/types/domain';

export type DepartmentId = 'radiotechnika' | 'bezpieczenstwo' | 'operatorka' | 'prawo';

export const DEPARTMENTS = {
  radiotechnika: 'Radiotechnika',
  bezpieczenstwo: 'Bezpieczeństwo',
  operatorka: 'Operatorka',
  prawo: 'Prawo i przepisy',
} as const satisfies Record<DepartmentId, string>;

export const DEPARTMENT_ORDER: readonly DepartmentId[] = [
  'radiotechnika',
  'bezpieczenstwo',
  'operatorka',
  'prawo',
];

export const DEPARTMENT_TOPICS: Record<DepartmentId, readonly TopicId[]> = {
  radiotechnika: ['elektro', 'ac', 'elementy', 'fale', 'modulacje', 'nadodb', 'anteny', 'pomiary'],
  bezpieczenstwo: ['bezpiecz'],
  operatorka: ['qkod'],
  prawo: ['przepisy'],
};

export const QUESTIONS_PER_DEPARTMENT = 8;

export const DEFAULT_DEPARTMENTS: readonly DepartmentId[] = DEPARTMENT_ORDER;

export function departmentForTopic(topic: TopicId): DepartmentId {
  for (const id of DEPARTMENT_ORDER) {
    if (DEPARTMENT_TOPICS[id].includes(topic)) return id;
  }
  return 'radiotechnika';
}

import { DEFAULT_DEPARTMENTS, DEPARTMENT_ORDER, type DepartmentId } from '@/data/departments';
import { TOPIC_ORDER } from '@/data/topics';
import { initModelState } from '@/lib/state/modelReducer';
import type { ModelState, TopicId } from '@/types/domain';

export const EXAM_COOKIE_NAME = 'radio-egzamin-v1';
export const EXAM_COOKIE_MAX_AGE_DAYS = 365;

export type PersistedSessionStats = {
  readonly n: number;
  readonly correct: number;
  readonly streak: number;
};

export type PersistedExamState = {
  readonly v: 1;
  readonly departments: readonly DepartmentId[];
  readonly queue: readonly string[];
  readonly answered: readonly string[];
  readonly session: PersistedSessionStats;
  readonly model: ModelState;
};

function isDepartmentId(value: string): value is DepartmentId {
  return (DEPARTMENT_ORDER as readonly string[]).includes(value);
}

function parseDepartments(raw: unknown): readonly DepartmentId[] {
  if (!Array.isArray(raw)) return DEFAULT_DEPARTMENTS;
  const parsed = raw.filter((item): item is DepartmentId => typeof item === 'string' && isDepartmentId(item));
  return parsed.length > 0 ? parsed : DEFAULT_DEPARTMENTS;
}

function parseStringArray(raw: unknown): readonly string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string');
}

function parseSession(raw: unknown): PersistedSessionStats {
  if (!raw || typeof raw !== 'object') return { n: 0, correct: 0, streak: 0 };
  const s = raw as Record<string, unknown>;
  return {
    n: typeof s['n'] === 'number' ? s['n'] : 0,
    correct: typeof s['correct'] === 'number' ? s['correct'] : 0,
    streak: typeof s['streak'] === 'number' ? s['streak'] : 0,
  };
}

function parseTopicCounts(raw: unknown): { s: number; f: number } {
  if (!raw || typeof raw !== 'object') return { s: 0, f: 0 };
  const t = raw as Record<string, unknown>;
  return {
    s: typeof t['s'] === 'number' ? t['s'] : 0,
    f: typeof t['f'] === 'number' ? t['f'] : 0,
  };
}

function parseModel(raw: unknown): ModelState | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  if (!m['q'] || typeof m['q'] !== 'object' || !m['t'] || typeof m['t'] !== 'object') return null;

  const base = initModelState();
  const q: Record<string, { s: number; f: number }> = { ...base.q };
  for (const [id, counts] of Object.entries(m['q'] as Record<string, unknown>)) {
    q[id] = parseTopicCounts(counts);
  }

  const t = { ...base.t } as Record<TopicId, { s: number; f: number }>;
  for (const id of TOPIC_ORDER) {
    const counts = (m['t'] as Record<string, unknown>)[id];
    if (counts) t[id] = parseTopicCounts(counts);
  }

  return { q, t };
}

export function parsePersistedExamState(raw: string): PersistedExamState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const data = parsed as Record<string, unknown>;
    if (data['v'] !== 1) return null;

    const model = parseModel(data['model']);
    if (!model) return null;

    const queue = parseStringArray(data['queue']);
    if (queue.length === 0) return null;

    return {
      v: 1,
      departments: parseDepartments(data['departments']),
      queue,
      answered: parseStringArray(data['answered']),
      session: parseSession(data['session']),
      model,
    };
  } catch {
    return null;
  }
}

export function readExamCookie(): PersistedExamState | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${EXAM_COOKIE_NAME}=`;
  const entry = document.cookie.split('; ').find((row) => row.startsWith(prefix));
  if (!entry) return null;
  const value = decodeURIComponent(entry.slice(prefix.length));
  return parsePersistedExamState(value);
}

export function writeExamCookie(state: PersistedExamState): void {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(JSON.stringify(state));
  const maxAge = EXAM_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${EXAM_COOKIE_NAME}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearExamCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${EXAM_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function toPersistedExamState(input: {
  readonly departments: readonly DepartmentId[];
  readonly queue: readonly string[];
  readonly answered: ReadonlySet<string>;
  readonly session: PersistedSessionStats;
  readonly model: ModelState;
}): PersistedExamState {
  return {
    v: 1,
    departments: input.departments,
    queue: input.queue,
    answered: [...input.answered],
    session: input.session,
    model: input.model,
  };
}

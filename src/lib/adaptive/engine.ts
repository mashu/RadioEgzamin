import { QUESTIONS } from '@/data/questions';
import { TOPIC_BASE, FAIL_W, PRIOR_A, PRIOR_B, POOL } from '@/lib/adaptive/constants';
import { betaSample, dirichletSample } from '@/lib/adaptive/math';
import type { ModelState, Question, TopicCounts, TopicId } from '@/types/domain';

export function topicMastery(tc: TopicCounts): number {
  const a = PRIOR_A + tc.s;
  const b = PRIOR_B + tc.f;
  return a / (a + b);
}

export function questionAB(
  qc: TopicCounts,
  tc: TopicCounts,
): { readonly a: number; readonly b: number } {
  const m = topicMastery(tc);
  const a = POOL * m + qc.s;
  const b = POOL * (1 - m) + qc.f;
  return { a: a + 0.001, b: b + 0.001 };
}

export function topicWeights(
  topicIds: readonly TopicId[],
  state: ModelState,
  byTopicRemaining: Readonly<Record<TopicId, number>>,
): Readonly<Record<TopicId, number>> {
  const avail = topicIds.filter((t) => (byTopicRemaining[t] ?? 0) > 0);
  const alphas = avail.map((t) => TOPIC_BASE + FAIL_W * state.t[t].f);
  const sum = alphas.reduce((p, c) => p + c, 0) || 1;
  const out: Partial<Record<TopicId, number>> = {};
  avail.forEach((t, i) => {
    out[t] = alphas[i]! / sum;
  });
  return out as Readonly<Record<TopicId, number>>;
}

export function selectNext(
  questions: readonly Question[],
  state: ModelState,
  answered: ReadonlySet<string>,
): Question | null {
  const avail = questions.filter((q) => !answered.has(q.id));
  if (avail.length === 0) return null;

  const byTopic: Partial<Record<TopicId, Question[]>> = {};
  for (const q of avail) {
    const list = byTopic[q.topic] ?? [];
    list.push(q);
    byTopic[q.topic] = list;
  }

  const topics = Object.keys(byTopic) as TopicId[];
  const alphas = topics.map((t) => TOPIC_BASE + FAIL_W * state.t[t].f);
  const p = dirichletSample(alphas);
  let r = Math.random();
  let acc = 0;
  let ti = p.length - 1;
  for (let i = 0; i < p.length; i++) {
    acc += p[i]!;
    if (r <= acc) {
      ti = i;
      break;
    }
  }

  const topic = topics[ti];
  if (!topic) return null;

  const pool = byTopic[topic];
  if (!pool || pool.length === 0) return null;

  let best = pool[0]!;
  let bestTheta = Infinity;
  for (const q of pool) {
    const { a, b } = questionAB(state.q[q.id]!, state.t[topic]);
    const theta = betaSample(a, b);
    if (theta < bestTheta) {
      bestTheta = theta;
      best = q;
    }
  }
  return best;
}

export function countRemainingByTopic(
  answered: ReadonlySet<string>,
  topicOrder: readonly TopicId[],
): Record<TopicId, number> {
  const remaining: Record<TopicId, number> = {} as Record<TopicId, number>;
  for (const t of topicOrder) remaining[t] = 0;
  for (const q of QUESTIONS) {
    if (!answered.has(q.id)) {
      remaining[q.topic] = (remaining[q.topic] ?? 0) + 1;
    }
  }
  return remaining;
}

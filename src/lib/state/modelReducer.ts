import { QUESTIONS } from '@/data/questions';
import { TOPIC_ORDER } from '@/data/topics';
import type { ModelAction, ModelState, TopicId } from '@/types/domain';

export function initModelState(): ModelState {
  const q: Record<string, { s: number; f: number }> = {};
  for (const it of QUESTIONS) q[it.id] = { s: 0, f: 0 };
  const t = {} as Record<TopicId, { s: number; f: number }>;
  for (const k of TOPIC_ORDER) t[k] = { s: 0, f: 0 };
  return { q, t };
}

export function modelReducer(state: ModelState, action: ModelAction): ModelState {
  if (action.type === 'answer') {
    const { id, topic, correct } = action;
    const prevQ = state.q[id] ?? { s: 0, f: 0 };
    const prevT = state.t[topic];
    return {
      q: {
        ...state.q,
        [id]: { s: prevQ.s + (correct ? 1 : 0), f: prevQ.f + (correct ? 0 : 1) },
      },
      t: {
        ...state.t,
        [topic]: { s: prevT.s + (correct ? 1 : 0), f: prevT.f + (correct ? 0 : 1) },
      },
    };
  }
  if (action.type === 'resetModel') return initModelState();
  return state;
}

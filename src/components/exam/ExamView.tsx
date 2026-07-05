'use client';

import { useMemo, useState } from 'react';
import { QUESTIONS } from '@/data/questions';
import { TOPICS, TOPIC_ORDER } from '@/data/topics';
import { ExamDashboard } from '@/components/exam/ExamDashboard';
import { ExamQuestionCard } from '@/components/exam/ExamQuestionCard';
import { ExamSessionComplete } from '@/components/exam/ExamSessionComplete';
import { PRIOR_A, PRIOR_B, TOPIC_BASE, FAIL_W } from '@/lib/adaptive/constants';
import { countRemainingByTopic, questionAB, selectNext } from '@/lib/adaptive/engine';
import { betaMeanSd } from '@/lib/adaptive/math';
import type { ModelAction, ModelState } from '@/types/domain';

type ExamViewProps = {
  readonly model: ModelState;
  readonly dispatch: React.Dispatch<ModelAction>;
};

type SessionStats = {
  readonly n: number;
  readonly correct: number;
  readonly streak: number;
};

export function ExamView({ model, dispatch }: ExamViewProps) {
  const [answered, setAnswered] = useState<ReadonlySet<string>>(() => new Set());
  const [current, setCurrent] = useState(() => selectNext(QUESTIONS, model, new Set()));
  const [choice, setChoice] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [session, setSession] = useState<SessionStats>({ n: 0, correct: 0, streak: 0 });

  function onChoose(i: number) {
    if (choice !== null || !current) return;
    const correct = i === current.a;
    setChoice(i);
    dispatch({ type: 'answer', id: current.id, topic: current.topic, correct });
    setSession((s) => ({
      n: s.n + 1,
      correct: s.correct + (correct ? 1 : 0),
      streak: correct ? s.streak + 1 : 0,
    }));
  }

  function onNext() {
    const nextAnswered = new Set(answered);
    if (current) nextAnswered.add(current.id);
    setAnswered(nextAnswered);
    setCurrent(selectNext(QUESTIONS, model, nextAnswered));
    setChoice(null);
    setShowExp(false);
  }

  function onNewSession() {
    setAnswered(new Set());
    setSession({ n: 0, correct: 0, streak: 0 });
    setCurrent(selectNext(QUESTIONS, model, new Set()));
    setChoice(null);
    setShowExp(false);
  }

  const dash = useMemo(() => {
    const remainingByTopic = countRemainingByTopic(answered, TOPIC_ORDER);
    const active = TOPIC_ORDER.filter((t) => QUESTIONS.some((q) => q.topic === t));
    const bars = active.map((t) => {
      const { m, sd } = betaMeanSd(PRIOR_A + model.t[t].s, PRIOR_B + model.t[t].f);
      return { id: t, label: TOPICS[t], m, sd };
    });
    const wAvail = active.filter((t) => (remainingByTopic[t] ?? 0) > 0);
    const alphas = wAvail.map((t) => TOPIC_BASE + FAIL_W * model.t[t].f);
    const sum = alphas.reduce((p, c) => p + c, 0) || 1;
    const weights = wAvail
      .map((t, i) => ({ id: t, label: TOPICS[t], wt: alphas[i]! / sum }))
      .sort((x, y) => y.wt - x.wt);
    return { bars, weights };
  }, [model, answered]);

  const total = QUESTIONS.length;
  const done = answered.size;
  const acc = session.n ? Math.round((session.correct / session.n) * 100) : 0;
  const curAB = current ? questionAB(model.q[current.id]!, model.t[current.topic]) : null;

  return (
    <div className="rk-exam">
      <div className="rk-exam-main">
        {current ? (
          <ExamQuestionCard
            question={current}
            topicLabel={TOPICS[current.topic]}
            sessionNumber={session.n + 1}
            done={done}
            total={total}
            choice={choice}
            showExplanation={showExp}
            onChoose={onChoose}
            onToggleExplanation={() => setShowExp((v) => !v)}
            onNext={onNext}
          />
        ) : (
          <ExamSessionComplete
            sessionCount={session.n}
            sessionCorrect={session.correct}
            accuracy={acc}
            onNewSession={onNewSession}
          />
        )}
      </div>

      <ExamDashboard
        done={done}
        total={total}
        accuracy={acc}
        streak={session.streak}
        currentBeta={curAB}
        masteryBars={dash.bars}
        weightBars={dash.weights}
        onResetModel={() => {
          dispatch({ type: 'resetModel' });
          onNewSession();
        }}
      />
    </div>
  );
}

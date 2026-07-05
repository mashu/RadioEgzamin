'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_DEPARTMENTS,
  DEPARTMENT_TOPICS,
  DEPARTMENTS,
  type DepartmentId,
} from '@/data/departments';
import { TOPICS, TOPIC_ORDER } from '@/data/topics';
import { PRIOR_A, PRIOR_B, TOPIC_BASE, FAIL_W } from '@/lib/adaptive/constants';
import { countRemainingByTopic, questionAB } from '@/lib/adaptive/engine';
import { betaMeanSd } from '@/lib/adaptive/math';
import {
  buildSessionPlan,
  perDepartmentCounts,
  reconstructQueue,
  sessionTotal,
  type SessionPlan,
} from '@/lib/adaptive/sessionPlan';
import {
  readExamCookie,
  toPersistedExamState,
  writeExamCookie,
} from '@/lib/persistence/examStorage';
import { initModelState } from '@/lib/state/modelReducer';
import type { ModelAction, ModelState, Question, TopicId } from '@/types/domain';

type SessionStats = {
  readonly n: number;
  readonly correct: number;
  readonly streak: number;
};

function currentFromQueue(queue: readonly Question[], answered: ReadonlySet<string>): Question | null {
  return queue.find((q) => !answered.has(q.id)) ?? null;
}

export function useExamSession(model: ModelState, dispatch: React.Dispatch<ModelAction>) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<ReadonlySet<DepartmentId>>(
    () => new Set(DEFAULT_DEPARTMENTS),
  );
  const [sessionPlan, setSessionPlan] = useState<SessionPlan | null>(null);
  const [answered, setAnswered] = useState<ReadonlySet<string>>(() => new Set());
  const [choice, setChoice] = useState<number | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [session, setSession] = useState<SessionStats>({ n: 0, correct: 0, streak: 0 });
  const [pendingDepartmentChange, setPendingDepartmentChange] = useState(false);

  const persist = useCallback(
    (input: {
      readonly departments: ReadonlySet<DepartmentId>;
      readonly plan: SessionPlan;
      readonly answeredIds: ReadonlySet<string>;
      readonly sessionStats: SessionStats;
      readonly modelState: ModelState;
    }) => {
      writeExamCookie(
        toPersistedExamState({
          departments: [...input.departments],
          queue: input.plan.queue.map((q) => q.id),
          answered: input.answeredIds,
          session: input.sessionStats,
          model: input.modelState,
        }),
      );
    },
    [],
  );

  const startSession = useCallback(
    (departments: readonly DepartmentId[], modelState: ModelState) => {
      const plan = buildSessionPlan(departments, modelState);
      const deptSet = new Set(departments);
      const stats = { n: 0, correct: 0, streak: 0 };
      setSelectedDepartments(deptSet);
      setSessionPlan(plan);
      setAnswered(new Set());
      setSession(stats);
      setChoice(null);
      setShowExp(false);
      setPendingDepartmentChange(false);
      persist({
        departments: deptSet,
        plan,
        answeredIds: new Set(),
        sessionStats: stats,
        modelState,
      });
    },
    [persist],
  );

  useEffect(() => {
    const saved = readExamCookie();
    if (saved) {
      dispatch({ type: 'hydrate', state: saved.model });
      const queue = reconstructQueue(saved.queue);
      const plan: SessionPlan = {
        departments: saved.departments,
        queue,
        perDepartment: perDepartmentCounts(queue, saved.departments),
      };
      setSelectedDepartments(new Set(saved.departments));
      setSessionPlan(plan);
      setAnswered(new Set(saved.answered));
      setSession(saved.session);
    } else {
      const initialModel = initModelState();
      dispatch({ type: 'hydrate', state: initialModel });
      startSession(DEFAULT_DEPARTMENTS, initialModel);
    }
    setBootstrapped(true);
  }, [dispatch, startSession]);

  useEffect(() => {
    if (!bootstrapped || !sessionPlan) return;
    persist({
      departments: selectedDepartments,
      plan: sessionPlan,
      answeredIds: answered,
      sessionStats: session,
      modelState: model,
    });
  }, [bootstrapped, sessionPlan, selectedDepartments, answered, session, model, persist]);

  const current = sessionPlan ? currentFromQueue(sessionPlan.queue, answered) : null;
  const total = sessionPlan ? sessionTotal(sessionPlan) : 0;
  const done = answered.size;
  const acc = session.n ? Math.round((session.correct / session.n) * 100) : 0;
  const isComplete = bootstrapped && sessionPlan !== null && current === null && done > 0;

  const activeTopics = useMemo(() => {
    const topics = new Set<TopicId>();
    for (const dept of selectedDepartments) {
      for (const t of DEPARTMENT_TOPICS[dept]) topics.add(t);
    }
    return TOPIC_ORDER.filter((t) => topics.has(t));
  }, [selectedDepartments]);

  const dash = useMemo(() => {
    const remainingByTopic = countRemainingByTopic(answered, TOPIC_ORDER);
    const bars = activeTopics.map((t) => {
      const { m, sd } = betaMeanSd(PRIOR_A + model.t[t].s, PRIOR_B + model.t[t].f);
      return { id: t, label: TOPICS[t], m, sd };
    });
    const wAvail = activeTopics.filter((t) => (remainingByTopic[t] ?? 0) > 0);
    const alphas = wAvail.map((t) => TOPIC_BASE + FAIL_W * model.t[t].f);
    const sum = alphas.reduce((p, c) => p + c, 0) || 1;
    const weights = wAvail
      .map((t, i) => ({ id: t, label: TOPICS[t], wt: alphas[i]! / sum }))
      .sort((x, y) => y.wt - x.wt);
    return { bars, weights };
  }, [model, answered, activeTopics]);

  const departmentProgress = useMemo(() => {
    if (!sessionPlan) return [];
    return sessionPlan.departments.map((id) => {
      const topics = new Set(DEPARTMENT_TOPICS[id]);
      const inDept = sessionPlan.queue.filter((q) => topics.has(q.topic));
      const solved = inDept.filter((q) => answered.has(q.id)).length;
      return {
        id,
        label: DEPARTMENTS[id],
        done: solved,
        total: inDept.length,
      };
    });
  }, [sessionPlan, answered]);

  const curAB = current ? questionAB(model.q[current.id]!, model.t[current.topic]) : null;

  function toggleDepartment(id: DepartmentId) {
    setSelectedDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setPendingDepartmentChange(true);
  }

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
    if (!current) return;
    setAnswered((prev) => new Set(prev).add(current.id));
    setChoice(null);
    setShowExp(false);
  }

  function onNewSession() {
    startSession([...selectedDepartments], model);
  }

  function onApplyDepartments() {
    startSession([...selectedDepartments], model);
  }

  function onResetModel() {
    const fresh = initModelState();
    dispatch({ type: 'hydrate', state: fresh });
    startSession([...selectedDepartments], fresh);
  }

  return {
    bootstrapped,
    current,
    choice,
    showExp,
    setShowExp,
    session,
    total,
    done,
    acc,
    isComplete,
    curAB,
    dash,
    departmentProgress,
    selectedDepartments,
    pendingDepartmentChange,
    toggleDepartment,
    onChoose,
    onNext,
    onNewSession,
    onApplyDepartments,
    onResetModel,
    canStartSession: selectedDepartments.size > 0,
  };
}

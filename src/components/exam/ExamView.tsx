'use client';

import { TOPICS } from '@/data/topics';
import { ExamDashboard } from '@/components/exam/ExamDashboard';
import { ExamDepartmentPicker } from '@/components/exam/ExamDepartmentPicker';
import { ExamQuestionCard } from '@/components/exam/ExamQuestionCard';
import { ExamSessionComplete } from '@/components/exam/ExamSessionComplete';
import { useExamSession } from '@/hooks/useExamSession';
import type { ModelAction, ModelState } from '@/types/domain';

type ExamViewProps = {
  readonly model: ModelState;
  readonly dispatch: React.Dispatch<ModelAction>;
};

export function ExamView({ model, dispatch }: ExamViewProps) {
  const exam = useExamSession(model, dispatch);

  return (
    <div className="rk-exam">
      <div className="rk-exam-main">
        {!exam.bootstrapped ? (
          <div className="rk-card rk-qcard" aria-busy="true" aria-live="polite">
            <span className="rk-eyebrow">egzamin</span>
            <p className="rk-inksoft">Przygotowuję sesję…</p>
          </div>
        ) : exam.current ? (
          <ExamQuestionCard
            question={exam.current}
            topicLabel={TOPICS[exam.current.topic]}
            sessionNumber={exam.session.n + 1}
            done={exam.done}
            total={exam.total}
            choice={exam.choice}
            showExplanation={exam.showExp}
            onChoose={exam.onChoose}
            onToggleExplanation={() => exam.setShowExp((v) => !v)}
            onNext={exam.onNext}
          />
        ) : exam.isComplete ? (
          <ExamSessionComplete
            sessionCount={exam.session.n}
            sessionCorrect={exam.session.correct}
            accuracy={exam.acc}
            onNewSession={exam.onNewSession}
          />
        ) : (
          <div className="rk-card rk-qcard">
            <span className="rk-eyebrow">egzamin</span>
            <p className="rk-inksoft">Wybierz działy i rozpocznij sesję.</p>
          </div>
        )}
      </div>

      <ExamDashboard
        done={exam.done}
        total={exam.total}
        accuracy={exam.acc}
        streak={exam.session.streak}
        currentBeta={exam.curAB}
        masteryBars={exam.dash.bars}
        weightBars={exam.dash.weights}
        departmentProgress={exam.departmentProgress}
        departmentPicker={
          <ExamDepartmentPicker
            selected={exam.selectedDepartments}
            onToggle={exam.toggleDepartment}
            onStartSession={exam.pendingDepartmentChange ? exam.onApplyDepartments : exam.onNewSession}
            canStart={exam.canStartSession}
            pendingChange={exam.pendingDepartmentChange}
          />
        }
        onResetModel={exam.onResetModel}
      />
    </div>
  );
}

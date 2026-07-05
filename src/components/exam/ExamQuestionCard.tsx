import { renderChart } from '@/components/charts/ChartRenderer';
import type { Question } from '@/types/domain';

type ExamQuestionCardProps = {
  readonly question: Question;
  readonly topicLabel: string;
  readonly sessionNumber: number;
  readonly done: number;
  readonly total: number;
  readonly choice: number | null;
  readonly showExplanation: boolean;
  readonly onChoose: (index: number) => void;
  readonly onToggleExplanation: () => void;
  readonly onNext: () => void;
};

export function ExamQuestionCard({
  question,
  topicLabel,
  sessionNumber,
  done,
  total,
  choice,
  showExplanation,
  onChoose,
  onToggleExplanation,
  onNext,
}: ExamQuestionCardProps) {
  return (
    <div className="rk-card rk-qcard">
      <div className="rk-qhead">
        <span className="rk-eyebrow">{topicLabel}</span>
        <span className="rk-mono rk-qcount">
          pyt. {sessionNumber} · {done}/{total} w sesji
        </span>
      </div>
      <h2 className="rk-qtext">{question.q}</h2>
      <div className="rk-options">
        {question.o.map((opt, i) => {
          const letter = 'ABC'[i] ?? '?';
          let cls = 'rk-opt';
          if (choice !== null) {
            if (i === question.a) cls += ' is-correct';
            else if (i === choice) cls += ' is-wrong';
            else cls += ' is-dim';
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => onChoose(i)}
              disabled={choice !== null}
            >
              <span className="rk-optletter rk-mono">{letter}</span>
              <span className="rk-opttext">{opt}</span>
              {choice !== null && i === question.a ? <span className="rk-optmark">✓</span> : null}
              {choice !== null && i === choice && i !== question.a ? <span className="rk-optmark">✕</span> : null}
            </button>
          );
        })}
      </div>

      <div className="rk-actions">
        <button type="button" className="rk-btn rk-btn-ghost" onClick={onToggleExplanation}>
          {showExplanation ? 'Ukryj wyjaśnienie' : 'Pokaż wyjaśnienie'}
        </button>
        {choice !== null ? (
          <button type="button" className="rk-btn rk-btn-solid" onClick={onNext}>
            Następne pytanie →
          </button>
        ) : null}
      </div>

      {showExplanation ? (
        <div className="rk-explain">
          <div className="rk-explain-label rk-mono">wyjaśnienie</div>
          {question.e.split('\n').map((para, k) => (
            <p key={k}>{para}</p>
          ))}
          {question.x ? <div className="rk-explain-chart">{renderChart(question.x)}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

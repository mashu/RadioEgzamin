import { BetaChart } from '@/components/charts/BetaChart';
import { MasteryBars, type MasteryBarItem } from '@/components/charts/MasteryBars';
import { WeightBars, type WeightBarItem } from '@/components/charts/WeightBars';
import { DEPARTMENTS, DEPARTMENT_ORDER, type DepartmentId } from '@/data/departments';
import type { BankProgress } from '@/lib/questions/progress';
import type { ReactNode } from 'react';

type DepartmentProgressItem = {
  readonly id: DepartmentId;
  readonly label: string;
  readonly done: number;
  readonly total: number;
};

type ExamDashboardProps = {
  readonly done: number;
  readonly total: number;
  readonly accuracy: number;
  readonly streak: number;
  readonly bankProgress: BankProgress;
  readonly currentBeta: { readonly a: number; readonly b: number } | null;
  readonly masteryBars: readonly MasteryBarItem[];
  readonly weightBars: readonly WeightBarItem[];
  readonly departmentProgress: readonly DepartmentProgressItem[];
  readonly departmentPicker: ReactNode;
  readonly onResetModel: () => void;
};

export function ExamDashboard({
  done,
  total,
  accuracy,
  streak,
  bankProgress,
  currentBeta,
  masteryBars,
  weightBars,
  departmentProgress,
  departmentPicker,
  onResetModel,
}: ExamDashboardProps) {
  const { attempted: bankAttempted, total: bankTotal, byDepartment: bankByDepartment } = bankProgress;

  return (
    <aside className="rk-dash">
      {departmentPicker}

      <div className="rk-card">
        <span className="rk-eyebrow">baza pytań · kategoria 1</span>
        <div className="rk-stats rk-stats-compact">
          <div className="rk-stat">
            <div className="rk-stat-v rk-mono">
              {bankAttempted}/{bankTotal}
            </div>
            <div className="rk-stat-l">przerobione</div>
          </div>
        </div>
        <div className="rk-progress">
          <div
            className="rk-progress-fill"
            style={{ width: bankTotal ? `${(bankAttempted / bankTotal) * 100}%` : '0%' }}
          />
        </div>
        <div className="rk-dept-progress">
          {DEPARTMENT_ORDER.map((id) => {
            const row = bankByDepartment[id];
            if (!row) return null;
            return (
              <div key={id} className="rk-dept-progress-row">
                <span>{DEPARTMENTS[id]}</span>
                <span className="rk-mono">
                  {row.attempted}/{row.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rk-card">
        <span className="rk-eyebrow">pulpit sesji</span>
        <div className="rk-stats">
          <div className="rk-stat">
            <div className="rk-stat-v rk-mono">
              {done}/{total}
            </div>
            <div className="rk-stat-l">rozwiązane</div>
          </div>
          <div className="rk-stat">
            <div className="rk-stat-v rk-mono">{accuracy}%</div>
            <div className="rk-stat-l">skuteczność</div>
          </div>
          <div className="rk-stat">
            <div className="rk-stat-v rk-mono">{streak}</div>
            <div className="rk-stat-l">seria</div>
          </div>
        </div>
        <div className="rk-progress">
          <div className="rk-progress-fill" style={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
        </div>
      </div>

      {departmentProgress.length > 0 ? (
        <div className="rk-card">
          <span className="rk-eyebrow">postęp wg działów</span>
          <div className="rk-dept-progress">
            {departmentProgress.map((item) => (
              <div key={item.id} className="rk-dept-progress-row">
                <span>{item.label}</span>
                <span className="rk-mono">
                  {item.done}/{item.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {currentBeta ? (
        <div className="rk-card">
          <span className="rk-eyebrow">rozkład dla bieżącego pytania</span>
          <BetaChart
            a={currentBeta.a}
            b={currentBeta.b}
            height={168}
            label={`Beta(α=${currentBeta.a.toFixed(2)}, β=${currentBeta.b.toFixed(2)})`}
          />
          <p className="rk-inksoft rk-tiny">
            Niższa średnia = model uznaje pytanie za trudniejsze i losuje je częściej.
          </p>
        </div>
      ) : null}

      <div className="rk-card">
        <span className="rk-eyebrow">biegłość wg tematów</span>
        <MasteryBars items={masteryBars} />
      </div>

      {weightBars.length > 0 ? (
        <div className="rk-card">
          <span className="rk-eyebrow">priorytet losowania</span>
          <WeightBars items={weightBars} />
        </div>
      ) : null}

      <button type="button" className="rk-btn rk-btn-ghost rk-btn-block" onClick={onResetModel}>
        Wyzeruj model uczenia
      </button>
    </aside>
  );
}

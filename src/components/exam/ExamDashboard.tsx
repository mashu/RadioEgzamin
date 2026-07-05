import { BetaChart } from '@/components/charts/BetaChart';
import { MasteryBars, type MasteryBarItem } from '@/components/charts/MasteryBars';
import { WeightBars, type WeightBarItem } from '@/components/charts/WeightBars';

type ExamDashboardProps = {
  readonly done: number;
  readonly total: number;
  readonly accuracy: number;
  readonly streak: number;
  readonly currentBeta: { readonly a: number; readonly b: number } | null;
  readonly masteryBars: readonly MasteryBarItem[];
  readonly weightBars: readonly WeightBarItem[];
  readonly onResetModel: () => void;
};

export function ExamDashboard({
  done,
  total,
  accuracy,
  streak,
  currentBeta,
  masteryBars,
  weightBars,
  onResetModel,
}: ExamDashboardProps) {
  return (
    <aside className="rk-dash">
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
          <div className="rk-progress-fill" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>

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

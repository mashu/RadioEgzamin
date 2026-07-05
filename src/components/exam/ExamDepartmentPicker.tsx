import { DEPARTMENTS, DEPARTMENT_ORDER, type DepartmentId } from '@/data/departments';
import { QUESTION_BANK_META } from '@/data/questions';

type ExamDepartmentPickerProps = {
  readonly selected: ReadonlySet<DepartmentId>;
  readonly onToggle: (id: DepartmentId) => void;
  readonly onStartSession: () => void;
  readonly canStart: boolean;
  readonly pendingChange: boolean;
};

export function ExamDepartmentPicker({
  selected,
  onToggle,
  onStartSession,
  canStart,
  pendingChange,
}: ExamDepartmentPickerProps) {
  return (
    <div className="rk-card">
      <span className="rk-eyebrow">działy egzaminu</span>
      <p className="rk-inksoft rk-tiny">
        Pełna baza: {QUESTION_BANK_META.total} pytań (kategoria 1, wersja 3). Sesja losuje 8 pytań z każdego
        wybranego działu.
      </p>
      <div className="rk-dept-list">
        {DEPARTMENT_ORDER.map((id) => {
          const on = selected.has(id);
          const pool = QUESTION_BANK_META.departments[id]?.total ?? 0;
          return (
            <label key={id} className={`rk-dept ${on ? 'is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => onToggle(id)} />
              <span>
                {DEPARTMENTS[id]} <span className="rk-mono rk-dept-count">({pool})</span>
              </span>
            </label>
          );
        })}
      </div>
      <button
        type="button"
        className="rk-btn rk-btn-solid rk-btn-block"
        onClick={onStartSession}
        disabled={!canStart}
      >
        {pendingChange ? 'Zastosuj i rozpocznij sesję' : 'Rozpocznij nową sesję'}
      </button>
    </div>
  );
}

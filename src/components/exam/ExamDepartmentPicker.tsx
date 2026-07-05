import { DEPARTMENTS, DEPARTMENT_ORDER, type DepartmentId } from '@/data/departments';

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
      <p className="rk-inksoft rk-tiny">Wybierz działy. Sesja obejmuje 8 pytań z każdego wybranego działu (lub mniej, gdy w bazie jest mniej pytań).</p>
      <div className="rk-dept-list">
        {DEPARTMENT_ORDER.map((id) => {
          const on = selected.has(id);
          return (
            <label key={id} className={`rk-dept ${on ? 'is-on' : ''}`}>
              <input type="checkbox" checked={on} onChange={() => onToggle(id)} />
              <span>{DEPARTMENTS[id]}</span>
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

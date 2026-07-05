type ExamSessionCompleteProps = {
  readonly sessionCount: number;
  readonly sessionCorrect: number;
  readonly accuracy: number;
  readonly onNewSession: () => void;
};

export function ExamSessionComplete({
  sessionCount,
  sessionCorrect,
  accuracy,
  onNewSession,
}: ExamSessionCompleteProps) {
  return (
    <div className="rk-card rk-done">
      <span className="rk-eyebrow">koniec sesji</span>
      <h2>Wszystkie pytania z tej sesji rozwiązane</h2>
      <p className="rk-inksoft">
        Odpowiedzi w sesji: <b>{sessionCount}</b> · poprawnych: <b>{sessionCorrect}</b> ({accuracy}%).
        Twoje wyniki zasiliły model — kolejna sesja skupi się na słabszych tematach.
      </p>
      <button type="button" className="rk-btn rk-btn-solid" onClick={onNewSession}>
        Nowa sesja
      </button>
    </div>
  );
}

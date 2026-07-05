import type { AppMode } from '@/types/domain';

type AppHeaderProps = {
  readonly mode: AppMode;
  readonly onModeChange: (mode: AppMode) => void;
};

export function AppHeader({ mode, onModeChange }: AppHeaderProps) {
  return (
    <header className="rk-header">
      <div className="rk-brand">
        <div className="rk-sig" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <div className="rk-eyebrow">UKE · Służba radiokomunikacyjna amatorska</div>
          <h1 className="rk-title">
            Świadectwo klasy A <span className="rk-title-sub">· trener egzaminacyjny</span>
          </h1>
        </div>
      </div>
      <div className="rk-modeswitch" role="tablist" aria-label="Tryb">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'exam'}
          className={`rk-mode ${mode === 'exam' ? 'is-on' : ''}`}
          onClick={() => onModeChange('exam')}
        >
          Egzamin
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'book'}
          className={`rk-mode ${mode === 'book' ? 'is-on' : ''}`}
          onClick={() => onModeChange('book')}
        >
          Podręcznik
        </button>
      </div>
    </header>
  );
}

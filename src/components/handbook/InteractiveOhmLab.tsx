'use client';

import { useState } from 'react';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import {
  calcParallel,
  calcSeries,
  calcSingle,
  formatAmp,
  formatOhm,
  formatVolt,
  formatWatt,
} from '@/lib/ohm/circuit';
import {
  ParallelCircuitDiagram,
  SeriesCircuitDiagram,
  SimpleCircuitDiagram,
} from '@/components/handbook/CircuitSchematic';

type OhmCover = 'U' | 'I' | 'R';

const COVER_FORMULA: Record<OhmCover, string> = {
  U: 'U = I · R',
  I: 'I = U / R',
  R: 'R = U / I',
};

function OhmTriangle({ cover }: { readonly cover: OhmCover }) {
  const cx = 120;
  const top = 24;
  const bottom = 148;
  const left = 36;
  const right = 204;

  return (
    <svg viewBox="0 0 240 170" role="img" aria-label="Trójkąt prawa Ohma" className="rk-ohm-triangle">
      <polygon points={`${cx},${top} ${left},${bottom} ${right},${bottom}`} fill={C.panel} stroke={C.line} strokeWidth="2" />
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={C.inkSoft} strokeWidth="1.5" />
      <text x={cx} y={top + 28} textAnchor="middle" fontSize="22" fontWeight="700" fill={cover === 'U' ? C.amber : C.ink}>
        U
      </text>
      <text x={left + 28} y={bottom - 14} textAnchor="middle" fontSize="22" fontWeight="700" fill={cover === 'I' ? C.amber : C.ink}>
        I
      </text>
      <text x={right - 28} y={bottom - 14} textAnchor="middle" fontSize="22" fontWeight="700" fill={cover === 'R' ? C.amber : C.ink}>
        R
      </text>
      {cover === 'U' ? (
        <text x={cx} y={96} textAnchor="middle" fontSize="13" fill={C.inkSoft}>
          I · R
        </text>
      ) : null}
      {cover === 'I' ? (
        <text x={cx} y={96} textAnchor="middle" fontSize="13" fill={C.inkSoft}>
          U / R
        </text>
      ) : null}
      {cover === 'R' ? (
        <text x={cx} y={96} textAnchor="middle" fontSize="13" fill={C.inkSoft}>
          U / I
        </text>
      ) : null}
    </svg>
  );
}

export function InteractiveOhmBasics() {
  const [cover, setCover] = useState<OhmCover>('U');
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(120);
  const result = calcSingle(voltage, resistance);

  return (
    <div className="rk-interactive rk-ohm-lab">
      <p className="rk-ohm-lead">
        Zasłoń w trójkącie szukaną wielkość — wzór odczytasz od razu. Poniżej zmieniaj napięcie i opór; prąd
        płynie w zamkniętej pętli od bieguna + przez opornik z powrotem do −.
      </p>
      <div className="rk-ohm-basics-grid">
        <div className="rk-ohm-triangle-wrap">
          <OhmTriangle cover={cover} />
          <div className="rk-ohm-cover-btns" role="group" aria-label="Zasłoń w trójkącie">
            {(['U', 'I', 'R'] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={`rk-ohm-cover-btn ${cover === key ? 'is-active' : ''}`}
                onClick={() => setCover(key)}
              >
                szukam {key}
              </button>
            ))}
          </div>
          <p className="rk-ohm-formula rk-mono">{COVER_FORMULA[cover]}</p>
        </div>
        <div>
          <SimpleCircuitDiagram voltage={voltage} resistance={resistance} current={result.current} />
          <div className="rk-slider-row">
            <label className="rk-slider">
              <span>
                Napięcie <b className="rk-mono">{formatVolt(voltage)}</b>
              </span>
              <input type="range" min="3" max="24" step="1" value={voltage} onChange={(e) => setVoltage(+e.target.value)} />
            </label>
            <label className="rk-slider">
              <span>
                Opór <b className="rk-mono">{formatOhm(resistance)}</b>
              </span>
              <input type="range" min="10" max="500" step="10" value={resistance} onChange={(e) => setResistance(+e.target.value)} />
            </label>
          </div>
          <div className="rk-ohm-readout">
            <span>
              Prąd <b className="rk-mono">{formatAmp(result.current)}</b>
            </span>
            <span>
              Moc <b className="rk-mono">{formatWatt(result.power)}</b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InteractiveOhmCircuits() {
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const [voltage, setVoltage] = useState(12);
  const [r1, setR1] = useState(100);
  const [r2, setR2] = useState(200);

  const series = calcSeries(voltage, r1, r2);
  const parallel = calcParallel(voltage, r1, r2);
  const active = mode === 'series' ? series : parallel;

  return (
    <div className="rk-interactive rk-ohm-lab">
      <div className="rk-ohm-mode-btns" role="tablist" aria-label="Typ połączenia">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'series'}
          className={`rk-ohm-mode-btn ${mode === 'series' ? 'is-active' : ''}`}
          onClick={() => setMode('series')}
        >
          Szeregowo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'parallel'}
          className={`rk-ohm-mode-btn ${mode === 'parallel' ? 'is-active' : ''}`}
          onClick={() => setMode('parallel')}
        >
          Równolegle
        </button>
      </div>
      <p className="rk-ohm-lead">
        {mode === 'series'
          ? 'Prąd ma tylko jedną drogę w pętli — jest wspólny. Opory się dodają: R = R₁ + R₂. Napięcie źródła dzieli się między oporniki.'
          : 'Napięcie na obu gałęziach jest takie samo. Prądy się dodają, a opór wypadkowy maleje: 1/R = 1/R₁ + 1/R₂.'}
      </p>
      {mode === 'series' ? (
        <SeriesCircuitDiagram voltage={voltage} r1={r1} r2={r2} v1={series.v1} v2={series.v2} current={series.current} />
      ) : (
        <ParallelCircuitDiagram voltage={voltage} r1={r1} r2={r2} i1={parallel.i1} i2={parallel.i2} />
      )}
      <div className="rk-slider-row">
        <label className="rk-slider">
          <span>
            Napięcie <b className="rk-mono">{formatVolt(voltage)}</b>
          </span>
          <input type="range" min="3" max="24" step="1" value={voltage} onChange={(e) => setVoltage(+e.target.value)} />
        </label>
        <label className="rk-slider">
          <span>
            R₁ <b className="rk-mono">{formatOhm(r1)}</b>
          </span>
          <input type="range" min="20" max="400" step="10" value={r1} onChange={(e) => setR1(+e.target.value)} />
        </label>
        <label className="rk-slider">
          <span>
            R₂ <b className="rk-mono">{formatOhm(r2)}</b>
          </span>
          <input type="range" min="20" max="400" step="10" value={r2} onChange={(e) => setR2(+e.target.value)} />
        </label>
      </div>
      <div className="rk-ohm-readout rk-ohm-readout-wide">
        <span>
          R wypadkowy <b className="rk-mono">{formatOhm(active.totalR)}</b>
        </span>
        <span>
          Prąd całkowity <b className="rk-mono">{formatAmp(active.current)}</b>
        </span>
        <span>
          Moc <b className="rk-mono">{formatWatt(active.power)}</b>
        </span>
      </div>
      {mode === 'parallel' && r1 === r2 ? (
        <p className="rk-ohm-hint">
          Dwa jednakowe oporniki równolegle: R = R₀/2. Tu {formatOhm(r1)} ∥ {formatOhm(r2)} ={' '}
          <b className="rk-mono">{formatOhm(active.totalR)}</b> — tak buduje się obciążenie 50 Ω z dwóch po 100 Ω.
        </p>
      ) : null}
    </div>
  );
}

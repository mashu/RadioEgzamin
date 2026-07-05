'use client';

import { useMemo, useState } from 'react';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import {
  calcResonanceHz,
  calcXc,
  calcXl,
  formatCapacitance,
  formatFreqHz,
  formatInductance,
  formatReactance,
} from '@/lib/lc/resonance';

export function InteractiveLcLab() {
  const [lMicroH, setLMicroH] = useState(2);
  const [cPf, setCPf] = useState(400);
  const [fKhz, setFKhz] = useState(3500);

  const lHenry = lMicroH * 1e-6;
  const cFarad = cPf * 1e-12;
  const fHz = fKhz * 1000;
  const f0Hz = calcResonanceHz(lHenry, cFarad);
  const xc = calcXc(fHz, cFarad);
  const xl = calcXl(fHz, lHenry);
  const atResonance = Math.abs(fHz - f0Hz) / f0Hz < 0.02;

  const chart = useMemo(() => {
    const w = 420;
    const h = 140;
    const padL = 44;
    const padR = 12;
    const padT = 20;
    const padB = 28;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const fMin = Math.max(f0Hz * 0.3, 100_000);
    const fMax = f0Hz * 1.7;
    const maxX = Math.max(calcXc(fMin, cFarad), calcXl(fMax, lHenry)) * 1.1;

    const toX = (f: number) => padL + ((f - fMin) / (fMax - fMin)) * plotW;
    const toY = (x: number) => padT + plotH - (Math.min(x, maxX) / maxX) * plotH;

    const xcPts: string[] = [];
    const xlPts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const f = fMin + (i / 80) * (fMax - fMin);
      xcPts.push(`${toX(f).toFixed(1)},${toY(calcXc(f, cFarad)).toFixed(1)}`);
      xlPts.push(`${toX(f).toFixed(1)},${toY(calcXl(f, lHenry)).toFixed(1)}`);
    }

    return { w, h, padL, padT, plotH, f0X: toX(f0Hz), curX: toX(fHz), xcPts, xlPts, fMin, fMax };
  }, [cFarad, f0Hz, fHz, lHenry]);

  return (
    <div className="rk-interactive rk-ohm-lab">
      <p className="rk-ohm-lead">
        Xc maleje z częstotliwością, XL rośnie. W punkcie przecięcia Xc = XL — to rezonans. Zmieniaj L, C i f, by
        zobaczyć, jak przesuwa się f₀.
      </p>
      <div className="rk-slider-row">
        <label className="rk-slider">
          <span>
            L <b className="rk-mono">{formatInductance(lMicroH * 1e-6)}</b>
          </span>
          <input type="range" min="0.5" max="10" step="0.5" value={lMicroH} onChange={(e) => setLMicroH(+e.target.value)} />
        </label>
        <label className="rk-slider">
          <span>
            C <b className="rk-mono">{formatCapacitance(cPf * 1e-12)}</b>
          </span>
          <input type="range" min="50" max="800" step="10" value={cPf} onChange={(e) => setCPf(+e.target.value)} />
        </label>
        <label className="rk-slider">
          <span>
            f pracy <b className="rk-mono">{formatFreqHz(fHz)}</b>
          </span>
          <input type="range" min="1000" max="10000" step="100" value={fKhz} onChange={(e) => setFKhz(+e.target.value)} />
        </label>
      </div>
      <svg viewBox={`0 0 ${chart.w} ${chart.h}`} role="img" aria-label="Wykres reaktancji Xc i XL" className="rk-circuit-svg">
        <line x1={chart.padL} y1={chart.padT + chart.plotH} x2={chart.w - 12} y2={chart.padT + chart.plotH} stroke={C.line} />
        <line x1={chart.padL} y1={chart.padT} x2={chart.padL} y2={chart.padT + chart.plotH} stroke={C.line} />
        <polyline points={chart.xcPts.join(' ')} fill="none" stroke={C.signal} strokeWidth="2.2" />
        <polyline points={chart.xlPts.join(' ')} fill="none" stroke={C.amber} strokeWidth="2.2" />
        <line x1={chart.f0X} y1={chart.padT} x2={chart.f0X} y2={chart.padT + chart.plotH} stroke={C.good} strokeDasharray="4 4" />
        <line x1={chart.curX} y1={chart.padT} x2={chart.curX} y2={chart.padT + chart.plotH} stroke={C.inkSoft} strokeDasharray="2 3" opacity="0.7" />
        <text x={chart.f0X} y={chart.padT - 4} textAnchor="middle" fontSize="10" fill={C.good}>
          f₀
        </text>
        <text x={chart.w - 14} y={chart.padT + 14} textAnchor="end" fontSize="10" fill={C.amber}>
          XL
        </text>
        <text x={chart.w - 14} y={chart.padT + 28} textAnchor="end" fontSize="10" fill={C.signal}>
          Xc
        </text>
      </svg>
      <div className="rk-ohm-readout rk-ohm-readout-wide">
        <span>
          f₀ <b className="rk-mono">{formatFreqHz(f0Hz)}</b>
        </span>
        <span>
          Xc <b className="rk-mono">{formatReactance(xc)}</b>
        </span>
        <span>
          XL <b className="rk-mono">{formatReactance(xl)}</b>
        </span>
        <span className={atResonance ? 'rk-resonance-ok' : ''}>
          {atResonance ? '✓ rezonans (Xc ≈ XL)' : 'poza rezonansem'}
        </span>
      </div>
      {atResonance ? (
        <p className="rk-ohm-hint">
          Przy f₀ = 1/(2π√(LC)) obwód ma najmniejsze straty i największą cyrkulację energii — tak stroimy obwody
          nadajnika i filtry.
        </p>
      ) : null}
    </div>
  );
}

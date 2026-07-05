'use client';

import { useState } from 'react';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { bandLabel, wavelengthMeters } from '@/lib/radio/wavelength';
import { Lbl, Path, SchematicFigure } from '@/components/schematic/SchematicParts';

export function InteractiveWavelength() {
  const [freqMhz, setFreqMhz] = useState(14);
  const wavelength = wavelengthMeters(freqMhz);
  const halfWave = wavelength / 2;
  const quarterWave = wavelength / 4;

  const w = 460;
  const h = 168;
  const axisY = 88;
  const amp = 32;
  const x0 = 48;
  const plotW = 364;
  const cycles = 1.5;
  const pxPerCycle = plotW / cycles;

  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = x0 + (i / 240) * plotW;
    const phase = (i / 240) * cycles * 2 * Math.PI;
    pts.push(`${x.toFixed(1)},${(axisY - amp * Math.sin(phase)).toFixed(1)}`);
  }

  const lambdaEnd = x0 + pxPerCycle;
  const quarterX = x0 + pxPerCycle / 4;
  const halfX = x0 + pxPerCycle / 2;

  return (
    <div className="rk-interactive rk-ohm-lab">
      <p className="rk-ohm-lead">
        W próżni c = λ·f. Skrót na egzamin: λ[m] = 300 / f[MHz]. Przesuń częstotliwość i zobacz, jak zmienia się
        długość fali oraz wymiary anteny.
      </p>
      <label className="rk-slider">
        <span>
          f = <b className="rk-mono">{freqMhz.toFixed(1)} MHz</b> → λ ={' '}
          <b className="rk-mono">{wavelength.toFixed(1)} m</b> ({bandLabel(freqMhz)})
        </span>
        <input type="range" min="1.8" max="430" step="0.2" value={freqMhz} onChange={(e) => setFreqMhz(+e.target.value)} />
      </label>
      <SchematicFigure
        width={w}
        height={h}
        ariaLabel="Sinusoida i długość fali"
        caption="Jedna pełna fala λ — dipol ≈ λ/2, GP ćwierćfalowa ≈ λ/4."
      >
        <Path d={`M ${x0} ${axisY} H ${x0 + plotW}`} />
        <polyline points={pts.join(' ')} fill="none" stroke={C.ink} strokeWidth="2" />
        <line x1={x0} y1={axisY - amp - 18} x2={lambdaEnd} y2={axisY - amp - 18} stroke={C.signal} strokeWidth="1.5" />
        <line x1={x0} y1={axisY - amp - 22} x2={x0} y2={axisY - amp - 14} stroke={C.signal} />
        <line x1={lambdaEnd} y1={axisY - amp - 22} x2={lambdaEnd} y2={axisY - amp - 14} stroke={C.signal} />
        <Lbl x={(x0 + lambdaEnd) / 2} y={axisY - amp - 26} color={C.signal}>{`λ = ${wavelength.toFixed(1)} m`}</Lbl>
        <line x1={quarterX} y1={axisY + 10} x2={quarterX} y2={axisY + 22} stroke={C.amber} strokeWidth="1.2" />
        <Lbl x={quarterX} y={axisY + 34} color={C.amber} size={10}>{`λ/4 = ${quarterWave.toFixed(1)} m`}</Lbl>
        <line x1={halfX} y1={axisY + 10} x2={halfX} y2={axisY + 22} stroke={C.amber} strokeWidth="1.2" />
        <Lbl x={halfX} y={axisY + 34} color={C.amber} size={10}>{`λ/2 = ${halfWave.toFixed(1)} m`}</Lbl>
      </SchematicFigure>
      <div className="rk-ohm-readout rk-ohm-readout-wide">
        <span>
          Dipol <b className="rk-mono">{halfWave.toFixed(1)} m</b>
        </span>
        <span>
          GP ćwierćfalowa <b className="rk-mono">{quarterWave.toFixed(1)} m</b>
        </span>
        <span>
          Wzór <b className="rk-mono">300 / {freqMhz.toFixed(1)} ≈ {wavelength.toFixed(1)} m</b>
        </span>
      </div>
    </div>
  );
}

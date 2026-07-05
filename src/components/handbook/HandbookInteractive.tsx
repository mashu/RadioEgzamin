'use client';

import { useState } from 'react';
import { BetaChart } from '@/components/charts/BetaChart';
import { renderChart } from '@/components/charts/ChartRenderer';
import { PRIOR_A, PRIOR_B } from '@/lib/adaptive/constants';
import { betaMeanSd } from '@/lib/adaptive/math';

export function InteractiveSine() {
  const [amp, setAmp] = useState(1);

  return (
    <div className="rk-interactive">
      {renderChart('sine', { amp })}
      <label className="rk-slider">
        <span>
          Amplituda: <b className="rk-mono">{(amp * 100).toFixed(0)} V</b> → wartość skuteczna{' '}
          <b className="rk-mono">{((amp * 100) / Math.SQRT2).toFixed(1)} V</b>
        </span>
        <input type="range" min="0.2" max="1" step="0.01" value={amp} onChange={(e) => setAmp(+e.target.value)} />
      </label>
    </div>
  );
}

export function InteractiveBeta() {
  const [s, setS] = useState(3);
  const [f, setF] = useState(1);
  const a = PRIOR_A + s;
  const b = PRIOR_B + f;
  const { m, sd } = betaMeanSd(a, b);

  return (
    <div className="rk-interactive">
      <BetaChart a={a} b={b} label={`Beta(α=${a}, β=${b}) — średnia ${m.toFixed(2)}, niepewność ±${sd.toFixed(2)}`} />
      <div className="rk-slider-row">
        <label className="rk-slider">
          <span>
            Trafienia (α−1): <b className="rk-mono">{s}</b>
          </span>
          <input type="range" min="0" max="20" step="1" value={s} onChange={(e) => setS(+e.target.value)} />
        </label>
        <label className="rk-slider">
          <span>
            Pomyłki (β−1): <b className="rk-mono">{f}</b>
          </span>
          <input type="range" min="0" max="20" step="1" value={f} onChange={(e) => setF(+e.target.value)} />
        </label>
      </div>
      <p className="rk-inksoft rk-tiny">
        Więcej danych → węższy (pewniejszy) rozkład. Przewaga pomyłek przesuwa średnią w lewo, więc pytanie
        losowane jest częściej.
      </p>
    </div>
  );
}

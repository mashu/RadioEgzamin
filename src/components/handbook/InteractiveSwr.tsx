'use client';

import { useState } from 'react';

function calcSwR(zLoad: number, z0 = 50): number {
  const gamma = Math.abs((zLoad - z0) / (zLoad + z0));
  if (gamma >= 1) return Infinity;
  return (1 + gamma) / (1 - gamma);
}

export function InteractiveSwr() {
  const [zLoad, setZLoad] = useState(50);
  const swr = calcSwR(zLoad);
  const matched = Math.abs(zLoad - 50) < 3;

  return (
    <div className="rk-interactive rk-ohm-lab">
      <p className="rk-ohm-lead">
        Kabel ma oporność falową 50 Ω. Gdy antena ma inną impedancję, powstaje fala stojąca — SWR rośnie. Dopasuj
        obciążenie suwakiem.
      </p>
      <label className="rk-slider">
        <span>
          Impedancja anteny Z<sub>L</sub> = <b className="rk-mono">{zLoad} Ω</b> → SWR ={' '}
          <b className="rk-mono">{Number.isFinite(swr) ? swr.toFixed(2) : '∞'}</b>
        </span>
        <input type="range" min="10" max="200" step="1" value={zLoad} onChange={(e) => setZLoad(+e.target.value)} />
      </label>
      <div className={`rk-swr-badge ${matched ? 'is-ok' : swr > 2 ? 'is-bad' : 'is-warn'}`}>
        {matched
          ? 'Dopasowanie OK — SWR ≈ 1, minimalne straty w kablu.'
          : swr > 2
            ? 'SWR wysoki — sprawdź długość kabla, antenę i connector; nadajnik może się wyłączyć.'
            : 'Lekkie niedopasowanie — często akceptowalne, ale warto dostroić antenę.'}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { renderChart } from '@/components/charts/ChartRenderer';

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

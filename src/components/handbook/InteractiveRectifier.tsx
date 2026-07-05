'use client';

import { useState } from 'react';
import { renderChart } from '@/components/charts/ChartRenderer';

type RectType = 'half' | 'full' | 'bridge';

const RECT_INFO: Record<RectType, { readonly label: string; readonly desc: string }> = {
  half: {
    label: 'Jednopołówkowy',
    desc: '1 dioda — przepuszcza tylko dodatnie połówki. Na wyjściu widać przerwy; wymaga dużego filtra.',
  },
  full: {
    label: 'Dwupołówkowy',
    desc: 'Odczep + 2 diody — prostuje obie połówki na przemian. Garby bez przerw, łatwiej wygładzić.',
  },
  bridge: {
    label: 'Mostkowy',
    desc: '4 diody — pełne prostowanie bez transformatora odczepowego. Standard w zasilaczach.',
  },
};

export function InteractiveRectifier() {
  const [type, setType] = useState<RectType>('half');
  const info = RECT_INFO[type];

  return (
    <div className="rk-interactive rk-ohm-lab">
      <div className="rk-ohm-mode-btns" role="tablist" aria-label="Typ prostownika">
        {(Object.keys(RECT_INFO) as RectType[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={type === key}
            className={`rk-ohm-mode-btn ${type === key ? 'is-active' : ''}`}
            onClick={() => setType(key)}
          >
            {RECT_INFO[key].label}
          </button>
        ))}
      </div>
      <p className="rk-ohm-lead">{info.desc}</p>
      <div className="rk-chartrow rk-chartrow-single">
        {renderChart(type === 'half' ? 'circuit-rect-half' : type === 'full' ? 'circuit-rect-full' : 'circuit-rect-bridge')}
      </div>
      <p className="rk-ohm-hint rk-mono rk-ohm-caption">schemat obwodu · przebieg napięcia</p>
      <div className="rk-chartrow rk-chartrow-single">
        {renderChart(type === 'half' ? 'rect-half' : type === 'full' ? 'rect-full' : 'rect-bridge')}
      </div>
      <p className="rk-ohm-hint">
        Po prostowniku kondensator filtrujący ładuje się do wartości szczytowej: U<sub>dc</sub> ≈ Û = U<sub>sk</sub>·√2.
        Diody dobieraj z zapasem na napięcie wsteczne.
      </p>
    </div>
  );
}

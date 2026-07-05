import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

export function BandwidthChart() {
  const data = [
    { k: 'CW', v: 0.25, c: C.signal },
    { k: 'SSB', v: 3, c: C.signal },
    { k: 'AM', v: 9, c: C.amber },
    { k: 'FM (UKF)', v: 12.5, c: C.amber },
  ] as const;
  const w = 460;
  const h = 200;
  const xL = 90;
  const xR = w - 20;
  const top = 16;
  const bh = 30;
  const gap = 14;
  const max = 13;

  return (
    <ChartFrame title="Typowe szerokości kanału (kHz) — im mniej, tym większa gęstość mocy" h={h}>
      {data.map((d, i) => {
        const y = top + i * (bh + gap);
        const bw = ((xR - xL) * d.v) / max;
        return (
          <g key={d.k}>
            <text x={xL - 8} y={y + bh / 2 + 4} textAnchor="end" fontSize="12" fill={C.ink}>
              {d.k}
            </text>
            <rect x={xL} y={y} width={Math.max(bw, 2)} height={bh} rx="3" fill={d.c} opacity="0.85" />
            <text x={xL + Math.max(bw, 2) + 6} y={y + bh / 2 + 4} fontSize="11" fill={C.inkSoft}>
              {d.v} kHz
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

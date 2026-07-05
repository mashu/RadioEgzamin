import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { betaMeanSd, betaPdf } from '@/lib/adaptive/math';

type BetaChartProps = {
  readonly a: number;
  readonly b: number;
  readonly height?: number;
  readonly label?: string;
};

export function BetaChart({ a, b, height = 200, label }: BetaChartProps) {
  const w = 460;
  const h = height;
  const xL = 36;
  const xR = w - 12;
  const yB = h - 26;
  const yT = 14;
  const N = 120;
  let max = 0;
  const ys: number[] = [];

  for (let i = 0; i <= N; i++) {
    const x = (i + 0.5) / (N + 1);
    const p = betaPdf(x, a, b);
    ys.push(p);
    if (p > max) max = p;
  }
  max = max || 1;

  const pts = ys.map((p, i) => {
    const x = xL + (i / N) * (xR - xL);
    const y = yB - (p / max) * (yB - yT);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const { m } = betaMeanSd(a, b);
  const mx = xL + m * (xR - xL);

  return (
    <ChartFrame title={label ?? `Beta(α=${a.toFixed(1)}, β=${b.toFixed(1)}) — rozkład biegłości`} h={h}>
      <line x1={xL} y1={yB} x2={xR} y2={yB} stroke={C.line} />
      {[0, 0.5, 1].map((t) => {
        const x = xL + t * (xR - xL);
        return (
          <g key={t}>
            <line x1={x} y1={yB} x2={x} y2={yB + 4} stroke={C.inkSoft} />
            <text x={x} y={yB + 18} textAnchor="middle" fontSize="10" fill={C.inkSoft}>
              {t}
            </text>
          </g>
        );
      })}
      <polyline points={`${xL},${yB} ${pts.join(' ')} ${xR},${yB}`} fill={C.signal} opacity="0.14" stroke="none" />
      <polyline points={pts.join(' ')} fill="none" stroke={C.signal} strokeWidth="2.4" />
      <line x1={mx} y1={yT} x2={mx} y2={yB} stroke={C.amber} strokeDasharray="4 3" />
      <text x={mx} y={yT - 2} textAnchor="middle" fontSize="10" fill={C.amber}>
        średnia {m.toFixed(2)}
      </text>
    </ChartFrame>
  );
}

import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

export function WaveChart() {
  const w = 460;
  const h = 190;
  const mid = 96;
  const xL = 12;
  const xR = w - 12;
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const x = xL + (i / 240) * (xR - xL);
    const y = mid - 54 * Math.sin((i / 240) * 6 * Math.PI);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const lam = (xR - xL) / 3;

  return (
    <ChartFrame title="c = λ·f  →  f[MHz] = 300 / λ[m]. Krótsza fala = wyższa częstotliwość." h={h}>
      <line x1={xL} y1={mid} x2={xR} y2={mid} stroke={C.line} />
      <polyline points={pts.join(' ')} fill="none" stroke={C.signal} strokeWidth="2.2" />
      <line x1={xL} y1={h - 20} x2={xL + lam} y2={h - 20} stroke={C.amber} strokeWidth="2" />
      <text x={xL + lam / 2} y={h - 6} textAnchor="middle" fontSize="12" fill={C.amber}>
        λ
      </text>
    </ChartFrame>
  );
}

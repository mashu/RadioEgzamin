import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

type SineChartProps = {
  readonly amp?: number;
};

export function SineChart({ amp = 1 }: SineChartProps) {
  const w = 460;
  const h = 200;
  const mid = h / 2;
  const xL = 40;
  const xR = w - 12;
  const A = (h / 2 - 24) * amp;
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const x = xL + (i / 200) * (xR - xL);
    const y = mid - A * Math.sin((i / 200) * 4 * Math.PI);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const rms = A / Math.SQRT2;

  return (
    <ChartFrame
      title="Sinus: amplituda (szczyt), wartość skuteczna (≈0,707·szczyt) i międzyszczytowa"
      h={h}
    >
      <line x1={xL} y1={mid} x2={xR} y2={mid} stroke={C.line} />
      <line x1={xL} y1={24} x2={xL} y2={h - 16} stroke={C.line} />
      {A > 4 ? (
        <>
          <line x1={xL} y1={mid - A} x2={xR} y2={mid - A} stroke={C.amber} strokeDasharray="4 4" opacity="0.7" />
          <line x1={xL} y1={mid - rms} x2={xR} y2={mid - rms} stroke={C.signal} strokeDasharray="6 3" opacity="0.8" />
          <text x={xR - 6} y={mid - A - 5} textAnchor="end" fontSize="11" fill={C.amber}>
            szczyt Û
          </text>
          <text x={xR - 6} y={mid - rms - 5} textAnchor="end" fontSize="11" fill={C.signal}>
            U_sk = Û/√2
          </text>
        </>
      ) : null}
      <polyline points={pts.join(' ')} fill="none" stroke={C.ink} strokeWidth="2.2" />
    </ChartFrame>
  );
}

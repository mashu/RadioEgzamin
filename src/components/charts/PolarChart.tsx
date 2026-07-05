import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

type PolarType = 'dipole' | 'vertical' | 'yagi';

type PolarChartProps = {
  readonly type: PolarType;
};

export function PolarChart({ type }: PolarChartProps) {
  const w = 320;
  const h = 260;
  const cx = 160;
  const cy = 120;
  const R = 92;
  const pts: string[] = [];

  for (let a = 0; a <= 360; a += 2) {
    const t = (a * Math.PI) / 180;
    let g: number;
    if (type === 'dipole') g = Math.abs(Math.cos(t));
    else if (type === 'vertical') g = 1;
    else g = 0.5 * (1 + Math.cos(t));
    const ang = type === 'dipole' ? t - Math.PI / 2 : t;
    const rr = R * g;
    pts.push(`${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`);
  }

  const title =
    type === 'dipole'
      ? 'Dipol poziomy — ósemka'
      : type === 'vertical'
        ? 'Pionowa — dookólna'
        : 'Yagi — kierunkowa';

  return (
    <ChartFrame title={title} w={w} h={h}>
      {[0.5, 1].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={R * r} fill="none" stroke={C.line} />
      ))}
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={C.line} />
      <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={C.line} />
      <polygon points={pts.join(' ')} fill={C.signal} opacity="0.16" stroke={C.signal} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill={C.amber} />
    </ChartFrame>
  );
}

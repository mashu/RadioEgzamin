import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

type RectifierType = 'half' | 'full' | 'bridge';

type RectifierChartProps = {
  readonly type: RectifierType;
};

export function RectifierChart({ type }: RectifierChartProps) {
  const w = 460;
  const h = 190;
  const mid = 110;
  const xL = 40;
  const xR = w - 12;
  const inPts: string[] = [];
  const outPts: string[] = [];

  for (let i = 0; i <= 240; i++) {
    const x = xL + (i / 240) * (xR - xL);
    const s = Math.sin((i / 240) * 4 * Math.PI);
    inPts.push(`${x.toFixed(1)},${(mid - 56 * s).toFixed(1)}`);
    const o = type === 'half' ? Math.max(0, s) : Math.abs(s);
    outPts.push(`${x.toFixed(1)},${(mid - 56 * o).toFixed(1)}`);
  }

  const label =
    type === 'half'
      ? 'Jednopołówkowy: tylko dodatnie połówki, przerwy między garbami'
      : type === 'full'
        ? 'Dwupołówkowy (odczep): obie połówki, garby bez przerw'
        : 'Mostkowy (4 diody): obie połówki, garby bez przerw';

  return (
    <ChartFrame title={label} h={h}>
      <line x1={xL} y1={mid} x2={xR} y2={mid} stroke={C.line} />
      <polyline points={inPts.join(' ')} fill="none" stroke={C.signalSoft} strokeWidth="1.6" strokeDasharray="4 4" />
      <polyline points={outPts.join(' ')} fill="none" stroke={C.ink} strokeWidth="2.4" />
      <text x={xR - 4} y={mid + 44} textAnchor="end" fontSize="11" fill={C.inkSoft}>
        — wejście · · wyjście
      </text>
    </ChartFrame>
  );
}

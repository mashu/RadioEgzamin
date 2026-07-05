import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

export type MasteryBarItem = {
  readonly id: string;
  readonly label: string;
  readonly m: number;
  readonly sd: number;
};

type MasteryBarsProps = {
  readonly items: readonly MasteryBarItem[];
};

export function MasteryBars({ items }: MasteryBarsProps) {
  const w = 460;
  const xL = 150;
  const xR = w - 46;
  const bh = 20;
  const gap = 12;
  const top = 8;
  const h = top + items.length * (bh + gap);

  return (
    <ChartFrame w={w} h={h}>
      {items.map((it, i) => {
        const y = top + i * (bh + gap);
        const x0 = xL;
        const wtot = xR - xL;
        const mx = x0 + it.m * wtot;
        const lo = Math.max(0, it.m - it.sd);
        const hi = Math.min(1, it.m + it.sd);
        const col = it.m > 0.66 ? C.good : it.m < 0.4 ? C.bad : C.amber;
        return (
          <g key={it.id}>
            <text x={xL - 8} y={y + bh / 2 + 4} textAnchor="end" fontSize="11" fill={C.ink}>
              {it.label}
            </text>
            <rect x={x0} y={y + bh / 2 - 3} width={wtot} height="6" rx="3" fill={C.panel} />
            <rect
              x={x0 + lo * wtot}
              y={y + bh / 2 - 4}
              width={(hi - lo) * wtot}
              height="8"
              rx="4"
              fill={col}
              opacity="0.28"
            />
            <rect x={x0} y={y + bh / 2 - 4} width={Math.max(it.m * wtot, 2)} height="8" rx="4" fill={col} opacity="0.85" />
            <circle cx={mx} cy={y + bh / 2} r="4" fill={col} />
            <text x={xR + 6} y={y + bh / 2 + 4} fontSize="10" fill={C.inkSoft} className="rk-mono">
              {Math.round(it.m * 100)}%
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

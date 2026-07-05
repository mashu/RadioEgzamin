import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

export type WeightBarItem = {
  readonly id: string;
  readonly label: string;
  readonly wt: number;
};

type WeightBarsProps = {
  readonly items: readonly WeightBarItem[];
};

export function WeightBars({ items }: WeightBarsProps) {
  const w = 460;
  const xL = 150;
  const xR = w - 46;
  const bh = 16;
  const gap = 9;
  const top = 6;
  const h = top + items.length * (bh + gap);
  const max = Math.max(...items.map((i) => i.wt), 0.001);

  return (
    <ChartFrame title="Priorytet losowania tematów (E[Dirichlet]) — trudniejsze losowane częściej" w={w} h={h}>
      {items.map((it, i) => {
        const y = top + i * (bh + gap);
        const bw = ((xR - xL) * it.wt) / max;
        return (
          <g key={it.id}>
            <text x={xL - 8} y={y + bh / 2 + 4} textAnchor="end" fontSize="11" fill={C.ink}>
              {it.label}
            </text>
            <rect x={xL} y={y} width={Math.max(bw, 2)} height={bh} rx="3" fill={C.signal} opacity="0.8" />
            <text x={xL + Math.max(bw, 2) + 6} y={y + bh / 2 + 4} fontSize="10" fill={C.inkSoft} className="rk-mono">
              {Math.round(it.wt * 100)}%
            </text>
          </g>
        );
      })}
    </ChartFrame>
  );
}

import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';

const ELEMENTS = [
  { num: 1, label: 'reflektor', len: 88 },
  { num: 2, label: 'wibrator', len: 72 },
  { num: 3, label: 'I direktor', len: 64 },
  { num: 4, label: 'II direktor', len: 56 },
] as const;

type YagiElementsChartProps = {
  readonly large?: boolean;
};

export function YagiElementsChart({ large }: YagiElementsChartProps) {
  const w = large ? 560 : 480;
  const h = large ? 240 : 200;
  const boomY = 100;
  const gap = 32;
  const totalLen = ELEMENTS.reduce((s, e) => s + e.len, 0) + gap * (ELEMENTS.length - 1);
  let x = (w - totalLen) / 2;

  return (
    <ChartFrame title="Antena Yagi-Uda — numeracja elementów" w={w} h={h} {...(large ? { large: true } : {})}>
      <line x1={32} y1={boomY} x2={w - 32} y2={boomY} stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <polygon points={`${36},${boomY} ${26},${boomY - 5} ${26},${boomY + 5}`} fill={C.amber} />
      <text x={24} y={boomY - 14} textAnchor="end" fontSize="11" fill={C.amber}>
        kierunek
      </text>

      {ELEMENTS.map((el) => {
        const cx = x + el.len / 2;
        const top = boomY - el.len / 2;
        const node = (
          <g key={el.num}>
            <line x1={cx} y1={top} x2={cx} y2={top + el.len} stroke={C.signal} strokeWidth="3" strokeLinecap="round" />
            <circle cx={cx} cy={boomY} r={large ? 16 : 14} fill="#fff" stroke={C.signal} strokeWidth="2.5" />
            <text
              x={cx}
              y={boomY + (large ? 6 : 5)}
              textAnchor="middle"
              fontSize={large ? 16 : 14}
              fontWeight="700"
              fill={C.signal}
            >
              {el.num}
            </text>
            <text x={cx} y={top + el.len + 22} textAnchor="middle" fontSize="11" fill={C.inkSoft}>
              {el.label}
            </text>
          </g>
        );
        x += el.len + gap;
        return node;
      })}
    </ChartFrame>
  );
}

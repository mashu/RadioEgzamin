import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { Lbl } from '@/components/schematic/SchematicParts';

const ELEMENTS = [
  { num: 1, label: 'reflektor', len: 72 },
  { num: 2, label: 'wibrator', len: 58 },
  { num: 3, label: 'I dir.', len: 50 },
  { num: 4, label: 'II dir.', len: 44 },
] as const;

export function YagiElementsChart() {
  const w = 460;
  const h = 200;
  const boomY = 88;
  let x = 48;

  return (
    <ChartFrame title="Antena Yagi-Uda — numeracja elementów" w={w} h={h}>
      <line x1={32} y1={boomY} x2={w - 24} y2={boomY} stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <polygon points="32,88 22,84 22,92" fill={C.amber} />
      <Lbl x={28} y={boomY - 14} anchor="end" size={9} color={C.amber}>
        kierunek
      </Lbl>

      {ELEMENTS.map((el) => {
        const cx = x + el.len / 2;
        const top = boomY - el.len / 2;
        const node = (
          <g key={el.num}>
            <line x1={cx} y1={top} x2={cx} y2={top + el.len} stroke={C.signal} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={boomY} r="12" fill="#fff" stroke={C.signal} strokeWidth="2" />
            <text x={cx} y={boomY + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.signal}>
              {el.num}
            </text>
            <Lbl x={cx} y={top + el.len + 18} size={10} color={C.inkSoft}>
              {el.label}
            </Lbl>
          </g>
        );
        x += el.len + 24;
        return node;
      })}

      <Lbl x={w / 2} y={h - 10} size={10} color={C.inkSoft}>
        1 = reflektor · 2 = wibrator · 3,4 = direktory
      </Lbl>
    </ChartFrame>
  );
}

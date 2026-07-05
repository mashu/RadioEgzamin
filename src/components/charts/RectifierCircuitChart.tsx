import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { Lbl, Path } from '@/components/schematic/SchematicParts';

type RectifierCircuitType = 'half' | 'full' | 'bridge';

type RectifierCircuitChartProps = {
  readonly type: RectifierCircuitType;
};

function Diode({ x, y, flip }: { readonly x: number; readonly y: number; readonly flip?: boolean }) {
  const dir = flip ? -1 : 1;
  return (
    <g>
      <Path d={`M ${x - 14 * dir} ${y} H ${x - 4 * dir}`} />
      <polygon
        points={`${x},${y} ${x - 8 * dir},${y - 7} ${x - 8 * dir},${y + 7}`}
        fill="#fff"
        stroke={C.ink}
        strokeWidth="2"
      />
      <line x1={x + 2 * dir} y1={y - 9} x2={x + 2 * dir} y2={y + 9} stroke={C.ink} strokeWidth="2" />
      <Path d={`M ${x + 2 * dir} ${y} H ${x + 14 * dir}`} />
    </g>
  );
}

function TrafoSecondary({ x, y, h, centerTap }: { readonly x: number; readonly y: number; readonly h: number; readonly centerTap?: boolean }) {
  return (
    <g>
      <ellipse cx={x - 10} cy={y + h / 2} rx="8" ry="14" fill="none" stroke={C.ink} strokeWidth="1.8" />
      <ellipse cx={x + 10} cy={y + h / 2} rx="8" ry="14" fill="none" stroke={C.ink} strokeWidth="1.8" />
      <Path d={`M ${x - 10} ${y} V ${y + h}`} />
      <Path d={`M ${x + 10} ${y} V ${y + h}`} />
      {centerTap ? (
        <>
          <Path d={`M ${x} ${y + h / 2} H ${x + 28}`} />
          <circle cx={x} cy={y + h / 2} r="3" fill={C.ink} />
          <Lbl x={x - 4} y={y + h / 2 - 10} anchor="end" size={9}>
            CT
          </Lbl>
        </>
      ) : null}
    </g>
  );
}

function LoadBranch({ x, y, w }: { readonly x: number; readonly y: number; readonly w: number }) {
  return (
    <g>
      <Path d={`M ${x} ${y} H ${x + w}`} />
      <rect x={x + w} y={y - 10} width="36" height="20" rx="2" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <Lbl x={x + w + 18} y={y + 28} size={10}>
        R_L
      </Lbl>
      <Path d={`M ${x + w + 36} ${y} H ${x + w + 56}`} />
    </g>
  );
}

export function RectifierCircuitChart({ type }: RectifierCircuitChartProps) {
  const w = 460;
  const h = 200;
  const y = 90;

  const title =
    type === 'half'
      ? 'Prostownik jednopołówkowy — 1 dioda'
      : type === 'full'
        ? 'Prostownik dwupołówkowy — odczep + 2 diody'
        : 'Prostownik mostkowy — 4 diody';

  return (
    <ChartFrame title={title} w={w} h={h}>
      <Lbl x={48} y={36} anchor="start" size={10} color={C.inkSoft}>
        ~ U
      </Lbl>
      <TrafoSecondary x={70} y={48} h={72} centerTap={type === 'full'} />

      {type === 'half' ? (
        <g>
          <Path d={`M ${80} ${48} H ${180}`} />
          <Diode x={200} y={y} />
          <LoadBranch x={214} y={y} w={40} />
          <Path d={`M ${310} ${y} V ${140}`} />
          <Path d={`M ${80} ${120} H ${310}`} />
        </g>
      ) : null}

      {type === 'full' ? (
        <g>
          <Path d={`M ${80} ${48} H ${160}`} />
          <Diode x={180} y={68} />
          <Path d={`M ${194} ${68} H ${280}`} />
          <Path d={`M ${98} ${120} H ${160}`} />
          <Diode x={180} y={112} flip />
          <Path d={`M ${194} ${112} H ${280}`} />
          <LoadBranch x={280} y={90} w={20} />
          <Path d={`M ${336} ${90} V ${140}`} />
          <Path d={`M ${98} ${140} H ${336}`} />
        </g>
      ) : null}

      {type === 'bridge' ? (
        <g>
          <Path d={`M ${80} ${48} H ${150}`} />
          <Path d={`M ${80} ${120} H ${150}`} />
          <Path d={`M ${150} ${48} V ${68}`} />
          <Diode x={168} y={68} />
          <Path d={`M ${182} ${68} H ${220}`} />
          <Diode x={168} y={112} flip />
          <Path d={`M ${150} ${112} V ${120}`} />
          <Path d={`M ${220} ${68} V ${112}`} />
          <Diode x={238} y={68} flip />
          <Diode x={238} y={112} />
          <LoadBranch x={252} y={90} w={16} />
          <Path d={`M ${304} ${90} V ${140}`} />
          <Path d={`M ${150} ${140} H ${304}`} />
        </g>
      ) : null}

      <Lbl x={w / 2} y={h - 8} size={10} color={C.inkSoft}>
        + wyjście · − masa
      </Lbl>
    </ChartFrame>
  );
}

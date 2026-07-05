import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import {
  DiodeH,
  DiodeV,
  GroundRail,
  Junction,
  ResistorH,
  TrafoSecondary,
  WireH,
  WireV,
  trafoTerminals,
} from '@/lib/schematic/examSymbols';

type RectifierCircuitType = 'half' | 'full' | 'bridge';

type RectifierCircuitChartProps = {
  readonly type: RectifierCircuitType;
  readonly large?: boolean;
};

export function RectifierCircuitChart({ type, large }: RectifierCircuitChartProps) {
  const w = large ? 580 : 500;
  const h = large ? 260 : 220;

  const title =
    type === 'half'
      ? 'Prostownik jednopołówkowy — 1 dioda'
      : type === 'full'
        ? 'Prostownik dwupołówkowy — odczep + 2 diody'
        : 'Prostownik mostkowy — 4 diody';

  const trX = 72;
  const yTop = 64;
  const yBot = 152;
  const yMid = 108;
  const gndY = 188;
  const t = trafoTerminals(trX, yTop, yBot);

  return (
    <ChartFrame title={title} w={w} h={h} {...(large ? { large: true } : {})}>
      <TrafoSecondary x={trX} yTop={yTop} yBot={yBot} centerTap={type === 'full'} />

      {type === 'half' ? (
        <g>
          <GroundRail x1={t.termX} x2={300} y={gndY} />

          <WireH x1={t.termX} x2={128} y={t.top} />
          <Junction x={t.termX} y={t.top} />
          <DiodeH x1={128} x2={176} y={t.top} />
          <ResistorH x1={176} x2={300} y={t.top} label="R_L" />
          <Junction x={300} y={t.top} />
          <WireV x={300} y1={t.top} y2={gndY} />
          <Junction x={300} y={gndY} />

          <WireV x={t.termX} y1={t.bot} y2={gndY} />
          <Junction x={t.termX} y={t.bot} />
          <Junction x={t.termX} y={gndY} />

          <text x={308} y={t.top + 4} fontSize="11" fill={C.good}>
            +
          </text>
        </g>
      ) : null}

      {type === 'full' ? (
        <g>
          <GroundRail x1={t.termX} x2={400} y={gndY} />

          <WireH x1={t.termX} x2={128} y={t.top} />
          <Junction x={t.termX} y={t.top} />
          <DiodeH x1={128} x2={176} y={t.top} />
          <WireH x1={176} x2={300} y={t.top} />
          <WireH x1={t.termX} x2={128} y={t.bot} />
          <Junction x={t.termX} y={t.bot} />
          <DiodeH x1={128} x2={176} y={t.bot} reverse />
          <WireH x1={176} x2={300} y={t.bot} />
          <WireV x={300} y1={t.top} y2={t.bot} />
          <Junction x={300} y={t.top} />
          <Junction x={300} y={t.bot} />

          <WireH x1={300} x2={340} y={yMid} />
          <ResistorH x1={340} x2={400} y={yMid} label="R_L" />
          <Junction x={340} y={yMid} />
          <WireV x={400} y1={yMid} y2={gndY} />
          <Junction x={400} y={gndY} />

          <WireV x={t.termX} y1={t.mid} y2={gndY} />
          <Junction x={t.termX} y={t.mid} />
          <Junction x={t.termX} y={gndY} />

          <text x={408} y={yMid + 4} fontSize="11" fill={C.good}>
            +
          </text>
        </g>
      ) : null}

      {type === 'bridge' ? (
        <g>
          <GroundRail x1={148} x2={380} y={gndY} />

          <WireH x1={t.termX} x2={148} y={t.top} />
          <WireH x1={t.termX} x2={148} y={t.bot} />
          <Junction x={t.termX} y={t.top} />
          <Junction x={t.termX} y={t.bot} />
          <WireV x={148} y1={t.top} y2={t.bot} />
          <Junction x={148} y={t.top} />
          <Junction x={148} y={t.bot} />

          <DiodeH x1={148} x2={212} y={t.top} />
          <DiodeH x1={148} x2={212} y={t.bot} reverse />
          <WireV x={212} y1={t.top} y2={t.bot} />
          <Junction x={212} y={t.top} />
          <Junction x={212} y={t.bot} />

          <DiodeV x={212} y1={t.top} y2={yMid} />
          <DiodeV x={212} y1={t.bot} y2={yMid} reverse />
          <Junction x={212} y={yMid} />

          <WireH x1={212} x2={272} y={yMid} />
          <ResistorH x1={272} x2={380} y={yMid} label="R_L" />
          <Junction x={380} y={yMid} />
          <WireV x={380} y1={yMid} y2={gndY} />
          <Junction x={380} y={gndY} />

          <WireH x1={148} x2={380} y={gndY} />
          <Junction x={148} y={gndY} />

          <text x={388} y={yMid + 4} fontSize="11" fill={C.good}>
            +
          </text>
        </g>
      ) : null}
    </ChartFrame>
  );
}

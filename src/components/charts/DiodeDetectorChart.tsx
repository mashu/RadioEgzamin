import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import {
  CapacitorV,
  DiodeH,
  GroundRail,
  Junction,
  ResistorV,
  WireH,
} from '@/lib/schematic/examSymbols';

type DiodeDetectorChartProps = {
  readonly large?: boolean;
};

export function DiodeDetectorChart({ large }: DiodeDetectorChartProps) {
  const w = large ? 560 : 500;
  const h = large ? 240 : 210;
  const sigY = 88;
  const gndY = 178;
  const nodeX = 168;
  const capX = 248;
  const loadX = 348;

  return (
    <ChartFrame title="Detektor diodowy AM" w={w} h={h} {...(large ? { large: true } : {})}>
      <GroundRail x1={40} x2={loadX} y={gndY} />

      <text x={36} y={sigY + 4} textAnchor="end" fontSize="12" fontWeight="600" fill={C.inkSoft}>
        IF
      </text>
      <WireH x1={40} x2={100} y={sigY} />
      <DiodeH x1={100} x2={148} y={sigY} />
      <WireH x1={148} x2={nodeX} y={sigY} />
      <Junction x={nodeX} y={sigY} />

      <WireH x1={nodeX} x2={capX} y={sigY} />
      <Junction x={capX} y={sigY} />
      <CapacitorV x={capX} y1={sigY} y2={gndY} label="C1" />
      <Junction x={capX} y={gndY} />

      <WireH x1={nodeX} x2={loadX} y={sigY} />
      <Junction x={loadX} y={sigY} />
      <ResistorV x={loadX} y1={sigY} y2={gndY} label="R" labelSide="right" />
      <Junction x={loadX} y={gndY} />
    </ChartFrame>
  );
}

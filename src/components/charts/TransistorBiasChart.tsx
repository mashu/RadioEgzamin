import { ChartFrame } from '@/components/charts/ChartFrame';
import {
  CapacitorV,
  GroundRail,
  Junction,
  NpnTransistorSymbol,
  ResistorV,
  TransistorPinLabels,
  VccRail,
  WireH,
  WireV,
} from '@/lib/schematic/examSymbols';

type TransistorBiasChartProps = {
  readonly large?: boolean;
};

export function TransistorBiasChart({ large }: TransistorBiasChartProps) {
  const w = large ? 540 : 480;
  const h = large ? 300 : 260;
  const vccY = 32;
  const gndY = 248;
  const bx = 96;
  const tx = 276;
  const emitNodeY = 192;
  const capX = tx + 64;

  const { ports, symbol } = NpnTransistorSymbol({ cx: tx, cy: 118 });
  const baseY = ports.base.y;
  const reX = ports.emitter.x;

  return (
    <ChartFrame title="Wzmacniacz CE — polaryzacja R1, R2, bocznik C1" w={w} h={h} {...(large ? { large: true } : {})}>
      <GroundRail x1={bx} x2={capX} y={gndY} />

      <WireH x1={bx} x2={tx + 24} y={vccY} />
      <VccRail x={tx} y={vccY} />

      <ResistorV x={tx} y1={vccY + 4} y2={ports.collector.y} label="Rc" labelSide="right" />

      <ResistorV x={bx} y1={vccY + 4} y2={baseY - 4} label="R1" />
      <Junction x={bx} y={baseY} />
      <ResistorV x={bx} y1={baseY + 4} y2={gndY} label="R2" />
      <Junction x={bx} y={gndY} />

      {symbol}
      <TransistorPinLabels ports={ports} />
      <WireH x1={bx} x2={ports.base.x} y={baseY} />

      <WireV x={ports.emitter.x} y1={ports.emitter.y} y2={emitNodeY} />
      <WireH x1={ports.emitter.x} x2={capX} y={emitNodeY} />
      <Junction x={ports.emitter.x} y={emitNodeY} />
      <Junction x={capX} y={emitNodeY} />

      <ResistorV x={reX} y1={emitNodeY} y2={gndY} label="Re" labelSide="right" />
      <Junction x={reX} y={gndY} />

      <CapacitorV x={capX} y1={emitNodeY} y2={gndY} label="C1" accent />
      <Junction x={capX} y={gndY} />
    </ChartFrame>
  );
}

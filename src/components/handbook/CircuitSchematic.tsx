import { formatAmp, formatOhm, formatVolt } from '@/lib/ohm/circuit';
import { createLoop, createParallelLayout, placeResistor, placeSeriesPair } from '@/lib/schematic/engine';
import {
  BatteryNode,
  Branch,
  CurrentArrow,
  ParallelLadder,
  ResistorNode,
  SchematicFigure,
  Path,
  VerticalRail,
} from '@/components/schematic/SchematicParts';

const W = 460;

type SimpleCircuitProps = {
  readonly voltage: number;
  readonly resistance: number;
  readonly current: number;
};

export function SimpleCircuitDiagram({ voltage, resistance, current }: SimpleCircuitProps) {
  const H = 148;
  const loop = createLoop(W, H, { l: 72, r: 72, t: 40, b: 52 });
  const r = placeResistor(loop.cx, loop.top);

  return (
    <SchematicFigure width={W} height={H} ariaLabel="Obwód prosty">
      <VerticalRail x={loop.right} y1={loop.top} y2={loop.bottom} />
      <VerticalRail x={loop.left} y1={loop.bottom} y2={loop.top} />
      <Branch xStart={loop.left} xEnd={loop.right} geom={r} name="R" value={formatOhm(resistance)} />
      <CurrentArrow x={r.tRight + 36} y={loop.top} lines={[`I = ${formatAmp(current)}`]} />
      <BatteryNode loop={loop} label={formatVolt(voltage)} />
    </SchematicFigure>
  );
}

type SeriesCircuitProps = {
  readonly voltage: number;
  readonly r1: number;
  readonly r2: number;
  readonly v1: number;
  readonly v2: number;
  readonly current: number;
};

export function SeriesCircuitDiagram({ voltage, r1, r2, v1, v2, current }: SeriesCircuitProps) {
  const H = 168;
  const loop = createLoop(W, H, { l: 72, r: 72, t: 40, b: 52 });
  const { r1: g1, r2: g2 } = placeSeriesPair(loop, 32);

  return (
    <SchematicFigure
      width={W}
      height={H}
      ariaLabel="Obwód szeregowy"
      caption="Prąd w pętli jest jeden — opory i spadki napięć się dodają."
    >
      <VerticalRail x={loop.right} y1={loop.top} y2={loop.bottom} />
      <VerticalRail x={loop.left} y1={loop.bottom} y2={loop.top} />
      <Path d={`M ${loop.left} ${loop.top} H ${g1.tLeft}`} />
      <ResistorNode geom={g1} name="R₁" value={formatOhm(r1)} extra={`U₁ = ${formatVolt(v1)}`} />
      <Path d={`M ${g1.tRight} ${loop.top} H ${g2.tLeft}`} />
      <ResistorNode geom={g2} name="R₂" value={formatOhm(r2)} extra={`U₂ = ${formatVolt(v2)}`} />
      <Path d={`M ${g2.tRight} ${loop.top} H ${loop.right}`} />
      <CurrentArrow x={g2.tRight + 28} y={loop.top} lines={['I wspólny', formatAmp(current)]} />
      <BatteryNode loop={loop} label={formatVolt(voltage)} />
    </SchematicFigure>
  );
}

type ParallelCircuitProps = {
  readonly voltage: number;
  readonly r1: number;
  readonly r2: number;
  readonly i1: number;
  readonly i2: number;
};

export function ParallelCircuitDiagram({ voltage, r1, r2, i1, i2 }: ParallelCircuitProps) {
  const H = 210;
  const layout = createParallelLayout(W, H);

  return (
    <SchematicFigure
      width={W}
      height={H}
      ariaLabel="Obwód równoległy"
      caption="Wspólne napięcie U na gałęziach — prądy gałęzi się dodają."
    >
      <ParallelLadder
        layout={layout}
        r1Name="R₁"
        r1Value={formatOhm(r1)}
        r2Name="R₂"
        r2Value={formatOhm(r2)}
        i1Label={`I₁ = ${formatAmp(i1)}`}
        i2Label={`I₂ = ${formatAmp(i2)}`}
        voltageLabel={formatVolt(voltage)}
      />
    </SchematicFigure>
  );
}

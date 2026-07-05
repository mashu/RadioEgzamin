import type { ReactNode } from 'react';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { RESISTOR } from '@/lib/schematic/layout';
import type { LoopRect, ParallelLayout, ResistorGeom } from '@/lib/schematic/engine';

const SW = 2;
const R_H = RESISTOR.height;

export function SchematicFigure({
  width,
  height,
  ariaLabel,
  caption,
  children,
}: {
  readonly width: number;
  readonly height: number;
  readonly ariaLabel: string;
  readonly caption?: string;
  readonly children: ReactNode;
}) {
  return (
    <figure className="rk-schematic">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className="rk-circuit-svg">
        {children}
      </svg>
      {caption ? <figcaption className="rk-schematic-caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function Path({ d }: { readonly d: string }) {
  return <path d={d} fill="none" stroke={C.ink} strokeWidth={SW} strokeLinecap="butt" strokeLinejoin="miter" />;
}

export function Lbl({
  x,
  y,
  children,
  anchor = 'middle',
  color = C.ink,
  size = 11,
}: {
  readonly x: number;
  readonly y: number;
  readonly children: string;
  readonly anchor?: 'start' | 'middle' | 'end';
  readonly color?: string;
  readonly size?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={600} fill={color}>
      {children}
    </text>
  );
}

function drawResistorBody(geom: ResistorGeom) {
  const bodyY = geom.y - R_H / 2;
  return (
    <g>
      <Path d={`M ${geom.tLeft} ${geom.y} H ${geom.bodyLeft}`} />
      <rect x={geom.bodyLeft} y={bodyY} width={geom.bodyRight - geom.bodyLeft} height={R_H} rx="2" fill="#fff" stroke={C.ink} strokeWidth={SW} />
      <Path d={`M ${geom.bodyRight} ${geom.y} H ${geom.tRight}`} />
    </g>
  );
}

/** Etykiety opornika: nazwa nad symbolem, wartość w przedziale pod gałęzią (nie na przewodzie). */
function resistorLabels(geom: ResistorGeom, name: string, value: string) {
  const bodyY = geom.y - R_H / 2;
  return (
    <g>
      <Lbl x={geom.cx} y={bodyY - 10} color={C.ink}>
        {name}
      </Lbl>
      <Lbl x={geom.cx} y={bodyY + R_H + 18} color={C.inkSoft} size={10}>
        {value}
      </Lbl>
    </g>
  );
}

export function ResistorNode({
  geom,
  name,
  value,
  extra,
  extraColor = C.signal,
}: {
  readonly geom: ResistorGeom;
  readonly name: string;
  readonly value: string;
  readonly extra?: string;
  readonly extraColor?: string;
}) {
  const bodyY = geom.y - R_H / 2;
  return (
    <g>
      {drawResistorBody(geom)}
      <Lbl x={geom.cx} y={bodyY - 10} color={C.ink}>
        {name}
      </Lbl>
      {value ? (
        <Lbl x={geom.cx} y={bodyY + R_H + 18} color={C.inkSoft} size={10}>
          {value}
        </Lbl>
      ) : null}
      {extra ? (
        <Lbl x={geom.cx} y={bodyY + R_H + 32} color={extraColor} size={10}>
          {extra}
        </Lbl>
      ) : null}
    </g>
  );
}

export function Branch({
  xStart,
  xEnd,
  geom,
  name,
  value,
}: {
  readonly xStart: number;
  readonly xEnd: number;
  readonly geom: ResistorGeom;
  readonly name: string;
  readonly value: string;
}) {
  return (
    <g>
      <Path d={`M ${xStart} ${geom.y} H ${geom.tLeft}`} />
      {drawResistorBody(geom)}
      <Path d={`M ${geom.tRight} ${geom.y} H ${xEnd}`} />
      {resistorLabels(geom, name, value)}
    </g>
  );
}

/** Obwód równoległy — drabinka: szyny tylko między gałęziami, bateria na dole. */
export function ParallelLadder({
  layout,
  r1Name,
  r1Value,
  r2Name,
  r2Value,
  i1Label,
  i2Label,
  voltageLabel,
}: {
  readonly layout: ParallelLayout;
  readonly r1Name: string;
  readonly r1Value: string;
  readonly r2Name: string;
  readonly r2Value: string;
  readonly i1Label: string;
  readonly i2Label: string;
  readonly voltageLabel: string;
}) {
  const { left, right, cx, y1, y2, yBottom } = layout;
  const g1 = placeOnBranch(cx, y1);
  const g2 = placeOnBranch(cx, y2);
  const xBatL = cx - 9 - 14;
  const xBatR = cx + 9 + 14;

  return (
    <g>
      {/* szyny boczne: od baterii do górnej gałęzi (bez „wystających” odcinków) */}
      <Path d={`M ${left} ${yBottom} V ${y1}`} />
      <Path d={`M ${right} ${yBottom} V ${y1}`} />
      <Branch xStart={left} xEnd={right} geom={g1} name={r1Name} value={r1Value} />
      <Branch xStart={left} xEnd={right} geom={g2} name={r2Name} value={r2Value} />
      <Lbl x={left - 12} y={y1 + 4} anchor="end" color={C.amber} size={10}>
        {i1Label}
      </Lbl>
      <Lbl x={left - 12} y={y2 + 4} anchor="end" color={C.amber} size={10}>
        {i2Label}
      </Lbl>
      {/* dolna magistrala z baterią */}
      <Path d={`M ${left} ${yBottom} H ${xBatL}`} />
      <line x1={cx - 9} y1={yBottom - 8} x2={cx - 9} y2={yBottom + 8} stroke={C.ink} strokeWidth={2.5} />
      <line x1={cx + 9} y1={yBottom - 5} x2={cx + 9} y2={yBottom + 5} stroke={C.ink} strokeWidth={1.5} />
      <Path d={`M ${xBatR} ${yBottom} H ${right}`} />
      <Lbl x={cx - 18} y={yBottom - 16} anchor="end" color={C.inkSoft} size={10}>
        +
      </Lbl>
      <Lbl x={cx + 18} y={yBottom - 16} anchor="start" color={C.inkSoft} size={10}>
        −
      </Lbl>
      <Lbl x={cx} y={yBottom + 22} color={C.signal}>
        {voltageLabel}
      </Lbl>
    </g>
  );
}

function placeOnBranch(cx: number, y: number): ResistorGeom {
  const half = (RESISTOR.lead + RESISTOR.body + RESISTOR.lead) / 2;
  const tLeft = cx - half;
  const tRight = cx + half;
  return {
    cx,
    y,
    tLeft,
    tRight,
    bodyLeft: tLeft + RESISTOR.lead,
    bodyRight: tRight - RESISTOR.lead,
  };
}

export function BatteryNode({ loop, label }: { readonly loop: LoopRect; readonly label: string }) {
  const y = loop.bottom;
  const cx = loop.cx;
  const xL = cx - 9 - 14;
  const xR = cx + 9 + 14;

  return (
    <g>
      <Path d={`M ${loop.left} ${y} H ${xL}`} />
      <line x1={cx - 9} y1={y - 8} x2={cx - 9} y2={y + 8} stroke={C.ink} strokeWidth={2.5} />
      <line x1={cx + 9} y1={y - 5} x2={cx + 9} y2={y + 5} stroke={C.ink} strokeWidth={1.5} />
      <Path d={`M ${xR} ${y} H ${loop.right}`} />
      <Lbl x={cx - 18} y={y - 16} anchor="end" color={C.inkSoft} size={10}>
        +
      </Lbl>
      <Lbl x={cx + 18} y={y - 16} anchor="start" color={C.inkSoft} size={10}>
        −
      </Lbl>
      <Lbl x={cx} y={y + 22} color={C.signal}>
        {label}
      </Lbl>
    </g>
  );
}

export function CurrentArrow({ x, y, lines }: { readonly x: number; readonly y: number; readonly lines: readonly string[] }) {
  return (
    <g>
      <polygon points={`${x},${y} ${x - 8},${y - 4} ${x - 8},${y + 4}`} fill={C.amber} />
      {lines.map((line, i) => (
        <Lbl key={line} x={x} y={y - 10 - i * 12} color={C.amber} size={10}>
          {line}
        </Lbl>
      ))}
    </g>
  );
}

export function VerticalRail({ x, y1, y2 }: { readonly x: number; readonly y1: number; readonly y2: number }) {
  return <Path d={`M ${x} ${y1} V ${y2}`} />;
}

import { CHART_COLORS as C } from '@/lib/charts/colors';

const SW = 2;

export function WireH({ x1, x2, y }: { readonly x1: number; readonly x2: number; readonly y: number }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.ink} strokeWidth={SW} strokeLinecap="round" />;
}

export function WireV({ x, y1, y2 }: { readonly x: number; readonly y1: number; readonly y2: number }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={C.ink} strokeWidth={SW} strokeLinecap="round" />;
}

export function Junction({ x, y }: { readonly x: number; readonly y: number }) {
  return <circle cx={x} cy={y} r={3.5} fill={C.ink} />;
}

export function GroundRail({ x1, x2, y }: { readonly x1: number; readonly x2: number; readonly y: number }) {
  const cx = x1 + (x2 - x1) / 2;
  return (
    <g>
      <WireH x1={x1} x2={x2} y={y} />
      <line x1={cx - 14} y1={y + 6} x2={cx + 14} y2={y + 6} stroke={C.ink} strokeWidth={SW} />
      <line x1={cx - 9} y1={y + 12} x2={cx + 9} y2={y + 12} stroke={C.ink} strokeWidth={SW} />
      <line x1={cx - 4} y1={y + 18} x2={cx + 4} y2={y + 18} stroke={C.ink} strokeWidth={SW} />
    </g>
  );
}

function CoilColumn({
  x,
  yTop,
  yBot,
  face,
}: {
  readonly x: number;
  readonly yTop: number;
  readonly yBot: number;
  readonly face: 'left' | 'right';
}) {
  const bumps = 4;
  const bumpH = (yBot - yTop) / bumps;
  const dir = face === 'right' ? 1 : -1;

  return (
    <g>
      {Array.from({ length: bumps }, (_, i) => {
        const yt = yTop + i * bumpH;
        const yb = yTop + (i + 1) * bumpH;
        const ym = (yt + yb) / 2;
        return (
          <path
            key={i}
            d={`M ${x} ${yt} Q ${x + dir * 12} ${ym} ${x} ${yb}`}
            fill="none"
            stroke={C.ink}
            strokeWidth={SW}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

/** Wtórne uzwojenie transformatora — dwie cewki + rdzeń (||). */
export function TrafoSecondary({
  x,
  yTop,
  yBot,
  centerTap,
}: {
  readonly x: number;
  readonly yTop: number;
  readonly yBot: number;
  readonly centerTap?: boolean;
}) {
  const cy = (yTop + yBot) / 2;
  const leftX = x - 18;
  const rightX = x + 18;

  return (
    <g>
      <CoilColumn x={leftX} yTop={yTop} yBot={yBot} face="right" />
      <CoilColumn x={rightX} yTop={yTop} yBot={yBot} face="left" />
      <line x1={x - 4} y1={yTop} x2={x - 4} y2={yBot} stroke={C.ink} strokeWidth={1.5} />
      <line x1={x + 4} y1={yTop} x2={x + 4} y2={yBot} stroke={C.ink} strokeWidth={1.5} />
      <Junction x={rightX} y={yTop} />
      <Junction x={rightX} y={yBot} />
      {centerTap ? (
        <>
          <Junction x={rightX} y={cy} />
          <WireH x1={rightX} x2={rightX + 28} y={cy} />
          <text x={rightX + 32} y={cy + 4} fontSize="10" fill={C.inkSoft}>
            CT
          </text>
        </>
      ) : null}
      <text x={leftX - 22} y={yTop + 4} fontSize="11" fill={C.inkSoft}>
        ~
      </text>
    </g>
  );
}

export function trafoTerminals(
  x: number,
  yTop: number,
  yBot: number,
): { readonly top: number; readonly bot: number; readonly mid: number; readonly termX: number } {
  const termX = x + 18;
  return { top: yTop, bot: yBot, mid: (yTop + yBot) / 2, termX };
}

export function DiodeH({
  x1,
  x2,
  y,
  reverse,
}: {
  readonly x1: number;
  readonly x2: number;
  readonly y: number;
  readonly reverse?: boolean;
}) {
  const left = reverse ? x2 : x1;
  const right = reverse ? x1 : x2;
  const mid = (left + right) / 2;
  return (
    <g>
      <WireH x1={left} x2={mid - 10} y={y} />
      <polygon
        points={`${mid - 8},${y} ${mid + 2},${y - 8} ${mid + 2},${y + 8}`}
        fill="#fff"
        stroke={C.ink}
        strokeWidth={SW}
      />
      <line x1={mid + 4} y1={y - 10} x2={mid + 4} y2={y + 10} stroke={C.ink} strokeWidth={SW} />
      <WireH x1={mid + 4} x2={right} y={y} />
    </g>
  );
}

export function DiodeV({
  x,
  y1,
  y2,
  reverse,
}: {
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly reverse?: boolean;
}) {
  const top = reverse ? y2 : y1;
  const bottom = reverse ? y1 : y2;
  const mid = (top + bottom) / 2;
  return (
    <g>
      <WireV x={x} y1={top} y2={mid - 10} />
      <polygon
        points={`${x},${mid - 8} ${x - 8},${mid + 2} ${x + 8},${mid + 2}`}
        fill="#fff"
        stroke={C.ink}
        strokeWidth={SW}
      />
      <line x1={x - 10} y1={mid + 4} x2={x + 10} y2={mid + 4} stroke={C.ink} strokeWidth={SW} />
      <WireV x={x} y1={mid + 4} y2={bottom} />
    </g>
  );
}

export function ResistorH({
  x1,
  x2,
  y,
  label,
}: {
  readonly x1: number;
  readonly x2: number;
  readonly y: number;
  readonly label?: string;
}) {
  const span = x2 - x1;
  const stub = Math.min(6, Math.max(3, span * 0.08));
  const bodyHalf = Math.min(24, Math.max(10, (span - stub * 2) / 2));
  const cx = (x1 + x2) / 2;
  const bodyL = cx - bodyHalf;
  const bodyR = cx + bodyHalf;
  return (
    <g>
      <WireH x1={x1} x2={bodyL} y={y} />
      <rect x={bodyL} y={y - 10} width={bodyR - bodyL} height={20} rx="2" fill="#fff" stroke={C.ink} strokeWidth={SW} />
      <WireH x1={bodyR} x2={x2} y={y} />
      {label ? (
        <text x={cx} y={y + 26} textAnchor="middle" fontSize="12" fontWeight="600" fill={C.ink}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function ResistorV({
  x,
  y1,
  y2,
  label,
  labelSide = 'left',
}: {
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly label?: string;
  readonly labelSide?: 'left' | 'right';
}) {
  const span = y2 - y1;
  const stub = Math.min(6, Math.max(3, span * 0.08));
  const bodyHalf = Math.min(24, Math.max(10, (span - stub * 2) / 2));
  const cy = (y1 + y2) / 2;
  const bodyT = cy - bodyHalf;
  const bodyB = cy + bodyHalf;
  const lx = labelSide === 'left' ? x - 16 : x + 16;
  const anchor = labelSide === 'left' ? 'end' : 'start';
  return (
    <g>
      <WireV x={x} y1={y1} y2={bodyT} />
      <rect x={x - 10} y={bodyT} width={20} height={bodyB - bodyT} rx="2" fill="#fff" stroke={C.ink} strokeWidth={SW} />
      <WireV x={x} y1={bodyB} y2={y2} />
      {label ? (
        <text x={lx} y={cy + 4} textAnchor={anchor} fontSize="12" fontWeight="600" fill={C.ink}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function CapacitorH({
  x1,
  x2,
  y,
  label,
  accent,
}: {
  readonly x1: number;
  readonly x2: number;
  readonly y: number;
  readonly label?: string;
  accent?: boolean;
}) {
  const cx = (x1 + x2) / 2;
  const stroke = accent ? C.amber : C.signal;
  return (
    <g>
      <WireH x1={x1} x2={cx - 5} y={y} />
      <line x1={cx - 5} y1={y - 16} x2={cx - 5} y2={y + 16} stroke={stroke} strokeWidth={SW} />
      <line x1={cx + 5} y1={y - 16} x2={cx + 5} y2={y + 16} stroke={stroke} strokeWidth={SW} />
      <WireH x1={cx + 5} x2={x2} y={y} />
      {label ? (
        <text x={cx} y={y - 22} textAnchor="middle" fontSize="12" fontWeight="700" fill={stroke}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

export function CapacitorV({
  x,
  y1,
  y2,
  label,
  accent,
}: {
  readonly x: number;
  readonly y1: number;
  readonly y2: number;
  readonly label?: string;
  accent?: boolean;
}) {
  const cy = (y1 + y2) / 2;
  const stroke = accent ? C.amber : C.signal;
  return (
    <g>
      <WireV x={x} y1={y1} y2={cy - 5} />
      <line x1={x - 16} y1={cy - 5} x2={x + 16} y2={cy - 5} stroke={stroke} strokeWidth={SW} />
      <line x1={x - 16} y1={cy + 5} x2={x + 16} y2={cy + 5} stroke={stroke} strokeWidth={SW} />
      <WireV x={x} y1={cy + 5} y2={y2} />
      {label ? (
        <text x={x + 20} y={cy + 4} fontSize="12" fontWeight="700" fill={stroke}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

export type NpnPorts = {
  readonly collector: { readonly x: number; readonly y: number };
  readonly base: { readonly x: number; readonly y: number };
  readonly emitter: { readonly x: number; readonly y: number };
};

/** Tranzystor NPN — symbol IEC (UKE): pionowy słupek C–E, baza z lewej, strzałka emitera na zewnątrz. */
export function NpnTransistorSymbol({ cx, cy }: { readonly cx: number; readonly cy: number }): {
  readonly ports: NpnPorts;
  readonly symbol: JSX.Element;
} {
  const barTop = cy - 22;
  const barBot = cy + 4;
  const baseY = cy - 10;
  const emitX = cx - 20;
  const emitY = cy + 26;

  const ports: NpnPorts = {
    collector: { x: cx, y: barTop },
    base: { x: cx - 32, y: baseY },
    emitter: { x: emitX, y: emitY },
  };

  const symbol = (
    <g>
      <line x1={cx} y1={barTop} x2={cx} y2={barBot} stroke={C.ink} strokeWidth={2.5} strokeLinecap="butt" />
      <line x1={cx - 32} y1={baseY} x2={cx} y2={baseY} stroke={C.ink} strokeWidth={SW} strokeLinecap="round" />
      <line x1={cx} y1={barBot} x2={emitX} y2={emitY} stroke={C.ink} strokeWidth={SW} strokeLinecap="round" />
      <polygon points={`${emitX},${emitY} ${emitX + 10},${emitY - 5} ${emitX + 7},${emitY + 5}`} fill={C.ink} />
    </g>
  );

  return { ports, symbol };
}

export function TransistorPinLabels({ ports }: { readonly ports: NpnPorts }) {
  return (
    <g>
      <text x={ports.base.x - 6} y={ports.base.y - 10} textAnchor="end" fontSize="11" fontWeight="600" fill={C.ink}>
        B
      </text>
      <text x={ports.collector.x + 12} y={ports.collector.y - 4} fontSize="11" fontWeight="600" fill={C.ink}>
        C
      </text>
      <text x={ports.emitter.x - 6} y={ports.emitter.y + 18} textAnchor="end" fontSize="11" fontWeight="600" fill={C.ink}>
        E
      </text>
    </g>
  );
}

export function VccRail({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g>
      <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke={C.ink} strokeWidth={2.5} />
      <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fontWeight="600" fill={C.inkSoft}>
        +V
      </text>
    </g>
  );
}

/** Odbiornik akustyczny — dwa elementy + pałąk (bez nakładania). */
export function Headphones({ cx, cy }: { readonly cx: number; readonly cy: number }) {
  const cupR = 8;
  const cupGap = 28;
  const leftX = cx - cupGap / 2;
  const rightX = cx + cupGap / 2;

  return (
    <g>
      <circle cx={leftX} cy={cy} r={cupR} fill="none" stroke={C.ink} strokeWidth={SW} />
      <circle cx={rightX} cy={cy} r={cupR} fill="none" stroke={C.ink} strokeWidth={SW} />
      <path
        d={`M ${leftX - cupR} ${cy} Q ${cx} ${cy - 14} ${rightX + cupR} ${cy}`}
        fill="none"
        stroke={C.ink}
        strokeWidth={1.5}
      />
      <text x={cx} y={cy + 24} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.inkSoft}>
        AF
      </text>
    </g>
  );
}

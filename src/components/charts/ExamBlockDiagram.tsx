import { CHART_COLORS as C } from '@/lib/charts/colors';
import { getExamBlockDiagram, type ExamBlock, type ExamBlockDiagramDef } from '@/lib/radio/examDiagrams';
import { ChartFrame } from '@/components/charts/ChartFrame';

const W = 520;
const ROW_H = 52;
const SIDE_GAP = 36;
const PAD = 20;

type NodePos = {
  readonly num: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly short: string;
  readonly side?: boolean;
  readonly attachTo?: number;
};

function splitRows(blocks: readonly ExamBlock[]): readonly (readonly ExamBlock[])[] {
  if (blocks.length <= 6) return [blocks];
  const mid = Math.ceil(blocks.length / 2);
  return [blocks.slice(0, mid), blocks.slice(mid)];
}

function layoutDiagram(diag: ExamBlockDiagramDef): readonly NodePos[] {
  const rows = splitRows(diag.blocks);
  const rowCount = rows.length;
  const maxCols = Math.max(...rows.map((r) => r.length));
  const maxW = W - PAD * 2;
  const w = Math.min(56, Math.floor((maxW - Math.max(maxCols - 1, 0) * 8) / Math.max(maxCols, 1)));
  const gap = maxCols > 1 ? (maxW - maxCols * w) / (maxCols - 1) : 0;

  const nodes: NodePos[] = [];
  rows.forEach((row, ri) => {
    const y = PAD + 28 + ri * (ROW_H + 16);
    row.forEach((block, ci) => {
      nodes.push({
        num: block.num,
        x: PAD + ci * (w + gap),
        y,
        w,
        h: ROW_H,
        short: block.short,
      });
    });
  });

  for (const sb of diag.side ?? []) {
    const anchor = nodes.find((n) => n.num === sb.attachToNum && !n.side);
    if (!anchor) continue;
    nodes.push({
      num: sb.block.num,
      x: anchor.x + anchor.w / 2 - w / 2,
      y: anchor.y + anchor.h + SIDE_GAP,
      w,
      h: 44,
      short: sb.block.short,
      side: true,
      attachTo: sb.attachToNum,
    });
  }

  return nodes;
}

function diagramHeight(nodes: readonly NodePos[]): number {
  let maxY = PAD + 40;
  for (const n of nodes) {
    maxY = Math.max(maxY, n.y + n.h + 16);
  }
  return maxY;
}

function BlockBox({ node }: { readonly node: NodePos }) {
  const { x, y, w, h, num, short, side } = node;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="8"
        fill="#fff"
        stroke={side ? C.inkSoft : C.line}
        strokeWidth={1.5}
        strokeDasharray={side ? '4 3' : undefined}
      />
      <text x={x + w / 2} y={y + 18} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.signal}>
        {num}
      </text>
      <text x={x + w / 2} y={y + h - 10} textAnchor="middle" fontSize="9" fill={C.inkSoft}>
        {short}
      </text>
    </g>
  );
}

function FlowArrows({ nodes }: { readonly nodes: readonly NodePos[] }) {
  const main = nodes.filter((n) => !n.side);
  const paths: JSX.Element[] = [];

  for (let i = 0; i < main.length - 1; i++) {
    const a = main[i];
    const b = main[i + 1];
    if (!a || !b) continue;
    if (Math.abs(a.y - b.y) > 8) continue;
    const x1 = a.x + a.w;
    const x2 = b.x;
    const y = a.y + a.h / 2;
    paths.push(
      <g key={`${a.num}-${b.num}`}>
        <line x1={x1} y1={y} x2={x2 - 6} y2={y} stroke={C.ink} strokeWidth="1.5" />
        <polygon points={`${x2 - 6},${y} ${x2 - 12},${y - 4} ${x2 - 12},${y + 4}`} fill={C.ink} />
      </g>,
    );
  }

  for (const sb of nodes.filter((n) => n.side)) {
    const anchor = main.find((n) => n.num === sb.attachTo);
    if (!anchor) continue;
    const cx = anchor.x + anchor.w / 2;
    paths.push(
      <g key={`side-${sb.num}`}>
        <line
          x1={cx}
          y1={anchor.y + anchor.h}
          x2={cx}
          y2={sb.y - 4}
          stroke={C.inkSoft}
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />
        <polygon points={`${cx},${sb.y - 4} ${cx - 3},${sb.y - 10} ${cx + 3},${sb.y - 10}`} fill={C.inkSoft} />
      </g>,
    );
  }

  return <>{paths}</>;
}

type ExamBlockDiagramProps = {
  readonly diagramId: string;
};

export function ExamBlockDiagram({ diagramId }: ExamBlockDiagramProps) {
  const diag = getExamBlockDiagram(diagramId);
  if (!diag) return null;

  const nodes = layoutDiagram(diag);
  const h = diagramHeight(nodes);

  return (
    <ChartFrame title={diag.title} w={W} h={h + 8}>
      <rect x="4" y="4" width={W - 8} height={h - 4} rx="10" fill={C.panel} stroke={C.line} />
      <FlowArrows nodes={nodes} />
      {nodes.map((node) => (
        <BlockBox key={node.num} node={node} />
      ))}
    </ChartFrame>
  );
}

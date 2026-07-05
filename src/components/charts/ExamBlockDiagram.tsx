import { CHART_COLORS as C } from '@/lib/charts/colors';
import { getExamBlockDiagram, type ExamBlock, type ExamBlockDiagramDef } from '@/lib/radio/examDiagrams';
import { ChartFrame } from '@/components/charts/ChartFrame';

type ExamBlockDiagramProps = {
  readonly diagramId: string;
  readonly large?: boolean;
};

type NodePos = {
  readonly num: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly short: string;
  readonly side?: boolean;
  readonly attachTo?: number;
  readonly row: number;
};

function splitRows(blocks: readonly ExamBlock[]): readonly (readonly ExamBlock[])[] {
  if (blocks.length <= 5) return [blocks];
  const mid = Math.ceil(blocks.length / 2);
  return [blocks.slice(0, mid), blocks.slice(mid)];
}

function layoutDiagram(diag: ExamBlockDiagramDef, width: number): { readonly nodes: readonly NodePos[]; readonly height: number } {
  const pad = 24;
  const rowH = 58;
  const rowGap = 28;
  const rows = splitRows(diag.blocks);
  const maxCols = Math.max(...rows.map((r) => r.length));
  const maxW = width - pad * 2;
  const w = Math.min(72, Math.floor((maxW - Math.max(maxCols - 1, 0) * 10) / Math.max(maxCols, 1)));
  const gap = maxCols > 1 ? (maxW - maxCols * w) / (maxCols - 1) : 0;

  const nodes: NodePos[] = [];
  rows.forEach((row, ri) => {
    const y = pad + 20 + ri * (rowH + rowGap);
    row.forEach((block, ci) => {
      nodes.push({
        num: block.num,
        x: pad + ci * (w + gap),
        y,
        w,
        h: rowH,
        short: block.short,
        row: ri,
      });
    });
  });

  for (const sb of diag.side ?? []) {
    const anchor = nodes.find((n) => n.num === sb.attachToNum && !n.side);
    if (!anchor) continue;
    nodes.push({
      num: sb.block.num,
      x: anchor.x + anchor.w / 2 - w / 2,
      y: anchor.y + anchor.h + 32,
      w,
      h: 48,
      short: sb.block.short,
      side: true,
      attachTo: sb.attachToNum,
      row: anchor.row,
    });
  }

  let maxY = pad + 20;
  for (const n of nodes) {
    maxY = Math.max(maxY, n.y + n.h + 20);
  }

  return { nodes, height: maxY + 8 };
}

function BlockBox({ node, large }: { readonly node: NodePos; readonly large?: boolean }) {
  const { x, y, w, h, num, short, side } = node;
  const numSize = large ? 18 : 15;
  const shortSize = large ? 10 : 9;
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
        strokeWidth={side ? 1.5 : 2}
        strokeDasharray={side ? '5 4' : undefined}
      />
      <text x={x + w / 2} y={y + h / 2 - 2} textAnchor="middle" fontSize={numSize} fontWeight="700" fill={C.signal}>
        {num}
      </text>
      <text x={x + w / 2} y={y + h - 8} textAnchor="middle" fontSize={shortSize} fill={C.inkSoft}>
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

    if (a.row === b.row) {
      const x1 = a.x + a.w;
      const x2 = b.x;
      const y = a.y + a.h / 2;
      paths.push(
        <g key={`${a.num}-${b.num}`}>
          <line x1={x1} y1={y} x2={x2 - 8} y2={y} stroke={C.ink} strokeWidth="2" />
          <polygon points={`${x2 - 8},${y} ${x2 - 16},${y - 5} ${x2 - 16},${y + 5}`} fill={C.ink} />
        </g>,
      );
      continue;
    }

    const x = a.x + a.w / 2;
    const y1 = a.y + a.h;
    const y2 = b.y + b.h / 2;
    paths.push(
      <g key={`${a.num}-${b.num}-wrap`}>
        <line x1={x} y1={y1} x2={x} y2={y1 + 12} stroke={C.ink} strokeWidth="2" />
        <line x1={x} y1={y1 + 12} x2={b.x + b.w / 2} y2={y1 + 12} stroke={C.ink} strokeWidth="2" />
        <line x1={b.x + b.w / 2} y1={y1 + 12} x2={b.x + b.w / 2} y2={y2 - 8} stroke={C.ink} strokeWidth="2" />
        <polygon
          points={`${b.x + b.w / 2},${y2 - 8} ${b.x + b.w / 2 - 5},${y2 - 16} ${b.x + b.w / 2 + 5},${y2 - 16}`}
          fill={C.ink}
        />
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
          y2={sb.y - 6}
          stroke={C.inkSoft}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <polygon points={`${cx},${sb.y - 6} ${cx - 4},${sb.y - 14} ${cx + 4},${sb.y - 14}`} fill={C.inkSoft} />
      </g>,
    );
  }

  return <>{paths}</>;
}

export function ExamBlockDiagram({ diagramId, large }: ExamBlockDiagramProps) {
  const diag = getExamBlockDiagram(diagramId);
  if (!diag) return null;

  const w = large ? 720 : 560;
  const { nodes, height } = layoutDiagram(diag, w);

  return (
    <ChartFrame title={diag.title} w={w} h={height} {...(large ? { large: true } : {})}>
      <rect x="6" y="6" width={w - 12} height={height - 12} rx="12" fill={C.panel} stroke={C.line} />
      <text x={w / 2} y={22} textAnchor="middle" fontSize="11" fill={C.inkSoft}>
        sygnał → · numery jak w arkuszu UKE
      </text>
      <FlowArrows nodes={nodes} />
      {nodes.map((node) => (
        <BlockBox key={node.num} node={node} {...(large ? { large: true } : {})} />
      ))}
    </ChartFrame>
  );
}

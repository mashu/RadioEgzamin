'use client';

import { useMemo, useState } from 'react';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { BLOCK_DIAGRAMS, type BlockDef, type BlockDiagram } from '@/lib/radio/blockDiagrams';

const W = 520;
const H_MAIN = 172;
const H_SIDE = 58;

type NodePos = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly block: BlockDef;
  readonly side?: boolean;
  readonly attachTo?: string;
  readonly step?: number;
};

function layoutDiagram(diag: BlockDiagram): readonly NodePos[] {
  const n = diag.blocks.length;
  const mainY = 50;
  const h = 46;
  const pad = 22;
  const maxW = W - pad * 2;
  const w = Math.min(54, Math.floor((maxW - Math.max(n - 1, 0) * 6) / Math.max(n, 1)));
  const gap = n > 1 ? (maxW - n * w) / (n - 1) : 0;
  const nodes: NodePos[] = diag.blocks.map((block, i) => ({
    id: block.id,
    x: pad + i * (w + gap),
    y: mainY,
    w,
    h,
    block,
    step: i + 1,
  }));

  const side: NodePos[] = [];
  for (const sb of diag.sideBlocks ?? []) {
    const anchor = nodes.find((n) => n.id === sb.attachTo);
    if (!anchor) continue;
    side.push({
      id: sb.block.id,
      x: anchor.x + anchor.w / 2 - w / 2,
      y: anchor.y + h + 30,
      w,
      h: 40,
      block: sb.block,
      side: true,
      attachTo: sb.attachTo,
    });
  }
  return [...nodes, ...side];
}

function BlockNode({
  node,
  active,
  onSelect,
}: {
  readonly node: NodePos;
  readonly active: boolean;
  readonly onSelect: () => void;
}) {
  const { x, y, w, h, block, side, step } = node;
  const fill = active ? '#f2fafb' : side ? '#fafafa' : '#fff';
  const stroke = active ? C.signal : side ? C.inkSoft : C.line;

  if (side) {
    return (
      <g
        role="button"
        tabIndex={0}
        aria-pressed={active}
        aria-label={block.label}
        style={{ cursor: 'pointer' }}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx="8"
          fill={fill}
          stroke={stroke}
          strokeWidth={active ? 2.5 : 1.5}
          strokeDasharray="4 3"
        />
        <text x={x + w / 2} y={y + 22} textAnchor="middle" fontSize="11" fontWeight="700" fill={active ? C.signal : C.ink}>
          {block.short}
        </text>
        <text x={x + w / 2} y={y + h - 8} textAnchor="middle" fontSize="7.5" fill={C.inkSoft}>
          pomocniczy
        </text>
      </g>
    );
  }

  const stepLabel = step !== undefined ? String(step).padStart(2, '0') : '';

  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={block.label}
      style={{ cursor: 'pointer' }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="8"
        fill={fill}
        stroke={stroke}
        strokeWidth={active ? 2.5 : 1.5}
        strokeDasharray={side ? '4 3' : undefined}
      />
      <text x={x + w / 2} y={y + 14} textAnchor="middle" fontSize="8" fill={C.inkSoft} fontWeight="600">
        {stepLabel}
      </text>
      <text x={x + w / 2} y={y + 28} textAnchor="middle" fontSize="11" fontWeight="700" fill={active ? C.signal : C.ink}>
        {block.short}
      </text>
      <text x={x + w / 2} y={y + h - 7} textAnchor="middle" fontSize="7.5" fill={C.inkSoft}>
        blok
      </text>
    </g>
  );
}

function FlowArrows({ nodes, activeId }: { readonly nodes: readonly NodePos[]; readonly activeId: string }) {
  const main = nodes.filter((n) => !n.side);
  const paths: JSX.Element[] = [];

  for (let i = 0; i < main.length - 1; i++) {
    const a = main[i];
    const b = main[i + 1];
    if (!a || !b) continue;
    const x1 = a.x + a.w;
    const x2 = b.x;
    const y = a.y + a.h / 2;
    const hot = activeId === a.id || activeId === b.id;
    paths.push(
      <g key={`${a.id}-${b.id}`}>
        <line
          x1={x1}
          y1={y}
          x2={x2 - 6}
          y2={y}
          stroke={hot ? C.signal : C.ink}
          strokeWidth={hot ? 2.2 : 1.5}
        />
        <polygon
          points={`${x2 - 6},${y} ${x2 - 12},${y - 4} ${x2 - 12},${y + 4}`}
          fill={hot ? C.signal : C.ink}
        />
      </g>,
    );
  }

  for (const sb of nodes.filter((n) => n.side)) {
    const anchor = main.find((n) => n.id === sb.attachTo);
    if (!anchor) continue;
    const cx = anchor.x + anchor.w / 2;
    const hot = activeId === sb.id || activeId === anchor.id;
    paths.push(
      <g key={`side-${sb.id}`}>
        <line
          x1={cx}
          y1={anchor.y + anchor.h}
          x2={cx}
          y2={sb.y - 4}
          stroke={hot ? C.signal : C.inkSoft}
          strokeWidth={hot ? 2 : 1.2}
          strokeDasharray="4 3"
        />
        <polygon
          points={`${cx},${sb.y - 4} ${cx - 3},${sb.y - 10} ${cx + 3},${sb.y - 10}`}
          fill={hot ? C.signal : C.inkSoft}
        />
      </g>,
    );
  }

  return <>{paths}</>;
}

function DiagramSvg({
  diag,
  activeId,
  onSelect,
}: {
  readonly diag: BlockDiagram;
  readonly activeId: string;
  readonly onSelect: (id: string) => void;
}) {
  const nodes = useMemo(() => layoutDiagram(diag), [diag]);
  const hasSide = (diag.sideBlocks?.length ?? 0) > 0;
  const H = hasSide ? H_MAIN + H_SIDE : H_MAIN;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={diag.title} className="rk-block-flow-svg">
      <defs>
        <linearGradient id="rk-block-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafb" />
          <stop offset="100%" stopColor="#f0f4f3" />
        </linearGradient>
      </defs>
      <rect x="8" y="12" width={W - 16} height={H - 24} rx="12" fill="url(#rk-block-bg)" stroke={C.line} />
      <text x={W / 2} y={32} textAnchor="middle" fontSize="11" fill={C.inkSoft}>
        sygnał →
      </text>
      <FlowArrows nodes={nodes} activeId={activeId} />
      {nodes.map((node) => (
        <BlockNode
          key={node.id}
          node={node}
          active={activeId === node.id}
          onSelect={() => onSelect(node.id)}
        />
      ))}
      {diag.id === 'superhet' ? (
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="9" fill={C.amber}>
          f_RF → mieszacz → f_IF (stała, np. 9 MHz)
        </text>
      ) : null}
    </svg>
  );
}

export function InteractiveSuperhet() {
  const [diagramId, setDiagramId] = useState<string>('superhet');
  const [activeId, setActiveId] = useState<string>('ant');

  const diag = BLOCK_DIAGRAMS.find((d) => d.id === diagramId) ?? BLOCK_DIAGRAMS[0];
  const allBlocks = useMemo(() => {
    if (!diag) return [];
    return [...diag.blocks, ...(diag.sideBlocks?.map((s) => s.block) ?? [])];
  }, [diag]);
  const active = allBlocks.find((b) => b.id === activeId) ?? allBlocks[0];

  function switchDiagram(id: string) {
    setDiagramId(id);
    const next = BLOCK_DIAGRAMS.find((d) => d.id === id);
    const first = next?.blocks[0]?.id ?? 'fe';
    setActiveId(first);
  }

  if (!diag || !active) return null;

  return (
    <div className="rk-interactive rk-block-lab">
      <div className="rk-ohm-mode-btns" role="tablist" aria-label="Schematy blokowe">
        {BLOCK_DIAGRAMS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={diagramId === d.id}
            className={`rk-ohm-mode-btn ${diagramId === d.id ? 'is-active' : ''}`}
            onClick={() => switchDiagram(d.id)}
          >
            {d.title}
          </button>
        ))}
      </div>
      <p className="rk-ohm-lead">{diag.subtitle}</p>
      <DiagramSvg diag={diag} activeId={activeId} onSelect={setActiveId} />
      <div className="rk-block-detail">
        <span className="rk-eyebrow">{active.label}</span>
        <p>{active.detail}</p>
        {active.exam ? <p className="rk-block-exam">{active.exam}</p> : null}
      </div>
      <p className="rk-ohm-hint">
        {diag.blocks.map((b) => b.label).join(' → ')}
        {(diag.sideBlocks?.length ?? 0) > 0 ? ' (+ bloki pomocnicze przerywaną linią)' : ''}
      </p>
    </div>
  );
}

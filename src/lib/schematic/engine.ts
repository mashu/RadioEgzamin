import { RESISTOR, BATTERY, RESISTOR_SPAN } from '@/lib/schematic/layout';

export type LoopRect = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly cx: number;
};

/** Układ drabinkowy obwodu równoległego — stałe strefy, bez kolizji etykiet. */
export type ParallelLayout = {
  readonly left: number;
  readonly right: number;
  readonly cx: number;
  readonly y1: number;
  readonly y2: number;
  readonly yBottom: number;
};

export type ResistorGeom = {
  readonly cx: number;
  readonly y: number;
  readonly tLeft: number;
  readonly tRight: number;
  readonly bodyLeft: number;
  readonly bodyRight: number;
};

export function createLoop(width: number, height: number, pad: { l: number; r: number; t: number; b: number }): LoopRect {
  const left = pad.l;
  const right = width - pad.r;
  const top = pad.t;
  const bottom = height - pad.b;
  return { left, right, top, bottom, cx: (left + right) / 2 };
}

/** Drabinka równoległa: y1 (R₁), y2 (R₂), yBottom (bateria). Odstępy dobrane tak, by zmieścić etykiety. */
export function createParallelLayout(width: number, height: number): ParallelLayout {
  const left = 108;
  const right = width - 72;
  const cx = (left + right) / 2;
  const y1 = 42;
  const y2 = 104;
  const yBottom = height - 52;
  return { left, right, cx, y1, y2, yBottom };
}

export function placeResistor(cx: number, y: number): ResistorGeom {
  const half = RESISTOR_SPAN / 2;
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

export function placeSeriesPair(loop: LoopRect, gap: number): { readonly r1: ResistorGeom; readonly r2: ResistorGeom } {
  const offset = RESISTOR_SPAN / 2 + gap / 2;
  return {
    r1: placeResistor(loop.cx - offset, loop.top),
    r2: placeResistor(loop.cx + offset, loop.top),
  };
}

export function parallelBranchYs(loop: LoopRect): { readonly y1: number; readonly y2: number } {
  const slot = (loop.bottom - loop.top) / 3;
  return { y1: loop.top + slot, y2: loop.top + slot * 2 };
}

export { RESISTOR_SPAN, BATTERY };

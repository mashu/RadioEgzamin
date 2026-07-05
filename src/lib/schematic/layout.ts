/** Wspólny układ prostokątnej pętli — symetryczne marginesy i wyliczone strefy etykiet. */
export type LoopRect = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly cx: number;
  readonly cy: number;
};

export const RESISTOR = {
  lead: 14,
  body: 56,
  height: 24,
} as const;

export const RESISTOR_SPAN = RESISTOR.lead + RESISTOR.body + RESISTOR.lead;

export const BATTERY = {
  wireGap: 14,
  plateHalf: 9,
} as const;

export const BATTERY_SPAN = BATTERY.wireGap * 2 + BATTERY.plateHalf * 2;

/** Tworzy prostokąt pętli wyśrodkowany w viewBox. */
export function createLoopRect(width: number, height: number, inset?: Partial<{ t: number; b: number; l: number; r: number }>): LoopRect {
  const l = inset?.l ?? 64;
  const r = inset?.r ?? 64;
  const t = inset?.t ?? 44;
  const b = inset?.b ?? 56;
  const left = l;
  const right = width - r;
  const top = t;
  const bottom = height - b;
  return { left, right, top, bottom, cx: (left + right) / 2, cy: (top + bottom) / 2 };
}

/** Dwie gałęzie równoległe — trzy równe przedziały pionowe. */
export function parallelBranchY(loop: LoopRect, index: 0 | 1): number {
  const slot = (loop.bottom - loop.top) / 3;
  return loop.top + slot * (index + 1);
}

export function resistorCenterX(loop: LoopRect): number {
  return loop.cx;
}

export function resistorLeftX(loop: LoopRect): number {
  return loop.cx - RESISTOR_SPAN / 2;
}

export function resistorRightX(loop: LoopRect): number {
  return loop.cx + RESISTOR_SPAN / 2;
}

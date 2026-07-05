import { createLoop, createParallelLayout, placeResistor, placeSeriesPair } from '@/lib/schematic/engine';
import { RESISTOR } from '@/lib/schematic/layout';

describe('schematic engine', () => {
  it('centers resistor terminals in loop', () => {
    const loop = createLoop(460, 148, { l: 72, r: 72, t: 40, b: 52 });
    const r = placeResistor(loop.cx, loop.top);
    expect(r.tLeft).toBeGreaterThan(loop.left);
    expect(r.tRight).toBeLessThan(loop.right);
    expect(r.bodyLeft - r.tLeft).toBe(RESISTOR.lead);
  });

  it('parallel ladder has room for labels between branches', () => {
    const layout = createParallelLayout(460, 210);
    const gap = layout.y2 - layout.y1;
    expect(gap).toBeGreaterThanOrEqual(48);
    expect(layout.yBottom - layout.y2).toBeGreaterThanOrEqual(40);
    const r1ValueY = layout.y1 + RESISTOR.height / 2 + 18;
    const r2NameY = layout.y2 - RESISTOR.height / 2 - 10;
    expect(r2NameY - r1ValueY).toBeGreaterThan(8);
  });

  it('connects series pair terminals with gap', () => {
    const loop = createLoop(460, 168, { l: 72, r: 72, t: 40, b: 52 });
    const { r1, r2 } = placeSeriesPair(loop, 32);
    expect(r2.tLeft - r1.tRight).toBe(32);
  });
});

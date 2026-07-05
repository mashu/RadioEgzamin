import { calcParallel, calcSeries, calcSingle } from '@/lib/ohm/circuit';

describe('ohm circuit', () => {
  it('calculates single resistor circuit', () => {
    const r = calcSingle(12, 120);
    expect(r.current).toBeCloseTo(0.1);
    expect(r.power).toBeCloseTo(1.2);
  });

  it('calculates series circuit', () => {
    const r = calcSeries(12, 100, 200);
    expect(r.totalR).toBe(300);
    expect(r.current).toBeCloseTo(0.04);
    expect(r.v1).toBeCloseTo(4);
    expect(r.v2).toBeCloseTo(8);
  });

  it('calculates parallel circuit', () => {
    const r = calcParallel(12, 100, 100);
    expect(r.totalR).toBe(50);
    expect(r.current).toBeCloseTo(0.24);
    expect(r.i1).toBeCloseTo(0.12);
    expect(r.i2).toBeCloseTo(0.12);
  });
});

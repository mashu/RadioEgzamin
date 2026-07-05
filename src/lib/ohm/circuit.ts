export type SeriesResult = {
  readonly voltage: number;
  readonly r1: number;
  readonly r2: number;
  readonly totalR: number;
  readonly current: number;
  readonly v1: number;
  readonly v2: number;
  readonly power: number;
};

export type ParallelResult = {
  readonly voltage: number;
  readonly r1: number;
  readonly r2: number;
  readonly totalR: number;
  readonly current: number;
  readonly i1: number;
  readonly i2: number;
  readonly power: number;
};

export function calcSingle(voltage: number, resistance: number) {
  const current = voltage / resistance;
  return { voltage, resistance, current, power: voltage * current };
}

export function calcSeries(voltage: number, r1: number, r2: number): SeriesResult {
  const totalR = r1 + r2;
  const current = voltage / totalR;
  return {
    voltage,
    r1,
    r2,
    totalR,
    current,
    v1: current * r1,
    v2: current * r2,
    power: voltage * current,
  };
}

export function calcParallel(voltage: number, r1: number, r2: number): ParallelResult {
  const totalR = (r1 * r2) / (r1 + r2);
  const i1 = voltage / r1;
  const i2 = voltage / r2;
  const current = i1 + i2;
  return { voltage, r1, r2, totalR, current, i1, i2, power: voltage * current };
}

export function formatOhm(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)} kΩ`;
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} Ω`;
}

export function formatAmp(value: number): string {
  if (value < 0.001) return `${(value * 1_000_000).toFixed(0)} µA`;
  if (value < 1) return `${(value * 1000).toFixed(value * 1000 < 10 ? 1 : 0)} mA`;
  return `${value.toFixed(value < 10 ? 2 : 1)} A`;
}

export function formatVolt(value: number): string {
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} V`;
}

export function formatWatt(value: number): string {
  if (value < 1) return `${(value * 1000).toFixed(0)} mW`;
  return `${value.toFixed(value < 10 ? 2 : 1)} W`;
}

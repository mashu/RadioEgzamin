export function calcXc(fHz: number, cFarad: number): number {
  if (fHz <= 0 || cFarad <= 0) return Infinity;
  return 1 / (2 * Math.PI * fHz * cFarad);
}

export function calcXl(fHz: number, lHenry: number): number {
  return 2 * Math.PI * fHz * lHenry;
}

export function calcResonanceHz(lHenry: number, cFarad: number): number {
  if (lHenry <= 0 || cFarad <= 0) return 0;
  return 1 / (2 * Math.PI * Math.sqrt(lHenry * cFarad));
}

export function formatFreqHz(hz: number): string {
  if (hz >= 1_000_000) return `${(hz / 1_000_000).toFixed(hz % 1_000_000 === 0 ? 0 : 2)} MHz`;
  if (hz >= 1000) return `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

export function formatInductance(h: number): string {
  if (h >= 1) return `${h.toFixed(h < 10 ? 2 : 1)} H`;
  if (h >= 0.001) return `${(h * 1000).toFixed(1)} mH`;
  return `${(h * 1_000_000).toFixed(0)} µH`;
}

export function formatCapacitance(f: number): string {
  if (f >= 1e-6) return `${(f * 1e6).toFixed(f * 1e6 < 10 ? 1 : 0)} µF`;
  if (f >= 1e-9) return `${(f * 1e9).toFixed(0)} nF`;
  return `${(f * 1e12).toFixed(0)} pF`;
}

export function formatReactance(x: number): string {
  if (!Number.isFinite(x)) return '∞ Ω';
  if (x >= 1000) return `${(x / 1000).toFixed(1)} kΩ`;
  return `${x.toFixed(x < 10 ? 1 : 0)} Ω`;
}

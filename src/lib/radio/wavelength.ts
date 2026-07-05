const LIGHT_SPEED_MHZ_M = 300;

export function wavelengthMeters(freqMhz: number): number {
  if (freqMhz <= 0) return Infinity;
  return LIGHT_SPEED_MHZ_M / freqMhz;
}

export function freqMhzFromWavelengthMeters(wavelengthM: number): number {
  if (wavelengthM <= 0) return 0;
  return LIGHT_SPEED_MHZ_M / wavelengthM;
}

export function bandLabel(freqMhz: number): string {
  if (freqMhz < 0.3) return 'LW';
  if (freqMhz < 3) return 'MW';
  if (freqMhz < 30) return 'HF (fale krótkie)';
  if (freqMhz < 300) return 'VHF';
  if (freqMhz < 3000) return 'UHF';
  return 'SHF';
}

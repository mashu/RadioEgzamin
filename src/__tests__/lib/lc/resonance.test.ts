import { calcResonanceHz, calcXc, calcXl } from '@/lib/lc/resonance';
import { bandLabel, freqMhzFromWavelengthMeters, wavelengthMeters } from '@/lib/radio/wavelength';

describe('lc resonance', () => {
  it('calculates resonance frequency', () => {
    const f0 = calcResonanceHz(2e-6, 400e-12);
    expect(f0 / 1e6).toBeCloseTo(5.63, 1);
  });

  it('reactances cross at resonance', () => {
    const l = 2e-6;
    const c = 400e-12;
    const f0 = calcResonanceHz(l, c);
    expect(calcXc(f0, c)).toBeCloseTo(calcXl(f0, l), 0);
  });
});

describe('wavelength', () => {
  it('computes wavelength from frequency', () => {
    expect(wavelengthMeters(14)).toBeCloseTo(300 / 14, 1);
  });

  it('labels HF band', () => {
    expect(bandLabel(14)).toContain('HF');
  });

  it('roundtrips freq and wavelength', () => {
    const f = 7.05;
    expect(freqMhzFromWavelengthMeters(wavelengthMeters(f))).toBeCloseTo(f, 5);
  });
});

import { BandwidthChart } from '@/components/charts/BandwidthChart';
import { PolarChart } from '@/components/charts/PolarChart';
import { RectifierChart } from '@/components/charts/RectifierChart';
import { SineChart } from '@/components/charts/SineChart';
import { WaveChart } from '@/components/charts/WaveChart';
import type { ChartKey } from '@/types/domain';

type ChartExtra = {
  readonly amp?: number;
};

export function renderChart(key: ChartKey, extra?: ChartExtra) {
  switch (key) {
    case 'sine':
      return <SineChart amp={extra?.amp ?? 1} />;
    case 'wave':
      return <WaveChart />;
    case 'rect-half':
      return <RectifierChart type="half" />;
    case 'rect-full':
      return <RectifierChart type="full" />;
    case 'rect-bridge':
      return <RectifierChart type="bridge" />;
    case 'bandwidth':
      return <BandwidthChart />;
    case 'polar-dipole':
      return <PolarChart type="dipole" />;
    case 'polar-vertical':
      return <PolarChart type="vertical" />;
    case 'polar-yagi':
      return <PolarChart type="yagi" />;
    default:
      return null;
  }
}

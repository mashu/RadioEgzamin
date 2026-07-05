import { BandwidthChart } from '@/components/charts/BandwidthChart';
import { DiodeDetectorChart } from '@/components/charts/DiodeDetectorChart';
import { ExamBlockDiagram } from '@/components/charts/ExamBlockDiagram';
import { PolarChart } from '@/components/charts/PolarChart';
import { RectifierChart } from '@/components/charts/RectifierChart';
import { RectifierCircuitChart } from '@/components/charts/RectifierCircuitChart';
import { SineChart } from '@/components/charts/SineChart';
import { TransistorBiasChart } from '@/components/charts/TransistorBiasChart';
import { WaveChart } from '@/components/charts/WaveChart';
import { YagiElementsChart } from '@/components/charts/YagiElementsChart';
import type { ChartKey } from '@/types/domain';

type ChartExtra = {
  readonly amp?: number;
};

const BLOCK_DIAGRAM_KEYS = new Set<ChartKey>([
  'pll',
  'rx-am-single',
  'rx-double-ssb',
  'rx-homodyne',
  'rx-fm-144',
  'tx-cw-single',
  'tx-cw-multi',
  'tx-ssb',
]);

export function renderChart(key: ChartKey, extra?: ChartExtra) {
  if (BLOCK_DIAGRAM_KEYS.has(key)) {
    return <ExamBlockDiagram diagramId={key} />;
  }

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
    case 'circuit-rect-half':
      return <RectifierCircuitChart type="half" />;
    case 'circuit-rect-full':
      return <RectifierCircuitChart type="full" />;
    case 'circuit-rect-bridge':
      return <RectifierCircuitChart type="bridge" />;
    case 'bandwidth':
      return <BandwidthChart />;
    case 'polar-dipole':
      return <PolarChart type="dipole" />;
    case 'polar-vertical':
      return <PolarChart type="vertical" />;
    case 'polar-yagi':
      return <PolarChart type="yagi" />;
    case 'yagi-elements':
      return <YagiElementsChart />;
    case 'detector-diode':
      return <DiodeDetectorChart />;
    case 'transistor-bias':
      return <TransistorBiasChart />;
    default:
      return null;
  }
}

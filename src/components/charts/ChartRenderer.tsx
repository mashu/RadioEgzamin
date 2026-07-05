import { BandwidthChart } from '@/components/charts/BandwidthChart';
import { DiagramExpander } from '@/components/charts/DiagramExpander';
import { DiodeDetectorChart } from '@/components/charts/DiodeDetectorChart';
import { ExamBlockDiagram } from '@/components/charts/ExamBlockDiagram';
import { PolarChart } from '@/components/charts/PolarChart';
import { RectifierChart } from '@/components/charts/RectifierChart';
import { RectifierCircuitChart } from '@/components/charts/RectifierCircuitChart';
import { SineChart } from '@/components/charts/SineChart';
import { TransistorBiasChart } from '@/components/charts/TransistorBiasChart';
import { WaveChart } from '@/components/charts/WaveChart';
import { YagiElementsChart } from '@/components/charts/YagiElementsChart';
import { EXPANDABLE_CHART_KEYS } from '@/lib/radio/diagramMeta';
import type { ChartKey } from '@/types/domain';

type ChartExtra = {
  readonly amp?: number;
  readonly large?: boolean;
};

function renderChartInner(key: ChartKey, extra?: ChartExtra) {
  const large = extra?.large ?? false;

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
      return <RectifierCircuitChart type="half" large={large} />;
    case 'circuit-rect-full':
      return <RectifierCircuitChart type="full" large={large} />;
    case 'circuit-rect-bridge':
      return <RectifierCircuitChart type="bridge" large={large} />;
    case 'bandwidth':
      return <BandwidthChart />;
    case 'polar-dipole':
      return <PolarChart type="dipole" />;
    case 'polar-vertical':
      return <PolarChart type="vertical" />;
    case 'polar-yagi':
      return <PolarChart type="yagi" />;
    case 'yagi-elements':
      return <YagiElementsChart large={large} />;
    case 'detector-diode':
      return <DiodeDetectorChart large={large} />;
    case 'transistor-bias':
      return <TransistorBiasChart large={large} />;
    case 'pll':
    case 'rx-am-single':
    case 'rx-double-ssb':
    case 'rx-homodyne':
    case 'rx-fm-144':
    case 'tx-cw-single':
    case 'tx-cw-multi':
    case 'tx-ssb':
      return <ExamBlockDiagram diagramId={key} large={large} />;
    default:
      return null;
  }
}

export function renderChart(key: ChartKey, extra?: ChartExtra) {
  const chart = renderChartInner(key, extra);

  if (EXPANDABLE_CHART_KEYS.has(key) && !extra?.large) {
    return (
      <DiagramExpander chartKey={key} largeContent={renderChartInner(key, { ...extra, large: true })}>
        {chart}
      </DiagramExpander>
    );
  }

  return chart;
}

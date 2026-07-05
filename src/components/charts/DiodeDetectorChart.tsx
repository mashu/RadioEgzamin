import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { Lbl, Path } from '@/components/schematic/SchematicParts';

export function DiodeDetectorChart() {
  const w = 420;
  const h = 180;
  const y = 88;

  return (
    <ChartFrame title="Detektor diodowy AM" w={w} h={h}>
      <Lbl x={36} y={y + 4} anchor="end" size={10} color={C.inkSoft}>
        IF
      </Lbl>
      <Path d={`M ${40} ${y} H ${120}`} />
      <polygon
        points={`${132},${y} ${124},${y - 7} ${124},${y + 7}`}
        fill="#fff"
        stroke={C.ink}
        strokeWidth="2"
      />
      <line x1={134} y1={y - 9} x2={134} y2={y + 9} stroke={C.ink} strokeWidth="2" />
      <Path d={`M ${134} ${y} H ${200}`} />
      <rect x={200} y={y - 12} width="48" height="24" rx="3" fill="#fff" stroke={C.signal} strokeWidth="2" />
      <Lbl x={224} y={y + 5} color={C.signal} size={11}>
        C1
      </Lbl>
      <Path d={`M ${248} ${y} H ${300}`} />
      <circle cx={320} cy={y} r="14" fill="none" stroke={C.ink} strokeWidth="1.8" />
      <Lbl x={320} y={y + 5} size={9}>
        AF
      </Lbl>
      <Path d={`M ${200} ${y + 12} V ${130}`} />
      <Path d={`M ${248} ${y + 12} V ${130}`} />
      <Path d={`M ${40} ${130} H ${320}`} />
      <Lbl x={224} y={152} size={10} color={C.inkSoft}>
        C1 filtruje składową w.cz. — przepuszcza audio
      </Lbl>
    </ChartFrame>
  );
}

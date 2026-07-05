import { ChartFrame } from '@/components/charts/ChartFrame';
import { CHART_COLORS as C } from '@/lib/charts/colors';
import { Lbl, Path } from '@/components/schematic/SchematicParts';

export function TransistorBiasChart() {
  const w = 400;
  const h = 240;

  return (
    <ChartFrame title="Wzmacniacz CE z polaryzacją dzielnikiem" w={w} h={h}>
      {/* VCC rail */}
      <Path d="M 200 28 H 200" />
      <line x1={188} y1={28} x2={212} y2={28} stroke={C.ink} strokeWidth="2.5" />
      <Lbl x={200} y={18} size={10} color={C.inkSoft}>
        +V
      </Lbl>
      <Path d="M 200 28 V 56" />

      {/* Rc */}
      <rect x={188} y={56} width="24" height="48" rx="2" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <Lbl x={200} y={78} size={9}>
        Rc
      </Lbl>
      <Path d="M 200 104 V 128" />

      {/* Transistor */}
      <circle cx={200} cy={140} r="18" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <Path d="M 200 122 V 108" />
      <Path d="M 200 158 V 172" />
      <Path d="M 182 132 H 200" />
      <Path d="M 182 132 L 168 124" />
      <Lbl x={158} y={120} anchor="end" size={9}>
        B
      </Lbl>
      <Lbl x={200} y={188} size={9}>
        E
      </Lbl>

      {/* R1 base divider */}
      <Path d="M 200 28 H 120" />
      <Path d="M 120 28 V 56" />
      <rect x={108} y={56} width="24" height="48" rx="2" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <Lbl x={120} y={78} color={C.signal} size={10}>
        R1
      </Lbl>
      <Path d="M 120 104 V 132" />

      {/* R2 base divider */}
      <Path d="M 120 132 V 172" />
      <rect x={108} y={172} width="24" height="36" rx="2" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <Lbl x={120} y={192} color={C.signal} size={10}>
        R2
      </Lbl>
      <Path d="M 120 208 V 220" />

      {/* Re + C1 bypass */}
      <Path d="M 200 172 V 188" />
      <rect x={188} y={188} width="24" height="32" rx="2" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <Lbl x={200} y={206} size={9}>
        Re
      </Lbl>
      <rect x={228} y={188} width="28" height="32" rx="3" fill="#fff" stroke={C.amber} strokeWidth="2" />
      <Lbl x={242} y={206} color={C.amber} size={10}>
        C1
      </Lbl>
      <Path d="M 212 204 H 228" />
      <Path d="M 256 204 H 268" />
      <Path d="M 242 188 V 172" />
      <Path d="M 242 220 V 228" />
      <Path d="M 120 220 H 268" />
      <Lbl x={268} y={224} anchor="start" size={10} color={C.inkSoft}>
        GND
      </Lbl>
      <Lbl x={280} y={176} anchor="start" size={9} color={C.amber}>
        bocznik AC
      </Lbl>
    </ChartFrame>
  );
}

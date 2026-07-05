import type { ChartKey } from '@/types/domain';
import { EXAM_BLOCK_DIAGRAMS } from '@/lib/radio/examDiagrams';

export type DiagramMeta = {
  readonly title: string;
  readonly summary: string;
  readonly legend?: readonly { readonly num: number; readonly name: string }[];
};

const BLOCK_NAMES: Readonly<Record<string, Readonly<Record<number, string>>>> = {
  pll: {
    1: 'Generator stabilizowany (VCO)',
    2: 'Dzielnik nastawny',
    3: 'Komparator fazy',
    4: 'Generator wzorca',
    5: 'Dzielnik częstotliwości wzorca',
    6: 'Wzmacniacz błędu',
  },
  'rx-am-single': {
    1: 'Filtr wejściowy',
    2: 'Mieszacz',
    3: 'Wzmacniacz pośredniej cz.',
    4: 'Detektor AM',
    5: 'Wzmacniacz akustyczny',
    6: 'Heterodyna',
  },
  'rx-double-ssb': {
    1: 'Wzmacniacz w.cz.',
    2: 'I mieszacz',
    3: 'Wzmacniacz I pośredniej cz.',
    4: 'II mieszacz',
    5: 'II heterodyna stała',
    6: 'Filtr przełączany II p.cz.',
    7: 'Wzmacniacz II pośredniej cz.',
    8: 'Detektor AM / CW / SSB',
    9: 'Wzmacniacz akustyczny',
    10: 'BFO',
    11: 'I heterodyna strojona',
  },
  'rx-homodyne': {
    1: 'Filtr wejściowy',
    2: 'Mieszacz zrównoważony',
    3: 'Wzmacniacz akustyczny',
    4: 'Heterodyna',
  },
  'rx-fm-144': {
    1: 'Wzmacniacz w.cz.',
    2: 'I mieszacz',
    3: 'Wzmacniacz I p.cz. 10,7 MHz',
    4: 'II mieszacz',
    5: 'Wzmacniacz II p.cz. 455 kHz',
    6: 'Detektor FM',
    7: 'Wzmacniacz akustyczny',
    8: 'Blokada szumów',
    9: 'II heterodyna stała',
    10: 'I heterodyna kwarcowa',
  },
  'tx-cw-single': {
    1: 'Oscylator (VFO)',
    2: 'Separator',
    3: 'Wzmacniacz mocy (PA)',
    4: 'Filtr wyjściowy',
  },
  'tx-cw-multi': {
    1: 'Oscylator (VFO)',
    2: 'Separator',
    3: 'I powielacz ×2',
    4: 'II powielacz ×2',
    5: 'Wzmacniacz sterujący',
    6: 'Wzmacniacz mocy (PA)',
    7: 'Filtr wyjściowy',
  },
  'tx-ssb': {
    1: 'Wzbudnica SSB 9 MHz',
    2: 'Mieszacz',
    3: 'Filtr pasmowy 3,5–14 MHz',
    4: 'Wzmacniacz sterujący',
    5: 'Wzmacniacz mocy (PA)',
    6: 'Filtr wyjściowy',
    7: 'Oscylator (VFO) 5–5,5 MHz',
  },
};

const STATIC_META: Partial<Record<ChartKey, DiagramMeta>> = {
  'circuit-rect-half': {
    title: 'Prostownik jednopołówkowy',
    summary: 'Jedna dioda prostuje tylko dodatnie połowy okresu napięcia wtórnego transformatora. Na wyjściu widać przerwy — wymaga dużego filtra pojemnościowego.',
  },
  'circuit-rect-full': {
    title: 'Prostownik dwupołówkowy',
    summary: 'Transformator z odczepem środkowym i dwie diody — na przemian prostują obie połowy. Garby na wyjściu bez przerw między nimi.',
  },
  'circuit-rect-bridge': {
    title: 'Prostownik mostkowy',
    summary: 'Mostek Graetza z czterema diodami — pełne prostowanie bez transformatora odczepowego. Standard w zasilaczach.',
  },
  'detector-diode': {
    title: 'Detektor diodowy AM',
    summary:
      'Dioda wycina jednostronnie sygnał z toru pośredniej częstotliwości. Kondensator C1 filtruje pozostałą składową w.cz. i przepuszcza sygnał audio do słuchawek.',
  },
  'transistor-bias': {
    title: 'Wzmacniacz wspólny emiter',
    summary:
      'Rezystory R1 i R2 tworzą dzielnik napięcia ustalający punkt pracy bazy. Kondensator C1 bocznikuje emiter dla prądów przemiennych — zwiększa wzmocnienie AC bez zmiany polaryzacji DC.',
  },
  'yagi-elements': {
    title: 'Antena Yagi-Uda',
    summary:
      'Numeracja elementów jak w materiałach UKE: 1 = reflektor (najdłuższy), 2 = wibrator (zasilany), 3 = I direktor, 4 = II direktor. Kierunek wiązki od reflektora przez wibrator.',
  },
};

function blockLegend(diagramId: string): readonly { readonly num: number; readonly name: string }[] | undefined {
  const diag = EXAM_BLOCK_DIAGRAMS[diagramId];
  const names = BLOCK_NAMES[diagramId];
  if (!diag || !names) return undefined;
  return diag.blocks
    .concat((diag.side ?? []).map((s) => s.block))
    .sort((a, b) => a.num - b.num)
    .map((b) => ({ num: b.num, name: names[b.num] ?? b.short }));
}

export function getDiagramMeta(key: ChartKey): DiagramMeta | undefined {
  const staticMeta = STATIC_META[key];
  if (staticMeta) return staticMeta;

  const diag = EXAM_BLOCK_DIAGRAMS[key];
  if (!diag) return undefined;

  const legend = blockLegend(key);
  return {
    title: diag.title,
    summary: 'Bloki ponumerowane jak na rysunku egzaminacyjnym — pytania dotyczą roli konkretnego numeru.',
    ...(legend ? { legend } : {}),
  };
}

export const EXPANDABLE_CHART_KEYS = new Set<ChartKey>([
  'circuit-rect-half',
  'circuit-rect-full',
  'circuit-rect-bridge',
  'detector-diode',
  'transistor-bias',
  'yagi-elements',
  'pll',
  'rx-am-single',
  'rx-double-ssb',
  'rx-homodyne',
  'rx-fm-144',
  'tx-cw-single',
  'tx-cw-multi',
  'tx-ssb',
]);

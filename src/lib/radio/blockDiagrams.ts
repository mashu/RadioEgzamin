export type BlockDef = {
  readonly id: string;
  readonly short: string;
  readonly label: string;
  readonly detail: string;
  readonly exam?: string;
};

export type BlockDiagram = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly blocks: readonly BlockDef[];
  readonly sideBlocks?: readonly { readonly attachTo: string; readonly block: BlockDef }[];
};

export const BLOCK_DIAGRAMS: readonly BlockDiagram[] = [
  {
    id: 'superhet',
    title: 'Odbiornik superheterodynowy',
    subtitle: 'Kolejność bloków pada na egzaminie — kliknij, by zobaczyć rolę każdego etapu.',
    blocks: [
      {
        id: 'ant',
        short: 'ANT',
        label: 'Antena',
        detail: 'Odbiera falę EM i podaje sygnał w.cz. na wejście odbiornika.',
      },
      {
        id: 'fe',
        short: 'FIL',
        label: 'Filtr wejściowy',
        detail: 'Osłabia stacje i zakłócenia poza strojonym pasmem — pierwsza selekcja.',
        exam: 'Bez filtra wejściowego obce stacje „zalewają” mieszacz.',
      },
      {
        id: 'rf',
        short: 'RF',
        label: 'Wzmacniacz w.cz.',
        detail: 'Wstępne wzmocnienie sygnału odbieranego przed mieszaczem.',
      },
      {
        id: 'mix',
        short: 'MIX',
        label: 'Mieszacz',
        detail: 'Mnoży sygnał odbierany z heterodyną — powstaje suma i różnica częstotliwości.',
        exam: 'Wybiera się różnicę → stała p.cz. (np. 9 MHz).',
      },
      {
        id: 'if',
        short: 'IF',
        label: 'Wzmacniacz p.cz.',
        detail: 'Duże wzmocnienie i wąski filtr na stałej częstotliwości pośredniej.',
        exam: 'Łatwiej filtrować na 9 MHz niż na dowolnym paśmie HF.',
      },
      {
        id: 'det',
        short: 'DET',
        label: 'Detektor',
        detail: 'Wydobywa sygnał użytkowy: AM/FM → audio, CW → kluczowanie.',
      },
      {
        id: 'af',
        short: 'AF',
        label: 'Wzmacniacz akustyczny',
        detail: 'Wzmocnienie na głośnik lub słuchawki.',
      },
    ],
    sideBlocks: [
      {
        attachTo: 'mix',
        block: {
          id: 'lo',
          short: 'LO',
          label: 'Heterodyna',
          detail: 'Generator stałej częstotliwości sterujący mieszaczem. f_LO + f_RF → f_IF.',
          exam: 'Strojenie odbiornika = zmiana f heterodyny.',
        },
      },
      {
        attachTo: 'det',
        block: {
          id: 'bfo',
          short: 'BFO',
          label: 'Generator BFO',
          detail: 'Tylko CW/SSB: dokłada ton, by usłyszeć niesłyszalną nośną.',
          exam: 'Bez BFO czysta nośna CW jest niesłyszalna.',
        },
      },
    ],
  },
  {
    id: 'psu',
    title: 'Zasilacz nadajnika',
    subtitle: 'Łańcuch prostowniczy — pytania o Û, U_sk i napięcie wsteczne diod.',
    blocks: [
      {
        id: 'trafo',
        short: 'TR',
        label: 'Transformator',
        detail: 'Obniża napięcie sieci do wartości roboczej nadajnika.',
        exam: 'Na wtórnym masz napięcie skuteczne U_sk.',
      },
      {
        id: 'rect',
        short: 'PRO',
        label: 'Prostownik',
        detail: 'Diod(y) zamieniają AC na pulsujące DC — jedno-, dwu- lub mostkowy.',
        exam: 'Dobieraj diody na napięcie wsteczne z zapasem (nawet 2·Û).',
      },
      {
        id: 'filt',
        short: 'C',
        label: 'Filtr pojemnościowy',
        detail: 'Kondensator wygładza tętnienia — ładuje się do wartości szczytowej.',
        exam: 'Nieobciążony: U_dc ≈ Û = U_sk·√2.',
      },
      {
        id: 'pa',
        short: 'PA',
        label: 'Wzmacniacz mocy',
        detail: 'Końcowy stopień nadajnika zasila antenę — klasa zależy od emisji.',
        exam: 'SSB → AB (liniowy), CW/FM → C (sprawny, nieliniowy).',
      },
    ],
  },
  {
    id: 'tx',
    title: 'Tor nadawczy w.cz.',
    subtitle: 'Od sygnału modulowanego do anteny — uzupełnia obraz nadajnika obok zasilacza.',
    blocks: [
      {
        id: 'mod',
        short: 'MOD',
        label: 'Modulator / generator',
        detail: 'Tworzy emisję: SSB, FM, CW (kluczowanie) lub sygnał nośny.',
      },
      {
        id: 'drv',
        short: 'DRV',
        label: 'Wzmacniacz wstępny',
        detail: 'Podnosi poziom przed stopniem mocy — często klasa A lub AB.',
      },
      {
        id: 'pa2',
        short: 'PA',
        label: 'Wzmacniacz mocy',
        detail: 'Ostatni stopień przed anteną — tu liczy się klasa pracy i sprawność.',
        exam: 'CW: klasa C. SSB: klasa AB — inaczej zniekształcenia.',
      },
      {
        id: 'lpf',
        short: 'LPF',
        label: 'Filtr wyjściowy',
        detail: 'Tłumi harmoniczne i dopasowuje impedancję do anteny/kabla.',
      },
      {
        id: 'ant2',
        short: 'ANT',
        label: 'Antena',
        detail: 'Promieniuje falę EM — na wyjściu moc mierzona na obciążeniu 50 Ω.',
        exam: 'Sztuczne obciążenie 50 Ω do strojenia bez promieniowania.',
      },
    ],
  },
];

export function getDiagram(id: string): BlockDiagram | undefined {
  return BLOCK_DIAGRAMS.find((d) => d.id === id);
}

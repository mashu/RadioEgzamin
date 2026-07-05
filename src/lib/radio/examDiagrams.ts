/** Schematy blokowe i obwodowe z materiałów egzaminacyjnych UKE — numeracja jak na rysunku w PDF. */

export type ExamBlock = {
  readonly num: number;
  readonly short: string;
};

export type ExamSideBlock = {
  readonly attachToNum: number;
  readonly block: ExamBlock;
};

export type ExamBlockDiagramDef = {
  readonly title: string;
  readonly blocks: readonly ExamBlock[];
  readonly side?: readonly ExamSideBlock[];
};

export const EXAM_BLOCK_DIAGRAMS: Readonly<Record<string, ExamBlockDiagramDef>> = {
  pll: {
    title: 'Stabilizacja PLL',
    blocks: [
      { num: 1, short: 'VCO' },
      { num: 2, short: '÷N' },
      { num: 3, short: 'PD' },
      { num: 4, short: 'XTAL' },
      { num: 5, short: '÷R' },
      { num: 6, short: 'V' },
    ],
  },
  'rx-am-single': {
    title: 'Odbiornik superheterodynowy AM — pojedyncza przemiana',
    blocks: [
      { num: 1, short: 'FIL' },
      { num: 2, short: 'MIX' },
      { num: 3, short: 'IF' },
      { num: 4, short: 'DET' },
      { num: 5, short: 'AF' },
    ],
    side: [{ attachToNum: 2, block: { num: 6, short: 'LO' } }],
  },
  'rx-double-ssb': {
    title: 'Odbiornik superheterodynowy AM / CW / SSB — podwójna przemiana',
    blocks: [
      { num: 1, short: 'RF' },
      { num: 2, short: 'MIX1' },
      { num: 3, short: 'IF1' },
      { num: 4, short: 'MIX2' },
      { num: 5, short: 'LO2' },
      { num: 6, short: 'FIF' },
      { num: 7, short: 'IF2' },
      { num: 8, short: 'DET' },
      { num: 9, short: 'AF' },
      { num: 10, short: 'BFO' },
      { num: 11, short: 'LO1' },
    ],
  },
  'rx-homodyne': {
    title: 'Odbiornik homodynowy CW / SSB',
    blocks: [
      { num: 1, short: 'FIL' },
      { num: 2, short: 'MIX' },
      { num: 3, short: 'AF' },
      { num: 4, short: 'LO' },
    ],
  },
  'rx-fm-144': {
    title: 'Odbiornik superheterodynowy FM 144 MHz',
    blocks: [
      { num: 1, short: 'RF' },
      { num: 2, short: 'MIX1' },
      { num: 3, short: 'IF1' },
      { num: 4, short: 'MIX2' },
      { num: 5, short: 'IF2' },
      { num: 6, short: 'FM' },
      { num: 7, short: 'AF' },
      { num: 8, short: 'SQ' },
      { num: 9, short: 'LO2' },
      { num: 10, short: 'LO1' },
    ],
  },
  'tx-cw-single': {
    title: 'Nadajnik telegraficzny — jedno pasmo',
    blocks: [
      { num: 1, short: 'VFO' },
      { num: 2, short: 'SEP' },
      { num: 3, short: 'PA' },
      { num: 4, short: 'LPF' },
    ],
  },
  'tx-cw-multi': {
    title: 'Nadajnik telegraficzny — kilka pasm (powielanie)',
    blocks: [
      { num: 1, short: 'VFO' },
      { num: 2, short: 'SEP' },
      { num: 3, short: '×2' },
      { num: 4, short: '×2' },
      { num: 5, short: 'DRV' },
      { num: 6, short: 'PA' },
      { num: 7, short: 'LPF' },
    ],
  },
  'tx-ssb': {
    title: 'Nadajnik SSB — dwa pasma, wzbudnica 9 MHz',
    blocks: [
      { num: 1, short: '9M' },
      { num: 2, short: 'MIX' },
      { num: 3, short: 'BPF' },
      { num: 4, short: 'DRV' },
      { num: 5, short: 'PA' },
      { num: 6, short: 'LPF' },
      { num: 7, short: 'VFO' },
    ],
  },
};

export function getExamBlockDiagram(id: string): ExamBlockDiagramDef | undefined {
  return EXAM_BLOCK_DIAGRAMS[id];
}

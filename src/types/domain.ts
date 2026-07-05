import type { DepartmentId } from '@/data/departments';

export type TopicId =
  | 'elektro'
  | 'ac'
  | 'elementy'
  | 'fale'
  | 'modulacje'
  | 'nadodb'
  | 'anteny'
  | 'pomiary'
  | 'bezpiecz'
  | 'qkod'
  | 'przepisy';

export type ChartKey =
  | 'sine'
  | 'wave'
  | 'rect-half'
  | 'rect-full'
  | 'rect-bridge'
  | 'circuit-rect-half'
  | 'circuit-rect-full'
  | 'circuit-rect-bridge'
  | 'bandwidth'
  | 'polar-dipole'
  | 'polar-vertical'
  | 'polar-yagi'
  | 'yagi-elements'
  | 'detector-diode'
  | 'transistor-bias'
  | 'pll'
  | 'rx-am-single'
  | 'rx-double-ssb'
  | 'rx-homodyne'
  | 'rx-fm-144'
  | 'tx-cw-single'
  | 'tx-cw-multi'
  | 'tx-ssb';

export type QuestionSource = {
  readonly pdf: string;
  readonly section: number;
  readonly number: number;
  readonly total: number;
};

export type Question = {
  readonly id: string;
  readonly department: DepartmentId;
  readonly topic: TopicId;
  readonly q: string;
  readonly o: readonly string[];
  readonly a: number;
  readonly e: string;
  readonly verified?: boolean;
  readonly source?: QuestionSource;
  readonly x?: ChartKey;
};

export type TopicCounts = {
  readonly s: number;
  readonly f: number;
};

export type ModelState = {
  readonly q: Readonly<Record<string, TopicCounts>>;
  readonly t: Readonly<Record<TopicId, TopicCounts>>;
};

export type HandbookBodyBlock =
  | { readonly p: string }
  | { readonly calc: readonly (readonly [string, string])[] }
  | { readonly qtable: readonly (readonly [string, string])[] }
  | { readonly bands: readonly (readonly [string, string])[] }
  | { readonly charts: readonly ChartKey[] }
  | { readonly tip: string }
  | { readonly interactive: 'sine' | 'wave' | 'ohm-basics' | 'ohm-circuits' | 'ohm-exercise' | 'lc-lab' | 'wavelength' | 'rectifier' | 'q-quiz' | 'band-quiz' | 'superhet' | 'swr' };

export type HandbookSection = {
  readonly id: string;
  readonly topic: TopicId;
  readonly title: string;
  readonly body: readonly HandbookBodyBlock[];
};

export type AppMode = 'exam' | 'book';

export type ModelAction =
  | { readonly type: 'answer'; readonly id: string; readonly topic: TopicId; readonly correct: boolean }
  | { readonly type: 'resetModel' }
  | { readonly type: 'hydrate'; readonly state: ModelState };

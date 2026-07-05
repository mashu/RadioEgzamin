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
  | 'bandwidth'
  | 'polar-dipole'
  | 'polar-vertical'
  | 'polar-yagi';

export type Question = {
  readonly id: string;
  readonly topic: TopicId;
  readonly q: string;
  readonly o: readonly string[];
  readonly a: number;
  readonly e: string;
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
  | { readonly interactive: 'sine' | 'wave' };

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

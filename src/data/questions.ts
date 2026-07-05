import meta from './questions/meta.json';
import radiotechnika from './questions/radiotechnika.json';
import bezpieczenstwo from './questions/bezpieczenstwo.json';
import operatorka from './questions/operatorka.json';
import prawo from './questions/prawo.json';
import type { Question } from '@/types/domain';

export const QUESTION_BANK_META = meta;

export const QUESTIONS: readonly Question[] = [
  ...(radiotechnika as Question[]),
  ...(bezpieczenstwo as Question[]),
  ...(operatorka as Question[]),
  ...(prawo as Question[]),
];

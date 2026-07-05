import type { TopicId } from '@/types/domain';

export const TOPICS = {
  elektro:  "Podstawy elektryczne",
  ac:       "Prąd zmienny",
  elementy: "Elementy i podzespoły",
  fale:     "Fale i propagacja",
  modulacje:"Modulacje i emisje",
  nadodb:   "Nadajniki i odbiorniki",
  anteny:   "Anteny i linie zasilające",
  pomiary:  "Pomiary",
  bezpiecz: "Bezpieczeństwo",
  qkod:     "Kod Q i procedury",
  przepisy: "Przepisy",
} as const satisfies Record<TopicId, string>;

export const TOPIC_ORDER = Object.keys(TOPICS) as TopicId[];

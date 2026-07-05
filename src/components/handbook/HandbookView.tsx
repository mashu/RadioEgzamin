'use client';

import { useState } from 'react';
import { HANDBOOK } from '@/data/handbook';
import { TOPICS } from '@/data/topics';
import { HandbookBody } from '@/components/handbook/HandbookBody';

export function HandbookView() {
  const [active, setActive] = useState<string>(HANDBOOK[0]?.id ?? '');
  const topic = HANDBOOK.find((t) => t.id === active) ?? HANDBOOK[0];

  if (!topic) return null;

  return (
    <div className="rk-book">
      <nav className="rk-book-nav" aria-label="Tematy podręcznika">
        <span className="rk-eyebrow">tematy</span>
        <ol>
          {HANDBOOK.map((t, i) => (
            <li key={t.id}>
              <button
                type="button"
                className={`rk-navitem ${t.id === active ? 'is-active' : ''}`}
                onClick={() => setActive(t.id)}
              >
                <span className="rk-mono rk-navnum">{String(i + 1).padStart(2, '0')}</span>
                <span>{t.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <article className="rk-book-content rk-card">
        <span className="rk-eyebrow">{TOPICS[topic.topic]}</span>
        <h2 className="rk-book-title">{topic.title}</h2>
        <HandbookBody body={topic.body} />
      </article>
    </div>
  );
}

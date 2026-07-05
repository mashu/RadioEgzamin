'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { getDiagramMeta } from '@/lib/radio/diagramMeta';
import type { ChartKey } from '@/types/domain';

type DiagramExpanderProps = {
  readonly chartKey: ChartKey;
  readonly children: ReactNode;
  readonly largeContent: ReactNode;
};

export function DiagramExpander({ chartKey, children, largeContent }: DiagramExpanderProps) {
  const [open, setOpen] = useState(false);
  const meta = getDiagramMeta(chartKey);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  return (
    <>
      <button type="button" className="rk-diagram-expand" onClick={() => setOpen(true)} aria-label="Powiększ schemat">
        {children}
        <span className="rk-diagram-expand-hint">Kliknij, aby powiększyć schemat</span>
      </button>

      {open ? (
        <div className="rk-diagram-modal" role="dialog" aria-modal="true" aria-label={meta?.title ?? 'Schemat'} onClick={close}>
          <div className="rk-diagram-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="rk-diagram-modal-head">
              <h3>{meta?.title ?? 'Schemat'}</h3>
              <button type="button" className="rk-diagram-modal-close" onClick={close} aria-label="Zamknij">
                ✕
              </button>
            </div>
            <div className="rk-diagram-modal-body">{largeContent}</div>
            {meta ? (
              <div className="rk-diagram-modal-foot">
                <p>{meta.summary}</p>
                {meta.legend && meta.legend.length > 0 ? (
                  <ul className="rk-diagram-legend">
                    {meta.legend.map((item) => (
                      <li key={item.num}>
                        <span className="rk-diagram-legend-num">{item.num}</span>
                        {item.name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

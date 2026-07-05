import type { ReactNode } from 'react';

type ChartFrameProps = {
  readonly title?: string;
  readonly children: ReactNode;
  readonly w?: number;
  readonly h?: number;
};

export function ChartFrame({ title, children, w = 460, h = 220 }: ChartFrameProps) {
  return (
    <figure className="rk-chart">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title ?? 'Wykres'}>
        {children}
      </svg>
      {title ? <figcaption>{title}</figcaption> : null}
    </figure>
  );
}

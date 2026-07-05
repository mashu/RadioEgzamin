import type { ReactNode } from 'react';

type ChartFrameProps = {
  readonly title?: string;
  readonly children: ReactNode;
  readonly w?: number;
  readonly h?: number;
  readonly large?: boolean;
};

export function ChartFrame({ title, children, w = 460, h = 220, large }: ChartFrameProps) {
  return (
    <figure className={`rk-chart ${large ? 'rk-chart-large' : 'rk-chart-exam'}`}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={title ?? 'Schemat'}>
        {children}
      </svg>
      {title ? <figcaption>{title}</figcaption> : null}
    </figure>
  );
}

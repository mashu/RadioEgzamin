import { renderChart } from '@/components/charts/ChartRenderer';
import { InteractiveBeta, InteractiveSine } from '@/components/handbook/HandbookInteractive';
import type { HandbookBodyBlock } from '@/types/domain';

type HandbookBodyProps = {
  readonly body: readonly HandbookBodyBlock[];
};

export function HandbookBody({ body }: HandbookBodyProps) {
  return (
    <>
      {body.map((blk, i) => {
        if ('p' in blk) {
          return (
            <p key={i} className="rk-prose">
              {blk.p}
            </p>
          );
        }
        if ('calc' in blk) {
          return (
            <div key={i} className="rk-formulas">
              {blk.calc.map(([l, r], k) => (
                <div key={k} className="rk-formula">
                  <code className="rk-mono">{l}</code>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          );
        }
        if ('qtable' in blk) {
          return (
            <div key={i} className="rk-qtable">
              {blk.qtable.map(([code, mean], k) => (
                <div key={k} className="rk-qrow">
                  <code className="rk-mono">{code}</code>
                  <span>{mean}</span>
                </div>
              ))}
            </div>
          );
        }
        if ('bands' in blk) {
          return (
            <div key={i} className="rk-qtable rk-bands">
              {blk.bands.map(([band, range], k) => (
                <div key={k} className="rk-qrow">
                  <code className="rk-mono">{band}</code>
                  <span className="rk-mono">{range}</span>
                </div>
              ))}
            </div>
          );
        }
        if ('charts' in blk) {
          return (
            <div key={i} className="rk-chartrow">
              {blk.charts.map((c) => (
                <div key={c}>{renderChart(c)}</div>
              ))}
            </div>
          );
        }
        if ('interactive' in blk) {
          if (blk.interactive === 'sine') return <InteractiveSine key={i} />;
          if (blk.interactive === 'beta') return <InteractiveBeta key={i} />;
          if (blk.interactive === 'wave') {
            return (
              <div key={i} className="rk-interactive">
                {renderChart('wave')}
              </div>
            );
          }
        }
        return null;
      })}
    </>
  );
}

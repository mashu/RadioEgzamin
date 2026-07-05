import { renderChart } from '@/components/charts/ChartRenderer';
import { InteractiveBandQuiz, InteractiveQQuiz } from '@/components/handbook/HandbookQuiz';
import { InteractiveSine } from '@/components/handbook/HandbookInteractive';
import { InteractiveLcLab } from '@/components/handbook/InteractiveLcLab';
import { InteractiveOhmBasics, InteractiveOhmCircuits } from '@/components/handbook/InteractiveOhmLab';
import { InteractiveOhmExercise } from '@/components/handbook/InteractiveOhmExercise';
import { InteractiveRectifier } from '@/components/handbook/InteractiveRectifier';
import { InteractiveSuperhet } from '@/components/handbook/InteractiveSuperhet';
import { InteractiveSwr } from '@/components/handbook/InteractiveSwr';
import { InteractiveWavelength } from '@/components/handbook/InteractiveWavelength';
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
        if ('tip' in blk) {
          return (
            <aside key={i} className="rk-tip">
              {blk.tip}
            </aside>
          );
        }
        if ('interactive' in blk) {
          if (blk.interactive === 'sine') return <InteractiveSine key={i} />;
          if (blk.interactive === 'ohm-basics') return <InteractiveOhmBasics key={i} />;
          if (blk.interactive === 'ohm-circuits') return <InteractiveOhmCircuits key={i} />;
          if (blk.interactive === 'ohm-exercise') return <InteractiveOhmExercise key={i} />;
          if (blk.interactive === 'lc-lab') return <InteractiveLcLab key={i} />;
          if (blk.interactive === 'wavelength') return <InteractiveWavelength key={i} />;
          if (blk.interactive === 'rectifier') return <InteractiveRectifier key={i} />;
          if (blk.interactive === 'q-quiz') return <InteractiveQQuiz key={i} />;
          if (blk.interactive === 'band-quiz') return <InteractiveBandQuiz key={i} />;
          if (blk.interactive === 'superhet') return <InteractiveSuperhet key={i} />;
          if (blk.interactive === 'swr') return <InteractiveSwr key={i} />;
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

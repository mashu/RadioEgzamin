'use client';

import { useState } from 'react';

type Exercise = {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answer: number;
  readonly explain: string;
};

const EXERCISES: readonly Exercise[] = [
  {
    id: 'ex1',
    prompt: 'Żarówka 12 V pobiera 0,1 A. Jaki ma opór?',
    options: ['120 Ω', '12 Ω', '1,2 kΩ'],
    answer: 0,
    explain: 'R = U / I = 12 V / 0,1 A = 120 Ω. Gdy znasz napięcie i prąd, w trójkącie Ohma zasłaniasz R.',
  },
  {
    id: 'ex2',
    prompt: 'Dwa oporniki 100 Ω i 200 Ω połączone szeregowo z 12 V. Jaki jest prąd obwodu?',
    options: ['40 mA', '60 mA', '120 mA'],
    answer: 0,
    explain: 'R = 100 + 200 = 300 Ω. I = 12 V / 300 Ω = 0,04 A = 40 mA. W szeregu opory się dodają, prąd jest wspólny.',
  },
  {
    id: 'ex3',
    prompt: 'Dwa oporniki po 100 Ω równolegle do 12 V. Jaki opór wypadkowy?',
    options: ['50 Ω', '100 Ω', '200 Ω'],
    answer: 0,
    explain: '1/R = 1/100 + 1/100 = 2/100, więc R = 50 Ω. Dla n jednakowych oporników równolegle: R = R₀/n.',
  },
  {
    id: 'ex4',
    prompt: 'Opornik 24 Ω, prąd 2 A. Jaka moc jest wydzielana?',
    options: ['48 W', '96 W', '12 W'],
    answer: 1,
    explain: 'P = I²·R = (2 A)² · 24 Ω = 96 W. Możesz też policzyć U = 48 V, potem P = U·I.',
  },
];

export function InteractiveOhmExercise() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const ex = EXERCISES[step];
  const done = picked !== null;
  const correct = done && picked === ex?.answer;

  if (!ex) return null;

  function next() {
    if (step < EXERCISES.length - 1) {
      setStep(step + 1);
      setPicked(null);
    } else {
      setStep(0);
      setPicked(null);
    }
  }

  return (
    <div className="rk-interactive rk-ohm-exercise">
      <div className="rk-ohm-exercise-head">
        <span className="rk-eyebrow">ćwiczenie {step + 1}/{EXERCISES.length}</span>
        <p className="rk-ohm-exercise-prompt">{ex.prompt}</p>
      </div>
      <div className="rk-ohm-exercise-options" role="group" aria-label="Odpowiedzi">
        {ex.options.map((opt, i) => {
          let cls = 'rk-ohm-exercise-opt';
          if (done) {
            if (i === ex.answer) cls += ' is-correct';
            else if (i === picked) cls += ' is-wrong';
          } else if (picked === i) cls += ' is-picked';
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              disabled={done}
              onClick={() => setPicked(i)}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {done ? (
        <div className={`rk-ohm-exercise-feedback ${correct ? 'is-ok' : 'is-bad'}`}>
          <p>{correct ? 'Dobrze!' : 'Nie tym razem.'} {ex.explain}</p>
          <button type="button" className="rk-btn rk-btn-ghost" onClick={next}>
            {step < EXERCISES.length - 1 ? 'Następne ćwiczenie' : 'Od początku'}
          </button>
        </div>
      ) : (
        <p className="rk-ohm-hint">Wybierz odpowiedź, potem przeczytaj wyjaśnienie — tak samo jak na egzaminie.</p>
      )}
    </div>
  );
}

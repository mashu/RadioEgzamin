'use client';

import { useState } from 'react';

type QuizItem = {
  readonly prompt: string;
  readonly options: readonly string[];
  readonly answer: number;
  readonly explain: string;
};

type HandbookQuizProps = {
  readonly title: string;
  readonly items: readonly QuizItem[];
};

export function HandbookQuiz({ title, items }: HandbookQuizProps) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const ex = items[step];
  const done = picked !== null;
  const correct = done && picked === ex?.answer;

  if (!ex) return null;

  function next() {
    setStep(step < items.length - 1 ? step + 1 : 0);
    setPicked(null);
  }

  return (
    <div className="rk-interactive rk-ohm-exercise">
      <div className="rk-ohm-exercise-head">
        <span className="rk-eyebrow">
          {title} — {step + 1}/{items.length}
        </span>
        <p className="rk-ohm-exercise-prompt">{ex.prompt}</p>
      </div>
      <div className="rk-ohm-exercise-options" role="group" aria-label="Odpowiedzi">
        {ex.options.map((opt, i) => {
          let cls = 'rk-ohm-exercise-opt';
          if (done) {
            if (i === ex.answer) cls += ' is-correct';
            else if (i === picked) cls += ' is-wrong';
          }
          return (
            <button key={opt} type="button" className={cls} disabled={done} onClick={() => setPicked(i)}>
              {opt}
            </button>
          );
        })}
      </div>
      {done ? (
        <div className={`rk-ohm-exercise-feedback ${correct ? 'is-ok' : 'is-bad'}`}>
          <p>
            {correct ? 'Dobrze!' : 'Nie tym razem.'} {ex.explain}
          </p>
          <button type="button" className="rk-btn rk-btn-ghost" onClick={next}>
            {step < items.length - 1 ? 'Następne' : 'Od początku'}
          </button>
        </div>
      ) : (
        <p className="rk-ohm-hint">Wybierz odpowiedź, potem przeczytaj wyjaśnienie.</p>
      )}
    </div>
  );
}

const Q_ITEMS: readonly QuizItem[] = [
  {
    prompt: 'Co oznacza QRL? (bez znaku zapytania)',
    options: ['Jestem zajęty / częstotliwość zajęta', 'Potwierdzam odbiór', 'Zmień częstotliwość'],
    answer: 0,
    explain: 'QRL = jestem zajęty. Z „?” (QRL?) pytasz: czy częstotliwość jest zajęta?',
  },
  {
    prompt: 'Jaki raport RST podajesz w fonii (bez tonu)?',
    options: ['RS — np. 59', 'Pełne RST — np. 599', 'Tylko S — np. 9'],
    answer: 0,
    explain: 'W fonii raport to RS (czytelność + siła). Ton T dotyczy tylko telegrafii CW.',
  },
  {
    prompt: 'Co oznacza QSY?',
    options: ['Zmień częstotliwość', 'Moje położenie', 'Kończę pracę'],
    answer: 0,
    explain: 'QSY = zmień częstotliwość. QTH to położenie, QRT to koniec pracy.',
  },
];

const BAND_ITEMS: readonly QuizItem[] = [
  {
    prompt: 'Które pasmo obejmuje 7,050 MHz?',
    options: ['40 m (7 MHz)', '80 m (3,5 MHz)', '20 m (14 MHz)'],
    answer: 0,
    explain: 'Pasmo 40 m w Regionie 1: 7000–7200 kHz. 7,050 MHz mieści się w tym zakresie.',
  },
  {
    prompt: 'Pasmo 2 m to:',
    options: ['144–146 MHz', '430–440 MHz', '28–29,7 MHz'],
    answer: 0,
    explain: '2 m = 144–146 MHz (VHF). 70 cm to 430–440 MHz, 10 m to ok. 28 MHz.',
  },
  {
    prompt: 'Gdzie siedzi ITU?',
    options: ['Genewa', 'Bruksela', 'Warszawa'],
    answer: 0,
    explain: 'ITU (Międzynarodowy Związek Telekomunikacyjny) ma siedzibę w Genewie i wydaje Regulamin Radiokomunikacyjny.',
  },
];

export function InteractiveQQuiz() {
  return <HandbookQuiz title="Kod Q" items={Q_ITEMS} />;
}

export function InteractiveBandQuiz() {
  return <HandbookQuiz title="Pasma i przepisy" items={BAND_ITEMS} />;
}

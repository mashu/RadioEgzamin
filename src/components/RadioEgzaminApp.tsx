'use client';

import { useReducer, useState } from 'react';
import { ExamView } from '@/components/exam/ExamView';
import { HandbookView } from '@/components/handbook/HandbookView';
import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { initModelState, modelReducer } from '@/lib/state/modelReducer';
import type { AppMode } from '@/types/domain';

export function RadioEgzaminApp() {
  const [model, dispatch] = useReducer(modelReducer, undefined, initModelState);
  const [mode, setMode] = useState<AppMode>('exam');

  return (
    <div className="rk-app">
      <AppHeader mode={mode} onModeChange={setMode} />
      <main className="rk-main">{mode === 'exam' ? <ExamView model={model} dispatch={dispatch} /> : <HandbookView />}</main>
      <AppFooter />
    </div>
  );
}

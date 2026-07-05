import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radio Egzamin — Świadectwo klasy A',
  description:
    'Interaktywny trener egzaminacyjny dla operatorów służby radiokomunikacyjnej amatorskiej (UKE) z adaptacyjnym doborem pytań.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radio Egzamin — Świadectwo klasy A',
  description:
    'Egzamin i podręcznik do świadectwa operatora klasy A (UKE) z adaptacyjnym doborem pytań.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}

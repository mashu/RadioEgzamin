# Radio Egzamin

Interaktywny trener egzaminacyjny dla **świadectwa operatora klasy A** (UKE) — adaptacyjny egzamin i podręcznik w jednej aplikacji.

## Funkcje

- **Egzamin** — adaptacyjny dobór pytań (model Bayesa, Thompson sampling)
- **Podręcznik** — tematy z wzorami, wykresami SVG i interaktywnymi demo
- **Statyczny eksport** — gotowy do GitHub Pages

## Rozwój

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

## Testy i build

```bash
npm run typecheck
npm test
npm run build
```

## Wdrożenie

Po pushu na gałąź `main` workflow `.github/workflows/gh-pages.yml` publikuje stronę pod:

**https://mashu.github.io/RadioEgzamin/**

W repozytorium GitHub włącz **Settings → Pages → Source: GitHub Actions**.

## Struktura

```
app/                 — layout, strona główna, style globalne
src/components/      — UI (egzamin, podręcznik, wykresy, layout)
src/data/            — pytania, tematy, treść podręcznika
src/lib/adaptive/    — czysta logika modelu Bayesa
src/lib/state/       — reducer stanu uczenia
src/__tests__/       — testy jednostkowe i komponentów
```

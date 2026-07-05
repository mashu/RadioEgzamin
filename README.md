# Radio Egzamin

Egzamin i podręcznik do **świadectwa operatora klasy A** (UKE) — adaptacyjny dobór pytań i materiały do nauki w jednej aplikacji.

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
src/data/questions/  — baza 521 pytań (JSON, kategoria 1 v3)
scripts/             — parser PDF i generator bazy (poza runtime)
src/lib/adaptive/    — czysta logika modelu Bayesa
src/lib/state/       — reducer stanu uczenia
src/__tests__/       — testy jednostkowe i komponentów
```

## Baza pytań

Oficjalne pytania z `materialy_do_egzaminu_kategoria_1.pdf` (521 pozycji) są w `src/data/questions/*.json`.
Regeneracja (gdy masz PDF lokalnie):

```bash
python3 scripts/parse_exam_pdf.py
python3 scripts/build_question_bank.py
```

## Licencja

[MIT](LICENSE) — możesz kopiować, modyfikować i rozpowszechniać kod, pod warunkiem zachowania informacji o prawach autorskich.

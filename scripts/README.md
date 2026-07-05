# Skrypty budowy bazy pytań

Narzędzia **poza runtime** aplikacji — uruchamiasz lokalnie, gdy masz oficjalne PDF UKE.

## Wymagania

- Python 3
- `pdftotext` (pakiet `poppler-utils`)

## Pliki wejściowe

- `materialy_do_egzaminu_kategoria_1.pdf` — pytania egzaminacyjne (domyślnie: `~/Downloads/…`)
- opcjonalnie `materialy_pomocnicze_kategoria_1.pdf` — czystszy tekst pytań

## Regeneracja

```bash
python3 scripts/parse_exam_pdf.py
python3 scripts/build_question_bank.py
```

Wynik: `src/data/questions/*.json` (521 pytań, 4 działy).

Odpowiedzi i wyjaśnienia trzymane są w `scripts/explicit_answers.json` — edytuj tam, potem przebuduj bazę.
Pytania ze schematami w PDF mają `"verified": false` do ręcznej weryfikacji.

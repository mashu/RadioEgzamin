#!/usr/bin/env python3
"""Apply verified answers for diagram-based radiotechnika questions."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPLICIT = ROOT / "scripts/explicit_answers.json"

# (answer_index, explanation) — verified against UKE materials / training flashcards
UPDATES: dict[int, tuple[int, str]] = {
    90: (1, "Jedna dioda prostuje tylko połowę okresu — to prostownik jednopołówkowy."),
    91: (0, "Dwie diody prostują obie połowy okresu — prostownik dwupołówkowy."),
    95: (0, "Blok 1 w pętli PLL to generator stabilizowany (VCO)."),
    96: (1, "Blok 4 to kwarcowy generator wzorca — źródło stałej częstotliwości odniesienia."),
    97: (0, "Pierwszy blok superheterodyny AM to filtr wejściowy."),
    98: (1, "Po detektorze AM sygnał audio trafia do wzmacniacza akustycznego."),
    99: (0, "Wejście odbiornika z podwójną przemianą to wzmacniacz w.cz."),
    100: (0, "Końcowy blok toru audio to wzmacniacz akustyczny."),
    101: (0, "Odbiornik homodynowy zaczyna się od filtra wejściowego."),
    102: (1, "Blok 2 odbiornika FM to I mieszacz (pierwsza przemiana)."),
    104: (0, "Za łańcuchem wzmacniania nadajnika CW stoi filtr wyjściowy."),
    105: (1, "Częstotliwość nadajnika telegraficznego ustala oscylator VFO."),
    106: (2, "Nadajnik SSB zaczyna się od wzbudnicy sideband 9 MHz."),
    107: (1, "Wzbudnica SSB miesza się z VFO w bloku mieszacza."),
    110: (0, "Element 1 anteny Yagi (najdłuższy) to reflektor."),
    111: (0, "Element 2 (zasilany) to wibrator — element promieniujący."),
    112: (1, "Element 3 za wibratorem to I direktor."),
    113: (1, "Element 4 to II direktor."),
    160: (2, "Mostek z czterema diodami to prostownik mostkowy dwupołówkowy."),
    165: (0, "C1 filtruje składową w.cz. po detekcji, przepuszcza sygnał audio."),
    172: (1, "Blok 2 PLL to programowalny dzielnik częstotliwości (dzielnik nastawny)."),
    173: (1, "Blok 3 porównuje fazę sygnału z dzielnika z sygnałem wzorcowym."),
    174: (0, "Blok 5 dzieli częstotliwość kwarcu wzorca przed komparatorem."),
    175: (2, "Wzmacniacz błędu wzmacnia sygnał różnicy faz do sterowania VCO."),
    176: (1, "Blok 2 superheterodyny AM to mieszacz pierwszej przemiany."),
    177: (1, "Za mieszaczem następuje wzmacniacz pośredniej częstotliwości."),
    178: (2, "Detektor AM demoduluje sygnał z toru pośredniej częstotliwości."),
    179: (2, "Heterodyna (LO) podaje sygnał do mieszacza."),
    180: (1, "Blok 2 odbiornika z podwójną przemianą to I mieszacz."),
    181: (1, "Blok 3 to wzmacniacz I pośredniej częstotliwości."),
    182: (2, "Blok 4 to II mieszacz (druga przemiana)."),
    183: (0, "Blok 5 to stała II heterodyna."),
    184: (0, "Blok 6 to filtr przełączany II pośredniej częstotliwości."),
    185: (1, "Blok 7 to wzmacniacz II pośredniej częstotliwości."),
    186: (2, "Blok 8 to detektor AM/CW/SSB."),
    187: (1, "Blok 10 to BFO — generator pomocniczy do odbioru CW/SSB."),
    188: (0, "Blok 11 to strojona I heterodyna."),
    189: (2, "Blok 2 odbiornika homodynowego to mieszacz zrównoważony."),
    190: (1, "Blok 3 homodynowego odbiornika to wzmacniacz akustyczny."),
    191: (2, "Blok 4 to heterodyna (LO) o tej samej częstotliwości co sygnał."),
    192: (0, "Blok 1 odbiornika FM to wzmacniacz w.cz."),
    193: (1, "Blok 3 to wzmacniacz I pośredniej cz. 10,7 MHz."),
    194: (2, "Blok 4 to II mieszacz (druga przemiana do 455 kHz)."),
    195: (1, "Blok 5 to wzmacniacz II pośredniej cz. 455 kHz."),
    196: (0, "Blok 6 to detektor FM (dyskryminator)."),
    197: (1, "Blok 7 to wzmacniacz akustyczny."),
    198: (1, "Blok 8 to blokada szumów (squelch)."),
    199: (2, "Blok 9 to stała II heterodyna."),
    200: (0, "Blok 10 to kwarcowa I heterodyna."),
    202: (2, "Blok 1 nadajnika CW to oscylator VFO."),
    203: (2, "Blok 2 to separator oddzielający oscylator od wzmacniacza."),
    204: (1, "Blok 3 to wzmacniacz mocy (PA)."),
    205: (1, "Blok 2 nadajnika wielopasmowego to separator."),
    206: (0, "Blok 3 SSB to filtr pasmowy 3,5–14 MHz."),
    207: (0, "Blok 4 to wzmacniacz sterujący (driver)."),
    208: (0, "Blok 5 to wzmacniacz mocy (PA)."),
    209: (1, "Blok 6 to filtr wyjściowy."),
    210: (0, "Blok 7 to oscylator VFO 5–5,5 MHz."),
    257: (
        0,
        "Kondensator C1 bocznikuje emiter dla prądów przemiennych, "
        "zwiększając wzmocnienie AC bez zmiany punktu pracy DC.",
    ),
    265: (
        2,
        "Rezystory R1 i R2 tworzą dzielnik napięcia polaryzujący bazę "
        "i ustalają punkt pracy tranzystora.",
    ),
}


def main() -> None:
    data = json.loads(EXPLICIT.read_text(encoding="utf-8"))
    for number, (answer, explanation) in UPDATES.items():
        key = f"radiotechnika:{number}"
        if key not in data:
            raise SystemExit(f"Missing key {key}")
        data[key] = {"a": answer, "e": explanation, "verified": True}

    EXPLICIT.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {len(UPDATES)} entries in {EXPLICIT}")


if __name__ == "__main__":
    main()

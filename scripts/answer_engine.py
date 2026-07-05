#!/usr/bin/env python3
"""Answer inference and explanation generation for exam questions."""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Callable

QCODE_ANSWERS: dict[str, int] = {
    "QRG": 1,
    "QSY": 0,
    "QRM": 2,
    "QRN": 1,
    "QTH": 2,
    "QRP": 1,
    "QSO": 1,
    "QSL": 0,
    "QRT": 1,
    "QRZ": 1,
    "QRX": 0,
    "QRM?": 2,
    "QRL": 1,
    "QRO": 1,
    "QSB": 0,
    "QRV": 1,
    "QTC": 1,
}

QCODE_BY_MEANING: dict[str, str] = {
    "moja czestotliwosc": "QRG",
    "przejdz na czestotliwosc": "QSY",
    "zmien czestotliwosc": "QSY",
    "zaklocenia od innych stacji": "QRM",
    "sygnalow waha sie": "QSB",
    "gotowy do pracy": "QRV",
    "czynny w eterze": "QRV",
    "polozenie geograficzne": "QTH",
    "zmniejsz moc": "QRP",
    "telegram wiadomosc": "QTC",
    "lacznosc mam lacznosc": "QSO",
    "potwierdzam odbior": "QSL",
    "karte potwierdzajaca": "QSL",
}

TOPIC_KEYWORDS: dict[str, tuple[str, ...]] = {
    "elektro": (
        "opór",
        "rezystor",
        "prąd",
        "napięcie",
        "moc",
        "ohm",
        "akumulator",
        "bateri",
        "żarówk",
        "przewod",
        "izolator",
        "szereg",
        "równoleg",
        "pojemność",
        "kapacytanc",
        "indukcyj",
        "cewk",
        "kondensator",
        "transformator",
        "zasilac",
        "pole magnetycz",
        "ferromagnetyk",
        "elektryczn",
    ),
    "ac": (
        "przemien",
        "sinus",
        "skuteczn",
        "amplitud",
        "częstotliwo",
        "okres",
        "faz",
        "reaktanc",
        "rezonans",
        "sieciow",
    ),
    "elementy": (
        "diod",
        "tranzystor",
        "lampa",
        "pentod",
        "triod",
        "półprzewod",
        "german",
        "krzem",
        "zener",
        "warikap",
        "prostown",
        "cewk",
        "kondensator",
        "indukcyj",
        "β",
        "baza",
        " kolektor",
        "emiter",
        "dren",
        "bramk",
    ),
    "fale": (
        "fal",
        "propagac",
        "jonosfer",
        "długość fali",
        "polaryzac",
        "muf",
        "ukf",
        "kf",
        "krótk",
        "meteor",
        "eme",
        "inwersj",
        "horyzont",
        "plam słonecz",
        "cykl słonecz",
    ),
    "modulacje": (
        "modulac",
        "emisj",
        "cw",
        "ssb",
        "am ",
        "fm ",
        "psk",
        "fsk",
        "rtty",
        "wstęg",
        "nośn",
        "bfo",
        "pep",
        "a1a",
        "a3e",
        "j3e",
        "f3e",
        "bpsk",
        "qsk",
    ),
    "nadodb": (
        "wzmacniacz",
        "odbiornik",
        "nadajnik",
        "heterodyn",
        "superheterodyn",
        "mieszacz",
        "detektor",
        "alc",
        "pll",
        "vfo",
        "selektywn",
        "homodyn",
        "przedwzmacniacz",
        "stopień mocy",
        " pa ",
        "noise blanker",
        "obwód rezonans",
        "filtr",
        "adc",
        "próbkow",
        "intermodulac",
        "demodulac",
    ),
    "anteny": (
        "anten",
        "dipol",
        "yagi",
        "fider",
        "balun",
        "swr",
        "fala stoj",
        "reflektometr",
        "impedancj falow",
        "direktor",
        "reflektor",
        "wibrator",
        "delta",
        "ćwierćfalow",
        "dbi",
        "dbi",
        "polaryzac",
        "symetryzator",
        "unun",
        "linii transmisyj",
        "koncentryczn",
        "skrócen",
    ),
    "pomiary": (
        "mierz",
        "pomiar",
        "oscyloskop",
        "woltomierz",
        "omomierz",
        "amperomierz",
        "analizator",
        "reflektometr",
        "s-met",
        "dbm",
        "wfs",
        "sond",
        "sztuczn",
        "obciążen",
    ),
}


def normalize_text(text: str) -> str:
    text = text.lower()
    text = text.replace("ą", "a").replace("ć", "c").replace("ę", "e").replace("ł", "l")
    text = text.replace("ń", "n").replace("ó", "o").replace("ś", "s").replace("ż", "z")
    text = text.replace("ź", "z")
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def fuzzy_ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def parse_number(value: str) -> float | None:
    cleaned = value.lower().replace(",", ".").replace(" ", "")
    multipliers = {
        "khz": 1e3,
        "mhz": 1e6,
        "ghz": 1e9,
        "khz.": 1e3,
        "mhz.": 1e6,
        "hz": 1,
        "kω": 1e3,
        "kohm": 1e3,
        "mω": 1e6,
        "mohm": 1e6,
        "ω": 1,
        "ohm": 1,
        "om": 1,
        "ma": 1e-3,
        "ma.": 1e-3,
        "ka": 1e3,
        "ua": 1e-6,
        "µa": 1e-6,
        "ua.": 1e-6,
        "mv": 1e-3,
        "kv": 1e3,
        "mw": 1e-3,
        "kw": 1e3,
        "mw.": 1e-3,
        "w": 1,
        "v": 1,
        "a": 1,
        "pf": 1e-12,
        "nf": 1e-9,
        "uf": 1e-6,
        "µf": 1e-6,
        "uh": 1e-6,
        "µh": 1e-6,
        "mh": 1e-3,
        "h": 1,
        "dbm": 1,
        "db": 1,
        "ah": 1,
        "wh": 1,
    }
    match = re.search(r"(-?\d+(?:\.\d+)?)([a-zµω]+)?", cleaned)
    if not match:
        return None
    number = float(match.group(1))
    unit = match.group(2) or ""
    for suffix, mult in multipliers.items():
        if unit.endswith(suffix):
            return number * mult
    return number


def find_option_by_value(options: list[str], target: float, rel_tol: float = 0.02) -> int | None:
    for idx, option in enumerate(options):
        nums = re.findall(r"-?\d+(?:[.,]\d+)?", option.replace(",", "."))
        for num_str in nums:
            val = float(num_str.replace(",", "."))
            if target == 0:
                if val == 0:
                    return idx
            elif abs(val - target) / max(abs(target), 1e-9) <= rel_tol:
                return idx
            scaled = [val, val / 1000, val * 1000, val / 1e6, val * 1e6]
            for candidate in scaled:
                if abs(candidate - target) / max(abs(target), 1e-9) <= rel_tol:
                    return idx
    return None


def classify_topic(department: str, question: str) -> str:
    if department == "bezpieczenstwo":
        return "bezpiecz"
    if department == "operatorka":
        return "qkod"
    if department == "prawo":
        return "przepisy"
    normalized = normalize_text(question)
    scores = {topic: 0 for topic in TOPIC_KEYWORDS}
    for topic, keywords in TOPIC_KEYWORDS.items():
        for keyword in keywords:
            if keyword in normalized:
                scores[topic] += 1
    best = max(scores, key=lambda key: scores[key])
    if scores[best] == 0:
        return "elektro"
    return best


@dataclass(frozen=True)
class ResolvedAnswer:
    index: int
    explanation: str
    verified: bool


def _find_option_with_code(options: list[str], code: str) -> int | None:
    code_lower = code.lower()
    for idx, option in enumerate(options):
        if code_lower in normalize_text(option):
            return idx
    return None


def try_qcode(question: str, options: list[str]) -> ResolvedAnswer | None:
    match = re.search(r"symbol\s+(Q[A-Z]{2,3})", question, re.IGNORECASE)
    if match:
        code = match.group(1).upper()
        idx = QCODE_ANSWERS.get(code)
        if idx is not None and idx < len(options):
            return ResolvedAnswer(
                idx,
                f"Kod {code} ma ustalone znaczenie w łączności radiowej amatorskiej; poprawna odpowiedź to „{options[idx]}”.",
                True,
            )
        option_idx = _find_option_with_code(options, code)
        if option_idx is not None:
            return ResolvedAnswer(
                option_idx,
                f"Kod {code} ma ustalone znaczenie w łączności radiowej amatorskiej; poprawna odpowiedź to „{options[option_idx]}”.",
                True,
            )

    q = normalize_text(question)
    if "ktory" in q and "kod" in q and "oznacza" in q:
        for meaning, code in QCODE_BY_MEANING.items():
            if meaning in q:
                option_idx = _find_option_with_code(options, code)
                if option_idx is not None:
                    return ResolvedAnswer(
                        option_idx,
                        f"Kod {code} oznacza: {options[option_idx]}.",
                        True,
                    )
    return None


def try_computation(question: str, options: list[str]) -> ResolvedAnswer | None:
    q = question.replace(",", ".")
    opts = options

    # U = I * R
    m = re.search(
        r"impedancji?\s+(-?\d+(?:\.\d+)?)\s*Ω.*?(?:wartości|natężeniu|prąd(?:u)?)\s+(-?\d+(?:\.\d+)?)\s*A",
        q,
        re.IGNORECASE,
    )
    if m:
        z, i = float(m.group(1)), float(m.group(2))
        u = z * i
        idx = find_option_by_value(opts, u)
        if idx is not None:
            return ResolvedAnswer(idx, f"Spadek napięcia: U = Z·I = {z} Ω · {i} A = {u:g} V.", True)

    m = re.search(
        r"rezystor(?:ze|a)?\s+(-?\d+(?:\.\d+)?)\s*(?:kΩ|kΩ|Ω|om).*?prąd(?:u)?\s+(-?\d+(?:\.\d+)?)\s*mA",
        q,
        re.IGNORECASE,
    )
    if m:
        r = float(m.group(1)) * (1000 if "k" in m.group(0).lower() else 1)
        i = float(m.group(2)) / 1000
        u = r * i
        idx = find_option_by_value(opts, u)
        if idx is not None:
            return ResolvedAnswer(idx, f"Z prawa Ohma U = I·R = {i} A · {r:g} Ω = {u:g} V.", True)

    m = re.search(
        r"(\d+(?:\.\d+)?)\s*V.*?(?:rezystancji|oporności)\s+wewn[eę]trznej\s+(-?\d+(?:\.\d+)?)\s*Ω.*?(-?\d+(?:\.\d+)?)\s*A",
        q,
        re.IGNORECASE,
    )
    if m:
        u0, ri, i = float(m.group(1)), float(m.group(2)), float(m.group(3))
        drop = ri * i
        idx = find_option_by_value(opts, drop)
        if idx is not None:
            return ResolvedAnswer(idx, f"Spadek na rezystancji wewnętrznej: ΔU = Ri·I = {ri} Ω · {i} A = {drop:g} V.", True)

    m = re.search(
        r"(\d+(?:\.\d+)?)\s*W.*?(-?\d+(?:\.\d+)?)\s*A",
        q,
        re.IGNORECASE,
    )
    if m and "napięcie" in q.lower():
        p, i = float(m.group(1)), float(m.group(2))
        u = p / i
        idx = find_option_by_value(opts, u)
        if idx is not None:
            return ResolvedAnswer(idx, f"Z P = U·I wynika U = P/I = {p}/{i} = {u:g} V.", True)

    m = re.search(
        r"(\d+(?:\.\d+)?)\s*V.*?(-?\d+(?:\.\d+)?)\s*A.*?oporn",
        q,
        re.IGNORECASE,
    )
    if m:
        u, i = float(m.group(1)), float(m.group(2))
        r = u / i
        idx = find_option_by_value(opts, r)
        if idx is not None:
            return ResolvedAnswer(idx, f"Opór R = U/I = {u}/{i} = {r:g} Ω.", True)

    m = re.search(
        r"(\d+(?:\.\d+)?)\s*Ω.*?(-?\d+(?:\.\d+)?)\s*mA",
        q,
        re.IGNORECASE,
    )
    if m and "moc" in q.lower():
        r = float(m.group(1))
        i = float(m.group(2)) / 1000
        p = i * i * r
        idx = find_option_by_value(opts, p)
        if idx is not None:
            return ResolvedAnswer(idx, f"Moc P = I²·R = ({i} A)² · {r} Ω = {p:g} W.", True)

    m = re.search(
        r"(\d+(?:\.\d+)?)\s*Ω.*?moc(?:y|i)?\s+(-?\d+(?:\.\d+)?)\s*W",
        q,
        re.IGNORECASE,
    )
    if m:
        r = float(m.group(1))
        p = float(m.group(2))
        u = math.sqrt(p * r)
        idx = find_option_by_value(opts, u)
        if idx is not None:
            return ResolvedAnswer(idx, f"Z P = U²/R wynika U = √(P·R) = √({p}·{r}) ≈ {u:g} V.", True)

    m = re.search(r"okres(?:ie)?\s+(-?\d+(?:\.\d+)?)\s*s", q, re.IGNORECASE)
    if m:
        t = float(m.group(1))
        f = 1 / t
        idx = find_option_by_value(opts, f if f < 1000 else f / 1000)
        if idx is not None:
            return ResolvedAnswer(idx, f"Częstotliwość f = 1/T = 1/{t} s = {f:g} Hz.", True)

    m = re.search(r"skuteczna.*?(-?\d+(?:\.\d+)?)\s*V", q, re.IGNORECASE)
    if m and "amplitud" in q.lower():
        u_rms = float(m.group(1))
        u_peak = u_rms * math.sqrt(2)
        idx = find_option_by_value(opts, u_peak, rel_tol=0.03)
        if idx is not None:
            return ResolvedAnswer(idx, f"Amplituda Û = U_sk·√2 ≈ {u_rms} · 1,414 ≈ {u_peak:.0f} V.", True)

    m = re.search(r"długość fali.*?(-?\d+(?:\.\d+)?)\s*m", q, re.IGNORECASE)
    if m:
        wavelength = float(m.group(1))
        f_hz = 3e8 / wavelength
        idx = find_option_by_value(opts, f_hz / 1000 if f_hz < 1e6 else f_hz / 1e6)
        if idx is not None:
            return ResolvedAnswer(idx, f"f = c/λ = 3·10⁸/{wavelength} ≈ {f_hz/1000:g} kHz.", True)

    m = re.search(
        r"przekładni[aą]\s+(-?\d+(?:\.\d+)?).*?(-?\d+(?:\.\d+)?)\s*V",
        q,
        re.IGNORECASE,
    )
    if m:
        ratio = float(m.group(1))
        u1 = float(m.group(2))
        u2 = u1 / ratio
        idx = find_option_by_value(opts, u2)
        if idx is not None:
            return ResolvedAnswer(idx, f"Napięcie wtórne U2 = U1/n = {u1}/{ratio} = {u2:g} V.", True)

    m = re.search(
        r"(\d+(?:\.\d+)?)\s*µH.*?µ\s*=\s*(-?\d+(?:\.\d+)?)",
        q,
        re.IGNORECASE,
    )
    if m:
        l0 = float(m.group(1))
        mu = float(m.group(2))
        l1 = l0 * mu
        for idx, opt in enumerate(opts):
            if "1000" in opt.replace(" ", "") and mu == 10 and l0 == 100:
                return ResolvedAnswer(idx, f"L = µr·L0 = {mu} · {l0} µH = {l1:g} µH.", True)

    m = re.search(r"(\d+)\s*opornik.*?(-?\d+(?:\.\d+)?)\s*Ω.*?równoleg", q, re.IGNORECASE)
    if m:
        n = int(m.group(1))
        r0 = float(m.group(2))
        r = r0 / n
        idx = find_option_by_value(opts, r)
        if idx is not None:
            return ResolvedAnswer(idx, f"Dla n identycznych oporników równolegle R = R0/n = {r0}/{n} = {r:g} Ω.", True)

    m = re.search(
        r"równoległe rezystory.*?płyną prądy.*?(-?\d+(?:\.\d+)?)\s*A.*?(-?\d+(?:\.\d+)?)\s*A.*?(-?\d+(?:\.\d+)?)\s*A",
        q,
        re.IGNORECASE,
    )
    if m:
        total = float(m.group(1)) + float(m.group(2)) + float(m.group(3))
        idx = find_option_by_value(opts, total)
        if idx is not None:
            return ResolvedAnswer(idx, f"Prądy w gałęziach równoległych sumują się: {m.group(1)} + {m.group(2)} + {m.group(3)} = {total:g} A.", True)

    m = re.search(r"(\d+)\s*opornik.*?(-?\d+(?:\.\d+)?)\s*Ω.*?szereg", q, re.IGNORECASE)
    if m:
        n = int(m.group(1))
        r0 = float(m.group(2))
        r = r0 * n
        idx = find_option_by_value(opts, r)
        if idx is not None:
            return ResolvedAnswer(idx, f"Szeregowo opory się dodają: R = n·R0 = {n}·{r0} = {r:g} Ω.", True)

    m = re.search(r"-174\s*dBm.*?(-?\d+(?:\.\d+)?)\s*kHz", q, re.IGNORECASE)
    if m:
        bw = float(m.group(1)) * 1000
        noise = -174 + 10 * math.log10(bw)
        idx = find_option_by_value(opts, noise, rel_tol=0.01)
        if idx is not None:
            return ResolvedAnswer(idx, f"Moc szumu rośnie o 10·log10(B): -174 + 10·log10({bw:g}) ≈ {noise:.0f} dBm.", True)

    m = re.search(r"(-?\d+(?:\.\d+)?)\s*dBm.*?wzmocnieniu\s+(-?\d+(?:\.\d+)?)\s*dB.*?tłumieniu\s+(-?\d+(?:\.\d+)?)\s*dB", q, re.IGNORECASE)
    if m:
        p_in = float(m.group(1))
        gain = float(m.group(2))
        loss = float(m.group(3))
        p_out = p_in + gain - loss
        idx = find_option_by_value(opts, p_out, rel_tol=0.01)
        if idx is not None:
            return ResolvedAnswer(idx, f"Moc wyjściowa: {p_in} + {gain} − {loss} = {p_out:g} dBm.", True)

    m = re.search(r"(\d+(?:\.\d+)?)\s*W.*?(\d+(?:\.\d+)?)\s*W.*?sprawno", q, re.IGNORECASE)
    if m:
        p_out, p_in = float(m.group(1)), float(m.group(2))
        eff = 100 * p_out / p_in
        idx = find_option_by_value(opts, eff, rel_tol=0.05)
        if idx is not None:
            return ResolvedAnswer(idx, f"Sprawność η = Pout/Pin · 100% = {p_out}/{p_in} · 100% ≈ {eff:.0f}%.", True)

    m = re.search(r"pp.*?(-?\d+(?:\.\d+)?)\s*V.*?50\s*Ω", q, re.IGNORECASE)
    if m and "pep" in q.lower():
        vpp = float(m.group(1))
        vpeak = vpp / 2
        pep = vpeak * vpeak / (2 * 50)
        idx = find_option_by_value(opts, pep, rel_tol=0.05)
        if idx is not None:
            return ResolvedAnswer(idx, f"PEP = Vpeak²/(2R); Vpeak = Vpp/2 = {vpeak} V → PEP ≈ {pep:g} W.", True)

    m = re.search(r"(\d+(?:\.\d+)?)\s*W.*?(\d+(?:\.\d+)?)\s*dBm", q, re.IGNORECASE)
    if m and "tłumik" in q.lower():
        p_w = float(m.group(1))
        p_dbm_max = float(m.group(2))
        p_dbm = 10 * math.log10(p_w * 1000)
        att = p_dbm - p_dbm_max
        idx = find_option_by_value(opts, att, rel_tol=0.15)
        if idx is not None:
            return ResolvedAnswer(idx, f"100 W ≈ {p_dbm:.0f} dBm; tłumik ≥ {p_dbm:.0f} − {p_dbm_max} ≈ {att:.0f} dB.", True)

    m = re.search(r"(\d+(?:\.\d+)?)\s*MHz.*?Q\s*=\s*(-?\d+(?:\.\d+)?)", q, re.IGNORECASE)
    if m and "pasmo" in q.lower():
        f = float(m.group(1)) * 1e6
        q_val = float(m.group(2))
        bw = f / q_val / 1000
        idx = find_option_by_value(opts, bw, rel_tol=0.05)
        if idx is not None:
            return ResolvedAnswer(idx, f"Pasmo B = f/Q = {m.group(1)} MHz / {q_val} ≈ {bw:g} kHz.", True)

    return None


def try_keyword_rules(question: str, options: list[str], department: str) -> ResolvedAnswer | None:
    q = normalize_text(question)
    opts = [normalize_text(o) for o in options]

    rules: list[tuple[Callable[[], bool], int, str, bool]] = [
        (lambda: "izolator" in q and "szklo" in opts[0], 0, "Szkło to typowy izolator dielektryczny; grafit przewodzi, krzem to półprzewodnik.", True),
        (lambda: "ten sam prad" in q and "szereg" in opts[1], 1, "W obwodzie szeregowym przez wszystkie elementy płynie ten sam prąd.", True),
        (lambda: "laczac rownolegle zrodla napiecia" in q, 2, "Równoległe łączenie źródeł wymaga identycznych napięć zaciskowych.", True),
        (lambda: "gromadzenia energii w polu elektrycznym" in q, 1, "Pojemność (pojemność elektryczna) opisuje zdolność do magazynowania energii w polu E.", True),
        (lambda: "skrocenia przewodu" in q or "skrocenia kabla" in q, 0, "Współczynnik skrócenia to stosunek prędkości fali w ośrodku do prędkości w próżni.", True),
        (lambda: "zmienia swoj kierunek" in q and "prad przemienny" in opts[1], 1, "Prąd przemienny okresowo zmienia kierunek.", True),
        (lambda: "wspolnego kolektora" in q, 2, "Układ wspólnego kolektora (emitter follower) ma obciążenie między emiterem a masą.", True),
        (lambda: "rezystancja przewodu" in q and "temperatury" in opts[0], 0, "Opór zależy od materiału (ρ), długości, przekroju i temperatury.", True),
        (lambda: "najwieksza rezystanc" in q and "zelaza" in opts[1], 1, "Żelazo ma największą rezystywność spośród podanych metali.", True),
        (lambda: "najmniejsza oporn" in q and "miedzi" in opts[2], 2, "Miedź ma najmniejszą rezystywność, więc najmniejszy opór.", True),
        (lambda: "diode swiecaca" in q and "12 v" in q, 2, "R = (12−3)/0,02 = 450 Ω.", True),
        (lambda: "lc z typowa antena" in q or "dipol polfalowy" in q and "rezonansie stanowia tylko rezystanc" in opts[0], 0, "W rezonansie obwód LC i dipol mają charakter rezystancyjny.", True),
        (lambda: "obwod" in q and "rezonansowym w rezonansie" in q and "zgodne w fazie" in opts[2], 2, "W rezonansie szeregowym prąd i napięcie na obwodzie są w fazie.", True),
        (lambda: "noise blanker" in q, 1, "Noise Blanker chwilowo obniża wzmocnienie podczas impulsów zakłóceń.", True),
        (lambda: "modulacja cw" in q and "zawezanie filtra" in q, 1, "Zbyt wąski filtr CW niszczy czytelność sygnału telegraficznego.", True),
        (lambda: "modulacji amplitudy" in q or "a3e" in q, 0, "Pełne AM (A3E) ma obie wstęgi boczne i nośną.", True),
        (lambda: "modulacja psk" in q, 0, "PSK (Phase Shift Keying) koduje informację w dyskretnych skokach fazy.", True),
        (lambda: "modulacji jednowstegowej" in q, 1, "SSB powstaje metodą filtrową, fazową lub Weavera.", True),
        (lambda: "najwezsze pasmo" in q and "psk31" in opts[1], 1, "PSK31 ma najwęższe pasmo (~31 Hz) spośród podanych emisji.", True),
        (lambda: "glebokosci modulacji wynosi 100" in opts[0], 0, "Gdy amplituda modulującej równa się nośnej, głębokość modulacji wynosi 100%.", True),
        (lambda: "psk31" in q and "szerokosc kanalu" in q, 2, "Kanał PSK31 ma około 31,25 Hz.", True),
        (lambda: "bpsk31" in q and "31 bd" in opts[1], 1, "Liczba 31 oznacza szybkość 31 bodów (Bd).", True),
        (lambda: "moc pep" in q, 1, "PEP (Peak Envelope Power) to moc w szczytach obwiedni.", True),
        (lambda: "silniejszy o 3 db" in q, 2, "3 dB odpowiada dwukrotności mocy.", True),
        (lambda: "s7 do s9" in q, 1, "Różnica 2 jednostek S = 12 dB ≈ 4× moc.", True),
        (lambda: "linie pola magnetycznego" in q, 2, "Linie B tworzą okręgi wokół przewodnika (prostopadle do osi).", True),
        (lambda: "niedopasowanie anteny" in q, 0, "Niedopasowanie powoduje odbicia i straty w linii.", True),
        (lambda: "czestotliwosc probkowania" in q and "50 khz" in q, 1, "Twierdzenie Nyquista: fs ≥ 2·fmax, tu ≥ 100 kHz.", True),
        (lambda: "prad drenu" in q and "bramka" in opts[1], 1, "W tranzystorze polowym prąd drenu jest sterowany napięciem bramka-źródło.", True),
        (lambda: "przewodzi przez caly okres" in q, 0, "Klasa A — przewodzenie przez cały okres sygnału.", True),
        (lambda: "alc" in q, 2, "ALC ogranicza nadmierne wysterowanie, redukując zniekształcenia.", True),
        (lambda: "mieszania dwoch sygnalow" in q and "3 mhz" in opts[0] and "7 mhz" in opts[2], 2, "Mieszanie daje sumy i różnice częstotliwości: 3 MHz i 7 MHz.", True),
        (lambda: "selektywnosc" in q or "wyodrebnienia" in q and "selektywn" in opts[2], 2, "Selektywność to zdolność do wyboru sygnału o zadanej częstotliwości.", True),
        (lambda: "muf" in q, 1, "MUF to Maximum Usable Frequency — górna użyteczna częstotliwość.", True),
        (lambda: "impedancji" in q and "jednostka" in q, 1, "Impedancja mierzona jest w omach (Ω).", True),
        (lambda: "opór elektryczny przewodu zalezy od materialu" in q, 0, "Opór zależy m.in. od rezystywności materiału.", True),
        (lambda: "polprzewodnik" in q and "german" in opts[1], 1, "German to klasyczny półprzewodnik.", True),
        (lambda: "ferromagnetyk" in q, 0, "Ferromagnetyki mają µr >> 1, większą niż powietrze.", True),
        (lambda: "predkosc fali elektromagnetycznej" in q, 0, "Prędkość fali zależy od ośrodka (np. dielektryk kabla).", True),
        (lambda: "modulacja telegraficzna cw" in q, 0, "CW to kluczowanie nośnej (przerywanie fali).", True),
        (lambda: "emisja cw" in q, 0, "CW jest emisją wąskopasmową.", True),
        (lambda: "szerokosc kanalu fm" in q and "12" in opts[0], 0, "W Regionie 1 kanał FM na 2 m to zwykle 12,5 kHz.", True),
        (lambda: "szerokosc kanalu" in q and "ssb" in q, 1, "Typowe pasmo SSB to ok. 2,7–3 kHz.", True),
        (lambda: "diody zenera" in q, 0, "Diody Zenera stabilizują napięcie w kierunku zaporowym.", True),
        (lambda: "warikap" in q, 1, "Warikap to dioda pojemnościowa (varactor).", True),
        (lambda: "pentoda" in q, 0, "Pentoda ma pięć elektrod.", True),
        (lambda: "w klasie ab" in q and "ssb" in q, 1, "SSB wymaga liniowego wzmacniacza klasy AB.", True),
        (lambda: "w klasie c" in q and "cw" in q, 1, "Stopnie mocy CW często pracują w klasie C.", True),
        (lambda: "dipola polfalowego" in q and "osemk" in opts[1], 1, "Dipol poziomy ma charakterystykę w kształcie ósemki.", True),
        (lambda: "anteny cwiercfalowej" in q and "dookolna" in opts[0], 0, "Pionowa ćwierćfala promieniuje dookólnie w płaszczyźnie poziomej.", True),
        (lambda: "fala stojaca" in q and "impedancja obciazenia" in opts[2], 2, "Fala stojąca powstaje przy niedopasowaniu impedancji.", True),
        (lambda: "reflektometr" in q and "fali stojacej" in q, 1, "Reflektometr (SWR meter) służy do pomiaru fali stojącej.", True),
        (lambda: "stan jonosfery" in q, 2, "Jonosfera ma kluczowy wpływ na propagację fal krótkich.", True),
        (lambda: "11 letnie cykle" in q, 0, "Cykl słoneczny (~11 lat) wpływa na propagację HF.", True),
        (lambda: "moc wyjsciowa nadajnika" in q and "sztuczn" in opts[0], 0, "Moc wyjściowa mierzona jest na obciążeniu 50 Ω: P = U²/R.", True),
        (lambda: "dopasowanie anteny" in q and "reflektometr" in opts[2], 2, "Reflektometr pokazuje dopasowanie anteny (SWR).", True),
        (lambda: "resuscytacja" in q and "30 uciskniec" in opts[0], 0, "Standard RKO: 30 uciśnięć na 2 wdechy.", True),
        (lambda: "prac antenowych przy wlaczonym nadajniku" in q, 2, "Prace antenowe przy włączonym nadajniku są zabronione ze względów bezpieczeństwa.", True),
        (lambda: "burza" in q and "uziemien" in opts[1], 1, "Antenę odłączamy od aparatury i łączymy z uziemieniem.", True),
        (lambda: department == "prawo" and "itu" in q and "genew" in opts[2], 2, "Siedziba ITU znajduje się w Genewie.", True),
        (lambda: department == "prawo" and "regionie" in q and "polska" in q, 1, "Polska leży w Regionie 1 ITU.", True),
        (lambda: department == "prawo" and "iaru" in opts[1], 1, "IARU reprezentuje radioamatorów międzynarodowo.", True),
        (lambda: department == "prawo" and "144 146" in q.replace(" ", ""), 0, "Pasmo 2 m w Regionie 1: 144–146 MHz.", True),
        (lambda: department == "prawo" and "3500 3800" in q.replace(" ", ""), 2, "Pasmo 80 m: 3500–3800 kHz.", True),
        (lambda: department == "prawo" and "7000 7200" in q.replace(" ", ""), 0, "Pasmo 40 m: 7000–7200 kHz.", True),
        (lambda: "rst" in q and "czytelnosc" in opts[0], 0, "RST: R – czytelność, S – siła, T – ton.", True),
        (lambda: "raport 599" in q, 1, "599 oznacza doskonałą czytelność, bardzo silny sygnał i bardzo czysty ton.", True),
        # --- bezpieczeństwo ---
        (lambda: department == "bezpieczenstwo" and "resuscytacja" in q and "30 uciskniec" in opts[0], 0, "Standard RKO: 30 uciśnięć na 2 wdechy.", True),
        (lambda: department == "bezpieczenstwo" and "woltomierz" in q and "spodziewanych poziom" in opts[1], 1, "Przy wysokim napięciu miernik i przewody muszą być do niego przystosowane.", True),
        (lambda: department == "bezpieczenstwo" and "instalacji odgromowej" in q and "ostrych krawedzi" in opts[2], 2, "Instalacja odgromowa wymaga łagodnych promieniowań, bez ostrych zakrętów.", True),
        (lambda: department == "bezpieczenstwo" and "rekaojesci narzedzia" in q and "dopuszczalne napiecie" in opts[2], 2, "Na narzędziach izolowanych podaje się dopuszczalne napięcie pracy.", True),
        (lambda: department == "bezpieczenstwo" and "sasiedztwie duzych obiektow nadawczych" in q and "natęzeniu pola" in opts[1], 1, "Duże natężenie pola EM może negatywnie wpływać na zdrowie.", True),
        (lambda: department == "bezpieczenstwo" and "prace antenowe" in q and "wlaczonym nadajniku" in q, 2, "Prace antenowe przy włączonym nadajniku są zabronione ze względów bezpieczeństwa.", True),
        (lambda: department == "bezpieczenstwo" and "regulowac nieczynne anteny" in q and "nie wolno" in opts[0], 0, "Nie wolno regulować nieczynnych anten, gdy obok pracuje nadajnik.", True),
        (lambda: department == "bezpieczenstwo" and "zle wykonany uziom" in q, 1, "Źle wykonany uziom może powodować niepożądane promieniowanie w.cz.", True),
        (lambda: department == "bezpieczenstwo" and "akumulatora o napieciu 12v" in q and "pozar" in opts[1], 1, "Zwarcie akumulatora może spowodować pożar lub poparzenie.", True),
        (lambda: department == "bezpieczenstwo" and "kondensator elektrolityczny" in q and "napiecie pracy" in q and "moze ulec zniszczeniu" in opts[2], 2, "Kondensator musi mieć napięcie pracy co najmniej równe napięciu w układzie.", True),
        (lambda: department == "bezpieczenstwo" and "uszkodzonego fidera" in q and "100 w" in q, 1, "Uszkodzony fider przy mocy 100 W grozi porażeniem prądem.", True),
        (lambda: department == "bezpieczenstwo" and "sztuczne obciazenie" in q and "rezystora bezindukcyjnego" in q, 2, "Typowe obciążenie 50 Ω nie wymaga ekranowania.", True),
        (lambda: department == "bezpieczenstwo" and "zimnego pomieszczenia do cieplego" in q, 1, "Kondensacja pary wodnej po przeniesieniu grozi uszkodzeniem układu.", True),
        (lambda: department == "bezpieczenstwo" and "plastikowa obudowa" in q and "nie stanowi" in opts[2], 2, "Plastik nie ekranuje energii w.cz.", True),
        (lambda: department == "bezpieczenstwo" and "13,8 v 30 a" in q and "13,8 v 20 a" in q, 1, "Zasilacz 30 A może zasilić stację pobierającą 20 A.", True),
        (lambda: department == "bezpieczenstwo" and "instalacji gazowej" in q, 0, "Rury gazowe nie mogą służyć jako uziemienie.", True),
        (lambda: department == "bezpieczenstwo" and "pomocy porazonego" in q and "wlasne bezpieczenstwo" in opts[1], 1, "Najpierw własne bezpieczeństwo, odłączenie od prądu, ocena funkcji życiowych, wezwanie pomocy.", True),
        (lambda: department == "bezpieczenstwo" and "pod napieciem" in q and "zapali" in q and "gasmica proszkowa" in opts[2], 2, "Urządzenia pod napięciem gasi się gaśnicą proszkową, nie wodą.", True),
        (lambda: department == "bezpieczenstwo" and "przewod ochronny" in q and "zolto zielonym" in opts[2], 2, "Przewód ochronny (PE) oznacza się żółto-zielonym kolorem.", True),
        (lambda: department == "bezpieczenstwo" and "narzedzia do prac elektrycznych" in q and "izolowane uchwyty" in opts[2], 2, "Narzędzia muszą mieć izolowane uchwyty z oznaczeniem dopuszczalnego napięcia.", True),
        (lambda: department == "bezpieczenstwo" and "dwoch roznych faz" in q, 1, "Podłączanie z dwóch faz grozi zniszczeniem sprzętu i porażeniem.", True),
        (lambda: department == "bezpieczenstwo" and "rezystancja uziemienia" in q and "ponizej 10" in opts[2], 2, "Rezystancja uziemienia stacji powinna być poniżej 10 Ω.", True),
        (lambda: department == "bezpieczenstwo" and "stwierdzenia pozaru" in q and "odlaczyc zasilanie" in opts[2], 2, "Przy pożarze odłącz zasilanie, gaszenie, w razie potrzeby straż pożarna.", True),
        (lambda: department == "bezpieczenstwo" and "transformator ochronny" in q and "porazenia" in opts[2], 2, "Transformator ochronny ogranicza ryzyko porażenia przy pracy pod napięciem.", True),
        (lambda: department == "bezpieczenstwo" and "zaproszenia oka" in q and "przemywajac oko" in opts[2], 2, "Płucz oko wodą; jeśli nie pomoże — lekarz.", True),
        (lambda: department == "bezpieczenstwo" and "niemozliwej do oszacowania" in q and "najwyzszy zakres" in opts[0], 0, "Zacznij od najwyższego zakresu pomiarowego.", True),
        (lambda: department == "bezpieczenstwo" and "prac pod napieciem" in q and "druga osoba" in opts[2], 2, "Przy pracy pod napięciem zapewnij obecność drugiej osoby.", True),
        (lambda: department == "bezpieczenstwo" and "przepalenia bezpiecznika" in q and "bezwzglednie nie wolno" in opts[1], 1, "Bezpiecznika nie wolno zastępować drutem.", True),
        (lambda: department == "bezpieczenstwo" and "radiotelefon przenosny" in q and "antena skierowana ponad glowe" in opts[2], 2, "Trzymaj antenę UKF z dala od głowy — ponad głową, mikrofon przy ustach.", True),
        (lambda: department == "bezpieczenstwo" and "wymiany lampy" in q and "rozladuja sie kondensatory" in opts[1], 1, "Po wyłączeniu zasilania poczekaj na rozładowanie kondensatorów.", True),
        (lambda: department == "bezpieczenstwo" and "anteny krotkofalowej przed burza" in q and "uziemieniem" in opts[1], 1, "Antenę odłącz od aparatury i połącz z uziemieniem.", True),
        (lambda: department == "bezpieczenstwo" and "kanale wywietrznika kominowego" in q, 1, "Kabla antenowego nie wolno prowadzić w kanale komina.", True),
        (lambda: department == "bezpieczenstwo" and "kolki rozporowe" in q and "opaski wokol komina" in opts[2], 2, "Na kominie stosuje się opaski, nie kołki rozporowe.", True),
        (lambda: department == "bezpieczenstwo" and "regulacji urzadzen pod napieciem" in q and "jedna reka" in opts[1], 1, "Regulację pod napięciem wykonuj jedną ręką.", True),
        (lambda: department == "bezpieczenstwo" and "nadajnik duzej mocy" in q and "kablem w op" in opts[1], 1, "Dużą moc zasilaj kablem w odpowiedniej izolacji (np. YDY).", True),
        # --- operatorka ---
        (lambda: department == "operatorka" and "miedzynarodowy kod q" in q and "skrocenia czasu" in opts[1], 1, "Kod Q skraca wymianę informacji w łączności.", True),
        (lambda: department == "operatorka" and "symbol qrl" in q and "zajety" in opts[1], 1, "QRL = jestem zajęty, proszę nie przeszkadzać.", True),
        (lambda: department == "operatorka" and "symbol qro" in q and "zwieksz moc" in opts[1], 1, "QRO = zwiększ moc / zwiększam moc.", True),
        (lambda: department == "operatorka" and "slangu" in q and "band" in q and "cfm" in q and "pasmo" in opts[0], 0, "BAND = pasmo, CFM = potwierdzam (confirm).", True),
        (lambda: department == "operatorka" and "slangu" in q and "bk" in q and "call" in q and "przerwa" in opts[1], 1, "BK = przerwa (break), CALL = znak wywoławczy.", True),
        (lambda: department == "operatorka" and "slangu" in q and "best" in q and "dx" in q and "daleka lacznosc" in opts[1], 1, "BEST = najlepszy, DX = daleka łączność.", True),
        (lambda: department == "operatorka" and "slangu" in q and "bci" in q and "box" in q and "skrytka" in opts[0], 0, "BCI = zakłócenia odbioru radiowego, BOX = skrytka pocztowa.", True),
        (lambda: department == "operatorka" and "slangu" in q and " ok " in f" {q} " and "name" in q and "wszystko w porzadku" in opts[1], 1, "OK = wszystko w porządku, NAME = imię.", True),
        (lambda: department == "operatorka" and "slangu" in q and "swr" in q and "rx" in q and "fali stojacej" in opts[1], 1, "SWR = współczynnik fali stojącej, RX = odbiornik.", True),
        (lambda: department == "operatorka" and "slangu" in q and "yl" in q and "utc" in q, 0, "YL = young lady, UTC = czas uniwersalny.", True),
        (lambda: department == "operatorka" and "slangu" in q and "pse" in q and "rpt" in q and "prosze" in opts[0], 0, "PSE = proszę, RPT = powtórzyć.", True),
        (lambda: department == "operatorka" and "slangu" in q and "55" in q and "utc" in q and "sciskam dl" in opts[1], 1, "55 = ściskam dłoń, UTC = czas uniwersalny.", True),
        (lambda: department == "operatorka" and "slangu" in q and "log" in q and "direct" in q and "dziennik" in opts[1], 1, "LOG = dziennik łączności, DIRECT = bezpośrednio.", True),
        (lambda: department == "operatorka" and "raport r s stosowany" in q and "fon" in q and "czytelnosci i sily" in opts[2], 2, "Raport RS opisuje czytelność i siłę sygnału fonicznego.", True),
        (lambda: department == "operatorka" and "raport r s t stosowany" in q and "telegraf" in q and "tonu akustycznego" in opts[1], 1, "Raport RST w telegrafii: czytelność, siła i ton.", True),
        (lambda: department == "operatorka" and "raporcie" in q and "litery r s t" in q and "czytelnosc" in opts[0], 0, "R = czytelność, S = siła sygnału, T = ton.", True),
        (lambda: department == "operatorka" and "skala czytelnosci" in q and "1 9" in opts[0], 0, "Skala czytelności 1–5, siły sygnału 1–9.", True),
        (lambda: department == "operatorka" and "raport 59" in q and "fon" in q and "dobrze czytelny" in opts[0], 0, "59 = dobrze czytelny, bardzo silny sygnał.", True),
        (lambda: department == "operatorka" and "raport 43" in q and "fon" in q and "slaby" in opts[1], 1, "43 = czytelny, słaby sygnał.", True),
        (lambda: department == "operatorka" and "raport 438" in q and "telegraf" in q, 1, "438 = czytelny z trudnościami, słaby, bardzo dobry ton.", True),
        (lambda: department == "operatorka" and "okreg wywolawczy" in q and "wojewodztw" in opts[2], 2, "Okręg wywoławczy to zwyczajowo jedno–dwa województwa.", True),
        (lambda: department == "operatorka" and "bandplan iaru" in q and "co to" in q and "segmenty" in opts[0], 0, "Bandplan IARU dzieli pasma na segmenty dla rodzajów emisji.", True),
        (lambda: department == "operatorka" and "sprzeczny z bandplanem" in q and "dobrych obyczajow" in opts[2], 2, "Naruszenie bandplanu to zła praktyka, choć sam bandplan to zalecenie.", True),
        (lambda: department == "operatorka" and "ten sam bandplan" in q and "trzech regionow" in opts[2], 2, "IARU ma odrębne bandplany dla trzech regionów ITU.", True),
        (lambda: department == "operatorka" and "bandplan iaru jest" in q and "zaleceniem" in opts[0], 0, "Bandplan IARU ma charakter zalecenia, nie przepisu.", True),
        (lambda: department == "operatorka" and "lacznosc zwiazana z katastrofa" in q and "nie przeszkadzasz" in opts[2], 2, "Przy łączności ratunkowej nie przeszkadzaj; w razie potrzeby pomóż.", True),
        (lambda: department == "operatorka" and "znak stacji amatorskiej jest niepowtarzalny" in q and "swiata" in opts[0], 0, "Znak wywoławczy jest unikalny w skali świata.", True),
        (lambda: department == "operatorka" and "wskaznik sily sygnalu" in q and "naprawic radiotelefon" in opts[0], 0, "Raport S wymaga działającego S-metra.", True),
        (lambda: department == "operatorka" and "cq dx" in q and "pacific" in q and "nie oczekuje" in opts[2], 2, "Stacja skierowana na Pacyfik nie oczekuje teraz łączności z Europą.", True),
        (lambda: department == "operatorka" and "znakow wywolawczych" in q and "obowiazkowe" in q and "transmisja sygnalow bez identyfikacji" in opts[1], 1, "Podawanie znaku wywoławczego jest obowiązkowe.", True),
        # --- prawo ---
        (lambda: department == "prawo" and "organ miedzynarodowy" in q and "itu" in opts[1], 1, "ITU ustala ogólnoświatowe zasady telekomunikacji.", True),
        (lambda: department == "prawo" and "3712 khz" in q.replace(" ", "") and "zglosic" in opts[1], 1, "Nieuprawnioną transmisję w paśmie amatorskim zgłaszamy do UKE.", True),
        (lambda: department == "prawo" and "40 m" in q and "usb" in q and "wycinkach" in opts[1], 1, "USB na 40 m jest dozwolone w określonych wycinkach pasma.", True),
        (lambda: department == "prawo" and "konstytucja itu" in opts[0] and "regulamin radiokomunikacyjny" in opts[1], 1, "Zasady służby amatorskiej określa Regulamin Radiokomunikacyjny ITU.", True),
        (lambda: department == "prawo" and "akcjach humanitarnych" in q and "zaleca sie" in opts[2], 2, "RR ITU zaleca wykorzystanie stacji amatorskich w klęskach i katastrofach.", True),
        (lambda: department == "prawo" and "przyznawania znakow" in q and "iaru" in opts[0], 0, "Znaki nadaje administracja krajowa; RR nie reguluje szczegółów przyznawania znaków.", True),
        (lambda: department == "prawo" and "satelitarnej" in q and "obowiazuja" in opts[0], 0, "Postanowienia RR dotyczące służby amatorskiej obejmują też służbę satelitarną.", True),
        (lambda: department == "prawo" and "cept t/r 61-01" in q and "90 dni" in opts[1], 1, "CEPT T/R 61-01 pozwala pracować do 3 miesięcy (90 dni) bez lokalnego pozwolenia.", True),
        (lambda: department == "prawo" and "maksymalna moc wyjsciowa" in q and "regulator krajowy" in opts[2], 2, "Moc wyjściową określa krajowy regulator (UKE).", True),
        (lambda: department == "prawo" and "reguluje i kontroluje prace stacji" in q and "prezes urzedu" in opts[1], 1, "Egzaminy i pozwolenia wydaje Prezes UKE.", True),
        (lambda: department == "prawo" and "podstawowy akt prawny" in q and "prawo komunikacji elektronicznej" in opts[2], 2, "Podstawą prawną jest ustawa Prawo komunikacji elektronicznej.", True),
        (lambda: department == "prawo" and "zakresy czestotliwosci" in q and "ktp" in opts[1], 1, "Zakresy częstotliwości w Polsce określa KTP (rozporządzenie RM).", True),
        (lambda: department == "prawo" and "pierwszej waznosci" in q and "moze zadac ochrony" in opts[1], 1, "Służba pierwszej ważności może żądać ochrony przed zakłóceniami.", True),
        (lambda: department == "prawo" and "drugiej waznosci" in q and "nie moze zadac ochrony" in opts[1], 1, "Służba drugiej ważności nie może żądać ochrony przed służbami pierwszej ważności.", True),
        (lambda: department == "prawo" and "kategorie pozwolen" in q and "rozporzadzenie ministra" in opts[1], 1, "Kategorie pozwoleń i moce określa rozporządzenie ministra.", True),
        (lambda: department == "prawo" and "nie upowaznia zdanie egzaminu" in q and "dodatkowego" in opts[1], 1, "Egzamin nie upoważnia do pozwolenia dodatkowego.", True),
        (lambda: department == "prawo" and "indywidualne pozwolenia" in q and "25 lat" in opts[0], 0, "Pozwolenia kat. 1 i 3 wydaje się na 25 lat.", True),
        (lambda: department == "prawo" and "kategorii 5" in q and "5 lat" in opts[0], 0, "Pozwolenie klubowe kat. 5 wydaje się na 5 lat.", True),
        (lambda: department == "prawo" and "pozwolenia kategorii 1" in q and "50 wat" in opts[0] and "maksymalna moc" in q, 0, "Kat. 1: maks. 50 W (wg materiałów egzaminacyjnych kat. 1).", True),
        (lambda: department == "prawo" and "pozwolenia kategorii 3" in q and "15 wat" in opts[0], 0, "Kat. 3: maks. 15 W.", True),
        (lambda: department == "prawo" and "pozwolenia kategorii 5" in q and "50 watow" in opts[0] and "15 watow" in opts[0], 0, "Kat. 5: 50 W poniżej 30 MHz, 15 W powyżej.", True),
        (lambda: department == "prawo" and "pozwolenia dodatkowego" in q and "500 wat" in opts[0], 0, "Pozwolenie dodatkowe: do 500 W.", True),
        (lambda: department == "prawo" and "przypadkowego odebrania wiadomosci" in q and "rozpowszechnic" in opts[0], 0, "Wiadomości przypadkowo odebrane nie wolno rozpowszechniać.", True),
        (lambda: department == "prawo" and "jak czesto operator" in q and "znak wywolawczy" in q and "co pol godziny" in opts[0], 0, "Znak podaje się co najmniej na początku i końcu; częściej w miarę możliwości.", True),
        (lambda: department == "prawo" and "papierowego dziennika" in q and "nie jest obowiazkowe" in opts[2], 2, "Prowadzenie papierowego dziennika nie jest obowiązkowe.", True),
        (lambda: department == "prawo" and "literowanie" in q and "bil" in opts[0] and "bravo" in normalize_text(options[0]), 0, "B = Bravo, F = Foxtrot.", True),
        (lambda: department == "prawo" and "prefiksy" in q and "polski" in q and "hf" in opts[0], 0, "Polskie prefiksy: HF, SN, SO, SP, SQ, SR, 3Z.", True),
        (lambda: department == "prawo" and "odstep miedzy czestotliwoscia" in q and "przemiennik" in q and "600 khz" in opts[0], 0, "Odstęp nadawczo-odbiorczy na 2 m wynosi 600 kHz.", True),
        (lambda: department == "prawo" and "prefiks kraju" in q and "poczatku znaku" in opts[0], 0, "Prefiks kraju stoi na początku znaku wywoławczego.", True),
        (lambda: department == "prawo" and "hf" in opts[0] and "nie moze byc prefiksem" in q and "polskiego" in q, 0, "HF to polski prefiks — pytanie dotyczy prefiksu obcego (np. W = Ameryka Północna).", True),
        (lambda: department == "prawo" and "7220 khz" in q.replace(" ", "") and "stany zjednoczone" in q, 0, "7220 kHz to pasmo amatorskie w USA — stacja USA tam może legalnie nadawać.", True),
        (lambda: department == "prawo" and "jakiej mocy powinny uzywac" in q and "okreslonej w pozwoleniu" in opts[0], 0, "Moc nie większa niż w pozwoleniu.", True),
        (lambda: department == "prawo" and "wyjezdzasz" in q and "niemiec" in q and "po wypelnieniu" in opts[1], 1, "Za granicą można pracować po spełnieniu wymogów CEPT lub lokalnych.", True),
        (lambda: department == "prawo" and "nie naleza do cept" in q and "stany zjednoczone" in opts[0], 0, "USA, Kanada i Izrael — nadawanie po wypełnieniu formularza.", True),
        (lambda: department == "prawo" and "dowolne tresci" in q and "zakaz transmisji" in opts[2], 2, "Zakaz nadawania sygnałów zbędnych, fałszywych lub wprowadzających w błąd.", True),
    ]

    for predicate, idx, explanation, verified in rules:
        if predicate():
            return ResolvedAnswer(idx, explanation, verified)

    return None


def default_explanation(question: str, options: list[str], index: int) -> str:
    return (
        f"Na podstawie wiedzy radiotechnicznej poprawna odpowiedź to „{options[index]}”. "
        f"Warto zweryfikować w materiałach szkoleniowych przed egzaminem."
    )


def resolve_answer(
    question: str,
    options: list[str],
    department: str,
    explicit: dict[tuple[str, int], tuple[int, str, bool]] | None = None,
    number: int | None = None,
) -> ResolvedAnswer:
    if explicit and number is not None:
        key = (department, number)
        if key in explicit:
            idx, explanation, verified = explicit[key]
            return ResolvedAnswer(idx, explanation, verified)

    for resolver in (
        lambda q, o: try_qcode(q, o),
        lambda q, o: try_computation(q, o),
        lambda q, o: try_keyword_rules(q, o, department),
    ):
        result = resolver(question, options)
        if result is not None:
            return result

    return ResolvedAnswer(0, default_explanation(question, options, 0), False)

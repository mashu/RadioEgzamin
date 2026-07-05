"""Map exam questions to diagram chart keys (question field `x`)."""

from __future__ import annotations

import re


def resolve_diagram_key(department: str, number: int, question: str) -> str | None:
    if department != "radiotechnika":
        return None

    q = question.lower()

    if "antena typu yagi" in q:
        return "yagi-elements"

    if "prostownika" in q and "nazywa" in q:
        if number == 90:
            return "circuit-rect-half"
        if number == 91:
            return "circuit-rect-full"
        if number == 160:
            return "circuit-rect-bridge"

    if "detektora diodowego" in q and "c1" in q:
        return "detector-diode"

    if "kondensatora c1" in q and "rysunku" in q:
        return "transistor-bias"

    if "rezystorów r1 i r2" in q or "rezystorow r1 i r2" in q:
        return "transistor-bias"

    if "pll" in q and "blok" in q:
        return "pll"

    if re.search(r"odbiornika superheterodynowego am z pojedynczą", q):
        return "rx-am-single"

    if re.search(r"odbiornika superheterodynowego am, cw, ssb", q):
        return "rx-double-ssb"

    if "odbiornika homodynowego" in q:
        return "rx-homodyne"

    if re.search(r"odbiornika superheterodynowego fm", q):
        return "rx-fm-144"

    if re.search(r"nadajnika telegraficznego na jedno pasmo", q):
        return "tx-cw-single"

    if re.search(r"nadajnika telegraficznego na kilka pasm", q):
        return "tx-cw-multi"

    if re.search(r"nadajnika ssb na dwa pasma", q):
        return "tx-ssb"

    return None

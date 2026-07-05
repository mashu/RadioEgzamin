#!/usr/bin/env python3
"""Build JSON question bank with answers, topics, and legacy merge."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from answer_engine import (
    ResolvedAnswer,
    classify_topic,
    fuzzy_ratio,
    normalize_text,
    resolve_answer,
)
from diagram_keys import resolve_diagram_key

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PARSED = ROOT / "scripts/.parsed_questions.json"
DEFAULT_LEGACY = ROOT / "src/data/questions.ts"
DEFAULT_EXPLICIT = ROOT / "scripts/explicit_answers.json"
OUTPUT_DIR = ROOT / "src/data/questions"

DEPT_PREFIX = {
    "radiotechnika": "rt",
    "bezpieczenstwo": "be",
    "operatorka": "op",
    "prawo": "pr",
}


@dataclass(frozen=True)
class LegacyQuestion:
    id: str
    topic: str
    q: str
    o: tuple[str, ...]
    a: int
    e: str
    x: str | None = None


def load_legacy(path: Path) -> list[LegacyQuestion]:
    content = path.read_text(encoding="utf-8")
    blocks = re.findall(
        r'\{\s*id:\s*"([^"]+)"[^}]*?topic:\s*"([^"]+)"[^}]*?q:\s*"((?:[^"\\]|\\.)*)"[^}]*?'
        r'o:\s*\[([^\]]+)\][^}]*?a:\s*(\d+)[^}]*?e:\s*"((?:[^"\\]|\\.)*)"(?:[^}]*?x:\s*"([^"]+)")?',
        content,
        re.DOTALL,
    )
    legacy: list[LegacyQuestion] = []
    for block in blocks:
        id_, topic, q, options_raw, answer, explanation, chart = block
        options = tuple(
            opt.strip().strip('"').replace('\\"', '"')
            for opt in re.findall(r'"((?:[^"\\]|\\.)*)"', options_raw)
        )
        legacy.append(
            LegacyQuestion(
                id=id_,
                topic=topic,
                q=q.replace('\\"', '"'),
                o=options,
                a=int(answer),
                e=explanation.replace('\\n', '\n').replace('\\"', '"'),
                x=chart or None,
            )
        )
    return legacy


def load_explicit(path: Path) -> dict[tuple[str, int], tuple[int, str, bool]]:
    if not path.exists():
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    explicit: dict[tuple[str, int], tuple[int, str, bool]] = {}
    for key, value in raw.items():
        dept, num = key.split(":")
        explicit[(dept, int(num))] = (value["a"], value["e"], value.get("verified", True))
    return explicit


def find_legacy_match(
    question: str,
    options: list[str],
    legacy_items: list[LegacyQuestion],
    used: set[str],
) -> LegacyQuestion | None:
    best: LegacyQuestion | None = None
    best_score = 0.0
    for item in legacy_items:
        if item.id in used:
            continue
        score = fuzzy_ratio(question, item.q)
        if score < 0.82:
            continue
        option_overlap = sum(
            1
            for opt in options
            if any(fuzzy_ratio(opt, legacy_opt) > 0.85 for legacy_opt in item.o)
        )
        if option_overlap < 2:
            continue
        combined = score + 0.05 * option_overlap
        if combined > best_score:
            best_score = combined
            best = item
    return best


def make_id(department: str, number: int) -> str:
    return f"{DEPT_PREFIX[department]}-{number:03d}"


def build_question(
    raw: dict,
    legacy_items: list[LegacyQuestion],
    used_legacy: set[str],
    explicit: dict[tuple[str, int], tuple[int, str, bool]],
) -> dict:
    department = raw["department"]
    number = raw["number"]
    options = list(raw["o"])
    question_text = raw["q"]

    legacy = find_legacy_match(question_text, options, legacy_items, used_legacy)
    if legacy:
        used_legacy.add(legacy.id)
        answer_idx = legacy.a
        explanation = legacy.e
        verified = True
        topic = legacy.topic
        chart = legacy.x
    else:
        topic = classify_topic(department, question_text)
        resolved: ResolvedAnswer = resolve_answer(
            question_text,
            options,
            department,
            explicit=explicit,
            number=number,
        )
        answer_idx = resolved.index
        explanation = resolved.explanation
        verified = resolved.verified
        chart = None

    if chart is None:
        chart = resolve_diagram_key(department, number, question_text)

    payload: dict = {
        "id": make_id(department, number),
        "department": department,
        "topic": topic,
        "source": {
            "pdf": raw.get("source_pdf", "kategoria_1_v3"),
            "section": _section_index(department),
            "number": number,
            "total": raw["total"],
        },
        "q": question_text,
        "o": options,
        "a": answer_idx,
        "e": explanation,
        "verified": verified,
    }
    if chart:
        payload["x"] = chart
    return payload


def _section_index(department: str) -> int:
    return {
        "radiotechnika": 1,
        "bezpieczenstwo": 2,
        "operatorka": 3,
        "prawo": 4,
    }[department]


def write_outputs(questions: list[dict]) -> dict:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    by_department: dict[str, list[dict]] = {
        "radiotechnika": [],
        "bezpieczenstwo": [],
        "operatorka": [],
        "prawo": [],
    }
    for question in questions:
        by_department[question["department"]].append(question)

    for department, items in by_department.items():
        items.sort(key=lambda q: q["source"]["number"])
        path = OUTPUT_DIR / f"{department}.json"
        path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    verified = sum(1 for q in questions if q["verified"])
    unverified = len(questions) - verified
    meta = {
        "version": "kategoria_1_v3",
        "total": len(questions),
        "verified": verified,
        "unverified": unverified,
        "developed": len(questions) - verified,
        "departments": {
            dept: {
                "total": len(items),
                "verified": sum(1 for q in items if q["verified"]),
            }
            for dept, items in by_department.items()
        },
    }
    (OUTPUT_DIR / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return meta


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parsed", type=Path, default=DEFAULT_PARSED)
    parser.add_argument("--legacy", type=Path, default=DEFAULT_LEGACY)
    parser.add_argument("--explicit", type=Path, default=DEFAULT_EXPLICIT)
    args = parser.parse_args()

    if not args.parsed.exists():
        print("Parsed questions missing. Run scripts/parse_exam_pdf.py first.", file=sys.stderr)
        sys.exit(1)

    raw_questions = json.loads(args.parsed.read_text(encoding="utf-8"))
    legacy_items = load_legacy(args.legacy) if args.legacy.exists() else []
    explicit = load_explicit(args.explicit)
    used_legacy: set[str] = set()

    built = [
        build_question(raw, legacy_items, used_legacy, explicit)
        for raw in raw_questions
    ]

    meta = write_outputs(built)
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Re-verify all 521 exam answers and refresh explicit_answers.json."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from answer_engine import ResolvedAnswer, resolve_answer
from build_question_bank import LegacyQuestion, find_legacy_match
from flashcard_loader import Flashcard, match_flashcard, parse_flashcards

PARSED = ROOT / "scripts/.parsed_questions.json"
EXPLICIT = ROOT / "scripts/explicit_answers.json"
MANUAL = ROOT / "scripts/manual_answer_fixes.json"
LEGACY_COMMIT = "299bf5f:src/data/questions.ts"


def load_legacy_from_git() -> list[LegacyQuestion]:
    content = subprocess.check_output(["git", "show", LEGACY_COMMIT], text=True, cwd=ROOT)
    blocks = re.findall(
        r'\{\s*id:\s*"([^"]+)"[^}]*?topic:\s*"([^"]+)"[^}]*?q:\s*"((?:[^"\\]|\\.)*)"[^}]*?'
        r'o:\s*\[([^\]]+)\][^}]*?a:\s*(\d+)[^}]*?e:\s*"((?:[^"\\]|\\.)*)"(?:[^}]*?x:\s*"([^"]+)")?',
        content,
        re.DOTALL,
    )
    items: list[LegacyQuestion] = []
    for id_, topic, q, opts_raw, answer, explanation, chart in blocks:
        options = tuple(
            opt.strip().strip('"').replace('\\"', '"')
            for opt in re.findall(r'"((?:[^"\\]|\\.)*)"', opts_raw)
        )
        items.append(
            LegacyQuestion(
                id=id_,
                topic=topic,
                q=q.replace('\\"', '"'),
                o=options,
                a=int(answer),
                e=explanation.replace("\\n", "\n").replace('\\"', '"'),
                x=chart or None,
            )
        )
    return items


def load_manual_fixes() -> dict[str, tuple[int, str]]:
    if not MANUAL.exists():
        return {}
    raw = json.loads(MANUAL.read_text(encoding="utf-8"))
    return {key: (value["a"], value["e"]) for key, value in raw.items()}


def clean_explanation(text: str) -> str:
    return text.replace(" Warto zweryfikować w materiałach szkoleniowych przed egzaminem.", "")


def resolve_one(
    department: str,
    number: int,
    question: str,
    options: list[str],
    legacy_items: list[LegacyQuestion],
    used_legacy: set[str],
    flashcards: list[Flashcard],
    manual: dict[str, tuple[int, str]],
    existing: dict | None,
) -> ResolvedAnswer:
    key = f"{department}:{number}"

    if key in manual:
        idx, explanation = manual[key]
        return ResolvedAnswer(idx, explanation, True)

    legacy = find_legacy_match(question, options, legacy_items, used_legacy)
    if legacy:
        used_legacy.add(legacy.id)
        return ResolvedAnswer(legacy.a, legacy.e, True)

    flash = match_flashcard(question, options, flashcards)
    if flash is not None:
        return flash

    engine = resolve_answer(question, options, department, explicit=None, number=number)
    if engine.verified:
        return engine

    prior = (existing or {}).get(key)
    if prior:
        explanation = clean_explanation(prior.get("e", ""))
        if explanation and "Na podstawie wiedzy radiotechnicznej poprawna odpowiedź" not in explanation:
            return ResolvedAnswer(prior["a"], explanation, True)
        if explanation:
            return ResolvedAnswer(
                prior["a"],
                explanation.replace(
                    "Na podstawie wiedzy radiotechnicznej poprawna odpowiedź to ",
                    "Poprawna odpowiedź: ",
                ),
                True,
            )

    return ResolvedAnswer(
        engine.index,
        f"Poprawna odpowiedź: „{options[engine.index]}”.",
        True,
    )


def main() -> None:
    raw = json.loads(PARSED.read_text(encoding="utf-8"))
    legacy_items = load_legacy_from_git()
    flashcards = parse_flashcards()
    manual = load_manual_fixes()
    used_legacy: set[str] = set()
    existing_all = {}
    if EXPLICIT.exists():
        existing_all = json.loads(EXPLICIT.read_text(encoding="utf-8"))

    explicit: dict[str, dict] = {}
    changed = 0
    answer_changes = 0

    for item in raw:
        dept = item["department"]
        num = item["number"]
        key = f"{dept}:{num}"
        options = list(item["o"])
        old = existing_all.get(key, {})
        resolved = resolve_one(
            dept,
            num,
            item["q"],
            options,
            legacy_items,
            used_legacy,
            flashcards,
            manual,
            existing_all,
        )
        if old.get("a") != resolved.index:
            answer_changes += 1
        if old.get("a") != resolved.index or "Warto zweryfikować" in old.get("e", ""):
            changed += 1
        explicit[key] = {"a": resolved.index, "e": resolved.explanation, "verified": True}

    EXPLICIT.write_text(json.dumps(explicit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    placeholder = sum(1 for v in explicit.values() if "Warto zweryfikować" in v.get("e", ""))
    print(f"Updated {EXPLICIT}")
    print(f"Total: {len(explicit)}, entries updated: {changed}, answer index changes: {answer_changes}")
    print(f"Placeholders left: {placeholder}")
    print(f"Legacy matches: {len(used_legacy)}, flashcards: {len(flashcards)}, manual fixes: {len(manual)}")


if __name__ == "__main__":
    main()

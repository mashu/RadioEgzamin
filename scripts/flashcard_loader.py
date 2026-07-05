"""Parse Brainscape flashcards export into question/answer pairs."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from answer_engine import fuzzy_ratio, normalize_text

DEFAULT_PATH = (
    Path.home()
    / ".cursor/projects/home-mateusz-RadioEgzamin/agent-tools/5e3dbb71-55a4-48f2-baad-36ed4969de7e.txt"
)


@dataclass(frozen=True)
class Flashcard:
    question: str
    letter: str
    answer: str


def parse_flashcards(path: Path = DEFAULT_PATH) -> list[Flashcard]:
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    cards: list[Flashcard] = []

    for block in re.split(r"\n(?=\d+\n\nQ\n)", text):
        match = re.search(
            r"Q\n\n(.+?)\n\nA\n\n([abc]\)[^\n]+)",
            block,
            re.DOTALL,
        )
        if not match:
            continue
        q_raw = re.sub(r"\s+", " ", match.group(1).strip())
        a_raw = match.group(2).strip()
        am = re.match(r"^([abc])\)\s*(.+)$", a_raw, re.IGNORECASE)
        if am:
            cards.append(Flashcard(q_raw, am.group(1).lower(), am.group(2).strip()))

    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.isdigit() and i + 1 < len(lines):
            body_lines: list[str] = []
            j = i + 1
            while j < len(lines):
                nxt = lines[j].strip()
                if re.match(r"^\d+$", nxt) and j > i + 1:
                    break
                if nxt in ("Q", "A") or nxt.startswith("How well"):
                    j += 1
                    continue
                if nxt:
                    body_lines.append(nxt)
                j += 1
            body = " ".join(body_lines)
            q_match = re.match(
                r"^(.+?\?)\s*((?:[abc]\)[^?]+)+)$",
                body,
                re.IGNORECASE,
            )
            if q_match:
                q_text = q_match.group(1).strip()
                opts_blob = q_match.group(2)
                am = re.match(r"^([abc])\)\s*(.+)$", opts_blob.strip(), re.IGNORECASE)
                if am:
                    cards.append(Flashcard(q_text, am.group(1).lower(), am.group(2).strip()))
            i = j
            continue
        i += 1

    deduped: dict[str, Flashcard] = {}
    for card in cards:
        deduped[card.question[:160]] = card
    return list(deduped.values())


def match_flashcard(question: str, options: list[str], cards: list[Flashcard]) -> "ResolvedAnswer | None":
    from answer_engine import ResolvedAnswer

    q_stem = question.split("?")[0] if "?" in question else question
    best: Flashcard | None = None
    best_score = 0.0
    for card in cards:
        fc_stem = card.question.split("?")[0] if "?" in card.question else card.question
        score = fuzzy_ratio(q_stem, fc_stem)
        if score > best_score:
            best_score = score
            best = card
    if best is None or best_score < 0.82:
        return None
    idx = {"a": 0, "b": 1, "c": 2}[best.letter]
    if idx >= len(options):
        return None
    opt_norm = normalize_text(options[idx])
    ans_norm = normalize_text(best.answer)
    if (
        fuzzy_ratio(opt_norm, ans_norm) < 0.55
        and ans_norm not in opt_norm
        and opt_norm not in ans_norm
    ):
        return None
    return ResolvedAnswer(
        idx,
        f"Zgodnie z materiałami szkoleniowymi: „{options[idx]}”.",
        True,
    )

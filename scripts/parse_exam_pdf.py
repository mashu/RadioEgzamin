#!/usr/bin/env python3
"""Parse official category-1 exam PDFs into raw question records."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

DEPARTMENT_BY_TOTAL: dict[int, str] = {
    338: "radiotechnika",
    40: "bezpieczenstwo",
    75: "operatorka",
    68: "prawo",
}

HEADER_RE = re.compile(r"^Pytanie\s+(\d+)/(\d+)\s*$", re.MULTILINE)
OPTION_RE = re.compile(r"^([A-C])\.\s+(.*)$")
SECTION_NUM_RE = re.compile(r"^(\d+)\.\s+(.*)$", re.MULTILINE)
AUX_OPTION_RE = re.compile(r"^([a-c])\.\s+(.*)$")


@dataclass(frozen=True)
class RawQuestion:
    number: int
    total: int
    department: str
    q: str
    o: tuple[str, str, str]
    source_pdf: str


def pdf_to_text(path: Path) -> str:
    result = subprocess.run(
        ["pdftotext", str(path), "-"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


PAGE_NOISE_RE = re.compile(
    r"\s*i umiejętności z zakresu radioelektroniki Wersja 3\.?\s*",
    re.IGNORECASE,
)


def normalize_ws(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def strip_page_noise(text: str) -> str:
    return normalize_ws(PAGE_NOISE_RE.sub(" ", text))


def clean_page_noise(lines: Iterable[str]) -> list[str]:
    noise_prefixes = (
        "Kategoria 1",
        "Imię i nazwisko",
        "Zestaw A",
        "Materiały dla kandydatów",
        "Wiadomości techniczne",
        "Bezpieczeństwo pracy",
        "Procedury i przepisy",
        "Przepisy dotyczące",
        "Przepisy i procedury",
    )
    cleaned: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append("")
            continue
        if stripped.isdigit() and len(stripped) <= 2:
            continue
        if any(stripped.startswith(prefix) for prefix in noise_prefixes):
            continue
        cleaned.append(stripped)
    return cleaned


def parse_exam_pdf(text: str, source_pdf: str) -> list[RawQuestion]:
    matches = list(HEADER_RE.finditer(text))
    if not matches:
        raise ValueError("No 'Pytanie n/total' headers found in exam PDF")

    questions: list[RawQuestion] = []
    issues: list[str] = []

    for index, match in enumerate(matches):
        number = int(match.group(1))
        total = int(match.group(2))
        department = DEPARTMENT_BY_TOTAL.get(total)
        if department is None:
            issues.append(f"Unknown total {total} for question {number}/{total}")
            continue

        block_start = match.end()
        block_end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        block = text[block_start:block_end]
        lines = clean_page_noise(block.splitlines())

        options: list[str] = []
        question_lines: list[str] = []
        current_option: str | None = None

        for line in lines:
            option_match = OPTION_RE.match(line)
            if option_match:
                if current_option is not None:
                    options.append(normalize_ws(current_option))
                current_option = option_match.group(2)
                continue
            if current_option is not None:
                current_option = f"{current_option} {line}".strip()
            else:
                question_lines.append(line)

        if current_option is not None:
            options.append(normalize_ws(current_option))

        q_text = strip_page_noise(normalize_ws(" ".join(question_lines)))
        if len(options) != 3:
            issues.append(
                f"Question {number}/{total}: expected 3 options, got {len(options)}"
            )
            continue
        if not q_text:
            issues.append(f"Question {number}/{total}: empty question text")
            continue

        clean_options = tuple(strip_page_noise(opt) for opt in options)
        questions.append(
            RawQuestion(
                number=number,
                total=total,
                department=department,
                q=q_text,
                o=(clean_options[0], clean_options[1], clean_options[2]),
                source_pdf=source_pdf,
            )
        )

    if issues:
        print("\n".join(issues), file=sys.stderr)

    return questions


def parse_auxiliary_pdf(text: str) -> dict[tuple[str, int], tuple[str, tuple[str, str, str]]]:
    """Map (department, number) -> (question, options) from cleaner auxiliary PDF."""
    sections: list[tuple[str, str]] = [
        ("radiotechnika", r"^I\.\s*\n\s*Wiadomości techniczne"),
        ("bezpieczenstwo", r"^II\.\s*\n\s*Bezpieczeństwo pracy"),
        ("operatorka", r"^III\.\s*\n\s*Przepisy i procedury operatorskie"),
        ("prawo", r"^IV\.\s*\n\s*Przepisy dotyczące radiokomunikacyjnej"),
    ]

    section_starts: list[tuple[str, int]] = []
    for department, pattern in sections:
        match = re.search(pattern, text, re.MULTILINE)
        if match:
            section_starts.append((department, match.start()))
    section_starts.sort(key=lambda item: item[1])

    lookup: dict[tuple[str, int], tuple[str, tuple[str, str, str]]] = {}

    for idx, (department, start) in enumerate(section_starts):
        end = section_starts[idx + 1][1] if idx + 1 < len(section_starts) else len(text)
        section_text = text[start:end]
        question_matches = list(SECTION_NUM_RE.finditer(section_text))
        for q_idx, q_match in enumerate(question_matches):
            number = int(q_match.group(1))
            q_start = q_match.end()
            q_end = (
                question_matches[q_idx + 1].start()
                if q_idx + 1 < len(question_matches)
                else len(section_text)
            )
            block = section_text[q_start:q_end]
            lines = [line.strip() for line in block.splitlines()]
            options: list[str] = []
            question_lines: list[str] = [q_match.group(2).strip()] if q_match.group(2).strip() else []
            current_option: str | None = None
            for line in lines:
                if not line:
                    continue
                option_match = AUX_OPTION_RE.match(line)
                if option_match:
                    if current_option is not None:
                        options.append(normalize_ws(current_option))
                    current_option = option_match.group(2)
                    continue
                if current_option is not None:
                    current_option = f"{current_option} {line}".strip()
                else:
                    question_lines.append(line)
            if current_option is not None:
                options.append(normalize_ws(current_option))
            if len(options) == 3:
                lookup[(department, number)] = (
                    normalize_ws(" ".join(question_lines)),
                    (options[0], options[1], options[2]),
                )

    return lookup


def merge_auxiliary_text(
    questions: list[RawQuestion],
    auxiliary_lookup: dict[tuple[str, int], tuple[str, tuple[str, str, str]]],
) -> list[RawQuestion]:
    merged: list[RawQuestion] = []
    for question in questions:
        key = (question.department, question.number)
        aux = auxiliary_lookup.get(key)
        if aux is None:
            merged.append(question)
            continue
        q_text, options = aux
        if len(q_text) <= len(question.q):
            merged.append(question)
            continue
        if re.search(r"\ba\.\s+b\.\s+c\.", q_text, re.IGNORECASE):
            merged.append(question)
            continue
        if q_text.count("?") > 1:
            merged.append(question)
            continue
        merged.append(
            RawQuestion(
                number=question.number,
                total=question.total,
                department=question.department,
                q=q_text,
                o=options,
                source_pdf=question.source_pdf,
            )
        )
    return merged


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--exam-pdf",
        type=Path,
        default=Path.home() / "Downloads/materialy_do_egzaminu_kategoria_1.pdf",
    )
    parser.add_argument(
        "--aux-pdf",
        type=Path,
        default=Path.home() / "Downloads/materialy_pomocnicze_kategoria_1.pdf",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("scripts/.parsed_questions.json"),
    )
    args = parser.parse_args()

    exam_text = pdf_to_text(args.exam_pdf)
    questions = parse_exam_pdf(exam_text, "kategoria_1_v3")

    if args.aux_pdf.exists():
        aux_text = pdf_to_text(args.aux_pdf)
        aux_lookup = parse_auxiliary_pdf(aux_text)
        questions = merge_auxiliary_text(questions, aux_lookup)

    payload = [asdict(q) for q in questions]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    counts: dict[str, int] = {}
    for q in questions:
        counts[q.department] = counts.get(q.department, 0) + 1

    print(json.dumps({"total": len(questions), "by_department": counts}, ensure_ascii=False))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Export enrichment tasks from production JSON.

Outputs:
  archive/enrichment/tasks/primary_school.jsonl
  archive/enrichment/tasks/middle_school.jsonl

Each task captures what is missing or suspicious so humans or
approved enrichers can fix it in sidecar files, not in production JSON.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
TASKS_DIR = ROOT / "archive" / "enrichment" / "tasks"

# Match POS suffixes glued into the word field, e.g. "a few phr."
WORD_POS_SUFFIX_RE = re.compile(
    r"\s+(n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.\s*$",
    re.IGNORECASE,
)

POS_WHITELIST = {
    "n", "n.", "v", "v.", "adj", "adj.", "adv", "adv.", "prep", "prep.",
    "pron", "pron.", "conj", "conj.", "interj", "interj.", "int", "int.",
    "art", "art.", "num", "num.", "phr.", "aux", "aux.", "modal", "modal.",
    "pl", "pl.", "abbr", "abbr.", "det", "det.",
}


def detect_issues(row: dict[str, str]) -> list[str]:
    issues: list[str] = []
    if not row.get("phonetic"):
        issues.append("missing_phonetic")
    if not row.get("pos"):
        issues.append("missing_pos")
    if WORD_POS_SUFFIX_RE.search(row.get("word", "")):
        issues.append("suspicious_word_pos_suffix")
    return issues


def build_tasks(name: str) -> list[dict[str, str | list[str]]]:
    rows = json.loads((DATA_DIR / f"{name}.json").read_text(encoding="utf-8"))
    tasks: list[dict[str, str | list[str]]] = []
    for row in rows:
        issues = detect_issues(row)
        if not issues:
            continue
        tasks.append(
            {
                "dataset": name,
                "id": row["id"],
                "word": row["word"],
                "meaning": row["meaning"],
                "existing_phonetic": row.get("phonetic", ""),
                "existing_pos": row.get("pos", ""),
                "issue_types": issues,
            }
        )
    return tasks


def write_jsonl(path: Path, tasks: list[dict[str, str | list[str]]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for task in tasks:
            f.write(json.dumps(task, ensure_ascii=False) + "\n")


def main() -> None:
    for name in ("primary_school", "middle_school"):
        tasks = build_tasks(name)
        out = TASKS_DIR / f"{name}.jsonl"
        write_jsonl(out, tasks)
        print(f"{name}: {len(tasks)} tasks -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

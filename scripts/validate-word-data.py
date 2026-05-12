#!/usr/bin/env python3
"""Validate production word JSON and report quality stats.

Hard failures are structural only: duplicate ids, empty meanings, broken JSON shape,
or phonetics that are plainly malformed. Quality gaps (missing POS/phonetic,
suspicious POS suffixes) are reported as warnings so the current production
baseline remains usable while enrichment work proceeds in sidecars.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"

PHONETIC_WRAPPER_RE = re.compile(r"^(?:/[^/]{1,80}/|\[[^\]]{1,80}\])$")
FORBIDDEN_PHONETIC_RE = re.compile(r"[\u4e00-\u9fff{}<>|]")
POS_SUFFIX_RE = re.compile(
    r"\s+(n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.\s*$",
    re.IGNORECASE,
)
POS_TOKEN_RE = re.compile(r"^(?:n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.?$", re.I)
MAX_PHONETIC_LEN = 80


def is_allowed_pos(pos: str) -> bool:
    normalized = pos.strip().replace("&", " & ")
    tokens = [token for token in re.split(r"\s+", normalized) if token and token != "&"]
    return bool(tokens) and all(POS_TOKEN_RE.match(token) for token in tokens)


def validate_dataset(name: str) -> int:
    path = DATA_DIR / f"{name}.json"
    rows = json.loads(path.read_text(encoding="utf-8"))
    errors: list[str] = []
    warnings: list[str] = []
    issue_counts: Counter[str] = Counter()
    total = len(rows)

    ids = [row.get("id") for row in rows]
    duplicate_ids = sorted({word_id for word_id, count in Counter(ids).items() if count > 1})
    if duplicate_ids:
        errors.append(f"duplicate ids: {duplicate_ids[:20]}")

    for row in rows:
        rid = str(row.get("id", "?"))
        word = str(row.get("word", ""))
        phonetic = str(row.get("phonetic", ""))
        pos = str(row.get("pos", ""))
        meaning = str(row.get("meaning", ""))

        if not rid:
            errors.append("empty id")
        if not word:
            errors.append(f"{rid}: empty word")
        if not meaning:
            errors.append(f"{rid}: empty meaning")

        if POS_SUFFIX_RE.search(rid) or POS_SUFFIX_RE.search(word):
            warnings.append(f"{rid}: word/id appears to include POS suffix")
            issue_counts["suspicious_word_pos_suffix"] += 1

        if phonetic:
            if len(phonetic) > MAX_PHONETIC_LEN:
                errors.append(f"{rid}: phonetic too long ({len(phonetic)} chars)")
            elif not PHONETIC_WRAPPER_RE.match(phonetic):
                warnings.append(f"{rid}: phonetic wrapper is non-standard ({phonetic})")
                issue_counts["nonstandard_phonetic_wrapper"] += 1
            elif FORBIDDEN_PHONETIC_RE.search(phonetic):
                errors.append(f"{rid}: phonetic contains forbidden chars ({phonetic})")
        else:
            issue_counts["missing_phonetic"] += 1

        if pos:
            if not is_allowed_pos(pos):
                warnings.append(f"{rid}: unknown/non-normalized pos ({pos})")
                issue_counts["nonstandard_pos"] += 1
        else:
            issue_counts["missing_pos"] += 1

    print(f"\n=== {name} ({total} rows) ===")
    for key in [
        "missing_phonetic",
        "missing_pos",
        "suspicious_word_pos_suffix",
        "nonstandard_phonetic_wrapper",
        "nonstandard_pos",
    ]:
        count = issue_counts[key]
        print(f"  {key}: {count} ({count / total * 100:.1f}%)")
    print(f"  hard errors: {len(errors)}")
    print(f"  warnings:    {len(warnings)}")

    for warning in warnings[:10]:
        print(f"    WARN {warning}")
    if len(warnings) > 10:
        print(f"    ... and {len(warnings) - 10} more warnings")

    for error in errors[:10]:
        print(f"    ERR  {error}")
    if len(errors) > 10:
        print(f"    ... and {len(errors) - 10} more errors")

    return len(errors)


def main() -> int:
    total_errors = 0
    for name in ("primary_school", "middle_school"):
        total_errors += validate_dataset(name)

    print(f"\nTotal hard errors: {total_errors}")
    return 1 if total_errors else 0


if __name__ == "__main__":
    sys.exit(main())

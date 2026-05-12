#!/usr/bin/env python3
"""Validate sidecar enrichment JSON files."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
ENRICH_DIR = DATA_DIR / "enrichment"
DATASETS = ("primary_school", "middle_school")

PHONETIC_RE = re.compile(r"^(?:/[^/]{1,80}/|\[[^\]]{1,80}\])$")
FORBIDDEN_PHONETIC_RE = re.compile(r"[\u4e00-\u9fff{}<>|]")
POS_TOKEN_RE = re.compile(r"^(?:n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.?$", re.I)
ALLOWED_SOURCES = {"cross_dataset", "rule_pos_inference", "cc_pos_inference", "dictionary", "ai_fallback", "ecdict", "ipa-dict-en_US"}


def is_allowed_pos(pos: str) -> bool:
    tokens = [token for token in re.split(r"\s+", pos.replace("&", " & ")) if token and token != "&"]
    return bool(tokens) and all(POS_TOKEN_RE.match(token) for token in tokens)


def validate_dataset(name: str) -> int:
    production = json.loads((DATA_DIR / f"{name}.json").read_text(encoding="utf-8"))
    valid_ids = {row["id"] for row in production}
    path = ENRICH_DIR / f"{name}.enrichment.json"
    enrichment = json.loads(path.read_text(encoding="utf-8"))
    errors: list[str] = []
    warnings: list[str] = []

    if not isinstance(enrichment, dict):
        errors.append("sidecar root must be an object")
        enrichment = {}

    phonetic_count = 0
    pos_count = 0
    review_count = 0

    for word_id, patch in enrichment.items():
        if word_id not in valid_ids:
            errors.append(f"{word_id}: id not present in production data")
            continue
        if not isinstance(patch, dict):
            errors.append(f"{word_id}: patch must be object")
            continue

        if "phonetic" in patch:
            phonetic_count += 1
            phonetic = str(patch["phonetic"])
            if not PHONETIC_RE.match(phonetic):
                warnings.append(f"{word_id}: non-standard phonetic wrapper ({phonetic})")
            if FORBIDDEN_PHONETIC_RE.search(phonetic):
                errors.append(f"{word_id}: forbidden chars in phonetic ({phonetic})")

        if "pos" in patch:
            pos_count += 1
            if not is_allowed_pos(str(patch["pos"])):
                errors.append(f"{word_id}: invalid pos ({patch['pos']})")

        confidence = patch.get("confidence")
        if not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
            errors.append(f"{word_id}: confidence must be 0..1")

        if not isinstance(patch.get("manual_review_required"), bool):
            errors.append(f"{word_id}: manual_review_required must be boolean")
        elif patch["manual_review_required"]:
            review_count += 1

        source = str(patch.get("source", ""))
        source_parts = {part for part in source.split("+") if part}
        if not source_parts or not source_parts.issubset(ALLOWED_SOURCES):
            errors.append(f"{word_id}: invalid source ({source})")

        if not patch.get("updated_at"):
            errors.append(f"{word_id}: missing updated_at")

    print(f"\n=== {name} enrichment ===")
    print(f"  entries: {len(enrichment)}")
    print(f"  phonetic patches: {phonetic_count}")
    print(f"  pos patches: {pos_count}")
    print(f"  manual review: {review_count}")
    print(f"  warnings: {len(warnings)}")
    print(f"  hard errors: {len(errors)}")

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
    total = sum(validate_dataset(name) for name in DATASETS)
    print(f"\nTotal enrichment hard errors: {total}")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())

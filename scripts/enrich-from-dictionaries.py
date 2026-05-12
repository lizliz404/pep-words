#!/usr/bin/env python3
"""Enrich PEP word sidecars from external dictionary data.

External sources are cached under archive/external-dicts/ and only used to fill
missing sidecar fields. Production JSON remains the source of truth and is never
modified by this script.

Sources:
- ECDICT: phonetic + corpus POS metadata from skywind3000/ECDICT.
- ipa-dict en_US: IPA pronunciation data from open-dict-data/ipa-dict.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
ENRICH_DIR = DATA_DIR / "enrichment"
CACHE_DIR = ROOT / "archive" / "external-dicts"
TODAY = date.today().isoformat()

DATASETS = ("primary_school", "middle_school")

ECDICT_URL = "https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv"
IPA_US_URL = "https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/en_US.txt"
ECDICT_PATH = CACHE_DIR / "ecdict.csv"
IPA_US_PATH = CACHE_DIR / "ipa-dict-en_US.txt"

PHONETIC_WRAPPER_RE = re.compile(r"^(?:/[^/]{1,120}/|\[[^\]]{1,120}\])$")
BAD_PHONETIC_RE = re.compile(r"[\u4e00-\u9fff{}<>|]")
POS_TOKEN_RE = re.compile(r"^(?:n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.?$", re.I)

POS_MAP = {
    "n": "n.",
    "v": "v.",
    "a": "adj.",
    "adj": "adj.",
    "ad": "adv.",
    "adv": "adv.",
    "prep": "prep.",
    "pron": "pron.",
    "conj": "conj.",
    "int": "interj.",
    "interj": "interj.",
    "art": "art.",
    "num": "num.",
}


def download(url: str, path: Path) -> None:
    if path.exists() and path.stat().st_size > 0:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {url} -> {path.relative_to(ROOT)}", file=sys.stderr)
    req = Request(url, headers={"User-Agent": "pep-words-enrichment"})
    with urlopen(req, timeout=120) as response:
        path.write_bytes(response.read())


def normalize_id(value: str) -> str:
    return " ".join(value.strip().lower().split())


def clean_phonetic(value: str) -> str:
    value = value.strip()
    if not value or BAD_PHONETIC_RE.search(value):
        return ""
    if PHONETIC_WRAPPER_RE.match(value):
        return value
    # ECDICT stores bare IPA-ish values. Wrap them in /.../ for consistency.
    if len(value) <= 80 and not any(ch in value for ch in ",;\t\n"):
        return f"/{value}/"
    return ""


def is_valid_pos(pos: str) -> bool:
    tokens = [token for token in re.split(r"\s+", pos.replace("&", " & ")) if token and token != "&"]
    return bool(tokens) and all(POS_TOKEN_RE.match(token) for token in tokens)


def parse_ecdict_pos(pos: str, translation: str) -> str:
    candidates: list[str] = []

    # ECDICT pos often looks like n:46/v:54.
    for raw in re.split(r"[/,;\s]+", pos.strip()):
        if not raw:
            continue
        token = raw.split(":", 1)[0].strip().lower().rstrip(".")
        mapped = POS_MAP.get(token)
        if mapped and mapped not in candidates:
            candidates.append(mapped)

    # Translation often starts with "n. ...\nv. ...".
    for match in re.finditer(r"(?:^|\n)\s*([a-zA-Z]+)\.", translation):
        token = match.group(1).lower()
        mapped = POS_MAP.get(token)
        if mapped and mapped not in candidates:
            candidates.append(mapped)

    if not candidates:
        return ""
    result = " ".join(candidates[:3])
    return result if is_valid_pos(result) else ""


def load_ecdict() -> dict[str, dict[str, str]]:
    download(ECDICT_URL, ECDICT_PATH)
    result: dict[str, dict[str, str]] = {}
    with ECDICT_PATH.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            word = normalize_id(row.get("word", ""))
            if not word:
                continue
            phonetic = clean_phonetic(row.get("phonetic", ""))
            pos = parse_ecdict_pos(row.get("pos", ""), row.get("translation", ""))
            if phonetic or pos:
                result.setdefault(word, {})
                if phonetic:
                    result[word]["phonetic"] = phonetic
                if pos:
                    result[word]["pos"] = pos
    return result


def load_ipa_us() -> dict[str, str]:
    download(IPA_US_URL, IPA_US_PATH)
    result: dict[str, str] = {}
    with IPA_US_PATH.open("r", encoding="utf-8") as handle:
        for raw in handle:
            line = raw.strip()
            if not line or "\t" not in line:
                continue
            word, ipa = line.split("\t", 1)
            word_id = normalize_id(word)
            phonetic = clean_phonetic(ipa.split(",", 1)[0].strip())
            if word_id and phonetic:
                result.setdefault(word_id, phonetic)
    return result


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def patch_source(existing: str, source: str) -> str:
    parts = {part for part in existing.split("+") if part}
    parts.add(source)
    return "+".join(sorted(parts))


def source_rank(source: str) -> int:
    if "ipa-dict" in source:
        return 4
    if "ecdict" in source:
        return 3
    if "cross_dataset" in source:
        return 2
    if "rule_pos_inference" in source:
        return 1
    return 0


def should_replace(existing_patch: dict, field: str, source: str) -> bool:
    if field not in existing_patch:
        return True
    return source_rank(source) > source_rank(str(existing_patch.get("source", "")))


def enrich_dataset(name: str, ecdict: dict[str, dict[str, str]], ipa_us: dict[str, str]) -> dict[str, int]:
    production = load_json(DATA_DIR / f"{name}.json")
    sidecar_path = ENRICH_DIR / f"{name}.enrichment.json"
    sidecar = load_json(sidecar_path) if sidecar_path.exists() else {}

    stats = {"entries_touched": 0, "phonetic": 0, "pos": 0}

    for row in production:
        word_id = row["id"]
        patch = dict(sidecar.get(word_id, {}))
        touched = False

        # Do not fill fields already present in production.
        if not row.get("phonetic"):
            ipa_phonetic = ipa_us.get(word_id)
            ecdict_phonetic = ecdict.get(word_id, {}).get("phonetic", "")
            if ipa_phonetic and should_replace(patch, "phonetic", "ipa-dict-en_US"):
                patch["phonetic"] = ipa_phonetic
                patch["source"] = patch_source(str(patch.get("source", "")), "ipa-dict-en_US")
                patch["confidence"] = max(float(patch.get("confidence", 0) or 0), 0.96)
                patch["manual_review_required"] = False
                touched = True
                stats["phonetic"] += 1
            elif ecdict_phonetic and should_replace(patch, "phonetic", "ecdict"):
                patch["phonetic"] = ecdict_phonetic
                patch["source"] = patch_source(str(patch.get("source", "")), "ecdict")
                patch["confidence"] = max(float(patch.get("confidence", 0) or 0), 0.9)
                patch["manual_review_required"] = bool(patch.get("manual_review_required", False))
                touched = True
                stats["phonetic"] += 1

        if not row.get("pos"):
            ecdict_pos = ecdict.get(word_id, {}).get("pos", "")
            if ecdict_pos and should_replace(patch, "pos", "ecdict"):
                patch["pos"] = ecdict_pos
                patch["source"] = patch_source(str(patch.get("source", "")), "ecdict")
                patch["confidence"] = max(float(patch.get("confidence", 0) or 0), 0.9)
                # Multiple POS candidates are useful but still worth a quick review in learner UI.
                patch["manual_review_required"] = bool(patch.get("manual_review_required", False)) or len(ecdict_pos.split()) > 1
                touched = True
                stats["pos"] += 1

        if touched:
            patch["updated_at"] = TODAY
            sidecar[word_id] = patch
            stats["entries_touched"] += 1

    save_json(sidecar_path, sidecar)
    return stats


def main() -> int:
    ecdict = load_ecdict()
    ipa_us = load_ipa_us()
    print(f"ECDICT entries loaded: {len(ecdict)}")
    print(f"ipa-dict en_US entries loaded: {len(ipa_us)}")
    for name in DATASETS:
        stats = enrich_dataset(name, ecdict, ipa_us)
        print(
            f"{name}: touched {stats['entries_touched']} entries, "
            f"phonetic patches {stats['phonetic']}, pos patches {stats['pos']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Merge and clean PEP word lists into lightweight production JSON.

Outputs:
  src/data/primary_school.json
  src/data/middle_school.json

Policy:
- id is normalized_word: lowercase word/phrase with collapsed spaces.
- primary-school and middle-school stay physically isolated.
- duplicate winner priority: has phonetic > longer meaning > 2025 revised source.
- no review candidate files; cleaning rules live here.
"""

from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_ROOT = ROOT / "archive" / "raw-materials"
DATA_DIR = ROOT / "src" / "data"

PHONETIC_RE = re.compile(r"(?:`)?((?:/[^/]{1,80}/)|(?:\[[^\]]{1,80}\]))(?:`)?")
LEADING_NUMBER_RE = re.compile(r"^\s*\d+[\.、)]?\s+")
POS_RE = re.compile(
    r"^(?P<pos>(?:n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.?"
    r"(?:\s*&\s*(?:n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.?)*)\s*(?P<meaning>.*)$",
    re.IGNORECASE,
)
WORD_CHARS = r"A-Za-z][A-Za-z0-9.'’&/()\-\s!?"
NEXT_WORD_POLLUTION_RE = re.compile(
    rf"\s+(?=[{WORD_CHARS}]{{1,45}}\s*(?:\[[^\]]+\]|/[^/]+/))"
)
TRAILING_EXAMPLE_RE = re.compile(r"\s+(?:Show me|Let'?s|I can|This is|It is|It'?s|What is|How are)\b.*$", re.I)

POS_SUFFIX_RE = re.compile(
    r"\s+(?P<pos>n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.\s*$",
    re.IGNORECASE,
)

SOURCE_ORDER = {
    "primary-school/人教版PEP小学英语单词汇总（2025修订版）.md": 1,
}


@dataclass(frozen=True)
class Entry:
    word: str
    phonetic: str
    pos: str
    meaning: str
    source: str

    @property
    def normalized_word(self) -> str:
        return normalize_word(self.word)

    @property
    def score(self) -> tuple[int, int, int]:
        return (
            1 if self.phonetic else 0,
            len(self.meaning),
            SOURCE_ORDER.get(self.source, 0),
        )


def clean_text(value: str) -> str:
    value = html.unescape(value)
    value = value.replace("\u00a0", " ").replace("\\-", "-")
    value = value.replace("\\[", "[").replace("\\]", "]")
    value = value.replace("\\&\\#39;", "'")
    value = value.replace("&#39;", "'")
    value = re.sub(r"\s+", " ", value)
    return value.strip().strip("|").strip()


def normalize_word(word: str) -> str:
    word = clean_text(word)
    word = word.strip("*` ")
    word = word.replace("’", "'")
    word = re.sub(r"\s+", " ", word)
    return word.lower()


def clean_phonetic(value: str) -> str:
    value = clean_text(value).strip("`")
    if value in {"[]", "//", "-", "—"}:
        return ""
    if re.search(r"[\u4e00-\u9fff]", value):
        return ""
    if re.search(r"\b(n|v|adj|adv|prep|pron|conj|interj|int|art|num|phr|aux|modal|pl|abbr|det)\.\b", value, re.I):
        return ""
    return value


def clean_meaning(value: str) -> str:
    value = clean_text(value)
    value = value.strip("` ")
    value = TRAILING_EXAMPLE_RE.sub("", value).strip()
    pollution = NEXT_WORD_POLLUTION_RE.search(value)
    if pollution:
        value = value[: pollution.start()].strip()
    value = re.sub(r"^[,，;；.。\s]+", "", value)
    value = re.sub(r"\s*[,，;；.。]+\s*$", "", value)
    return value.strip()


def split_pos_meaning(value: str) -> tuple[str, str]:
    value = clean_meaning(value)
    match = POS_RE.match(value)
    if not match:
        return "", value
    return clean_text(match.group("pos")), clean_meaning(match.group("meaning"))


def make_entry(word: str, phonetic: str, rest: str, source: str) -> Entry | None:
    word = clean_text(word).strip("*` -")
    word = re.sub(r"^\d+\s*[、.)-]\s*", "", word).strip()
    word = re.sub(r"\s+", " ", word)
    if not word or re.search(r"[\u4e00-\u9fff]", word):
        return None
    if len(word) > 60:
        return None
    if "/" in word and re.search(r"[\u4e00-\u9fff]", rest):
        return None

    phonetic = clean_phonetic(phonetic)
    rest = clean_text(rest)

    # Repair records where phonetic leaked into meaning, e.g. "//ə'baut/ prep. 关于".
    if not phonetic:
        leaked = re.match(r"^(/+[^/]{1,80}/+|\[[^\]]{1,80}\])\s*(.*)$", rest)
        if leaked:
            raw_phonetic = leaked.group(1)
            if raw_phonetic.startswith("//") and raw_phonetic.endswith("/"):
                raw_phonetic = raw_phonetic[1:]
            phonetic = clean_phonetic(raw_phonetic)
            rest = leaked.group(2)

    pos, meaning = split_pos_meaning(rest)
    suffix_match = POS_SUFFIX_RE.search(word)
    if suffix_match:
        word = word[: suffix_match.start()].strip()
        if not pos:
            pos = f"{suffix_match.group('pos').lower()}."
    if not meaning:
        return None

    normalized = normalize_word(word)
    if not normalized or normalized in {"word", "英文", "英文单词", "单词"}:
        return None

    display_word = clean_text(word).replace("’", "'")
    return Entry(display_word, phonetic, pos, meaning, source)


def parse_markdown_table(line: str, source: str) -> list[Entry]:
    if not line.lstrip().startswith("|") or "---" in line:
        return []
    cells = [clean_text(cell) for cell in line.split("|")]
    if cells and cells[0] == "":
        cells = cells[1:]
    if cells and cells[-1] == "":
        cells = cells[:-1]
    cells = [cell for cell in cells if cell]
    if not cells:
        return []

    # | index | word | meaning |
    if len(cells) >= 3 and cells[0].isdigit():
        # Skip malformed union rows like "1128 | t科学家 |" where the word cell is polluted.
        if re.search(r"[\u4e00-\u9fff]", cells[1]):
            return []
        return [entry] if (entry := make_entry(cells[1], "", cells[2], source)) else []

    # | word | phonetic | meaning |
    if len(cells) >= 3:
        return [entry] if (entry := make_entry(cells[0], cells[1], cells[2], source)) else []

    return []


def parse_bullet(line: str, source: str) -> list[Entry]:
    stripped = line.strip()
    if not stripped.startswith("-"):
        return []
    body = clean_text(stripped[1:])
    if not body or body.startswith("["):
        return []
    match = PHONETIC_RE.search(body)
    if match:
        word = body[: match.start()].strip()
        rest = body[match.end() :].strip()
        return [entry] if (entry := make_entry(word, match.group(1), rest, source)) else []
    parts = body.split(maxsplit=1)
    if len(parts) == 2:
        return [entry] if (entry := make_entry(parts[0], "", parts[1], source)) else []
    return []


def parse_tsv(line: str, source: str) -> list[Entry]:
    if "\t" not in line:
        return []
    cells = [clean_text(cell) for cell in line.split("\t") if clean_text(cell)]
    if not cells:
        return []
    if cells[0].isdigit() and len(cells) >= 4:
        entry = make_entry(cells[1], cells[2], cells[3], source)
        return [entry] if entry else []

    # Alternating Chinese meaning + English/phonetic pairs in the old primary list.
    entries: list[Entry] = []
    if len(cells) >= 2 and re.search(r"[\u4e00-\u9fff]", cells[0]):
        for i in range(0, len(cells) - 1, 2):
            meaning = cells[i]
            word_phonetic = cells[i + 1]
            match = PHONETIC_RE.search(word_phonetic)
            if match:
                word = word_phonetic[: match.start()].strip()
                phonetic = match.group(1)
            else:
                parts = word_phonetic.split(maxsplit=1)
                word, phonetic = parts[0], ""
            entry = make_entry(word, phonetic, meaning, source)
            if entry:
                entries.append(entry)
    return entries


def parse_plain_line(line: str, source: str) -> list[Entry]:
    if line.lstrip().startswith("|"):
        return []
    line = clean_text(LEADING_NUMBER_RE.sub("", line))
    line = re.sub(r"^\d+\s*[、.)-]\s*", "", line).strip()
    if not line or line.startswith(("#", "注：", "第一册", "Starter Unit", "Unit ")):
        return []
    if re.search(r"[\u4e00-\u9fff]", line[:6]):
        return []

    match = PHONETIC_RE.search(line)
    if match:
        word = line[: match.start()].strip()
        rest = line[match.end() :].strip()
        return [entry] if (entry := make_entry(word, match.group(1), rest, source)) else []

    # Phrase without phonetic: "Good morning! 早上好！"
    cn = re.search(r"[\u4e00-\u9fff]", line)
    if cn:
        word = line[: cn.start()].strip()
        rest = line[cn.start() :].strip()
        return [entry] if (entry := make_entry(word, "", rest, source)) else []
    return []


def parse_file(path: Path) -> list[Entry]:
    rel = path.relative_to(RAW_ROOT).as_posix()
    entries: list[Entry] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        for parser in (parse_markdown_table, parse_bullet, parse_tsv, parse_plain_line):
            parsed = parser(line, rel)
            if parsed:
                entries.extend(parsed)
                break
    return entries


def merge_entries(paths: list[Path]) -> list[dict[str, str]]:
    merged: dict[str, Entry] = {}
    for path in paths:
        for entry in parse_file(path):
            key = entry.normalized_word
            current = merged.get(key)
            if current is None or entry.score > current.score:
                merged[key] = entry

    rows = []
    for key, entry in sorted(merged.items(), key=lambda item: item[0]):
        rows.append(
            {
                "id": key,
                "word": entry.word,
                "phonetic": entry.phonetic,
                "pos": entry.pos,
                "meaning": entry.meaning,
                "letter": key[:1].upper() if key[:1].isalpha() else "#",
            }
        )
    return rows


def write_json(path: Path, rows: list[dict[str, str]]) -> None:
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    datasets = {
        "primary_school": sorted((RAW_ROOT / "primary-school").glob("*.md")),
        "middle_school": sorted((RAW_ROOT / "middle-school").glob("*.md")),
    }
    for name, paths in datasets.items():
        rows = merge_entries(paths)
        out = DATA_DIR / f"{name}.json"
        write_json(out, rows)
        with_phonetic = sum(1 for row in rows if row["phonetic"])
        print(f"{name}: {len(rows)} words, {with_phonetic} with phonetic -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

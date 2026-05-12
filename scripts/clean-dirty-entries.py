#!/usr/bin/env python3
"""Clean dirty entries from middle_school.json and update enrichment sidecar.

Actions:
1. DELETE: word-root notes, garbled entries, typo-duplicates
2. DELETE: page-ref entries that duplicate existing words
3. EXTRACT: page-ref entries that don't duplicate → create real entries
4. FIX: typos
5. NORMALIZE: phrase formatting (... vs …)
6. CLEAN: enrichment file — remove entries for deleted IDs
"""

import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

def load_json(path):
    with open(path) as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {path} ({len(data) if isinstance(data, list) else len(data.keys())} entries)")

def main():
    ms = load_json(DATA_DIR / "middle_school.json")
    enrich = load_json(DATA_DIR / "enrichment" / "middle_school.enrichment.json")

    # Build lookup by id for dedup
    ms_by_id = {w['id']: i for i, w in enumerate(ms)}
    ms_by_word_lower = {}
    for i, w in enumerate(ms):
        key = w['word'].lower().strip()
        if key not in ms_by_word_lower:
            ms_by_word_lower[key] = []
        ms_by_word_lower[key].append(i)

    to_delete_ids = set()
    new_entries = []
    fixes = {}  # id -> {field: new_value}
    stats = {"deleted_garbage": 0, "deleted_duplicate_page_refs": 0,
             "extracted_new_entries": 0, "fixed_typos": 0, "normalized_phrases": 0}

    # ── 1. DELETE: word-root / garbled entries ──
    garbage_ids = [
        "anim+al→", "anim=life,spirit,", "cent=hundred,",
        "zoo=animal，", "assist+ant→", "v.aux.", "ad. v.."
    ]
    for gid in garbage_ids:
        if gid in ms_by_id:
            to_delete_ids.add(gid)
            stats["deleted_garbage"] += 1

    # ── 2. DELETE: elephan.t (typo duplicate of elephant) ──
    if "elephan.t" in ms_by_id and "elephant" in ms_by_id:
        to_delete_ids.add("elephan.t")
        stats["deleted_garbage"] += 1

    # ── 3. DELETE: page-ref duplicates ──
    page_dup_map = {
        "p.10": "macao",
        "p.14": "nobody",
        "p.17": "eve",
        "p.18": "postcard",
        "p.34": "produce",
        "p.36": "postman",
        "p.58": "anybody",
        "p.6":  "connect",
    }
    for pid, existing_id in page_dup_map.items():
        if pid in ms_by_id and existing_id in ms_by_id:
            to_delete_ids.add(pid)
            stats["deleted_duplicate_page_refs"] += 1

    # ── 4. EXTRACT: page-ref entries that are NOT duplicates ──
    # Each tuple: (page_id, new_id, word, phonetic, pos, meaning, letter)
    page_extract = [
        ("p.11", "dessert",     "dessert",      "/di'zə:(r)t/",   "n.",   "（饭后）甜点；甜食",              "D"),
        ("p.19", "staff",       "staff",        "/sta:f/",        "n.",   "管理人员；职工",                    "S"),
        ("p.2",  "pronunciation","pronunciation","/prənʌnsieIʃn/", "n.",   "发音；读音",                        "P"),
        ("p.20", "central",     "central",      "/sentrəl/",      "adj.", "中心的；中央的",                    "C"),
        ("p.22", "direction",   "direction",    "/direkʃn/",      "n.",   "方向；方位",                        "D"),
        ("p.42", "jayce",       "Jayce",        "/dʒeis/",        "",     "杰斯（人名）",                      "J"),
        ("p.45", "customer",    "customer",     "/kʌstəmə(r)/",   "n.",   "顾客；客户",                        "C"),
        ("p.46", "divide",      "divide",       "/divaid/",       "v.",   "分开；分散",                        "D"),
        ("p.60", "laboratory",  "laboratory",   "/ləbɔrətri/",    "n.",   "实验室",                            "L"),
        ("p.62", "midsummer",   "midsummer",    "/mɪdsəmə(r)/",   "n.",   "仲夏；中夏",                        "M"),
    ]
    for page_id, new_id, word, phonetic, pos, meaning, letter in page_extract:
        if page_id in ms_by_id:
            to_delete_ids.add(page_id)
        # Check if the new word already exists
        if new_id not in ms_by_id:
            new_entries.append({
                "id": new_id, "word": word, "phonetic": phonetic,
                "pos": pos, "meaning": meaning, "letter": letter
            })
            stats["extracted_new_entries"] += 1

    # ── 5. p.32 (将军) → update existing "general" ──
    if "p.32" in ms_by_id and "general" in ms_by_id:
        to_delete_ids.add("p.32")
        idx = ms_by_id["general"]
        existing_meaning = ms[idx].get("meaning", "")
        if "将军" not in existing_meaning:
            ms[idx]["meaning"] = existing_meaning + "；将军"
        stats["deleted_duplicate_page_refs"] += 1

    # ── 6. FIX: arithemetic → arithmetic ──
    if "arithemetic" in ms_by_id:
        idx = ms_by_id["arithemetic"]
        ms[idx]["id"] = "arithmetic"
        ms[idx]["word"] = "arithmetic"
        ms[idx]["phonetic"] = "/əˈrɪθmətɪk/"
        ms[idx]["pos"] = "n."
        stats["fixed_typos"] += 1
        # Update ms_by_id for subsequent lookups
        ms_by_id["arithmetic"] = idx

    # ── 7. NORMALIZE: phrases with .../… → consistent ... ──
    phrase_normalize = {
        "compare…with": "compare...with",
        "get…back": "get...back",
        "help...with": "help...with",    # already OK
        "learn...from": "learn...from",  # already OK
        "leave...behind": "leave...behind",  # already OK
        "pick…up": "pick...up",
        "stop...from": "stop...from",    # already OK
        "too...to": "too...to",          # already OK
    }
    for old_id, new_id in phrase_normalize.items():
        if old_id in ms_by_id and old_id != new_id:
            idx = ms_by_id[old_id]
            ms[idx]["id"] = new_id
            ms[idx]["word"] = new_id
            stats["normalized_phrases"] += 1

    # take…seriously → normalize
    if "take…seriously" in ms_by_id:
        idx = ms_by_id["take…seriously"]
        ms[idx]["id"] = "take...seriously"
        ms[idx]["word"] = "take...seriously"
        stats["normalized_phrases"] += 1

    # call(sb)back → call...back
    if "call(sb)back" in ms_by_id:
        idx = ms_by_id["call(sb)back"]
        ms[idx]["id"] = "call...back"
        ms[idx]["word"] = "call...back"
        ms[idx]["pos"] = "phr."
        stats["normalized_phrases"] += 1

    # ── APPLY DELETIONS ──
    ms_clean = [w for w in ms if w['id'] not in to_delete_ids]

    # ── ADD NEW ENTRIES ──
    ms_clean.extend(new_entries)

    # ── SORT alphabetically by letter then id ──
    letter_order = {chr(i): i for i in range(ord('A'), ord('Z')+1)}
    letter_order['#'] = 0  # symbols first

    def sort_key(w):
        letter = w.get('letter', '#')
        return (letter_order.get(letter, 99), w['id'].lower())

    ms_clean.sort(key=sort_key)

    # ── SAVE ──
    save_json(DATA_DIR / "middle_school.json", ms_clean)

    # ── CLEAN ENRICHMENT ──
    enrich_clean = {k: v for k, v in enrich.items() if k not in to_delete_ids}
    # Also remove enrichment entries for IDs that no longer exist
    valid_ids = {w['id'] for w in ms_clean}
    enrich_clean = {k: v for k, v in enrich_clean.items() if k in valid_ids}
    save_json(DATA_DIR / "enrichment" / "middle_school.enrichment.json", enrich_clean)

    # ── REPORT ──
    print(f"\n=== RESULTS ===")
    print(f"Original entries: {len(ms)}")
    print(f"Deleted: {len(to_delete_ids)}")
    print(f"  - Garbage: {stats['deleted_garbage']}")
    print(f"  - Duplicate page refs: {stats['deleted_duplicate_page_refs']}")
    print(f"New entries extracted: {stats['extracted_new_entries']}")
    print(f"Typos fixed: {stats['fixed_typos']}")
    print(f"Phrases normalized: {stats['normalized_phrases']}")
    print(f"Final entries: {len(ms_clean)}")
    print(f"Enrichment entries: {len(enrich_clean)}")

    # ── VERIFY: recount missing phonetics ──
    missing_p = sum(1 for w in ms_clean if not w.get('phonetic'))
    print(f"\nWords still missing phonetics: {missing_p}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Clean dirty entries from primary_school.json and update enrichment sidecar.

Actions:
1. DELETE: garbled entries, typo-duplicates, abbreviation duplicates
2. FIX: typos where no correct entry exists
3. ADD: phonetics for comparative/inflected pairs from base word
4. NORMALIZE: phrase formatting
5. CLEAN: enrichment sidecar
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data"

def load_json(path):
    with open(path) as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {path} ({len(data) if isinstance(data, list) else len(data.keys())} entries)")

# Hardcoded phonetics for base words missing from the JSON
MISSING_BASE_PHONETICS = {
    "fix": "[fɪks]",
    "laugh": "[lɑːf]",
    "lick": "[lɪk]",
    "low": "[ləʊ]",
    "ride": "[raɪd]",
}

def main():
    ps = load_json(DATA_DIR / "primary_school.json")
    enrich = load_json(DATA_DIR / "enrichment" / "primary_school.enrichment.json")

    ps_by_id = {w['id']: i for i, w in enumerate(ps)}

    to_delete_ids = set()
    fixes = {}  # id -> {field: new_value}
    stats = {
        "deleted_garbage": 0, "deleted_typo_duplicates": 0,
        "deleted_abbr_duplicates": 0, "fixed_typos": 0,
        "added_pair_phonetics": 0,
    }

    # ── 1. DELETE: garbled entries ──
    garbage = ["mʌðə ] （", "smaller （"]
    for gid in garbage:
        if gid in ps_by_id:
            to_delete_ids.add(gid)
            stats["deleted_garbage"] += 1

    # ── 2. DELETE: typo duplicates ──
    typo_dups = {
        "dinaosaur": "dinosaur",
        "dwon": "down",
        "samller": "smaller",
        "scientis": "scientist",
    }
    for wrong, correct in typo_dups.items():
        if wrong in ps_by_id and correct in ps_by_id:
            to_delete_ids.add(wrong)
            stats["deleted_typo_duplicates"] += 1

    # ── 3. DELETE: abbreviation duplicates ──
    abbr_dups = {
        "a.m": "a.m.",
        "a.m.(a.m.)": "a.m.",
        "p.m": "p.m.",
        "p.m.(p.m.)": "p.m.",
    }
    for wrong, keep in abbr_dups.items():
        if wrong in ps_by_id and keep in ps_by_id:
            to_delete_ids.add(wrong)
            stats["deleted_abbr_duplicates"] += 1

    # ── 4. FIX: typos (no correct entry exists) ──
    if "reades" in ps_by_id:
        idx = ps_by_id["reades"]
        ps[idx]["id"] = "reads"
        ps[idx]["word"] = "reads"
        ps[idx]["phonetic"] = "[riːdz]"
        ps[idx]["pos"] = "v."
        stats["fixed_typos"] += 1

    if "forty-on" in ps_by_id:
        idx = ps_by_id["forty-on"]
        ps[idx]["id"] = "forty-one"
        ps[idx]["word"] = "forty-one"
        ps[idx]["phonetic"] = "/ˌfɔːrti ˈwʌn/"
        stats["fixed_typos"] += 1

    # ice-skate: already correct, just add phonetic
    if "ice-skate" in ps_by_id:
        idx = ps_by_id["ice-skate"]
        if not ps[idx].get("phonetic"):
            ps[idx]["phonetic"] = "[ˈaɪs skeɪt]"
            ps[idx]["pos"] = "v."
            stats["fixed_typos"] += 1

    # ── 5. ADD phonetics for comparative/inflected pairs from base word ──
    pair_entries = [w for w in ps if '—' in w['id'] or ('-' in w['id'] and w['id'] not in [
        'mid-autumn', 'thirty-one', 'forty-one', 'ice-skate', 'smart-smarter'
    ])]

    for w in ps:
        pid = w['id']
        if '—' in pid or pid == 'smart-smarter':
            sep = '—' if '—' in pid else '-'
            base = pid.split(sep)[0]

            # Try existing base word first
            base_entry = next((bw for bw in ps if bw['id'] == base), None)
            if base_entry and base_entry.get('phonetic'):
                if not w.get('phonetic'):
                    w['phonetic'] = base_entry['phonetic']
                    stats["added_pair_phonetics"] += 1
            elif base in MISSING_BASE_PHONETICS:
                if not w.get('phonetic'):
                    w['phonetic'] = MISSING_BASE_PHONETICS[base]
                    stats["added_pair_phonetics"] += 1

    # ── 6. Normalize phrases ──
    phrase_fixes = {
        "having....class": "having...class",
    }
    for old_id, new_id in phrase_fixes.items():
        if old_id in ps_by_id:
            idx = ps_by_id[old_id]
            ps[idx]["id"] = new_id
            ps[idx]["word"] = new_id

    # ── APPLY DELETIONS ──
    ps_clean = [w for w in ps if w['id'] not in to_delete_ids]

    # ── SORT ──
    letter_order = {chr(i): i for i in range(ord('A'), ord('Z')+1)}
    letter_order['#'] = 0

    def sort_key(w):
        letter = w.get('letter', '#')
        return (letter_order.get(letter, 99), w['id'].lower())

    ps_clean.sort(key=sort_key)

    # ── SAVE ──
    save_json(DATA_DIR / "primary_school.json", ps_clean)

    # ── CLEAN ENRICHMENT ──
    valid_ids = {w['id'] for w in ps_clean}
    enrich_clean = {k: v for k, v in enrich.items() if k not in to_delete_ids and k in valid_ids}
    save_json(DATA_DIR / "enrichment" / "primary_school.enrichment.json", enrich_clean)

    # ── REPORT ──
    print(f"\n=== RESULTS ===")
    print(f"Original entries: {len(ps)}")
    print(f"Deleted: {len(to_delete_ids)}")
    print(f"  - Garbage: {stats['deleted_garbage']}")
    print(f"  - Typo duplicates: {stats['deleted_typo_duplicates']}")
    print(f"  - Abbreviation duplicates: {stats['deleted_abbr_duplicates']}")
    print(f"Typos fixed: {stats['fixed_typos']}")
    print(f"Pair phonetics added: {stats['added_pair_phonetics']}")
    print(f"Final entries: {len(ps_clean)}")
    print(f"Enrichment entries: {len(enrich_clean)}")

    # ── VERIFY ──
    missing_p = sum(1 for w in ps_clean if not w.get('phonetic'))
    print(f"\nWords still missing phonetics (raw, pre-enrichment): {missing_p}")

if __name__ == "__main__":
    main()

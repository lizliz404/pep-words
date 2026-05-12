#!/usr/bin/env python3
"""Build deterministic sidecar enrichment data.

This script does real fill work without polluting production JSON:
- phonetic: copied only from the other dataset when the same normalized id has one.
- pos: copied from the other dataset when available, otherwise inferred from the
  Chinese meaning with conservative high-confidence rules.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src" / "data"
ENRICH_DIR = DATA_DIR / "enrichment"
TODAY = date.today().isoformat()

DATASETS = ("primary_school", "middle_school")

PHRASE_MARKERS = (
    "短语",
    "一双",
    "一对",
    "一点",
    "少量",
    "大量",
    "许多",
    "一杯",
    "一瓶",
    "一片",
    "一条",
    "一张",
    "一套",
    "一组",
    "互相",
    "用英语",
    "早上好",
    "下午好",
    "晚上好",
    "再见",
    "当然",
    "等等",
)
NOUN_MARKERS = (
    "人", "者", "员", "家", "师", "生", "名", "物", "事", "东西", "地方", "地点",
    "时间", "颜色", "动物", "植物", "食物", "水果", "蔬菜", "身体", "头", "手", "脚",
    "学校", "教室", "房间", "书", "笔", "车", "衣服", "天气", "节日", "月份", "星期",
    "数字", "号码", "地图", "照片", "图片", "故事", "问题", "答案", "声音", "音乐",
    "电影", "比赛", "运动", "家庭", "父亲", "母亲", "爸爸", "妈妈", "哥哥", "姐姐",
)
VERB_MARKERS = (
    "做", "去", "来", "看", "听", "说", "读", "写", "吃", "喝", "买", "卖", "给", "拿",
    "带", "放", "打开", "关闭", "开始", "结束", "学习", "工作", "跑", "跳", "游泳", "唱",
    "跳舞", "帮助", "喜欢", "想", "认为", "知道", "记得", "忘记", "讨论", "决定", "到达",
    "离开", "居住", "参观", "等待", "使用", "需要", "变成", "成为", "保持", "发现",
)
ADJ_MARKERS = (
    "的", "好的", "坏的", "大的", "小的", "高的", "矮的", "长的", "短的", "新的", "旧的",
    "热的", "冷的", "暖和", "凉爽", "漂亮", "美丽", "有趣", "重要", "困难", "容易", "忙的",
    "累的", "开心", "高兴", "伤心", "生气", "害怕", "饥饿", "渴", "年轻", "年老", "健康",
)
ADV_MARKERS = ("地", "也", "很", "非常", "经常", "总是", "通常", "有时", "从不", "已经", "刚刚")
PREP_MARKERS = ("在……", "在...", "关于", "对于", "从", "到", "向", "进入", "通过", "用；以", "作为")
PRON_MARKERS = ("我", "你", "他", "她", "它", "我们", "你们", "他们", "她们", "这个", "那个", "这些", "那些", "谁", "什么")
CONJ_MARKERS = ("和；与", "或者", "但是", "因为", "所以", "如果", "当……时")
NUM_MARKERS = ("一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "百", "千", "第一", "第二")
INTERJ_MARKERS = ("嗨", "喂", "你好", "谢谢", "请", "哎呀", "啊")


def load(name: str) -> list[dict[str, str]]:
    return json.loads((DATA_DIR / f"{name}.json").read_text(encoding="utf-8"))


def infer_pos(word: str, meaning: str) -> tuple[str, float] | None:
    text = meaning.strip()
    lower_word = word.lower()

    if " " in lower_word or any(marker in text for marker in PHRASE_MARKERS):
        return "phr.", 0.92
    if lower_word.endswith("ly") or any(marker in text for marker in ADV_MARKERS):
        return "adv.", 0.86
    if any(marker in text for marker in PREP_MARKERS):
        return "prep.", 0.86
    if any(marker == text or text.startswith(marker) for marker in PRON_MARKERS):
        return "pron.", 0.9
    if any(marker in text for marker in CONJ_MARKERS):
        return "conj.", 0.88
    if text in NUM_MARKERS or any(text.startswith(marker) for marker in NUM_MARKERS):
        return "num.", 0.88
    if any(marker in text for marker in INTERJ_MARKERS):
        return "interj.", 0.86
    if any(marker in text for marker in VERB_MARKERS):
        return "v.", 0.84
    if any(marker in text for marker in ADJ_MARKERS):
        return "adj.", 0.84
    if any(marker in text for marker in NOUN_MARKERS):
        return "n.", 0.84
    return None


def merge_record(existing: dict, patch: dict) -> dict:
    merged = dict(existing)
    source_parts = set(str(merged.get("source", "")).split("+")) if merged.get("source") else set()
    source_parts.add(patch.pop("source"))
    merged.update(patch)
    merged["source"] = "+".join(sorted(source_parts))
    merged["updated_at"] = TODAY
    return merged


def main() -> None:
    ENRICH_DIR.mkdir(parents=True, exist_ok=True)
    data = {name: load(name) for name in DATASETS}
    by_id = {name: {row["id"]: row for row in rows} for name, rows in data.items()}

    for name in DATASETS:
        other = "middle_school" if name == "primary_school" else "primary_school"
        enrichment: dict[str, dict] = {}

        for row in data[name]:
            patch: dict = {}
            other_row = by_id[other].get(row["id"])
            sources: list[str] = []
            confidence = 0.0

            if not row.get("phonetic") and other_row and other_row.get("phonetic"):
                patch["phonetic"] = other_row["phonetic"]
                sources.append("cross_dataset")
                confidence = max(confidence, 0.95)

            if not row.get("pos"):
                if other_row and other_row.get("pos"):
                    patch["pos"] = other_row["pos"]
                    sources.append("cross_dataset")
                    confidence = max(confidence, 0.92)
                else:
                    inferred = infer_pos(row["word"], row["meaning"])
                    if inferred and inferred[1] >= 0.8:
                        patch["pos"] = inferred[0]
                        sources.append("rule_pos_inference")
                        confidence = max(confidence, inferred[1])

            if patch:
                patch["source"] = "+".join(sorted(set(sources)))
                patch["confidence"] = round(confidence, 2)
                patch["manual_review_required"] = confidence < 0.9 or "rule_pos_inference" in sources
                patch["updated_at"] = TODAY
                enrichment[row["id"]] = patch

        out = ENRICH_DIR / f"{name}.enrichment.json"
        out.write_text(json.dumps(enrichment, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        phonetic_count = sum("phonetic" in row for row in enrichment.values())
        pos_count = sum("pos" in row for row in enrichment.values())
        print(f"{name}: {len(enrichment)} entries, {phonetic_count} phonetic, {pos_count} pos -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

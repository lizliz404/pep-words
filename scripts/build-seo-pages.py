#!/usr/bin/env python3
"""Generate static SEO landing pages for PEP Words.

The app itself is a Vite SPA, but the vocabulary data is static and valuable for
search. This script turns the canonical JSON word lists into lightweight HTML
pages under public/seo/ and writes sitemap.xml. It is intentionally dependency
free so it can run before every build without becoming a maintenance burden.
"""

from __future__ import annotations

import html
import json
import re
import shutil
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
SEO_DIR = PUBLIC_DIR / "seo"
DATA_DIR = ROOT / "src" / "data"
SITE_URL = "https://pep-words.lizliz.xyz"
MAX_WORD_PAGES_PER_DATASET = 240


@dataclass(frozen=True)
class Dataset:
    key: str
    path_slug: str
    title: str
    short_title: str
    json_file: str
    app_hash: str


DATASETS = [
    Dataset(
        key="primary_school",
        path_slug="primary-school",
        title="人教版 PEP 小学英语单词表",
        short_title="小学英语单词",
        json_file="primary_school.json",
        app_hash="#/primary-school",
    ),
    Dataset(
        key="middle_school",
        path_slug="middle-school",
        title="人教版 PEP 初中英语单词表",
        short_title="初中英语单词",
        json_file="middle_school.json",
        app_hash="#/middle-school",
    ),
]

CSS = """
:root{color-scheme:light;--bg:#faf9f5;--card:#fffaf1;--ink:#241f1a;--muted:#6c6258;--line:#d6cbbb;--accent:#526a7f}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.65}.wrap{width:min(1080px,calc(100% - 32px));margin:0 auto;padding:40px 0 56px}.crumb{font-size:14px;color:var(--muted);margin-bottom:20px}.crumb a{color:var(--accent);text-decoration:none}header{padding:30px;border:1px solid var(--line);background:linear-gradient(135deg,#fffaf1,#f4efe5);border-radius:28px}h1{font-size:clamp(30px,5vw,56px);line-height:1.08;margin:0 0 14px}p{margin:0 0 12px}.lead{font-size:18px;color:var(--muted);max-width:780px}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}.btn{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:10px 16px;color:var(--ink);background:#fff;text-decoration:none;font-weight:700}.btn.primary{background:var(--ink);color:#fff}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:24px}.card{border:1px solid var(--line);border-radius:20px;background:var(--card);padding:18px}.word{font-size:22px;font-weight:800}.meta{color:var(--muted);font-size:14px}.meaning{margin-top:8px}.letters{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0}.letters a{border:1px solid var(--line);border-radius:999px;padding:6px 11px;color:var(--accent);background:#fff;text-decoration:none;font-weight:700}section{margin-top:34px}h2{font-size:24px;margin:0 0 14px}footer{margin-top:42px;color:var(--muted);font-size:14px}code{background:#efe7db;padding:2px 5px;border-radius:6px}
""".strip()


def esc(value: object) -> str:
    return html.escape(str(value or ""), quote=True)


def slugify_word(word: str) -> str:
    slug = word.strip().lower()
    slug = slug.replace("'", "")
    slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
    return slug or "word"


def slugify_letter(letter: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", letter.strip().lower()).strip("-")
    return slug or "other"


def display_letter(letter: str) -> str:
    return "其他" if letter == "#" else letter


def page_shell(*, title: str, description: str, canonical: str, body: str) -> str:
    json_ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "url": canonical,
        "description": description,
        "isPartOf": {"@type": "WebSite", "name": "PEP Words", "url": SITE_URL + "/"},
        "inLanguage": "zh-CN",
    }
    return f"""<!doctype html>
<html lang=\"zh-CN\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>{esc(title)}</title>
    <meta name=\"description\" content=\"{esc(description)}\" />
    <meta name=\"robots\" content=\"index, follow, max-image-preview:large\" />
    <link rel=\"canonical\" href=\"{esc(canonical)}\" />
    <meta property=\"og:type\" content=\"article\" />
    <meta property=\"og:site_name\" content=\"PEP Words\" />
    <meta property=\"og:title\" content=\"{esc(title)}\" />
    <meta property=\"og:description\" content=\"{esc(description)}\" />
    <meta property=\"og:url\" content=\"{esc(canonical)}\" />
    <style>{CSS}</style>
    <script type=\"application/ld+json\">{json.dumps(json_ld, ensure_ascii=False)}</script>
  </head>
  <body>
    <main class=\"wrap\">{body}</main>
  </body>
</html>
"""


def word_card(word: dict[str, str]) -> str:
    pos = f" · {esc(word.get('pos'))}" if word.get("pos") else ""
    phonetic = f"<span>{esc(word.get('phonetic'))}</span>" if word.get("phonetic") else ""
    return f"""<article class=\"card\">
  <div class=\"word\">{esc(word.get('word'))}</div>
  <div class=\"meta\">{phonetic}{pos}</div>
  <div class=\"meaning\">{esc(word.get('meaning'))}</div>
</article>"""


def write_page(relative_path: str, html_text: str, urls: list[str]) -> None:
    path = PUBLIC_DIR / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(html_text, encoding="utf-8")
    urls.append(f"{SITE_URL}/{relative_path.removesuffix('index.html')}")


def load_words(dataset: Dataset) -> list[dict[str, str]]:
    words = json.loads((DATA_DIR / dataset.json_file).read_text(encoding="utf-8"))
    return sorted(words, key=lambda item: (item.get("letter") or "#", item.get("word") or ""))


def build_dataset_page(dataset: Dataset, words: list[dict[str, str]], urls: list[str]) -> None:
    by_letter: dict[str, list[dict[str, str]]] = defaultdict(list)
    for word in words:
        by_letter[word.get("letter") or "#"].append(word)

    sample = words[:36]
    letters = "".join(
        f"<a href=\"letter-{slugify_letter(letter)}/\">{esc(display_letter(letter))}</a>" for letter in sorted(by_letter)
    )
    body = f"""
<div class=\"crumb\"><a href=\"/\">PEP Words</a> / {esc(dataset.short_title)}</div>
<header>
  <h1>{esc(dataset.title)}</h1>
  <p class=\"lead\">共收录 {len(words)} 个词条，按字母分组展示英文、音标、词性和中文释义。这个静态页面用于搜索索引；完整收藏、卡片和测试功能请进入应用。</p>
  <div class=\"actions\"><a class=\"btn primary\" href=\"/{dataset.app_hash}\">打开交互学习工具</a><a class=\"btn\" href=\"/seo/\">查看全部 SEO 页面</a></div>
</header>
<nav class=\"letters\" aria-label=\"字母索引\">{letters}</nav>
<section><h2>词表示例</h2><div class=\"grid\">{''.join(word_card(w) for w in sample)}</div></section>
<footer>数据来自 PEP Words 本地词表 JSON；页面由 <code>scripts/build-seo-pages.py</code> 自动生成。</footer>
"""
    write_page(
        f"seo/{dataset.path_slug}/index.html",
        page_shell(
            title=f"{dataset.title}｜PEP Words",
            description=f"{dataset.title}，共 {len(words)} 个词条，包含英文、音标、词性和中文释义，并可进入 PEP Words 做卡片复习和测试。",
            canonical=f"{SITE_URL}/seo/{dataset.path_slug}/",
            body=body,
        ),
        urls,
    )

    for letter in sorted(by_letter):
        letter_words = by_letter[letter]
        letter_slug = slugify_letter(letter)
        letter_name = display_letter(letter)
        body = f"""
<div class=\"crumb\"><a href=\"/\">PEP Words</a> / <a href=\"../\">{esc(dataset.short_title)}</a> / {esc(letter_name)}</div>
<header>
  <h1>{esc(letter_name)} 词表</h1>
  <p class=\"lead\">{esc(dataset.title)}中以 {esc(letter_name)} 开头或归类到 {esc(letter_name)} 的词条，共 {len(letter_words)} 个。</p>
  <div class=\"actions\"><a class=\"btn primary\" href=\"/{dataset.app_hash}\">打开交互学习工具</a><a class=\"btn\" href=\"../\">返回完整词表</a></div>
</header>
<section><h2>{esc(letter_name)} 词条</h2><div class=\"grid\">{''.join(word_card(w) for w in letter_words)}</div></section>
"""
        write_page(
            f"seo/{dataset.path_slug}/letter-{letter_slug}/index.html",
            page_shell(
                title=f"{dataset.short_title} {letter_name} 词表｜PEP Words",
                description=f"{dataset.short_title} {letter_name} 词表，共 {len(letter_words)} 个 PEP 英语词条，含中文释义、音标和词性。",
                canonical=f"{SITE_URL}/seo/{dataset.path_slug}/letter-{letter_slug}/",
                body=body,
            ),
            urls,
        )

    seen_slugs: set[str] = set()
    for word in words[:MAX_WORD_PAGES_PER_DATASET]:
        base_slug = slugify_word(word.get("word", ""))
        slug = base_slug
        counter = 2
        while slug in seen_slugs:
            slug = f"{base_slug}-{counter}"
            counter += 1
        seen_slugs.add(slug)
        body = f"""
<div class=\"crumb\"><a href=\"/\">PEP Words</a> / <a href=\"../\">{esc(dataset.short_title)}</a> / {esc(word.get('word'))}</div>
<header>
  <h1>{esc(word.get('word'))} 的中文意思</h1>
  <p class=\"lead\">{esc(word.get('word'))} 在{esc(dataset.short_title)}词表中的意思是：{esc(word.get('meaning'))}。</p>
  <div class=\"actions\"><a class=\"btn primary\" href=\"/{dataset.app_hash}\">打开 PEP Words 练习</a><a class=\"btn\" href=\"../\">返回词表</a></div>
</header>
<section><h2>词条信息</h2><div class=\"grid\">{word_card(word)}</div></section>
"""
        write_page(
            f"seo/{dataset.path_slug}/word/{slug}/index.html",
            page_shell(
                title=f"{word.get('word')} 是什么意思｜{dataset.short_title}｜PEP Words",
                description=f"{word.get('word')} 的中文意思是 {word.get('meaning')}。查看音标、词性，并进入 PEP Words 做卡片复习和测试。",
                canonical=f"{SITE_URL}/seo/{dataset.path_slug}/word/{slug}/",
                body=body,
            ),
            urls,
        )


def build_index(urls: list[str]) -> None:
    body = """
<div class=\"crumb\"><a href=\"/\">PEP Words</a> / SEO index</div>
<header>
  <h1>PEP Words 可索引词表页面</h1>
  <p class=\"lead\">这些静态页面由词表数据自动生成，用于让搜索引擎理解 PEP Words 的小学和初中英语词汇内容。日常学习请使用主应用。</p>
  <div class=\"actions\"><a class=\"btn primary\" href=\"/\">打开主应用</a><a class=\"btn\" href=\"primary-school/\">小学词表</a><a class=\"btn\" href=\"middle-school/\">初中词表</a></div>
</header>
<section><h2>入口</h2><div class=\"grid\"><article class=\"card\"><div class=\"word\"><a href=\"primary-school/\">小学英语单词</a></div><div class=\"meaning\">人教版 PEP 小学英语词汇。</div></article><article class=\"card\"><div class=\"word\"><a href=\"middle-school/\">初中英语单词</a></div><div class=\"meaning\">人教版 PEP 初中英语词汇。</div></article></div></section>
"""
    write_page(
        "seo/index.html",
        page_shell(
            title="PEP Words 可索引词表页面",
            description="PEP Words 自动生成的小学和初中英语词表静态页面，帮助搜索引擎索引英文单词、中文释义、音标和词性。",
            canonical=f"{SITE_URL}/seo/",
            body=body,
        ),
        urls,
    )


def write_sitemap(urls: Iterable[str]) -> None:
    static_urls = [SITE_URL + "/", SITE_URL + "/legacy-blue"]
    all_urls = static_urls + list(urls)
    body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
    body += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
    for url in all_urls:
        priority = "1.0" if url == SITE_URL + "/" else "0.7"
        changefreq = "weekly" if "/seo/" in url or url == SITE_URL + "/" else "monthly"
        body += f"  <url>\n    <loc>{esc(url)}</loc>\n    <changefreq>{changefreq}</changefreq>\n    <priority>{priority}</priority>\n  </url>\n"
    body += "</urlset>\n"
    (PUBLIC_DIR / "sitemap.xml").write_text(body, encoding="utf-8")


def main() -> None:
    if SEO_DIR.exists():
        shutil.rmtree(SEO_DIR)
    urls: list[str] = []
    build_index(urls)
    for dataset in DATASETS:
        build_dataset_page(dataset, load_words(dataset), urls)
    write_sitemap(urls)
    print(f"Generated {len(urls)} SEO URLs under {SEO_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

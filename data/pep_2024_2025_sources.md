# 人教版 PEP 新版（2024/2025 修订）词汇来源清单（V1）

> 抓取日期：2026-04-01（UTC）
> 目的：给后续 agent 提供可复用、可追溯的“外部真实来源”入口。

## A. 主数据来源（可直接提取单词+音标+中文）

这些页面都标注了教材版本与出版社（人民教育出版社），并按 Unit 列出单词、音标、中文释义，适合直接转成 Markdown/JSON。

- 三年级上册：<https://yyld.51jiaoxi.com/sanshang/rjbp_danci.html>
- 三年级下册：<https://yyld.51jiaoxi.com/sanxia/rjbp_danci.html>
- 四年级上册：<https://yyld.51jiaoxi.com/sishang/rjbp_danci.html>
- 四年级下册：<https://yyld.51jiaoxi.com/sixia/rjbp_danci.html>
- 五年级上册：<https://yyld.51jiaoxi.com/wushang/rjbp_danci.html>
- 五年级下册：<https://yyld.51jiaoxi.com/wuxia/rjbp_danci.html>
- 六年级上册：<https://yyld.51jiaoxi.com/liushang/rjbp_danci.html>
- 六年级下册：<https://yyld.51jiaoxi.com/liuxia/rjbp_danci.html>

## B. 官方侧佐证来源（版本与修订背景）

- 人教社新闻（2024-09-05）：新版英语配套教师用书说明（含 PEP）
  - <https://www.pep.com.cn/rjdt/rjdt/202409/t20240905_1994696.shtml>

## C. 清洗建议（给后续 agent）

1. 抓取每个页面中：`Unit N` -> `word` -> `phonetic` -> `翻译`。
2. 保留多词条（如 `red panda`、`piggy bank`）。
3. 去除页面导航、广告、下载按钮等噪声。
4. 输出建议：
   - `data/pep-2024-2025-vocab.md`（人读）
   - `data/pep-2024-2025-vocab.json`（程序读）

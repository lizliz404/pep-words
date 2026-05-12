# PEP Words

![PEP Words screenshot](./public/pep-words-screenshot.png)

<p align="center">
  <a href="https://pep-words.lizliz.xyz/">Live site</a>
  ·
  <a href="./README.en.md">English</a>
</p>

`PEP Words` 是一个面向人教版 PEP 英语词汇的轻量学习站点：查词、浏览、收藏、卡片复习、小测验，以及原始词表阅读。

它不是完整教学平台，也不做账号、同步、广告、追踪或复杂后台。目标很窄：把学生/家长/老师真正会用到的词汇检索和记忆闭环做快、清楚、稳定。

## 在线访问

- 正式站点：<https://pep-words.lizliz.xyz/>
- 旧蓝色视觉对比页：<https://pep-words.lizliz.xyz/legacy-blue>

## 功能

- 小学 / 初中词汇分库浏览
- 英文单词与中文释义搜索
- A–Z 字母筛选
- 收藏单词并导出
- 卡片模式复习
- 选择题小测验
- 中英文界面切换
- 原始 Markdown 词表阅读

## 页面入口

- `#/middle-school`：初中词汇学习
- `#/primary-school`：小学词汇学习
- `#/docs/middle-school`：初中词表原文
- `#/docs/primary-school`：小学词表原文

## 技术栈

- `React 19`
- `Vite`
- `TypeScript`
- `Tailwind CSS 4`

运行时依赖刻意保持很小：核心只有 `react` 和 `react-dom`。数据和界面都作为静态资源构建，适合部署到 Cloudflare Pages 这类静态托管平台。

## 本地开发

```bash
npm install
npm run dev
```

常用验证：

```bash
npm run check
npm run build
npm run words:validate
npm run words:validate-enrichment
```

预览构建产物：

```bash
npm run preview
```

## 数据边界

当前运行数据在：

- `src/data/middle_school.json`
- `src/data/primary_school.json`
- `src/data/enrichment/`
- `src/data/*.md`

清洗和校验脚本在 `scripts/`。数据验证通过不等于内容绝对正确；它只保证结构、明显格式错误和部分质量规则没有失败。内容校对仍应以教材来源和抽样复核为准。

## 部署

当前推荐部署方式：GitHub-connected Cloudflare Pages。

- Build command: `npm run build`
- Output directory: `dist`
- Production URL: <https://pep-words.lizliz.xyz/>

`public/_redirects` 用于让直接访问 `/legacy-blue` 等 SPA path 时回落到 `index.html`。

# PEP Words

[English](./README.en.md)

## 项目定位

这个仓库现在只保留一个正式版本：`learner/`。

它负责词汇浏览、收藏、测试，以及两份词表 Markdown 的直接阅读。历史上的 1.0 单文件 HTML 已经归档，不再作为正式入口维护。

## 技术栈

- React 19
- Vite
- TypeScript
- Tailwind CSS 4

## 运行

```bash
cd learner
corepack pnpm install
pnpm dev
```

打开 `http://localhost:3000`。

## 构建

```bash
cd learner
pnpm build
pnpm preview
```

构建产物输出到 `learner/dist/public`。由于使用的是相对资源路径，构建后的 `index.html` 也可以直接打开。

## 正式入口

- 页面入口：`learner/index.html`
- 启动文件：`learner/src/main.tsx`
- 应用壳层：`learner/src/App.tsx`

## 目录说明

- `learner/`：正式应用源码和构建配置
- `archive/v1-single-file/`：历史 1.0 单文件版本，仅保留参考价值
- `archive/raw-materials/`：原始词表、网页快照、合并稿和旧资料，不参与当前运行

## 说明

- 当前运行中的词库数据位于 `learner/src/data/`。
- 本轮没有处理两份运行中 Markdown 词表的正文内容，只整理了结构和入口。

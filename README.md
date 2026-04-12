# PEP Words

[English Documentation](./README.en.md)

## 项目概述

`PEP Words` 是一个围绕人教版英语词汇整理出来的轻量 Web 学习工具。它当前聚焦三件事：

1. 让用户快速检索和浏览小学、初中词汇。
2. 让用户用收藏、卡片和小测验做最基本的记忆训练。
3. 让用户直接阅读两份原始 Markdown 词表，保留资料的直观可见性。

这个仓库现在只有一个正式运行版本。历史上的 1.0 单文件 HTML 已经归档，只保留参考价值，不再作为主入口维护。

## 产品层说明

当前产品是一个静态词汇学习站点，不依赖后端服务，不做账号体系，不做在线同步，也不做复杂数据编辑。它的目标不是做完整教学平台，而是把“查词、看词、记词、测词”这一条最短闭环做顺。

站点包含 4 个页面入口：

- `#/middle-school`：初中词汇学习页
- `#/primary-school`：小学词汇学习页
- `#/docs/middle-school`：初中词表原文页
- `#/docs/primary-school`：小学词表原文页

保留的核心功能：

- 搜索与按字母浏览
- 单词卡片翻转
- 收藏
- 简单选择题测试
- 中英文界面切换
- 原始 Markdown 文档直接阅读

## 技术层说明

这个项目现在是一个纯前端静态应用，技术栈刻意收得很小：

- `React 19`：负责页面组件、状态和交互
- `Vite`：负责开发服务器和构建
- `TypeScript`：负责类型约束
- `Tailwind CSS 4`：负责样式组织

当前真正的运行时依赖只有：

- `react`
- `react-dom`

其余依赖都属于开发工具链，而不是业务功能依赖。也就是说，这个项目并没有“业务层很重”，只是采用了正常的源码工程结构，而不是把所有代码硬塞进一个 HTML。

## 为什么 1.0 可以单文件运行

归档里的 1.0 版本之所以看起来只靠一个 `index.html` 就能跑，是因为它把这几样东西都塞在了一起：

- 样式直接内联在 HTML 里
- 逻辑直接内联在 HTML 里
- 数据直接编码后内嵌在 HTML 里
- 图表额外依赖一个 CDN 脚本

这种方式适合“快速分发一个演示文件”，但不适合继续维护。它不是没有复杂度，而是把复杂度折叠进了单文件里。

## 当前目录结构

- `index.html`：正式页面入口
- `src/`：正式应用源码
- `package.json`：依赖和脚本
- `vite.config.ts`：Vite 构建配置
- `tsconfig.json`：TypeScript 配置
- `archive/v1-single-file/`：历史单文件版本
- `archive/raw-materials/`：原始词表、快照、草稿和旧资料

## 运行与测试

开发模式：

```bash
corepack pnpm install
pnpm dev
```

默认打开地址：

```text
http://localhost:3000
```

注意：

- 根目录 `index.html` 是源码入口，应该通过 `pnpm dev` 提供的 Vite 开发服务器访问。
- 如果只是直接双击源码 `index.html`，浏览器不会正确处理 `TypeScript/TSX` 和 Vite 的模块解析。
- 想要直接打开文件，请先构建，再打开 `dist/index.html`。

构建验证：

```bash
pnpm build
pnpm preview
```

构建产物位于：

```text
dist/index.html
```

这份构建产物使用相对资源路径，可以直接打开。

## 资料与归档边界

当前运行中的数据在 `src/data/`，它们属于正式应用的一部分。

`archive/raw-materials/` 里的内容不参与当前运行，它们保留下来只是为了后续做数据校对、来源追溯和内容清洗。这里面仍然有一些重复稿、合并稿和原始 Office 文档，属于“可继续压缩”的历史材料，而不是产品本体。

## 当前值得继续优化的方向

- 清洗界面层中文乱码，尤其是 `src/i18n.ts`
- 继续收缩 `archive/raw-materials/`，把“原始来源”和“重复草稿”拆开
- 对大词库做懒加载，减小首包体积
- 给词库增加更稳定的结构化来源，减少对 Markdown 解析的脆弱依赖
## Deploy

- Netlify / Vercel: build command `corepack pnpm build`, output directory `dist`
- Cloudflare: keep `wrangler.jsonc`, then run `npx --yes wrangler deploy`

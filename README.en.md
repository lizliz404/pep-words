# PEP Words

## Overview

`PEP Words` is a lightweight web app built around PEP English vocabulary lists. It currently focuses on three things:

1. Fast lookup and browsing for primary-school and middle-school vocabulary.
2. Basic memorization workflows through favorites, flashcards, and quizzes.
3. Direct reading of the original markdown word lists.

The repository now has one active runtime only. The old 1.0 single-file HTML version has been archived for reference and is no longer the main entry point.

## Product Layer

This is a static vocabulary study site. It does not include a backend, user accounts, cloud sync, or full authoring tools. The goal is narrower and more practical: make the shortest useful loop of search, browse, save, and test work well.

Active routes:

- `#/middle-school`
- `#/primary-school`
- `#/docs/middle-school`
- `#/docs/primary-school`

Core product features:

- Search and alphabet browsing
- Flashcard-style word review
- Favorites
- Simple multiple-choice quizzes
- Chinese / English UI switching
- Direct markdown document reading

## Technical Layer

This is now a small static frontend project:

- `React 19` for UI composition and state
- `Vite` for development and builds
- `TypeScript` for typing
- `Tailwind CSS 4` for styling

The real runtime dependency surface is still small:

- `react`
- `react-dom`

Everything else is tooling. The project is not heavy at the product layer; it simply uses a normal source-code structure instead of hiding everything inside one HTML file.

## Why Version 1.0 Worked as a Single File

The archived 1.0 version worked as one HTML file because it packed everything together:

- styles inline in the HTML
- logic inline in the HTML
- data embedded into the HTML
- one extra CDN dependency for charts

That makes distribution easy, but maintenance worse. The complexity is not gone. It is just compressed into one file.

## Current Structure

- `index.html`: active page entry
- `src/`: active application source
- `package.json`: dependencies and scripts
- `vite.config.ts`: build configuration
- `tsconfig.json`: TypeScript configuration
- `archive/v1-single-file/`: archived historical single-file version
- `archive/raw-materials/`: raw word lists, snapshots, drafts, and old materials

## Run and Test

Development:

```bash
corepack pnpm install
pnpm dev
```

Default local URL:

```text
http://localhost:3000
```

Important:

- The root `index.html` is the source entry and should be served through `pnpm dev`.
- If you open the source `index.html` directly, the browser will not handle `TypeScript/TSX` or Vite module resolution correctly.
- If you want a directly openable file, build first and open `dist/public/index.html`.

Build validation:

```bash
pnpm build
pnpm preview
```

Build output:

```text
dist/public/index.html
```

The built file uses relative asset paths and can be opened directly.

## Data and Archive Boundary

The active runtime data lives in `src/data/`.

Everything under `archive/raw-materials/` is outside the active runtime path. Those files are kept only for source tracing, cleanup work, and future data correction. That archive still contains draft variants and duplicated source material, so it is a valid cleanup target, not part of the actual product.

## Next High-Value Improvements

- clean up corrupted Chinese UI strings, especially in `src/i18n.ts`
- split `archive/raw-materials/` into true sources vs redundant drafts
- lazy-load large datasets to reduce the initial bundle
- move toward a more stable structured vocabulary source instead of relying so heavily on markdown parsing

# PEP Words

## Overview

This repository now keeps one official app: `learner/`.

It handles vocabulary browsing, favorites, quizzes, and direct reading of the two markdown word lists. The old single-file 1.0 HTML has been archived and is no longer treated as the active entry point.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS 4

## Run

```bash
cd learner
corepack pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Build

```bash
cd learner
pnpm build
pnpm preview
```

The build output is written to `learner/dist/public`. The built `index.html` uses relative asset paths, so it can also be opened directly.

## Active Entry Points

- Page entry: `learner/index.html`
- Bootstrap: `learner/src/main.tsx`
- App shell: `learner/src/App.tsx`

## Structure

- `learner/`: active app source and build configuration
- `archive/v1-single-file/`: archived 1.0 single-file version
- `archive/raw-materials/`: raw word lists, snapshots, drafts, and other reference files

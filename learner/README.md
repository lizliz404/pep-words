# PEP English Vocabulary Learner

## Goal

Lightweight static site for browsing PEP vocabulary, saving words, taking a quick quiz, and directly reading the original markdown word lists.

## Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS 4

## Run

```bash
corepack pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Build

```bash
pnpm build
pnpm preview
```

The build now uses relative asset paths and hash routes, so `dist/public/index.html` can also be opened directly with `file://`.

## Pages

- `#/middle-school`: middle-school vocabulary explorer
- `#/primary-school`: primary-school vocabulary explorer
- `#/docs/middle-school`: rendered markdown document for middle-school words
- `#/docs/primary-school`: rendered markdown document for primary-school words

## Core Functionality

- Search and browse vocabulary by letter
- Flashcard mode
- Favorites stored in localStorage per dataset
- Simple multiple-choice quiz
- Chinese / English UI switch
- Direct markdown document browsing

## Structure

- `client/src/App.tsx`: site shell, hash routing, language switch
- `client/src/pages/VocabularyLearner.tsx`: reusable vocabulary explorer page
- `client/src/components/MarkdownDocument.tsx`: lightweight markdown renderer
- `client/src/content.ts`: dataset and markdown loading
- `client/src/data/`: structured words and markdown source files

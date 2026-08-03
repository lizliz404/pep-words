# Craft checklist pass — 2026-08-03

Product: **PEP Words** (`pep-words.brainrush.run`)  
Type: **learning tool** (vocab search / cards / quiz / docs)  
Starter: selection + prm + scrollbar; empty search polish; light progress on long views

## Already present

- Local favorites + export; flashcards; quiz progress bars
- Favorites empty state = title + description (item 13)
- OG / Twitter / JSON-LD / sitemap / SEO pages (`index.html`, `public/seo/`)
- Paper grid texture on `body::before` (material feel without pack noise)
- Mobile: immediate single-tap actions (project `AGENTS.md`)
- Feedback modal with fact + next-step error copy

## Implemented this pass

| Item | Files |
|---|---|
| 附 A: `::selection` + thin scrollbar + smooth scroll + prm kill-switch | `src/styles/premium-one-pager.css`, `src/lib/premium-one-pager.ts`, wired in `src/main.tsx` |
| 附 A: light top scroll progress (docs / long lists) | same; brand tokens `#9c5d30` → `#526a7f` |
| Skip chapter dots / reveal / noise | `initPremiumOnePager({ enableChapters: false, enableReveal: false, enableNoise: false })` |
| Empty search = title + hint + clear CTA | `src/pages/VocabularyLearner.tsx`, `src/i18n.ts` |
| prm on existing fade/pop / tooltip transitions | `src/index.css` |
| Error copy = fact + next step + Refresh CTA | `src/App.tsx` `RouteStatus` |
| Loading honesty (route-specific stage line) | `src/App.tsx` |
| theme-color aligned to `--page-bg` | `index.html` `#eee8dc` |

## Explicitly skipped

- **Chapter dots** — tool shell, not narrative LP; &lt;3 marketing sections
- **pop-reveal** — protect LCP hero / nav; list virtualization already quiet
- **SVG noise overlay** — paper grid already on `body`; avoid double grain
- Cmd+K, undo toast, skeleton lists, OG regen — wrong stage / already covered / low ROI
- Legacy-blue theme polish — frozen alternate skin

## Residual P2/P3 (do not implement now)

- Favorites empty could add a one-tap “switch to List” CTA (needs viewMode lift)
- Quiz complete celebration is calm already; don’t add confetti
- Nested progress if a future in-app scroller replaces `window` scroll
- Changelog / status page — ops growth, out of this pass

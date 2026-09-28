# AGENTS.md

Project-specific guardrails for PEP Words. Follow global instructions too; this file narrows recurring failure modes for this app.

## Product goal

Keep PEP Words stable, boring, fast, and easy to maintain. Prefer small fixes over rewrites. The desired end state is a mature app that only needs small content, copy, and styling tweaks later.

## Asset and brand rules

- The canonical PEP Words logo asset is `public/pep-words-logo.svg`.
- Do not inline logo SVG in `index.html`, React components, JSON, or CSS.
- `src/components/Icons.tsx` and `src/legacy-blue/components/Icons.tsx` must reuse the canonical asset for `LogoIcon`.
- Favicon/preload must point to `/pep-words-logo.svg`.
- Cross-product Brain Rush links/icons should use an existing static asset path; do not paste SVG data URLs.

## Mobile interaction rules

- Mobile touch actions execute immediately on single tap — no confirm step, no tooltip-then-confirm flow.
- Use standard `onClick` handlers; no deferred pointer actions or double-tap patterns.
- Avoid interaction patterns that depend on browser double-tap timing or page zoom behavior.

## Technical constraints

- Do not add dependencies for simple UI, CSV export, tooltip, modal, or data formatting work.
- CSV export should use native JS string/Blob mechanics.
- Keep visual parameters centralized in named constants/config objects when values are likely to be tuned.
- Do not introduce new state libraries; use local React state/hooks unless there is a real repeated-state problem.

## SEO/GEO rules

- SEO work is not “add a couple meta tags.” Check the concrete surfaces that already exist:
  - `index.html` title/description/canonical/OG/Twitter/JSON-LD
  - `public/sitemap.xml`
  - `public/seo/` generated pages
  - heading hierarchy and important `aria-label`s
- Run `npm run seo:build` or `npm run build` after SEO page-generation changes.

## Verification and pre-commit checks

This project is deployed via Cloudflare Pages (GitHub Connected). **Cloudflare Preview is your primary verification.** Do not mechanically run `npm run check && npm run build` before every commit.

**When to skip local verification (most changes):**
- Copy fixes, styling tweaks, config values, static content, markdown
- Feature work, UI changes, refactors — Cloudflare Preview catches build failures

**When to run local checks:**
- You changed build configuration (`vite.config.ts`, `_headers`, `_redirects`, `wrangler.toml`, `package.json` scripts/deps, `public/` static asset wiring)
- You changed `index.html`, SEO generation pipeline, or import graph structure
- Liz explicitly asks for local verification

**When you do run checks, use the lightest one that would catch the failure:**
```bash
npm run check          # lint + typecheck (npm run check already covers this)
npm run build          # only when build plumbing changed
npm run seo:build      # only when SEO generation changed
```

## Git/deploy

This project is GitHub-connected for deployment. For low-risk completed fixes, commit and push on the current branch after verification.

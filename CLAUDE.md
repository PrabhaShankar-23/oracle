# CLAUDE.md

Guidance for Claude Code in this repo.

## What this is

A React site that publishes the **AlgoHandbook** notes vault
(`~/Desktop/java/Spring Boot/AlgoHandbook`) section by section. Content is pulled from the vault
by a script and committed as JSON. The vault itself is never edited from here.

Deploy: `npm run build`, then drag the `dist/` folder onto Netlify (manual deploy).
`public/_redirects` is copied into `dist/` so deep links work.

## Commands

```bash
npm run dev       # dev server
npm run ingest    # re-read the vault → src/content/generated/*.json (VAULT_DIR=… to override path)
npm run build     # type-check + production build to dist/
npm run preview   # serve dist/ locally
npm run lint      # oxlint
```

## Stack

React 19 · Vite 8 · TypeScript · React Router 8 (declarative `BrowserRouter`) · MUI 9 with a
Material Design 3 theme · Mermaid and highlight.js (lazy-loaded).

## Layout

- `src/theme/theme.ts` — **the only place** for colours, type scale, breakpoints, radii,
  component defaults and layout constants (`HEADER_HEIGHT`, `CONTENT_MAX_WIDTH`, `READING_MAX_WIDTH`).
- `src/content/sections.ts` — site map: every vault section, its nav pages, and the global search index.
  A section with `pages: []` shows as "Soon".
- `src/content/generated/` — output of `scripts/ingest-vault.mjs`. Don't hand-edit; re-run ingest.
  `manifest.json` is small and imported by the main bundle; the other JSON files are imported only by lazy pages.
- `src/components/layout/` — app bar, section dropdown menus (desktop), nav drawer (mobile), global search.
- `src/components/content/` — `PageContainer`, `PageHeader`, `HtmlContent` (renders vault HTML with
  diagrams, highlighting, copy buttons), `TableOfContents`, `articleStyles`.
- `src/pages/` — one folder per section. Content pages are `lazy()`-loaded in `src/App.tsx`.

## Adding a page from the vault

1. Extend `scripts/ingest-vault.mjs` to extract it (structured JSON where the source is regular,
   cleaned article HTML otherwise). Add anything nav/search needs to `manifest.json`.
2. Add types to `src/content/types.ts`, a page under `src/pages/<section>/`, a lazy route in `App.tsx`.
3. Add the page to its section in `sections.ts` (and search entries if useful).
4. Follow the responsive guide below and run through its checklist.

## Responsive and UI rules

@claude/responsive-guide.md

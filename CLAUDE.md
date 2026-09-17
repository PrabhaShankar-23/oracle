# CLAUDE.md

Guidance for Claude Code in this repo.

## What this is

A React site that publishes the **AlgoHandbook** notes vault
(`~/Desktop/java/Spring Boot/AlgoHandbook`) section by section. Content is pulled from the vault
by a script and committed as JSON. The vault is only written by `npm run vault:walkthroughs`
(cold recall walkthroughs, see below); everything else in it is read-only from here.

Deploy: `npm run build`, then drag the `dist/` folder onto Netlify (manual deploy).
`public/_redirects` is copied into `dist/` so deep links work.

## Commands

```bash
npm run dev       # dev server
npm run ingest    # re-read the vault → src/content/generated/*.json (VAULT_DIR=… to override path)
npm run vault:walkthroughs  # write src/content/deep walkthroughs into the vault's dsa-cold-recall.html, then run ingest
npm run build     # type-check + production build to dist/
npm run preview   # serve dist/ locally
npm run lint      # oxlint
```

## Stack

React 19 · Vite 8 · TypeScript · React Router 8 (declarative `BrowserRouter`) · MUI 9 with a
Material Design 3 theme · Mermaid and highlight.js (lazy-loaded) · `marked` (ingest only, Markdown → HTML).

## Layout

- `src/theme/theme.ts` — **the only place** for colours, type scale, breakpoints, radii,
  component defaults and layout constants (`HEADER_HEIGHT`, `CONTENT_MAX_WIDTH`, `READING_MAX_WIDTH`, `SIDEBAR_WIDTH`).
- `src/content/sections.ts` — site map: every vault section — **DSA first, then vault folder order** (the sidebar follows it), its nav pages, and the global search index.
  A section with `pages: []` shows as "Soon".
- `src/content/generated/` — output of `scripts/ingest-vault.mjs`. Don't hand-edit; re-run ingest.
  `manifest.json` is small and imported by the main bundle; the other JSON files are imported only by lazy pages.
- `src/content/deep/` — cold recall approach walkthroughs (naive → best: points, time/space, code, diagram specs),
  keyed by problem id. The site renders them with `RecallDiagram`; the vault page gets the same SVG from
  `src/lib/recallDiagramSvg.ts`. Keep that file and the data files free of runtime imports — Node loads them directly.
- `src/components/layout/` — app bar, `SideNav` section sidebar (permanent at `lg`+, inside `NavDrawer` below), global search.
- `src/components/content/` — `PageContainer`, `PageHeader`, `HtmlContent` (renders vault HTML with
  diagrams, highlighting, copy buttons), `TableOfContents`, `articleStyles`.
- `src/pages/` — one folder per section. Content pages are `lazy()`-loaded in `src/App.tsx`.

## Adding a page from the vault

1. Extend `scripts/ingest-vault.mjs` to extract it (structured JSON where the source is regular,
   cleaned article HTML otherwise; Markdown notes go through `marked`, see `ingestAiSystems`).
   Add anything nav/search needs to `manifest.json`.
2. Add types to `src/content/types.ts`, a page under `src/pages/<section>/`, a lazy route in `App.tsx`.
3. Add the page to its section in `sections.ts` (and search entries if useful).
4. Follow the responsive guide below and run through its checklist.

## Building features

For anything bigger than a small fix, use the `/feature-flow` skill (personal skill in
`~/.claude/skills/feature-flow`). This repo's commands, test approach and definition of done are in
`claude/feature-flow.md`; plans are saved under `claude/features/`.

## Responsive and UI rules

@claude/responsive-guide.md

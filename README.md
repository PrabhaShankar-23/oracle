# My Notes

Personal notes written in Markdown, served as a React (Vite + TypeScript) site on Netlify.

## Writing notes

Put `.md` files in `notes/`. Subfolders become sections:

```
notes/welcome.md                        → /notes/welcome
notes/getting-started/adding-notes.md   → /notes/getting-started/adding-notes
```

Frontmatter is optional:

```md
---
title: My note
date: 2026-09-16
tags: [react, hooks]
---
```

## Commands

| Command           | What it does                     |
| ----------------- | -------------------------------- |
| `npm run dev`     | Local dev server with hot reload |
| `npm run build`   | Type-check and build to `dist/`  |
| `npm run preview` | Serve the production build       |
| `npm run lint`    | Lint with oxlint                 |

## Deploy

Netlify builds on every push to `main` using `netlify.toml`. `public/_redirects` makes deep links work.

# AlgoHandbook site

The AlgoHandbook interview-prep notes as a responsive React site, published section by section.

**Live today:** DSA cold recall (169 problems) and System Design (5 case studies and WebRTC revision cards).

## Develop

```bash
npm install
npm run dev
```

## Update content from the vault

```bash
npm run ingest                       # default vault path: ~/Desktop/java/Spring Boot/AlgoHandbook
VAULT_DIR=/path/to/vault npm run ingest
```

This rewrites `src/content/generated/*.json`. Commit the result.

## Deploy to Netlify (free tier, manual)

```bash
npm run build
```

Then on app.netlify.com: **Add new project → Deploy manually**, and drag the `dist/` folder in.
To update, open the project's **Deploys** tab and drag the new `dist/` folder in again.

`dist/_redirects` makes page refreshes and shared deep links work.

## Where things are

| Path | What |
| --- | --- |
| `src/theme/theme.ts` | Material 3 theme: colours, type, breakpoints, component defaults |
| `src/content/sections.ts` | Navigation and search: every section and its pages |
| `scripts/ingest-vault.mjs` | Vault HTML → JSON |
| `claude/responsive-guide.md` | Responsive rules (loaded by `CLAUDE.md`) |

# Feature flow — project profile (oracle / AlgoHandbook site)

Project-specific settings for the `/feature-flow` skill (`~/.claude/skills/feature-flow`).
The skill supplies the process: frame → discover → architect → slices & milestones → test plan →
build loop → verify. This file supplies how this repo builds, tests and ships.

## Plans

Plans live in `claude/features/<yyyy-mm-dd>-<feature-slug>/plan.md` and are committed.

## Commands

| Check | Command |
| --- | --- |
| Install | `npm install` |
| Refresh vault content | `npm run ingest` |
| Dev server | `npm run dev` |
| Type-check | `npx tsc -b` |
| Lint | `npm run lint` |
| Unit / component tests | none yet — see Test stack |
| Production build | `npm run build` (type-check + Vite build) |
| Preview build | `npm run preview` |

## Test stack

- **No test runner is installed yet.** The first feature with non-trivial logic (parsing, filtering,
  search ranking) should add **Vitest + React Testing Library + jsdom** as slice F0.
- Once added: tests sit next to the code as `*.test.ts(x)`; test user-visible behaviour via roles and labels,
  not MUI class names.
- Until then, every acceptance criterion needs a **manual check** written as exact steps
  (URL, viewport width, action, expected result), run against `npm run preview`.
- Ingest changes: re-run `npm run ingest` and inspect the `git diff` of `src/content/generated/`.

## Architecture conventions

Follow `CLAUDE.md`. In short:

- New vault content: extract in `scripts/ingest-vault.mjs` → JSON in `src/content/generated/` →
  types in `src/content/types.ts` → lazy page in `src/pages/<section>/` → route in `src/App.tsx` →
  nav entry in `src/content/sections.ts`.
- Styling only through `src/theme/theme.ts` tokens and `sx`; no raw hex in components.
- Keep `manifest.json` small — it ships in the main bundle.

## Definition of done

- [ ] `npx tsc -b`, `npm run lint` and `npm run build` pass
- [ ] Checked in `npm run preview` (not just dev), including a hard refresh on a deep link
- [ ] Responsive checklist in `claude/responsive-guide.md` passed (360px and 390px, no horizontal scroll)
- [ ] Light and dark mode checked
- [ ] Nav dropdown, mobile drawer and global search updated if a page was added
- [ ] `CLAUDE.md` / `README.md` updated if commands, structure or deploy steps changed

## Commits and delivery

- Commit per slice on `main` unless the plan says to use a branch; push to `origin` (GitHub `oracle`).
- Deploy is manual: `npm run build`, then drag `dist/` onto Netlify.

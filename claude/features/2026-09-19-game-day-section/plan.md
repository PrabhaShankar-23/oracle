# Game Day section — publish the vault's `02-Game-Day` folder

**Track:** L — new ingest shape, 474 questions across 11 source files, new types, new routes,
nav + search changes, and more than one viable page design.

**Status:** M1 complete (F1–F4 + nav/topic search). Remaining: F5 runbook, F6 stories, F7 per-question search, F8 polish.

**Naming.** The vault folder was renamed `02-Interview` → `02-Game-Day` on 19 Sep 2026; section title **Game Day**, route prefix `/game-day`. Section description: *"474 recall questions, trend-scanned. Question visible — answer out loud, then expand."*

---

## 1. Frame

**Problem.** The section shows "Soon" (`pages: []`). The vault's `02-Game-Day/` holds the
highest-frequency-of-use material in the whole handbook — the folder opened *before* an interview — and
it is unreachable from the site, which is the thing actually carried on a phone.

**Outcome.** `/game-day` lists the recall topics. Each topic page shows its questions grouped by band,
question visible and answer collapsed, matching the vault's own instruction: *question visible → answer
out loud → then expand → grade what you missed.* The runbook and the project stories are readable too.

**Success criteria**

1. `/game-day` lists 11 recall topics, the runbook and the stories; no "Soon" placeholder.
2. A topic page renders every question from its source file, grouped by band A–F, with ⭐ 🔥 📍 markers preserved.
3. Answers are collapsed by default and expand on tap/click — no hover-only reveal.
4. Flow, Trap and the vault links render per question; a link to a page that exists on the site navigates there, and one that doesn't renders as plain text rather than a dead link.
5. Phrasing-drill blocks (nested `<details>`) render without breaking the outer question.
6. Global search finds a topic by name and a question by its text.
7. Responsive checklist passes: no horizontal scroll at 360/390px, light and dark both checked.

**Non-goals**

- Scoring / progress tracking (🟢🟡🔴 grading) — read-only for now.
- Editing content in the browser; the vault stays the source of truth.
- Publishing `POPULAR-QUESTIONS`, `Weak-Queue`, `War-Stories`, `TREND-SCAN`, `meta_prompts/` — follow-ups.
- Full-text search *within* answers (search indexes question text only).

**Constraints**

- `npm run ingest` is the only path from vault → site; no hand-edited JSON.
- `manifest.json` ships in the main bundle, so it carries ids/titles only — never answer bodies.
- Per-topic JSON must be lazy-loaded; 474 questions must not enter the main bundle.
- No test runner exists yet (profile: add Vitest + RTL as the first slice with real logic).

**Assumptions** (recorded rather than asked)

- Band letters are stable A–F; anything else (`♻️ Merged from…`, `📝 Gaps flagged`) is an appendix section, rendered after the bands.
- `16-PROJECT-STORIES.md` and `00-index.md` are prose, not Q&A — they get article-HTML treatment, not structured extraction.
- Source files are trusted input (same as every other ingest here), so HTML is rendered via `HtmlContent`.

---

## 2. Discover — findings

| Finding | Detail |
| --- | --- |
| Source shape | `## <emoji> A — Openers` bands → `###### N. ⭐ "question"` → `<details><summary>🔑</summary>` with bullets, `**Flow:**`, `**Trap:**`, `**→** [[link]]` |
| Volume | 474 questions / 11 recall files. Largest `11-ML-DL.md` (72 Q), smallest `07-MCP` and `15-REAL-TIME` (25 Q) |
| Nested blocks | `🗣️ Phrasing drill` adds a second and third `<details>` (💡 Hint, 🔑 Recall points with **One-liner:**, **Follow-up they'll ask:**, **Note:**). Counts: 04, 05, 06, 08, 11, 17 |
| Closest pattern | `ingestColdRecall()` — structured JSON from regular source. `ingestAiSystems()` — markdown → HTML via `marked`, for the prose files |
| Reuse | `PageContainer`, `PageHeader`, `HtmlContent`, `TableOfContents`, `articleStyles`, `codeBlockHtml`, the `Drawer`-below-`lg` pattern from `UtilsPage` |
| Route pattern to copy | `system-design/case-studies/:slug` — one lazy component, many routes, list in `manifest.json` |
| Risk | The parse. 474 questions, nested `<details>`, emoji markers, `[[wiki links]]` with spaces and slashes. Everything else is routine. |

---

## 3. Architect

**Options considered**

- **A — one page per source file, 13 routes.** Mirrors the vault exactly; clutters nav with 13 entries.
- **B — single page, topic switcher.** One route, `ToggleButtonGroup` like `UtilsPage`. But 474 questions in one payload, and no deep-linkable topic.
- **C — `/game-day/recall/:slug` (chosen).** One lazy component, one route param, per-topic JSON. Mirrors `case-studies/:slug`, keeps payloads per-topic, deep links work, nav groups topics under "Recall".

**Chosen: C.**

```
02-Game-Day/*.md ──ingest──▶ game-day-<slug>.json   (lazy, one per topic)
                   └────────▶ manifest.gameDay[]     (ids + titles + question text only)
                                        │
   /interview            SectionPage ◀──┘  (existing, driven by sections.ts)
   /game-day/recall/:slug   GameDayRecallPage → BandSection → QuestionCard → <details>
   /game-day/runbook        GameDayDocPage (article HTML)
   /game-day/stories        GameDayDocPage (article HTML)
```

**Contracts** (new in `src/content/types.ts`)

```ts
type GameDayMark = 'decides' | 'trending' | 'asked'      // ⭐ 🔥 📍
type GameDayLink = { label: string; to?: string }        // to = resolved site route, else plain text
type PhrasingDrill = { prompt: string; badge?: string; hint?: string; points: string[]; oneLiner?: string; followUp?: string; links: GameDayLink[] }
type GameDayQuestion = { id: string; number: number; text: string; marks: GameDayMark[]; points: string[]; flow?: string; trap?: string; links: GameDayLink[]; drill?: PhrasingDrill }
type GameDayBand = { id: string; letter: string; name: string; questions: GameDayQuestion[] }
type GameDayTopic = { slug: string; number: number; title: string; meta: string[]; bands: GameDayBand[]; appendixHtml?: string }
```

**State.** All content is static JSON. The only UI state is which `<details>` are open (native, uncontrolled)
plus an "expand all / collapse all" toggle and a band filter — both local `useState`, nothing persisted.

**Failure modes.** Unknown `:slug` → `NotFoundPage` (matches `CaseStudyPage`). Unresolvable vault link →
plain text, not an anchor. Empty band → omitted. Question with no `<details>` → renders as a question with
no answer body rather than throwing.

**Decisions log**

- Structured JSON over article HTML for the 11 recall files — the source is regular and the UI needs per-question state. *Rejected: dumping HTML, which would make band filtering and search impossible.*
- Native `<details>` over a JS accordion — the reveal interaction is exactly disclosure, it is keyboard- and screen-reader-correct for free, and it satisfies "no hover-only reveal". *Rejected: MUI `Accordion` — heavier, and 474 of them would be slow.*
- Per-topic JSON files, not one `interview.json` — keeps the largest payload ~72 questions. *Rejected: single file, which would load 474 questions to read one topic.*
- **F0 (Vitest + RTL) skipped at the user's direction, 19 Sep 2026.** The parse is verified by inspecting the generated JSON and its `git diff` instead. Unit-level criteria in the test plan drop to that check; component and manual criteria are unaffected. *Rejected: adding the harness first, which front-loads setup before anything renders.* Logged as a follow-up.
- Vault links resolved against a route map at ingest time. *Rejected: resolving in the browser, which would need the whole site map in the main bundle.*

---

## 4. Slices & milestones

| ID | Slice | Behaviour | Size | Depends |
| --- | --- | --- | --- | --- |
| F1 | Ingest one topic | `npm run ingest` emits `game-day-python.json` with 44 questions, bands, marks | M | — |
| F2 | Topic page | `/game-day/recall/python` renders bands and collapsed answers | M | F1 |
| F3 | All 11 topics | every recall file ingested; nav lists them | M | F2 |
| F4 | Phrasing drills | nested drill renders inside its question | M | F3 |
| F5 | Runbook page | `/game-day/runbook` renders `00-index.md` as an article with a TOC | S | F3 |
| F6 | Stories page | `/game-day/stories` renders the 9 STAR stories | S | F3 |
| F7 | Search + manifest | topics and question text findable in global search | S | F3 |
| F8 | Responsive & polish | band filter, expand/collapse all, 360/390px, light + dark | M | F4–F7 |

**M0 — walking skeleton** (F1, F2): one topic page live end to end. *Exit:* `/game-day/recall/python`
shows 44 questions in 6 bands, answers collapsed; `tsc -b`, lint, build green. Proves the parse and the route.

**M1 — full recall** (F3, F4). *Exit:* all 474 questions render, drills included, no console errors.

**M2 — section complete** (F5, F6, F7). *Exit:* `/game-day` has no "Soon"; search finds a question.

**M3 — done** (F8). *Exit:* definition of done in the profile fully satisfied.

---

## 5. Test plan

| Criterion | Level | Check |
| --- | --- | --- |
| SC2 bands/marks | JSON | `game-day-python.json` has 6 bands A–F; marks array populated on ⭐🔥📍 questions |
| SC2 count | JSON | question count in JSON equals `grep -c '^###### '` on the source, per file |
| SC4 links | JSON | links with a `to` resolve to a real route; the rest have no `to` |
| SC5 drills | JSON | drill count in JSON equals nested-`<details>` count in source |
| SC3 reveal | component | `GameDayRecallPage.test.tsx › answer is hidden until the summary is activated` |
| SC3 keyboard | component | `› summary is reachable by Tab and toggles on Enter` |
| SC6 search | component | `› question text appears in the search index` |
| SC1 nav | manual | `/game-day` at 1440px lists 13 entries, no "Soon" |
| SC7 responsive | manual | 360 and 390px: `document.documentElement.scrollWidth === window.innerWidth` on the largest topic (`ml-dl`, 72 Q) |
| SC7 theme | manual | toggle dark on a topic page; markers and band headers legible |
| deep link | manual | hard-refresh `/game-day/recall/rag#q12` in `npm run preview`; lands below the app bar |

**Edge cases:** topic with no drills (`01-PYTHON`) · the 72-question page (scroll + TOC performance) ·
a question with no `<details>` · very long question text at 360px · unknown `:slug` · appendix-only
sections (`♻️ Merged from…`) · back/forward between topics · keyboard-only expand.

---

## 6. Progress

- [x] F1 Ingest one topic
- [x] F2 Topic page
- [x] F3 All 11 topics
- [x] F4 Phrasing drills
- [ ] F5 Runbook page
- [ ] F6 Stories page
- [~] F7 Search — topics done; per-question index written but not wired
- [ ] F8 Responsive & polish

## 6b. Deviations from plan

- **F1 and F3 merged.** The parse was the whole risk, so it ran against all 11 files immediately rather than one — more signal for the same work.
- **Two question shapes, not one.** The plan assumed every question was `🔑` + bullets + Flow/Trap. 153 of 474 are actually *drill-shaped* (badge → `💡 Hint` → `🔑 Recall points` → One-liner), and `17-NLP-CLASSICAL` is 100% that shape. The first JSON check caught it: those questions parsed with zero points. The parser now reads both and promotes a standalone drill to the primary answer, keeping `drill` as a separate object only where a real recall block sits beside it. **This is what F0 would have caught; the JSON diff caught it instead.**
- **Question text moved out of `manifest.json`.** Putting all 474 in the manifest took it from 88 KB to 196 KB, and the manifest ships in the main bundle. It now carries topics + bands only (+12 KB) and question text lives in `game-day-search.json` (116 KB), to be lazy-loaded by search in F7.

## 7. Follow-ups

- Add the Vitest + RTL harness (deferred F0) and port the JSON checks to real unit tests.
- Publish `POPULAR-QUESTIONS`, `War-Stories`, `Weak-Queue`, `TREND-SCAN-2026-08`.
- Scoring / weak-queue tracking (needs persistence — an artifact capability or localStorage).
- Search inside answer bodies, not just question text.

# Game Day model answers — nested accordions on the recall page

> **Track:** M — ingest extension + one new lazy JSON + types + one component on an existing page; no new route.
> **Status:** Done · **Created:** 2026-09-29 · **Last updated:** 2026-09-29

## 1. Frame

**Problem.** The vault now has a fourth Game Day format: one-question **model answers**
(`02-Game-Day/model-answers/<recall-stem>/NN-slug.md`, template `meta_prompts/model_answer_prompt_v1.md`).
All 25 ⭐ questions of `11-ML-DL.md` have one, linked from each recall entry by a
`**🎤 Model answer:** [[model-answers/11-ML-DL/NN-slug]]` line. The site doesn't show them.

**Outcome.** On `/game-day/recall/ml-dl`, a question with a model answer shows a **🎤 Model answer**
accordion inside its card. Opening it shows the spine, what's being tested, the trap, then nested
accordions: the spoken answer, one per stage, one per follow-up (with its tag), and the don't-say list.

**Success criteria**
- [x] SC1 `npm run ingest` extracts all 25 model answers; `game-day-ml-dl.json` marks those questions; nothing else in the generated JSON changes.
- [x] SC2 Each marked question card shows a collapsed "🎤 Model answer" accordion; other questions are unchanged.
- [x] SC3 Opened, it renders spine, testing, trap, spoken answer, stages, follow-ups (tag visible) and don't-say, each stage/follow-up as its own collapsed accordion.
- [x] SC4 Model-answer content loads lazily: the topic chunk grows only by the spine/flag, not the full text.
- [x] SC5 "Expand all" still expands question answers only, not the hundreds of nested accordions.
- [x] SC6 Responsive checklist: no horizontal scroll at 360/390px (tables, ASCII sketches); light and dark mode.
- [x] SC7 `npx tsc -b`, `npm run lint`, `npm run build` pass.

**Non-goals**
- Model answers for other topics (none exist in the vault yet; the ingest handles any topic generically).
- A standalone route per model answer; search indexing of answer text.
- Resolving `[[vault links]]` to site routes (same plain-text `vault-ref` treatment as today).

**Constraints**
- Keep `manifest.json` unchanged (main bundle). Topic JSON is lazy but already 194 KB.
- Vault is read-only from this repo.

**Assumptions**
- The model-answer file format is the template's (`**🧭 Spine:**`, `> 🎯`/`> 🪤` lines, `<details><summary><b>…</b></summary>` blocks under `## 🪜` and `## 🔁`, `## 🚫 Don't say` list, `**🔗 Depth:**` line). Parse the Markdown source directly rather than marked's HTML, since `<details>` blocks are regular.

## 2. Discover

| Area | Finding | Impact |
| --- | --- | --- |
| Entry point | `ingestGameDay()` in `scripts/ingest-vault.mjs`; `readBlock()` parses `**Key:** value` lines of the 🔑 block | add a `Model answer` key → vault target |
| Page | `GameDayRecallPage.tsx` → `QuestionCard` renders a native `<details>`; `Drill` shows nested extra content | add `ModelAnswer` beside `Drill` |
| Expand all | `querySelectorAll('details')` opens *every* details | scope to question-level details |
| Lazy loading | topics loaded via `import.meta.glob` → one chunk per topic | same pattern for `game-day-answers-*.json` |
| Reusable | `HtmlContent` (tables → `.table-scroll`, `pre` copy buttons, highlight), `flattenVaultRefs`, `parseVaultLinks`, `marked` | render all answer bodies through them |
| Tests | no runner; manual checks + generated-JSON diff (profile) | manual test plan below |
| Risk | 25 × ~9 KB HTML would double the topic chunk | split into a sibling lazy file |

## 3. Architecture

**Options**
1. **Embed full answers in `game-day-ml-dl.json`.** Simplest. Topic chunk ~194 KB → ~450 KB, paid on every visit.
2. **Sibling lazy file `game-day-answers-<slug>.json` keyed by question id**, loaded on first open of any model answer; the topic JSON carries only `modelAnswer: { spine }`. Small extra code, keeps the page fast.

**Chosen:** 2 — the recall page is used on a phone before interviews; most visits never open a model answer.

**Components**

| Module | New / changed | Responsibility |
| --- | --- | --- |
| `scripts/ingest-vault.mjs` | changed | `parseModelAnswer(md)`; link recall → answer; write `game-day-answers-<slug>.json` |
| `src/content/types.ts` | changed | `GameDayModelAnswer`, `GameDayAnswerTag`, `GameDayQuestion.modelAnswer` |
| `src/pages/game-day/ModelAnswer.tsx` | new | nested accordion UI; lazy-loads the answers file |
| `GameDayRecallPage.tsx` | changed | render `ModelAnswer`; scope Expand all |

**Data flow:** vault `.md` → ingest parses sections → `game-day-answers-ml-dl.json` (full) + `game-day-ml-dl.json` (`modelAnswer.spine`) → page chunk → on first open, `import()` answers file → `ModelAnswer` renders HTML via `HtmlContent`.

**Failure modes:** file missing an entry for the id → accordion shows "Model answer not available"; loading → "Loading…" line; `<fill>` placeholders render as code spans (Q25).

**Decisions log**
- Sibling lazy file — keeps topic chunk size — rejected embedding.
- Parse Markdown source by regex for the `<details>` blocks, then `marked` each body — the format is template-generated and regular — rejected walking marked's HTML (details bodies aren't nested reliably by marked).
- Expand all targets `details[data-gd-question]` only — 25 answers × ~13 nested accordions would all open — rejected opening everything.
- Gate A: M-track, summary given in chat; proceeding.
- **Deviation:** `parseDecisionMeta` now also reads the positional v5 meta line (`CORE · Senior · … · Created …`) — the vault's Python notes moved to v5 on 28 Sep and the ingest was emitting empty tier/relevance for all 15. Committed separately.
- Type chip shows text only — 🩺 didn't render in the UI font at chip size.
- `<summary>` gets `box-sizing: border-box` — with content-box, `minHeight: 44` + padding made every nested header 64px.

## 4. Slices

- **F1 Ingest** (M) — parse + link + write files. AC: 25 answers, each with spine = stage count, ≥5 follow-ups with tags; recall JSON diff only adds `modelAnswer`.
- **F2 Render** (M, dep F1) — `ModelAnswer` component + Expand-all scoping. AC: SC2, SC3, SC5.
- **F3 Verify** (S) — build, preview, responsive + dark checks.

Milestone M1 = F1 + F2 + F3, one commit per slice.

## 5. Test plan

| Criterion | Level | Check |
| --- | --- | --- |
| SC1 | ingest | `npm run ingest`; `node -e` count answers + spine/stage parity; `git diff --stat src/content/generated/` |
| SC2–SC3 | manual | preview `/game-day/recall/ml-dl` → Q1 card → open → open "Model answer" → spine, spoken, 6 stages, 7 follow-ups with tags, don't-say |
| SC4 | build | chunk sizes in `npm run build` output: topic chunk vs answers chunk |
| SC5 | manual | Expand all → question answers open, model-answer accordion stays closed |
| SC6 | manual | 360 / 390px: open Q7 (tables) and Q13 (ASCII) → no horizontal page scroll; toggle dark mode |
| SC7 | static | `npx tsc -b`, `npm run lint`, `npm run build` |

Edge cases: question with no model answer (unchanged card); Q25 `<fill>` placeholders; very long follow-up questions wrap; keyboard toggles (native `<details>`).

## Progress
- [x] F1 Ingest — 25/25 answers parsed; spine length = stage count for all; recall JSON gains only `modelAnswer`
- [x] F2 Render — `ModelAnswer.tsx`; Expand all scoped to `details[data-gd-question]`
- [x] F3 Verify — tsc, lint, build green; preview checked (see Verification)

## Verification
- `npm run ingest`: 25 model answers written to `model-answers-ml-dl.json` (235 KB); `game-day-ml-dl.json` 194 → 203 KB.
- `npm run build`: topic chunk 166 KB (55 KB gz); answers chunk 208 KB (66 KB gz), loaded only on first open.
- Preview `/game-day/recall/ml-dl` (1512px): 25 cards show the spine; Q1 opens to spoken answer, 6 stages, 7 tagged follow-ups; Expand all opened 72 question accordions and 0 nested ones.
- 390px and 360px (same-origin iframe, window resize unavailable): `scrollWidth === innerWidth` with Q7 (tables), Q13 (ASCII) and Q25 (warning, `<fill>` code) fully expanded.
- Light and dark mode both viewed.
- Not checked: hard refresh on a deep link to a question anchor (unchanged behaviour; no routing change).

## Follow-ups
- Model answers for other recall topics as the vault adds them (no code change needed).
- Optional: search entries for model-answer spines.

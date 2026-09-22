# DSA practice list page

> **Track:** M · **Status:** Done
> **Created:** 2026-09-22 · **Last updated:** 2026-09-22

## 1. Frame

**Problem** — The vault's practice list (`04-DSA-V2/00-index/00-dsa-problem-solving-index.md`,
169 problems, 69 marked L1) isn't on the site. The DSA section only has the cold recall cards,
the playbook and the helper pages.

**Outcome** — `/dsa/practice` shows the list family by family and pattern by pattern, with the L1 marks,
difficulty, list marks, a LeetCode link and a link to the matching cold recall card. You can tick a problem
as solved, and the ticks are kept in the browser.

**Success criteria**
- [x] SC1 Every problem in the note (169) is shown under its family and pattern, in the note's order and numbering.
- [x] SC2 L1, difficulty and list marks show on each row. Filters cover L1 only, difficulty and hiding solved problems.
- [x] SC3 Each pattern links to its cold recall pattern, and each problem to its cold recall card when one exists.
- [x] SC4 Ticks survive a reload (localStorage, per viewer) and a progress count shows solved / total and solved L1 / 69.
- [x] SC5 The "How to work this list" and "AI-loop practical round" prose is on the page.
- [x] SC6 The page is in the DSA sidebar and on the section page. Responsive checklist passes.

**Non-goals** — the night log table, the pattern map table (it repeats the list), and the vault-authoring
sections (cross-note link convention, generation order). The pattern notes themselves aren't published,
so "note" links go to the cold recall page instead.

**Assumptions** — Ticks are a per-browser convenience, so localStorage is fine; no sync.

## 2. Discover

| Area | Finding | Impact |
| --- | --- | --- |
| Source | Regular Markdown: `## family`, `### Pnn — name`, numbered `[ ]` rows with `🟢 **L1**`, a link, difficulty and marks | Parse it into structured JSON; `marked` only for the prose sections |
| Cold recall | `dsa-cold-recall.json` holds the same 169 problems; the 19 extras sit under family J (X1–X5) | Match by LeetCode URL → recall id |
| Pattern to follow | `ColdRecallPage` (filter bar, sticky pattern rail at `lg`), `ProblemCard` difficulty colours, `marks.ts` | Reuse the colours and the mark legend |
| Tests | No test runner | Checked by inspecting the generated JSON and running the preview by hand |

## 3. Architecture

**Chosen:** ingest → `dsa-practice.json` (lazy) plus a `dsaPractice` count summary in the manifest →
`PracticePage` under `src/pages/dsa/`.

```ts
type PracticeProblem = { n: number; title: string; url: string; difficulty: Difficulty; l1: boolean; marks: string[]; recallId?: string }
type PracticeGroup = { id: string; code?: string; name: string; recallId?: string; problems: PracticeProblem[] }
type PracticeFamily = { id: string; name: string; note?: string; groups: PracticeGroup[] }
type PracticeList = { title: string; intro: string; families: PracticeFamily[]; guide: { id: string; title: string; html: string }[] }
```

State: filters live in component state. The solved set is stored in localStorage under
`dsa-practice-solved`, keyed by problem number; reads and writes are wrapped in try/catch.

## 4. Slices

- [x] F1 Ingest the note → JSON and a manifest summary (SC1, SC3 data, SC5)
- [x] F2 Page, route and nav entry, with rows, filters, ticks and progress (SC2–SC4, SC6)

## 5. Test plan

| Criterion | Check |
| --- | --- |
| SC1 | JSON has 169 problems; the numbers run 1…169 with no gaps |
| SC3 | Every pattern problem has a `recallId`; every family J extra resolves too |
| SC2/SC4 | Preview: L1 only → 69 rows; tick one → reload → still ticked, counts updated |
| SC6 | 360/390px: no horizontal scroll; drawer nav shows the page; light and dark |

## Decisions log

- Link "note" to cold recall, not the vault .md — the pattern notes aren't published.
- Gate A (M-track): summary given in chat, proceeding.

## Follow-ups

- Export / import of ticks if they need to move between devices.

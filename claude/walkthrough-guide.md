# Cold recall walkthrough guide

How to write the approach walkthroughs on the DSA → Cold recall page: one tab per approach, each with
time/space chips, a small diagram, a few key points and tested Python. Follow this for every problem
so the whole page reads the same.

**Prompt to start a batch:**

> Write cold recall walkthroughs for P08 (all problems in it), following `claude/walkthrough-guide.md`.

## Where things live

| File | What goes in it |
| --- | --- |
| `src/content/deep/pNN.ts` | `Record<problemId, ApproachWalkthrough[]>` for pattern `PNN`. Export it as `pNN`. |
| `src/content/deep/pNN-code.json` | The code of every approach, keyed by problem id. |
| `src/content/deep/index.ts` | Import `pNN` and spread it into `walkthroughs`. |
| `src/content/types.ts` | `ApproachWalkthrough`, `Diagram`, `CellsRow`, `BarsRow`. The format itself. |

- **Problem ids** come from `src/content/generated/dsa-cold-recall.json` (e.g. `P18-min-stack`). The
  render script rejects ids that aren't cards.
- **Code keys:** the best approach uses the bare id (`P18-min-stack`). Every other approach uses
  `id#short-tag` (`P18-min-stack#mins`, `#encode`). The bare-id code replaces the card's
  snippet in the vault.
- **Worked examples:** `p04.ts` (sliding windows, cells), `p01.ts` (trapping rain water, bars),
  `p08.ts` / `p10.ts` (interval timelines), `p18.ts` (Min Stack, with an interview trick tab),
  `p11.ts` (a LeetCode follow-up as the trick tab).

## The approach ladder

Order the tabs from naive to best, then the trick.

**Read the LeetCode problem first** (the card links it). Every tab must meet its hard requirements,
such as "O(1) for each function" (Min Stack), "O(n) without division" (Product of Array Except Self)
or "O(log n)" (rotated-array search). An approach that breaks one isn't a tab. At most, mention it in
one line of the first tab's points.

1. **Brute:** the obvious correct solution that still meets those requirements. Say where it
   wastes work.
2. **Better:** a real step up, usually trading memory for time, or O(n log n) sorting. It must be a
   genuine middle step. Leave it out rather than invent one; two tabs is fine.
3. **Best** (`best: true`, ★): what you'd write in the interview. Exactly one per problem. The page
   opens on this tab. It must be the approach the card's **State** and **Invariant** lines describe,
   because those come from the vault and sit right above the tabs. Min Stack's card describes
   (value, min) pairs, so pairs is ★ there and the second-stack version is the middle step.
4. **Interview trick** (`trick: true`, 💡), *optional*: a well-known clever move that interviewers
   ask about or that impresses when you mention it, even if it isn't the default answer. Add it
   only when such a trick exists. Examples:
   - Min Stack: store `2·x − min` to get O(1) `getMin` without a second stack.
   - Majority element: Boyer–Moore voting (O(1) space).
   - Find the duplicate: Floyd's cycle detection on indices.
   - Missing number: XOR of indices and values.
   - Binary tree inorder: Morris traversal (O(1) space).
   - Random pick from a stream: reservoir sampling.
   - Linked list intersection: two pointers that switch lists.
   - **LeetCode follow-ups** also count, e.g. Find Median's "what if every number is in 0…100?"
     leads to count buckets. Name the follow-up in the first point.

   If the trick *is* the best answer (e.g. Floyd for Linked List Cycle), mark it `best` and skip
   `trick`.

Aim for 2–4 tabs. Never pad a ladder to hit three. One ★ tab is fine when a problem has only one
sensible approach (Summary Ranges). In that case, use its points to say why nothing simpler exists.

## Each approach

```ts
{
  name: 'Jump l with last-seen',   // the move, ≤ 5 words; the tab shows "2. Jump l with last-seen"
  time: 'O(n)',
  space: 'O(1)',                   // or 'O(k)', 'O(n) extra'
  best: true,                      // or trick: true, or neither
  points: [ … ],
  code: c['P04-…'],
  diagrams: [ … ],
}
```

- **name:** name the idea, not the tier. Write "Second stack of minimums" or "Encode 2·x − min",
  never "Brute force" or "Optimal". This is the header you see on the tab, so it should remind you
  of the approach at a glance.
- **time / space:** big-O only. For design problems, say which operation it applies to when they
  differ (`O(1) push · O(log n) pop`).
- **points:** 3–6 short plain-text lines, no HTML. In order:
  1. the state you keep;
  2. the move at each step;
  3. why it's correct (the invariant);
  4. where it wastes work (for non-best tabs) or the trap to avoid (for best/trick).

  Use `≤ ≥ → ⇒ · −` rather than ASCII stand-ins.
- **code:** Python only. Write a complete LeetCode-style function or class with the snake_case name
  (keep LeetCode's method names for design classes: `getMin`). Keep comments to the one or two lines
  that carry the idea. The code must be tested (see below).

## Diagrams

Diagrams show the key moment of the approach on a tiny input, not a full trace.

- **Kinds:**
  - `cells` for arrays, strings, stacks, queues, prefix sums and DP rows. Draw stacks bottom → top
    and say so in the caption.
  - `bars` for heights: water, containers, histograms.
  - `intervals` for anything with [start, end]: merging, meetings, balloons, scheduling. Each bar
    gets its own lane unless `lane` puts bars on one line, e.g. the merged output or one lane per
    meeting room. `marks` draw vertical lines such as an arrow, "prev end" or a time t. Labels
    default to `from–to`. A label that doesn't fit inside a short bar goes to its right, or is dropped
    if a neighbour is in the way. Keep the range small (about 0–20), and don't put a mark through the
    middle of a labelled bar.
  - Trees, graphs and grids have no dedicated kind yet. Show the array they reduce to (BFS order,
    level list, DP row). If that genuinely can't carry the idea, say so and propose a new diagram kind
    instead of faking one.
- **Size:** 1–3 rows per diagram, at most about 10 cells per row. Use one diagram per approach unless
  two moments really need separate frames.
- **Same input across tabs:** use one small example for every approach of a problem, so the tabs
  compare directly. Min Stack uses push 5, 3, 7, 3, 1 throughout.
- **Captions and notes:**
  - `caption` says what the row is (`nums`, `mins`, `pop: −1 < min ⇒ encoded`).
  - `note` gives the arithmetic or the conclusion (`2·1 − (−1) = 3 ⇒ the old min is back`).
- **Cell states** (also used by interval bars):
  - `active`: the element in focus.
  - `match`: checked and kept, absorbed into the answer, or the answer itself.
  - `miss`: checked and rejected, or a clash. Never use it for something merely merged.
  - `dim`: discarded or out of the window.
- **Pointers:** short labels (`l`, `r`, `i`, `top`, `min`, `k`). Default tone is primary. Use
  `secondary` for a second pointer and `error` for "this is the problem element".
- **Span:** a bracket under a range (a window or a subarray) with a label.
- **Bars extras:** `water`, `box` (a container), `levels` (dashed max lines), `dim`.
- **Indices** must lie inside the row. `npm run vault:walkthroughs` throws if a pointer, state, span,
  level or box points outside, or if an interval runs backwards.
- **Look at it.** Check each new diagram on the page at desktop width, where it sits in a half-width
  column. Labels that collide or turn tiny there need a smaller example.

## Testing the code

Test every approach before it goes into `pNN-code.json`. Write a Python script in the scratchpad:

- Run the LeetCode examples plus edge cases: empty or single element, all equal, negatives,
  duplicates, and the largest values the constraints allow.
- Check that **all approaches agree**, against each other or a brute reference, on a few thousand
  random inputs.
- For design problems, run random operation sequences and compare every read against a plain
  reference model.
- Dump the tested sources straight into `pNN-code.json` from the script (`json.dump(…, ensure_ascii=False)`),
  so the file holds exactly the code that was run.

## Finish a batch

1. Add `pNN` to `src/content/deep/index.ts`.
2. `npm run vault:walkthroughs` validates the diagrams and writes the vault page.
3. `npm run ingest` refreshes `dsa-cold-recall.json`. Only the card's `code` should change, to the
   best snippet.
4. `npm run build` and `npm run lint`.
5. Open `/dsa/cold-recall#<problem-id>`. Check each tab in dark and light mode, and at 390px wide.
6. Update the progress list below.

## Progress

- [x] Family A: P01–P07 (24 problems)
- [x] Family B: P08–P11 (11 problems)
- [x] Family C: P12–P15 (16 problems)
- [ ] Family D: P16–P19. P18 Min Stack is done; the rest of P18 is not.
- [x] Family I (DP): P34–P40 (25 problems)
- [ ] P20–P33 and X1–X5

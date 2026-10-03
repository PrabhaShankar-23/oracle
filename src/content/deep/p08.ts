/** Approach walkthroughs for P08 (Merge Intervals). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p08-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p08: Record<string, ApproachWalkthrough[]> = {
  'P08-summary-ranges': [
    {
      name: 'Extend the run, cut at a gap',
      time: 'O(n)',
      space: 'O(1) extra',
      best: true,
      points: [
        'The input is sorted and unique, so every range is a run of consecutive values.',
        'Remember where the run starts; step i while nums[i + 1] == nums[i] + 1.',
        'At the first gap, emit "a" for a run of one or "a->b" otherwise.',
        'Then start the next run after the gap. One pass, and nothing to sort.',
        'Trap: check i + 1 < len(nums) before reading nums[i + 1].',
      ],
      code: c['P08-summary-ranges'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nums',
              cells: [0, 1, 2, 4, 5, 7],
              pointers: [{ at: 0, label: 'start' }, { at: 2, label: 'i', tone: 'secondary' }],
              states: { 2: 'active', 3: 'miss' },
              span: { from: 0, to: 2, label: '"0->2"' },
              note: '2 + 1 ≠ 4 ⇒ the run ends at i',
            },
            {
              caption: 'next runs',
              cells: [0, 1, 2, 4, 5, 7],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'match', 4: 'match', 5: 'match' },
              span: { from: 3, to: 4, label: '"4->5"' },
              note: 'then 7 alone ⇒ ["0->2", "4->5", "7"]',
            },
          ],
        },
      ],
    },
  ],

  'P08-merge-intervals': [
    {
      name: 'Absorb into every overlap',
      time: 'O(n²)',
      space: 'O(n)',
      state: '`merged` = disjoint intervals in no particular order; the incoming `[start, end]` grows as it absorbs.',
      invariant: 'After each interval is processed, `merged` is disjoint and covers exactly the union of the intervals processed so far.',
      points: [
        'Keep a list of disjoint merged intervals, in any order.',
        'For each new interval, walk the whole list: absorb every one it overlaps, keep the rest.',
        'Two intervals overlap when s1 ≤ e2 and s2 ≤ e1.',
        'Correct without sorting, but each interval scans the whole list, so it costs O(n²).',
      ],
      code: c['P08-merge-intervals#absorb'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'adding 2–6 to the merged list',
              bars: [
                { from: 1, to: 3, state: 'match' },
                { from: 2, to: 6, state: 'active' },
              ],
              note: '1 ≤ 6 and 2 ≤ 3 ⇒ overlap ⇒ absorb ⇒ 1–6',
            },
            {
              caption: 'merged',
              bars: [
                { from: 1, to: 6, lane: 0, state: 'match' },
                { from: 8, to: 10, lane: 0, state: 'match' },
                { from: 15, to: 18, lane: 0, state: 'match' },
              ],
              note: 'every new interval compared with every merged one',
            },
          ],
        },
      ],
    },
    {
      name: 'Sort by start, extend the tail',
      time: 'O(n log n)',
      space: 'O(n)',
      best: true,
      points: [
        'Sort by start.',
        'Now an interval can only overlap the last merged one, the tail. Anything earlier ended before the tail began.',
        'start ≤ tail end ⇒ tail end = max(tail end, end); otherwise append a new tail.',
        'Take the max: a short interval inside the tail must not shrink it.',
        'The sort dominates; the merge pass is O(n).',
      ],
      code: c['P08-merge-intervals'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'sorted by start',
              bars: [
                { from: 1, to: 3, state: 'match' },
                { from: 2, to: 6, state: 'active' },
                { from: 8, to: 10 },
                { from: 15, to: 18 },
              ],
              marks: [{ at: 3, label: 'tail end' }],
              note: '2 ≤ 3 ⇒ extend the tail to max(3, 6) = 6 · 8 > 6 ⇒ new tail',
            },
            {
              caption: 'merged',
              bars: [
                { from: 1, to: 6, lane: 0, state: 'match' },
                { from: 8, to: 10, lane: 0, state: 'match' },
                { from: 15, to: 18, lane: 0, state: 'match' },
              ],
            },
          ],
        },
      ],
    },
  ],

  'P08-insert-interval': [
    {
      name: 'Append, sort, merge again',
      time: 'O(n log n)',
      space: 'O(n)',
      state: 'The list sorted by start; `merged` with its last block as the open tail.',
      invariant: 'Sorted by start, a new interval can only overlap `merged[-1]`; earlier blocks are final and disjoint.',
      points: [
        'Add the new interval to the list and run Merge Intervals.',
        'Always correct, and reuses code you already know.',
        'But the input is already sorted and disjoint, so the sort repeats work the input has done.',
      ],
      code: c['P08-insert-interval#remerge'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'append 4–8, then sort by start',
              bars: [
                { from: 1, to: 2 },
                { from: 3, to: 5 },
                { from: 4, to: 8, state: 'active', label: 'new' },
                { from: 6, to: 7 },
                { from: 8, to: 10 },
                { from: 12, to: 16 },
              ],
              note: 'then merge ⇒ 1–2, 3–10, 12–16',
            },
          ],
        },
      ],
    },
    {
      name: 'Three phases: before, overlap, after',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Sorted and disjoint input ⇒ the intervals touching the new one form one contiguous block.',
        '1. Copy intervals that end before new starts (end < start).',
        '2. While an interval starts ≤ new end, absorb it: start = min, end = max.',
        '3. Append the grown interval, then copy the rest.',
        'Use ≤ in phase 2: touching endpoints (8 and 8) merge.',
      ],
      code: c['P08-insert-interval'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'insert 4–8',
              bars: [
                { from: 4, to: 8, state: 'active', label: 'new' },
                { from: 1, to: 2 },
                { from: 3, to: 5, state: 'match' },
                { from: 6, to: 7, state: 'match' },
                { from: 8, to: 10, state: 'match' },
                { from: 12, to: 16 },
              ],
              note: 'copy 1–2 · absorb 3–5, 6–7, 8–10 · copy 12–16',
            },
            {
              caption: 'result',
              bars: [
                { from: 1, to: 2, lane: 0 },
                { from: 3, to: 10, lane: 0, state: 'match' },
                { from: 12, to: 16, lane: 0 },
              ],
            },
          ],
        },
      ],
    },
  ],
}

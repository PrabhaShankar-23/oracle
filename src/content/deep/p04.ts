/** Approach walkthroughs for P04 (Sliding Window — Variable Size). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p04-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p04: Record<string, ApproachWalkthrough[]> = {
  'P04-longest-substring-without-repeating-characters': [
    {
      name: 'Shrink one at a time',
      time: 'O(2n)',
      space: 'O(Σ)',
      points: [
        'Keep a set of the characters inside the window.',
        'When the new character is already in it, drop characters from the left until it is free.',
        'Then add it and record the window length.',
        'Correct, but each character can be removed one step at a time.',
      ],
      code: c['P04-longest-substring-without-repeating-characters#shrink'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 's = "abba" · r = 2 repeats b',
              cells: ['a', 'b', 'b', 'a'],
              pointers: [{ at: 0, label: 'l' }, { at: 2, label: 'r' }],
              states: { 2: 'miss' },
              note: "remove 'a', then 'b' — one step each — until 'b' fits",
            },
            {
              caption: 'window after shrinking',
              cells: ['a', 'b', 'b', 'a'],
              pointers: [{ at: 2, label: 'l' }, { at: 2, label: 'r' }],
              states: { 0: 'dim', 1: 'dim' },
              note: 'about 2n pointer moves in total',
            },
          ],
        },
      ],
    },
    {
      name: 'Jump l with last-seen',
      time: 'O(n)',
      space: 'O(Σ)',
      best: true,
      points: [
        'Store last[c] = the most recent index of each character.',
        'On a repeat, jump l straight to last[c] + 1.',
        'Take max(l, …) so l never moves backwards on a stale entry.',
        'The window [l, r] stays duplicate-free by construction.',
        'One pass, one dictionary write per character.',
      ],
      code: c['P04-longest-substring-without-repeating-characters'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'last = {a: 0, b: 1} · r = 2 sees b',
              cells: ['a', 'b', 'b', 'a'],
              pointers: [{ at: 0, label: 'l' }, { at: 2, label: 'r' }],
              note: "l jumps to last['b'] + 1 = 2 in one move",
            },
            {
              caption: 'r = 3 sees a, last = 0',
              cells: ['a', 'b', 'b', 'a'],
              pointers: [{ at: 2, label: 'l' }, { at: 3, label: 'r' }],
              states: { 0: 'dim', 1: 'dim' },
              note: '0 + 1 = 1 is behind l → keep l = 2 · best = 2',
            },
          ],
        },
      ],
    },
  ],

  'P04-longest-repeating-character-replacement': [
    {
      name: 'Recount the window max',
      time: 'O(26n)',
      space: 'O(1)',
      points: [
        'Grow the window and count its letters.',
        'While (length − most common count) > k, move l right.',
        'Finding the most common count rescans 26 buckets on every step.',
      ],
      code: c['P04-longest-repeating-character-replacement#recount'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 's = "AABABBA", k = 1',
              cells: ['A', 'A', 'B', 'A', 'B', 'B', 'A'],
              span: { from: 0, to: 3, label: 'window' },
              note: 'len 4 − max count 3 (A) = 1 ≤ k ✓ · max() scanned 26 buckets',
            },
          ],
        },
      ],
    },
    {
      name: 'Carry maxCount',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Keep maxCount = the best single-letter count ever seen, and never lower it.',
        'The window is valid while length − maxCount ≤ k.',
        'When it is not, drop one character on the left: the window slides, it never shrinks.',
        'A stale maxCount can only block growth, so it can never produce a too-large answer.',
        'The answer is the final window length.',
      ],
      code: c['P04-longest-repeating-character-replacement'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'window [0, 3] · maxCount 3',
              cells: ['A', 'A', 'B', 'A', 'B', 'B', 'A'],
              span: { from: 0, to: 3, label: 'window' },
              states: { 2: 'miss' },
              note: '4 − 3 = 1 ≤ k ⇒ replace the single B · best = 4',
            },
            {
              caption: 'r = 4 makes it invalid',
              cells: ['A', 'A', 'B', 'A', 'B', 'B', 'A'],
              pointers: [{ at: 0, label: 'out', tone: 'error' }],
              span: { from: 1, to: 4, label: 'window' },
              note: '5 − 3 = 2 > k → drop s[l], l++ · length stays 4',
            },
          ],
        },
      ],
    },
  ],

  'P04-minimum-size-subarray-sum': [
    {
      name: 'Prefix + binary search',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Build prefix sums; with positive values they increase.',
        'A window (l, r] sums to pre[r] − pre[l].',
        'For each r, binary search the rightmost l with pre[l] ≤ pre[r] − target.',
        'n searches of log n each, plus the prefix array.',
      ],
      code: c['P04-minimum-size-subarray-sum#binary'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [2, 3, 1, 2, 4, 3] },
            {
              caption: 'prefix sums · target 7 · r = 6 needs pre[l] ≤ 8',
              cells: [0, 2, 5, 6, 8, 12, 15],
              pointers: [{ at: 4, label: 'l' }, { at: 6, label: 'r' }],
              states: { 4: 'match', 6: 'match' },
              note: '15 − 8 = 7 ≥ target ⇒ length 6 − 4 = 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Shrink while valid',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Grow r, adding to a running sum.',
        'While the sum is ≥ target, record the length and drop nums[l].',
        'Positive values make the sum monotone in length, so shrinking is safe.',
        'l never moves back, so each index enters and leaves once.',
        'Linear time with two variables and no prefix array.',
      ],
      code: c['P04-minimum-size-subarray-sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'target 7 · first valid window',
              cells: [2, 3, 1, 2, 4, 3],
              span: { from: 0, to: 3, label: 'sum 8 ≥ 7' },
              note: 'record length 4, then shrink from the left',
            },
            {
              caption: 'shrunk until invalid',
              cells: [2, 3, 1, 2, 4, 3],
              pointers: [{ at: 1, label: 'l' }],
              span: { from: 1, to: 3, label: 'sum 6' },
              states: { 0: 'dim' },
              note: '6 < 7 → stop shrinking and grow r again',
            },
            {
              caption: 'best window',
              cells: [2, 3, 1, 2, 4, 3],
              span: { from: 4, to: 5, label: 'sum 7 ≥ 7' },
              states: { 4: 'match', 5: 'match' },
              note: 'length 2',
            },
          ],
        },
      ],
    },
  ],

  'P04-minimum-window-substring': [
    {
      name: 'Every substring',
      time: 'O(n²·Σ)',
      space: 'O(Σ)',
      points: [
        'Try every start i and every end j.',
        'Count the substring and check it covers every letter of t.',
        'Keep the shortest one that does.',
        'Each check re-counts the whole substring.',
      ],
      code: c['P04-minimum-window-substring#substrings'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 's = "ADOBECODEBANC", t = "ABC"',
              cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
              span: { from: 0, to: 5, label: 'ADOBEC ✓' },
              note: 'then (0,6), (0,7) … (1,·) … every pair gets counted',
            },
          ],
        },
      ],
    },
    {
      name: 'Expand then contract',
      time: 'O(n + m)',
      space: 'O(Σ)',
      best: true,
      points: [
        'need = counts of t, have = counts in the window, formed = how many letters are satisfied.',
        'Grow r until formed == distinct(t): the window is feasible.',
        'Then shrink from l while it stays feasible, recording the best.',
        'Dropping a letter below its need un-forms it, so r has to grow again.',
        'Each index enters and leaves the window once.',
      ],
      code: c['P04-minimum-window-substring'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'first feasible window',
              cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
              span: { from: 0, to: 5, label: 'formed = 3' },
              states: { 0: 'match', 3: 'match', 5: 'match' },
              note: 'record length 6, then contract from the left',
            },
            {
              caption: "dropping 'A' breaks it",
              cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
              span: { from: 3, to: 10, label: 'grow r until A returns' },
              states: { 0: 'dim', 1: 'dim', 2: 'dim' },
              note: 'feasible again at index 10',
            },
            {
              caption: 'final contraction',
              cells: ['A', 'D', 'O', 'B', 'E', 'C', 'O', 'D', 'E', 'B', 'A', 'N', 'C'],
              span: { from: 9, to: 12, label: 'BANC' },
              states: { 9: 'match', 10: 'match', 12: 'match' },
              note: 'length 4 ⇒ the answer',
            },
          ],
        },
      ],
    },
  ],
}

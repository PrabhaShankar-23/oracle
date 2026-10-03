/** Approach walkthroughs for P32 (Backtracking — Permutations). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p32-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p32: Record<string, ApproachWalkthrough[]> = {
  'P32-permutations': [
    {
      name: 'used[] and a path',
      time: 'O(n!·n)',
      space: 'O(n)',
      state: '`path` = the numbers placed so far; `used[i]` marks the indices in `path`.',
      invariant: '`path` never repeats an index; once `len(path) == n` it is one full permutation, and every undo restores `path` and `used` together.',
      points: [
        'At each depth, try every number not used yet: mark it, add it to the path, recurse, undo.',
        'A full path is one permutation.',
        'Easy to extend (it is the base for Permutations II), at the cost of a used array.',
      ],
      code: c['P32-permutations#used'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'path', cells: [2, 3], states: { 0: 'active', 1: 'active' } },
            { caption: 'used for [1, 2, 3]', cells: ['F', 'T', 'T'], states: { 0: 'match' }, note: 'only 1 is left ⇒ [2, 3, 1]' },
          ],
        },
      ],
    },
    {
      name: 'Swap into slot i',
      time: 'O(n!·n)',
      space: 'O(n) stack',
      best: true,
      points: [
        'nums[:i] is fixed. Each j ≥ i takes a turn in slot i: swap i and j, recurse on i + 1, swap back.',
        'No path list and no used array: the array itself is the state.',
        'At i = n, copy the array.',
      ],
      code: c['P32-permutations'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'slot 0 gets 1', cells: [1, 2, 3], pointers: [{ at: 0, label: 'i' }], states: { 0: 'match' } },
            { caption: 'swap 0 ↔ 1: slot 0 gets 2', cells: [2, 1, 3], pointers: [{ at: 0, label: 'i' }, { at: 1, label: 'j', tone: 'secondary' }], states: { 0: 'match' } },
            { caption: 'swap 0 ↔ 2: slot 0 gets 3', cells: [3, 2, 1], pointers: [{ at: 0, label: 'i' }, { at: 2, label: 'j', tone: 'secondary' }], states: { 0: 'match' }, note: 'swap back after each branch' },
          ],
        },
      ],
    },
  ],

  'P32-permutations-ii': [
    {
      name: 'Swap, with a set per slot',
      time: 'O(n!·n)',
      space: 'O(n²)',
      state: 'Slots `0 … i−1` fixed in `nums`; `tried` = the values already placed in slot `i`.',
      invariant: 'Each distinct value is placed in slot `i` only once, so no two branches produce the same permutation.',
      points: [
        'The plain swap version produces duplicates when values repeat.',
        'Fix: at each slot, remember which values you already placed there, and skip repeats.',
        'Works without sorting, at the cost of one set per level.',
      ],
      code: c['P32-permutations-ii#swapset'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'slot 0 over [1, 1, 2]', cells: [1, 1, 2], states: { 0: 'match', 1: 'miss', 2: 'match' }, note: 'the second 1 is already in the slot-0 set ⇒ skipped' }] }],
    },
    {
      name: 'Sort, used[], predecessor rule',
      time: 'O(n!·n)',
      space: 'O(n)',
      best: true,
      points: [
        'Sort so equal values are adjacent.',
        'Skip nums[i] if it equals nums[i − 1] and nums[i − 1] is not currently used.',
        'That forces equal values to be used strictly left to right, so each arrangement appears once.',
        'Trap: the plain swap trick from Permutations does not dedupe on its own.',
      ],
      code: c['P32-permutations-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums (sorted)', cells: [1, 1, 2] },
            { caption: 'used at depth 0', cells: ['F', 'F', 'F'], states: { 1: 'miss' }, note: 'the second 1 is blocked while the first 1 is unused ⇒ 3 answers, not 6' },
          ],
        },
      ],
    },
  ],
}

/** Approach walkthroughs for X2 (Hashing Fundamentals). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './x2-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const x2: Record<string, ApproachWalkthrough[]> = {
  'X2-two-sum': [
    {
      name: 'Check every pair',
      time: 'O(n²)',
      space: 'O(1)',
      state: 'Indices `i < j`.',
      invariant: 'Every pair `(i′, j′)` with `i′ < i` has already been checked and missed the target.',
      points: ['Try all i < j.', 'Sorting plus two pointers would lose the original indices, which are what is asked for.'],
      code: c['X2-two-sum#pairs'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'target 9', cells: [2, 7, 11, 15], states: { 0: 'match', 1: 'match' } }] }],
    },
    {
      name: 'One pass with a value → index map',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'For each x, look up target − x among the values already seen.',
        'Check before inserting x, so an element never pairs with itself.',
        'Return the stored index and i.',
      ],
      code: c['X2-two-sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [2, 7, 11, 15], pointers: [{ at: 1, label: 'i' }], states: { 0: 'match', 1: 'active' } },
            { caption: 'seen', cells: ['2 → 0'], note: '9 − 7 = 2 is in seen ⇒ [0, 1]' },
          ],
        },
      ],
    },
  ],

  'X2-valid-anagram': [
    {
      name: 'Sort both',
      time: 'O(n log n)',
      space: 'O(n)',
      state: '`sorted(s)` and `sorted(t)`.',
      invariant: 'Two strings are anagrams exactly when their sorted letters are equal.',
      points: ['Anagrams have the same sorted letters.', 'One line, but it sorts when counting is enough.'],
      code: c['X2-valid-anagram#sort'],
      diagrams: [{ kind: 'cells', rows: [{ caption: '"anagram" and "nagaram" sorted', cells: ['a', 'a', 'a', 'g', 'm', 'n', 'r'], note: 'equal ⇒ true' }] }],
    },
    {
      name: 'One count array, +1 and −1',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Different lengths ⇒ false.',
        'Add 1 for each letter of s and subtract 1 for each letter of t.',
        'Anagrams ⇔ every count is back to 0.',
        'Unicode follow-up: use a Counter instead of 26 slots.',
      ],
      code: c['X2-valid-anagram'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'counts for a, g, m, n, r', cells: [0, 0, 0, 0, 0], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match', 4: 'match' }, note: 'all zero ⇒ true' }] }],
    },
  ],

  'X2-group-anagrams': [
    {
      name: 'Sorted string as the key',
      time: 'O(n·L log L)',
      space: 'O(n·L)',
      state: '`groups` = sorted letters → the words with those letters.',
      invariant: 'Anagrams sort to the same string, so each group is exactly one anagram class.',
      points: ['Anagrams sort to the same string; group by it.', 'Clear, with an L log L sort per word.'],
      code: c['X2-group-anagrams#sorted'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'key "aet"', cells: ['eat', 'tea', 'ate'], states: { 0: 'match', 1: 'match', 2: 'match' } }] }],
    },
    {
      name: 'Letter counts as the key',
      time: 'O(n·L)',
      space: 'O(n·L)',
      best: true,
      points: [
        'A tuple of 26 counts is identical for all anagrams.',
        'Building it is O(L), so there is no sort.',
        'Any canonical form works, as long as every anagram maps to the same one.',
      ],
      code: c['X2-group-anagrams'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'key (a, e, t = 1)', cells: ['eat', 'tea', 'ate'], states: { 0: 'match', 1: 'match', 2: 'match' } },
            { caption: 'key (a, n, t = 1)', cells: ['tan', 'nat'] },
            { caption: 'key (a, b, t = 1)', cells: ['bat'] },
          ],
        },
      ],
    },
  ],

  'X2-contains-duplicate': [
    {
      name: 'Sort, compare neighbours',
      time: 'O(n log n)',
      space: 'O(n) (O(1) with nums.sort())',
      state: '`nums` sorted.',
      invariant: 'In sorted order equal values are adjacent, so a duplicate exists exactly when some neighbours are equal.',
      points: ['After sorting, duplicates sit next to each other.', 'Use this when memory matters more than time.'],
      code: c['X2-contains-duplicate#sort'],
      diagrams: [{ kind: 'cells', rows: [{ caption: '[1, 2, 3, 1] sorted', cells: [1, 1, 2, 3], states: { 0: 'match', 1: 'match' } }] }],
    },
    {
      name: 'Set: first failed insert',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: ['Add each number to a set.', 'A number already in the set is a duplicate ⇒ return true immediately.'],
      code: c['X2-contains-duplicate'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'nums', cells: [1, 2, 3, 1], pointers: [{ at: 3, label: 'x' }], states: { 3: 'match' }, note: '1 is already in {1, 2, 3} ⇒ true' }] }],
    },
  ],
}

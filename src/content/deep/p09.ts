/** Approach walkthroughs for P09 (Cyclic Sort). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p09-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p09: Record<string, ApproachWalkthrough[]> = {
  'P09-missing-number': [
    {
      name: 'Sort and find the gap',
      time: 'O(n log n)',
      space: 'O(1)',
      points: [
        'After sorting, slot i should hold i.',
        'The first slot that does not is the missing number; if every slot matches, it is n.',
        'Simple, but the sort costs O(n log n). The follow-up asks for O(n) time and O(1) space.',
      ],
      code: c['P09-missing-number#sort'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '[4, 0, 3, 1] sorted',
              cells: [0, 1, 3, 4],
              pointers: [{ at: 2, label: 'i' }],
              states: { 0: 'match', 1: 'match', 2: 'miss' },
              note: 'slot 2 holds 3 ⇒ 2 is missing',
            },
          ],
        },
      ],
    },
    {
      name: 'Gauss sum minus actual',
      time: 'O(n)',
      space: 'O(1)',
      points: [
        '0 + 1 + … + n = n(n + 1) / 2.',
        'Subtract the actual sum; what is left is the missing value.',
        'Meets the follow-up. In Java or C++ the sum can overflow int, so use long.',
      ],
      code: c['P09-missing-number#sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nums (n = 4)',
              cells: [4, 0, 3, 1],
              note: '4·5 / 2 = 10 · sum = 8 · 10 − 8 = 2',
            },
          ],
        },
      ],
    },
    {
      name: 'XOR indices with values',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'x ^ x = 0 and x ^ 0 = x, in any order.',
        'Start acc at n (the index with no slot), then XOR in every index i and every value.',
        'Each of 0…n appears twice, once as an index and once as a value, except the missing one.',
        'The pairs cancel and acc ends as the missing value.',
        'No overflow, no formula to remember.',
      ],
      code: c['P09-missing-number'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'index (plus n = 4)', cells: [0, 1, 2, 3, 4], states: { 2: 'active' } },
            {
              caption: 'value',
              cells: [4, 0, 3, 1],
              note: '0, 1, 3, 4 each appear twice ⇒ cancel · 2 appears once ⇒ acc = 2',
            },
          ],
        },
      ],
    },
  ],

  'P09-first-missing-positive': [
    {
      name: 'Cyclic sort into slot v − 1',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'LeetCode requires O(n) time and O(1) extra space, so a hash set or a sort is out.',
        'The answer is in 1…n + 1, so only values in 1…n matter.',
        'Swap each value v in 1…n into slot v − 1, repeating at i until the value there is placed or unusable.',
        'Then the first slot i without i + 1 gives the answer i + 1. If every slot matches, it is n + 1.',
        'Every swap places one value for good, so the total work is O(n).',
      ],
      code: c['P09-first-missing-positive'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nums',
              cells: [3, 4, -1, 1],
              note: '3 → slot 2, 4 → slot 3, 1 → slot 0; −1 stays put',
            },
            {
              caption: 'after placement',
              cells: [1, -1, 3, 4],
              pointers: [{ at: 1, label: 'i' }],
              states: { 0: 'match', 1: 'miss', 2: 'match', 3: 'match' },
              note: 'slot 1 should hold 2 ⇒ answer 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Mark presence with signs',
      time: 'O(n)',
      space: 'O(1)',
      trick: true,
      points: [
        'Another way to use the array as its own hash set, without swaps.',
        'First overwrite every value outside 1…n with n + 1, so only positives remain.',
        'For each value v ≤ n, make slot v − 1 negative: "v is present".',
        'The first slot still positive is the answer; if none, n + 1.',
        'Use abs() when reading: a slot may already be negated.',
      ],
      code: c['P09-first-missing-positive#sign'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'out-of-range → n + 1 (n = 4)',
              cells: [3, 4, 5, 1],
              states: { 2: 'dim' },
              note: '−1 became 5, which marks nothing',
            },
            {
              caption: 'negate slot v − 1 for v = 3, 4, 1',
              cells: [-3, 4, -5, -1],
              pointers: [{ at: 1, label: 'first +' }],
              states: { 0: 'match', 1: 'miss', 2: 'match', 3: 'match' },
              note: 'slot 1 stayed positive ⇒ 2 is missing',
            },
          ],
        },
      ],
    },
  ],
}

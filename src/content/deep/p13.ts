/** Approach walkthroughs for P13 (Binary Search — on Answer Space). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p13-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p13: Record<string, ApproachWalkthrough[]> = {
  'P13-sqrtx': [
    {
      name: 'Count up while r² ≤ x',
      time: 'O(√x)',
      space: 'O(1)',
      points: [
        'Try r = 1, 2, 3… while (r + 1)² ≤ x.',
        'Correct and obvious, but about 46 000 steps for x near 2³¹.',
      ],
      code: c['P13-sqrtx#count'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'r', cells: [0, 1, 2, 3] },
            {
              caption: 'r² vs x = 8',
              cells: [0, 1, 4, 9],
              states: { 2: 'match', 3: 'miss' },
              note: '9 > 8 ⇒ stop at r = 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Binary search the last m² ≤ x',
      time: 'O(log x)',
      space: 'O(1)',
      best: true,
      points: [
        'The answer is not in an array; search the range 0…x instead.',
        '“m·m ≤ x” is true, true, …, then false forever. Find the last true.',
        'True ⇒ remember m and go right; false ⇒ go left.',
        'In Java or C++ compare m ≤ x / m to avoid overflowing m·m.',
      ],
      code: c['P13-sqrtx'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'm', cells: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
            {
              caption: 'm·m ≤ 8 ?',
              cells: ['T', 'T', 'T', 'F', 'F', 'F', 'F', 'F', 'F'],
              pointers: [{ at: 2, label: 'ans' }],
              states: { 2: 'match' },
              note: 'mid 4 ✗ → 1 ✓ → 2 ✓ → 3 ✗ ⇒ last true = 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Newton’s method',
      time: 'O(log x)',
      space: 'O(1)',
      trick: true,
      points: [
        'Solve r² = x with Newton steps: r ← (r + x / r) / 2.',
        'In integers, start at r = x and step while r² > x. It only ever moves down, and stops on ⌊√x⌋.',
        'Converges very fast: about 20 steps even near 2³¹.',
        'Worth mentioning when asked for “something faster than binary search”.',
      ],
      code: c['P13-sqrtx#newton'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'r after each step (x = 8)',
              cells: [8, 4, 3, 2],
              states: { 3: 'match' },
              note: '(8 + 1) // 2 = 4 · (4 + 2) // 2 = 3 · (3 + 2) // 2 = 2 · 2² ≤ 8 ⇒ stop',
            },
          ],
        },
      ],
    },
  ],

  'P13-koko-eating-bananas': [
    {
      name: 'Try every speed',
      time: 'O(max(p) · n)',
      space: 'O(1)',
      points: [
        'At speed k, pile p takes ⌈p / k⌉ hours.',
        'Try k = 1, 2, 3… and return the first whose total hours ≤ h.',
        'Up to max(piles) speeds, each summing n piles: too slow when piles reach 10⁹.',
      ],
      code: c['P13-koko-eating-bananas#scan'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'k · piles [3, 6, 7, 11], h = 8', cells: [1, 2, 3, 4] },
            {
              caption: 'hours',
              cells: [27, 15, 10, 8],
              states: { 0: 'miss', 1: 'miss', 2: 'miss', 3: 'match' },
              note: 'first k with hours ≤ 8 ⇒ 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Binary search the speed',
      time: 'O(n log max(p))',
      space: 'O(1)',
      best: true,
      points: [
        'A faster speed never needs more hours, so “hours ≤ h” is false, …, false, then true forever.',
        'Binary search k in 1…max(piles) for the first true.',
        'Feasible ⇒ hi = k (try slower); otherwise lo = k + 1.',
        'The whole trick: the answer space is monotone even though it is not an array.',
      ],
      code: c['P13-koko-eating-bananas'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'k', cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
            {
              caption: 'hours ≤ 8 ?',
              cells: ['F', 'F', 'F', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'],
              pointers: [{ at: 3, label: 'answer' }],
              states: { 3: 'match' },
              note: 'mid 6 ✓ → 3 ✗ → 5 ✓ → 4 ✓ ⇒ first true = 4',
            },
          ],
        },
      ],
    },
  ],
}

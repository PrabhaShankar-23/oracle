/** Approach walkthroughs for P06 (Kadane's / Max Subarray). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p06-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p06: Record<string, ApproachWalkthrough[]> = {
  'P06-maximum-subarray': [
    {
      name: 'Prefix − min prefix',
      time: 'O(n)',
      space: 'O(1)',
      points: [
        'The sum of a[j…i] is prefix[i] − prefix[j−1].',
        'Walk once, keeping the smallest prefix seen so far.',
        'best = max(prefix − minPrefix).',
        'Same cost as Kadane, but one more quantity to keep straight.',
      ],
      code: c['P06-maximum-subarray#prefix'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
            {
              caption: 'running prefix',
              cells: [-2, -1, -4, 0, -1, 1, 2, -3, 1],
              pointers: [{ at: 2, label: 'min', tone: 'secondary' }, { at: 6, label: 'i' }],
              states: { 2: 'active', 6: 'match' },
              note: '2 − (−4) = 6 ⇒ best',
            },
          ],
        },
      ],
    },
    {
      name: 'Kadane',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'cur = the best sum of a subarray ending at i.',
        'cur = max(a[i], cur + a[i]): either extend, or start fresh at a[i].',
        'A prefix with a negative sum can never help later, so it is dropped.',
        'best keeps the largest cur seen.',
        'One pass, two variables.',
      ],
      code: c['P06-maximum-subarray'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nums',
              cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
              span: { from: 3, to: 6, label: '4 − 1 + 2 + 1 = 6' },
              states: { 3: 'match', 4: 'match', 5: 'match', 6: 'match' },
            },
            {
              caption: 'cur at each step',
              cells: [-2, 1, -2, 4, 3, 5, 6, 1, 5],
              states: { 2: 'miss', 6: 'match' },
              note: 'cur restarts at index 3 because −2 + 4 < 4 · best = 6',
            },
          ],
        },
      ],
    },
  ],

  'P06-maximum-product-subarray': [
    {
      name: 'All subarrays',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Multiply outward from every start index.',
        'Keep the largest product seen.',
        'Negatives and zeros need no special handling, but it is quadratic.',
      ],
      code: c['P06-maximum-product-subarray#brute'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'start 0',
              cells: [2, 3, -2, 4],
              span: { from: 0, to: 1, label: '2 × 3 = 6' },
              note: 'then ×(−2) = −12, ×4 = −48 · repeat from every start ⇒ 6',
            },
          ],
        },
      ],
    },
    {
      name: 'Carry both extremes',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'The best product ending at i is a[i], curMax × a[i] or curMin × a[i].',
        'So carry the running maximum and the running minimum together.',
        'A negative value swaps their roles — swap before updating.',
        'A zero resets both to the element itself.',
        'One pass, two variables.',
      ],
      code: c['P06-maximum-product-subarray'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nums',
              cells: [2, 3, -2, 4],
              pointers: [{ at: 2, label: 'negative', tone: 'error' }],
              states: { 2: 'active' },
              note: 'at −2 the max and min swap roles first',
            },
            { caption: 'curMax', cells: [2, 6, -2, 4], states: { 1: 'match' } },
            {
              caption: 'curMin',
              cells: [2, 3, -12, -48],
              note: 'a large negative min is one multiplication away from being the max · best = 6',
            },
          ],
        },
      ],
    },
  ],

  'P06-maximum-sum-circular-subarray': [
    {
      name: 'Doubled array',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Lay the array out twice so a wrap becomes an ordinary window.',
        'Every answer is a window of length ≤ n in that doubled array.',
        'Prefix sums plus a monotonic deque of the smallest prefix keep it linear.',
        'Correct, but it materialises 2n prefixes and needs a deque.',
      ],
      code: c['P06-maximum-sum-circular-subarray#double'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '[5, −3, 5] laid out twice',
              cells: [5, -3, 5, 5, -3, 5],
              span: { from: 2, to: 3, label: 'window ≤ n' },
              states: { 2: 'match', 3: 'match' },
              note: 'the wrap 5 + 5 = 10 is a normal window here',
            },
          ],
        },
      ],
    },
    {
      name: 'Total − min subarray',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        "A wrapping subarray's complement is a normal, non-wrapping one.",
        'So the best wrap = total − (minimum subarray sum).',
        'Run Kadane twice in the same pass: one for max, one for min.',
        'Answer = max(kadaneMax, total − kadaneMin).',
        'If every value is negative, total − kadaneMin is the empty subarray — return kadaneMax instead.',
      ],
      code: c['P06-maximum-sum-circular-subarray'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'non-wrapping best (Kadane)',
              cells: [5, -3, 5],
              states: { 0: 'match', 1: 'match', 2: 'match' },
              note: 'kadaneMax = 7 · total = 7',
            },
            {
              caption: 'wrapping best = total − min subarray',
              cells: [5, -3, 5],
              states: { 1: 'miss' },
              note: 'min subarray = −3 ⇒ 7 − (−3) = 10 ⇒ answer 10',
            },
            {
              caption: 'all-negative guard',
              cells: [-3, -2, -3],
              states: { 1: 'match' },
              note: 'total − min = 0 is the empty subarray → return kadaneMax = −2',
            },
          ],
        },
      ],
    },
  ],
}

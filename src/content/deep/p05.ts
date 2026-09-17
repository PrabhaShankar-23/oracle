/** Approach walkthroughs for P05 (Prefix Sum + HashMap). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p05-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p05: Record<string, ApproachWalkthrough[]> = {
  'P05-contains-duplicate-ii': [
    {
      name: 'Check the next k',
      time: 'O(n·k)',
      space: 'O(1)',
      points: [
        'For each i, look at the next k elements.',
        'An equal value inside that range answers True.',
        'No extra memory, but up to n·k comparisons.',
      ],
      code: c['P05-contains-duplicate-ii#pairs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'k = 3 · i = 0',
              cells: [1, 2, 3, 1],
              pointers: [{ at: 0, label: 'i', tone: 'secondary' }],
              span: { from: 1, to: 3, label: 'j ≤ i + k' },
              states: { 0: 'active', 3: 'match' },
              note: 'nums[3] == nums[0] and 3 − 0 ≤ 3 ⇒ True',
            },
          ],
        },
      ],
    },
    {
      name: 'Last-index map',
      time: 'O(n)',
      space: 'O(min(n, k))',
      best: true,
      points: [
        'Keep last[value] = the most recent index of that value.',
        'At each i, if the value was seen and i − last ≤ k ⇒ True.',
        'Overwrite the entry every time: only the nearest earlier copy can qualify.',
        'One pass, one dictionary.',
      ],
      code: c['P05-contains-duplicate-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'last = {1: 0, 2: 1, 3: 2} at i = 3',
              cells: [1, 2, 3, 1],
              pointers: [{ at: 3, label: 'i' }],
              states: { 0: 'match', 3: 'match' },
              note: '1 was at index 0 · 3 − 0 = 3 ≤ k ⇒ True',
            },
          ],
        },
      ],
    },
  ],

  'P05-subarray-sum-equals-k': [
    {
      name: 'All subarrays',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Fix a start, extend the end, keeping a running total.',
        'Count every time the total equals k.',
        'No hash map, but quadratic work.',
      ],
      code: c['P05-subarray-sum-equals-k#pairs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'k = 3 · start 0',
              cells: [1, 2, 3],
              span: { from: 0, to: 1, label: '1 + 2 = 3 ✓' },
              note: 'then (0,2) = 6, (1,1) = 2, (1,2) = 5, (2,2) = 3 ✓ ⇒ 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Prefix-count map',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Walk once, keeping the running prefix sum.',
        'A subarray ending here sums to k iff some earlier prefix equals prefix − k.',
        'A map of prefix → count answers that in O(1).',
        'Seed {0: 1} so subarrays starting at index 0 are counted.',
        'Works with negative values, where a sliding window would not.',
      ],
      code: c['P05-subarray-sum-equals-k'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'prefix sums (pre[0] = 0)',
              cells: [0, 1, 3, 6],
              note: 'subarray (i, j] sums to k iff pre[j] − pre[i] = k',
            },
            {
              caption: 'at i = 2 · counts {0: 1, 1: 1, 3: 1}',
              cells: [1, 2, 3],
              pointers: [{ at: 2, label: 'i' }],
              states: { 2: 'active' },
              note: 'prefix 6 · looking for 6 − 3 = 3 → seen once ⇒ total 2',
            },
          ],
        },
      ],
    },
  ],

  'P05-product-of-array-except-self': [
    {
      name: 'Prefix and suffix arrays',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'pre[i] = product of everything left of i.',
        'suf[i] = product of everything right of i.',
        'Answer is pre[i] × suf[i].',
        'Clear, but it holds two extra arrays.',
      ],
      code: c['P05-product-of-array-except-self#arrays'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [1, 2, 3, 4] },
            { caption: 'pre', cells: [1, 1, 2, 6] },
            { caption: 'suf', cells: [24, 12, 4, 1] },
            {
              caption: 'pre × suf',
              cells: [24, 12, 8, 6],
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' },
            },
          ],
        },
      ],
    },
    {
      name: 'Suffix in one variable',
      time: 'O(n)',
      space: 'O(1) extra',
      best: true,
      points: [
        'Pass 1 fills the output with the prefix products.',
        'Pass 2 walks back with a single running suffix product R.',
        'out[i] *= R, then R *= nums[i].',
        'The right product is only ever needed at one index at a time.',
        'No division, so zeros need no special case.',
      ],
      code: c['P05-product-of-array-except-self'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'after pass 1: out = products of the left', cells: [1, 1, 2, 6] },
            {
              caption: 'pass 2 at i = 2 · R = 4',
              cells: [24, 12, 8, 6],
              pointers: [{ at: 2, label: 'i' }],
              states: { 2: 'active' },
              note: 'out[2] = 2 × 4 = 8, then R = 4 × 3 = 12',
            },
          ],
        },
      ],
    },
  ],

  'P05-longest-consecutive-sequence': [
    {
      name: 'Sort then scan',
      time: 'O(n log n)',
      space: 'O(1)',
      points: [
        'Sort the values and drop duplicates.',
        'Scan once, counting runs of consecutive values.',
        'Simple, but sorting dominates the cost.',
      ],
      code: c['P05-longest-consecutive-sequence#sort'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'sorted [100, 4, 200, 1, 3, 2]',
              cells: [1, 2, 3, 4, 100, 200],
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' },
              note: 'run 1, 2, 3, 4 ⇒ 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Set + run heads',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Put every value in a set.',
        'Start a walk at x only when x − 1 is missing: x heads a run.',
        'Then step x+1, x+2 … while they are in the set.',
        'Every value is walked at most once, so the total work stays linear.',
        'The no-predecessor guard is what prevents quadratic re-walking.',
      ],
      code: c['P05-longest-consecutive-sequence'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'values in a set',
              cells: [100, 4, 200, 1, 3, 2],
              pointers: [{ at: 3, label: 'head' }],
              states: { 3: 'active' },
              note: '0 is missing ⇒ 1 starts a walk',
            },
            {
              caption: 'walk 1 → 2 → 3 → 4',
              cells: [100, 4, 200, 1, 3, 2],
              states: { 1: 'match', 3: 'match', 4: 'match', 5: 'match' },
              note: '4 is never a start: 3 exists, so it is skipped ⇒ 4',
            },
          ],
        },
      ],
    },
  ],
}

/**
 * SAMPLE: approach walkthroughs for P01 (Two Pointers — Converging).
 * Code comes from p01-code.json, whose snippets are all tested against the LeetCode examples.
 */
import type { ApproachWalkthrough } from '../types'
import code from './p01-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p01: Record<string, ApproachWalkthrough[]> = {
  'P01-valid-palindrome': [
    {
      name: 'Cleaned copy',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Filter s down to letters and digits, lowercased, into a new list.',
        'Compare that list with its reverse.',
        'Equal ⇒ palindrome.',
        'Easy to get right, but it builds two extra copies of size n.',
      ],
      code: c['P01-valid-palindrome#copy'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'cleaned "No, on!"', cells: ['n', 'o', 'o', 'n'] },
            {
              caption: 'reversed',
              cells: ['n', 'o', 'o', 'n'],
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' },
              note: 'cleaned == reversed → True',
            },
          ],
        },
      ],
    },
    {
      name: 'Converge in place',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Put l at the start and r at the end.',
        'Skip anything that is not a letter or digit, from both sides.',
        'Compare s[l] and s[r] lowercased; a mismatch ⇒ False.',
        'Otherwise move both inward: everything outside [l, r] is already matched.',
        'When l meets r every pair matched ⇒ True, with no copy.',
      ],
      code: c['P01-valid-palindrome'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'step 1',
              cells: ['N', 'o', ',', '␣', 'o', 'n', '!'],
              pointers: [{ at: 0, label: 'l' }, { at: 5, label: 'r' }],
              states: { 0: 'match', 5: 'match', 6: 'dim' },
              note: "r skips '!' · N = n ✓ → l++, r--",
            },
            {
              caption: 'step 2',
              cells: ['N', 'o', ',', '␣', 'o', 'n', '!'],
              pointers: [{ at: 1, label: 'l' }, { at: 4, label: 'r' }],
              states: { 0: 'dim', 1: 'match', 4: 'match', 5: 'dim', 6: 'dim' },
              note: 'o = o ✓ → l++, r--',
            },
            {
              caption: 'step 3',
              cells: ['N', 'o', ',', '␣', 'o', 'n', '!'],
              pointers: [{ at: 3, label: 'l' }, { at: 3, label: 'r' }],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'dim', 5: 'dim', 6: 'dim' },
              note: "l skips ',' and reaches r → nothing left → True",
            },
          ],
        },
      ],
    },
  ],

  'P01-two-sum-ii-input-array-is-sorted': [
    {
      name: 'All pairs',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Two nested loops: i from the left, j from i + 1.',
        'Check numbers[i] + numbers[j] == target.',
        'Return the 1-indexed pair on the first hit.',
        'It ignores that the array is sorted, so it checks up to n(n−1)/2 pairs.',
      ],
      code: c['P01-two-sum-ii-input-array-is-sorted#pairs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'target 10 · i = 0',
              cells: [1, 3, 4, 6, 8, 11],
              pointers: [{ at: 0, label: 'i', tone: 'secondary' }],
              states: { 0: 'active' },
              span: { from: 1, to: 5, label: 'try every j' },
              note: '1+3, 1+4, 1+6, 1+8, 1+11 — no 10',
            },
            {
              caption: 'i = 2',
              cells: [1, 3, 4, 6, 8, 11],
              pointers: [{ at: 2, label: 'i', tone: 'secondary' }, { at: 3, label: 'j', tone: 'success' }],
              states: { 0: 'dim', 1: 'dim', 2: 'active', 3: 'match' },
              note: '4 + 6 = 10 ✓ → [3, 4]',
            },
          ],
        },
      ],
    },
    {
      name: 'Binary search',
      time: 'O(n log n)',
      space: 'O(1)',
      points: [
        'The array is sorted, so the partner of numbers[i] can be binary searched.',
        'For each i, need = target − numbers[i].',
        'Search only right of i (lo = i + 1) so a value is never paired with itself.',
        'Found ⇒ return [i + 1, j + 1].',
        'n searches of log n each.',
      ],
      code: c['P01-two-sum-ii-input-array-is-sorted#binary'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'i = 0 · need 10 − 1 = 9',
              cells: [1, 3, 4, 6, 8, 11],
              pointers: [{ at: 0, label: 'i', tone: 'secondary' }],
              states: { 0: 'active' },
              span: { from: 1, to: 5, label: 'binary search' },
              note: '9 is not there',
            },
            {
              caption: 'i = 2 · need 10 − 4 = 6',
              cells: [1, 3, 4, 6, 8, 11],
              pointers: [{ at: 2, label: 'i', tone: 'secondary' }, { at: 3, label: 'j', tone: 'success' }],
              states: { 0: 'dim', 1: 'dim', 2: 'active', 3: 'match' },
              span: { from: 3, to: 5, label: 'search' },
              note: 'found 6 at j = 3 → [3, 4]',
            },
          ],
        },
      ],
    },
    {
      name: 'Converge',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'l at the smallest value, r at the largest.',
        'sum < target ⇒ numbers[l] is too small for every remaining r: l += 1.',
        'sum > target ⇒ numbers[r] is too big for every remaining l: r −= 1.',
        'Each move throws away a whole row or column of pairs — never the answer.',
        'At most n moves.',
      ],
      code: c['P01-two-sum-ii-input-array-is-sorted'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'target 10',
              cells: [1, 3, 4, 6, 8, 11],
              pointers: [{ at: 0, label: 'l' }, { at: 5, label: 'r' }],
              states: { 0: 'active', 5: 'miss' },
              note: '1 + 11 = 12 > 10 → r--',
            },
            {
              cells: [1, 3, 4, 6, 8, 11],
              pointers: [{ at: 0, label: 'l' }, { at: 4, label: 'r' }],
              states: { 0: 'miss', 4: 'active', 5: 'dim' },
              note: '1 + 8 = 9 < 10 → l++',
            },
            {
              caption: 'then 3+8 > 10 → r--, 3+6 < 10 → l++',
              cells: [1, 3, 4, 6, 8, 11],
              pointers: [{ at: 2, label: 'l', tone: 'success' }, { at: 3, label: 'r', tone: 'success' }],
              states: { 0: 'dim', 1: 'dim', 2: 'match', 3: 'match', 4: 'dim', 5: 'dim' },
              note: '4 + 6 = 10 ✓ → [3, 4]',
            },
          ],
        },
      ],
    },
  ],

  'P01-3sum': [
    {
      name: 'Every triple',
      time: 'O(n³)',
      space: 'O(k) for results',
      points: [
        'Three nested loops over i < j < k.',
        'Keep triples that sum to 0.',
        'Store each as a sorted tuple in a set, so (−1, 0, 1) is kept once.',
        'C(n, 3) triples ⇒ cubic.',
      ],
      code: c['P01-3sum#brute'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'i = 0, j = 1, k = 2',
              cells: [-1, 0, 1, 2, -1, -4],
              pointers: [{ at: 0, label: 'i' }, { at: 1, label: 'j' }, { at: 2, label: 'k' }],
              states: { 0: 'match', 1: 'match', 2: 'match' },
              note: '−1 + 0 + 1 = 0 ✓ → add (−1, 0, 1)',
            },
            {
              caption: 'i = 1, j = 2, k = 4',
              cells: [-1, 0, 1, 2, -1, -4],
              pointers: [{ at: 1, label: 'i' }, { at: 2, label: 'j' }, { at: 4, label: 'k' }],
              states: { 1: 'match', 2: 'match', 4: 'match' },
              note: 'same sorted tuple → the set drops it',
            },
          ],
        },
      ],
    },
    {
      name: 'Hash set',
      time: 'O(n²)',
      space: 'O(n)',
      points: [
        'Fix i, then find two values summing to −nums[i] with a hash set.',
        'For each j > i: need = −nums[i] − nums[j].',
        'need already seen between i and j ⇒ a triple; then add nums[j] to seen.',
        'Duplicates still show up, so triples go into a set of sorted tuples.',
        'Quadratic, but pays O(n) space for the sets.',
      ],
      code: c['P01-3sum#hash'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'i = 0 (−1), j = 2',
              cells: [-1, 0, 1, 2, -1, -4],
              pointers: [{ at: 0, label: 'i', tone: 'secondary' }, { at: 2, label: 'j' }],
              states: { 0: 'active', 1: 'match', 2: 'match' },
              note: 'seen {0} · need 1 − 1 = 0 ✓ → (−1, 0, 1)',
            },
            {
              caption: 'i = 0, j = 4',
              cells: [-1, 0, 1, 2, -1, -4],
              pointers: [{ at: 0, label: 'i', tone: 'secondary' }, { at: 4, label: 'j' }],
              states: { 0: 'active', 3: 'match', 4: 'match' },
              note: 'seen {0, 1, 2} · need 1 + 1 = 2 ✓ → (−1, −1, 2)',
            },
          ],
        },
      ],
    },
    {
      name: 'Sort + converge',
      time: 'O(n²)',
      space: 'O(1)',
      best: true,
      points: [
        'Sort: equal values become neighbours and the inner search becomes Two Sum II.',
        'Fix i; stop once nums[i] > 0, and skip i when nums[i] == nums[i − 1].',
        'Converge l = i + 1, r = n − 1: sum < 0 → l++, sum > 0 → r−−.',
        'On a hit, record it and move l past equal values.',
        'No dedupe set needed — O(1) extra space besides the output.',
      ],
      code: c['P01-3sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'sorted · i = 0 (−4)',
              cells: [-4, -1, -1, 0, 1, 2],
              pointers: [{ at: 0, label: 'i', tone: 'secondary' }, { at: 1, label: 'l' }, { at: 5, label: 'r' }],
              states: { 0: 'active' },
              note: '−4 − 1 + 2 < 0 → l++ … every sum stays < 0',
            },
            {
              caption: 'i = 1 (−1)',
              cells: [-4, -1, -1, 0, 1, 2],
              pointers: [{ at: 1, label: 'i', tone: 'secondary' }, { at: 2, label: 'l', tone: 'success' }, { at: 5, label: 'r', tone: 'success' }],
              states: { 0: 'dim', 1: 'active', 2: 'match', 5: 'match' },
              note: '−1 − 1 + 2 = 0 ✓, then l=3, r=4 → (−1, 0, 1)',
            },
            {
              caption: 'i = 2 (−1)',
              cells: [-4, -1, -1, 0, 1, 2],
              pointers: [{ at: 2, label: 'i', tone: 'error' }],
              states: { 0: 'dim', 1: 'dim', 2: 'miss' },
              note: 'same value as i = 1 → skip',
            },
          ],
        },
      ],
    },
  ],

  'P01-container-with-most-water': [
    {
      name: 'All pairs',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Try every pair of walls l < r.',
        'Water held = width (r − l) × the shorter wall.',
        'Keep the maximum.',
        'n(n−1)/2 pairs.',
      ],
      code: c['P01-container-with-most-water#pairs'],
      diagrams: [
        {
          kind: 'bars',
          rows: [
            {
              heights: [1, 8, 6, 2, 5, 4, 8, 3, 7],
              box: { from: 1, to: 8, height: 7, label: '7 × 7 = 49' },
              pointers: [{ at: 1, label: 'l' }, { at: 8, label: 'r' }],
              note: 'best of all pairs: (r − l) × min(h[l], h[r]) = 49',
            },
          ],
        },
      ],
    },
    {
      name: 'Converge',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Start with the widest pair: l = 0, r = n − 1.',
        'Record area = (r − l) × min(h[l], h[r]).',
        'Move the shorter wall inward: width only shrinks, so every pair that keeps it is capped by it.',
        'Moving the taller wall can never help, so that branch is skipped.',
        'Stop when l meets r.',
      ],
      code: c['P01-container-with-most-water'],
      diagrams: [
        {
          kind: 'bars',
          rows: [
            {
              heights: [1, 8, 6, 2, 5, 4, 8, 3, 7],
              box: { from: 0, to: 8, height: 1, label: '8 × 1 = 8' },
              pointers: [{ at: 0, label: 'l', tone: 'error' }, { at: 8, label: 'r' }],
              note: 'h[l] = 1 is shorter → l++',
            },
            {
              heights: [1, 8, 6, 2, 5, 4, 8, 3, 7],
              box: { from: 1, to: 8, height: 7, label: '7 × 7 = 49' },
              pointers: [{ at: 1, label: 'l' }, { at: 8, label: 'r', tone: 'error' }],
              dim: [0],
              note: 'best = 49 · h[r] = 7 is shorter → r--',
            },
          ],
        },
      ],
    },
  ],

  'P01-trapping-rain-water': [
    {
      name: 'Scan per column',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Water above column i = min(tallest wall on its left, tallest on its right) − h[i].',
        'For each i, scan left for the max and right for the max.',
        'Add every column’s water.',
        'Correct, but each column rescans the array.',
      ],
      code: c['P01-trapping-rain-water#scan'],
      diagrams: [
        {
          kind: 'bars',
          rows: [
            {
              heights: [4, 2, 0, 3, 2, 5],
              water: [0, 0, 4, 0, 0, 0],
              pointers: [{ at: 2, label: 'i' }],
              levels: [
                { value: 4, from: 0, to: 2, label: 'left 4', tone: 'secondary' },
                { value: 5, from: 2, to: 5, label: 'right 5', tone: 'warning' },
              ],
              note: 'water[2] = min(4, 5) − 0 = 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Prefix / suffix max',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Do the two scans once for all columns.',
        'pre[i] = max(pre[i − 1], h[i]), left to right.',
        'suf[i] = max(suf[i + 1], h[i]), right to left.',
        'water[i] = min(pre[i], suf[i]) − h[i]; sum it.',
        'Three passes, two extra arrays.',
      ],
      code: c['P01-trapping-rain-water#prefix'],
      diagrams: [
        {
          kind: 'bars',
          rows: [{ heights: [4, 2, 0, 3, 2, 5], water: [0, 2, 4, 1, 2, 0], note: 'total = 2 + 4 + 1 + 2 = 9' }],
        },
        {
          kind: 'cells',
          rows: [
            { caption: 'h', cells: [4, 2, 0, 3, 2, 5] },
            { caption: 'pre (max from the left)', cells: [4, 4, 4, 4, 4, 5] },
            { caption: 'suf (max from the right)', cells: [5, 5, 5, 5, 5, 5] },
            {
              caption: 'min(pre, suf) − h',
              cells: [0, 2, 4, 1, 2, 0],
              states: { 1: 'match', 2: 'match', 3: 'match', 4: 'match' },
            },
          ],
        },
      ],
    },
    {
      name: 'Two pointers',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Walk l from the left and r from the right, carrying leftMax and rightMax.',
        'If h[l] < h[r], the right side already has a wall at least as tall as leftMax,',
        'so column l’s water is fixed: leftMax = max(leftMax, h[l]); total += leftMax − h[l]; l++.',
        'Otherwise do the mirror image on r with rightMax.',
        'One pass, two variables — the arrays are never needed.',
      ],
      code: c['P01-trapping-rain-water'],
      diagrams: [
        {
          kind: 'bars',
          rows: [
            {
              caption: 'l = 1, r = 5',
              heights: [4, 2, 0, 3, 2, 5],
              water: [0, 2, 0, 0, 0, 0],
              pointers: [{ at: 1, label: 'l' }, { at: 5, label: 'r' }],
              levels: [{ value: 4, from: 0, to: 1, label: 'leftMax 4', tone: 'secondary' }],
              note: '2 < 5 → water at l = 4 − 2 = 2, l++',
            },
            {
              caption: 'l = 2, r = 5',
              heights: [4, 2, 0, 3, 2, 5],
              water: [0, 2, 4, 0, 0, 0],
              pointers: [{ at: 2, label: 'l' }, { at: 5, label: 'r' }],
              levels: [{ value: 4, from: 0, to: 2, label: 'leftMax 4', tone: 'secondary' }],
              dim: [0, 1],
              note: '0 < 5 → 4 − 0 = 4, l++ … until l meets r → 9',
            },
          ],
        },
      ],
    },
  ],
}

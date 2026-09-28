/** Approach walkthroughs for P12 (Binary Search — on Index). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p12-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p12: Record<string, ApproachWalkthrough[]> = {
  'P12-binary-search': [
    {
      name: 'Inclusive bounds, stop on a hit',
      time: 'O(log n)',
      space: 'O(1)',
      best: true,
      points: [
        'LeetCode requires O(log n), so a linear scan is out.',
        'lo and hi are both inclusive; loop while lo ≤ hi.',
        'Hit ⇒ return mid. nums[mid] < target ⇒ lo = mid + 1; otherwise hi = mid − 1.',
        'Each step drops mid itself, so the range always shrinks and the loop ends.',
        'Empty range (lo > hi) ⇒ −1.',
      ],
      code: c['P12-binary-search'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'target 9 · lo = 0, hi = 5',
              cells: [-1, 0, 3, 5, 9, 12],
              pointers: [
                { at: 0, label: 'lo' },
                { at: 2, label: 'mid', tone: 'secondary' },
                { at: 5, label: 'hi' },
              ],
              states: { 2: 'miss' },
              note: '3 < 9 ⇒ lo = mid + 1 = 3',
            },
            {
              caption: 'lo = 3, hi = 5',
              cells: [-1, 0, 3, 5, 9, 12],
              pointers: [
                { at: 3, label: 'lo' },
                { at: 4, label: 'mid', tone: 'secondary' },
                { at: 5, label: 'hi' },
              ],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 4: 'match' },
              note: 'nums[4] = 9 ⇒ return 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Lower-bound template',
      time: 'O(log n)',
      space: 'O(1)',
      trick: true,
      points: [
        'One template covers most binary searches: find the first index with nums[i] ≥ target.',
        'Half-open [lo, hi): nums[mid] < target ⇒ lo = mid + 1, else hi = mid, which keeps mid as a candidate.',
        'The loop ends with lo = hi = that first index, which is Python’s bisect_left.',
        'Then check nums[lo] == target.',
        'The same function answers first/last position, insert position and search-on-answer, so there are fewer off-by-ones to remember.',
      ],
      code: c['P12-binary-search#lower'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '[0, 6) · target 9',
              cells: [-1, 0, 3, 5, 9, 12],
              pointers: [{ at: 3, label: 'mid', tone: 'secondary' }],
              states: { 3: 'miss' },
              note: '5 < 9 ⇒ lo = 4',
            },
            {
              caption: '[4, 6)',
              cells: [-1, 0, 3, 5, 9, 12],
              pointers: [{ at: 5, label: 'mid', tone: 'secondary' }],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 5: 'active' },
              note: '12 ≥ 9 ⇒ hi = 5 (mid stays a candidate) · then mid 4: 9 ≥ 9 ⇒ hi = 4',
            },
            {
              caption: 'lo = hi = 4',
              cells: [-1, 0, 3, 5, 9, 12],
              pointers: [{ at: 4, label: 'lo,hi' }],
              states: { 4: 'match' },
              note: 'first index ≥ 9 is 4, and nums[4] == 9 ⇒ 4',
            },
          ],
        },
      ],
    },
  ],

  'P12-search-a-2d-matrix': [
    {
      name: 'Find the row, then search it',
      time: 'O(log m + log n)',
      space: 'O(1)',
      points: [
        'LeetCode requires O(log(m·n)). Walking from the top-right corner is O(m + n), so it is out.',
        'Binary search the first column for the last row whose first value ≤ target.',
        'Then an ordinary binary search inside that row.',
        'log m + log n = log(m·n), so it meets the bound, but that is two loops and two sets of boundaries.',
      ],
      code: c['P12-search-a-2d-matrix#two'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'first column · target 16',
              cells: [1, 10, 23],
              pointers: [{ at: 1, label: 'row' }],
              states: { 1: 'match', 2: 'miss' },
              note: '10 ≤ 16 < 23 ⇒ row 1',
            },
            {
              caption: 'row 1',
              cells: [10, 11, 16],
              states: { 2: 'match' },
              note: 'binary search inside the row ⇒ found',
            },
          ],
        },
      ],
    },
    {
      name: 'One search over m·n',
      time: 'O(log(m·n))',
      space: 'O(1)',
      best: true,
      points: [
        'Each row starts above the previous row’s end, so row by row the matrix is one sorted array.',
        'Binary search index 0…m·n − 1 and read matrix[mid // n][mid % n].',
        'One loop, one set of bounds, no second search to get wrong.',
      ],
      code: c['P12-search-a-2d-matrix'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '[[1, 3, 5], [10, 11, 16], [23, 30, 34]] flattened · n = 3',
              cells: [1, 3, 5, 10, 11, 16, 23, 30, 34],
              pointers: [{ at: 4, label: 'mid' }],
              states: { 4: 'miss' },
              note: 'mid 4 ⇒ matrix[1][1] = 11 < 16 ⇒ lo = 5',
            },
            {
              caption: 'after mid 6 (23 > 16 ⇒ hi = 5)',
              cells: [1, 3, 5, 10, 11, 16, 23, 30, 34],
              pointers: [{ at: 5, label: 'mid' }],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'dim', 5: 'match', 6: 'dim', 7: 'dim', 8: 'dim' },
              note: 'mid 5 ⇒ matrix[5 // 3][5 % 3] = matrix[1][2] = 16 ⇒ true',
            },
          ],
        },
      ],
    },
  ],

  'P12-find-peak-element': [
    {
      name: 'Walk uphill by halves',
      time: 'O(log n)',
      space: 'O(1)',
      best: true,
      points: [
        'LeetCode requires O(log n), so scanning for a peak is out.',
        'Neighbours always differ and both ends count as −∞.',
        'nums[mid] < nums[mid + 1] ⇒ the slope rises to the right, so a peak exists there: lo = mid + 1.',
        'Otherwise mid itself may be the peak: hi = mid.',
        'lo = hi is a peak. Any peak is accepted, not necessarily the highest.',
      ],
      code: c['P12-find-peak-element'],
      diagrams: [
        {
          kind: 'bars',
          rows: [
            {
              caption: 'mid 3: 3 < 5 ⇒ uphill right ⇒ lo = 4',
              heights: [1, 2, 1, 3, 5, 6, 4],
              pointers: [{ at: 3, label: 'mid' }],
            },
            {
              caption: 'mid 5: 6 > 4 ⇒ hi = 5 · mid 4: 5 < 6 ⇒ lo = 5',
              heights: [1, 2, 1, 3, 5, 6, 4],
              pointers: [{ at: 5, label: 'peak', tone: 'success' }],
              dim: [0, 1, 2, 3, 6],
              note: 'returns 5 · index 1 is also a peak; either is accepted',
            },
          ],
        },
      ],
    },
  ],

  'P12-find-first-and-last-position-of-element-in-sorted-array': [
    {
      name: 'Keep searching after a hit',
      time: 'O(log n)',
      space: 'O(1)',
      points: [
        'LeetCode requires O(log n). Finding one hit and walking outward is O(n) when the value repeats.',
        'Run the classic search twice. On a hit, record it and keep going left (for first) or right (for last).',
        'Works, but it has three branches and a flag. The two searches differ only in one line, which is easy to get wrong.',
      ],
      code: c['P12-find-first-and-last-position-of-element-in-sorted-array#bias'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'first 8',
              cells: [5, 7, 7, 8, 8, 10],
              pointers: [{ at: 3, label: 'hit' }],
              states: { 3: 'match', 4: 'active' },
              note: 'hit at 4 ⇒ keep going left ⇒ hit at 3 ⇒ first = 3',
            },
            {
              caption: 'last 8',
              cells: [5, 7, 7, 8, 8, 10],
              pointers: [{ at: 4, label: 'hit' }],
              states: { 4: 'match' },
              note: 'same search, going right on a hit ⇒ last = 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Lower bound twice',
      time: 'O(log n)',
      space: 'O(1)',
      best: true,
      points: [
        'lower_bound(x) = the first index with nums[i] ≥ x.',
        'first = lower_bound(target). If it is off the end or nums[first] ≠ target, return [−1, −1].',
        'last = lower_bound(target + 1) − 1: one before the first larger value.',
        'One small function, called twice, with no special cases.',
      ],
      code: c['P12-find-first-and-last-position-of-element-in-sorted-array'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'target 8',
              cells: [5, 7, 7, 8, 8, 10],
              pointers: [
                { at: 3, label: 'lb(8)' },
                { at: 5, label: 'lb(9)', tone: 'secondary' },
              ],
              states: { 3: 'match', 4: 'match' },
              span: { from: 3, to: 4, label: '[3, 5 − 1]' },
              note: 'answer [3, 4]',
            },
          ],
        },
      ],
    },
  ],

  'P12-find-minimum-in-rotated-sorted-array': [
    {
      name: 'Compare mid with the right end',
      time: 'O(log n)',
      space: 'O(1)',
      best: true,
      points: [
        'LeetCode requires O(log n), so min() over the array is out.',
        'nums[mid] > nums[hi] ⇒ the drop (the minimum) is strictly right of mid: lo = mid + 1.',
        'Otherwise mid..hi is sorted, so the minimum is at mid or left of it: hi = mid.',
        'lo = hi is the minimum.',
        'Trap: compare with nums[hi], not nums[lo]. With lo the unrotated case goes wrong.',
      ],
      code: c['P12-find-minimum-in-rotated-sorted-array'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'lo = 0, hi = 6',
              cells: [4, 5, 6, 7, 0, 1, 2],
              pointers: [
                { at: 0, label: 'lo' },
                { at: 3, label: 'mid', tone: 'secondary' },
                { at: 6, label: 'hi' },
              ],
              states: { 3: 'miss' },
              note: '7 > 2 ⇒ the drop is right of mid ⇒ lo = 4',
            },
            {
              caption: 'lo = 4, hi = 5',
              cells: [4, 5, 6, 7, 0, 1, 2],
              pointers: [
                { at: 4, label: 'lo,mid' },
                { at: 5, label: 'hi' },
              ],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'match', 6: 'dim' },
              note: '0 ≤ 1 ⇒ hi = 4 ⇒ lo = hi ⇒ minimum 0',
            },
          ],
        },
      ],
    },
  ],

  'P12-search-in-rotated-sorted-array': [
    {
      name: 'Find the pivot, then search',
      time: 'O(log n)',
      space: 'O(1)',
      points: [
        'First find the minimum’s index (the rotation point), as in Find Minimum.',
        'That splits the array into two sorted segments.',
        'Pick the segment whose range holds the target, then run a plain binary search in it.',
        'Meets O(log n), but it takes two passes and two sets of bounds.',
      ],
      code: c['P12-search-in-rotated-sorted-array#pivot'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'target 0',
              cells: [4, 5, 6, 7, 0, 1, 2],
              pointers: [{ at: 4, label: 'pivot' }],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'match' },
              span: { from: 4, to: 6, label: '0 ≤ 0 ≤ 2 ⇒ search here' },
            },
          ],
        },
      ],
    },
    {
      name: 'One pass: pick the sorted half',
      time: 'O(log n)',
      space: 'O(1)',
      best: true,
      points: [
        'Around any mid, at least one half is sorted.',
        'nums[lo] ≤ nums[mid] ⇒ the left half is sorted. If lo ≤ target < mid’s value, go left; else go right.',
        'Otherwise the right half is sorted: the mirror test.',
        'You only ever test the target against a sorted range, so the pivot never has to be found.',
      ],
      code: c['P12-search-in-rotated-sorted-array'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'target 0 · lo = 0, hi = 6',
              cells: [4, 5, 6, 7, 0, 1, 2],
              pointers: [
                { at: 0, label: 'lo' },
                { at: 3, label: 'mid', tone: 'secondary' },
                { at: 6, label: 'hi' },
              ],
              span: { from: 0, to: 3, label: 'sorted 4…7' },
              note: '0 is not in [4, 7) ⇒ lo = 4',
            },
            {
              caption: 'lo = 4, hi = 6',
              cells: [4, 5, 6, 7, 0, 1, 2],
              pointers: [
                { at: 4, label: 'lo' },
                { at: 5, label: 'mid', tone: 'secondary' },
                { at: 6, label: 'hi' },
              ],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'match' },
              span: { from: 4, to: 5, label: 'sorted 0…1' },
              note: '0 is in [0, 1) ⇒ hi = 4 ⇒ found at 4',
            },
          ],
        },
      ],
    },
  ],

  'P12-median-of-two-sorted-arrays': [
    {
      name: 'Drop k/2 per step',
      time: 'O(log(m + n))',
      space: 'O(log(m + n))',
      points: [
        'LeetCode requires O(log(m + n)), so merging to the middle (O(m + n)) is out.',
        'The median is the k-th smallest element for k ≈ (m + n) / 2.',
        'Compare the (k/2)-th candidate of each array. The smaller side’s first k/2 are all below the k-th, so drop them and reduce k.',
        'Stop when one array is empty or k = 1.',
        'Correct and logarithmic, but it recurses and needs care when an array runs short.',
      ],
      code: c['P12-median-of-two-sorted-arrays#kth'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'a', cells: [1, 3, 8], states: { 0: 'dim', 1: 'dim' } },
            {
              caption: 'b',
              cells: [2, 7, 10, 12],
              states: { 0: 'dim', 1: 'match' },
              note: 'k = 4: a[1] = 3 ≤ b[1] = 7 ⇒ drop 1, 3 · k = 2: b[0] = 2 < 8 ⇒ drop 2 · k = 1: min(8, 7) = 7',
            },
          ],
        },
      ],
    },
    {
      name: 'Binary search the cut',
      time: 'O(log min(m, n))',
      space: 'O(1)',
      best: true,
      points: [
        'Cut a at i and b at j = half − i, so the left side holds half the elements.',
        'The cut is right when a_left ≤ b_right and b_left ≤ a_right.',
        'a_left > b_right ⇒ i is too far right; otherwise too far left. Binary search i.',
        'Median = max of the lefts (odd), or its average with the min of the rights (even).',
        'Trap: search the shorter array so j stays in range, and use ±∞ past the ends.',
      ],
      code: c['P12-median-of-two-sorted-arrays'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'a · cut at i = 2',
              cells: [1, 3, 8],
              pointers: [{ at: 2, label: 'i' }],
              states: { 0: 'match', 1: 'match' },
            },
            {
              caption: 'b · cut at j = 4 − 2 = 2',
              cells: [2, 7, 10, 12],
              pointers: [{ at: 2, label: 'j', tone: 'secondary' }],
              states: { 0: 'match', 1: 'match' },
              note: '3 ≤ 10 and 7 ≤ 8 ⇒ valid · 7 elements ⇒ median = max(3, 7) = 7',
            },
          ],
        },
      ],
    },
  ],
}

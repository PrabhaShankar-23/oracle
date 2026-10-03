/** Approach walkthroughs for P38 (DP — LIS Family). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p38-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p38: Record<string, ApproachWalkthrough[]> = {
  'P38-longest-increasing-subsequence': [
    {
      name: 'dp[i]: longest run ending at i',
      time: 'O(n²)',
      space: 'O(n)',
      state: '`dp[i]` = length of the longest increasing subsequence ending exactly at `nums[i]`.',
      invariant: 'When `dp[i]` is computed, every `dp[j]` with `j < i` is final; the answer is `max(dp)`, not `dp[n−1]`.',
      points: [
        'dp[i] = the longest increasing subsequence that ends at nums[i].',
        'dp[i] = 1 + max(dp[j]) over earlier j with nums[j] < nums[i].',
        'Answer = max(dp). Easy to derive, but every i looks at every j before it.',
      ],
      code: c['P38-longest-increasing-subsequence#n2'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [10, 9, 2, 5, 3, 7, 101, 18] },
            {
              caption: 'dp',
              cells: [1, 1, 1, 2, 2, 3, 4, 4],
              states: { 2: 'active', 4: 'active', 5: 'active', 7: 'match' },
              note: '2 → 3 → 7 → 18 ⇒ 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Patience sorting with binary search',
      time: 'O(n log n)',
      space: 'O(n)',
      best: true,
      points: [
        'tails[k] = the smallest tail of any increasing run of length k + 1 seen so far.',
        'tails stays sorted, so binary search (bisect_left) finds where x goes.',
        'Past the end ⇒ append (a longer run); otherwise overwrite (a smaller tail for that length).',
        'len(tails) is the answer. tails itself is not a valid subsequence.',
        'Trap: bisect_left for strictly increasing; bisect_right for non-decreasing.',
      ],
      code: c['P38-longest-increasing-subsequence'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'tails after 10, 9, 2, 5', cells: [2, 5] },
            { caption: 'read 3: replaces 5', cells: [2, 3], states: { 1: 'active' } },
            { caption: 'read 7, 101', cells: [2, 3, 7, 101] },
            {
              caption: 'read 18: replaces 101',
              cells: [2, 3, 7, 18],
              states: { 3: 'active' },
              note: 'length 4 ⇒ answer 4',
            },
          ],
        },
      ],
    },
  ],
}

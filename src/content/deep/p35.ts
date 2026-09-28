/** Approach walkthroughs for P35 (DP — 0/1 Knapsack). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p35-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p35: Record<string, ApproachWalkthrough[]> = {
  'P35-partition-equal-subset-sum': [
    {
      name: '2D table dp[i][s]',
      time: 'O(n·S)',
      space: 'O(n·S)',
      points: [
        'An odd total can never split evenly ⇒ false. Otherwise target S = total / 2.',
        'dp[i][s] = some subset of the first i numbers sums to s.',
        'Skip nums[i − 1] ⇒ dp[i − 1][s]; take it ⇒ dp[i − 1][s − x].',
        'Each row reads only the row above, so the table can be rolled into one array.',
      ],
      code: c['P35-partition-equal-subset-sum#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'sum s', cells: [0, 1, 5, 6, 10, 11] },
            { caption: 'after 1', cells: ['T', 'T', 'F', 'F', 'F', 'F'] },
            { caption: 'after 1, 5', cells: ['T', 'T', 'T', 'T', 'F', 'F'] },
            {
              caption: 'after 1, 5, 11, 5',
              cells: ['T', 'T', 'T', 'T', 'T', 'T'],
              states: { 5: 'match' },
              note: '[1, 5, 11, 5]: S = 11 is reachable ⇒ true',
            },
          ],
        },
      ],
    },
    {
      name: 'One row, loop downward',
      time: 'O(n·S)',
      space: 'O(S)',
      best: true,
      points: [
        'Keep one array dp[s] and update it in place for each number x.',
        'Loop s from S down to x: dp[s] = dp[s] or dp[s − x].',
        'Going down means dp[s − x] is still last round’s value, so each x is used at most once.',
        'Trap: loop upward and x can be reused, which silently solves the unbounded problem instead.',
      ],
      code: c['P35-partition-equal-subset-sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'reachable sums after 1, 5', cells: [0, 1, 5, 6], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' } },
            {
              caption: 'add 11, updating s = 11 down to 11',
              cells: [0, 1, 5, 6, 11],
              states: { 4: 'active' },
              note: 'dp[11] = dp[11 − 11] = true ⇒ S reached',
            },
          ],
        },
      ],
    },
    {
      name: 'Bitset shift',
      time: 'O(n·S / w)',
      space: 'O(S) bits',
      trick: true,
      points: [
        'Store reachable sums as bits of one integer: bit s set ⇔ sum s is reachable.',
        'Adding x is one line: bits |= bits << x.',
        'The shift does a whole row of the knapsack in one word-parallel operation.',
        'Python ints are unbounded; in C++ use bitset<S + 1>.',
      ],
      code: c['P35-partition-equal-subset-sum#bitset'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'bit', cells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
            { caption: 'after 1, 5, 11', cells: [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1] },
            {
              caption: 'bits |= bits << 5',
              cells: [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
              states: { 10: 'active', 11: 'match' },
              note: 'one shift adds 5, 6, 10, 11 · bit 11 set ⇒ true',
            },
          ],
        },
      ],
    },
  ],

  'P35-target-sum': [
    {
      name: 'Memoised (index, running sum)',
      time: 'O(n·total)',
      space: 'O(n·total)',
      points: [
        'At each number, choose + or −.',
        'ways(i, total) = ways(i + 1, total + x) + ways(i + 1, total − x).',
        'Memoising on (i, total) collapses 2ⁿ paths to n × (2·total + 1) states.',
      ],
      code: c['P35-target-sum#memo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nums [1, 1, 1, 1, 1], target 3',
              cells: ['+', '+', '+', '+', '−'],
              states: { 4: 'miss' },
              note: 'choose which one is negative ⇒ 5 ways',
            },
          ],
        },
      ],
    },
    {
      name: 'Reduce to counting subsets',
      time: 'O(n·P)',
      space: 'O(P)',
      best: true,
      points: [
        'Let P = the sum of the + numbers and N = the sum of the − numbers.',
        'P + N = total and P − N = target ⇒ P = (total + target) / 2.',
        'If that is not a whole number, or |target| > total, the answer is 0.',
        'Now count subsets summing to P: a 0/1 knapsack that counts, looping downward.',
      ],
      code: c['P35-target-sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'sum s (P = (5 + 3) / 2 = 4)', cells: [0, 1, 2, 3, 4] },
            {
              caption: 'subsets of five 1s summing to s',
              cells: [1, 5, 10, 10, 5],
              states: { 4: 'match' },
              note: 'dp[4] = 5 ⇒ 5 ways',
            },
          ],
        },
      ],
    },
  ],
}

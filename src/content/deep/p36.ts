/** Approach walkthroughs for P36 (DP — Unbounded Knapsack). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p36-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p36: Record<string, ApproachWalkthrough[]> = {
  'P36-coin-change': [
    {
      name: 'BFS over amounts',
      time: 'O(A·n)',
      space: 'O(A)',
      points: [
        'Each amount is a node; adding a coin is an edge.',
        'BFS from 0: the level where you first reach the amount is the fewest coins.',
        'Mark amounts as seen so each is queued once.',
        'Same bound as the DP, with a queue and a set to manage.',
      ],
      code: c['P36-coin-change#bfs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'coins [1, 2, 5], amount 11 · level 1', cells: [1, 2, 5] },
            { caption: 'level 2', cells: [3, 4, 6, 7, 10], states: { 2: 'active' } },
            { caption: 'level 3', cells: [8, 9, 11], states: { 2: 'match' }, note: '11 first appears at level 3 (6 + 5) ⇒ 3 coins' },
          ],
        },
      ],
    },
    {
      name: 'DP, amount loop ascending',
      time: 'O(A·n)',
      space: 'O(A)',
      best: true,
      points: [
        'dp[a] = the fewest coins that make a; dp[0] = 0, everything else starts as “infinity” (amount + 1).',
        'For each coin c, for a from c up: dp[a] = min(dp[a], dp[a − c] + 1).',
        'Ascending lets dp[a − c] already include c, so a coin can repeat. That is the unbounded part.',
        'dp[amount] still at infinity ⇒ −1.',
      ],
      code: c['P36-coin-change'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'amount', cells: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
            {
              caption: 'dp',
              cells: [0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2, 3],
              states: { 10: 'active', 11: 'match' },
              note: 'dp[11] = dp[10] + 1 = 3 (5 + 5 + 1)',
            },
          ],
        },
      ],
    },
  ],

  'P36-coin-change-ii': [
    {
      name: '2D table: first i coins',
      time: 'O(A·n)',
      space: 'O(A·n)',
      points: [
        'dp[i][a] = ways to make a using only the first i coin types.',
        'Skip coin i ⇒ dp[i − 1][a]; use it again ⇒ dp[i][a − c], the same row.',
        'Coins are added one type at a time, so each combination is counted once, in one order.',
      ],
      code: c['P36-coin-change-ii#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'amount', cells: [0, 1, 2, 3, 4, 5] },
            { caption: 'coins {1}', cells: [1, 1, 1, 1, 1, 1] },
            { caption: 'coins {1, 2}', cells: [1, 1, 2, 2, 3, 3] },
            { caption: 'coins {1, 2, 5}', cells: [1, 1, 2, 2, 3, 4], states: { 5: 'match' }, note: 'amount 5 ⇒ 4 combinations' },
          ],
        },
      ],
    },
    {
      name: 'One row, coins outside',
      time: 'O(A·n)',
      space: 'O(A)',
      best: true,
      points: [
        'Roll the table into one array: for each coin, for a from c up, dp[a] += dp[a − c].',
        'Coins in the outer loop ⇒ each combination is built in one fixed coin order ⇒ counted once.',
        'Trap: swap the loops and you count ordered sequences (1+2 and 2+1 twice), a different problem.',
      ],
      code: c['P36-coin-change-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'after coin 2', cells: [1, 1, 2, 2, 3, 3] },
            {
              caption: 'adding coin 5',
              cells: [1, 1, 2, 2, 3, 4],
              states: { 0: 'active', 5: 'match' },
              note: 'dp[5] += dp[0] ⇒ 3 + 1 = 4',
            },
          ],
        },
      ],
    },
  ],
}

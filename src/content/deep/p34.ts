/** Approach walkthroughs for P34 (DP — Linear / Fibonacci-style). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p34-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p34: Record<string, ApproachWalkthrough[]> = {
  'P34-climbing-stairs': [
    {
      name: 'Plain recursion',
      time: 'O(2ⁿ)',
      space: 'O(n) stack',
      points: [
        'The last move was a 1-step or a 2-step, so ways(n) = ways(n − 1) + ways(n − 2).',
        'Base: ways(0) = ways(1) = 1.',
        'Correct, but ways(n − 2) is recomputed inside ways(n − 1): the call tree doubles each level.',
      ],
      code: c['P34-climbing-stairs#recursion'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'calls made for n = 5, by argument',
              cells: ['w5', 'w4', 'w3', 'w3', 'w2', 'w2', 'w2', '…'],
              states: { 2: 'miss', 3: 'miss', 4: 'miss', 5: 'miss', 6: 'miss' },
              note: 'w3 twice, w2 three times: the same answers again and again',
            },
          ],
        },
      ],
    },
    {
      name: 'Table of size n + 1',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Store each answer once: dp[i] = dp[i − 1] + dp[i − 2].',
        'Fill left to right from dp[0] = dp[1] = 1.',
        'Linear, but keeps every value when only the last two are ever read.',
      ],
      code: c['P34-climbing-stairs#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'dp[0…5]',
              cells: [1, 1, 2, 3, 5, 8],
              pointers: [{ at: 5, label: 'i' }],
              states: { 3: 'active', 4: 'active', 5: 'match' },
              note: 'dp[5] = dp[4] + dp[3] = 5 + 3 = 8',
            },
          ],
        },
      ],
    },
    {
      name: 'Two rolling variables',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'The recurrence only reaches back two steps, so keep just two numbers.',
        'a, b = ways to reach step i − 1 and step i.',
        'Each step: a, b = b, a + b.',
        'It is Fibonacci shifted by one.',
      ],
      code: c['P34-climbing-stairs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'the window slides along 1, 1, 2, 3, 5, 8',
              cells: [1, 1, 2, 3, 5, 8],
              pointers: [
                { at: 3, label: 'a' },
                { at: 4, label: 'b', tone: 'secondary' },
              ],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'active', 4: 'active' },
              note: 'next: a, b = 5, 3 + 5 = 8 ⇒ n = 5 gives 8',
            },
          ],
        },
      ],
    },
  ],

  'P34-min-cost-climbing-stairs': [
    {
      name: 'Table over steps',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'dp[i] = the cheapest way to stand on step i. Starting at 0 or 1 is free: dp[0] = dp[1] = 0.',
        'You reach i from i − 1 (paying cost[i − 1]) or from i − 2 (paying cost[i − 2]).',
        'The top is step n, one past the last index.',
      ],
      code: c['P34-min-cost-climbing-stairs#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'cost', cells: [10, 15, 20] },
            {
              caption: 'dp[0…3]',
              cells: [0, 0, 10, 15],
              states: { 3: 'match' },
              note: 'dp[3] = min(10 + 20, 0 + 15) = 15 ⇒ start at 1, jump 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Two rolling costs',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Same recurrence; keep only the costs of the last two steps.',
        'a, b = b, min(b + cost[i − 1], a + cost[i − 2]).',
        'Trap: the answer is for standing past the last step, not on it.',
      ],
      code: c['P34-min-cost-climbing-stairs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'cost [10, 15, 20]',
              cells: [0, 0, 10, 15],
              pointers: [
                { at: 2, label: 'a' },
                { at: 3, label: 'b', tone: 'secondary' },
              ],
              states: { 0: 'dim', 1: 'dim', 3: 'match' },
              note: 'b = 15 is the answer',
            },
          ],
        },
      ],
    },
  ],

  'P34-house-robber': [
    {
      name: 'Table: rob or skip',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'dp[i] = the best loot from the first i houses.',
        'Skip house i − 1 ⇒ dp[i − 1]. Rob it ⇒ dp[i − 2] + nums[i − 1], since its neighbour must be skipped.',
        'dp[i] = max of the two.',
      ],
      code: c['P34-house-robber#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [2, 7, 9, 3, 1] },
            {
              caption: 'dp[1…5]',
              cells: [2, 7, 11, 11, 12],
              states: { 2: 'active', 4: 'match' },
              note: 'dp[3] = max(7, 2 + 9) = 11 · answer 2 + 9 + 1 = 12',
            },
          ],
        },
      ],
    },
    {
      name: 'Two rolling states',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'rob_i = the best that robs the last house seen; skip_i = the best that does not.',
        'For each x: rob_i = skip_i + x, and skip_i = max(old rob_i, old skip_i). Update both at once.',
        'Answer = max(rob_i, skip_i).',
      ],
      code: c['P34-house-robber'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [2, 7, 9, 3, 1] },
            { caption: 'rob_i', cells: [2, 7, 11, 10, 12], states: { 4: 'match' } },
            { caption: 'skip_i', cells: [0, 2, 7, 11, 11], note: 'max(12, 11) = 12' },
          ],
        },
      ],
    },
  ],

  'P34-house-robber-ii': [
    {
      name: 'Two straight lines',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'On a circle, the first and last houses are neighbours, so you never rob both.',
        'So solve House Robber twice: without the last house, and without the first.',
        'The answer is the better of the two.',
        'Trap: a single house must be handled separately, because both slices would be empty.',
      ],
      code: c['P34-house-robber-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nums[0 … n − 2]',
              cells: [1, 2, 3, 1],
              states: { 0: 'match', 2: 'match', 3: 'dim' },
              note: '1 + 3 = 4',
            },
            {
              caption: 'nums[1 … n − 1]',
              cells: [1, 2, 3, 1],
              states: { 0: 'dim', 1: 'active', 3: 'active' },
              note: '2 + 1 = 3 ⇒ answer max(4, 3) = 4',
            },
          ],
        },
      ],
    },
  ],

  'P34-decode-ways': [
    {
      name: 'Memoised recursion',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'ways(i) = the decodings of s[i:].',
        'A 0 cannot start a letter ⇒ 0. Otherwise take one digit, and also two when they form 10…26.',
        'The memo makes each i solved once; the recursion shows where the rolling version comes from.',
      ],
      code: c['P34-decode-ways#memo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 's = "226"',
              cells: ['2', '2', '6'],
              span: { from: 1, to: 2, label: '"26" is a letter' },
              note: '2|2|6, 22|6, 2|26 ⇒ 3',
            },
          ],
        },
      ],
    },
    {
      name: 'Two rolling counts',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'dp[i] = the decodings of the first i digits.',
        'Last digit alone (not 0) adds dp[i − 1]; last two digits as 10…26 add dp[i − 2].',
        'Only two previous counts are read, so keep two variables.',
        'Trap: a 0 is only valid as the second digit of 10 or 20; anything else zeroes that branch.',
      ],
      code: c['P34-decode-ways'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 's = "11106"', cells: ['·', '1', '1', '1', '0', '6'] },
            {
              caption: 'dp[0…5]',
              cells: [1, 1, 2, 3, 2, 2],
              states: { 4: 'active', 5: 'match' },
              note: 'at the 0: only "10" works ⇒ dp[4] = dp[2] = 2 · answer 2',
            },
          ],
        },
      ],
    },
  ],

  'P34-word-break': [
    {
      name: 'Memoised recursion over starts',
      time: 'O(n²·L)',
      space: 'O(n)',
      points: [
        'can(i) = whether s[i:] splits into dictionary words.',
        'Try every end j: s[i:j] in the set and can(j).',
        'Memo each i, or the same suffix is retried many times.',
        'Works, but recursion depth can reach n.',
      ],
      code: c['P34-word-break#memo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '"leetcode", words {leet, code}',
              cells: ['l', 'e', 'e', 't', 'c', 'o', 'd', 'e'],
              span: { from: 0, to: 3, label: 'leet ⇒ can(4)?' },
              note: 'can(4): "code" is a word ⇒ can(8) = true',
            },
          ],
        },
      ],
    },
    {
      name: 'Bottom-up over prefixes',
      time: 'O(n²·L)',
      space: 'O(n)',
      best: true,
      points: [
        'dp[i] = the first i characters can be segmented; dp[0] = true.',
        'dp[i] is true if some j < i has dp[j] true and s[j:i] in the set.',
        'Only look back as far as the longest word.',
        'No recursion; the answer is dp[n].',
      ],
      code: c['P34-word-break'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'position', cells: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
            {
              caption: 'dp',
              cells: ['T', 'F', 'F', 'F', 'T', 'F', 'F', 'F', 'T'],
              states: { 4: 'active', 8: 'match' },
              note: 'dp[4]: dp[0] and "leet" · dp[8]: dp[4] and "code"',
            },
          ],
        },
      ],
    },
  ],

  'P34-best-time-to-buy-and-sell-stock-with-cooldown': [
    {
      name: 'Memoised (day, holding)',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'best(i, holding) = the most profit from day i on.',
        'Holding: wait, or sell and skip a day (the cooldown) ⇒ best(i + 2, False).',
        'Not holding: wait, or buy ⇒ best(i + 1, True).',
        'Clear, but it recurses n deep. Python needs a higher recursion limit for large n.',
      ],
      code: c['P34-best-time-to-buy-and-sell-stock-with-cooldown#memo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'prices',
              cells: [1, 2, 3, 0, 2],
              states: { 0: 'active', 1: 'match', 3: 'active', 4: 'match' },
              span: { from: 2, to: 2, label: 'cooldown' },
              note: 'buy 1, sell 2, rest, buy 0, sell 2 ⇒ 3',
            },
          ],
        },
      ],
    },
    {
      name: 'Three-state machine',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'hold = best while owning a share; sold = just sold today; rest = free to buy.',
        'hold = max(hold, rest − p): buy only from rest.',
        'sold = hold + p; rest = max(rest, sold).',
        'The cooldown is simply the missing edge from sold straight to hold.',
        'Answer = max(sold, rest).',
      ],
      code: c['P34-best-time-to-buy-and-sell-stock-with-cooldown'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'prices', cells: [1, 2, 3, 0, 2] },
            { caption: 'hold', cells: [-1, -1, -1, 1, 1] },
            { caption: 'sold', cells: ['−∞', 1, 2, -1, 3], states: { 4: 'match' } },
            { caption: 'rest', cells: [0, 0, 1, 2, 2], note: 'max(3, 2) = 3' },
          ],
        },
      ],
    },
  ],
}

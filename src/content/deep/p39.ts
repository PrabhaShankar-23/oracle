/** Approach walkthroughs for P39 (DP — Grid Paths). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p39-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p39: Record<string, ApproachWalkthrough[]> = {
  'P39-unique-paths': [
    {
      name: 'Full 2D grid',
      time: 'O(mn)',
      space: 'O(mn)',
      points: [
        'You arrive at a cell from above or from the left.',
        'dp[i][j] = dp[i − 1][j] + dp[i][j − 1]; the first row and column are all 1.',
        'Keeps m rows when each cell only reads the row above.',
      ],
      code: c['P39-unique-paths#grid'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'row 0', cells: [1, 1, 1, 1, 1, 1, 1] },
            { caption: 'row 1', cells: [1, 2, 3, 4, 5, 6, 7] },
            {
              caption: 'row 2',
              cells: [1, 3, 6, 10, 15, 21, 28],
              states: { 6: 'match' },
              note: 'm = 3, n = 7 ⇒ 28',
            },
          ],
        },
      ],
    },
    {
      name: 'One rolling row',
      time: 'O(mn)',
      space: 'O(n)',
      best: true,
      points: [
        'Keep one row. row[j] += row[j − 1].',
        'Before the update row[j] is the value from above; row[j − 1] is already this row’s left.',
        'Repeat m − 1 times; the answer is row[−1].',
      ],
      code: c['P39-unique-paths'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'row before (row 1)', cells: [1, 2, 3, 4, 5, 6, 7] },
            {
              caption: 'after the pass (row 2)',
              cells: [1, 3, 6, 10, 15, 21, 28],
              states: { 2: 'active', 6: 'match' },
              note: 'row[2] = 3 (above) + 3 (left) = 6',
            },
          ],
        },
      ],
    },
    {
      name: 'Choose the down moves',
      time: 'O(min(m, n))',
      space: 'O(1)',
      trick: true,
      points: [
        'Every path is exactly m − 1 downs and n − 1 rights, in some order.',
        'So the count is C(m + n − 2, m − 1): choose where the downs go.',
        'One line with math.comb. In Java, build it with a multiplicative loop in long.',
      ],
      code: c['P39-unique-paths#comb'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'm = 3, n = 7: 8 moves, pick the 2 downs',
              cells: ['D', 'R', 'R', 'D', 'R', 'R', 'R', 'R'],
              states: { 0: 'active', 3: 'active' },
              note: 'C(8, 2) = 28',
            },
          ],
        },
      ],
    },
  ],

  'P39-unique-paths-ii': [
    {
      name: 'Full 2D grid',
      time: 'O(mn)',
      space: 'O(mn)',
      points: [
        'Same as Unique Paths, but an obstacle cell holds 0 paths.',
        'dp[0][0] = 1 unless it is an obstacle; every other cell adds its top and left.',
        'An obstacle in the first row or column blocks everything after it along that edge.',
      ],
      code: c['P39-unique-paths-ii#grid'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'row 0', cells: [1, 1, 1] },
            { caption: 'row 1', cells: [1, 0, 1], states: { 1: 'miss' } },
            { caption: 'row 2', cells: [1, 1, 2], states: { 2: 'match' }, note: 'obstacle in the middle ⇒ 2 paths' },
          ],
        },
      ],
    },
    {
      name: 'Rolling row, zero the obstacles',
      time: 'O(mn)',
      space: 'O(n)',
      best: true,
      points: [
        'One row, seeded [1, 0, 0, …].',
        'Obstacle ⇒ row[j] = 0; otherwise row[j] += row[j − 1] (for j > 0).',
        'Zeroing kills every path through that cell, including along the first column.',
        'Trap: the start or the goal itself can be an obstacle ⇒ 0.',
      ],
      code: c['P39-unique-paths-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'after row 1', cells: [1, 0, 1], states: { 1: 'miss' } },
            { caption: 'after row 2', cells: [1, 1, 2], states: { 2: 'match' }, note: 'row[2] = 1 (above) + 1 (left) = 2' },
          ],
        },
      ],
    },
  ],

  'P39-minimum-path-sum': [
    {
      name: 'Full 2D table',
      time: 'O(mn)',
      space: 'O(mn)',
      points: [
        'dp[i][j] = the cheapest path cost to (i, j).',
        'First row and column have one way in; others take grid[i][j] + min(above, left).',
        'You can also write into grid itself if changing the input is allowed.',
      ],
      code: c['P39-minimum-path-sum#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'row 0 · grid [1, 3, 1]', cells: [1, 4, 5] },
            { caption: 'row 1 · grid [1, 5, 1]', cells: [2, 7, 6] },
            { caption: 'row 2 · grid [4, 2, 1]', cells: [6, 8, 7], states: { 2: 'match' }, note: '1 → 3 → 1 → 1 → 1 ⇒ 7' },
          ],
        },
      ],
    },
    {
      name: 'One rolling row',
      time: 'O(mn)',
      space: 'O(n)',
      best: true,
      points: [
        'Seed row = [0, ∞, ∞, …] so the first row can only come from the left.',
        'row[0] += grid[i][0]; then row[j] = grid[i][j] + min(row[j], row[j − 1]).',
        'row[j] before the update is “above”, row[j − 1] is “left”.',
      ],
      code: c['P39-minimum-path-sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'row after 1 → [1, 5, 1]', cells: [2, 7, 6] },
            {
              caption: 'row after 2 → [4, 2, 1]',
              cells: [6, 8, 7],
              states: { 2: 'match' },
              note: 'row[2] = 1 + min(6, 8) = 7',
            },
          ],
        },
      ],
    },
  ],

  'P39-maximal-square': [
    {
      name: '2D table of square sides',
      time: 'O(mn)',
      space: 'O(mn)',
      points: [
        'dp[i][j] = the side of the largest all-1 square whose bottom-right corner is (i, j).',
        'dp = 1 + min(up, left, up-left): the square is only as big as its weakest neighbour allows.',
        'Answer = (max side)², the area.',
      ],
      code: c['P39-maximal-square#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: '10100', cells: [1, 0, 1, 0, 0] },
            { caption: '10111', cells: [1, 0, 1, 1, 1], states: { 3: 'active', 4: 'active' } },
            { caption: '11111', cells: [1, 1, 1, 2, 2], states: { 3: 'match', 4: 'match' } },
            { caption: '10010', cells: [1, 0, 0, 1, 0], note: 'max side 2 ⇒ area 4' },
          ],
        },
      ],
    },
    {
      name: 'One row plus a diagonal carry',
      time: 'O(mn)',
      space: 'O(n)',
      best: true,
      points: [
        'Keep one row dp; dp[j] before the update is “up”, dp[j − 1] is “left”.',
        'The up-left value was overwritten one step earlier, so carry it in diag.',
        'Save up before writing, then diag = up for the next cell.',
        'A 0 cell resets dp[j] to 0.',
      ],
      code: c['P39-maximal-square'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'dp (row 1)', cells: [1, 0, 1, 1, 1] },
            {
              caption: 'dp (row 2) · at j = 3',
              cells: [1, 1, 1, 2, 2],
              pointers: [{ at: 3, label: 'j' }],
              states: { 3: 'match' },
              note: 'up 1, left 1, diag 1 ⇒ 1 + 1 = 2',
            },
          ],
        },
      ],
    },
  ],

  'P39-longest-increasing-path-in-a-matrix': [
    {
      name: 'Peel layers by out-degree',
      time: 'O(mn)',
      space: 'O(mn)',
      points: [
        'Draw an edge to every larger neighbour; strict increase means no cycles, a DAG.',
        'Cells with no larger neighbour are path ends. Remove them as layer 1.',
        'Removing a layer frees its smaller neighbours; count layers until none are left.',
        'The number of layers is the longest path (Kahn’s topological sort).',
      ],
      code: c['P39-longest-increasing-path-in-a-matrix#topo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: '[9, 9, 4]', cells: [9, 9, 4], states: { 0: 'dim', 1: 'dim' } },
            { caption: '[6, 6, 8]', cells: [6, 6, 8], states: { 2: 'dim' } },
            {
              caption: '[2, 1, 1]',
              cells: [2, 1, 1],
              states: { 1: 'match' },
              note: 'layer 1: 9, 9, 8 · … · layer 4: the 1 ⇒ 4',
            },
          ],
        },
      ],
    },
    {
      name: 'DFS with a memo',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'dfs(r, c) = the longest increasing path starting at (r, c).',
        '1 + the best dfs over larger neighbours; cache it.',
        'Strict increase rules out cycles, so no visited set is needed and each memo entry is final.',
        'Answer = the max over all cells.',
      ],
      code: c['P39-longest-increasing-path-in-a-matrix'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'memo row 0', cells: [1, 1, 2] },
            { caption: 'memo row 1', cells: [2, 2, 1] },
            {
              caption: 'memo row 2',
              cells: [3, 4, 2],
              states: { 1: 'match' },
              note: 'from the 1 in the middle: 1 → 2 → 6 → 9 ⇒ 4',
            },
          ],
        },
      ],
    },
  ],
}

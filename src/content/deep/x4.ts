/** Approach walkthroughs for X4 (Matrix & Math Manipulation). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './x4-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const x4: Record<string, ApproachWalkthrough[]> = {
  'X4-rotate-image': [
    {
      name: 'Cycle four cells at a time',
      time: 'O(n²)',
      space: 'O(1)',
      state: 'Layer `i`; offset `j` inside the layer; one saved value `top`.',
      invariant: 'After the four-way swap at `(i, j)`, those four cells sit in their rotated positions; the layers already done are final.',
      points: [
        'Rotate layer by layer, outside in.',
        'Each cell of a layer moves in a four-way cycle: left → top → right → bottom → left.',
        'In place, but the index arithmetic (n − 1 − j …) is easy to get wrong.',
      ],
      code: c['X4-rotate-image#cycle'],
      diagrams: [
        {
          kind: 'grid',
          rows: [{ caption: 'one 4-cycle of the outer layer', cells: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], states: { '0,0': 'active', '0,2': 'active', '2,2': 'active', '2,0': 'active' }, note: '7 → top-left, 1 → top-right, 3 → bottom-right, 9 → bottom-left' }],
        },
      ],
    },
    {
      name: 'Transpose, then reverse each row',
      time: 'O(n²)',
      space: 'O(1)',
      best: true,
      points: [
        'Transpose (swap across the main diagonal), then mirror each row.',
        'The two reflections compose into a 90° clockwise turn.',
        'Anticlockwise: reverse the rows first, then transpose.',
      ],
      code: c['X4-rotate-image'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            { caption: 'transpose', cells: [[1, 4, 7], [2, 5, 8], [3, 6, 9]] },
            { caption: 'reverse each row', cells: [[7, 4, 1], [8, 5, 2], [9, 6, 3]], states: { '0,0': 'match', '0,2': 'match' } },
          ],
        },
      ],
    },
  ],

  'X4-spiral-matrix': [
    {
      name: 'Walk and turn right when blocked',
      time: 'O(mn)',
      space: 'O(mn)',
      state: 'Position `(r, c)`, direction `d`, `seen` grid.',
      invariant: 'The walk visits each cell once in spiral order: it turns right only when the next cell is outside the grid or already seen.',
      points: [
        'Move right, down, left, up in turn.',
        'Turn right whenever the next cell is outside or already visited.',
        'Easy to get right, at the cost of a visited grid.',
      ],
      code: c['X4-spiral-matrix#direction'],
      diagrams: [{ kind: 'grid', rows: [{ caption: 'visit order', cells: [[1, 2, 3, 4], [10, 11, 12, 5], [9, 8, 7, 6]], states: { '1,1': 'active', '1,2': 'active' }, note: 'turns at each wall and at visited cells' }] }],
    },
    {
      name: 'Shrink four boundaries',
      time: 'O(mn)',
      space: 'O(1)',
      best: true,
      points: [
        'Keep top, bottom, left, right.',
        'Read the top row, then the right column, then the bottom row reversed, then the left column upward; shrink each boundary after its pass.',
        'Trap: re-check top ≤ bottom and left ≤ right before the two reverse passes, or a thin matrix is read twice.',
      ],
      code: c['X4-spiral-matrix'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: '3 × 4: outer ring, then the middle row',
              cells: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]],
              states: { '1,1': 'active', '1,2': 'active' },
              note: '1 2 3 4 8 12 11 10 9 5, then 6 7 · the guard stops a second pass over 6 7',
            },
          ],
        },
      ],
    },
  ],

  'X4-set-matrix-zeroes': [
    {
      name: 'Row and column flag arrays',
      time: 'O(mn)',
      space: 'O(m + n)',
      state: '`rows[i]`, `cols[j]` = whether the row or column held a 0 in the original matrix.',
      invariant: 'Flags are recorded before any cell changes, so the zeros written in pass 2 cannot spread further.',
      points: [
        'Pass 1: record which rows and columns contain a 0.',
        'Pass 2: zero every cell whose row or column is flagged.',
        'Never zero during pass 1, or new zeros spread further.',
      ],
      code: c['X4-set-matrix-zeroes#arrays'],
      diagrams: [{ kind: 'grid', rows: [{ caption: 'rows = {1}, cols = {1}', cells: [[1, 0, 1], [0, 0, 0], [1, 0, 1]], states: { '1,1': 'miss' } }] }],
    },
    {
      name: 'Use row 0 and column 0 as the flags',
      time: 'O(mn)',
      space: 'O(1)',
      best: true,
      points: [
        'The follow-up asks for O(1) space: store the flags in the first row and column.',
        'Cell (0, 0) cannot flag both row 0 and column 0, so keep one extra boolean for column 0.',
        'Fill from the bottom-right up, so the markers in row 0 are read before they are overwritten.',
      ],
      code: c['X4-set-matrix-zeroes'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            { caption: 'markers after the scan', cells: [[1, 0, 1], [0, 0, 1], [1, 1, 1]], states: { '0,1': 'active', '1,0': 'active' }, note: 'matrix[0][1] = 0 ⇒ column 1 · matrix[1][0] = 0 ⇒ row 1' },
            { caption: 'result', cells: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
          ],
        },
      ],
    },
  ],

  'X4-powx-n': [
    {
      name: 'Multiply n times',
      time: 'O(n)',
      space: 'O(1)',
      state: '`result` after each multiplication; negative `n` turned into `1/x` and `−n`.',
      invariant: 'After `k` multiplications, `result = x^k`.',
      points: ['Negative n ⇒ use 1/x and −n.', 'n can be 2³¹ − 1: two billion multiplications is far too slow.'],
      code: c['X4-powx-n#loop'],
      diagrams: [{ kind: 'cells', rows: [{ caption: '2¹⁰', cells: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], note: '10 multiplications' }] }],
    },
    {
      name: 'Square and multiply',
      time: 'O(log n)',
      space: 'O(1)',
      best: true,
      points: [
        'Read n in binary. Square x each step; multiply it into the result when the current bit is 1.',
        'n halves every step ⇒ about 31 steps at most.',
        'Trap: in Java negate n as a long; −Integer.MIN_VALUE overflows.',
      ],
      code: c['X4-powx-n'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'bits of 10, low to high', cells: [0, 1, 0, 1], states: { 1: 'match', 3: 'match' } },
            { caption: 'x at each step', cells: ['2', '4', '16', '256'], states: { 1: 'match', 3: 'match' }, note: '4 × 256 = 1024' },
          ],
        },
      ],
    },
  ],
}

/** Approach walkthroughs for P33 (Backtracking — Constraint Grids). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p33-code.json' with { type: 'json' }

const c = code as Record<string, string>

/** Box index (r // 3) * 3 + c // 3 for every cell of a sudoku. */
const BOXES = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, col) => Math.floor(r / 3) * 3 + Math.floor(col / 3)))

const QUEENS = [
  ['.', 'Q', '.', '.'],
  ['.', '.', '.', 'Q'],
  ['Q', '.', '.', '.'],
  ['.', '.', 'Q', '.'],
]

export const p33: Record<string, ApproachWalkthrough[]> = {
  'P33-valid-sudoku': [
    {
      name: 'Check each row, column and box',
      time: 'O(81)',
      space: 'O(1)',
      points: [
        'Validate 27 units separately: 9 rows, 9 columns, 9 boxes.',
        'A unit is fine if its digits have no repeats.',
        'Reads every cell three times; still constant time.',
      ],
      code: c['P33-valid-sudoku#units'],
      diagrams: [{ kind: 'grid', rows: [{ caption: 'box index of each cell', cells: BOXES, states: { '3,3': 'active', '4,4': 'active', '5,5': 'active' }, note: 'the three unit kinds each get checked on their own' }] }],
    },
    {
      name: 'One pass, three sets per unit',
      time: 'O(81)',
      space: 'O(1)',
      best: true,
      points: [
        'Keep a set for every row, column and box.',
        'Each digit goes into rows[r], cols[c] and boxes[b]; a repeat anywhere ⇒ false.',
        'The only non-obvious line: b = (r // 3) * 3 + c // 3.',
        'Only validity is asked: the board need not be solvable.',
      ],
      code: c['P33-valid-sudoku'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'b = (r // 3) * 3 + c // 3',
              cells: BOXES,
              states: { '4,7': 'match', '3,6': 'match', '5,8': 'match' },
              note: 'cell (4, 7): (4 // 3) * 3 + 7 // 3 = 3 + 2 = 5',
            },
          ],
        },
      ],
    },
  ],

  'P33-word-search': [
    {
      name: 'Grid DFS, mark and restore',
      time: 'O(mn·4^L)',
      space: 'O(L)',
      best: true,
      points: [
        'Start a DFS from every cell matching word[0].',
        'Mark the cell (#) before exploring, so it cannot be reused in the same path.',
        'Restore it on the way back so other paths can use it.',
        'Return as soon as i reaches the word length.',
        'Pruning follow-up: first check that the board has enough of each letter.',
      ],
      code: c['P33-word-search'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'word "ABCCED"',
              cells: [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']],
              states: { '0,0': 'match', '0,1': 'match', '0,2': 'match', '1,2': 'match', '2,2': 'match', '2,1': 'match' },
              note: 'A → B → C → C → E → D ⇒ true',
            },
          ],
        },
      ],
    },
  ],

  'P33-n-queens': [
    {
      name: 'Scan placed queens for conflicts',
      time: 'O(n!·n)',
      space: 'O(n)',
      points: [
        'One queen per row, so try each column in the current row.',
        'Before placing, scan every queen already placed: same column, or |Δcol| = Δrow (a diagonal).',
        'Each check costs O(n).',
      ],
      code: c['P33-n-queens#scan'],
      diagrams: [{ kind: 'grid', rows: [{ caption: 'n = 4, one solution', cells: QUEENS, states: { '0,1': 'match', '1,3': 'match', '2,0': 'match', '3,2': 'match' } }] }],
    },
    {
      name: 'Column and diagonal sets',
      time: 'O(n!)',
      space: 'O(n)',
      best: true,
      points: [
        'Every cell on one “\\” diagonal shares r − c; on one “/” diagonal, r + c.',
        'Keep three sets: columns, r − c and r + c. A placement is legal if none contains its key.',
        'O(1) per check; add on the way in, remove on the way out.',
      ],
      code: c['P33-n-queens'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'r + c for every cell (n = 4)',
              cells: [[0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]],
              states: { '0,1': 'match', '1,0': 'miss' },
              note: 'queen at (0, 1) ⇒ key 1 taken ⇒ (1, 0) is attacked along “/”',
            },
          ],
        },
      ],
    },
  ],

  'P33-n-queens-ii': [
    {
      name: 'Same sets, count the leaves',
      time: 'O(n!)',
      space: 'O(n)',
      best: true,
      points: [
        'Identical search to N-Queens.',
        'Return 1 at row n and add up the counts instead of building boards.',
      ],
      code: c['P33-n-queens-ii'],
      diagrams: [{ kind: 'grid', rows: [{ caption: 'n = 4 has 2 solutions; this is one', cells: QUEENS, states: { '0,1': 'match', '1,3': 'match', '2,0': 'match', '3,2': 'match' } }] }],
    },
    {
      name: 'Bitmasks for the attacks',
      time: 'O(n!)',
      space: 'O(n)',
      trick: true,
      points: [
        'Hold the attacked columns for the current row in three ints: cols, diag, anti.',
        'free = full & ~(cols | diag | anti); take bits one at a time with free & −free.',
        'For the next row, shift diag left and anti right: the diagonals move one column per row.',
        'The fastest known simple solver: no sets, no board.',
      ],
      code: c['P33-n-queens-ii#bitmask'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'row 1 after a queen in column 1 (bits = columns 0…3)', cells: [0, 1, 0, 0], note: 'cols' },
            { caption: 'diag (shifted)', cells: [0, 0, 1, 0] },
            { caption: 'anti (shifted)', cells: [1, 0, 0, 0] },
            { caption: 'free', cells: [0, 0, 0, 1], states: { 3: 'match' }, note: 'only column 3 is free in row 1' },
          ],
        },
      ],
    },
  ],
}

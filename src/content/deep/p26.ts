/** Approach walkthroughs for P26 (Graph DFS / Flood Fill). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p26-code.json' with { type: 'json' }

const c = code as Record<string, string>

const ISLANDS = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
]

export const p26: Record<string, ApproachWalkthrough[]> = {
  'P26-number-of-islands': [
    {
      name: 'Recursive DFS, sink each island',
      time: 'O(mn)',
      space: 'O(mn) stack',
      points: [
        'Scan the grid; each unvisited "1" starts a new island.',
        'Sink it: turn the whole connected region to "0" by recursing in four directions.',
        'Short, but a large island recurses mn deep and can break Python’s recursion limit.',
      ],
      code: c['P26-number-of-islands#recursive'],
      diagrams: [
        {
          kind: 'grid',
          rows: [{ caption: 'three launches', cells: ISLANDS, states: { '0,0': 'active', '2,2': 'active', '3,3': 'active' }, note: 'each launch sinks one whole island ⇒ 3' }],
        },
      ],
    },
    {
      name: 'Iterative DFS with a stack',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'Same idea with an explicit stack: no recursion limit.',
        'Sink a cell when you push it, not when you pop it, so it is never pushed twice.',
        'The number of launches is the number of islands.',
      ],
      code: c['P26-number-of-islands'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'after the first launch',
              cells: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]],
              states: { '0,0': 'dim', '0,1': 'dim', '1,0': 'dim', '1,1': 'dim', '2,2': 'active' },
              note: 'island 1 sunk · the next "1" found starts island 2',
            },
          ],
        },
      ],
    },
  ],

  'P26-max-area-of-island': [
    {
      name: 'Recursive DFS returning the size',
      time: 'O(mn)',
      space: 'O(mn) stack',
      points: [
        'area(r, c) = 0 off the grid or on water; otherwise mark it and return 1 + the four neighbours’ areas.',
        'Mark before recursing, so no cell is counted twice.',
        'Same recursion-depth risk as Number of Islands.',
      ],
      code: c['P26-max-area-of-island#recursive'],
      diagrams: [{ kind: 'grid', rows: [{ caption: 'areas 4, 1, 2', cells: ISLANDS, states: { '0,0': 'match', '0,1': 'match', '1,0': 'match', '1,1': 'match' }, note: 'max 4' }] }],
    },
    {
      name: 'Stack DFS, count while sinking',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'Launch from each 1, sink as you push, and count pops.',
        'Keep the largest count.',
      ],
      code: c['P26-max-area-of-island'],
      diagrams: [{ kind: 'grid', rows: [{ caption: 'biggest island', cells: ISLANDS, states: { '0,0': 'match', '0,1': 'match', '1,0': 'match', '1,1': 'match', '3,3': 'active', '3,4': 'active' }, note: '4 > 2 > 1 ⇒ 4' }] }],
    },
  ],

  'P26-clone-graph': [
    {
      name: 'BFS with an old → new map',
      time: 'O(V + E)',
      space: 'O(V)',
      points: [
        'The map from original to clone is both the memo and the visited set.',
        'Make a clone the first time a node is seen, and queue the original.',
        'For each edge, append the neighbour’s clone to the current clone’s list.',
      ],
      code: c['P26-clone-graph#bfs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'square 1–2–3–4–1 · BFS order', cells: [1, 2, 4, 3] },
            { caption: 'map filled', cells: ["1′", "2′", "4′", "3′"], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' }, note: 'every edge now links clones, never originals' },
          ],
        },
      ],
    },
    {
      name: 'DFS with an old → new map',
      time: 'O(V + E)',
      space: 'O(V)',
      best: true,
      points: [
        'dfs(node): if it is already in the map, return its clone.',
        'Otherwise make the clone, register it before recursing, then clone each neighbour.',
        'Registering first is what stops a cycle from looping forever.',
      ],
      code: c['P26-clone-graph'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'dfs(1) → 2 → 3 → 4 → back to 1',
              cells: [1, 2, 3, 4, 1],
              states: { 4: 'match' },
              note: '1 is already in the map ⇒ return 1′, which closes the cycle',
            },
          ],
        },
      ],
    },
  ],

  'P26-surrounded-regions': [
    {
      name: 'Check each region for the border',
      time: 'O(mn)',
      space: 'O(mn)',
      points: [
        'Flood each O region, remembering its cells and whether any is on the border.',
        'Capture (flip to X) only regions that never touched the border.',
        'Correct, with a region list and a flag to manage for every region.',
      ],
      code: c['P26-surrounded-regions#regions'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'two regions',
              cells: [['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'O', 'X', 'X']],
              states: { '1,1': 'miss', '1,2': 'miss', '2,2': 'miss', '3,1': 'match' },
              note: 'the middle region never touches the border ⇒ captured',
            },
          ],
        },
      ],
    },
    {
      name: 'Mark from the border, flip the rest',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'An O survives exactly when it connects to the border.',
        'So flood only from border Os, marking them safe (S).',
        'Then one pass: S → O, everything else → X.',
        'The question flips from “is this surrounded?” to “can the border reach it?”.',
      ],
      code: c['P26-surrounded-regions'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            { caption: 'after marking from the border', cells: [['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'S', 'X', 'X']], states: { '3,1': 'match' } },
            { caption: 'after the flip', cells: [['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'O', 'X', 'X']], states: { '3,1': 'match' } },
          ],
        },
      ],
    },
  ],

  'P26-pacific-atlantic-water-flow': [
    {
      name: 'Flow downhill from every cell',
      time: 'O((mn)²)',
      space: 'O(mn)',
      points: [
        'From each cell, follow water to neighbours of equal or lower height.',
        'Record whether the Pacific (top or left edge) and the Atlantic (bottom or right edge) are reached.',
        'Every cell starts its own search: quadratic in the grid size.',
      ],
      code: c['P26-pacific-atlantic-water-flow#each'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'from (2, 2), height 5',
              cells: [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]],
              states: { '2,2': 'active' },
              note: 'water from 5 reaches both oceans · repeat for all 25 cells',
            },
          ],
        },
      ],
    },
    {
      name: 'Walk uphill from each ocean',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'Reverse the flow: start from each ocean’s edge and step to neighbours of equal or greater height.',
        'That gives every cell the Pacific can “reach”, and the same for the Atlantic.',
        'The answer is the cells in both sets.',
        'Two searches in total instead of one per cell.',
      ],
      code: c['P26-pacific-atlantic-water-flow'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'reached by both oceans',
              cells: [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]],
              states: { '0,4': 'match', '1,3': 'match', '1,4': 'match', '2,2': 'match', '3,0': 'match', '3,1': 'match', '4,0': 'match' },
              note: '7 cells',
            },
          ],
        },
      ],
    },
  ],
}

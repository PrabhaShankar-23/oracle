/** Approach walkthroughs for P29 (Dijkstra / Weighted Shortest Path). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p29-code.json' with { type: 'json' }

const c = code as Record<string, string>

const SWIM = [
  [0, 1, 2, 3, 4],
  [24, 23, 22, 21, 5],
  [12, 13, 14, 15, 16],
  [11, 17, 18, 19, 20],
  [10, 9, 8, 7, 6],
]

export const p29: Record<string, ApproachWalkthrough[]> = {
  'P29-network-delay-time': [
    {
      name: 'Bellman-Ford',
      time: 'O(V·E)',
      space: 'O(V)',
      points: [
        'Relax every edge n − 1 times: dist[v] = min(dist[v], dist[u] + w).',
        'After round i, every shortest path with ≤ i edges is correct.',
        'Handles negative weights, but repeats all the work every round.',
      ],
      code: c['P29-network-delay-time#bellman'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'dist to nodes 1…4 from 2', cells: [1, 0, 1, 2], states: { 3: 'match' }, note: 'max 2' }] }],
    },
    {
      name: 'Dijkstra with a min-heap',
      time: 'O(E log V)',
      space: 'O(V + E)',
      best: true,
      points: [
        'Pop the closest unfinished node; with non-negative weights, its distance is now final.',
        'Push (d + w, neighbour) for each edge; skip stale pops of finished nodes.',
        'Answer = the largest final distance; if some node is never reached, −1.',
      ],
      code: c['P29-network-delay-time'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'times 2→1, 2→3, 3→4 (all 1), from 2',
              nodes: [2, 1, 3, null, null, null, 4],
              pointers: [{ at: 0, label: 'd 0' }, { at: 1, label: 'd 1' }, { at: 2, label: 'd 1' }, { at: 6, label: 'd 2', tone: 'success' }],
              states: { 6: 'match' },
              note: 'the last node finalised is 4 at time 2 ⇒ 2',
            },
          ],
        },
      ],
    },
  ],

  'P29-cheapest-flights-within-k-stops': [
    {
      name: 'Dijkstra over (cost, city, edges)',
      time: 'O(E·K·log(E·K))',
      space: 'O(E·K)',
      points: [
        'The state must include how many flights were used, not just the city.',
        'Pop the cheapest state; reaching dst first is the answer.',
        'Skip states that used more than k + 1 flights, or that arrive with no fewer flights than an earlier (cheaper) pop.',
        'Works, but the pruning rule is subtle to get right.',
      ],
      code: c['P29-cheapest-flights-within-k-stops#dijkstra'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'route 0 → 1 → 2 → 3', cells: [0, 1, 2, 3], note: 'cost 400, but 3 flights > k + 1 = 2 ⇒ pruned' },
            { caption: 'route 0 → 1 → 3', cells: [0, 1, 3], states: { 2: 'match' }, note: 'cost 700 with 2 flights ⇒ 700' },
          ],
        },
      ],
    },
    {
      name: 'Bellman-Ford for k + 1 rounds',
      time: 'O(k·E)',
      space: 'O(V)',
      best: true,
      points: [
        'k stops = at most k + 1 flights = k + 1 rounds of relaxing every edge.',
        'Each round reads a snapshot (prev) of the last round and writes into dist.',
        'The snapshot is what stops one round from chaining two flights.',
        'Trap: without the copy, round 1 could already use 0 → 1 → 2 and silently break the limit.',
      ],
      code: c['P29-cheapest-flights-within-k-stops'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'city', cells: [0, 1, 2, 3] },
            { caption: 'after round 1', cells: [0, 100, '∞', '∞'] },
            { caption: 'after round 2', cells: [0, 100, 200, 700], states: { 3: 'match' }, note: 'k = 1 ⇒ stop ⇒ 700' },
          ],
        },
      ],
    },
  ],

  'P29-swim-in-rising-water': [
    {
      name: 'Binary search the time, then flood',
      time: 'O(n² log n²)',
      space: 'O(n²)',
      points: [
        'can(t): is there a path from the corner using only cells ≤ t? Flood fill answers it.',
        'Feasibility only improves as t grows, so binary search the smallest t.',
        'Correct, but it floods the grid log(n²) times.',
      ],
      code: c['P29-swim-in-rising-water#binary'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'can(15)? no · can(16)? yes',
              cells: SWIM,
              states: { '2,4': 'active' },
              note: 'every route to the corner has to cross the 16 ⇒ 16',
            },
          ],
        },
      ],
    },
    {
      name: 'Dijkstra with max instead of +',
      time: 'O(n² log n)',
      space: 'O(n²)',
      best: true,
      points: [
        'A path’s cost is the highest cell on it, not the sum.',
        'So run Dijkstra with the relaxation max(t, grid[nr][nc]) instead of t + w.',
        'The first time the bottom-right corner is popped, its t is the answer.',
      ],
      code: c['P29-swim-in-rising-water'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'cheapest route by highest cell',
              cells: SWIM,
              states: {
                '0,0': 'match', '0,1': 'match', '0,2': 'match', '0,3': 'match', '0,4': 'match', '1,4': 'match', '2,4': 'active',
                '2,3': 'match', '2,2': 'match', '2,1': 'match', '2,0': 'match', '3,0': 'match', '4,0': 'match', '4,1': 'match',
                '4,2': 'match', '4,3': 'match', '4,4': 'match',
              },
              note: 'the highest cell on the route is 16 ⇒ 16',
            },
          ],
        },
      ],
    },
  ],
}

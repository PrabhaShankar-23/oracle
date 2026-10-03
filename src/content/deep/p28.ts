/** Approach walkthroughs for P28 (Union-Find). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p28-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p28: Record<string, ApproachWalkthrough[]> = {
  'P28-number-of-connected-components-in-an-undirected-graph': [
    {
      name: 'DFS over an adjacency list',
      time: 'O(V + E)',
      space: 'O(V + E)',
      state: 'Adjacency list `graph`, set `seen`, `count`.',
      invariant: 'Each outer-loop start that is not in `seen` floods one whole new component, so `count` equals the components found so far.',
      points: [
        'Build the adjacency list; every unvisited node starts a new component.',
        'Flood it with a stack.',
        'Equally fast, but it needs the whole graph built first.',
      ],
      code: c['P28-number-of-connected-components-in-an-undirected-graph#dfs'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'n = 5, edges 0–1, 1–2, 3–4 · launches', cells: [0, 1, 2, 3, 4], states: { 0: 'active', 3: 'active' }, note: 'two launches ⇒ 2' }] }],
    },
    {
      name: 'Union-Find, count the merges',
      time: 'O(E·α(V))',
      space: 'O(V)',
      best: true,
      points: [
        'Start with n components, one per node.',
        'For each edge, find both roots; if they differ, union them and decrement the count.',
        'Path halving and union by rank keep find nearly O(1).',
        'Works straight from the edge list, with no adjacency list.',
      ],
      code: c['P28-number-of-connected-components-in-an-undirected-graph'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'node', cells: [0, 1, 2, 3, 4] },
            { caption: 'parent after 0–1, 1–2, 3–4', cells: [0, 0, 0, 3, 3], states: { 0: 'match', 3: 'match' }, note: '5 − 3 merges = 2 components' },
          ],
        },
      ],
    },
  ],

  'P28-graph-valid-tree': [
    {
      name: 'Edge count, then one DFS',
      time: 'O(V + E)',
      space: 'O(V + E)',
      state: 'Edge count check, then `seen` from a DFS starting at node 0.',
      invariant: 'With exactly `n − 1` edges, reaching all `n` nodes proves the graph is connected and acyclic, i.e. a tree.',
      points: [
        'A tree has exactly n − 1 edges and is connected. Either rule alone is not enough.',
        'Check the count, then DFS from 0 and confirm every node is reached.',
      ],
      code: c['P28-graph-valid-tree#dfs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'edges', cells: ['0–1', '0–2', '0–3', '1–4'], note: '4 edges for 5 nodes ✓' },
            { caption: 'reached from 0', cells: [0, 1, 2, 3, 4], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match', 4: 'match' }, note: 'all 5 ⇒ true' },
          ],
        },
      ],
    },
    {
      name: 'Edge count, then Union-Find',
      time: 'O(E·α(V))',
      space: 'O(V)',
      best: true,
      points: [
        'Reject anything without exactly n − 1 edges.',
        'Union each edge; an edge whose ends already share a root closes a cycle ⇒ false.',
        'n − 1 edges and no cycle ⇒ connected ⇒ a tree.',
      ],
      code: c['P28-graph-valid-tree'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'edges 0–1, 1–2, 2–3, 1–3, 1–4',
              cells: ['0–1', '1–2', '2–3', '1–3', '1–4'],
              states: { 3: 'miss' },
              note: '5 edges for 5 nodes ⇒ already false; 1–3 is the cycle',
            },
          ],
        },
      ],
    },
  ],

  'P28-redundant-connection': [
    {
      name: 'Check reachability before each edge',
      time: 'O(n²)',
      space: 'O(n)',
      state: '`graph` = the edges added so far (a forest).',
      invariant: 'The edges added so far contain no cycle; an edge whose ends are already connected is the one that would close it.',
      points: [
        'Before adding edge (a, b), DFS: can a already reach b?',
        'If so, this edge closes the cycle, so return it.',
        'One DFS per edge: quadratic.',
      ],
      code: c['P28-redundant-connection#dfs'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'edges', cells: ['1–2', '1–3', '2–3'], states: { 2: 'miss' }, note: '2 already reaches 3 through 1 ⇒ [2, 3]' }] }],
    },
    {
      name: 'Union-Find, first same-root edge',
      time: 'O(n·α(n))',
      space: 'O(n)',
      best: true,
      points: [
        'Union edges in input order.',
        'The first edge whose ends already share a root closes the only cycle.',
        'It is also the last cycle edge in the input, which is what the problem asks for.',
      ],
      code: c['P28-redundant-connection'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'node', cells: [1, 2, 3] },
            { caption: 'parent after 1–2, 1–3', cells: [2, 3, 3], note: 'find(2) = 3 = find(3) ⇒ [2, 3]' },
          ],
        },
      ],
    },
  ],

  'P28-evaluate-division': [
    {
      name: 'Weighted graph, DFS per query',
      time: 'O(Q·(V + E))',
      space: 'O(V + E)',
      state: 'Edges `a → b` with weight `v` and `b → a` with `1/v`; per query a stack of `(node, product)`.',
      invariant: 'For each stacked `(u, acc)`, `acc` is `src / u` along the path taken, so reaching `dst` gives `src / dst`.',
      points: [
        'a / b = v gives edges a → b (v) and b → a (1/v).',
        'A query multiplies the weights along any path from a to b; no path ⇒ −1.',
        'Every query searches the graph again.',
      ],
      code: c['P28-evaluate-division#dfs'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'a/b = 2, b/c = 3 · query a/c', cells: ['a', '×2', 'b', '×3', 'c'], note: 'path a → b → c ⇒ 6' }] }],
    },
    {
      name: 'Weighted Union-Find',
      time: 'O((N + Q)·α)',
      space: 'O(N)',
      best: true,
      points: [
        'weight[x] = x / root(x).',
        'find() compresses the path and multiplies the weights along the way.',
        'Union a / b = v: attach ra under rb with weight v · w[b] / w[a].',
        'Query: same root ⇒ w[a] / w[b]; otherwise −1.',
      ],
      code: c['P28-evaluate-division'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'variable', cells: ['a', 'b', 'c'] },
            { caption: 'weight to root c', cells: [6, 3, 1], states: { 2: 'active' }, note: 'a/c = 6 / 1 = 6 · a/b = 6 / 3 = 2' },
          ],
        },
      ],
    },
  ],

  'P28-min-cost-to-connect-all-points': [
    {
      name: 'Kruskal on all n² edges',
      time: 'O(n² log n)',
      space: 'O(n²)',
      state: 'All edges sorted by distance; `parent` for union-find; `total`, `used`.',
      invariant: 'The edges taken so far form a minimum spanning forest; the cheapest edge joining two different trees is always safe to add.',
      points: [
        'List every pair with its Manhattan distance and sort.',
        'Take the cheapest edges that join two different trees (Union-Find) until n − 1 are taken.',
        'Stores all n² edges: heavy on a complete graph.',
      ],
      code: c['P28-min-cost-to-connect-all-points#kruskal'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'edges taken (points 0…4)', cells: ['1–3: 3', '0–1: 4', '3–4: 4', '1–2: 9'], note: 'total 20' }] }],
    },
    {
      name: 'Prim with a min-heap',
      time: 'O(n² log n)',
      space: 'O(n²)',
      best: true,
      points: [
        'Grow one tree from point 0.',
        'The heap holds (cost, point) for links out of the tree; pop the cheapest point not yet in it.',
        'Cut property: the cheapest edge crossing out of the tree is always safe to take.',
        'Push the new point’s links to every point still outside.',
      ],
      code: c['P28-min-cost-to-connect-all-points'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'points join in order', cells: [0, 1, 3, 4, 2], note: 'costs 0 + 4 + 3 + 4 + 9 = 20' }] }],
    },
    {
      name: 'Prim with a plain array',
      time: 'O(n²)',
      space: 'O(n)',
      state: '`in_tree[i]`; `dist[v]` = the cheapest link from the tree to `v`; `total`.',
      invariant: 'The tree built so far is a piece of some MST; the outside point with the smallest `dist` is the cheapest edge leaving the tree, so adding it is safe.',
      trick: true,
      points: [
        'On a complete graph, a heap is overkill.',
        'Keep dist[v] = the cheapest link from the tree to v.',
        'Each round: scan for the smallest dist outside the tree, add it, and lower the others’ dist.',
        'O(n²) with no heap and no edge list: the best choice for dense graphs.',
      ],
      code: c['P28-min-cost-to-connect-all-points#array'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'dist after adding 0', cells: [0, 4, 13, 7, 7], states: { 1: 'active' } },
            { caption: 'after adding 1', cells: ['·', '·', 9, 3, 7], states: { 3: 'active' } },
            { caption: 'after adding 3', cells: ['·', '·', 9, '·', 4], states: { 4: 'active' }, note: 'then 4, then 2 at 9 ⇒ 20' },
          ],
        },
      ],
    },
  ],
}

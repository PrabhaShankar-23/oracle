/** Approach walkthroughs for P20 (Tree BFS — Level Order). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p20-code.json' with { type: 'json' }

const c = code as Record<string, string>

/** [3, 9, 20, null, null, 15, 7]: the tree most P20 examples use. */
const TREE = [3, 9, 20, null, null, 15, 7]

export const p20: Record<string, ApproachWalkthrough[]> = {
  'P20-average-of-levels-in-binary-tree': [
    {
      name: 'DFS with per-depth sums',
      time: 'O(n)',
      space: 'O(h)',
      state: '`sums[d]`, `counts[d]` per depth; recursion carries `depth`.',
      invariant: 'After the walk, `sums[d]` and `counts[d]` cover exactly the nodes at depth `d`, whatever the visit order.',
      points: [
        'Walk the tree in any order, carrying the depth.',
        'Add each value to sums[depth] and bump counts[depth].',
        'Average = sums[d] / counts[d]. Correct, but a level is the natural unit here, so BFS fits better.',
      ],
      code: c['P20-average-of-levels-in-binary-tree#dfs'],
      diagrams: [
        {
          kind: 'tree',
          rows: [{ caption: 'sums by depth: 3 · 29 · 22', nodes: TREE, states: { 1: 'active', 2: 'active' }, note: 'depth 1: (9 + 20) / 2 = 14.5' }],
        },
      ],
    },
    {
      name: 'BFS, one level per loop',
      time: 'O(n)',
      space: 'O(w)',
      best: true,
      points: [
        'At the top of each loop, the queue holds exactly one whole level.',
        'Snapshot size = len(queue); pop exactly that many, summing values and queueing children.',
        'Average = total / size. w is the widest level.',
      ],
      code: c['P20-average-of-levels-in-binary-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'queue at the top of loop 3: [15, 7]',
              nodes: TREE,
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 5: 'active', 6: 'active' },
              note: 'size 2 ⇒ (15 + 7) / 2 = 11 · answer [3, 14.5, 11]',
            },
          ],
        },
      ],
    },
  ],

  'P20-binary-tree-level-order-traversal': [
    {
      name: 'DFS, bucket by depth',
      time: 'O(n)',
      space: 'O(h)',
      state: '`res[d]` = the values at depth `d` seen so far; recursion carries `depth`.',
      invariant: 'Pre-order with left before right reaches the nodes of each depth from left to right, so every `res[d]` stays in level order.',
      points: [
        'Pre-order DFS with the depth; the first visit at a new depth opens res[depth].',
        'Left before right keeps each level in left-to-right order.',
        'Works, and uses O(h) instead of O(w), but BFS is what “level order” asks for.',
      ],
      code: c['P20-binary-tree-level-order-traversal#dfs'],
      diagrams: [
        {
          kind: 'tree',
          rows: [{ caption: 'visit order 3, 9, 20, 15, 7', nodes: TREE, pointers: [{ at: 0, label: 'd0' }, { at: 1, label: 'd1' }, { at: 5, label: 'd2' }], note: '[[3], [9, 20], [15, 7]]' }],
        },
      ],
    },
    {
      name: 'BFS with a level-size snapshot',
      time: 'O(n)',
      space: 'O(w)',
      best: true,
      points: [
        'Queue starts with the root.',
        'Each loop: pop len(queue) nodes into one list, queueing their children.',
        'The snapshot is the whole trick: it separates one level from the next.',
        'Guard the empty tree ⇒ [].',
      ],
      code: c['P20-binary-tree-level-order-traversal'],
      diagrams: [
        {
          kind: 'tree',
          rows: [{ caption: 'loop 2 pops 9, 20 and queues 15, 7', nodes: TREE, states: { 1: 'active', 2: 'active', 5: 'dim', 6: 'dim' }, note: '[[3], [9, 20], [15, 7]]' }],
        },
      ],
    },
  ],

  'P20-binary-tree-right-side-view': [
    {
      name: 'DFS right-first, first visit per depth',
      time: 'O(n)',
      space: 'O(h)',
      state: '`res` with one value per depth reached so far; recursion carries `depth`.',
      invariant: 'Visiting right before left, the first node reached at a new depth is the rightmost node at that depth.',
      points: [
        'Visit right before left.',
        'The first node you reach at each new depth is the one visible from the right.',
        'Short and O(h) memory. Pick this if the tree is wide.',
      ],
      code: c['P20-binary-tree-right-side-view#dfs'],
      diagrams: [
        {
          kind: 'tree',
          rows: [{ caption: '[1, 2, 3, null, 5, null, 4]', nodes: [1, 2, 3, null, 5, null, 4], states: { 0: 'match', 2: 'match', 6: 'match' }, note: 'first at depths 0, 1, 2 ⇒ [1, 3, 4] · 5 comes later at depth 2' }],
        },
      ],
    },
    {
      name: 'BFS, last node of each level',
      time: 'O(n)',
      space: 'O(w)',
      best: true,
      points: [
        'Level loop as in Level Order.',
        'Children go in left then right, so the last node popped in a level is the rightmost.',
        'Append it after each level.',
      ],
      code: c['P20-binary-tree-right-side-view'],
      diagrams: [
        {
          kind: 'tree',
          rows: [{ caption: 'last popped per level', nodes: [1, 2, 3, null, 5, null, 4], states: { 0: 'match', 2: 'match', 6: 'match', 4: 'dim' }, note: '[1, 3, 4]' }],
        },
      ],
    },
  ],

  'P20-binary-tree-zigzag-level-order-traversal': [
    {
      name: 'BFS, reverse every other level',
      time: 'O(n)',
      space: 'O(w)',
      state: 'Queue holding one full level; `level` list; `res` so far.',
      invariant: 'The traversal itself is plain level order; only the stored copy of each odd level is reversed.',
      points: [
        'Do plain level order.',
        'Reverse the lists at odd depths before appending.',
        'Clear; it costs one extra reversal per odd level.',
      ],
      code: c['P20-binary-tree-zigzag-level-order-traversal#reverse'],
      diagrams: [
        {
          kind: 'tree',
          rows: [{ caption: 'level 1 read as [9, 20]', nodes: TREE, states: { 1: 'active', 2: 'active' }, note: 'odd level ⇒ reversed to [20, 9]' }],
        },
      ],
    },
    {
      name: 'Flip the insertion end',
      time: 'O(n)',
      space: 'O(w)',
      best: true,
      points: [
        'The queue order never changes: always left to right.',
        'Only where you insert into the level list flips: append, or appendleft, on a deque.',
        'Toggle the flag after each level.',
      ],
      code: c['P20-binary-tree-zigzag-level-order-traversal'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'right-to-left level: 9 then 20, each appendleft',
              nodes: TREE,
              pointers: [{ at: 1, label: '1st' }, { at: 2, label: '2nd', tone: 'secondary' }],
              states: { 1: 'active', 2: 'active' },
              note: '[[3], [20, 9], [15, 7]]',
            },
          ],
        },
      ],
    },
  ],
}

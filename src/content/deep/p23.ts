/** Approach walkthroughs for P23 (Lowest Common Ancestor). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p23-code.json' with { type: 'json' }

const c = code as Record<string, string>

const BST = [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5]
const TREE = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]

export const p23: Record<string, ApproachWalkthrough[]> = {
  'P23-lowest-common-ancestor-of-a-binary-search-tree': [
    {
      name: 'General LCA, ignoring the order',
      time: 'O(n)',
      space: 'O(h)',
      points: [
        'The binary-tree solution works on a BST too.',
        'But it may search the whole tree when the ordering already says which way to go.',
      ],
      code: c['P23-lowest-common-ancestor-of-a-binary-search-tree#general'],
      diagrams: [{ kind: 'tree', rows: [{ caption: 'p = 2, q = 4', nodes: BST, states: { 1: 'match', 4: 'match' }, note: 'searches both sides of every node it reaches' }] }],
    },
    {
      name: 'Walk down until p and q split',
      time: 'O(h)',
      space: 'O(1)',
      best: true,
      points: [
        'Both values smaller than node ⇒ the LCA is in the left subtree; both larger ⇒ right.',
        'Otherwise they split here (or one of them is this node): this node is the LCA.',
        'A single loop, no recursion.',
      ],
      code: c['P23-lowest-common-ancestor-of-a-binary-search-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            { caption: 'p = 2, q = 8', nodes: BST, states: { 0: 'match', 1: 'active', 2: 'active' }, note: '2 < 6 < 8 ⇒ they split at the root ⇒ 6' },
            {
              caption: 'p = 2, q = 4',
              nodes: BST,
              pointers: [{ at: 0, label: 'both < 6' }],
              states: { 0: 'dim', 1: 'match', 4: 'active' },
              note: 'go left to 2 · 2 is p itself ⇒ 2',
            },
          ],
        },
      ],
    },
  ],

  'P23-lowest-common-ancestor-of-a-binary-tree': [
    {
      name: 'Parent pointers and an ancestor set',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Walk the tree to record every node’s parent.',
        'Put all of p’s ancestors (itself included) in a set.',
        'Climb from q; the first node already in the set is the LCA.',
        'Easy to reason about, but it needs O(n) extra maps.',
      ],
      code: c['P23-lowest-common-ancestor-of-a-binary-tree#parents'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            { caption: 'p = 7, q = 4', nodes: TREE, states: { 9: 'active', 4: 'match', 1: 'match', 0: 'match', 10: 'active' }, note: 'ancestors of 7: 7, 2, 5, 3 · from 4 climb to 2 ⇒ LCA 2' },
          ],
        },
      ],
    },
    {
      name: 'One post-order returning what it found',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'Return the node itself if it is p or q (or None).',
        'Otherwise ask both children.',
        'Both return something ⇒ p and q are on different sides ⇒ this node is the LCA.',
        'Only one returns something ⇒ pass it up.',
        'If p is an ancestor of q, p is returned at once, and that is correct.',
      ],
      code: c['P23-lowest-common-ancestor-of-a-binary-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'p = 5, q = 1',
              nodes: TREE,
              pointers: [{ at: 1, label: '→ 5' }, { at: 2, label: '→ 1' }],
              states: { 0: 'match', 1: 'active', 2: 'active' },
              note: 'the root gets a hit from both sides ⇒ 3',
            },
          ],
        },
      ],
    },
  ],
}

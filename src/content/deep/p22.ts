/** Approach walkthroughs for P22 (BST Invariants). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p22-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p22: Record<string, ApproachWalkthrough[]> = {
  'P22-minimum-absolute-difference-in-bst': [
    {
      name: 'Collect, sort, compare neighbours',
      time: 'O(n log n)',
      space: 'O(n)',
      state: '`vals` = every node value, then sorted.',
      invariant: 'In sorted order the closest pair is always adjacent, so the smallest neighbour gap is the answer.',
      points: [
        'Gather every value, sort, and take the smallest gap between neighbours.',
        'Works on any binary tree, so it ignores the BST order you were given.',
      ],
      code: c['P22-minimum-absolute-difference-in-bst#sort'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'sorted values', cells: [1, 2, 3, 4, 6], states: { 0: 'match', 1: 'match' }, note: 'smallest gap 1' }] }],
    },
    {
      name: 'In-order with the previous value',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'In-order of a BST visits values in sorted order.',
        'So the smallest gap is between two consecutive visits.',
        'Keep prev and compare node.val − prev at each visit.',
      ],
      code: c['P22-minimum-absolute-difference-in-bst'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'in-order: 1, 2, 3, 4, 6',
              nodes: [4, 2, 6, 1, 3],
              pointers: [{ at: 3, label: '1st' }, { at: 1, label: '2nd' }, { at: 4, label: '3rd' }],
              states: { 3: 'match', 1: 'match' },
              note: '2 − 1 = 1 ⇒ answer 1',
            },
          ],
        },
      ],
    },
  ],

  'P22-validate-binary-search-tree': [
    {
      name: 'In-order must strictly increase',
      time: 'O(n)',
      space: 'O(h)',
      state: '`prev` = the last value visited in in-order.',
      invariant: 'Every value visited so far was strictly greater than the one before it; one violation means the tree is not a BST.',
      points: [
        'A tree is a BST ⇔ its in-order sequence is strictly increasing.',
        'Walk in-order, comparing each value with the previous one.',
        'Equally valid; the bounds version states the rule more directly.',
      ],
      code: c['P22-validate-binary-search-tree#inorder'],
      diagrams: [
        {
          kind: 'cells',
          rows: [{ caption: 'in-order of [5, 4, 6, null, null, 3, 7]', cells: [4, 5, 3, 6, 7], states: { 2: 'miss' }, note: '3 after 5 ⇒ not increasing ⇒ false' }],
        },
      ],
    },
    {
      name: 'Pass (lo, hi) bounds down',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'Every node must sit strictly inside the bounds set by all its ancestors, not just beat its parent.',
        'Going left narrows hi to node.val; going right raises lo to node.val.',
        'Start with (−∞, ∞).',
        'Trap: in Java use long or nullable bounds, since Integer.MIN_VALUE is a legal value.',
      ],
      code: c['P22-validate-binary-search-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: '[5, 4, 6, null, null, 3, 7]',
              nodes: [5, 4, 6, null, null, 3, 7],
              pointers: [{ at: 5, label: '(5, 6)', tone: 'error' }],
              states: { 5: 'miss' },
              note: '3 < 6 is fine locally, but it is in 5’s right subtree ⇒ must be > 5 ⇒ false',
            },
          ],
        },
      ],
    },
  ],

  'P22-kth-smallest-element-in-a-bst': [
    {
      name: 'Full in-order into a list',
      time: 'O(n)',
      space: 'O(n)',
      state: '`vals` = all values in in-order.',
      invariant: 'In-order lists a BST in ascending order, so `vals[k − 1]` is the k-th smallest.',
      points: [
        'In-order gives the sorted values; return vals[k − 1].',
        'Simple, but it walks the whole tree even when k is 1.',
      ],
      code: c['P22-kth-smallest-element-in-a-bst#list'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'in-order', cells: [1, 2, 3, 4, 5, 6], states: { 2: 'match' }, note: 'k = 3 ⇒ 3' }] }],
    },
    {
      name: 'Iterative in-order, stop at k',
      time: 'O(h + k)',
      space: 'O(h)',
      best: true,
      points: [
        'Push the left spine; each pop is the next smallest value.',
        'After a pop, move to its right child and push that left spine.',
        'The k-th pop is the answer. Stop there.',
        'Follow-up (frequent updates): store subtree sizes to jump to the k-th in O(h).',
      ],
      code: c['P22-kth-smallest-element-in-a-bst'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: '[5, 3, 6, 2, 4, null, null, 1], k = 3',
              nodes: [5, 3, 6, 2, 4, null, null, 1],
              pointers: [{ at: 7, label: 'pop 1' }, { at: 3, label: 'pop 2' }, { at: 1, label: 'pop 3', tone: 'success' }],
              states: { 1: 'match', 7: 'dim', 3: 'dim' },
              note: 'third pop ⇒ 3',
            },
          ],
        },
      ],
    },
  ],

  'P22-binary-search-tree-iterator': [
    {
      name: 'Flatten in the constructor',
      time: 'O(1) per call',
      space: 'O(n)',
      state: '`vals` = the in-order sequence; cursor `i`.',
      invariant: '`vals[i]` is the next smallest value not yet returned.',
      points: [
        'Do the whole in-order up front into a list; next() and hasNext() are index checks.',
        'Fast, but the follow-up asks for O(h) memory.',
      ],
      code: c['P22-binary-search-tree-iterator#flatten'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'stored up front', cells: [3, 7, 9, 15, 20], pointers: [{ at: 0, label: 'i' }] }] }],
    },
    {
      name: 'Stack of the left spine',
      time: 'O(1) amortised',
      space: 'O(h)',
      best: true,
      points: [
        'The stack holds the path of nodes still waiting to be visited.',
        'Start by pushing the root’s left spine.',
        'next(): pop the top (the next smallest), then push its right child’s left spine.',
        'Each node is pushed and popped once ⇒ O(1) amortised per call.',
      ],
      code: c['P22-binary-search-tree-iterator'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            { caption: 'start: stack [7, 3]', nodes: [7, 3, 15, null, null, 9, 20], states: { 0: 'active', 1: 'active' } },
            {
              caption: 'next() ⇒ 3, next() ⇒ 7, then push 15, 9',
              nodes: [7, 3, 15, null, null, 9, 20],
              states: { 0: 'dim', 1: 'dim', 2: 'active', 5: 'active' },
              note: 'the stack top 9 is the next smallest',
            },
          ],
        },
      ],
    },
  ],
}

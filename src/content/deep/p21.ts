/** Approach walkthroughs for P21 (Tree DFS — Path Problems). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p21-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p21: Record<string, ApproachWalkthrough[]> = {
  'P21-maximum-depth-of-binary-tree': [
    {
      name: 'BFS, count the levels',
      time: 'O(n)',
      space: 'O(w)',
      points: [
        'Run the level loop and count how many levels there are.',
        'No recursion, so no risk on a very deep, skewed tree.',
      ],
      code: c['P21-maximum-depth-of-binary-tree#bfs'],
      diagrams: [{ kind: 'tree', rows: [{ caption: '3 levels', nodes: [3, 9, 20, null, null, 15, 7], states: { 5: 'match', 6: 'match' }, note: 'depth 3' }] }],
    },
    {
      name: 'Post-order recursion',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'depth(node) = 1 + max(depth(left), depth(right)); an empty tree has depth 0.',
        'The children answer first (post-order), then the node adds 1.',
        'The template for every “ask the children, combine” tree problem.',
      ],
      code: c['P21-maximum-depth-of-binary-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'each node returns its depth',
              nodes: [3, 9, 20, null, null, 15, 7],
              pointers: [{ at: 0, label: '3' }, { at: 1, label: '1' }, { at: 2, label: '2' }, { at: 5, label: '1' }, { at: 6, label: '1' }],
              note: 'root: 1 + max(1, 2) = 3',
            },
          ],
        },
      ],
    },
  ],

  'P21-same-tree': [
    {
      name: 'Compare serialisations',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Write each tree as preorder with a marker (#) for every missing child.',
        'With the markers, equal strings ⇔ equal trees.',
        'Builds two strings when a direct walk could stop at the first difference.',
      ],
      code: c['P21-same-tree#serialize'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            { caption: '[1, 2] ⇒ "1,2,#,#,#"', nodes: [1, 2] },
            { caption: '[1, null, 2] ⇒ "1,#,2,#,#"', nodes: [1, null, 2], note: 'same values, different shape ⇒ strings differ' },
          ],
        },
      ],
    },
    {
      name: 'Walk both trees together',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'If either node is missing, they are equal only if both are (p is q).',
        'Otherwise the values match, and the left pair and the right pair both match.',
        'Stops at the first mismatch.',
      ],
      code: c['P21-same-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            { caption: 'p', nodes: [1, 2], states: { 0: 'match', 1: 'miss' } },
            { caption: 'q', nodes: [1, null, 2], states: { 0: 'match' }, note: 'p.left = 2 but q.left is missing ⇒ false' },
          ],
        },
      ],
    },
  ],

  'P21-invert-binary-tree': [
    {
      name: 'BFS, swap at each node',
      time: 'O(n)',
      space: 'O(w)',
      points: [
        'Visit every node with a queue; swap its two children.',
        'Order does not matter: every node gets swapped exactly once.',
        'Iterative, so it is safe on very deep trees.',
      ],
      code: c['P21-invert-binary-tree#bfs'],
      diagrams: [{ kind: 'tree', rows: [{ caption: 'before', nodes: [4, 2, 7, 1, 3, 6, 9] }, { caption: 'after', nodes: [4, 7, 2, 9, 6, 3, 1], states: { 1: 'active', 2: 'active' } }] }],
    },
    {
      name: 'Recursive swap',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'root.left, root.right = invert(root.right), invert(root.left).',
        'Python evaluates the right side first, so both subtrees are inverted before the swap.',
        'One line; the mirror of the tree.',
      ],
      code: c['P21-invert-binary-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            { caption: 'before', nodes: [4, 2, 7, 1, 3, 6, 9], states: { 1: 'active', 2: 'active' } },
            { caption: 'mirror', nodes: [4, 7, 2, 9, 6, 3, 1], states: { 1: 'match', 2: 'match' } },
          ],
        },
      ],
    },
  ],

  'P21-diameter-of-binary-tree': [
    {
      name: 'Recompute heights at every node',
      time: 'O(n²)',
      space: 'O(h)',
      points: [
        'The diameter either passes through the root (height(left) + height(right)) or lies inside one subtree.',
        'Recurse on both subtrees and take the max.',
        'Each call recomputes heights from scratch: quadratic on a skewed tree.',
      ],
      code: c['P21-diameter-of-binary-tree#heights'],
      diagrams: [{ kind: 'tree', rows: [{ caption: '[1, 2, 3, 4, 5]', nodes: [1, 2, 3, 4, 5], states: { 1: 'active' }, note: 'height(2) is computed again for every ancestor' }] }],
    },
    {
      name: 'One post-order, global best',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'height(node) returns 1 + max(l, r) to its parent.',
        'Along the way, l + r is the longest path bending at this node: update best.',
        'The value returned (one branch) differs from the value recorded (both branches). That is the core idea.',
        'The answer counts edges, not nodes.',
      ],
      code: c['P21-diameter-of-binary-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'best path 4 → 2 → 1 → 3',
              nodes: [1, 2, 3, 4, 5],
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' },
              pointers: [{ at: 0, label: 'l 2 + r 1' }],
              note: 'at the root: 2 + 1 = 3 edges',
            },
          ],
        },
      ],
    },
  ],

  'P21-balanced-binary-tree': [
    {
      name: 'Height check at every node',
      time: 'O(n²)',
      space: 'O(h)',
      points: [
        'Balanced ⇔ at every node the two heights differ by ≤ 1.',
        'Checking each node with a fresh height() call repeats work: quadratic on a skewed tree.',
      ],
      code: c['P21-balanced-binary-tree#heights'],
      diagrams: [{ kind: 'tree', rows: [{ caption: '[1, 2, 2, 3, 3, null, null, 4, 4]', nodes: [1, 2, 2, 3, 3, null, null, 4, 4], states: { 0: 'miss' }, note: 'root: left height 3, right height 1 ⇒ unbalanced' }] }],
    },
    {
      name: 'Post-order with a −1 sentinel',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'height() returns the real height, or −1 meaning “unbalanced somewhere below”.',
        'A −1 from either child, or a gap > 1, returns −1 straight up.',
        'The first imbalance short-circuits the rest of the tree.',
      ],
      code: c['P21-balanced-binary-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'returned heights',
              nodes: [1, 2, 2, 3, 3, null, null, 4, 4],
              pointers: [{ at: 1, label: '3' }, { at: 2, label: '1' }, { at: 0, label: '−1', tone: 'error' }],
              states: { 0: 'miss' },
              note: '|3 − 1| > 1 ⇒ −1 ⇒ false',
            },
          ],
        },
      ],
    },
  ],

  'P21-subtree-of-another-tree': [
    {
      name: 'Same Tree at every node',
      time: 'O(m·n)',
      space: 'O(h)',
      points: [
        'For each node of root, ask: is the tree starting here the same as sub_root?',
        'Reuses Same Tree directly.',
        'Worst case every node starts a near-complete comparison.',
      ],
      code: c['P21-subtree-of-another-tree#each'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            { caption: 'root', nodes: [3, 4, 5, 1, 2], states: { 1: 'match', 3: 'match', 4: 'match' } },
            { caption: 'sub_root', nodes: [4, 1, 2], note: 'Same Tree fails at 3, succeeds at 4 ⇒ true' },
          ],
        },
      ],
    },
    {
      name: 'Serialise, then substring search',
      time: 'O(m + n)',
      space: 'O(m + n)',
      best: true,
      points: [
        'Preorder with # for missing children makes the string unique to the shape.',
        'Subtree containment becomes substring containment.',
        'Prefix each value (^4) or use separators so 2 does not match inside 12.',
        'Python’s in is fast in practice; KMP gives a guaranteed O(m + n).',
      ],
      code: c['P21-subtree-of-another-tree'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'root ⇒',
              cells: ['^3', '^4', '^1', '#', '#', '^2', '#', '#', '^5', '#', '#'],
              states: { 1: 'match', 2: 'match', 3: 'match', 4: 'match', 5: 'match', 6: 'match', 7: 'match' },
              span: { from: 1, to: 7, label: 'sub_root’s string' },
            },
          ],
        },
      ],
    },
  ],

  'P21-construct-binary-tree-from-preorder-and-inorder-traversal': [
    {
      name: 'Slice and scan',
      time: 'O(n²)',
      space: 'O(n²)',
      points: [
        'preorder[0] is the root; find it in inorder.',
        'Everything left of it in inorder is the left subtree, with the same count next in preorder.',
        'Recurse on slices. The index() scan and the slicing make it quadratic.',
      ],
      code: c['P21-construct-binary-tree-from-preorder-and-inorder-traversal#scan'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'preorder', cells: [3, 9, 20, 15, 7], states: { 0: 'active' } },
            { caption: 'inorder', cells: [9, 3, 15, 20, 7], states: { 1: 'active' }, span: { from: 2, to: 4, label: 'right subtree' }, note: '3 splits inorder: [9] | [15, 20, 7]' },
          ],
        },
      ],
    },
    {
      name: 'Index map and one preorder cursor',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Map each value to its inorder index once.',
        'Keep one cursor into preorder; each build(lo, hi) takes the next value as its root.',
        'The root’s inorder index splits (lo, hi) into the left and right ranges.',
        'Trap: build left before right, because the shared cursor follows preorder.',
      ],
      code: c['P21-construct-binary-tree-from-preorder-and-inorder-traversal'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'built from pre [3, 9, 20, 15, 7] · in [9, 3, 15, 20, 7]',
              nodes: [3, 9, 20, null, null, 15, 7],
              pointers: [{ at: 0, label: 'pre 0' }, { at: 1, label: 'pre 1' }, { at: 2, label: 'pre 2' }],
              states: { 0: 'active' },
            },
          ],
        },
      ],
    },
  ],

  'P21-binary-tree-maximum-path-sum': [
    {
      name: 'Post-order: return one branch, record both',
      time: 'O(n)',
      space: 'O(h)',
      best: true,
      points: [
        'gain(node) = the best downward chain starting at node: node.val + max(l, r).',
        'Clamp negative child gains to 0; you can always leave a branch out.',
        'At each node, a path may bend: record node.val + l + r in best.',
        'The parent can only continue one branch, so return one and record both.',
        'Start best at −∞; an all-negative tree still has an answer.',
      ],
      code: c['P21-binary-tree-maximum-path-sum'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: '[−10, 9, 20, null, null, 15, 7]',
              nodes: [-10, 9, 20, null, null, 15, 7],
              states: { 2: 'match', 5: 'match', 6: 'match' },
              pointers: [{ at: 2, label: 'record 42' }, { at: 0, label: 'gain 25', tone: 'secondary' }],
              note: 'at 20: 20 + 15 + 7 = 42 recorded · it returns 20 + 15 = 35 upward',
            },
          ],
        },
      ],
    },
  ],

  'P21-serialize-and-deserialize-binary-tree': [
    {
      name: 'Level order with # placeholders',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'BFS, writing # for each missing child (the format LeetCode shows).',
        'Decode with a queue: each node takes the next two tokens as its children.',
        'Works, with two queues and index bookkeeping.',
      ],
      code: c['P21-serialize-and-deserialize-binary-tree#bfs'],
      diagrams: [
        { kind: 'tree', rows: [{ caption: '[1, 2, 3, null, null, 4, 5]', nodes: [1, 2, 3, null, null, 4, 5] }] },
        { kind: 'cells', rows: [{ caption: 'level order', cells: [1, 2, 3, '#', '#', 4, 5, '#', '#', '#', '#'] }] },
      ],
    },
    {
      name: 'Preorder with #, one cursor',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Encode: preorder, # for None.',
        'Decode: read a token. # ⇒ None; otherwise make the node, then build its left and right from the same stream.',
        'The # markers make preorder alone uniquely decodable, so no second traversal is needed.',
      ],
      code: c['P21-serialize-and-deserialize-binary-tree'],
      diagrams: [
        { kind: 'tree', rows: [{ caption: 'same tree', nodes: [1, 2, 3, null, null, 4, 5], states: { 0: 'active', 1: 'active' } }] },
        { kind: 'cells', rows: [{ caption: 'preorder', cells: [1, 2, '#', '#', 3, 4, '#', '#', 5, '#', '#'], states: { 0: 'active', 1: 'active' }, note: '2 is followed by #, # ⇒ a leaf' }] },
      ],
    },
  ],
}

/** Approach walkthroughs for P19 (In-place Linked List Reversal). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p19-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p19: Record<string, ApproachWalkthrough[]> = {
  'P19-reverse-linked-list': [
    {
      name: 'Recursive',
      time: 'O(n)',
      space: 'O(n) stack',
      state: 'Each call holds `head`; the deeper call has already reversed `head.next` onward and returned `new_head`.',
      invariant: 'When a call returns, the list from `head` on is reversed, `head` is its tail, and `new_head` is the original last node.',
      points: [
        'Reverse the rest of the list first; its new head is the answer.',
        'Then head.next (the old second node) is the tail of that reversed part: point it back at head.',
        'Set head.next = None so the old head becomes the tail.',
        'Neat, but one stack frame per node for no gain.',
      ],
      code: c['P19-reverse-linked-list#recursive'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'after reverse_list(2 → 3 → 4 → 5) returns',
              cells: [1, '→', 2, '←', 3, '←', 4, '←', 5],
              states: { 0: 'active', 2: 'active' },
              note: 'then 2.next = 1 and 1.next = None ⇒ 5 → 4 → 3 → 2 → 1',
            },
          ],
        },
      ],
    },
    {
      name: 'Three pointers, iterative',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'prev heads the reversed part; cur heads the untouched part.',
        'Save nxt = cur.next, point cur.next back at prev, then step both forward.',
        'When cur is None, prev is the new head.',
        'This is the one to have in muscle memory; the other P19 problems build on it.',
      ],
      code: c['P19-reverse-linked-list'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'after two steps',
              cells: [1, '←', 2, '·', 3, '→', 4, '→', 5],
              pointers: [
                { at: 2, label: 'prev' },
                { at: 4, label: 'cur', tone: 'secondary' },
              ],
              states: { 0: 'match', 2: 'match' },
              note: 'next: nxt = 4, 3.next = 2, prev = 3, cur = 4',
            },
          ],
        },
      ],
    },
  ],

  'P19-reverse-linked-list-ii': [
    {
      name: 'Cut, reverse, reconnect',
      time: 'O(n)',
      space: 'O(1)',
      state: '`before` = node at position `left − 1`; `prev`, `cur` for the reversal of the next `right − left + 1` nodes.',
      invariant: '`prev` heads the reversed part of the segment and `cur` the rest; `before.next` still points at the old first node until the two ends are reconnected.',
      points: [
        'Walk to before, the node just before position left.',
        'Reverse the next right − left + 1 nodes with the three-pointer loop.',
        'Then fix both ends: the old first node links to what follows, and before links to the new first.',
        'Correct, but the two reconnections at the end are easy to get backwards.',
      ],
      code: c['P19-reverse-linked-list-ii#cut'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'left 2, right 4', cells: [1, 2, 3, 4, 5], pointers: [{ at: 0, label: 'before' }], span: { from: 1, to: 3, label: 'reverse' } },
            { caption: 'after reconnecting', cells: [1, 4, 3, 2, 5], states: { 1: 'match', 2: 'match', 3: 'match' } },
          ],
        },
      ],
    },
    {
      name: 'Head-insertion, one pass',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Keep before fixed and cur at the node that started at position left.',
        'right − left times: take the node after cur and insert it right after before.',
        'cur drifts to the end of the block on its own; both ends stay attached throughout.',
        'A dummy head covers left = 1.',
      ],
      code: c['P19-reverse-linked-list-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'move 3 to the front of the block', cells: [1, 3, 2, 4, 5], pointers: [{ at: 0, label: 'before' }, { at: 2, label: 'cur', tone: 'secondary' }], states: { 1: 'active' } },
            {
              caption: 'move 4 to the front',
              cells: [1, 4, 3, 2, 5],
              pointers: [{ at: 0, label: 'before' }, { at: 3, label: 'cur', tone: 'secondary' }],
              states: { 1: 'active', 2: 'match', 3: 'match' },
              note: 'right − left = 2 moves ⇒ done',
            },
          ],
        },
      ],
    },
  ],

  'P19-reorder-list': [
    {
      name: 'Nodes into an array',
      time: 'O(n)',
      space: 'O(n)',
      state: '`nodes` = every node in order; indices `i` (front) and `j` (back).',
      invariant: 'Every node before `i` and after `j` is already linked in front-back-front order; the unlinked nodes are exactly `nodes[i..j]`.',
      points: [
        'Copy the node references into a list.',
        'Link front, back, front, back… with two indices moving inward.',
        'Terminate the last node’s next.',
        'Simple, but O(n) memory when the list itself could do the work.',
      ],
      code: c['P19-reorder-list#array'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nodes', cells: [1, 2, 3, 4, 5], pointers: [{ at: 0, label: 'i' }, { at: 4, label: 'j', tone: 'secondary' }] },
            { caption: 'linked', cells: [1, 5, 2, 4, 3], states: { 4: 'match' } },
          ],
        },
      ],
    },
    {
      name: 'Split, reverse, weave',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        '1. Fast and slow pointers find the middle; cut there.',
        '2. Reverse the second half.',
        '3. Weave: one from the first half, one from the second, until the second runs out.',
        'Three routines you already know, composed; nothing new to memorise.',
      ],
      code: c['P19-reorder-list'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'first half', cells: [1, 2, 3] },
            { caption: 'second half, reversed', cells: [5, 4], states: { 0: 'active', 1: 'active' } },
            { caption: 'woven', cells: [1, 5, 2, 4, 3], states: { 1: 'active', 3: 'active' } },
          ],
        },
      ],
    },
  ],

  'P19-remove-nth-node-from-end-of-list': [
    {
      name: 'Count, then walk',
      time: 'O(n), two passes',
      space: 'O(1)',
      state: 'Pass 1: `length`; pass 2: `prev`, starting at a dummy head.',
      invariant: 'After `length − n` steps from the dummy, `prev` is the node just before the n-th from the end.',
      points: [
        'Pass 1: count the length L.',
        'Pass 2: stop at node L − n (from a dummy head) and skip its next.',
        'Correct, but the follow-up asks for one pass.',
      ],
      code: c['P19-remove-nth-node-from-end-of-list#count'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'L = 5, n = 2 ⇒ walk 3 from the dummy',
              cells: ['d', 1, 2, 3, 4, 5],
              pointers: [{ at: 3, label: 'prev' }],
              states: { 4: 'miss' },
              note: 'prev.next = prev.next.next ⇒ 1 → 2 → 3 → 5',
            },
          ],
        },
      ],
    },
    {
      name: 'Two pointers n + 1 apart',
      time: 'O(n), one pass',
      space: 'O(1)',
      best: true,
      points: [
        'Start both at a dummy head; move fast n + 1 steps ahead.',
        'Move both until fast falls off the end.',
        'The gap is fixed, so slow now sits just before the target.',
        'Trap: the dummy head is what lets you delete the first node with no special case.',
      ],
      code: c['P19-remove-nth-node-from-end-of-list'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'n = 2: fast starts 3 ahead',
              cells: ['d', 1, 2, 3, 4, 5],
              pointers: [{ at: 0, label: 'slow' }, { at: 3, label: 'fast', tone: 'secondary' }],
            },
            {
              caption: 'fast is past the end',
              cells: ['d', 1, 2, 3, 4, 5],
              pointers: [{ at: 3, label: 'slow' }],
              states: { 4: 'miss' },
              note: 'skip 4 ⇒ 1 → 2 → 3 → 5',
            },
          ],
        },
      ],
    },
  ],

  'P19-reverse-nodes-in-k-group': [
    {
      name: 'Stack of k nodes',
      time: 'O(n)',
      space: 'O(k)',
      state: '`tail` of the output; `stack` of up to `k` nodes collected from `node`.',
      invariant: 'The output ends at `tail` with every complete group so far reversed; a full stack pops its group in reverse order.',
      points: [
        'Collect up to k nodes on a stack.',
        'A full stack pops them in reversed order onto the output.',
        'Fewer than k left ⇒ attach them unchanged and stop.',
        'Clear, but the problem’s follow-up asks for O(1) extra memory.',
      ],
      code: c['P19-reverse-nodes-in-k-group#stack'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'k = 2', cells: [1, 2, 3, 4, 5], span: { from: 0, to: 1, label: 'stack [1, 2] ⇒ pop 2, 1' } },
            { caption: 'output', cells: [2, 1, 4, 3, 5], states: { 4: 'dim' }, note: '5 alone is short of k ⇒ kept as is' },
          ],
        },
      ],
    },
    {
      name: 'Check k ahead, reverse in place',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'group_prev is the last node of the finished output (a dummy at the start).',
        'Walk k nodes ahead; if the list runs out, stop: the tail stays as is.',
        'Reverse the k nodes with prev starting at group_next, so the block’s new tail already links onward.',
        'Link group_prev to the new head (the old kth) and move group_prev to the old first node.',
      ],
      code: c['P19-reverse-nodes-in-k-group'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'second group, k = 2',
              cells: ['d', 2, 1, 3, 4, 5],
              pointers: [{ at: 2, label: 'group_prev' }, { at: 4, label: 'kth', tone: 'secondary' }],
              span: { from: 3, to: 4, label: 'reverse' },
            },
            { caption: 'after', cells: ['d', 2, 1, 4, 3, 5], pointers: [{ at: 4, label: 'group_prev' }], note: 'only 5 remains ⇒ fewer than k ⇒ done' },
          ],
        },
      ],
    },
  ],
}

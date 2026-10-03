/** Approach walkthroughs for P15 (K-way Merge). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p15-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p15: Record<string, ApproachWalkthrough[]> = {
  'P15-merge-two-sorted-lists': [
    {
      name: 'Recursive merge',
      time: 'O(m + n)',
      space: 'O(m + n) stack',
      state: 'Each call holds the two remaining heads `l1`, `l2`.',
      invariant: 'Each call returns the merged list of what remains; the smaller head comes first and its `next` is the merge of everything after it.',
      points: [
        'The smaller head goes first; its next is the merge of everything else.',
        'If either list is empty, return the other.',
        'Short and elegant, but one stack frame per node: very long lists can overflow the stack.',
      ],
      code: c['P15-merge-two-sorted-lists#recursive'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'l1', cells: [1, 2, 4], states: { 0: 'match' } },
            {
              caption: 'l2',
              cells: [1, 3, 4],
              note: '1 ≤ 1 ⇒ l1’s 1 first, then merge(l1.next, l2) · depth = m + n',
            },
          ],
        },
      ],
    },
    {
      name: 'Dummy head and a tail pointer',
      time: 'O(m + n)',
      space: 'O(1)',
      best: true,
      points: [
        'A dummy node sits before the result, so the first node is not a special case.',
        'tail is the last node built so far. Splice the smaller head after it and advance.',
        'When one list runs out, attach the rest of the other in one step.',
        'Reuses the input nodes: no copies, O(1) extra space.',
      ],
      code: c['P15-merge-two-sorted-lists'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'l1', cells: [1, 2, 4], pointers: [{ at: 1, label: 'l1' }], states: { 0: 'dim', 1: 'active' } },
            { caption: 'l2', cells: [1, 3, 4], pointers: [{ at: 1, label: 'l2', tone: 'secondary' }], states: { 0: 'dim' } },
            {
              caption: 'built so far',
              cells: ['d', 1, 1, 2],
              pointers: [{ at: 3, label: 'tail' }],
              states: { 3: 'match' },
              note: '2 ≤ 3 ⇒ tail.next = l1’s node 2',
            },
          ],
        },
      ],
    },
  ],

  'P15-find-k-pairs-with-smallest-sums': [
    {
      name: 'All sums, then sort',
      time: 'O(mn log mn)',
      space: 'O(mn)',
      state: '`pairs` = every `(a, b)`, sorted by `a + b`.',
      invariant: 'After the sort, the first `k` pairs have the `k` smallest sums.',
      points: [
        'Build every (a, b) pair, sort by a + b, take k.',
        'With 10⁵ values per array that is 10¹⁰ pairs, so it only works for tiny inputs.',
      ],
      code: c['P15-find-k-pairs-with-smallest-sums#all'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'all 9 sums of [1, 7, 11] × [2, 4, 6], sorted',
              cells: [3, 5, 7, 9, 11, 13, 13, 15, 17],
              states: { 0: 'match', 1: 'match', 2: 'match' },
              note: 'k = 3 ⇒ (1,2), (1,4), (1,6)',
            },
          ],
        },
      ],
    },
    {
      name: 'Heap over row frontiers',
      time: 'O(k log k)',
      space: 'O(k)',
      best: true,
      points: [
        'Row i is nums1[i] paired with nums2[0], nums2[1], …; sums rise along each row.',
        'So only the next unused pair of each row can be the next smallest.',
        'Seed the heap with (i, 0) for the first k rows. Pop (i, j), record it, push (i, j + 1).',
        'k pops, each O(log k).',
      ],
      code: c['P15-find-k-pairs-with-smallest-sums'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'seed: one sum per row',
              cells: [3, 9, 13],
              pointers: [{ at: 0, label: 'top' }],
              note: '1+2, 7+2, 11+2',
            },
            {
              caption: 'pop 3, push 1+4 · pop 5, push 1+6',
              cells: [7, 9, 13],
              pointers: [{ at: 0, label: 'top' }],
              states: { 0: 'match' },
              note: 'pop 7 ⇒ 3 pairs: (1,2), (1,4), (1,6)',
            },
          ],
        },
      ],
    },
  ],

  'P15-merge-k-sorted-lists': [
    {
      name: 'Merge one list at a time',
      time: 'O(k·N)',
      space: 'O(1)',
      state: '`merged` = the merge of the lists folded in so far.',
      invariant: '`merged` is sorted and contains every node of the first `t` lists after `t` folds.',
      points: [
        'Fold the lists in: merged = merge(merged, next list).',
        'Reuses the two-list merge, but merged keeps growing.',
        'The first list’s nodes are walked k − 1 times ⇒ O(k·N) for N nodes in total.',
      ],
      code: c['P15-merge-k-sorted-lists#one'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'after [1, 4, 5]', cells: [1, 4, 5] },
            { caption: 'after [1, 3, 4]', cells: [1, 1, 3, 4, 4, 5] },
            {
              caption: 'after [2, 6]',
              cells: [1, 1, 2, 3, 4, 4, 5, 6],
              states: { 0: 'active', 3: 'active', 4: 'active', 5: 'active', 6: 'active' },
              note: 'the early nodes were walked again in every round',
            },
          ],
        },
      ],
    },
    {
      name: 'Min-heap of the k heads',
      time: 'O(N log k)',
      space: 'O(k)',
      state: 'Heap of `(value, list index, node)`, one entry per non-empty list; `tail` of the output.',
      invariant: 'The heap holds the smallest unused node of every list, so its root is the smallest node left anywhere; everything appended so far is sorted.',
      points: [
        'Put each list’s head in a min-heap.',
        'Pop the smallest, append it, push its next.',
        'Every node passes through the heap once: O(N log k).',
        'Python: add the list index as a tie-breaker, because ListNodes do not compare.',
      ],
      code: c['P15-merge-k-sorted-lists#heap'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'heap of heads',
              cells: [1, 1, 2],
              pointers: [{ at: 0, label: 'top' }],
              states: { 0: 'match' },
              note: 'pop 1 (list 0) ⇒ push its next, 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Merge in pairs, doubling the gap',
      time: 'O(N log k)',
      space: 'O(1)',
      best: true,
      points: [
        'Merge lists in pairs: (0,1), (2,3)… then (0,2)… then (0,4)…',
        'Each round halves the number of lists, so there are log k rounds.',
        'Each round walks N nodes ⇒ O(N log k), the same as the heap.',
        'Needs no heap, only the two-list merge you already know.',
      ],
      code: c['P15-merge-k-sorted-lists'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'round 1 (gap 1): lists 0 + 1',
              cells: [1, 1, 3, 4, 4, 5],
              note: 'list 2 = [2, 6] has no partner yet',
            },
            {
              caption: 'round 2 (gap 2): lists 0 + 2',
              cells: [1, 1, 2, 3, 4, 4, 5, 6],
              states: { 2: 'match', 7: 'match' },
              note: '3 lists ⇒ 2 rounds = ⌈log₂ 3⌉',
            },
          ],
        },
      ],
    },
  ],
}

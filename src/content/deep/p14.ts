/** Approach walkthroughs for P14 (Top-K Elements — Heap / Quickselect). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p14-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p14: Record<string, ApproachWalkthrough[]> = {
  'P14-top-k-frequent-elements': [
    {
      name: 'Sort by frequency',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Count with a Counter, sort the distinct values by count, take k.',
        'Fine, but the follow-up asks for better than O(n log n).',
      ],
      code: c['P14-top-k-frequent-elements#sort'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'value · nums [1, 1, 1, 2, 2, 3]', cells: [1, 2, 3], states: { 0: 'match', 1: 'match' } },
            { caption: 'count', cells: [3, 2, 1], note: 'sorted by count ⇒ take the first k = 2 ⇒ [1, 2]' },
          ],
        },
      ],
    },
    {
      name: 'Min-heap of size k',
      time: 'O(n log k)',
      space: 'O(n)',
      points: [
        'Push (count, value) into a min-heap; when it grows past k, pop the least frequent.',
        'The heap ends holding the k most frequent.',
        'Beats sorting when k is small; still pays log k per value.',
      ],
      code: c['P14-top-k-frequent-elements#heap'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'heap values (k = 2), least frequent on top',
              cells: [2, 1],
              pointers: [{ at: 0, label: 'top' }],
              note: 'pushing 3 (count 1) made size 3 > k ⇒ popped it',
            },
          ],
        },
      ],
    },
    {
      name: 'Buckets indexed by frequency',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'A frequency is at most n, so it can be a list index.',
        'buckets[f] holds every value seen exactly f times.',
        'Walk f from n down to 1, collecting values until you have k.',
        'Counting instead of comparing: linear time.',
      ],
      code: c['P14-top-k-frequent-elements'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'frequency', cells: [0, 1, 2, 3, 4, 5, 6] },
            {
              caption: 'values in buckets[f]',
              cells: ['·', 3, 2, 1, '·', '·', '·'],
              pointers: [{ at: 3, label: 'start' }],
              states: { 3: 'match', 2: 'match' },
              note: 'walk down from 6: 1 (3 times), 2 (twice) ⇒ k = 2 ⇒ [1, 2]',
            },
          ],
        },
      ],
    },
  ],

  'P14-k-closest-points-to-origin': [
    {
      name: 'Sort by distance',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Sort all points by x² + y² (no square root needed) and take k.',
        'Simple, but it orders all n points when only k are needed.',
      ],
      code: c['P14-k-closest-points-to-origin#sort'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'dist² of (3,3), (5,−1), (−2,4)', cells: [18, 26, 20] },
            { caption: 'sorted', cells: [18, 20, 26], states: { 0: 'match', 1: 'match' }, note: 'k = 2 ⇒ (3,3), (−2,4)' },
          ],
        },
      ],
    },
    {
      name: 'Max-heap of size k',
      time: 'O(n log k)',
      space: 'O(k)',
      best: true,
      points: [
        'Keep the k closest so far in a max-heap by distance.',
        'Push each point; past k, pop the farthest.',
        'The root is always the worst of the kept k, the one to evict next.',
        'Only O(k) memory, and it works on a stream.',
      ],
      code: c['P14-k-closest-points-to-origin'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'after (3,3), (5,−1)', cells: [26, 18], pointers: [{ at: 0, label: 'top' }] },
            {
              caption: 'push (−2,4) ⇒ size 3 ⇒ pop the top',
              cells: [20, 18],
              pointers: [{ at: 0, label: 'top' }],
              states: { 0: 'match', 1: 'match' },
              note: '26 is gone ⇒ the heap holds the 2 closest',
            },
          ],
        },
      ],
    },
    {
      name: 'Quickselect',
      time: 'O(n) average',
      space: 'O(1)',
      trick: true,
      points: [
        'Partition by distance around a random pivot, as in quicksort.',
        'Keep only the side that holds index k − 1, and stop once it is in place.',
        'points[:k] are then the k closest, in any order.',
        'Linear on average; the random pivot guards against O(n²).',
      ],
      code: c['P14-k-closest-points-to-origin#quickselect'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'dist² after partitioning around 20',
              cells: [18, 20, 26],
              pointers: [{ at: 1, label: 'k − 1' }],
              states: { 0: 'match', 1: 'match', 2: 'dim' },
              span: { from: 0, to: 1, label: 'points[:k]' },
              note: 'slot k − 1 = 1 is final ⇒ stop',
            },
          ],
        },
      ],
    },
  ],

  'P14-kth-largest-element-in-an-array': [
    {
      name: 'Sort and index',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'sorted(nums)[−k].',
        'LeetCode asks whether you can do it without sorting. Show this first, then improve.',
      ],
      code: c['P14-kth-largest-element-in-an-array#sort'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '[3, 2, 1, 5, 6, 4] sorted · k = 2',
              cells: [1, 2, 3, 4, 5, 6],
              pointers: [{ at: 4, label: 'n − k' }],
              states: { 4: 'match' },
            },
          ],
        },
      ],
    },
    {
      name: 'Min-heap of size k',
      time: 'O(n log k)',
      space: 'O(k)',
      points: [
        'Keep the k largest seen so far in a min-heap.',
        'Past k, pop the smallest; the root is always the k-th largest so far.',
        'Good for streams and small k.',
      ],
      code: c['P14-kth-largest-element-in-an-array#heap'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'heap after every push (k = 2)',
              cells: [5, 6],
              pointers: [{ at: 0, label: 'root' }],
              states: { 0: 'match' },
              note: 'the 2 largest stay; root = 5',
            },
          ],
        },
      ],
    },
    {
      name: 'Quickselect',
      time: 'O(n) average',
      space: 'O(1)',
      best: true,
      points: [
        'The answer sits at ascending index n − k.',
        'Partition around a random pivot into < | = | >.',
        'If n − k falls in the = block, the pivot is the answer; otherwise keep only the side holding it.',
        'Each round discards part of the array instead of sorting it.',
        'Trap: without a random pivot, sorted input degrades to O(n²).',
      ],
      code: c['P14-kth-largest-element-in-an-array'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'pivot 4, after partition',
              cells: [3, 2, 1, 4, 5, 6],
              pointers: [{ at: 4, label: 'n − k' }],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'active' },
              span: { from: 4, to: 5, label: 'keep only this side' },
            },
            {
              caption: 'pivot 5',
              cells: [3, 2, 1, 4, 5, 6],
              pointers: [{ at: 4, label: 'n − k' }],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'match', 5: 'dim' },
              note: 'n − k lands in the = block ⇒ answer 5',
            },
          ],
        },
      ],
    },
  ],

  'P14-task-scheduler': [
    {
      name: 'Simulate with a heap',
      time: 'O(T)',
      space: 'O(1)',
      points: [
        'Each tick, run the task with the most left among those not cooling down.',
        'A task that just ran waits in a queue until tick + n.',
        'If nothing is ready, the tick is idle.',
        'Correct, but it walks every tick (T = the answer) just to rediscover a formula.',
      ],
      code: c['P14-task-scheduler#heap'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'tasks AAABBB, n = 2 · one cell per tick',
              cells: ['A', 'B', '·', 'A', 'B', '·', 'A', 'B'],
              states: { 2: 'dim', 5: 'dim' },
              note: 'A and B both cool for 2 ticks ⇒ idle twice ⇒ 8',
            },
          ],
        },
      ],
    },
    {
      name: 'Count the frames',
      time: 'O(N)',
      space: 'O(1)',
      best: true,
      points: [
        'f = the highest count; c = how many tasks share it.',
        'The busiest task forces f − 1 frames of n + 1 slots, plus c tasks in the last frame.',
        'Other tasks fill idle slots; if there are more than fit, there is no idle time at all.',
        'Answer = max(len(tasks), (f − 1)(n + 1) + c).',
        'Trap: forgetting the max with len(tasks) undercounts when tasks overflow the frames.',
      ],
      code: c['P14-task-scheduler'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'f = 3, c = 2, n = 2',
              cells: ['A', 'B', '·', 'A', 'B', '·', 'A', 'B'],
              states: { 2: 'dim', 5: 'dim' },
              span: { from: 0, to: 5, label: '(f − 1) × (n + 1) = 6' },
            },
            {
              caption: 'last frame',
              cells: ['A', 'B', '·', 'A', 'B', '·', 'A', 'B'],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'dim', 5: 'dim', 6: 'match', 7: 'match' },
              span: { from: 6, to: 7, label: 'c = 2' },
              note: 'max(6 tasks, 6 + 2) = 8',
            },
          ],
        },
      ],
    },
  ],
}

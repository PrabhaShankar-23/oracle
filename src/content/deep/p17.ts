/** Approach walkthroughs for P17 (Monotonic Deque). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p17-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p17: Record<string, ApproachWalkthrough[]> = {
  'P17-sliding-window-maximum': [
    {
      name: 'Recompute every window',
      time: 'O(n·k)',
      space: 'O(1) extra',
      points: [
        'Take max() of every window of size k.',
        'Correct and one line, but each slide repeats k − 1 comparisons it already made.',
      ],
      code: c['P17-sliding-window-maximum#brute'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'k = 3',
              cells: [1, 3, -1, -3, 5, 3, 6, 7],
              span: { from: 1, to: 3, label: 'max(3, −1, −3) = 3' },
              note: 'the next window rescans −1 and −3',
            },
          ],
        },
      ],
    },
    {
      name: 'Max-heap, lazy deletion',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Push (−value, index) into a heap.',
        'Before reading the top, pop entries whose index has left the window.',
        'Stale entries are only removed when they reach the top, so the heap can hold up to n.',
      ],
      code: c['P17-sliding-window-maximum#heap'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'window [3, 6, 7]',
              cells: [1, 3, -1, -3, 5, 3, 6, 7],
              states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'dim', 7: 'match' },
              span: { from: 5, to: 7, label: 'heap top 7' },
              note: 'old entries like 5 wait in the heap until they reach the top',
            },
          ],
        },
      ],
    },
    {
      name: 'Decreasing deque of indices',
      time: 'O(n)',
      space: 'O(k)',
      best: true,
      points: [
        'Keep indices whose values decrease from front to back.',
        'A new value x pops every smaller-or-equal value off the back. They can never be a max again while x is in the window.',
        'Pop the front if it has slid out; the front is the window max.',
        'Each index enters and leaves once ⇒ O(n).',
      ],
      code: c['P17-sliding-window-maximum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'deque before 5: values 3, −1, −3',
              cells: [1, 3, -1, -3, 5, 3, 6, 7],
              pointers: [{ at: 4, label: 'x' }],
              states: { 1: 'miss', 2: 'miss', 3: 'miss' },
              note: 'all ≤ 5 ⇒ popped from the back',
            },
            {
              caption: 'deque after: just 5',
              cells: [1, 3, -1, -3, 5, 3, 6, 7],
              pointers: [{ at: 4, label: 'front' }],
              states: { 4: 'match' },
              note: 'window [−1, −3, 5] ⇒ max 5 · answer 3, 3, 5, 5, 6, 7',
            },
          ],
        },
      ],
    },
  ],
}

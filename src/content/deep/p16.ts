/** Approach walkthroughs for P16 (Monotonic Stack). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p16-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p16: Record<string, ApproachWalkthrough[]> = {
  'P16-daily-temperatures': [
    {
      name: 'Scan forward from each day',
      time: 'O(n²)',
      space: 'O(1) extra',
      points: [
        'For each day, walk ahead until a warmer day appears.',
        'Correct, but a long cooling stretch is rescanned from every day in it.',
      ],
      code: c['P16-daily-temperatures#scan'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'from day 2 (75)',
              cells: [73, 74, 75, 71, 69, 72, 76, 73],
              pointers: [{ at: 2, label: 'i' }],
              states: { 3: 'miss', 4: 'miss', 5: 'miss', 6: 'match' },
              note: '71, 69, 72 are not warmer · 76 is ⇒ 4 days',
            },
          ],
        },
      ],
    },
    {
      name: 'Stack of days still waiting',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Keep a stack of indices whose temperatures decrease from bottom to top: days still waiting.',
        'A warmer day pops every cooler day on top; for each popped j, the answer is i − j.',
        'Then push i. Each index is pushed and popped once ⇒ O(n).',
        'Trap: push indices, not temperatures. You need the distance.',
      ],
      code: c['P16-daily-temperatures'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'stack before day 5 (72): indices 2, 3, 4',
              cells: [73, 74, 75, 71, 69, 72, 76, 73],
              pointers: [{ at: 5, label: 'i' }],
              states: { 2: 'active', 3: 'match', 4: 'match' },
              note: '69 < 72 ⇒ res[4] = 1 · 71 < 72 ⇒ res[3] = 2 · 75 stays',
            },
            { caption: 'answer', cells: [1, 1, 4, 2, 1, 1, 0, 0] },
          ],
        },
      ],
    },
    {
      name: 'Jump from the right',
      time: 'O(n)',
      space: 'O(1) extra',
      trick: true,
      points: [
        'Fill res from right to left; everything to the right of i is already solved.',
        'Start at j = i + 1. While temps[j] ≤ temps[i], jump j += res[j]: straight to j’s next warmer day.',
        'res[j] = 0 means nothing warmer exists ⇒ stop with 0.',
        'The jumps skip whole cooler runs, so it is linear with no stack.',
      ],
      code: c['P16-daily-temperatures#jump'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'i = 2 (75), res to its right is known',
              cells: [73, 74, 75, 71, 69, 72, 76, 73],
              pointers: [
                { at: 2, label: 'i' },
                { at: 3, label: 'j' },
                { at: 5, label: 'j' },
                { at: 6, label: 'j', tone: 'success' },
              ],
              states: { 6: 'match' },
              note: '71: jump res[3] = 2 ⇒ 72: jump res[5] = 1 ⇒ 76 > 75 ⇒ res[2] = 4',
            },
          ],
        },
      ],
    },
  ],

  'P16-car-fleet': [
    {
      name: 'Sort by position, stack of fleets',
      time: 'O(n log n)',
      space: 'O(n)',
      best: true,
      points: [
        'Process cars from the one closest to the target backwards.',
        'Each car’s solo arrival time is (target − position) / speed.',
        'If it would arrive no later than the fleet ahead, it catches up and joins: no new fleet.',
        'Otherwise it is slower: push its time as a new fleet.',
        'The answer is the stack size.',
      ],
      code: c['P16-car-fleet'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'position (closest first) · target 12', cells: [10, 8, 5, 3, 0] },
            {
              caption: 'arrival time',
              cells: [1, 1, 7, 3, 12],
              states: { 0: 'match', 1: 'dim', 2: 'match', 3: 'dim', 4: 'match' },
              note: '8 joins 10 (1 ≤ 1) · 3 joins 5 (3 ≤ 7) ⇒ 3 fleets',
            },
          ],
        },
      ],
    },
    {
      name: 'One variable instead of a stack',
      time: 'O(n log n)',
      space: 'O(1) extra',
      trick: true,
      points: [
        'Only the stack top is ever compared, so the stack is not really needed.',
        'Keep slowest = the arrival time of the fleet just ahead, and a counter.',
        'time > slowest ⇒ fleets += 1, slowest = time.',
        'A good follow-up answer: “the stack only ever needs its top”.',
      ],
      code: c['P16-car-fleet#max'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'slowest after each car',
              cells: [1, 1, 7, 7, 12],
              states: { 0: 'match', 2: 'match', 4: 'match' },
              note: 'it rises three times ⇒ 3 fleets',
            },
          ],
        },
      ],
    },
  ],

  'P16-largest-rectangle-in-histogram': [
    {
      name: 'Expand from each bar',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Treat each bar as the shortest bar of its rectangle.',
        'Extend left and right while the neighbours are at least as tall.',
        'Area = height × width; keep the max. Quadratic on a staircase.',
      ],
      code: c['P16-largest-rectangle-in-histogram#expand'],
      diagrams: [
        {
          kind: 'bars',
          rows: [
            {
              caption: 'bar 2 (height 5) extends over 5, 6',
              heights: [2, 1, 5, 6, 2, 3],
              pointers: [{ at: 2, label: 'i' }],
              box: { from: 2, to: 3, height: 5, label: '5 × 2 = 10' },
            },
          ],
        },
      ],
    },
    {
      name: 'Increasing stack, area on pop',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Keep indices with increasing heights; add a 0 at the end to flush everything.',
        'A shorter bar pops taller ones. When a bar is popped, both of its limits are known.',
        'Right limit = i (the shorter bar); left limit = the new stack top.',
        'Width = i − left − 1.',
        'Trap: compute the width after the pop, from the new top, not from the popped index.',
      ],
      code: c['P16-largest-rectangle-in-histogram'],
      diagrams: [
        {
          kind: 'bars',
          rows: [
            {
              caption: 'i = 4 (height 2) pops 6, then 5',
              heights: [2, 1, 5, 6, 2, 3],
              pointers: [
                { at: 1, label: 'left' },
                { at: 4, label: 'i' },
              ],
              box: { from: 2, to: 3, height: 5, label: '5 × (4 − 1 − 1) = 10' },
            },
          ],
        },
      ],
    },
  ],
}

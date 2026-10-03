/** Approach walkthroughs for X5 (Linked List — Not Reversal-shaped). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './x5-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const x5: Record<string, ApproachWalkthrough[]> = {
  'X5-add-two-numbers': [
    {
      name: 'Convert to integers and back',
      time: 'O(m + n)',
      space: 'O(m + n)',
      state: '`to_int` reads each list into a number; `total`; `tail` of the output.',
      invariant: 'Digits are least significant first, so `place` multiplies by 10 per node; writing `total` back with `divmod` gives digits in the same order.',
      points: [
        'Read each list into a number (digits are least significant first), add, and write the digits back out.',
        'Fine in Python, whose ints never overflow.',
        'In Java a 100-digit list overflows long, so interviewers expect the digit-by-digit version.',
      ],
      code: c['X5-add-two-numbers#ints'],
      diagrams: [{ kind: 'cells', rows: [{ caption: '2→4→3 + 5→6→4', cells: [342, '+', 465, '=', 807], note: '⇒ 7→0→8' }] }],
    },
    {
      name: 'Digit by digit with a carry',
      time: 'O(max(m, n))',
      space: 'O(1) extra',
      best: true,
      points: [
        'Add the two digits and the carry; write total % 10 and carry total // 10.',
        'Treat a finished list as 0.',
        'Loop while either list remains or the carry is non-zero. The trailing carry is the classic miss.',
      ],
      code: c['X5-add-two-numbers'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'l1', cells: [2, 4, 3] },
            { caption: 'l2', cells: [5, 6, 4] },
            { caption: 'sum', cells: [7, 0, 8], states: { 1: 'active' }, note: '4 + 6 = 10 ⇒ write 0, carry 1 ⇒ 3 + 4 + 1 = 8' },
          ],
        },
      ],
    },
  ],

  'X5-copy-list-with-random-pointer': [
    {
      name: 'Map original → clone',
      time: 'O(n)',
      space: 'O(n)',
      state: '`clones` = original node → its copy, with `clones[None] = None`.',
      invariant: 'After pass 1 every node has exactly one clone, so pass 2 can wire every `next` and `random` by lookup.',
      points: [
        'Pass 1: make a clone for every node and store it in a map.',
        'Pass 2: clone.next = map[node.next], clone.random = map[node.random].',
        'Seeding map[None] = None removes the null checks.',
      ],
      code: c['X5-copy-list-with-random-pointer#map'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'map', cells: ["A→A′", "B→B′", "C→C′"], note: 'every pointer of a clone is one map lookup' }] }],
    },
    {
      name: 'Interleave, wire, split',
      time: 'O(n)',
      space: 'O(1) extra',
      best: true,
      points: [
        '1. Insert each clone right after its original: A → A′ → B → B′ …',
        '2. Now A′.random = A.random.next, with no map.',
        '3. Unweave the two lists, restoring the original exactly.',
        'Trap: step 3 must fully restore the input list, not just extract the copy.',
      ],
      code: c['X5-copy-list-with-random-pointer'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'interleaved', cells: ['A', "A′", 'B', "B′", 'C', "C′"], states: { 1: 'active', 3: 'active', 5: 'active' } },
            { caption: 'if A.random = C', cells: ['A', "A′", 'B', "B′", 'C', "C′"], states: { 1: 'active', 5: 'match' }, note: 'A′.random = A.random.next = C′' },
          ],
        },
      ],
    },
  ],
}

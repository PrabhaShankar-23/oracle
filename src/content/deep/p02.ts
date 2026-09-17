/** Approach walkthroughs for P02 (Fast & Slow Pointers). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p02-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p02: Record<string, ApproachWalkthrough[]> = {
  'P02-linked-list-cycle': [
    {
      name: 'Visited set',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Walk the list one node at a time.',
        'Put every node in a set — by identity, not by value.',
        'A node already in the set means the list loops.',
        'Reaching None means there is no cycle.',
        'Needs memory proportional to the list.',
      ],
      code: c['P02-linked-list-cycle#set'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'nodes 3 → 2 → 0 → −4, and −4 points back at 2',
              cells: [3, 2, 0, -4],
              pointers: [{ at: 3, label: 'cur' }],
              states: { 0: 'dim', 1: 'dim', 2: 'dim' },
              note: 'seen = {3, 2, 0} · next is 2, already seen ⇒ cycle',
            },
          ],
        },
      ],
    },
    {
      name: "Floyd's tortoise and hare",
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'slow moves one node per tick, fast moves two.',
        'Outside a cycle the gap grows; inside one it shrinks by exactly 1 per tick.',
        'So if a cycle exists they must meet within its length.',
        'fast or fast.next hitting None means no cycle.',
        'Two pointers replace the whole visited set.',
      ],
      code: c['P02-linked-list-cycle'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'tick 1',
              cells: [3, 2, 0, -4],
              pointers: [{ at: 1, label: 'slow' }, { at: 2, label: 'fast', tone: 'secondary' }],
              note: '−4 links back to 2, so fast wraps around',
            },
            {
              caption: 'tick 2',
              cells: [3, 2, 0, -4],
              pointers: [{ at: 2, label: 'slow' }, { at: 1, label: 'fast', tone: 'secondary' }],
              note: 'fast went −4 → 2 · the gap is closing',
            },
            {
              caption: 'tick 3',
              cells: [3, 2, 0, -4],
              pointers: [{ at: 3, label: 'slow' }, { at: 3, label: 'fast', tone: 'success' }],
              states: { 3: 'match' },
              note: 'slow == fast ⇒ cycle',
            },
          ],
        },
      ],
    },
  ],

  'P02-happy-number': [
    {
      name: 'Seen set',
      time: 'O(log n)',
      space: 'O(log n)',
      points: [
        'Replace n by the sum of the squares of its digits, over and over.',
        'Remember every value in a set.',
        'Reaching 1 ⇒ happy.',
        'Seeing a value twice ⇒ a cycle that never reaches 1.',
        'The chain collapses below ~243 quickly, so the set stays small.',
      ],
      code: c['P02-happy-number#set'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'n = 19',
              cells: [19, 82, 68, 100, 1],
              states: { 4: 'match' },
              note: 'seen = {19, 82, 68, 100} · reached 1 ⇒ happy',
            },
          ],
        },
      ],
    },
    {
      name: 'Floyd on f',
      time: 'O(log n)',
      space: 'O(1)',
      best: true,
      points: [
        'f (digit-square sum) maps a finite set into itself, so every chain must cycle.',
        'Run slow = f(n) and fast = f(f(n)).',
        'fast reaching 1 ⇒ happy.',
        'slow == fast first ⇒ they are inside a cycle with no 1 in it.',
        'Same guarantee as the set, with two variables.',
      ],
      code: c['P02-happy-number'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'n = 19 · chain',
              cells: [19, 82, 68, 100, 1],
              pointers: [{ at: 1, label: 'slow' }, { at: 2, label: 'fast', tone: 'secondary' }],
              states: { 4: 'match' },
              note: 'fast reaches 1 first ⇒ True',
            },
            {
              caption: 'n = 2 · chain loops',
              cells: [2, 4, 16, 37, 58, 89, 145, 42, 20],
              states: { 1: 'miss', 8: 'miss' },
              note: '20 → 4 closes the loop · slow and fast meet inside it ⇒ False',
            },
          ],
        },
      ],
    },
  ],

  'P02-find-the-duplicate-number': [
    {
      name: 'Sort a copy',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Sort a copy of the array, leaving the input untouched.',
        'Equal values land next to each other.',
        'Scan for the first pair of equal neighbours.',
        'Easy, but the problem asks for read-only input and constant space.',
      ],
      code: c['P02-find-the-duplicate-number#sort'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'sorted copy of [1, 3, 4, 2, 2]',
              cells: [1, 2, 2, 3, 4],
              states: { 1: 'match', 2: 'match' },
              note: 'equal neighbours ⇒ 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Floyd, two phases',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Read i → nums[i] as a jump: the array becomes a linked list.',
        'n + 1 slots holding values in 1…n force two indices onto the same node ⇒ a cycle.',
        'Phase 1: slow jumps once, fast twice, until they meet inside the loop.',
        'Phase 2: restart one cursor at index 0 and step both by one.',
        'They meet at the cycle entry, which is the duplicated value.',
      ],
      code: c['P02-find-the-duplicate-number'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'index i', cells: [0, 1, 2, 3, 4] },
            {
              caption: 'nums[i] — follow i → nums[i]',
              cells: [1, 3, 4, 2, 2],
              note: '0 → 1 → 3 → 2 → 4 → 2 → 4 … the path enters a loop',
            },
            {
              caption: 'phase 2 lands on the entry',
              cells: [0, 1, 2, 3, 4],
              pointers: [{ at: 2, label: 'slow' }, { at: 2, label: 'fast', tone: 'success' }],
              states: { 2: 'match' },
              note: 'node 2 is the cycle entry ⇒ the duplicate is 2',
            },
          ],
        },
      ],
    },
  ],
}

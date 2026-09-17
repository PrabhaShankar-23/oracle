/** Approach walkthroughs for P07 (Dutch National Flag / Partition). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p07-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p07: Record<string, ApproachWalkthrough[]> = {
  'P07-remove-element': [
    {
      name: 'Filter into a new list',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Collect the values you keep into a new list.',
        'Copy them back over the front of nums.',
        'Clear, but it allocates a second array the size of the input.',
      ],
      code: c['P07-remove-element#copy'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'val = 2',
              cells: [0, 1, 2, 2, 3, 0, 4, 2],
              states: { 2: 'miss', 3: 'miss', 7: 'miss' },
              note: 'kept = [0, 1, 3, 0, 4] → copied back',
            },
          ],
        },
      ],
    },
    {
      name: 'Read/write pointers',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'k is the write pointer: [0, k) holds everything kept so far.',
        'Read every value; if it is not val, write it at k and k++.',
        'The read pointer is always ahead of the write pointer, so nothing is lost.',
        'Return k — whatever sits beyond it does not matter.',
        'One pass, no extra memory.',
      ],
      code: c['P07-remove-element'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'i = 2 holds val ⇒ skip',
              cells: [0, 1, 2, 2, 3, 0, 4, 2],
              pointers: [{ at: 2, label: 'k' }, { at: 2, label: 'i', tone: 'secondary' }],
              states: { 2: 'miss' },
              note: 'nothing is written, k stays put',
            },
            {
              caption: 'after the pass',
              cells: [0, 1, 3, 0, 4, '·', '·', '·'],
              pointers: [{ at: 5, label: 'k' }],
              states: { 5: 'dim', 6: 'dim', 7: 'dim' },
              note: '[0, k) keeps the order of the survivors · return k = 5',
            },
          ],
        },
      ],
    },
  ],

  'P07-sort-colors': [
    {
      name: 'Counting sort',
      time: 'O(n)',
      space: 'O(1)',
      points: [
        'Pass 1 counts how many 0s, 1s and 2s there are.',
        'Pass 2 overwrites the array with that many of each, in order.',
        'Two passes, and it only works for values you can count.',
      ],
      code: c['P07-sort-colors#count'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'pass 1: tally', cells: [2, 0, 2, 1, 1, 0], note: 'count = [2, 2, 2]' },
            {
              caption: 'pass 2: overwrite',
              cells: [0, 0, 1, 1, 2, 2],
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match', 4: 'match', 5: 'match' },
            },
          ],
        },
      ],
    },
    {
      name: 'Dutch National Flag',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Three pointers: [0, low) = 0s, [low, mid) = 1s, (high, n) = 2s, [mid, high] unexamined.',
        'nums[mid] == 0: swap with low, then low++ and mid++.',
        'nums[mid] == 1: just mid++.',
        'nums[mid] == 2: swap with high, high−−, and do NOT move mid — the value swapped in is unseen.',
        'Stop when mid passes high: one pass, and it works for keys you cannot count.',
      ],
      code: c['P07-sort-colors'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'start',
              cells: [2, 0, 2, 1, 1, 0],
              pointers: [{ at: 0, label: 'low' }, { at: 0, label: 'mid' }, { at: 5, label: 'high', tone: 'secondary' }],
              states: { 0: 'miss' },
              note: 'nums[mid] = 2 → swap with high, high−− · mid stays',
            },
            {
              caption: 'after the 0-swaps',
              cells: [0, 0, 2, 1, 1, 2],
              pointers: [{ at: 2, label: 'low' }, { at: 2, label: 'mid' }, { at: 4, label: 'high', tone: 'secondary' }],
              states: { 0: 'match', 1: 'match', 5: 'match' },
              note: '0 → swap with low, then low++ and mid++',
            },
            {
              caption: 'mid passes high',
              cells: [0, 0, 1, 1, 2, 2],
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match', 4: 'match', 5: 'match' },
              note: 'three regions, one pass',
            },
          ],
        },
      ],
    },
  ],

  'P07-remove-duplicates-from-sorted-array-ii': [
    {
      name: 'Count and rebuild',
      time: 'O(n)',
      space: 'O(n)',
      points: [
        'Count occurrences while scanning and keep the first two of each value.',
        'Copy the kept values back to the front.',
        'Works on unsorted input too, but allocates a list the size of the input.',
      ],
      code: c['P07-remove-duplicates-from-sorted-array-ii#copy'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'keep the first two of each value',
              cells: [0, 0, 1, 1, 1, 1, 2, 3, 3],
              states: { 4: 'miss', 5: 'miss' },
              note: 'kept = [0, 0, 1, 1, 2, 3, 3] → copied back',
            },
          ],
        },
      ],
    },
    {
      name: 'Write pointer with look-back 2',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'k is the write pointer; [0, k) is the answer so far.',
        'Keep nums[i] when k < 2 or nums[i] != nums[k − 2].',
        'That look-back of two is exactly the "at most two copies" rule.',
        'The array is sorted, so equal values are adjacent and the check stays local.',
        'Use nums[k − m] to keep at most m copies.',
      ],
      code: c['P07-remove-duplicates-from-sorted-array-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'i = 4, k = 4 · compare with nums[k − 2]',
              cells: [0, 0, 1, 1, 1, 1, 2, 3, 3],
              pointers: [{ at: 2, label: 'k−2', tone: 'secondary' }, { at: 4, label: 'i' }],
              states: { 2: 'active', 4: 'miss' },
              note: 'equal ⇒ two copies already kept ⇒ skip',
            },
            {
              caption: 'after the pass',
              cells: [0, 0, 1, 1, 2, 3, 3, '·', '·'],
              pointers: [{ at: 7, label: 'k' }],
              states: { 7: 'dim', 8: 'dim' },
              note: 'every value appears at most twice in [0, k)',
            },
          ],
        },
      ],
    },
  ],
}

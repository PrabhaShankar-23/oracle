/** Approach walkthroughs for X1 (Greedy). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './x1-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const x1: Record<string, ApproachWalkthrough[]> = {
  'X1-jump-game': [
    {
      name: 'DP: can the end be reached from i?',
      time: 'O(n²)',
      space: 'O(n)',
      points: [
        'good[i] = some index within reach of i is good; the last index is good.',
        'Fill right to left.',
        'Each index looks at up to nums[i] others: quadratic in the worst case.',
      ],
      code: c['X1-jump-game#dp'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [3, 2, 1, 0, 4] },
            { caption: 'good', cells: ['F', 'F', 'F', 'F', 'T'], states: { 3: 'miss', 4: 'match' }, note: 'every path lands on the 0 ⇒ false' },
          ],
        },
      ],
    },
    {
      name: 'Track the farthest reach',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'far = the farthest index reachable so far.',
        'If i ever passes far, you are stuck ⇒ false.',
        'Otherwise far = max(far, i + nums[i]).',
        'Reachable indices always form a prefix, so one number describes them all.',
      ],
      code: c['X1-jump-game'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'nums', cells: [3, 2, 1, 0, 4], pointers: [{ at: 4, label: 'i' }], states: { 4: 'miss' } },
            { caption: 'far after i', cells: [3, 3, 3, 3, '·'], note: 'i = 4 > far = 3 ⇒ false' },
          ],
        },
      ],
    },
  ],

  'X1-jump-game-ii': [
    {
      name: 'DP: fewest jumps to each index',
      time: 'O(n²)',
      space: 'O(n)',
      points: ['dp[j] = min(dp[j], dp[i] + 1) for every j that i can reach.', 'Correct, but every index relaxes up to nums[i] others.'],
      code: c['X1-jump-game-ii#dp'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'nums [2, 3, 1, 1, 4] · dp', cells: [0, 1, 1, 2, 2], states: { 4: 'match' }, note: '2 jumps' }] }],
    },
    {
      name: 'BFS by levels, two pointers',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'A “level” is every index reachable with the same number of jumps; levels are contiguous ranges.',
        'Walk i across the current level, tracking far = the end of the next level.',
        'When i hits cur_end, you must jump: jumps += 1, cur_end = far.',
        'Stop before the last index, since you are already there.',
      ],
      code: c['X1-jump-game-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'level 1', cells: [2, 3, 1, 1, 4], states: { 0: 'dim', 1: 'active', 2: 'active' }, span: { from: 1, to: 2, label: '1 jump' } },
            { caption: 'level 2', cells: [2, 3, 1, 1, 4], states: { 0: 'dim', 1: 'dim', 2: 'dim', 3: 'match', 4: 'match' }, span: { from: 3, to: 4, label: '2 jumps' }, note: 'the last index is in level 2 ⇒ 2' },
          ],
        },
      ],
    },
  ],

  'X1-gas-station': [
    {
      name: 'Simulate from every start',
      time: 'O(n²)',
      space: 'O(1)',
      points: ['Try each station as the start and drive the whole loop.', 'The first start whose tank never goes negative is the answer.'],
      code: c['X1-gas-station#each'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'gas − cost', cells: [-2, -2, -2, 3, 3], states: { 0: 'miss', 1: 'miss', 2: 'miss', 3: 'match' }, note: 'starts 0, 1, 2 fail at once · 3 works' }] }],
    },
    {
      name: 'One pass: reset the start on a deficit',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'If the tank goes negative at i, no station from start to i can be the start. Each of them arrives at i with no more fuel.',
        'So jump start to i + 1 and reset the tank.',
        'A solution exists exactly when the total surplus is ≥ 0; then the last start is it.',
      ],
      code: c['X1-gas-station'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'gas [1, 2, 3, 4, 5] − cost [3, 4, 5, 1, 2]', cells: [-2, -2, -2, 3, 3], pointers: [{ at: 3, label: 'start' }], states: { 3: 'match' } },
            { caption: 'tank', cells: [0, 0, 0, 3, 6], note: 'reset three times · total 0 ≥ 0 ⇒ 3' },
          ],
        },
      ],
    },
  ],

  'X1-partition-labels': [
    {
      name: 'Last index, then one sweep',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Record where each letter appears for the last time.',
        'Sweep with end = the farthest last-index of any letter seen in this part.',
        'When i reaches end, no letter in the part appears later: close it.',
      ],
      code: c['X1-partition-labels'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '"abaccbdd"',
              cells: ['a', 'b', 'a', 'c', 'c', 'b', 'd', 'd'],
              states: { 5: 'match', 7: 'match' },
              span: { from: 0, to: 5, label: 'b’s last copy is at 5 ⇒ 6' },
              note: 'then "dd" ⇒ [6, 2]',
            },
          ],
        },
      ],
    },
  ],

  'X1-hand-of-straights': [
    {
      name: 'Sorted keys, start runs in bulk',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Walk the distinct cards in sorted order.',
        'If card has count c left, it must start c runs, so take c of each of the next group_size cards.',
        'Any shortfall ⇒ false.',
      ],
      code: c['X1-hand-of-straights#sorted'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'hand sorted, k = 3', cells: [1, 2, 2, 3, 3, 4, 6, 7, 8], note: '1 starts 123 · 2 starts 234 · 6 starts 678 ⇒ true' }] }],
    },
    {
      name: 'Min-heap of values',
      time: 'O(n log n)',
      space: 'O(n)',
      best: true,
      points: [
        'The smallest remaining card has nothing smaller to go with, so it must start a group.',
        'Take first, first + 1, …, first + k − 1 from the counts.',
        'When a count hits 0 it must be the heap’s smallest, or a smaller card would be stranded ⇒ false.',
        'Length not divisible by k ⇒ false immediately.',
      ],
      code: c['X1-hand-of-straights'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'counts for 1…4, 6…8', cells: [1, 2, 2, 1, 1, 1, 1], states: { 0: 'active', 1: 'active', 2: 'active' }, note: 'group 1-2-3 ⇒ counts 0, 1, 1, 1, …' },
          ],
        },
      ],
    },
  ],

  'X1-candy': [
    {
      name: 'Fix violations until stable',
      time: 'O(n²)',
      space: 'O(n)',
      points: ['Start everyone at 1; whenever a higher-rated child does not beat a neighbour, bump them.', 'Repeat until nothing changes. Correct, but each pass fixes little.'],
      code: c['X1-candy#repeat'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'ratings [1, 0, 2]', cells: [2, 1, 2], note: 'one pass bumps both ends · the next pass changes nothing ⇒ 5' }] }],
    },
    {
      name: 'Left sweep, right sweep, take the max',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Left to right: beat the left neighbour when rated higher.',
        'Right to left: beat the right neighbour too, keeping the larger value.',
        'Each sweep enforces one side; the max satisfies both at once.',
      ],
      code: c['X1-candy'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'ratings', cells: [1, 0, 2] },
            { caption: 'after the left sweep', cells: [1, 1, 2] },
            { caption: 'after the right sweep', cells: [2, 1, 2], states: { 0: 'active' }, note: '1 > 0 on its right ⇒ 2 · total 5' },
          ],
        },
      ],
    },
  ],
}

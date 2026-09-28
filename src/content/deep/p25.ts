/** Approach walkthroughs for P25 (Graph BFS — Shortest Path / Multi-source). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p25-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p25: Record<string, ApproachWalkthrough[]> = {
  'P25-rotting-oranges': [
    {
      name: 'BFS from each rotten orange',
      time: 'O(k·mn)',
      space: 'O(mn)',
      points: [
        'Run a separate BFS from every rotten orange, keeping the earliest minute each fresh cell is reached.',
        'Answer = the latest of those minutes, or −1 if some fresh orange is never reached.',
        'With k rotten oranges the grid is walked k times.',
      ],
      code: c['P25-rotting-oranges#each'],
      diagrams: [
        {
          kind: 'grid',
          rows: [{ caption: 'grid (2 rotten, 1 fresh, 0 empty)', cells: [[2, 1, 1], [1, 1, 0], [0, 1, 1]], states: { '0,0': 'miss' }, note: 'one rotten source here, so one BFS; many sources ⇒ many BFS runs' }],
        },
      ],
    },
    {
      name: 'Multi-source BFS, one level per minute',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'Put every rotten orange in the queue at the start and count the fresh ones.',
        'Each level of the BFS is one minute: every rotten orange spreads at the same time.',
        'Rot a neighbour ⇒ fresh −= 1 and queue it.',
        'Stop when the queue empties or nothing fresh is left; fresh > 0 ⇒ −1.',
      ],
      code: c['P25-rotting-oranges'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'minute each cell rots (· = empty)',
              cells: [[0, 1, 2], [1, 2, '·'], ['·', 3, 4]],
              states: { '0,0': 'miss', '2,2': 'match' },
              note: 'the last fresh orange rots at minute 4 ⇒ 4',
            },
          ],
        },
      ],
    },
  ],

  'P25-walls-and-gates': [
    {
      name: 'BFS from each gate',
      time: 'O(g·mn)',
      space: 'O(mn)',
      points: [
        'BFS out from every gate separately; each room keeps the minimum distance seen.',
        'Correct, but g gates means g full BFS runs, and rooms are revisited from every gate.',
      ],
      code: c['P25-walls-and-gates#each'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: '∞ room · # wall · 0 gate',
              cells: [['∞', '#', 0, '∞'], ['∞', '∞', '∞', '#'], ['∞', '#', '∞', '#'], [0, '#', '∞', '∞']],
              states: { '0,2': 'active', '3,0': 'active' },
              note: 'two gates ⇒ two BFS runs',
            },
          ],
        },
      ],
    },
    {
      name: 'Multi-source BFS from all gates',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'Queue every gate at once.',
        'The first time the BFS reaches a room is from its nearest gate, so write the distance then.',
        '∞ doubles as “not visited yet”; no separate seen set is needed.',
        'Each room is written once.',
      ],
      code: c['P25-walls-and-gates'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'distances written in place',
              cells: [[3, '#', 0, 1], [2, 2, 1, '#'], [1, '#', 2, '#'], [0, '#', 3, 4]],
              states: { '0,2': 'active', '3,0': 'active', '1,1': 'match' },
              note: '(1,1) is 2 from both gates; whichever wave arrives first writes it',
            },
          ],
        },
      ],
    },
  ],

  'P25-snakes-and-ladders': [
    {
      name: 'BFS over squares 1…n²',
      time: 'O(n²)',
      space: 'O(n²)',
      best: true,
      points: [
        'Each die roll costs one move, so BFS from square 1 gives the fewest moves.',
        'From s, try s + 1 … s + 6; if that square has a snake or ladder, jump to its target.',
        'The only hard part is square → (row, col): rows count from the bottom, and every other row runs right to left.',
        'r, c = divmod(s − 1, n); row = n − 1 − r; col = c if r is even else n − 1 − c.',
      ],
      code: c['P25-snakes-and-ladders'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'square numbers on a 4 × 4 board',
              cells: [[16, 15, 14, 13], [9, 10, 11, 12], [8, 7, 6, 5], [1, 2, 3, 4]],
              states: { '3,0': 'active', '0,0': 'match', '2,0': 'active', '2,3': 'active' },
              note: 'square 5 is at the right of row 2 from the bottom; square 8 wraps back to the left',
            },
          ],
        },
      ],
    },
  ],

  'P25-word-ladder': [
    {
      name: 'Compare every pair of words',
      time: 'O(N²·L)',
      space: 'O(N²)',
      points: [
        'Two words are neighbours when they differ in exactly one letter.',
        'Build the graph by comparing every pair, then BFS from begin_word.',
        'With 5 000 words that is 12.5 million comparisons before the search starts.',
      ],
      code: c['P25-word-ladder#pairs'],
      diagrams: [
        { kind: 'cells', rows: [{ caption: 'shortest chain', cells: ['hit', 'hot', 'dot', 'dog', 'cog'], states: { 4: 'match' }, note: '5 words' }] },
      ],
    },
    {
      name: 'Wildcard buckets and BFS',
      time: 'O(N·L²)',
      space: 'O(N·L²)',
      best: true,
      points: [
        'Put each word in L buckets: "hot" goes in *ot, h*t and ho*.',
        'Words that share a bucket are exactly the one-letter neighbours.',
        'BFS from begin_word through the buckets; the level at end_word is the answer.',
        'Empty a bucket after expanding it once; nothing new can come out of it.',
        'end_word not in the list ⇒ 0.',
      ],
      code: c['P25-word-ladder'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'bucket h*t', cells: ['hot'] },
            { caption: 'bucket *ot', cells: ['hot', 'dot', 'lot'], states: { 1: 'active', 2: 'active' }, note: 'from hot, bucket *ot yields dot and lot in one lookup' },
          ],
        },
      ],
    },
    {
      name: 'Bidirectional BFS',
      time: 'O(N·L·26)',
      space: 'O(N)',
      trick: true,
      points: [
        'Search from both ends at once and stop when the two frontiers touch.',
        'Always expand the smaller frontier.',
        'With branching factor b and distance d, that is about 2·b^(d/2) nodes instead of b^d.',
        'A classic follow-up when the word list is large.',
      ],
      code: c['P25-word-ladder#bidirectional'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'from hit', cells: ['hit', 'hot', 'dot'], states: { 2: 'active' } },
            { caption: 'from cog', cells: ['cog', 'dog'], states: { 1: 'match' }, note: 'dot’s neighbour dog is in the other frontier ⇒ they meet ⇒ 5' },
          ],
        },
      ],
    },
  ],
}

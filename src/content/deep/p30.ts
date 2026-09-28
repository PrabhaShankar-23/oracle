/** Approach walkthroughs for P30 (Bit Manipulation & XOR Tricks). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p30-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p30: Record<string, ApproachWalkthrough[]> = {
  'P30-single-number': [
    {
      name: 'XOR everything',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'LeetCode requires O(1) extra space, so a count map is out.',
        'a ^ a = 0 and a ^ 0 = a, in any order.',
        'XOR all the numbers: every pair cancels, and the single one is left.',
      ],
      code: c['P30-single-number'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'nums', cells: [4, 1, 2, 1, 2], states: { 0: 'match', 1: 'dim', 2: 'dim', 3: 'dim', 4: 'dim' }, note: '4 ^ (1 ^ 1) ^ (2 ^ 2) = 4' }] }],
    },
  ],

  'P30-number-of-1-bits': [
    {
      name: 'Test all 32 positions',
      time: 'O(32)',
      space: 'O(1)',
      points: ['Add (n >> i) & 1 for i = 0 … 31.', 'Always 32 steps, however few bits are set.'],
      code: c['P30-number-of-1-bits#shift'],
      diagrams: [{ kind: 'cells', rows: [{ caption: '11 = 1011 (low 4 bits shown)', cells: [1, 0, 1, 1], states: { 0: 'match', 2: 'match', 3: 'match' }, note: '3 ones' }] }],
    },
    {
      name: 'Clear the lowest set bit',
      time: 'O(set bits)',
      space: 'O(1)',
      best: true,
      points: [
        'n & (n − 1) turns off exactly the lowest 1 bit.',
        'Count how many times you can do that before n is 0.',
        'The loop runs once per set bit, not 32 times (Brian Kernighan).',
      ],
      code: c['P30-number-of-1-bits'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'n', cells: ['1011', '1010', '1000', '0000'], states: { 3: 'match' }, note: '3 clears ⇒ 3' },
          ],
        },
      ],
    },
  ],

  'P30-counting-bits': [
    {
      name: 'Popcount each number',
      time: 'O(n log n)',
      space: 'O(n)',
      points: ['Run the clear-lowest-bit loop for every i from 0 to n.', 'Fine, but it ignores the answers already computed.'],
      code: c['P30-counting-bits#each'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'i = 0…5', cells: [0, 1, 1, 2, 1, 2] }] }],
    },
    {
      name: 'dp[i] = dp[i >> 1] + (i & 1)',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'i >> 1 drops the lowest bit, leaving a smaller number already solved.',
        'Add back that dropped bit (i & 1).',
        'One addition per number: linear, with no built-in popcount.',
      ],
      code: c['P30-counting-bits'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'dp[0…5]', cells: [0, 1, 1, 2, 1, 2], states: { 2: 'active', 5: 'match' }, note: '5 = 101 ⇒ dp[2] (10) + 1 = 2' },
          ],
        },
      ],
    },
  ],

  'P30-reverse-bits': [
    {
      name: 'Shift out, shift in, 32 times',
      time: 'O(32)',
      space: 'O(1)',
      best: true,
      points: [
        'Each step: res = (res << 1) | (n & 1), then n >>= 1.',
        'n’s lowest bit becomes res’s next bit, so the order reverses by itself.',
        'Exactly 32 steps, so leading zeros end up at the bottom.',
        'Trap: in Java use the unsigned shift >>>.',
      ],
      code: c['P30-reverse-bits'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'n (8 bits shown)', cells: [0, 0, 0, 0, 1, 0, 1, 1] },
            { caption: 'res', cells: [1, 1, 0, 1, 0, 0, 0, 0], states: { 0: 'match', 1: 'match', 3: 'match' } },
          ],
        },
      ],
    },
    {
      name: 'Swap halves, bytes, nibbles…',
      time: 'O(1): 5 steps',
      space: 'O(1)',
      trick: true,
      points: [
        'Reverse by swapping ever-smaller blocks: 16-bit halves, then bytes, nibbles, pairs, single bits.',
        'Each swap is one mask-shift-or line.',
        'The follow-up “the function is called many times” wants this (or a byte lookup table).',
      ],
      code: c['P30-reverse-bits#masks'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'start (8 bits shown)', cells: [0, 0, 0, 0, 1, 0, 1, 1] },
            { caption: 'swap nibbles', cells: [1, 0, 1, 1, 0, 0, 0, 0] },
            { caption: 'swap pairs', cells: [1, 1, 1, 0, 0, 0, 0, 0] },
            { caption: 'swap bits', cells: [1, 1, 0, 1, 0, 0, 0, 0], states: { 0: 'match', 1: 'match', 3: 'match' }, note: 'reversed' },
          ],
        },
      ],
    },
  ],

  'P30-single-number-ii': [
    {
      name: 'Count each bit mod 3',
      time: 'O(32·n)',
      space: 'O(1)',
      points: [
        'LeetCode requires linear time and O(1) space, so no count map.',
        'For each of the 32 bit positions, count how many numbers have it set.',
        'Numbers seen three times add a multiple of 3; count % 3 is the single number’s bit.',
        'Restore the sign at the end in Python.',
      ],
      code: c['P30-single-number-ii#bits'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: '[2, 2, 3, 2] · bit 1 count', cells: [1, 1, 1, 1], note: '4 % 3 = 1' },
            { caption: 'bit 0 count', cells: [0, 0, 1, 0], note: '1 % 3 = 1 ⇒ answer 11 = 3' },
          ],
        },
      ],
    },
    {
      name: 'Two-variable mod-3 counter',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'ones and twos hold, per bit, whether that bit has been seen once or twice (mod 3).',
        'ones = (ones ^ x) & ~twos; then twos = (twos ^ x) & ~ones.',
        'On the third sighting both clear; what remains in ones is the single number.',
        'Trap: update ones first, and use the new ones when updating twos.',
      ],
      code: c['P30-single-number-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'x', cells: [2, 2, 3, 2] },
            { caption: 'ones', cells: [2, 0, 1, 3], states: { 3: 'match' } },
            { caption: 'twos', cells: [0, 2, 0, 0], note: 'ones = 3' },
          ],
        },
      ],
    },
  ],

  'P30-sum-of-two-integers': [
    {
      name: 'XOR for the sum, AND for the carry',
      time: 'O(32)',
      space: 'O(1)',
      best: true,
      points: [
        'a ^ b adds without carrying; (a & b) << 1 is the carry.',
        'Repeat with those two until the carry is 0: a ripple-carry adder.',
        'Python ints never overflow, so mask to 32 bits each step and convert back to signed at the end.',
      ],
      code: c['P30-sum-of-two-integers'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'a ^ b', cells: ['0110', '0100', '0000', '1000'], note: '5 + 3' },
            { caption: 'carry', cells: ['0010', '0100', '1000', '0000'], states: { 3: 'match' }, note: 'carry 0 ⇒ 1000 = 8' },
          ],
        },
      ],
    },
  ],
}

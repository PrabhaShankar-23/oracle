/** Approach walkthroughs for P40 (DP — Interval / Palindrome). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p40-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p40: Record<string, ApproachWalkthrough[]> = {
  'P40-longest-palindromic-substring': [
    {
      name: 'Table pal[i][j]',
      time: 'O(n²)',
      space: 'O(n²)',
      state: '`pal[i][j]` = whether `s[i..j]` is a palindrome, filled `i` from right to left; best `start`, `length`.',
      invariant: 'When `pal[i][j]` is filled, `pal[i+1][j−1]` (the inside) is already final, so each cell is correct when written.',
      points: [
        's[i..j] is a palindrome when s[i] == s[j] and the inside s[i + 1..j − 1] is one (or is ≤ 1 long).',
        'Fill i from right to left so the inside is ready.',
        'Track the longest true cell.',
        'Quadratic memory for an answer that needs none.',
      ],
      code: c['P40-longest-palindromic-substring#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 's = "babad"',
              cells: ['b', 'a', 'b', 'a', 'd'],
              states: { 0: 'match', 1: 'active', 2: 'match' },
              span: { from: 0, to: 2, label: 'b = b and "a" ⇒ true' },
              note: 'pal[0][2] = true ⇒ "bab"',
            },
          ],
        },
      ],
    },
    {
      name: 'Expand around each centre',
      time: 'O(n²)',
      space: 'O(1)',
      best: true,
      points: [
        'Every palindrome has a centre: a letter (odd length) or a gap (even length).',
        'There are 2n − 1 centres. Grow l and r outward while s[l] == s[r].',
        'Keep the longest; slice once at the end.',
        'Same time as the table, and no memory.',
      ],
      code: c['P40-longest-palindromic-substring'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'centre at index 1',
              cells: ['b', 'a', 'b', 'a', 'd'],
              pointers: [
                { at: 0, label: 'l' },
                { at: 1, label: 'centre', tone: 'secondary' },
                { at: 2, label: 'r' },
              ],
              states: { 0: 'match', 1: 'active', 2: 'match' },
              note: 'b = b ⇒ grow · next l = −1 ⇒ stop ⇒ "bab"',
            },
          ],
        },
      ],
    },
    {
      name: 'Manacher’s algorithm',
      time: 'O(n)',
      space: 'O(n)',
      state: 'Transformed string `t`; `radius[i]`; `center`, `right` of the rightmost palindrome seen.',
      invariant: 'For `i < right`, the mirror `2·center − i` gives a radius `i` is guaranteed to reach; `right` only moves forward, so total expansion is linear.',
      trick: true,
      points: [
        'Put # between letters (and ^, $ at the ends) so every palindrome has odd length.',
        'radius[i] = how far the palindrome centred at i reaches.',
        'Inside the rightmost palindrome seen, the mirror 2·centre − i gives a head start for radius[i].',
        'The right edge only moves forward, so the total expansion is O(n).',
        'Rarely coded in full in an interview, but naming it as the O(n) answer is a strong signal.',
      ],
      code: c['P40-longest-palindromic-substring#manacher'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 't (without ^ $)', cells: ['#', 'b', '#', 'a', '#', 'b', '#', 'a', '#', 'd', '#'] },
            {
              caption: 'radius',
              cells: [0, 1, 0, 3, 0, 3, 0, 1, 0, 1, 0],
              states: { 3: 'match', 5: 'active' },
              note: 'radius 3 at "a" ⇒ "bab" · at index 5 the mirror (index 1) gives a head start of 1, then it expands to 3',
            },
          ],
        },
      ],
    },
  ],

  'P40-palindromic-substrings': [
    {
      name: 'Table pal[i][j], count trues',
      time: 'O(n²)',
      space: 'O(n²)',
      state: '`pal[i][j]` filled right to left; `count`.',
      invariant: 'Every true cell is a distinct palindromic substring `s[i..j]`, counted once when it is filled.',
      points: [
        'Same table as Longest Palindromic Substring.',
        'Every true cell is one palindromic substring, so count them.',
        'Works, but stores n² booleans to produce one number.',
      ],
      code: c['P40-palindromic-substrings#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 's = "aaa"',
              cells: ['a', 'a', 'a'],
              span: { from: 0, to: 2, label: '3 singles + 2 pairs + 1 triple' },
              note: '6',
            },
          ],
        },
      ],
    },
    {
      name: 'Expand around each centre, counting',
      time: 'O(n²)',
      space: 'O(1)',
      best: true,
      points: [
        'Same 2n − 1 centres.',
        'Each successful expansion step is one more palindrome: count += 1.',
        'Stop at the first mismatch; nothing wider around that centre can be a palindrome.',
      ],
      code: c['P40-palindromic-substrings'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'centre at index 1 of "aaa"',
              cells: ['a', 'a', 'a'],
              pointers: [
                { at: 0, label: 'l' },
                { at: 2, label: 'r' },
              ],
              states: { 0: 'match', 1: 'active', 2: 'match' },
              note: '"a" then "aaa" ⇒ +2 · all centres ⇒ 6',
            },
          ],
        },
      ],
    },
  ],

  'P40-burst-balloons': [
    {
      name: 'Memo over which balloons remain',
      time: 'O(2ⁿ·n)',
      space: 'O(2ⁿ)',
      state: '`best(mask)` = max coins from the balloons still standing in `mask`, cached per mask.',
      invariant: 'The coins for bursting `i` next depend only on its current neighbours, which `mask` determines, so `best(mask)` is a function of `mask` alone.',
      points: [
        'State = the set of balloons still standing (a bitmask). Try bursting each one next.',
        'Its coins depend on its current neighbours, which the mask tells you.',
        'Correct, but 2ⁿ states: fine for n ≈ 15, hopeless for 300.',
        'Choosing which balloon goes first leaves the two sides coupled. That is why this needs the whole set as state.',
      ],
      code: c['P40-burst-balloons#bitmask'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'burst 1 first in [3, 1, 5, 8]',
              cells: [3, 1, 5, 8],
              states: { 1: 'miss' },
              note: '3 · 1 · 5 = 15, and now 3 and 5 are neighbours: the halves interact',
            },
          ],
        },
      ],
    },
    {
      name: 'Interval DP on the last burst',
      time: 'O(n³)',
      space: 'O(n²)',
      best: true,
      points: [
        'Pad with 1 at both ends. dp[i][j] = best coins from bursting everything strictly between i and j.',
        'Pick k as the LAST balloon burst in (i, j): at that moment its neighbours are exactly a[i] and a[j].',
        'dp[i][j] = max over k of dp[i][k] + a[i]·a[k]·a[j] + dp[k][j].',
        'The two sides are now independent. Fill by increasing interval length.',
        'Trap: choosing the FIRST burst instead leaves the halves coupled and the DP breaks.',
      ],
      code: c['P40-burst-balloons'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'padded [1, 3, 1, 5, 8, 1]',
              cells: [1, 3, 1, 5, 8, 1],
              pointers: [
                { at: 0, label: 'i' },
                { at: 4, label: 'k last', tone: 'secondary' },
                { at: 5, label: 'j' },
              ],
              states: { 4: 'match' },
              span: { from: 1, to: 3, label: 'dp[0][4] = 159' },
              note: '159 + 1 · 8 · 1 + dp[4][5] (0) = 167',
            },
          ],
        },
      ],
    },
  ],
}

/** Approach walkthroughs for P37 (DP — LCS Family). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p37-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p37: Record<string, ApproachWalkthrough[]> = {
  'P37-longest-common-subsequence': [
    {
      name: 'Full 2D table',
      time: 'O(mn)',
      space: 'O(mn)',
      state: '`dp[i][j]` = LCS length of `a[:i]` and `b[:j]`, the whole table kept.',
      invariant: 'When `dp[i][j]` is written, the three cells it reads are final; keeping every row lets you walk back from `dp[m][n]` to rebuild the subsequence.',
      points: [
        'dp[i][j] = LCS of a[:i] and b[:j]; row 0 and column 0 are 0.',
        'Match ⇒ dp[i − 1][j − 1] + 1. Mismatch ⇒ max(dp[i − 1][j], dp[i][j − 1]).',
        'Keeping the whole table lets you walk back to recover the subsequence itself.',
      ],
      code: c['P37-longest-common-subsequence#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'b →', cells: ['·', 'a', 'c', 'e'] },
            { caption: 'a', cells: [0, 1, 1, 1], states: { 1: 'match' } },
            { caption: 'b', cells: [0, 1, 1, 1] },
            { caption: 'c', cells: [0, 1, 2, 2], states: { 2: 'match' } },
            { caption: 'd', cells: [0, 1, 2, 2] },
            { caption: 'e', cells: [0, 1, 2, 3], states: { 3: 'match' }, note: '"abcde" vs "ace" ⇒ 3' },
          ],
        },
      ],
    },
    {
      name: 'Two rolling rows',
      time: 'O(mn)',
      space: 'O(min(m, n))',
      best: true,
      points: [
        'Each cell reads only the row above and the cell to its left.',
        'So keep prev and cur, over the shorter string.',
        'Swap the strings first so the rows are as short as possible.',
        'You lose the ability to rebuild the subsequence; the length is all that is asked.',
      ],
      code: c['P37-longest-common-subsequence'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'prev (row "d")', cells: [0, 1, 2, 2] },
            {
              caption: 'cur (row "e")',
              cells: [0, 1, 2, 3],
              states: { 3: 'match' },
              note: 'e = e ⇒ prev[2] + 1 = 3',
            },
          ],
        },
      ],
    },
  ],

  'P37-edit-distance': [
    {
      name: 'Full 2D table',
      time: 'O(mn)',
      space: 'O(mn)',
      state: '`dp[i][j]` = fewest edits turning `a[:i]` into `b[:j]`; row 0 = inserts, column 0 = deletes.',
      invariant: 'Each cell is final when written: a match copies the diagonal, a mismatch takes 1 + the cheapest of replace, delete and insert.',
      points: [
        'dp[i][j] = the fewest edits turning a[:i] into b[:j].',
        'Row 0 is j inserts; column 0 is i deletes.',
        'Match ⇒ dp[i − 1][j − 1]. Mismatch ⇒ 1 + min(replace ↖, delete ↑, insert ←).',
      ],
      code: c['P37-edit-distance#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'b →', cells: ['·', 'r', 'o', 's'] },
            { caption: '·', cells: [0, 1, 2, 3] },
            { caption: 'h', cells: [1, 1, 2, 3] },
            { caption: 'o', cells: [2, 2, 1, 2], states: { 2: 'active' } },
            { caption: 'r', cells: [3, 2, 2, 2] },
            { caption: 's', cells: [4, 3, 3, 2] },
            { caption: 'e', cells: [5, 4, 4, 3], states: { 3: 'match' }, note: '"horse" → "ros" ⇒ 3' },
          ],
        },
      ],
    },
    {
      name: 'Rolling rows',
      time: 'O(mn)',
      space: 'O(n)',
      best: true,
      points: [
        'Same recurrence; only the previous row and the current one are alive.',
        'Seed prev = 0, 1, …, n (pure inserts) and start each row with i (pure deletes).',
        'Getting that seeding right is half the problem.',
      ],
      code: c['P37-edit-distance'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'prev (row "s")', cells: [4, 3, 3, 2] },
            {
              caption: 'cur (row "e")',
              cells: [5, 4, 4, 3],
              states: { 0: 'active', 3: 'match' },
              note: 'cur[0] = 5 deletes · e ≠ s ⇒ 1 + min(3, 2, 4) = 3',
            },
          ],
        },
      ],
    },
  ],

  'P37-interleaving-string': [
    {
      name: 'Memoised (i, j)',
      time: 'O(mn)',
      space: 'O(mn)',
      state: '`ok(i, j)` cached per pair; the next character of `c` is always `c[i + j]`.',
      invariant: '`ok(i, j)` is True exactly when `a[i:]` and `b[j:]` interleave to `c[i + j:]`; the index into `c` is fixed by `i + j`.',
      points: [
        'The next character of c is always c[i + j], so (i, j) is the whole state.',
        'ok(i, j): take a[i] if it matches, or b[j] if it matches.',
        'Length check first: len(a) + len(b) ≠ len(c) ⇒ false.',
      ],
      code: c['P37-interleaving-string#memo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'a = "ab"', cells: ['a', 'b'], states: { 0: 'match', 1: 'match' } },
            { caption: 'b = "cd"', cells: ['c', 'd'], states: { 0: 'active', 1: 'active' } },
            {
              caption: 'c = "acbd"',
              cells: ['a', 'c', 'b', 'd'],
              states: { 0: 'match', 1: 'active', 2: 'match', 3: 'active' },
              note: 'k = i + j: a, then c, then b, then d ⇒ true',
            },
          ],
        },
      ],
    },
    {
      name: 'One row, k = i + j',
      time: 'O(mn)',
      space: 'O(n)',
      best: true,
      points: [
        'dp[j] (for the current row i) = a[:i] and b[:j] interleave to c[:i + j].',
        'From above: dp[j] and a[i − 1] == c[i + j − 1]. From the left: dp[j − 1] and b[j − 1] == c[i + j − 1].',
        'Recognising k = i + j is what removes the third index.',
        'Trap: return false at once if the lengths do not add up.',
      ],
      code: c['P37-interleaving-string'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'b →', cells: ['·', 'c', 'd'] },
            { caption: 'i = 0', cells: ['T', 'F', 'F'] },
            { caption: 'i = 1 (a)', cells: ['T', 'T', 'F'] },
            { caption: 'i = 2 (b)', cells: ['F', 'T', 'T'], states: { 2: 'match' }, note: '"ab" + "cd" → "acbd" ⇒ dp[2] = true' },
          ],
        },
      ],
    },
  ],

  'P37-distinct-subsequences': [
    {
      name: '2D table',
      time: 'O(mn)',
      space: 'O(mn)',
      state: '`dp[i][j]` = ways `s[:i]` forms `t[:j]`; column 0 is all 1.',
      invariant: '`s[i − 1]` can always be skipped (`dp[i−1][j]`); when it equals `t[j − 1]` it can also be used (`+ dp[i−1][j−1]`), and the two cases never overlap.',
      points: [
        'dp[i][j] = ways s[:i] forms t[:j]; an empty t is formed one way.',
        'Always allowed: skip s[i − 1] ⇒ dp[i − 1][j].',
        'If s[i − 1] == t[j − 1], also use it ⇒ + dp[i − 1][j − 1].',
      ],
      code: c['P37-distinct-subsequences#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 't →', cells: ['·', 'b', 'a', 'g'] },
            { caption: 'after "babg"', cells: [1, 2, 1, 1] },
            { caption: 'after "babgba"', cells: [1, 3, 4, 1] },
            { caption: 'after "babgbag"', cells: [1, 3, 4, 5], states: { 3: 'match' }, note: '"bag" appears 5 ways' },
          ],
        },
      ],
    },
    {
      name: 'One row, loop downward',
      time: 'O(mn)',
      space: 'O(n)',
      best: true,
      points: [
        'dp[j] = ways to form t[:j] so far.',
        'For each character of s, loop j downward: if t[j − 1] matches, dp[j] += dp[j − 1].',
        'Downward keeps dp[j − 1] from the previous character, so one character is not used twice. It is the same reason as in 0/1 knapsack.',
      ],
      code: c['P37-distinct-subsequences'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'before the last "g"', cells: [1, 3, 4, 1] },
            {
              caption: 'read "g": j = 3 matches',
              cells: [1, 3, 4, 5],
              states: { 2: 'active', 3: 'match' },
              note: 'dp[3] += dp[2] ⇒ 1 + 4 = 5',
            },
          ],
        },
      ],
    },
  ],

  'P37-regular-expression-matching': [
    {
      name: 'Memoised recursion',
      time: 'O(mn)',
      space: 'O(mn)',
      state: '`match(i, j)` = whether `s[i:]` matches `p[j:]`, cached per pair.',
      invariant: 'With `x*` next, the pattern either skips it or uses one more copy when `s[i]` matches; otherwise one character must match and both move on.',
      points: [
        'match(i, j) = s[i:] matches p[j:].',
        'first = s[i] exists and equals p[j] or p[j] is ".".',
        'If p[j + 1] is "*": skip "x*" (match(i, j + 2)), or use one more copy (first and match(i + 1, j)).',
        'Otherwise first and match(i + 1, j + 1).',
        'Top-down reads like the definition; the table is the same states in order.',
      ],
      code: c['P37-regular-expression-matching#memo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 's = "aab"', cells: ['a', 'a', 'b'], states: { 0: 'match', 1: 'match', 2: 'match' } },
            {
              caption: 'p = "c*a*b"',
              cells: ['c', '*', 'a', '*', 'b'],
              states: { 0: 'dim', 1: 'dim', 2: 'active', 3: 'active', 4: 'match' },
              note: 'c* takes zero · a* takes two · b = b ⇒ true',
            },
          ],
        },
      ],
    },
    {
      name: '2D table over both prefixes',
      time: 'O(mn)',
      space: 'O(mn)',
      best: true,
      points: [
        'dp[i][j] = s[:i] matches p[:j]; dp[0][0] = true.',
        'Seed row 0: dp[0][j] = dp[0][j − 2] when p[j − 1] is "*", so "a*b*" matches "".',
        '"*": zero copies dp[i][j − 2], or one more dp[i − 1][j] if p[j − 2] matches s[i − 1].',
        'Otherwise the characters must match and dp[i − 1][j − 1].',
        'Trap: forgetting the row-0 seeding fails every pattern that can match the empty string.',
      ],
      code: c['P37-regular-expression-matching'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'p →', cells: ['·', 'c', '*', 'a', '*', 'b'] },
            { caption: 'row 0 ("")', cells: ['T', 'F', 'T', 'F', 'T', 'F'], states: { 2: 'active', 4: 'active' } },
            { caption: 'row 3 ("aab")', cells: ['F', 'F', 'F', 'F', 'F', 'T'], states: { 5: 'match' }, note: 'c* and c*a* match "" · dp[3][5] = true' },
          ],
        },
      ],
    },
  ],
}

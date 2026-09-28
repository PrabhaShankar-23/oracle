/** Approach walkthroughs for P31 (Backtracking — Subsets & Combinations). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p31-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p31: Record<string, ApproachWalkthrough[]> = {
  'P31-subsets': [
    {
      name: 'Bitmask over 0 … 2ⁿ − 1',
      time: 'O(n·2ⁿ)',
      space: 'O(1) extra',
      points: [
        'Each number from 0 to 2ⁿ − 1 is one subset: bit i set ⇔ take nums[i].',
        'No recursion, but no pruning either. It does not carry over to Subsets II or Combination Sum.',
      ],
      code: c['P31-subsets#bitmask'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'masks for [1, 2]', cells: ['00', '01', '10', '11'] }, { caption: 'subsets', cells: ['∅', '1', '2', '12'] }] }],
    },
    {
      name: 'Include or exclude each number',
      time: 'O(n·2ⁿ)',
      space: 'O(n)',
      best: true,
      points: [
        'At index i, branch twice: take nums[i], or skip it.',
        'At i = n, the path is one subset; copy it.',
        'Push, recurse, pop: the path is reused, not rebuilt.',
      ],
      code: c['P31-subsets'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'left = take, right = skip · [1, 2]',
              nodes: ['∅', '1', '∅', '12', '1', '2', '∅'],
              states: { 3: 'match', 4: 'match', 5: 'match', 6: 'match' },
              pointers: [{ at: 1, label: '+1' }, { at: 2, label: '−1' }],
              note: 'the 4 leaves are the 4 subsets',
            },
          ],
        },
      ],
    },
  ],

  'P31-subsets-ii': [
    {
      name: 'All subsets, dedupe with a set',
      time: 'O(n·2ⁿ)',
      space: 'O(n·2ⁿ)',
      points: [
        'Sort, generate every subset, and keep a set of value tuples.',
        'Duplicates are still generated, then thrown away.',
      ],
      code: c['P31-subsets-ii#set'],
      diagrams: [{ kind: 'cells', rows: [{ caption: '[1, 2, 2]: masks 010 and 100', cells: ['[2]', '[2]'], states: { 1: 'miss' }, note: 'same values ⇒ one is discarded' }] }],
    },
    {
      name: 'Sort, skip equal siblings',
      time: 'O(n·2ⁿ)',
      space: 'O(n)',
      best: true,
      points: [
        'Sort so equal values sit together.',
        'Every node of the recursion is a subset: record it on entry.',
        'In the loop, skip nums[j] when it equals nums[j − 1] and j > start. That value was already tried at this depth.',
        'A repeat along one path (like 2, 2) is still allowed; only repeated siblings are cut.',
      ],
      code: c['P31-subsets-ii'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: '[1, 2, 2]: every node is recorded',
              nodes: ['∅', '1', '2', '12', null, '22', null, '122'],
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match', 5: 'match', 7: 'match' },
              note: '6 subsets · the second 2 is never a sibling of the first',
            },
          ],
        },
      ],
    },
  ],

  'P31-combination-sum': [
    {
      name: 'Recurse from j, not j + 1',
      time: 'O(n^(T/min))',
      space: 'O(T/min)',
      best: true,
      points: [
        'dfs(i, remaining): try every candidate from index i onward.',
        'Recurse with the same j, so a number can be reused.',
        'Never going back below i keeps each combination in one order, so no duplicates.',
        'remaining = 0 ⇒ record the path.',
      ],
      code: c['P31-combination-sum'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'candidates [2, 3, 6, 7], target 7', cells: [2, 2, 3], states: { 0: 'match', 1: 'match', 2: 'match' }, note: '2 reused, then 3 · never 3 then 2' },
            { caption: 'second answer', cells: [7], states: { 0: 'match' } },
          ],
        },
      ],
    },
  ],

  'P31-combination-sum-ii': [
    {
      name: 'All subsets, filter by sum',
      time: 'O(n·2ⁿ)',
      space: 'O(n·2ⁿ)',
      points: [
        'Sort, try every subset, keep those that sum to target in a set.',
        'No pruning: every subset is built even after it has overshot.',
      ],
      code: c['P31-combination-sum-ii#filter'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'sorted', cells: [1, 1, 2, 5, 6, 7, 10], note: '2⁷ = 128 subsets checked' }] }],
    },
    {
      name: 'Sort, skip siblings, stop on overshoot',
      time: 'O(2ⁿ)',
      space: 'O(n)',
      best: true,
      points: [
        'Each element is used at most once ⇒ recurse with j + 1.',
        'Skip equal siblings (j > i and same value) so each multiset appears once.',
        'Sorted ⇒ once a candidate exceeds remaining, break: nothing later fits.',
      ],
      code: c['P31-combination-sum-ii'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'target 8 · sorted', cells: [1, 1, 2, 5, 6, 7, 10], states: { 1: 'dim', 6: 'miss' }, note: 'the second 1 is skipped at depth 0 · 10 > 8 ⇒ break' },
            { caption: 'answers', cells: ['116', '125', '17', '26'], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' } },
          ],
        },
      ],
    },
  ],

  'P31-letter-combinations-of-a-phone-number': [
    {
      name: 'Build level by level',
      time: 'O(4ⁿ·n)',
      space: 'O(4ⁿ·n)',
      points: [
        'Start with [""]; for each digit, extend every string by each of its letters.',
        'Short, but it keeps every partial string in memory at once.',
      ],
      code: c['P31-letter-combinations-of-a-phone-number#iterative'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'after 2', cells: ['a', 'b', 'c'] },
            { caption: 'after 3', cells: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'], note: '"23" ⇒ 9' },
          ],
        },
      ],
    },
    {
      name: 'Depth = digit index',
      time: 'O(4ⁿ·n)',
      space: 'O(n)',
      best: true,
      points: [
        'dfs(i) picks a letter for digit i, recurses to i + 1, then undoes it.',
        'A path of full length is automatically a complete answer: no checks needed.',
        'Only one partial string lives at a time.',
      ],
      code: c['P31-letter-combinations-of-a-phone-number'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'path at depth 2', cells: ['b', 'e'], states: { 0: 'active', 1: 'match' }, note: 'record "be", pop e, try f' }] }],
    },
  ],

  'P31-generate-parentheses': [
    {
      name: 'Generate all, then validate',
      time: 'O(2^(2n)·n)',
      space: 'O(n)',
      points: ['Every string of 2n brackets, kept if its running balance never drops below 0 and ends at 0.', 'n = 2: 16 strings for 2 answers.'],
      code: c['P31-generate-parentheses#all'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'n = 2: some of the 16', cells: ['))((', '()()', '(())', ')()('], states: { 0: 'miss', 1: 'match', 2: 'match', 3: 'miss' } }] }],
    },
    {
      name: 'Only extend valid prefixes',
      time: 'O(4ⁿ / √n)',
      space: 'O(n)',
      best: true,
      points: [
        'Add "(" while opened < n.',
        'Add ")" only while closed < opened.',
        'Every partial string stays a valid prefix, so every leaf is an answer: nothing to validate.',
        'The number of leaves is the Catalan number.',
      ],
      code: c['P31-generate-parentheses'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'n = 2, starting from "("',
              nodes: ['(', '((', '()', '(()', null, '()(', null, '(())', null, null, null, '()()'],
              states: { 7: 'match', 11: 'match' },
              note: '"((" cannot open again, "()" cannot close again ⇒ only 2 leaves',
            },
          ],
        },
      ],
    },
  ],

  'P31-palindrome-partitioning': [
    {
      name: 'Cut only at palindromic prefixes',
      time: 'O(n·2ⁿ)',
      space: 'O(n)',
      best: true,
      points: [
        'From start, try every end; recurse only if s[start:end] is a palindrome.',
        'Reaching the end of s ⇒ the path is one partition.',
        'The palindrome check is the pruning.',
      ],
      code: c['P31-palindrome-partitioning'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: '"aab": each node is the next piece',
              nodes: ['·', 'a', 'aa', 'a', null, 'b', null, 'b'],
              states: { 5: 'match', 7: 'match' },
              note: '"ab" and "aab" are not palindromes ⇒ never tried · [a, a, b], [aa, b]',
            },
          ],
        },
      ],
    },
    {
      name: 'Precompute a palindrome table',
      time: 'O(n·2ⁿ)',
      space: 'O(n²)',
      trick: true,
      points: [
        'The same substring is checked many times across branches.',
        'Fill pal[i][j] once (the Longest Palindromic Substring table); each check becomes O(1).',
        'A good follow-up answer: “cache the palindrome checks”.',
      ],
      code: c['P31-palindrome-partitioning#table'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'pal[0][0…2]', cells: ['T', 'T', 'F'] },
            { caption: 'pal[1][0…2]', cells: ['·', 'T', 'F'] },
            { caption: 'pal[2][0…2]', cells: ['·', '·', 'T'], note: 'every check is now a lookup' },
          ],
        },
      ],
    },
  ],
}

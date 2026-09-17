/** Approach walkthroughs for P03 (Sliding Window — Fixed Size). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p03-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p03: Record<string, ApproachWalkthrough[]> = {
  'P03-permutation-in-string': [
    {
      name: 'Re-compare 26 counts',
      time: 'O(26n)',
      space: 'O(1)',
      points: [
        'Count the 26 letters of s1.',
        'Slide a window of len(s1) across s2, keeping its own counts.',
        'After each slide, compare all 26 buckets.',
        'Correct, but the comparison redoes the same work every step.',
      ],
      code: c['P03-permutation-in-string#recount'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 's1 = "ab" · window at 0',
              cells: ['e', 'i', 'd', 'b', 'a', 'o', 'o', 'o'],
              span: { from: 0, to: 1, label: 'window' },
              note: '"ei" — counts differ, and all 26 were compared',
            },
            {
              caption: 'window at 3',
              cells: ['e', 'i', 'd', 'b', 'a', 'o', 'o', 'o'],
              span: { from: 3, to: 4, label: 'window' },
              states: { 3: 'match', 4: 'match' },
              note: '"ba" matches — after 26 comparisons per slide',
            },
          ],
        },
      ],
    },
    {
      name: 'Matched counter',
      time: 'O(n)',
      space: 'O(1)',
      best: true,
      points: [
        'Keep diff = count(s1) − count(window) and a matched counter of buckets sitting at zero.',
        'A slide changes exactly two letters: one enters, one leaves.',
        'Update only those two buckets, adjusting matched as each hits or leaves zero.',
        'matched == 26 ⇒ the window is a permutation of s1.',
        'Constant work per slide instead of 26 comparisons.',
      ],
      code: c['P03-permutation-in-string'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'window at 1 · one letter in, one out',
              cells: ['e', 'i', 'd', 'b', 'a', 'o', 'o', 'o'],
              pointers: [{ at: 2, label: 'in', tone: 'success' }, { at: 0, label: 'out', tone: 'error' }],
              span: { from: 1, to: 2, label: 'window' },
              note: "only 'd' and 'e' change ⇒ matched moves by at most 2",
            },
            {
              caption: 'window at 3',
              cells: ['e', 'i', 'd', 'b', 'a', 'o', 'o', 'o'],
              span: { from: 3, to: 4, label: 'window' },
              states: { 3: 'match', 4: 'match' },
              note: 'matched == 26 ⇒ True',
            },
          ],
        },
      ],
    },
  ],

  'P03-substring-with-concatenation-of-all-words': [
    {
      name: 'Re-count at every index',
      time: 'O(n·k·w)',
      space: 'O(k)',
      points: [
        'Try every start index independently.',
        'Split the next k words of length w and count them against need.',
        'An unknown or over-used word rejects that start.',
        'Every index re-splits and re-counts the same words.',
      ],
      code: c['P03-substring-with-concatenation-of-all-words#recount'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'words = [foo, bar] · w = 3, k = 2',
              cells: ['b', 'a', 'r', 'f', 'o', 'o', 't', 'h', 'e'],
              span: { from: 0, to: 5, label: '6 chars = 2 words' },
              states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match', 4: 'match', 5: 'match' },
              note: "'bar' + 'foo' ✓ · then start over at index 1, 2, 3 …",
            },
          ],
        },
      ],
    },
    {
      name: 'w word-aligned windows',
      time: 'O(n·w)',
      space: 'O(k)',
      best: true,
      points: [
        'Every valid start is word-aligned, so run w windows, one per offset 0…w−1.',
        'Inside an offset, step a whole word at a time and keep a count map.',
        'An unknown word resets the window past it.',
        'Too many copies of a word shrinks the window from the left, by words.',
        'Exactly k words in the window ⇒ record the start, then shrink by one word.',
      ],
      code: c['P03-substring-with-concatenation-of-all-words'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'offset 0 — the string read as words',
              cells: ['bar', 'foo', 'the', 'foo', 'bar', 'man'],
              span: { from: 0, to: 1, label: 'window' },
              states: { 0: 'match', 1: 'match' },
              note: 'seen == need ⇒ start 0',
            },
            {
              caption: 'slide one word',
              cells: ['bar', 'foo', 'the', 'foo', 'bar', 'man'],
              span: { from: 1, to: 2, label: 'window' },
              states: { 2: 'miss' },
              note: "'the' is not a word → drop everything and restart after it",
            },
            {
              caption: 'later in the same offset',
              cells: ['bar', 'foo', 'the', 'foo', 'bar', 'man'],
              span: { from: 3, to: 4, label: 'window' },
              states: { 3: 'match', 4: 'match' },
              note: 'start 9 · offsets 1 and 2 cover starts not divisible by w',
            },
          ],
        },
      ],
    },
  ],
}

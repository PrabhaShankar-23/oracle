/** Approach walkthroughs for P24 (Trie). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p24-code.json' with { type: 'json' }

const c = code as Record<string, string>

/** A trie of "cat", "car", "dog" drawn as a binary tree (every node here has at most two children). */
const TRIE = ['·', 'c', 'd', 'a', null, 'o', null, 't', 'r', null, null, 'g']

export const p24: Record<string, ApproachWalkthrough[]> = {
  'P24-implement-trie-prefix-tree': [
    {
      name: 'Nested dicts',
      time: 'O(L) per operation',
      space: 'O(total chars)',
      state: 'Each node is a dict `char → child`; the key `$` marks a word end.',
      invariant: 'The path from the root to a node spells a prefix; `$` in that node means the prefix is a whole inserted word.',
      points: [
        'Each node is a dict from character to child; a "$" key marks a complete word.',
        'insert walks and creates; search needs the walk to succeed and "$" at the end; startsWith only needs the walk.',
        'The shortest to write in Python.',
      ],
      code: c['P24-implement-trie-prefix-tree#dict'],
      diagrams: [{ kind: 'tree', rows: [{ caption: 'insert cat, car, dog', nodes: TRIE, states: { 7: 'match', 8: 'match', 11: 'match' }, note: 'green = "$" (a word ends here)' }] }],
    },
    {
      name: 'children[26] and is_end',
      time: 'O(L) per operation',
      space: 'O(total chars)',
      best: true,
      points: [
        'Each node has 26 child slots and an is_end flag.',
        'A root-to-node path spells a prefix; is_end says the prefix is also a word.',
        'search("ca") walks fine but is_end is false ⇒ false; startsWith("ca") ⇒ true.',
        'Fixed-size arrays: the classic form, and what Java or C++ would use.',
      ],
      code: c['P24-implement-trie-prefix-tree'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'walk "ca"',
              nodes: TRIE,
              pointers: [{ at: 3, label: 'end of walk' }],
              states: { 1: 'active', 3: 'active', 7: 'match', 8: 'match', 11: 'match' },
              note: 'a is not a word end ⇒ search false · startsWith true',
            },
          ],
        },
      ],
    },
  ],

  'P24-design-add-and-search-words-data-structure': [
    {
      name: 'Set of words, compare each',
      time: 'O(N·L) per search',
      space: 'O(total chars)',
      state: '`words` = every added word.',
      invariant: 'A pattern matches a stored word exactly when the lengths agree and every position is `.` or the same letter.',
      points: [
        'Store words in a set; a search with dots compares against every word of that length.',
        'Adding is O(L), but each search scans all N words.',
      ],
      code: c['P24-design-add-and-search-words-data-structure#set'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'search ".a." vs {cat, car, dog}', cells: ['cat', 'car', 'dog'], states: { 0: 'match', 1: 'match', 2: 'miss' } }] }],
    },
    {
      name: 'Trie with a branching DFS',
      time: 'O(L) typical, O(26^dots) worst',
      space: 'O(total chars)',
      best: true,
      points: [
        'Same trie as Implement Trie.',
        'A normal character is one step; "." forks into every child at that depth.',
        'Return true as soon as any branch reaches a word end.',
        'Dots are rare in practice, so most searches stay O(L).',
      ],
      code: c['P24-design-add-and-search-words-data-structure'],
      diagrams: [
        {
          kind: 'tree',
          rows: [
            {
              caption: 'search ".a."',
              nodes: TRIE,
              pointers: [{ at: 0, label: '"." forks' }],
              states: { 1: 'active', 2: 'miss', 3: 'active', 7: 'match' },
              note: 'd has no "a" ⇒ dead · c → a → "." ⇒ t is a word end ⇒ true',
            },
          ],
        },
      ],
    },
  ],

  'P24-word-search-ii': [
    {
      name: 'Word Search once per word',
      time: 'O(W · mn · 4^L)',
      space: 'O(L)',
      state: 'Current `word`; DFS position `(r, c)` and index `i`; visited cells marked `#`.',
      invariant: '`dfs(r, c, i)` is True exactly when `word[i:]` can be traced from `(r, c)` without reusing a marked cell; every mark is undone on the way back.',
      points: [
        'Run the single-word grid DFS for every word.',
        'Words that share a prefix redo the same grid walks again and again.',
        'Times out with thousands of words.',
      ],
      code: c['P24-word-search-ii#each'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'searching "oath", then "oat…" words again',
              cells: [['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']],
              states: { '0,0': 'active', '0,1': 'active', '1,1': 'active' },
            },
          ],
        },
      ],
    },
    {
      name: 'One grid DFS driven by a trie',
      time: 'O(mn · 4^L)',
      space: 'O(total chars)',
      best: true,
      points: [
        'Build a trie of all the words.',
        'DFS from each cell, carrying the matching trie node; stop as soon as the path is not a prefix.',
        'On reaching a word end, record it and remove it from the trie (no duplicates).',
        'Prune trie branches that become empty, so later searches skip them.',
        'Mark visited cells in place (#) and restore them on the way back.',
      ],
      code: c['P24-word-search-ii'],
      diagrams: [
        {
          kind: 'grid',
          rows: [
            {
              caption: 'words oath, pea, eat, rain',
              cells: [['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']],
              states: { '0,0': 'match', '0,1': 'match', '1,1': 'match', '2,1': 'match', '1,3': 'active', '1,2': 'active' },
              note: 'o → a → t → h ⇒ "oath" · e → a → t ⇒ "eat" · "pea", "rain" die at the trie',
            },
          ],
        },
      ],
    },
  ],
}

/** Approach walkthroughs for X3 (Design). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './x3-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const x3: Record<string, ApproachWalkthrough[]> = {
  'X3-lru-cache': [
    {
      name: 'OrderedDict',
      time: 'O(1) per operation',
      space: 'O(capacity)',
      state: '`data`: an OrderedDict ordered from least to most recently used.',
      invariant: 'Every `get` or `put` moves the key to the end, so the first key is always the least recently used, the one to evict.',
      points: [
        'An OrderedDict keeps keys in order: move_to_end on each use, popitem(last=False) to evict.',
        'Python’s LinkedHashMap. Fine in practice, but interviewers usually then ask you to build it.',
      ],
      code: c['X3-lru-cache#ordered'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'least recent → most recent', cells: [1, 3], note: 'after put 1, put 2, get 1, put 3 (evicts 2)' }] }],
    },
    {
      name: 'Hash map + doubly linked list',
      time: 'O(1) per operation',
      space: 'O(capacity)',
      best: true,
      points: [
        'The map finds a node in O(1); the list keeps recency order and moves a node in O(1).',
        'head.next is the most recent, tail.prev the least recent.',
        'get: move the node to the front. put: insert at the front; over capacity ⇒ drop tail.prev and its key.',
        'Dummy head and tail nodes remove every null check.',
        'The node stores its key, so eviction can delete it from the map.',
      ],
      code: c['X3-lru-cache'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'capacity 2 · after put 1, put 2, get 1', cells: ['head', 1, 2, 'tail'], states: { 1: 'active' } },
            { caption: 'put 3', cells: ['head', 3, 1, 'tail'], states: { 1: 'match' }, note: '2 was at tail.prev ⇒ evicted' },
          ],
        },
      ],
    },
  ],

  'X3-insert-delete-getrandom-o1': [
    {
      name: 'Array + index map, swap with last',
      time: 'O(1) per operation',
      space: 'O(n)',
      best: true,
      points: [
        'The array makes getRandom a uniform pick; the map gives each value’s position.',
        'remove(val): move the last element into val’s slot, update its index, pop the end.',
        'The array stays dense, so random.choice stays uniform.',
        'Trap: update the moved element’s index before deleting val. It still works when val is itself the last element.',
      ],
      code: c['X3-insert-delete-getrandom-o1'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'values · remove 8', cells: [5, 8, 2, 9], states: { 1: 'miss', 3: 'active' } },
            { caption: 'after', cells: [5, 9, 2], states: { 1: 'match' }, note: '9 moved into slot 1 · index[9] = 1' },
          ],
        },
      ],
    },
  ],

  'X3-design-twitter': [
    {
      name: 'Gather everything, sort',
      time: 'O(T log T) per feed',
      space: 'O(T)',
      state: '`tweets[user]` = `(time, id)` pairs; `following[user]`; a global `time`.',
      invariant: 'The pool holds every tweet by the user and their followees; sorting by time descending puts the 10 newest first.',
      points: [
        'Collect every tweet of the user and everyone they follow; sort by time; take 10.',
        'T grows with all tweets ever posted: slow for busy users.',
      ],
      code: c['X3-design-twitter#sortall'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'all tweets, newest first', cells: [9, 8, 7, 6, 5, 4, 3, 2, 1], note: 'sorted just to keep the top 10' }] }],
    },
    {
      name: 'Heap merge of the newest tweets',
      time: 'O(k) per feed',
      space: 'O(k)',
      best: true,
      points: [
        'Each user’s tweet list is already in time order: a K-way merge.',
        'Seed a max-heap with the newest tweet of each followee (and the user).',
        'Pop 10 times; after each pop, push that user’s next older tweet.',
        'Only 10 + k entries are ever touched, however many tweets exist.',
      ],
      code: c['X3-design-twitter'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'heap (times)', cells: [9, 7, 4], pointers: [{ at: 0, label: 'pop' }], states: { 0: 'match' } },
            { caption: 'after pushing that user’s next', cells: [8, 7, 4], note: 'repeat until 10 tweets' },
          ],
        },
      ],
    },
  ],
}

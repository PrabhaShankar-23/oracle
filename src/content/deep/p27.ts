/** Approach walkthroughs for P27 (Topological Sort). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p27-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p27: Record<string, ApproachWalkthrough[]> = {
  'P27-course-schedule': [
    {
      name: 'DFS with three colours',
      time: 'O(V + E)',
      space: 'O(V)',
      state: '`state[u]`: 0 new, 1 on the current path, 2 done.',
      invariant: 'Courses marked 1 are exactly the current recursion path, so an edge into a 1 is a cycle; a course marked 2 has no cycle below it.',
      points: [
        'State per course: new, on the current path, or done.',
        'Reaching a course that is on the current path means a cycle ⇒ impossible.',
        'Mark done when all its dependents are explored; done courses are never re-explored.',
        'Recursive, so very long chains can hit Python’s recursion limit.',
      ],
      code: c['P27-course-schedule#colour'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'prerequisites [[1, 0], [0, 1]] · state', cells: ['on path', 'on path'], states: { 0: 'miss', 1: 'miss' }, note: '0 → 1 → back to 0, still on the path ⇒ cycle ⇒ false' },
          ],
        },
      ],
    },
    {
      name: 'Kahn’s algorithm: peel in-degree 0',
      time: 'O(V + E)',
      space: 'O(V + E)',
      best: true,
      points: [
        'in-degree = how many prerequisites a course still waits on.',
        'Queue every course with in-degree 0 (nothing left to wait for).',
        'Taking a course lowers its dependents’ in-degrees; any that reach 0 join the queue.',
        'If fewer than n courses are ever taken, the rest are stuck in a cycle.',
      ],
      code: c['P27-course-schedule'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'course', cells: [0, 1, 2, 3] },
            { caption: 'in-degree ([[1,0],[2,0],[3,1],[3,2]])', cells: [0, 1, 1, 2], states: { 0: 'active' } },
            { caption: 'after taking 0', cells: [0, 0, 0, 2], states: { 0: 'dim', 1: 'active', 2: 'active' } },
            { caption: 'after taking 1, 2', cells: [0, 0, 0, 0], states: { 3: 'match' }, note: 'all 4 taken ⇒ true' },
          ],
        },
      ],
    },
  ],

  'P27-course-schedule-ii': [
    {
      name: 'DFS, reverse post-order',
      time: 'O(V + E)',
      space: 'O(V)',
      state: '`state[u]` as in three-colour DFS; `order` of finished courses.',
      invariant: 'A course is appended only after every course that depends on it has finished, so reversing `order` puts every prerequisite first.',
      points: [
        'Same three-colour DFS as Course Schedule.',
        'Append a course when it finishes, after everything that depends on it.',
        'Reversed, that list is a valid order. A cycle ⇒ [].',
      ],
      code: c['P27-course-schedule-ii#dfs'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'finish order from dfs(0)', cells: [3, 1, 2, 0] },
            { caption: 'reversed', cells: [0, 2, 1, 3], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' }, note: 'every prerequisite comes before its course' },
          ],
        },
      ],
    },
    {
      name: 'Kahn’s algorithm, record the pops',
      time: 'O(V + E)',
      space: 'O(V + E)',
      best: true,
      points: [
        'Run Kahn’s algorithm; the order courses leave the queue is a valid schedule.',
        'A course only leaves after all its prerequisites have.',
        'len(order) < n ⇒ a cycle ⇒ [].',
      ],
      code: c['P27-course-schedule-ii'],
      diagrams: [{ kind: 'cells', rows: [{ caption: 'pop order', cells: [0, 1, 2, 3], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match' }, note: '0 frees 1 and 2 · both free 3' }] }],
    },
  ],

  'P27-alien-dictionary': [
    {
      name: 'Edges from adjacent words, then Kahn',
      time: 'O(total chars)',
      space: 'O(V + E)',
      best: true,
      points: [
        'Only neighbouring words in the list carry order information.',
        'Their first differing letters give one edge: x comes before y. Everything after that is unconstrained.',
        'Trap: if a word is followed by its own prefix ("abc" then "ab"), the input is invalid ⇒ "".',
        'Topologically sort the letters; a cycle ⇒ "".',
      ],
      code: c['P27-alien-dictionary'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'wrt · wrf · er · ett · rftt', cells: ['t<f', 'w<e', 'r<t', 'e<r'], note: 'one edge per adjacent pair' },
            { caption: 'Kahn order', cells: ['w', 'e', 'r', 't', 'f'], states: { 0: 'match', 1: 'match', 2: 'match', 3: 'match', 4: 'match' }, note: '"wertf"' },
          ],
        },
      ],
    },
  ],
}

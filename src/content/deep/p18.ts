/** Approach walkthroughs for P18 (Stack — Parsing & Matching). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p18-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p18: Record<string, ApproachWalkthrough[]> = {
  'P18-min-stack': [
    {
      name: 'Second stack of minimums',
      time: 'O(1)',
      space: 'O(n)',
      points: [
        'LeetCode 155 needs every operation, getMin included, in O(1), so scanning with min() is out.',
        'Keep the stack plus a mins stack of each new minimum.',
        'Push val onto mins only when val ≤ mins top.',
        'On pop, if the popped value equals mins top, pop mins too.',
        'Use ≤, not <: a repeated minimum must be pushed twice, or popping one copy loses it.',
        'Saves memory when the minimum rarely changes, but the ≤ rule and the equality check on pop are easy to get wrong.',
      ],
      code: c['P18-min-stack#mins'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'stack', cells: [5, 3, 7, 3, 1], pointers: [{ at: 4, label: 'top' }] },
            {
              caption: 'mins',
              cells: [5, 3, 3, 1],
              pointers: [{ at: 3, label: 'min', tone: 'secondary' }],
              states: { 2: 'active' },
              note: 'the second 3 went in because 3 ≤ 3 · 7 was skipped',
            },
            {
              caption: 'pop 1, then pop 3',
              cells: [5, 3],
              pointers: [{ at: 1, label: 'min', tone: 'secondary' }],
              states: { 1: 'match' },
              note: 'popped values matched mins top both times ⇒ getMin = 3',
            },
          ],
        },
      ],
    },
    {
      name: 'Pair each value with the min',
      time: 'O(1)',
      space: 'O(n)',
      best: true,
      points: [
        'Push (value, min so far) instead of the bare value.',
        'min so far = min(val, the min stored under it).',
        'getMin reads the top pair; popping restores the older min for free.',
        'Every operation O(1), with no special case to get wrong.',
      ],
      code: c['P18-min-stack'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'value', cells: [5, 3, 7, 3, 1], pointers: [{ at: 4, label: 'top' }] },
            {
              caption: 'min so far',
              cells: [5, 3, 3, 3, 1],
              states: { 4: 'match' },
              note: 'getMin = 1 · pop ⇒ the pair below says 3',
            },
          ],
        },
      ],
    },
    {
      name: 'Encode 2·x − min',
      time: 'O(1)',
      space: 'O(n)',
      trick: true,
      points: [
        'One stack and a single min variable, no second stack.',
        'val ≥ min: push val as is.',
        'val < min: push 2·val − min, then min = val. That value is always below the new min, which marks it as encoded.',
        'top: a stored value below min means the real top is min itself.',
        'pop an encoded value: the previous min comes back as 2·min − stored.',
        'In Java or C++ use long: 2·val − min can overflow int.',
      ],
      code: c['P18-min-stack#encode'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'push 5, 3, 7, 3, 1 · stored values',
              cells: [5, 1, 7, 3, -1],
              pointers: [{ at: 4, label: 'top' }],
              states: { 1: 'active', 4: 'active' },
              note: '3 < 5 ⇒ 2·3 − 5 = 1 · 1 < 3 ⇒ 2·1 − 3 = −1 · min = 1',
            },
            {
              caption: 'pop: −1 < min ⇒ encoded',
              cells: [5, 1, 7, 3, -1],
              pointers: [{ at: 3, label: 'top' }],
              states: { 4: 'dim' },
              note: 'min = 2·1 − (−1) = 3 ⇒ the old min is back',
            },
            {
              caption: 'later pop of the stored 1',
              cells: [5, 1],
              pointers: [{ at: 1, label: 'top' }],
              states: { 1: 'miss' },
              note: '1 < min 3 ⇒ encoded ⇒ min = 2·3 − 1 = 5',
            },
          ],
        },
      ],
    },
  ],
}

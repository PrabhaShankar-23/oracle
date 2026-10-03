/** Approach walkthroughs for P18 (Stack — Parsing & Matching). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p18-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p18: Record<string, ApproachWalkthrough[]> = {
  'P18-valid-parentheses': [
    {
      name: 'Erase "()" pairs until stuck',
      time: 'O(n²)',
      space: 'O(n)',
      state: 'The string `s` after each round of erasing adjacent pairs.',
      invariant: 'Removing an adjacent matched pair never changes whether the string is valid; `s` is valid exactly when it erases down to empty.',
      points: [
        'An innermost pair like "()" can always be removed without changing validity.',
        'Keep erasing pairs; the string is valid if it ends empty.',
        'Easy to explain, but each pass rebuilds the string: quadratic.',
      ],
      code: c['P18-valid-parentheses#erase'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'pass 1', cells: ['(', '[', ']', '{', '}', ')'], states: { 1: 'dim', 2: 'dim', 3: 'dim', 4: 'dim' } },
            { caption: 'pass 2', cells: ['(', ')'], states: { 0: 'dim', 1: 'dim' }, note: 'empty ⇒ valid' },
          ],
        },
      ],
    },
    {
      name: 'Stack of expected closers',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'On an opener, push the closer you now expect.',
        'On a closer, the stack top must be exactly it; pop.',
        'Pushing the closer, not the opener, removes the pair lookup at pop time.',
        'Valid only if the stack is empty at the end. Leftover openers are a failure too.',
      ],
      code: c['P18-valid-parentheses'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 's', cells: ['(', '[', ']', '{', '}', ')'], pointers: [{ at: 2, label: 'c' }], states: { 2: 'match' } },
            { caption: 'stack before "]"', cells: [')', ']'], pointers: [{ at: 1, label: 'top' }], states: { 1: 'match' }, note: 'top is "]" ⇒ pop · … ⇒ empty ⇒ valid' },
          ],
        },
      ],
    },
  ],

  'P18-evaluate-reverse-polish-notation': [
    {
      name: 'Operand stack',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Numbers are pushed. An operator pops two operands and pushes the result.',
        'The first pop is the right operand: b, a = pop(), pop(), then compute a op b.',
        'Division truncates toward zero: int(a / b) in Python, not a // b.',
        'The last value on the stack is the answer.',
      ],
      code: c['P18-evaluate-reverse-polish-notation'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'tokens', cells: ['4', '13', '5', '/', '+'], pointers: [{ at: 3, label: 't' }] },
            { caption: 'stack before "/"', cells: [4, 13, 5], states: { 1: 'active', 2: 'active' }, note: 'b = 5, a = 13 ⇒ 13 / 5 = 2' },
            { caption: 'after "+"', cells: [6], states: { 0: 'match' }, note: '4 + 2 = 6' },
          ],
        },
      ],
    },
  ],

  'P18-basic-calculator': [
    {
      name: 'Recurse into each paren group',
      time: 'O(n)',
      space: 'O(depth)',
      state: 'Each call holds `res`, `num`, `sign` for its own group; the call stack holds the outer groups.',
      invariant: '`res + sign × num` is the value of the current group read so far; a returned group value acts as one number in its parent.',
      points: [
        'Evaluate + and − left to right with a running result and a sign.',
        'On "(", recurse; the group comes back as one number, and the outer sign applies to it.',
        'On ")", return the group’s value and where it ended.',
        'Clear, but it uses the call stack. Deeply nested input can hit Python’s recursion limit.',
      ],
      code: c['P18-basic-calculator#recursive'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: '1 − (4 + 5 − 2) + 3',
              cells: ['1', '−', '(', '4', '+', '5', '−', '2', ')', '+', '3'],
              states: { 3: 'active', 4: 'active', 5: 'active', 6: 'active', 7: 'active' },
              span: { from: 2, to: 8, label: 'parse() ⇒ 7' },
              note: '1 − 7 + 3 = −3',
            },
          ],
        },
      ],
    },
    {
      name: 'One pass with a sign stack',
      time: 'O(n)',
      space: 'O(n)',
      best: true,
      points: [
        'Keep res, the current number and the sign in front of it.',
        '"+" or "−": add sign × num to res, then set the new sign.',
        '"(": push res and sign, then reset both. ")": finish the group, multiply by the saved sign, add the saved res.',
        'With only + and −, a paren’s context is just two integers, so no postfix conversion is needed.',
      ],
      code: c['P18-basic-calculator'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'stack after "(" in 1 − (4 + 5 − 2) + 3', cells: [1, -1], note: 'saved res = 1, sign = −1' },
            {
              caption: 'at ")"',
              cells: [7],
              states: { 0: 'match' },
              note: 'group = 7 ⇒ 7 × (−1) + 1 = −6 ⇒ then + 3 ⇒ −3',
            },
          ],
        },
      ],
    },
  ],

  'P18-min-stack': [
    {
      name: 'Second stack of minimums',
      time: 'O(1)',
      space: 'O(n)',
      state: '`stack` of values; `mins` of every value that was ≤ the minimum when pushed.',
      invariant: '`mins[-1]` is the minimum of `stack`; pushing on `≤` keeps duplicate minimums, so popping one copy leaves the right minimum.',
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
      state: 'One `stack` of possibly encoded values; `min` = the current minimum.',
      invariant: 'A stored value below `min` marks the point where `min` changed, and `2·min − stored` gives back the previous minimum on pop.',
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

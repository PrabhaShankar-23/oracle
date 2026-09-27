/** Approach walkthroughs for P10 (Greedy — Interval Scheduling). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p10-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p10: Record<string, ApproachWalkthrough[]> = {
  'P10-meeting-rooms': [
    {
      name: 'Check every pair',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Two meetings clash when each starts before the other ends: s1 < e2 and s2 < e1.',
        'Test all n(n − 1) / 2 pairs; any clash ⇒ false.',
        'Needs no sort, but it is quadratic.',
      ],
      code: c['P10-meeting-rooms#pairs'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'meetings',
              bars: [
                { from: 0, to: 30, state: 'miss' },
                { from: 5, to: 10, state: 'miss' },
                { from: 15, to: 20 },
              ],
              note: '0–30 vs 5–10: 0 < 10 and 5 < 30 ⇒ clash ⇒ false',
            },
          ],
        },
      ],
    },
    {
      name: 'Sort by start, compare neighbours',
      time: 'O(n log n)',
      space: 'O(1)',
      best: true,
      points: [
        'Sort by start.',
        'Now a meeting can only clash with the one just before it.',
        'start < previous end ⇒ clash ⇒ false.',
        'A meeting that starts exactly when the last one ends is fine: use <, not ≤.',
      ],
      code: c['P10-meeting-rooms'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'sorted by start',
              bars: [
                { from: 0, to: 30 },
                { from: 5, to: 10, state: 'miss' },
                { from: 15, to: 20 },
              ],
              marks: [{ at: 30, label: 'prev end' }],
              note: '5 < 30 ⇒ clash ⇒ false',
            },
          ],
        },
      ],
    },
  ],

  'P10-non-overlapping-intervals': [
    {
      name: 'DP on the longest chain',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Removing the fewest = keeping the most non-overlapping intervals.',
        'Sort by end. keep[i] = the most you can keep among the first i intervals.',
        'Skip interval i ⇒ keep[i]; take it ⇒ keep[j] + 1, where j counts intervals ending ≤ its start (binary search).',
        'Answer = n − keep[n]. Correct, but it needs an O(n) table the greedy avoids.',
      ],
      code: c['P10-non-overlapping-intervals#dp'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'sorted by end',
              bars: [{ from: 2, to: 3 }, { from: 1, to: 4 }, { from: 3, to: 6 }, { from: 5, to: 7 }, { from: 6, to: 9 }],
            },
          ],
        },
        {
          kind: 'cells',
          rows: [
            {
              caption: 'keep[0…5]',
              cells: [0, 1, 1, 2, 2, 3],
              states: { 5: 'match' },
              note: 'keep 3 of 5 ⇒ remove 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Sort by end, keep greedily',
      time: 'O(n log n)',
      space: 'O(1)',
      best: true,
      points: [
        'Sort by end.',
        'Walk the list: if start ≥ the last kept end, keep it; otherwise it must go.',
        'Among clashing intervals, the one ending first leaves the most room for the rest (exchange argument).',
        'Answer = n − kept.',
        'Trap: sorting by start and keeping the first is wrong. One long interval can block many short ones.',
      ],
      code: c['P10-non-overlapping-intervals'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'sorted by end',
              bars: [
                { from: 2, to: 3, state: 'match' },
                { from: 1, to: 4, state: 'miss' },
                { from: 3, to: 6, state: 'match' },
                { from: 5, to: 7, state: 'miss' },
                { from: 6, to: 9, state: 'match' },
              ],
              note: 'keep 2–3, 3–6, 6–9 · 1 < 3 and 5 < 6 ⇒ remove 2',
            },
          ],
        },
      ],
    },
  ],

  'P10-minimum-number-of-arrows-to-burst-balloons': [
    {
      name: 'Sort by start, shrink the window',
      time: 'O(n log n)',
      space: 'O(1)',
      points: [
        'Sort by start and grow a group of balloons that share a common point.',
        'The shared window ends at reach = the smallest end in the group.',
        'start ≤ reach ⇒ join the group, reach = min(reach, end); otherwise fire and start a new group.',
        'Correct, but it tracks a min that sorting by end gives you for free.',
      ],
      code: c['P10-minimum-number-of-arrows-to-burst-balloons#start'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'sorted by start',
              bars: [
                { from: 1, to: 6, state: 'match' },
                { from: 2, to: 8, state: 'match' },
                { from: 7, to: 12, state: 'active' },
                { from: 10, to: 16, state: 'active' },
              ],
              marks: [
                { at: 6, label: 'reach' },
                { at: 12, label: 'reach', tone: 'secondary' },
              ],
              note: '7 > reach 6 ⇒ new group · 2 arrows',
            },
          ],
        },
      ],
    },
    {
      name: 'Sort by end, shoot at the end',
      time: 'O(n log n)',
      space: 'O(1)',
      best: true,
      points: [
        'Sort by end; fire the first arrow at the first end.',
        'That arrow bursts every balloon starting at or before it.',
        'Fire a new arrow only when start > the last arrow: a true miss.',
        'Same exchange argument as Non-overlapping Intervals.',
        'Trap: touching balloons share a point, so the test is >, not ≥.',
      ],
      code: c['P10-minimum-number-of-arrows-to-burst-balloons'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'sorted by end',
              bars: [
                { from: 1, to: 6, state: 'match' },
                { from: 2, to: 8, state: 'match' },
                { from: 7, to: 12, state: 'active' },
                { from: 10, to: 16, state: 'active' },
              ],
              marks: [
                { at: 6, label: 'arrow 1' },
                { at: 12, label: 'arrow 2', tone: 'secondary' },
              ],
              note: '2 ≤ 6 ⇒ burst · 7 > 6 ⇒ fire at 12 · 10 ≤ 12 ⇒ burst',
            },
          ],
        },
      ],
    },
  ],

  'P10-meeting-rooms-ii': [
    {
      name: 'Count meetings at each start',
      time: 'O(n²)',
      space: 'O(1)',
      points: [
        'Rooms needed = the most meetings running at the same moment.',
        'That peak always begins at some meeting’s start.',
        'For each start t, count meetings with s ≤ t < e.',
        'Easy to see, but every start scans every meeting.',
      ],
      code: c['P10-meeting-rooms-ii#count'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'at t = 5',
              bars: [
                { from: 0, to: 30, state: 'active' },
                { from: 5, to: 10, state: 'active' },
                { from: 15, to: 20 },
              ],
              marks: [{ at: 5, label: 't' }],
              note: '0–30 and 5–10 are running ⇒ 2 · the max over all starts is the answer',
            },
          ],
        },
      ],
    },
    {
      name: 'Sweep sorted starts and ends',
      time: 'O(n log n)',
      space: 'O(n)',
      points: [
        'Sort the starts and the ends separately; which end belongs to which meeting does not matter.',
        'Walk the starts. If a start is ≥ the earliest unused end, a room has just freed: reuse it.',
        'Otherwise open a new room.',
        'Rooms opened = the answer.',
      ],
      code: c['P10-meeting-rooms-ii#sweep'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'starts', cells: [0, 5, 15], pointers: [{ at: 2, label: 's' }], states: { 0: 'dim', 1: 'dim' } },
            {
              caption: 'ends',
              cells: [10, 20, 30],
              pointers: [{ at: 0, label: 'j', tone: 'secondary' }],
              states: { 0: 'match' },
              note: '0 and 5 opened 2 rooms · 15 ≥ 10 ⇒ reuse · rooms = 2',
            },
          ],
        },
      ],
    },
    {
      name: 'Min-heap of end times',
      time: 'O(n log n)',
      space: 'O(n)',
      best: true,
      points: [
        'Sort by start. The heap holds the end time of every room in use.',
        'The room that frees first is at the top.',
        'top ≤ start ⇒ that room is free: replace its end. Otherwise push a new room.',
        'Heap size at the end = rooms needed.',
        'The heap models real rooms, so "which room?" follow-ups are easy.',
      ],
      code: c['P10-meeting-rooms-ii'],
      diagrams: [
        {
          kind: 'intervals',
          rows: [
            {
              caption: 'one lane per room: room 1 on top, room 2 below',
              bars: [
                { from: 0, to: 30, lane: 0 },
                { from: 5, to: 10, lane: 1 },
                { from: 15, to: 20, lane: 1, state: 'match' },
              ],
              note: 'heap top 10 ≤ 15 ⇒ 15–20 reuses room 2 · heap size 2',
            },
          ],
        },
      ],
    },
  ],
}

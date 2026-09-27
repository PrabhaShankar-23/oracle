/** Approach walkthroughs for P11 (Two Heaps). Code comes from the tested snippets. */
import type { ApproachWalkthrough } from '../types'
import code from './p11-code.json' with { type: 'json' }

const c = code as Record<string, string>

export const p11: Record<string, ApproachWalkthrough[]> = {
  'P11-ipo': [
    {
      name: 'Rescan every round',
      time: 'O(k·n)',
      space: 'O(n)',
      points: [
        'Each round, take the most profitable unused project whose capital fits in w.',
        'Taking a project only raises w, so greedy by profit is safe.',
        'Correct, but every round rescans all n projects. With k and n up to 10⁵ that times out.',
      ],
      code: c['P11-ipo#scan'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'capital', cells: [0, 1, 1] },
            {
              caption: 'profit · round 1 (w = 0)',
              cells: [1, 2, 3],
              states: { 0: 'match', 1: 'dim', 2: 'dim' },
              note: 'only project 0 fits ⇒ w = 1',
            },
            {
              caption: 'profit · round 2 (w = 1)',
              cells: [1, 2, 3],
              states: { 0: 'dim', 1: 'active', 2: 'match' },
              note: 'projects 1 and 2 fit ⇒ take 3 ⇒ w = 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Unlock by capital, pick by profit',
      time: 'O(n log n)',
      space: 'O(n)',
      best: true,
      points: [
        'locked: a min-heap by capital. affordable: a max-heap by profit.',
        'Each round, move every project with capital ≤ w from locked into affordable.',
        'Pop the top of affordable and add its profit to w. Stop early if affordable is empty.',
        'w only grows, so each project moves between heaps exactly once.',
        'Sorting projects by capital with a pointer works the same as the locked heap.',
      ],
      code: c['P11-ipo'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'round 2 (w = 1) · locked by capital',
              cells: [0, 1, 1],
              states: { 0: 'dim', 1: 'active', 2: 'active' },
              note: 'capital ≤ 1 ⇒ both move to affordable',
            },
            {
              caption: 'affordable · max-heap by profit',
              cells: [3, 2],
              pointers: [{ at: 0, label: 'top' }],
              states: { 0: 'match' },
              note: 'pop 3 ⇒ w = 4',
            },
          ],
        },
      ],
    },
  ],

  'P11-find-median-from-data-stream': [
    {
      name: 'Keep one sorted list',
      time: 'O(n) add · O(1) median',
      space: 'O(n)',
      points: [
        'Sorting on every findMedian works, but costs O(n log n) per call.',
        'Better: keep the list sorted as you go. Binary search finds the spot for each new number.',
        'The median is then the middle element, or the average of the middle two.',
        'But inserting shifts every larger element, so addNum is O(n).',
      ],
      code: c['P11-find-median-from-data-stream#insort'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'after 5, 15, 1, 3',
              cells: [1, 3, 5, 15],
              pointers: [{ at: 1, label: 'mid' }, { at: 2, label: 'mid' }],
              states: { 1: 'active' },
              note: 'inserting 3 shifted 5 and 15 right · (3 + 5) / 2 = 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Two heaps split at the middle',
      time: 'O(log n) add · O(1) median',
      space: 'O(n)',
      best: true,
      points: [
        'lo: a max-heap of the smaller half. hi: a min-heap of the larger half.',
        'Keep every lo ≤ every hi, with len(lo) = len(hi) or one more.',
        'addNum: push into lo, move lo’s top into hi, then move hi’s top back if hi got bigger.',
        'The median is lo’s top, or the average of both tops.',
        'Trap: always go through lo first. Pushing straight into hi can break the ordering.',
      ],
      code: c['P11-find-median-from-data-stream'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            { caption: 'lo · max-heap (smaller half)', cells: [3, 1], pointers: [{ at: 0, label: 'top' }], states: { 0: 'match' } },
            {
              caption: 'hi · min-heap (larger half)',
              cells: [5, 15],
              pointers: [{ at: 0, label: 'top', tone: 'secondary' }],
              states: { 0: 'match' },
              note: 'equal sizes ⇒ (3 + 5) / 2 = 4',
            },
          ],
        },
      ],
    },
    {
      name: 'Count buckets for 0…100',
      time: 'O(1) add · O(100) median',
      space: 'O(1)',
      trick: true,
      points: [
        'LeetCode’s follow-up: what if every number is in 0…100?',
        'Keep count[v] for v = 0…100; addNum is one increment.',
        'findMedian walks at most 101 buckets to the middle position(s). That is constant time.',
        'If 99% are in range, add a sorted list below 0 and one above 100. The median still lands in the buckets.',
      ],
      code: c['P11-find-median-from-data-stream#buckets'],
      diagrams: [
        {
          kind: 'cells',
          rows: [
            {
              caption: 'count[0…6] after 5, 15, 1, 3 (count[15] = 1)',
              cells: [0, 1, 0, 1, 0, 1, 0],
              pointers: [{ at: 3, label: 'pos 1' }, { at: 5, label: 'pos 2', tone: 'secondary' }],
              states: { 3: 'match', 5: 'match' },
              note: 'walk the counts to positions 1 and 2 ⇒ (3 + 5) / 2 = 4',
            },
          ],
        },
      ],
    },
  ],
}

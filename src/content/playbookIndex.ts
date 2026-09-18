/**
 * Section ids and titles of the thinking playbook, in page order.
 *
 * Kept in its own tiny module because `sections.ts` (nav + global search) is in the main bundle —
 * importing `playbook.ts` there would pull all of its prose in with it. `playbook.ts` builds its
 * sections from this list, so TypeScript fails the build if the two ever drift apart.
 */
export const playbookIndex = [
  { id: 'recall-line', title: 'The line every recall note needs' },
  { id: 'recognition', title: 'Recognition, not solving' },
  { id: 'constraints', title: 'Read the constraints, get the complexity' },
  { id: 'memory', title: 'Every data structure is specialised memory' },
  { id: 'heuristic', title: 'The universal unstuck heuristic' },
  { id: 'invariants', title: 'Name the thing that stays true' },
  { id: 'pre-check', title: 'Stabilise before you loop' },
  { id: 'edge-cases', title: 'The edge case ritual' },
  { id: 'dry-run', title: 'Trace it before you say done' },
  { id: 'narration', title: 'What to say while you think' },
  { id: 'templates', title: 'Micro-templates you rewrite cold' },
  { id: 'composition', title: 'Medium and hard = pattern composition' },
  { id: 'defaults', title: 'Ten-second scans' },
  { id: 'practice', title: 'Turning effort into offers' },
  { id: 'mindset', title: 'What actually gets forgiven' },
] as const

export type PlaybookId = (typeof playbookIndex)[number]['id']

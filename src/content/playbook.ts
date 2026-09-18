/**
 * The DSA thinking playbook: the rituals that run *before* and *around* solving —
 * recognition, memory choice, pre-checks, edge-case reflexes, templates and practice.
 *
 * Hand-written (not ingested from the vault, so `npm run ingest` never touches it).
 * Rendered by `src/pages/dsa/PlaybookPage.tsx`.
 */
import { playbookIndex, type PlaybookId } from './playbookIndex'
import type { Playbook, PlaybookSection } from './types'

/** A section minus the id and title, which live in `playbookIndex`. */
type PlaybookBody = Omit<PlaybookSection, 'id' | 'title'>

const meta = {
  title: 'Thinking playbook',
  subtitle:
    'Interviews are not about solving — they are about recognition under stress. These are the rituals that run before the first line of code.',
  intro: [
    'Every section here is a habit, not a fact to memorise. Read one, use it on the next three problems, then stop reading it.',
    'The through-line: an algorithm is a memory strategy. Decide what you need to remember, and the data structure picks itself.',
  ],
}

/** Section id → everything below its heading. Keyed so a missing or stray id fails the build. */
const bodies: Record<PlaybookId, PlaybookBody> = {
  /* ------------------------------------------------------------------ */
  'recall-line': {
    lede: 'Without it you remember an answer. With it you remember the climb — which is the thing that transfers to the next problem.',
    blocks: [
      {
        kind: 'code',
        lang: 'text',
        title: 'Add this to the bottom of every note',
        code: `Optimization Jump →
  Brute  → X
  Better → Y
  Best   → Z`,
        note: 'Three rungs, three sentences. If you cannot fill all three, you have read a solution, not solved a problem.',
      },
      {
        kind: 'table',
        title: 'What each rung means',
        columns: ['Rung', 'What changed', 'Example — Two Sum'],
        rows: [
          ['Brute', 'The definition typed out. No memory, no ordering assumed.', 'Every pair, two loops — O(n²)'],
          ['Better', 'The first piece of wasted work you removed.', 'Sort, then converge with two pointers — O(n log n), but indices are lost'],
          ['Best', 'The past information that made each step O(1).', 'Hash map value → index, one pass — O(n)'],
        ],
        note: 'The jump always has the same shape: remove work by remembering something.',
      },
      {
        kind: 'callout',
        tone: 'primary',
        text: 'Write the jump even when you only reached “Better”. A note that admits the gap is worth more than one that hides it.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'recognition': {
    lede: 'The mindset shift that changes everything: you are not inventing an algorithm, you are identifying which one the problem is wearing.',
    blocks: [
      {
        kind: 'flow',
        title: 'The chain to run on every problem',
        steps: ['Problem signals', 'Pattern', 'Type of memory needed', 'Data structure', 'Invariant + loop'],
        note: 'Code is the last link, not the first. Everything before it is free to get wrong and cheap to redo.',
      },
      {
        kind: 'compare',
        columns: [
          {
            title: 'Stop asking',
            tone: 'error',
            items: ['“How do I solve this?”', '“What is the trick here?”', '“Have I seen this exact problem?”'],
          },
          {
            title: 'Start asking',
            tone: 'success',
            items: [
              '“Which pattern is this pretending to be?”',
              '“What must always remain true during execution?”',
              '“What would make the current step O(1)?”',
            ],
          },
        ],
      },
      {
        kind: 'checklist',
        title: 'Four questions — say them out loud, every time',
        items: [
          'What pattern is this?',
          'What memory does it need?',
          'What invariant must hold?',
          'Why this data structure and not another?',
        ],
        note: 'If you can answer these in 30 seconds, you are roughly 80% done — the rest is typing.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'constraints': {
    lede: 'The fastest route to the pattern is not intuition, it is arithmetic. The input size tells you which complexity you are allowed, and that collapses the candidates to a handful.',
    blocks: [
      {
        kind: 'flow',
        title: 'The chain, before you have any idea how to solve it',
        steps: ['Input size n', 'Budget ≈ 10⁸ operations', 'Allowed complexity', 'Candidate patterns'],
        note: 'A judge runs roughly 10⁸ simple operations per second. Interviews use the same arithmetic even when nothing is being timed.',
      },
      {
        kind: 'table',
        title: 'n tells you the complexity',
        columns: ['n up to', 'You can afford', 'Which usually means'],
        rows: [
          ['12', 'O(n!)', 'permutations, brute-force orderings'],
          ['20', 'O(2ⁿ)', 'subsets, bitmask DP, meet in the middle'],
          ['100', 'O(n³)', 'Floyd–Warshall, interval DP, triple loops'],
          ['1 000', 'O(n²)', 'pairwise DP, LCS / edit distance, nested scans'],
          ['10⁵', 'O(n log n)', 'sort, heap, binary search, ordered map'],
          ['10⁶', 'O(n)', 'single pass, sliding window, prefix sum, counting'],
          ['10⁹ and up', 'O(log n) or O(1)', 'binary search on the answer, maths, bit tricks'],
        ],
        mono: [0, 1],
        note: 'Work backwards: the gap between your brute force and the allowed complexity is exactly the work you have to remember your way out of.',
      },
      {
        kind: 'bullets',
        title: 'Other constraints that give the pattern away',
        items: [
          'Values bounded while n is huge (letters a–z, scores 0–100) → a counting array, not a hash map.',
          '“The array is sorted” or “return indices in order” → two pointers or binary search, almost never a hash map.',
          '“The answer lies in a range and is cheap to check” → binary search on the answer space.',
          '“Minimise the maximum” or “return any valid answer” → greedy or binary search, not full enumeration.',
          'Negative numbers allowed → sliding window usually breaks, prefix sum + hash map usually does not.',
          'n is small but the answer counts arrangements → backtracking, and the constraint is telling you it is fine.',
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        text: 'Say the arithmetic out loud: “n is 10⁵, so I need n log n or better — that rules out the O(n²) pair scan.” One sentence, and the interviewer knows you can size a solution before writing it.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'memory': {
    lede: 'Not storage — structured memory optimised for one specific question. Ask what you need to have memory of, not which structure to use.',
    blocks: [
      {
        kind: 'table',
        columns: ['Structure', 'What it remembers', 'Why it exists'],
        rows: [
          ['HashMap', 'past values, keyed', 'fast lookup'],
          ['Set', 'existence', 'membership check'],
          ['Stack', 'recent history', 'undo / matching / scope'],
          ['Queue', 'order', 'processing sequence'],
          ['Heap', 'priority', 'top element, fast'],
          ['Prefix sum', 'cumulative past', 'range queries'],
          ['Trie', 'prefixes', 'fast string search'],
        ],
        mono: [0],
      },
      {
        kind: 'cards',
        title: 'The big five mental blocks',
        items: [
          { title: 'List → data', text: 'Just the input. It stores; it does not decide anything.' },
          {
            title: 'Stack → local memory',
            text: 'Controls scope. Use it when the current element only cares about the most recent unresolved one.',
          },
          {
            title: 'Queue → global order',
            text: 'Controls sequence. Use it when everything must be processed in arrival order, level by level.',
          },
          {
            title: 'Heap → global priority',
            text: 'Controls who goes next. Use it when only the best or worst element matters at each step.',
          },
          {
            title: 'Map → indexed memory',
            text: 'History, frequency, state — anything you will want to look up by key instead of scanning for.',
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'secondary',
        title: 'The insight underneath',
        text: 'Most problems are not about data structures — they are about control. Stack controls scope, queue controls order, heap controls priority, list is just input. Think in control flows and problems stop feeling random.',
      },
      { kind: 'callout', tone: 'primary', text: 'Algorithms are not tricks. They are memory strategies.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'heuristic': {
    lede: 'One question derives most optimal solutions. It is the reason prefix sums, hash maps, monotonic stacks and sliding windows exist.',
    blocks: [
      {
        kind: 'callout',
        tone: 'tertiary',
        title: 'When stuck, ask',
        text: 'What should I remember from earlier elements so that the current decision is instant?',
      },
      {
        kind: 'table',
        title: 'Then follow the answer',
        columns: ['What you need to remember', 'Reach for', 'Shows up as'],
        rows: [
          ['One value', 'a variable', 'running max, running sum, best so far'],
          ['Many values, by position', 'an array / prefix sum', 'range sums, counts up to i'],
          ['A lookup by key', 'a hash map', 'seen index, frequency, last occurrence'],
          ['Only “have I seen it?”', 'a set', 'dedupe, visited, cycle detection'],
          ['Order of arrival', 'a queue', 'BFS levels, streaming windows'],
          ['The most recent unresolved item', 'a stack', 'matching, monotonic next-greater'],
          ['The best element right now', 'a heap', 'top-K, merge k streams, scheduling'],
          ['Shared prefixes', 'a trie', 'autocomplete, word search'],
        ],
      },
      {
        kind: 'bullets',
        items: [
          'Every optimal solution is the same sentence: store the right past information.',
          'If the brute force re-scans earlier elements, that scan is the thing to cache.',
          'You are not recalling the pattern — you are deriving it. That still works when the problem is new.',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'invariants': {
    lede: 'Three of the rituals on this page ask you for an invariant. This is what one is, and how to know yours is right.',
    blocks: [
      {
        kind: 'callout',
        tone: 'tertiary',
        title: 'The shape of an invariant',
        text: 'At the top of every iteration, ⟨this one sentence⟩ is true. If it is still true when the loop exits, the answer is correct by construction.',
      },
      {
        kind: 'table',
        title: 'What the common ones actually say',
        columns: ['Pattern', 'Its invariant, written out in full'],
        rows: [
          ['Sliding window', 'Everything inside [l, r] satisfies the constraint, and r − l + 1 is the best window ending at r.'],
          ['Two pointers, converging', 'Every pair outside [l, r] has already been ruled out.'],
          ['Binary search', 'If an answer exists at all, it lies inside [lo, hi].'],
          ['Monotonic stack', 'The stack holds indices whose answer is still unknown, in decreasing order of value.'],
          ['BFS', 'Every node in the queue is exactly d steps from the source, and d never decreases.'],
          ['Kadane', 'best_ending_here is the largest sum of any subarray that ends at i.'],
          ['Cyclic sort', 'Everything left of i is already sitting at its correct index.'],
        ],
      },
      {
        kind: 'flow',
        title: 'The three-part test',
        steps: ['True before the loop', 'Preserved by the body', 'Gives the answer at exit'],
        note: 'That is induction. Pass all three and you have proved the loop rather than spot-checked it.',
      },
      {
        kind: 'bullets',
        title: 'How to find yours',
        items: [
          'Write the loop body in words first, then ask: what did I assume was already true when I wrote that line? That assumption is the invariant.',
          'If you cannot say it in one sentence, the state is wrong — you are almost always tracking too much or too little.',
          'If the sentence needs “usually” or “most of the time”, it is not an invariant yet.',
          'Making it true before the first iteration is exactly what pre-check #4 is for.',
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        text: 'A bug is almost always a single line that breaks the invariant. Naming the invariant first means you already know which line to suspect.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'pre-check': {
    lede: 'A pre-check is a short validation or setup step before the main logic. It is preparing your memory model before computation.',
    blocks: [
      {
        kind: 'bullets',
        title: 'What a pre-check buys you',
        items: [
          'Eliminates impossible cases before they reach the loop.',
          'Simplifies every condition that comes after it.',
          'Protects the invariant the loop depends on.',
          'Removes whole classes of runtime error.',
        ],
      },
      {
        kind: 'cards',
        title: 'The five pre-checks strong candidates always write',
        items: [
          {
            title: '1 · Input guard',
            text: 'Stop the crash before it happens.',
            lang: 'python',
            code: 'if not arr:\n    return 0',
          },
          {
            title: '2 · Base initialisation',
            text: 'Seed the memory so index 0 is not a special case.',
            lang: 'python',
            code: '# a prefix sum of 0 has occurred once\nseen = {0: 1}',
          },
          {
            title: '3 · Constraint filter',
            text: 'Exit early when the answer is already decided.',
            lang: 'python',
            code: 'if k > total:\n    return 0',
          },
          {
            title: '4 · Invariant setup',
            text: 'Establish the property the loop promises to preserve.',
            lang: 'python',
            code: '# the window [left, right] is always valid\nleft = 0',
          },
          {
            title: '5 · State memory setup',
            text: 'Mark the start so traversal cannot loop forever.',
            lang: 'python',
            code: 'visited = {start}',
          },
        ],
      },
      {
        kind: 'flow',
        title: 'The order to write things in',
        steps: ['Define state', 'Enforce invariant', 'Run loop'],
        note: 'Weak solutions start at the loop. Strong ones arrive at the loop with nothing left to decide.',
      },
      {
        kind: 'checklist',
        title: 'Four words, run in your head before typing',
        items: ['Edge case?', 'Base state?', 'Memory init?', 'Invariant?'],
        note: 'Answer all four and the loop becomes almost mechanical.',
      },
      {
        kind: 'callout',
        tone: 'warning',
        text: 'Most bugs do not happen inside loops. They happen before loops start.',
      },
      {
        kind: 'bullets',
        title: 'Why interviewers read this as seniority',
        items: [
          'Defensive programming instead of optimism.',
          'Awareness of edge cases without being prompted.',
          'A debugging mindset — you know where it would break.',
          'Production-grade thinking: anyone can write loops, few stabilise logic before them.',
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'edge-cases': {
    lede: 'Same list, same order, out loud, before a single line of code. Interviewers forgive bugs; they do not forgive a candidate who never checked.',
    blocks: [
      {
        kind: 'checklist',
        title: 'Say it before coding',
        items: [
          'Empty input?',
          'Size 1?',
          'Duplicates?',
          'Sorted or not?',
          'Negative values?',
          'Overflow risk?',
          'Case sensitivity?',
        ],
        note: 'Make it a ritual, not a decision. Rituals survive stress; decisions do not.',
      },
      {
        kind: 'callout',
        tone: 'success',
        text: 'Interviewers love candidates who defend correctness. Ten seconds of edge cases reads as more senior than a clever one-liner.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'dry-run': {
    lede: 'You have stopped typing. Do not say “done” yet — this is the ninety seconds in which the bug is still cheap.',
    blocks: [
      {
        kind: 'checklist',
        title: 'Trace, in this order',
        items: [
          'The smallest non-trivial input — size 1 or 2.',
          'The edge case you named out loud before coding.',
          'One normal input, step by step, saying the state after each move.',
          'Both ends of every range — does the last index actually get visited?',
          'The return: is it the variable you think it is, on every path out?',
        ],
        note: 'Say the values as you go. A trace run silently in your head catches almost nothing.',
      },
      {
        kind: 'bullets',
        title: 'Where the bugs actually live',
        items: [
          'Off by one in a loop bound — `<` where you meant `<=`.',
          'Updating the answer after the state when it should have been before, or the reverse.',
          'Forgetting to shrink the window or pop the stack on the path that exits early.',
          'Returning inside the loop while the last element still needs processing.',
          'Mutating the structure you are iterating over.',
          'The invariant quietly broken by one line — check it holds at the top of the body.',
        ],
      },
      {
        kind: 'callout',
        tone: 'success',
        text: 'Finding your own bug, out loud, reads better than never having written it. Self-correction is a signal, not an admission.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'narration': {
    lede: 'Silence is the one thing interviewers do not forgive. This is what fills it — and none of these sentences require you to have solved anything yet.',
    blocks: [
      {
        kind: 'table',
        columns: ['Phase', 'Say something like'],
        rows: [
          ['Reading', '“Let me restate it: given X, return Y, and n goes up to 10⁵.”'],
          ['Sizing', '“So n log n or better — the O(n²) pair scan is out.”'],
          ['Brute force', '“The obvious version checks every pair, O(n²). Let me get that on the board and then improve it.”'],
          ['Hunting the jump', '“The waste is re-scanning the left side. If I remember what I have already seen, that lookup becomes O(1).”'],
          ['Choosing', '“So a hash map of value → index. I am picking it over sorting because I need the original indices.”'],
          ['Before coding', '“Edge cases: empty, size 1, duplicates, negatives. My invariant is that seen holds every index before i.”'],
          ['Stuck', '“I am stuck on X. What I know is A and B. Let me try a small example.”'],
          ['After coding', '“Tracing [2, 7, 11]: i is 0, seen is empty, 9 − 2 is 7, not there yet, store 2 → 0.”'],
        ],
        note: 'Every one of these is sayable before you know the answer. That is the point.',
      },
      {
        kind: 'bullets',
        title: 'Two rules',
        items: [
          'Never go more than about twenty seconds without saying something. A narrated wrong turn beats a silent right one.',
          '“I am stuck on X, here is what I do know” is not a failure — it is the sentence that invites a hint, and taking a hint well is itself a scored behaviour.',
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        text: 'Get the brute force said out loud and on the board early. It guarantees you finish with something, and it is the thing you optimise away from.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'templates': {
    lede: 'Rewrite these from memory daily. If you can write the templates cold, panic drops by more than half — the hands keep going while the head catches up.',
    link: { label: 'Drill them in the helpers toolkit', to: '/dsa/python-utils' },
    blocks: [
      {
        kind: 'table',
        columns: ['Template', 'Invariant it keeps', 'Trigger words in the prompt'],
        rows: [
          ['Frequency array', 'counts of everything seen so far', 'anagram, k distinct, most frequent'],
          ['Sliding window', 'window [l, r] always satisfies the constraint', 'longest / shortest subarray, at most k'],
          ['Two pointers', 'everything outside [l, r] is already decided', 'sorted, pair sum, palindrome'],
          ['Heap top-K', 'the heap holds the best k seen so far', 'k largest, merge k, median of a stream'],
          ['DFS', 'the path root → current sits on the stack', 'all paths, connected components, backtrack'],
          ['BFS', 'the queue holds exactly one whole level', 'shortest path, level order, minimum steps'],
          ['Binary search', 'the answer always lies inside [lo, hi]', 'sorted, minimise the maximum, monotonic check'],
          ['Interval merge', 'output stays sorted and non-overlapping', 'intervals, meeting rooms, calendar'],
        ],
        note: 'Drill: five-minute timer, write all eight from memory, then diff against the helpers page.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'composition': {
    lede: 'Most problems above Easy are two patterns stacked. Recognise the pair, not the whole.',
    blocks: [
      {
        kind: 'table',
        columns: ['Combination', 'What it produces', 'Classic problem'],
        rows: [
          ['Sliding window + hash map', 'longest window under a constraint', 'Longest substring without repeating characters'],
          ['Binary search + greedy', 'minimise the maximum', 'Capacity to ship packages / book allocation'],
          ['DFS + backtracking', 'enumerate every choice, undo cleanly', 'Permutations, combinations, N-Queens'],
          ['Heap + two pointers', 'merge ordered streams', 'Merge k sorted lists, k smallest pairs'],
          ['Prefix sum + hash map', 'count subarrays hitting a target', 'Subarray sum equals k'],
          ['Monotonic stack + index memory', 'nearest greater / smaller element', 'Daily temperatures, largest rectangle'],
        ],
        note: 'When a problem resists a single pattern, ask which two it is wearing.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'defaults': {
    lede: 'Pre-coding intuition, not implementation detail. These are cross-cutting — they apply whatever the problem is.',
    blocks: [
      {
        kind: 'table',
        title: 'Space complexity at a glance',
        columns: ['What you are doing', 'Space'],
        rows: [
          ['Array traversal', 'O(1)'],
          ['Prefix sum', 'O(n)'],
          ['HashMap / Set', 'O(n)'],
          ['Heap', 'O(n)'],
          ['BFS', 'O(V) — the queue'],
          ['DFS', 'O(V) — the recursion stack'],
        ],
        mono: [1],
        note: 'Say the space cost unprompted. It is the half of the answer most candidates skip.',
      },
      {
        kind: 'table',
        title: 'Default choice bias — decision muscle memory',
        columns: ['Situation', 'Default'],
        rows: [
          ['Unsure', 'HashMap'],
          ['Need order', 'TreeMap'],
          ['Sliding window', 'Deque'],
          ['Top-K', 'Heap'],
          ['Prefix search', 'Trie'],
          ['Range query', 'Segment tree'],
          ['Connectivity', 'Union-Find'],
        ],
        mono: [1],
        note: 'A default is a starting point you can justify, which beats a silent pause every time.',
      },
      {
        kind: 'compare',
        title: 'Language hygiene — the lines that lose marks',
        columns: [
          {
            title: 'Python',
            tone: 'primary',
            items: [
              '`heapq` is a min-heap only — push `-x` for a max-heap.',
              '`Counter` and `defaultdict` remove most manual initialisation.',
              '`deque` for O(1) pops at both ends; `list.pop(0)` is O(n).',
              'Recursion is capped near 1000 — deep DFS needs an explicit stack.',
              '`sorted()` returns a new list, `list.sort()` mutates in place; both are stable.',
              'Integers never overflow — say so rather than staying silent on it.',
            ],
          },
          {
            title: 'Java',
            tone: 'secondary',
            items: [
              'Prefer `ArrayDeque` over `Stack` — `Stack` is legacy and synchronised.',
              '`PriorityQueue` is a min-heap by default; reverse the comparator for max.',
              '`TreeMap` / `TreeSet` are red-black trees — O(log n), and they keep order.',
              '`HashMap` is not thread-safe.',
              '`LinkedList` is slow to traverse — random access is O(n).',
              '`int` overflows past ~2.1 × 10⁹ — use `long` for sums and midpoints.',
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'practice': {
    lede: 'Consistency beats marathon days. The point of a session is not problems closed — it is patterns you can re-derive tomorrow.',
    link: { label: 'Run the loop on cold recall', to: '/dsa/cold-recall' },
    blocks: [
      {
        kind: 'checklist',
        title: 'The 30-second loop, after every problem',
        items: [
          'Which rung did I actually reach — brute, better or best?',
          'What made the jump click, and would it click again cold tomorrow?',
          'What did I nearly get wrong, and why did I nearly get it wrong?',
          'Which template would have saved me time if I had reached for it sooner?',
        ],
        note: 'These are deliberately not the four questions from earlier — those run before you solve, these run after.',
      },
      {
        kind: 'table',
        title: 'A realistic day',
        columns: ['Block', 'Time', 'Purpose'],
        rows: [
          ['Warm-up', '30 min', 'Easy / medium — get the hands moving, rebuild templates'],
          ['Focus', '60–90 min', 'One or two medium/hard, fully understood'],
          ['Log', '10 min', 'Write down exactly one mistake you made today'],
        ],
        note: 'Forget heroic plans. This split is sustainable, which is the only property that matters.',
      },
      {
        kind: 'table',
        title: 'Weekly rotation — do not randomise',
        columns: ['Day', 'Focus'],
        rows: [
          ['1', 'Arrays / sliding window'],
          ['2', 'HashMap / prefix sum'],
          ['3', 'Stack / monotonic'],
          ['4', 'Trees'],
          ['5', 'Graphs'],
          ['6', 'Mixed'],
          ['7', 'Mock / review'],
        ],
        mono: [0],
        note: 'Rotation keeps every pattern within recall distance instead of letting the old ones rot.',
      },
      {
        kind: 'compare',
        title: 'What “solved” actually means',
        columns: [
          {
            title: 'Not solved',
            tone: 'error',
            items: ['You copied the approach.', 'You cannot explain why it works.', 'You would freeze if a constraint changed.'],
          },
          {
            title: 'Solved',
            tone: 'success',
            items: ['You can re-derive it tomorrow.', 'You can explain it without code.', 'You know its failure mode.'],
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'warning',
        title: 'Mock rule — non-negotiable',
        text: 'Once every 5–7 days: one problem, 30–40 minutes, spoken out loud, no IDE comforts. This exposes gaps faster than twenty problems solved silently.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  'mindset': {
    blocks: [
      {
        kind: 'compare',
        columns: [
          {
            title: 'Interviewers forgive',
            tone: 'success',
            items: ['Small bugs', 'Syntax slips', 'A partial solution'],
          },
          {
            title: 'They do not forgive',
            tone: 'error',
            items: ['Panic', 'Random data-structure choices', 'Silence'],
          },
        ],
      },
      {
        kind: 'callout',
        tone: 'primary',
        text: 'You do not need to be perfect. You need to be calm, structured and honest.',
      },
    ],
  },
}

export const playbook: Playbook = {
  ...meta,
  sections: playbookIndex.map(({ id, title }) => ({ id, title, ...bodies[id] })),
}

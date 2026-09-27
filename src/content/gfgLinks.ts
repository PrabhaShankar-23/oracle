/**
 * GeeksforGeeks links for cold recall cards, keyed by problem id. Every URL was checked to exist and its
 * page title compared with the problem. `related` marks a pattern article or a close variant, not the
 * same problem. Problems without a good match are left out. Families A–B (P01–P11) so far.
 */
export type GfgLink = { url: string; title: string; related?: boolean }

const g = (slug: string, title: string, related = false): GfgLink => ({
  url: `https://www.geeksforgeeks.org/dsa/${slug}/`,
  title,
  ...(related && { related }),
})

export const gfgLinks: Record<string, GfgLink> = {
  'P01-valid-palindrome': g('sentence-palindrome-palindrome-removing-spaces-dots-etc', 'Sentence Palindrome'),
  'P01-two-sum-ii-input-array-is-sorted': g('two-pointers-technique', 'Two Pointers Technique'),
  'P01-3sum': g('find-triplets-array-whose-sum-equal-zero', '3 Sum - Find All Triplets with Zero Sum'),
  'P01-container-with-most-water': g('container-with-most-water', 'Container with Most Water'),
  'P01-trapping-rain-water': g('trapping-rain-water', 'Trapping Rain Water Problem'),
  'P02-linked-list-cycle': g('detect-loop-in-a-linked-list', 'Detect Cycle in Linked List'),
  'P02-happy-number': g('happy-number', 'Digit Square Sequence (Happy Number)'),
  'P02-find-the-duplicate-number': g('duplicates-array-using-o1-extra-space-set-2', 'Duplicates in an array in O(n) and O(1) extra space', true),
  'P03-permutation-in-string': g('anagram-substring-search-search-permutations', 'Anagram Substring Search'),
  'P03-substring-with-concatenation-of-all-words': g('window-sliding-technique', 'Sliding Window Technique', true),
  'P04-longest-substring-without-repeating-characters': g('length-of-the-longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters'),
  'P04-longest-repeating-character-replacement': g('window-sliding-technique', 'Sliding Window Technique', true),
  'P04-minimum-size-subarray-sum': g('minimum-length-subarray-sum-greater-given-value', 'Smallest subarray with sum greater than a given value'),
  'P04-minimum-window-substring': g('find-the-smallest-window-in-a-string-containing-all-characters-of-another-string', 'Smallest window containing all characters of another string'),
  'P05-contains-duplicate-ii': g('check-given-array-contains-duplicate-elements-within-k-distance', 'Duplicate within K Distance in an Array'),
  'P05-subarray-sum-equals-k': g('number-subarrays-sum-exactly-equal-k', 'Count Subarrays having Sum K'),
  'P05-product-of-array-except-self': g('a-product-array-puzzle', 'Product of Array Except Self'),
  'P05-longest-consecutive-sequence': g('longest-consecutive-subsequence', 'Longest Consecutive Subsequence'),
  'P06-maximum-subarray': g('largest-sum-contiguous-subarray', "Maximum Subarray Sum - Kadane's Algorithm"),
  'P06-maximum-product-subarray': g('maximum-product-subarray', 'Maximum Product Subarray'),
  'P06-maximum-sum-circular-subarray': g('maximum-contiguous-circular-sum', 'Maximum Circular Subarray Sum'),
  'P07-remove-element': g('remove-element', 'Remove All Occurrences of an Element in an Array'),
  'P07-sort-colors': g('sort-an-array-of-0s-1s-and-2s', 'Sort an array of 0s, 1s and 2s'),
  'P07-remove-duplicates-from-sorted-array-ii': g('remove-duplicates-sorted-array', 'Remove duplicates from Sorted Array', true),
  'P08-merge-intervals': g('merging-intervals', 'Overlapping Intervals'),
  'P08-insert-interval': g('insert-in-sorted-and-non-overlapping-interval-array', 'Insert and Merge Interval'),
  'P09-missing-number': g('find-the-missing-number', 'Find the Missing Number'),
  'P09-first-missing-positive': g('find-the-smallest-positive-number-missing-from-an-unsorted-array', 'Smallest Missing Positive Number'),
  'P10-meeting-rooms': g('meeting-rooms-check-if-a-person-can-attend-all-meetings', 'Meeting Rooms'),
  'P10-non-overlapping-intervals': g('minimum-removals-required-to-make-ranges-non-overlapping', 'Non-Overlapping Intervals'),
  'P10-minimum-number-of-arrows-to-burst-balloons': g('activity-selection-problem-greedy-algo-1', 'Activity Selection', true),
  'P10-meeting-rooms-ii': g('minimum-number-platforms-required-railwaybus-station', 'Minimum Platforms Required', true),
  'P11-ipo': g('heap-data-structure', 'Heap Data Structure', true),
  'P11-find-median-from-data-stream': g('median-of-stream-of-integers-running-integers', 'Median of a Stream'),
}

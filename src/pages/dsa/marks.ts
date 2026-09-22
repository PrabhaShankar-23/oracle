import type { Difficulty } from '../../content/types'

/** Legend for the list markers on each problem. */
export const MARK_LABELS: Record<string, string> = {
  '★': 'On both NeetCode 150 and LC Top Interview 150',
  '◆': 'NeetCode 150',
  '▲': 'LeetCode Top Interview 150',
  '＋': 'Pattern-canonical',
  '🔒': 'LeetCode Premium',
}

export const DIFFICULTY_COLOR: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'error',
}

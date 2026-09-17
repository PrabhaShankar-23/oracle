import type { ApproachWalkthrough } from '../types'
import { p01 } from './p01.ts'

/** Problem id → approach walkthroughs (naive → best). Cards without an entry show the compact approach list. */
export const walkthroughs: Record<string, ApproachWalkthrough[]> = { ...p01 }

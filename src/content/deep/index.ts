import type { ApproachWalkthrough } from '../types'
import { p01 } from './p01.ts'
import { p02 } from './p02.ts'
import { p03 } from './p03.ts'
import { p04 } from './p04.ts'
import { p05 } from './p05.ts'
import { p06 } from './p06.ts'
import { p07 } from './p07.ts'

/** Problem id → approach walkthroughs (naive → best). Cards without an entry show the compact approach list. */
export const walkthroughs: Record<string, ApproachWalkthrough[]> = { ...p01, ...p02, ...p03, ...p04, ...p05, ...p06, ...p07 }

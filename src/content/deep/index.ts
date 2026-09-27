import type { ApproachWalkthrough } from '../types'
import { p01 } from './p01.ts'
import { p02 } from './p02.ts'
import { p03 } from './p03.ts'
import { p04 } from './p04.ts'
import { p05 } from './p05.ts'
import { p06 } from './p06.ts'
import { p07 } from './p07.ts'
import { p08 } from './p08.ts'
import { p09 } from './p09.ts'
import { p10 } from './p10.ts'
import { p11 } from './p11.ts'
import { p18 } from './p18.ts'

/** Problem id → approach walkthroughs (naive → best). Cards without an entry show the compact approach list. */
export const walkthroughs: Record<string, ApproachWalkthrough[]> = { ...p01, ...p02, ...p03, ...p04, ...p05, ...p06, ...p07, ...p08, ...p09, ...p10, ...p11, ...p18 }

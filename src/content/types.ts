export type Heading = { id: string; text: string; level: number }

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Approach = {
  label: string
  text: string
  complexity: string
  winner: boolean
}

export type Problem = {
  id: string
  title: string
  url: string
  difficulty: Difficulty
  marks: string[]
  lists: string[]
  state: string
  invariant: string
  approaches: Approach[]
  why?: string
  code?: string
  traps: string[]
}

export type Pattern = { id: string; name: string; problems: Problem[] }

/* ---------------- Cold recall: approach walkthroughs with diagrams ---------------- */

export type DiagramTone = 'primary' | 'secondary' | 'success' | 'error' | 'warning'
/** dim = discarded/skipped, match = checked and good, miss = checked and bad, active = in focus. */
export type CellState = 'dim' | 'match' | 'miss' | 'active'
export type DiagramPointer = { at: number; label: string; tone?: DiagramTone }

/** One step of an array walk: a row of cells with pointers above and an optional bracket below. */
export type CellsRow = {
  caption?: string
  cells: (string | number)[]
  pointers?: DiagramPointer[]
  states?: Partial<Record<number, CellState>>
  span?: { from: number; to: number; label: string }
  note?: string
}

/** One frame of a height chart (walls, water, containers). */
export type BarsRow = {
  caption?: string
  heights: number[]
  water?: number[]
  pointers?: DiagramPointer[]
  box?: { from: number; to: number; height: number; label: string }
  levels?: { value: number; from: number; to: number; label: string; tone?: DiagramTone }[]
  dim?: number[]
  note?: string
}

export type Diagram = { kind: 'cells'; rows: CellsRow[] } | { kind: 'bars'; rows: BarsRow[] }

export type ApproachWalkthrough = {
  name: string
  time: string
  space: string
  best?: boolean
  /** 4–6 short lines: the idea, the moves, why it is correct or where it wastes work. */
  points: string[]
  code: string
  diagrams: Diagram[]
}
export type Family = { id: string; name: string; patterns: Pattern[] }
export type ColdRecall = { title: string; intro: string; families: Family[] }

export type TagTone = 'primary' | 'success' | 'warning' | 'error'

export type CaseStudySummary = {
  slug: string
  title: string
  summary: string
  tags: { label: string; tone: TagTone }[]
  readingTime: string
}

export type CaseStudy = CaseStudySummary & {
  subtitle: string
  meta: string[]
  headings: Heading[]
  html: string
}

export type CaseStudies = {
  index: { title: string; subtitle: string; meta: string[]; headings: Heading[]; html: string }
  studies: CaseStudy[]
}

export type RevisionCard = {
  id: string
  number: number
  cover: boolean
  topic: string
  title: string
  titleHtml: string
  subtitle: string
  html: string
}

export type WebRtcDeck = { title: string; cards: RevisionCard[] }

export type UtilsLang = 'python' | 'java'

export type UtilsHelper = {
  /** Anchor id, e.g. `s2-is_palindrome`. Missing on header-less snippets (imports, constants, tests). */
  id?: string
  name?: string
  /** Source tag: `def`, `class`, `static`, `field`, … */
  kind?: string
  doc?: string
  code: string
}

export type UtilsSection = {
  id: string
  title: string
  lede?: string
  sheet: { label: string; code: string }[]
  helpers: UtilsHelper[]
}

export type UtilsToolkit = {
  lang: UtilsLang
  title: string
  subtitle: string
  meta: string
  stats: { value: string; label: string }[]
  sections: UtilsSection[]
}

export type Manifest = {
  dsa: {
    patterns: { id: string; name: string; family: string; count: number }[]
    problems: { id: string; title: string; pattern: string; difficulty: Difficulty }[]
  }
  caseStudies: (CaseStudySummary & { subtitle: string; meta: string[]; headings: Heading[] })[]
  webrtc: { id: string; number: number; title: string; topic: string }[]
  dsaUtils: { lang: UtilsLang; id: string; name: string; section: string }[]
}

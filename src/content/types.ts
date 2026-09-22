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

/** A vault Markdown note rendered to HTML (see ingestAiSystems). */
export type VaultDoc = {
  slug: string
  title: string
  /** Lines of the note's opening blockquote: created/revised, scope, pointers. */
  meta: string[]
  headings: Heading[]
  html: string
}

export type AiSystems = { docs: VaultDoc[] }

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

/** The vault's practice list (00-dsa-problem-solving-index.md): every problem in solve order. */
export type PracticeProblem = {
  /** Number in the note, 1…n — also the key for the solved ticks. */
  n: number
  title: string
  url: string
  difficulty: Difficulty
  /** First-pass problem (🟢 L1). */
  l1: boolean
  marks: string[]
  /** Cold recall card id, when the card exists. */
  recallId?: string
}

export type PracticeGroup = {
  id: string
  /** Pattern code (P01…); absent for the extra tracks. */
  code?: string
  name: string
  /** Cold recall pattern id (P01… or X1…). */
  recallId?: string
  problems: PracticeProblem[]
}

export type PracticeFamily = { id: string; name: string; note?: string; groups: PracticeGroup[] }

export type PracticeList = {
  title: string
  intro: string
  families: PracticeFamily[]
  guide: { id: string; title: string; html: string }[]
}

export type Manifest = {
  dsaPractice: { total: number; l1: number }
  dsa: {
    patterns: { id: string; name: string; family: string; count: number }[]
    problems: { id: string; title: string; pattern: string; difficulty: Difficulty }[]
  }
  caseStudies: (CaseStudySummary & { subtitle: string; meta: string[]; headings: Heading[] })[]
  webrtc: { id: string; number: number; title: string; topic: string }[]
  aiSystems: Omit<VaultDoc, 'html'>[]
  dsaUtils: { lang: UtilsLang; id: string; name: string; section: string }[]
  gameDay: {
    slug: string
    number: number
    icon: string
    title: string
    count: number
    bands: { id: string; letter: string | null; name: string; count: number }[]
  }[]
  gameDayDocs: (Omit<GameDayDoc, 'html'> & { headings: Heading[] })[]
  agenticDecisions: NoteSummary[]
  networking: NoteSummary[]
  python: NoteSummary[]
}

/** The row a note contributes to the manifest: enough for nav, search and the page header. */
export type NoteSummary = {
  slug: string
  title: string
  tier: DecisionTier
  relevance?: string
  section: string
  sectionTitle: string
}

/* ---------------- DSA thinking playbook (hand-written, not from the vault) ---------------- */

export type PlaybookTone = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error'

/** Rendering blocks for the playbook. Each section is a short stack of these. */
export type PlaybookBlock =
  /** A left-to-right pipeline (wraps to a column on compact). */
  | { kind: 'flow'; title?: string; steps: string[]; note?: string }
  /** Things to say out loud / tick off before coding. */
  | { kind: 'checklist'; title?: string; items: string[]; note?: string }
  /** `mono` lists the column indexes rendered in the monospace face. */
  | { kind: 'table'; title?: string; columns: string[]; rows: string[][]; mono?: number[]; note?: string }
  | { kind: 'cards'; title?: string; items: { title: string; text: string; code?: string; lang?: string }[] }
  | { kind: 'bullets'; title?: string; items: string[] }
  | { kind: 'compare'; title?: string; columns: { title: string; tone: PlaybookTone; items: string[] }[] }
  | { kind: 'code'; title?: string; lang: string; code: string; note?: string }
  | { kind: 'callout'; tone: PlaybookTone; title?: string; text: string }

export type PlaybookSection = {
  id: string
  title: string
  lede?: string
  /** Optional "go and drill this" pointer to another page. */
  link?: { label: string; to: string }
  blocks: PlaybookBlock[]
}

export type Playbook = {
  title: string
  subtitle: string
  intro: string[]
  sections: PlaybookSection[]
}

/* ---------------- Game Day recall (02-Game-Day) ---------------- */

/** ⭐ decides the round · 🔥 trending · 📍 actually asked */
export type GameDayMark = 'decides' | 'trending' | 'asked'

/** A link to a vault note. `to` is set only once that note is published on the site. */
export type GameDayLink = { label: string; target: string; to?: string }

/** A phrasing drill folded in beside a recall question — the scripted version of the answer. */
export type GameDayDrill = {
  prompt?: string
  badge?: string
  hint?: string
  points: string[]
  oneLiner?: string
  followUp?: string
  links: GameDayLink[]
}

export type GameDayQuestion = {
  id: string
  number: number
  text: string
  marks: GameDayMark[]
  badge?: string
  /** Keyword bullets as HTML — deliberately not prose. */
  points: string[]
  flow?: string
  trap?: string
  oneLiner?: string
  links: GameDayLink[]
  drill?: GameDayDrill
}

/** `A`–`F` for the six standard bands; `null` for appendix sections (♻️ merged, 📝 gaps). */
export type GameDayBand = {
  id: string
  letter: string | null
  name: string
  questions: GameDayQuestion[]
}

export type GameDayTopic = {
  slug: string
  number: number
  icon: string
  title: string
  meta: string[]
  bands: GameDayBand[]
}

/** The runbook and the story bank — prose, rendered as articles rather than Q&A. */
export type GameDayDoc = VaultDoc & { icon: string }

export type GameDayDocs = { docs: GameDayDoc[] }

export type GameDaySearchEntry = {
  id: string
  text: string
  topic: string
  topicTitle: string
  band: string
}

/* ---------------- Agentic design decisions (06-ai-systems/agentic-design) ---------------- */

export type DecisionTier = 'CORE' | 'SUPPORTING' | 'BREADTH'

/** One decision note: a fork an architect resolves out loud, rendered from vault Markdown. */
export type AgenticDecision = {
  slug: string
  number: number
  title: string
  category?: string
  relevance?: string
  tier: DecisionTier
  created?: string
  section: string
  sectionTitle: string
  headings: Heading[]
  html: string
}

export type AgenticSection = {
  id: string
  title: string
  notes: AgenticDecision[]
}

/* ---------------- Networking (01-Networking) ---------------- */

/** One networking concept note. Same shape as an agentic decision — one series, two folders. */
export type NetworkingNote = AgenticDecision

export type NetworkingChapter = {
  id: string
  title: string
  notes: NetworkingNote[]
}

/** One Python concept note — same series shape, from `07-python`. */
export type PythonNote = AgenticDecision

export type PythonChapter = {
  id: string
  title: string
  notes: PythonNote[]
}

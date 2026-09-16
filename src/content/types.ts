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

export type Manifest = {
  dsa: {
    patterns: { id: string; name: string; family: string; count: number }[]
    problems: { id: string; title: string; pattern: string; difficulty: Difficulty }[]
  }
  caseStudies: (CaseStudySummary & { subtitle: string; meta: string[]; headings: Heading[] })[]
  webrtc: { id: string; number: number; title: string; topic: string }[]
}

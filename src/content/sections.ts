/**
 * Site map. Every section in the notes vault is listed here: DSA first, then vault folder order
 * (01-System Design, 02-Interview, 05-AI-ML, …). The sidebar shows them in exactly this order.
 * A section with `pages: []` shows as "Soon" in the nav — add pages as notes move over.
 */
import type { SvgIconComponent } from '@mui/icons-material'
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'
import BoltOutlined from '@mui/icons-material/BoltOutlined'
import CloudOutlined from '@mui/icons-material/CloudOutlined'
import CoffeeOutlined from '@mui/icons-material/CoffeeOutlined'
import DataObjectOutlined from '@mui/icons-material/DataObjectOutlined'
import ForumOutlined from '@mui/icons-material/ForumOutlined'
import HubOutlined from '@mui/icons-material/HubOutlined'
import JavascriptOutlined from '@mui/icons-material/JavascriptOutlined'
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined'
import RecordVoiceOverOutlined from '@mui/icons-material/RecordVoiceOverOutlined'
import StorageOutlined from '@mui/icons-material/StorageOutlined'
import TerminalOutlined from '@mui/icons-material/TerminalOutlined'
import WebOutlined from '@mui/icons-material/WebOutlined'
import manifestJson from './generated/manifest.json'
import { shortTitle } from './titles'
import type { Manifest } from './types'

export const manifest = manifestJson as Manifest

const UTILS_LABEL = { python: 'Python helpers', java: 'Java helpers' }

export type NavPage = {
  title: string
  path: string
  description?: string
  /** Pages with the same group are listed together under a sub-heading. */
  group?: string
}

export type Section = {
  id: string
  title: string
  path: string
  description: string
  icon: SvgIconComponent
  pages: NavPage[]
}

export const sections: Section[] = [
  {
    id: 'dsa',
    title: 'DSA',
    path: '/dsa',
    description: 'Pattern-first data structures and algorithms.',
    icon: DataObjectOutlined,
    pages: [
      {
        title: 'Cold recall',
        path: '/dsa/cold-recall',
        description: `${manifest.dsa.problems.length} problems across ${manifest.dsa.patterns.length} patterns — state, invariant, approaches, code.`,
        group: 'Recall',
      },
      {
        title: 'Python helpers',
        path: '/dsa/python-utils',
        description: 'py_dsa_utils — syntax sheet, imports and copy-paste helpers for every pattern.',
        group: 'Toolkits',
      },
      {
        title: 'Java helpers',
        path: '/dsa/java-utils',
        description: 'JavaDsaUtils — the same toolkit in Java, with a syntax sheet and self-tests.',
        group: 'Toolkits',
      },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    path: '/system-design',
    description: 'LLD and HLD case studies, architecture references and revision cards.',
    icon: AccountTreeOutlined,
    pages: [
      {
        title: 'Case studies overview',
        path: '/system-design/case-studies',
        description: 'How the five problems relate, and the order to read them in.',
        group: 'Case studies',
      },
      ...manifest.caseStudies.map((s) => ({
        title: shortTitle(s.title),
        path: `/system-design/case-studies/${s.slug}`,
        description: s.summary,
        group: 'Case studies',
      })),
      ...manifest.aiSystems.map((d) => ({
        title: 'Agentic system design',
        path: `/system-design/ai-systems/${d.slug}`,
        description: 'Design-round view of agents: decisions, budgets and failure stories, 15 sections.',
        group: 'AI systems',
      })),
      {
        title: 'WebRTC revision cards',
        path: '/system-design/webrtc',
        description: 'Sixteen cards: signaling, ICE, DTLS/SRTP, SFUs and scaling tiers.',
        group: 'HLD',
      },
    ],
  },
  { id: 'interview', title: 'Interview', path: '/interview', description: 'Recall drills, project stories and question banks.', icon: RecordVoiceOverOutlined, pages: [] },
  { id: 'ai-ml', title: 'AI / ML', path: '/ai-ml', description: 'ML, deep learning, RAG, agents and LLM production.', icon: PsychologyOutlined, pages: [] },
  { id: 'ai-coding', title: 'AI Coding Patterns', path: '/ai-coding', description: 'Patterns for building with coding agents.', icon: AutoAwesomeOutlined, pages: [] },
  { id: 'python', title: 'Python', path: '/python', description: 'Language internals, async, packaging and the stdlib.', icon: TerminalOutlined, pages: [] },
  { id: 'java', title: 'Java', path: '/java', description: 'Core Java, collections and concurrency.', icon: CoffeeOutlined, pages: [] },
  { id: 'spring', title: 'Spring', path: '/spring', description: 'Spring Boot, data and security.', icon: BoltOutlined, pages: [] },
  { id: 'fastapi', title: 'FastAPI', path: '/fastapi', description: 'FastAPI services end to end.', icon: HubOutlined, pages: [] },
  { id: 'dbms', title: 'DBMS', path: '/dbms', description: 'Databases, indexing and transactions.', icon: StorageOutlined, pages: [] },
  { id: 'devops', title: 'DevOps', path: '/devops', description: 'Containers, CI/CD and cloud.', icon: CloudOutlined, pages: [] },
  { id: 'javascript', title: 'JavaScript', path: '/javascript', description: 'The language and the runtime.', icon: JavascriptOutlined, pages: [] },
  { id: 'react', title: 'React', path: '/react', description: 'React patterns and internals.', icon: WebOutlined, pages: [] },
  { id: 'communication', title: 'Communication', path: '/communication', description: 'Explaining, pitching and interviewing well.', icon: ForumOutlined, pages: [] },
]

export function findSection(pathname: string) {
  return sections.find((s) => pathname === s.path || pathname.startsWith(`${s.path}/`))
}

export function groupPages(pages: NavPage[]) {
  const groups = new Map<string, NavPage[]>()
  for (const p of pages) {
    const key = p.group ?? ''
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  return [...groups]
}

/* ------------------------------------------------------------------ */
/* Global search index                                                 */
/* ------------------------------------------------------------------ */

export type SearchItem = {
  key: string
  label: string
  secondary: string
  path: string
  group: string
}

export const searchIndex: SearchItem[] = [
  ...sections.flatMap((s) =>
    s.pages.map((p) => ({
      key: `page:${p.path}`,
      label: p.title,
      secondary: p.group ? `${s.title} · ${p.group}` : s.title,
      path: p.path,
      group: 'Pages',
    })),
  ),
  ...manifest.dsa.patterns.map((p) => ({
    key: `pattern:${p.id}`,
    label: `${p.id} · ${p.name}`,
    secondary: `${p.family} · ${p.count} problems`,
    path: `/dsa/cold-recall#${p.id}`,
    group: 'DSA patterns',
  })),
  ...manifest.dsa.problems.map((p) => ({
    key: `problem:${p.id}`,
    label: p.title,
    secondary: `${p.pattern} · ${p.difficulty}`,
    path: `/dsa/cold-recall#${p.id}`,
    group: 'DSA problems',
  })),
  ...manifest.caseStudies.flatMap((s) =>
    s.headings.map((h) => ({
      key: `heading:${s.slug}:${h.id}`,
      label: h.text.replace(/^[^\p{Letter}\p{Number}]+/u, ''),
      secondary: shortTitle(s.title),
      path: `/system-design/case-studies/${s.slug}#${h.id}`,
      group: 'System design sections',
    })),
  ),
  ...manifest.webrtc.map((c) => ({
    key: `webrtc:${c.id}`,
    label: c.title,
    secondary: `WebRTC card ${c.number} · ${c.topic}`,
    path: `/system-design/webrtc#${c.id}`,
    group: 'WebRTC cards',
  })),
  ...manifest.aiSystems.flatMap((d) =>
    d.headings.map((h) => ({
      key: `ai:${d.slug}:${h.id}`,
      label: h.text,
      secondary: 'Agentic system design',
      path: `/system-design/ai-systems/${d.slug}#${h.id}`,
      group: 'AI systems',
    })),
  ),
  ...manifest.dsaUtils.map((h) => ({
    key: `utils:${h.lang}:${h.id}`,
    label: h.name,
    secondary: `${UTILS_LABEL[h.lang]} · ${h.section.replace(/^[^\p{Letter}]+/u, '')}`,
    path: `/dsa/${h.lang}-utils#${h.id}`,
    group: 'DSA helpers',
  })),
]

import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import VaultDocArticle from '../../components/content/VaultDocArticle'
import { AI_CODING_SUBTITLES, manifest } from '../../content/sections'
import type { AiCodingDoc, AiCodingDocs } from '../../content/types'
import NotFoundPage from '../NotFoundPage'

/** The from-scratch checklist and the LLM coding rounds practice set. */
export default function AiCodingDocPage() {
  const { slug = '' } = useParams()
  const [doc, setDoc] = useState<AiCodingDoc | null>(null)

  const summary = manifest.aiCodingDocs.find((d) => d.slug === slug)

  useEffect(() => {
    if (!summary) return
    let live = true
    void import('../../content/generated/ai-coding-docs.json').then((m) => {
      if (live) setDoc((m.default as AiCodingDocs).docs.find((d) => d.slug === slug) ?? null)
    })
    return () => {
      live = false
    }
  }, [slug, summary])

  if (!summary) return <NotFoundPage />

  return (
    <VaultDocArticle
      crumbs={[{ label: 'AI Coding Patterns', to: '/ai-coding' }, { label: summary.title }]}
      title={`${summary.icon} ${summary.title}`.trim()}
      subtitle={AI_CODING_SUBTITLES[slug] ?? ''}
      headings={summary.headings}
      doc={doc}
    />
  )
}

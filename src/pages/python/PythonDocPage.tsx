import { useEffect, useState } from 'react'
import VaultDocArticle from '../../components/content/VaultDocArticle'
import { PYTHON_DOC_SUBTITLES, manifest } from '../../content/sections'
import type { AiCodingDoc, PythonDocs } from '../../content/types'
import NotFoundPage from '../NotFoundPage'

/** A Python drill page that isn't a topic note: the predict-the-output snippet bank. */
export default function PythonDocPage({ slug }: { slug: string }) {
  const [doc, setDoc] = useState<AiCodingDoc | null>(null)

  const summary = manifest.pythonDocs.find((d) => d.slug === slug)

  useEffect(() => {
    if (!summary) return
    let live = true
    void import('../../content/generated/python-docs.json').then((m) => {
      if (live) setDoc((m.default as PythonDocs).docs.find((d) => d.slug === slug) ?? null)
    })
    return () => {
      live = false
    }
  }, [slug, summary])

  if (!summary) return <NotFoundPage />

  return (
    <VaultDocArticle
      crumbs={[{ label: 'Python', to: '/python' }, { label: summary.title }]}
      title={`${summary.icon} ${summary.title}`.trim()}
      subtitle={PYTHON_DOC_SUBTITLES[slug] ?? ''}
      headings={summary.headings}
      doc={doc}
    />
  )
}

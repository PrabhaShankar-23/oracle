import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import VaultDocArticle from '../../components/content/VaultDocArticle'
import { manifest } from '../../content/sections'
import type { SdDoc, SdDocs } from '../../content/types'
import NotFoundPage from '../NotFoundPage'

/** A stand-alone System Design article: the pattern catalogue, HLD references, distributed-systems patterns. */
export default function SdDocPage() {
  const { slug = '' } = useParams()
  const [doc, setDoc] = useState<SdDoc | null>(null)
  const summary = manifest.sdDocs.find((d) => d.slug === slug)

  useEffect(() => {
    if (!summary) return
    let live = true
    void import('../../content/generated/sd-docs.json').then((m) => {
      if (live) setDoc((m.default as SdDocs).docs.find((d) => d.slug === slug) ?? null)
    })
    return () => {
      live = false
    }
  }, [slug, summary])

  if (!summary) return <NotFoundPage />

  const group = summary.group.replace(/^\d+\s+/, '')
  return (
    <VaultDocArticle
      crumbs={[
        { label: 'System Design', to: '/system-design' },
        { label: summary.subgroup ? `${group} · ${summary.subgroup}` : group },
        { label: summary.title },
      ]}
      title={summary.title}
      subtitle={summary.description}
      headings={summary.headings}
      doc={doc}
    />
  )
}

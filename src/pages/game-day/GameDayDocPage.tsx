import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import VaultDocArticle from '../../components/content/VaultDocArticle'
import { manifest } from '../../content/sections'
import type { GameDayDoc, GameDayDocs } from '../../content/types'
import NotFoundPage from '../NotFoundPage'

/** The runbook and the story bank — vault prose, rendered as an article with a contents rail. */
export default function GameDayDocPage() {
  const { slug = '' } = useParams()
  const [doc, setDoc] = useState<GameDayDoc | null>(null)

  const summary = manifest.gameDayDocs.find((d) => d.slug === slug)

  useEffect(() => {
    if (!summary) return
    let live = true
    void import('../../content/generated/game-day-docs.json').then((m) => {
      if (live) setDoc((m.default as GameDayDocs).docs.find((d) => d.slug === slug) ?? null)
    })
    return () => {
      live = false
    }
  }, [slug, summary])

  if (!summary) return <NotFoundPage />

  return (
    <VaultDocArticle
      crumbs={[{ label: 'Game Day', to: '/game-day' }, { label: summary.title }]}
      title={`${summary.icon} ${summary.title}`.trim()}
      subtitle={
        slug === 'runbook'
          ? 'What to open, and when, in the hour before.'
          : 'STAR stories — the ones you tell, with the numbers that make them land.'
      }
      headings={summary.headings}
      doc={doc}
    />
  )
}

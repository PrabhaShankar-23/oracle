import NotePage from '../../components/content/NotePage'
import { manifest } from '../../content/sections'
import type { NetworkingChapter } from '../../content/types'

// One lazy chunk per chapter, so a note loads only its own chapter's payload.
const CHUNKS = import.meta.glob<{ default: NetworkingChapter }>('../../content/generated/lld-*.json')

/** A low-level design note from the vault's `02-lld`: foundations, principles, patterns, concurrency, modeling. */
export default function LldNotePage() {
  return (
    <NotePage
      index={manifest.lld}
      chunks={CHUNKS}
      chunkKey={(section) => `../../content/generated/lld-${section.replace(/^\d+-/, '')}.json`}
      crumbs={[{ label: 'System Design', to: '/system-design' }, { label: 'LLD' }]}
      relevanceLabel="architect relevance"
    />
  )
}

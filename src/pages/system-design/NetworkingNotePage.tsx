import NotePage from '../../components/content/NotePage'
import { manifest } from '../../content/sections'
import type { NetworkingChapter } from '../../content/types'

// One lazy chunk per chapter, so a note loads only its own chapter's payload.
const CHUNKS = import.meta.glob<{ default: NetworkingChapter }>('../../content/generated/networking-*.json')

/** A concept note from the vault's Networking series: 174 notes across sixteen chapters. */
export default function NetworkingNotePage() {
  return (
    <NotePage
      index={manifest.networking}
      chunks={CHUNKS}
      chunkKey={(section) => `../../content/generated/networking-${section.replace(/^\d+-/, '')}.json`}
      crumbs={[{ label: 'System Design', to: '/system-design' }, { label: 'Networking' }]}
      relevanceLabel="architect relevance"
    />
  )
}

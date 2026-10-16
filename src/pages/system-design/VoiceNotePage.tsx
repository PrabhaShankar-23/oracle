import NotePage from '../../components/content/NotePage'
import { manifest } from '../../content/sections'
import type { VoiceChapter } from '../../content/types'

// One lazy chunk per chapter, so a note loads only its own chapter's payload.
const CHUNKS = import.meta.glob<{ default: VoiceChapter }>('../../content/generated/voice-*.json')

/** A note from the vault's Voice AI series: one spoken turn, ten stages, nine chapters. */
export default function VoiceNotePage() {
  return (
    <NotePage
      index={manifest.voice}
      chunks={CHUNKS}
      chunkKey={(section) => `../../content/generated/voice-${section.replace(/^\d+-/, '')}.json`}
      crumbs={[{ label: 'System Design', to: '/system-design' }, { label: 'Voice AI' }]}
      relevanceLabel="relevance"
    />
  )
}

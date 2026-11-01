import NotePage from '../../components/content/NotePage'
import { manifest } from '../../content/sections'
import type { PromptChapter } from '../../content/types'

// One lazy chunk per chapter, so a note loads only its own chapter's payload.
const CHUNKS = import.meta.glob<{ default: PromptChapter }>('../../content/generated/prompt-*.json')

/** A note from the vault's prompt-engineering pillar: twelve chapters along the life of a prompt. */
export default function PromptNotePage() {
  return (
    <NotePage
      index={manifest.promptEngineering}
      chunks={CHUNKS}
      chunkKey={(section) => `../../content/generated/prompt-${section.replace(/^\d+-/, '')}.json`}
      crumbs={[{ label: 'AI / ML', to: '/ai-ml' }, { label: 'Prompt engineering' }]}
      relevanceLabel="level"
    />
  )
}

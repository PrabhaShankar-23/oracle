import NotePage from '../../components/content/NotePage'
import { manifest } from '../../content/sections'
import type { AgenticSection } from '../../content/types'

// One lazy chunk per section, so a note loads only its own section's payload.
const CHUNKS = import.meta.glob<{ default: AgenticSection }>('../../content/generated/agentic-*.json')

/** A decision note from the vault's agentic-design series: the fork, the flips, the numbers. */
export default function AgenticDecisionPage() {
  return (
    <NotePage
      index={manifest.agenticDecisions}
      chunks={CHUNKS}
      chunkKey={(section) => `../../content/generated/agentic-${section.replace(/^\d+-/, '')}.json`}
      crumbs={[
        { label: 'System Design', to: '/system-design' },
        { label: 'Agentic design', to: '/system-design/ai-systems/agentic-design' },
      ]}
      relevanceLabel="round relevance"
    />
  )
}

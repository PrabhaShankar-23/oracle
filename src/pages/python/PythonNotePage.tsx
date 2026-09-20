import NotePage from '../../components/content/NotePage'
import { manifest } from '../../content/sections'
import type { PythonChapter } from '../../content/types'

// One lazy chunk per chapter, so a note loads only its own chapter's payload.
const CHUNKS = import.meta.glob<{ default: PythonChapter }>('../../content/generated/python-*.json')

/** A concept note from the vault's Python series. */
export default function PythonNotePage() {
  return (
    <NotePage
      index={manifest.python}
      chunks={CHUNKS}
      chunkKey={(section) => `../../content/generated/python-${section.replace(/^\d+-/, '')}.json`}
      crumbs={[{ label: 'Python', to: '/python' }]}
      relevanceLabel="level"
    />
  )
}

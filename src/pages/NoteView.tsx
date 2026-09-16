import Markdown from 'react-markdown'
import { Link, useParams } from 'react-router'
import remarkGfm from 'remark-gfm'
import { getNote } from '../lib/notes'

export default function NoteView() {
  const slug = useParams()['*'] ?? ''
  const note = getNote(slug)

  if (!note) {
    return (
      <>
        <h1>Not found</h1>
        <p>
          No note at <code>{slug}</code>. <Link to="/">Back to all notes</Link>
        </p>
      </>
    )
  }

  return (
    <article className="note">
      <p className="muted">
        <Link to="/">← All notes</Link>
        {note.date && <> · {note.date}</>}
        {note.tags.length > 0 && <> · {note.tags.map((t) => `#${t}`).join(' ')}</>}
      </p>
      <Markdown remarkPlugins={[remarkGfm]}>{note.body}</Markdown>
    </article>
  )
}

import { useState } from 'react'
import { Link } from 'react-router'
import { notes } from '../lib/notes'

export default function Home() {
  const [query, setQuery] = useState('')
  const q = query.toLowerCase()
  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q)) ||
      n.body.toLowerCase().includes(q),
  )

  const sections = new Map<string, typeof notes>()
  for (const n of filtered) {
    sections.set(n.section, [...(sections.get(n.section) ?? []), n])
  }

  return (
    <>
      <input
        className="search"
        type="search"
        placeholder={`Search ${notes.length} notes…`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filtered.length === 0 && <p className="muted">No notes match.</p>}
      {[...sections].map(([section, items]) => (
        <section key={section} className="section">
          {section && <h2>{section}</h2>}
          <ul className="note-list">
            {items.map((n) => (
              <li key={n.slug}>
                <Link to={`/notes/${n.slug}`}>{n.title}</Link>
                {n.date && <span className="muted"> · {n.date}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

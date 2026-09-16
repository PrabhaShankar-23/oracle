export type Note = {
  slug: string
  title: string
  section: string
  date?: string
  tags: string[]
  body: string
}

// Every Markdown file under /notes is bundled at build time.
const files = import.meta.glob('/notes/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  const data: Record<string, string> = {}
  if (!match) return { data, body: raw }

  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i === -1) continue
    data[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { data, body: raw.slice(match[0].length) }
}

function parseTags(value?: string) {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function titleFromSlug(slug: string) {
  const last = slug.split('/').pop() ?? slug
  return last.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export const notes: Note[] = Object.entries(files)
  .map(([path, raw]) => {
    const slug = path.replace(/^\/notes\//, '').replace(/\.md$/, '')
    const { data, body } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title || titleFromSlug(slug),
      section: slug.includes('/') ? slug.split('/').slice(0, -1).join('/') : '',
      date: data.date,
      tags: parseTags(data.tags),
      body,
    }
  })
  .sort((a, b) => a.slug.localeCompare(b.slug))

export function getNote(slug: string) {
  return notes.find((n) => n.slug === slug)
}

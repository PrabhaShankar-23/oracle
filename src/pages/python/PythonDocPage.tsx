import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import VaultDocArticle from '../../components/content/VaultDocArticle'
import { PYTHON_DOC_SUBTITLES, manifest } from '../../content/sections'
import type { AiCodingDoc, PythonDocs } from '../../content/types'
import { HEADER_HEIGHT } from '../../theme/theme'
import NotFoundPage from '../NotFoundPage'

/** A Python drill page that isn't a topic note: the predict-the-output snippet bank. */
export default function PythonDocPage({ slug }: { slug: string }) {
  const [doc, setDoc] = useState<AiCodingDoc | null>(null)
  // Both off by default: every answer stays closed until you open it, one at a time or all at once.
  const [answers, setAnswers] = useState(false)
  const [deeper, setDeeper] = useState(false)
  const body = useRef<HTMLDivElement>(null)

  const summary = manifest.pythonDocs.find((d) => d.slug === slug)

  useEffect(() => {
    if (!summary) return
    let live = true
    void import('../../content/generated/python-docs.json').then((m) => {
      if (live) setDoc((m.default as PythonDocs).docs.find((d) => d.slug === slug) ?? null)
    })
    return () => {
      live = false
    }
  }, [slug, summary])

  // The switches set every toggle at once; single toggles still open and close by hand afterwards.
  useEffect(() => {
    const root = body.current
    if (!root) return
    root.querySelectorAll<HTMLDetailsElement>('details.callout-success').forEach((d) => (d.open = answers))
    root.querySelectorAll<HTMLDetailsElement>('details.callout-example').forEach((d) => (d.open = deeper))
  }, [doc, answers, deeper])

  if (!summary) return <NotFoundPage />

  const count = doc ? (doc.html.match(/callout-success/g) ?? []).length : null

  const toolbar = (
    <Box
      sx={(t) => ({
        position: 'sticky',
        top: HEADER_HEIGHT,
        zIndex: 2,
        mb: 3,
        px: 2,
        py: 1,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        columnGap: 3,
        borderRadius: 1,
        border: `1px solid ${t.vars.palette.divider}`,
        backgroundColor: t.vars.palette.surface.containerLow,
      })}
    >
      <FormControlLabel
        control={
          <Switch
            checked={answers}
            onChange={(e) => {
              setAnswers(e.target.checked)
              if (!e.target.checked) setDeeper(false)
            }}
          />
        }
        label="Show answers"
        sx={{ mr: 0, whiteSpace: 'nowrap' }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={deeper}
            onChange={(e) => {
              setDeeper(e.target.checked)
              if (e.target.checked) setAnswers(true)
            }}
          />
        }
        label="Show 🔍 Go deeper"
        sx={{ mr: 0, whiteSpace: 'nowrap' }}
      />
      <Box sx={{ flex: 1 }} />
      {count !== null && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {answers ? `${count} answers open` : 'Answers closed: predict first'}
        </Typography>
      )}
    </Box>
  )

  return (
    <VaultDocArticle
      crumbs={[{ label: 'Python', to: '/python' }, { label: summary.title }]}
      title={`${summary.icon} ${summary.title}`.trim()}
      subtitle={PYTHON_DOC_SUBTITLES[slug] ?? ''}
      headings={summary.headings}
      doc={doc}
      toolbar={doc ? toolbar : null}
      bodyRef={body}
    />
  )
}

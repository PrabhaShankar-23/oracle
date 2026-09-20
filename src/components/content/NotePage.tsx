import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import type { AgenticDecision, DecisionTier, NoteSummary } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import NotFoundPage from '../../pages/NotFoundPage'
import HtmlContent from './HtmlContent'
import PageContainer from './PageContainer'
import PageHeader from './PageHeader'
import TableOfContents from './TableOfContents'

const TIER_COLOR: Record<DecisionTier, 'error' | 'warning' | 'success'> = {
  CORE: 'error',
  SUPPORTING: 'warning',
  BREADTH: 'success',
}

type Crumb = { label: string; to?: string }

type Props = {
  /** Manifest rows for this series, used to resolve the slug before the payload loads. */
  index: NoteSummary[]
  /** Lazy loaders keyed by generated-JSON path — one chunk per section. */
  chunks: Record<string, () => Promise<{ default: { notes: AgenticDecision[] } }>>
  /** Builds the chunk key from a note's section id. */
  chunkKey: (section: string) => string
  /** Breadcrumbs shown before the note's own section. */
  crumbs: Crumb[]
  /** Wording for the relevance chip, which differs per series. */
  relevanceLabel: string
}

/**
 * One note from a vault series: metadata chips, the rendered HTML and a table of contents
 * (sticky rail at `lg`+, drawer below). Shared by the agentic and networking series, which
 * produce the same note shape from different folders.
 */
export default function NotePage({ index, chunks, chunkKey, crumbs, relevanceLabel }: Props) {
  const { slug = '' } = useParams()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  // Keyed by slug so navigating between notes drops the previous payload during render,
  // rather than flashing the old note while the next chunk loads.
  const [loaded, setLoaded] = useState<{ slug: string; note: AgenticDecision | null }>({ slug: '', note: null })
  const [tocOpen, setTocOpen] = useState(false)

  const summary = index.find((d) => d.slug === slug)
  const note = loaded.slug === slug ? loaded.note : null

  useEffect(() => {
    if (!summary) return
    let live = true
    void chunks[chunkKey(summary.section)]?.().then((m) => {
      if (live) setLoaded({ slug, note: m.default.notes.find((n) => n.slug === slug) ?? null })
    })
    return () => {
      live = false
    }
  }, [slug, summary, chunks, chunkKey])

  if (!summary) return <NotFoundPage />

  const hasToc = !!note && note.headings.length > 1

  return (
    <PageContainer>
      <PageHeader crumbs={[...crumbs, { label: summary.sectionTitle }]} title={summary.title} subtitle={note?.category}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip size="small" label={summary.tier} color={TIER_COLOR[summary.tier]} />
          {summary.relevance && <Chip size="small" variant="outlined" label={`${summary.relevance} ${relevanceLabel}`} />}
          {note?.created && <Chip size="small" variant="outlined" label={note.created} />}
          {!desktop && hasToc && (
            <Button size="small" variant="outlined" startIcon={<TocIcon />} onClick={() => setTocOpen(true)} sx={{ minHeight: 44 }}>
              Contents
            </Button>
          )}
        </Stack>
      </PageHeader>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: `minmax(0, ${READING_MAX_WIDTH}px) 280px` },
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>{note && <HtmlContent html={note.html} />}</Box>

        {desktop && hasToc && (
          <Box
            component="aside"
            sx={{
              position: 'sticky',
              top: HEADER_HEIGHT + 16,
              alignSelf: 'start',
              maxHeight: `calc(100dvh - ${HEADER_HEIGHT + 32}px)`,
              overflowY: 'auto',
            }}
          >
            <TableOfContents headings={note.headings} />
          </Box>
        )}
      </Box>

      {!desktop && note && (
        <Drawer
          anchor="right"
          open={tocOpen}
          onClose={() => setTocOpen(false)}
          slotProps={{ paper: { sx: { width: 'min(340px, 88vw)', borderRadius: '16px 0 0 16px', py: 2, px: 1 } } }}
        >
          <TableOfContents headings={note.headings} onNavigate={() => setTocOpen(false)} />
        </Drawer>
      )}
    </PageContainer>
  )
}

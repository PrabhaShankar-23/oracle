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
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import TableOfContents from '../../components/content/TableOfContents'
import { manifest } from '../../content/sections'
import type { AgenticDecision, AgenticSection, DecisionTier } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import NotFoundPage from '../NotFoundPage'

// One lazy chunk per section, so a note loads only its own section's payload.
const SECTIONS = import.meta.glob<{ default: AgenticSection }>('../../content/generated/agentic-*.json')

const TIER_COLOR: Record<DecisionTier, 'error' | 'warning' | 'success'> = {
  CORE: 'error',
  SUPPORTING: 'warning',
  BREADTH: 'success',
}

/** A decision note from the vault's agentic-design series: the fork, the flips, the numbers. */
export default function AgenticDecisionPage() {
  const { slug = '' } = useParams()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [note, setNote] = useState<AgenticDecision | null>(null)
  const [tocOpen, setTocOpen] = useState(false)

  const summary = manifest.agenticDecisions.find((d) => d.slug === slug)

  useEffect(() => {
    if (!summary) return
    let live = true
    const key = `../../content/generated/agentic-${summary.section.replace(/^\d+-/, '')}.json`
    void SECTIONS[key]?.().then((m) => {
      if (live) setNote(m.default.notes.find((n) => n.slug === slug) ?? null)
    })
    return () => {
      live = false
    }
  }, [slug, summary])

  if (!summary) return <NotFoundPage />

  return (
    <PageContainer>
      <PageHeader
        crumbs={[
          { label: 'System Design', to: '/system-design' },
          { label: 'Agentic design', to: '/system-design/ai-systems/agentic-design' },
          { label: summary.sectionTitle },
        ]}
        title={summary.title}
        subtitle={note?.category}
      >
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip size="small" label={summary.tier} color={TIER_COLOR[summary.tier]} />
          {summary.relevance && <Chip size="small" variant="outlined" label={`${summary.relevance} round relevance`} />}
          {note?.created && <Chip size="small" variant="outlined" label={note.created} />}
          {!desktop && note && note.headings.length > 1 && (
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

        {desktop && note && note.headings.length > 1 && (
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

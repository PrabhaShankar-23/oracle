import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import TableOfContents from '../../components/content/TableOfContents'
import { manifest } from '../../content/sections'
import type { GameDayDoc, GameDayDocs } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import NotFoundPage from '../NotFoundPage'

/** The runbook and the story bank — vault prose, rendered as an article with a contents rail. */
export default function GameDayDocPage() {
  const { slug = '' } = useParams()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [doc, setDoc] = useState<GameDayDoc | null>(null)
  const [tocOpen, setTocOpen] = useState(false)

  const summary = manifest.gameDayDocs.find((d) => d.slug === slug)

  useEffect(() => {
    if (!summary) return
    let live = true
    void import('../../content/generated/game-day-docs.json').then((m) => {
      if (live) setDoc((m.default as GameDayDocs).docs.find((d) => d.slug === slug) ?? null)
    })
    return () => {
      live = false
    }
  }, [slug, summary])

  if (!summary) return <NotFoundPage />

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'Game Day', to: '/game-day' }, { label: summary.title }]}
        title={`${summary.icon} ${summary.title}`.trim()}
        subtitle={
          slug === 'runbook'
            ? 'What to open, and when, in the hour before.'
            : 'STAR stories — the ones you tell, with the numbers that make them land.'
        }
      >
        {!desktop && summary.headings.length > 1 && (
          <Button variant="outlined" startIcon={<TocIcon />} onClick={() => setTocOpen(true)} sx={{ minHeight: 44 }}>
            Contents
          </Button>
        )}
      </PageHeader>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: `minmax(0, ${READING_MAX_WIDTH}px) 280px` },
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {doc?.meta && doc.meta.length > 0 && (
            <Box
              component="aside"
              sx={(t) => ({
                mb: 3,
                p: 2,
                borderRadius: 2,
                borderLeft: `4px solid ${t.vars.palette.primary.main}`,
                backgroundColor: t.vars.palette.surface.containerLow,
                typography: 'body2',
                color: 'text.secondary',
                '& p': { m: 0, mb: 0.5 },
              })}
            >
              {doc.meta.map((line) => (
                <HtmlContent key={line} html={`<p>${line}</p>`} />
              ))}
            </Box>
          )}
          {doc && <HtmlContent html={doc.html} />}
        </Box>

        {desktop && summary.headings.length > 1 && (
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
            <TableOfContents headings={summary.headings} />
          </Box>
        )}
      </Box>

      {!desktop && (
        <Drawer
          anchor="right"
          open={tocOpen}
          onClose={() => setTocOpen(false)}
          slotProps={{ paper: { sx: { width: 'min(340px, 88vw)', borderRadius: '16px 0 0 16px', py: 2, px: 1 } } }}
        >
          <TableOfContents headings={summary.headings} onNavigate={() => setTocOpen(false)} />
        </Drawer>
      )}
    </PageContainer>
  )
}

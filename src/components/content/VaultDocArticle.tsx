import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import type { Heading, VaultDoc } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import HtmlContent from './HtmlContent'
import PageContainer from './PageContainer'
import PageHeader from './PageHeader'
import TableOfContents from './TableOfContents'

type Props = {
  crumbs: { label: string; to?: string }[]
  title: string
  subtitle: string
  /** From the manifest, so the contents rail shows before the article loads. */
  headings: Heading[]
  /** The lazily loaded article; `null` while it loads. */
  doc: Pick<VaultDoc, 'meta' | 'html'> | null
}

/** A vault prose note as an article: meta box, body, and a contents rail (a drawer below `lg`). */
export default function VaultDocArticle({ crumbs, title, subtitle, headings, doc }: Props) {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [tocOpen, setTocOpen] = useState(false)

  return (
    <PageContainer>
      <PageHeader crumbs={crumbs} title={title} subtitle={subtitle}>
        {!desktop && headings.length > 1 && (
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
                borderRadius: 1,
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

        {desktop && headings.length > 1 && (
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
            <TableOfContents headings={headings} />
          </Box>
        )}
      </Box>

      {!desktop && (
        <Drawer
          anchor="right"
          open={tocOpen}
          onClose={() => setTocOpen(false)}
          slotProps={{ paper: { sx: { width: 'min(340px, 88vw)', borderRadius: '6px 0 0 6px', py: 2, px: 1 } } }}
        >
          <TableOfContents headings={headings} onNavigate={() => setTocOpen(false)} />
        </Drawer>
      )}
    </PageContainer>
  )
}

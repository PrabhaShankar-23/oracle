import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { useParams } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import TableOfContents from '../../components/content/TableOfContents'
import data from '../../content/generated/ai-systems.json'
import type { AiSystems } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import NotFoundPage from '../NotFoundPage'

const { docs } = data as AiSystems

const Html = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />

/** A vault Markdown note from 01-System Design/06-ai-systems. */
export default function AiSystemsPage() {
  const { slug } = useParams()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [tocOpen, setTocOpen] = useState(false)

  const doc = docs.find((d) => d.slug === slug)
  if (!doc) return <NotFoundPage />
  const [created, summary, ...rest] = doc.meta

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'System Design', to: '/system-design' }, { label: 'AI systems' }]}
        title={doc.title}
        subtitle={summary ? <Html html={summary} /> : undefined}
      >
        <Stack spacing={0.5} sx={{ typography: 'body2', color: 'text.secondary', maxWidth: READING_MAX_WIDTH }}>
          {created && (
            <Typography variant="caption" component="div">
              <Html html={created} />
            </Typography>
          )}
          {rest.map((line) => (
            <Typography key={line} variant="caption" component="div" sx={{ '& code': { fontSize: '0.95em' } }}>
              <Html html={line} />
            </Typography>
          ))}
        </Stack>
      </PageHeader>

      {!desktop && (
        <Button variant="outlined" startIcon={<TocIcon />} onClick={() => setTocOpen(true)} sx={{ mb: 2 }}>
          Contents
        </Button>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: `minmax(0, ${READING_MAX_WIDTH}px) 280px` },
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        <Box component="article" sx={{ minWidth: 0 }}>
          <HtmlContent html={doc.html} />
        </Box>

        {desktop && (
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
            <TableOfContents headings={doc.headings} />
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
          <TableOfContents headings={doc.headings} onNavigate={() => setTocOpen(false)} />
        </Drawer>
      )}
    </PageContainer>
  )
}

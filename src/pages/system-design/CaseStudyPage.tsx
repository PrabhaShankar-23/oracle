import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import TableOfContents from '../../components/content/TableOfContents'
import data from '../../content/generated/case-studies.json'
import { shortTitle } from '../../content/titles'
import type { CaseStudies } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import NotFoundPage from '../NotFoundPage'

const { studies } = data as CaseStudies

export default function CaseStudyPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [tocOpen, setTocOpen] = useState(false)
  const [hideAnswers, setHideAnswers] = useState(false)

  const i = studies.findIndex((s) => s.slug === slug)
  if (i === -1) return <NotFoundPage />
  const study = studies[i]
  const prev = studies[i - 1]
  const next = studies[i + 1]
  const hasRecall = study.html.includes('recall-tbl')

  return (
    <PageContainer>
      <PageHeader
        crumbs={[
          { label: 'System Design', to: '/system-design' },
          { label: 'Case studies', to: '/system-design/case-studies' },
          { label: shortTitle(study.title) },
        ]}
        title={study.title.replace(/^System Design:\s*/, '')}
        subtitle={study.subtitle}
      >
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {study.tags.map((t) => (
            <Chip key={t.label} label={t.label} size="small" color={t.tone} />
          ))}
          {study.meta.filter((m) => !m.startsWith('Source')).map((m) => (
            <Chip key={m} label={m} size="small" variant="outlined" />
          ))}
        </Stack>
      </PageHeader>

      {/* Page controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <FormControl size="small" sx={{ minWidth: { sm: 260 } }}>
          <InputLabel id="study-label">Case study</InputLabel>
          <Select
            labelId="study-label"
            label="Case study"
            value={study.slug}
            onChange={(e) => navigate(`/system-design/case-studies/${e.target.value}`)}
          >
            {studies.map((s) => (
              <MenuItem key={s.slug} value={s.slug}>
                {shortTitle(s.title)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
          {hasRecall ? (
            <FormControlLabel
              control={<Switch checked={hideAnswers} onChange={(e) => setHideAnswers(e.target.checked)} />}
              label="Hide recall answers"
            />
          ) : (
            <span />
          )}
          {!desktop && (
            <Button variant="outlined" startIcon={<TocIcon />} onClick={() => setTocOpen(true)}>
              Contents
            </Button>
          )}
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: `minmax(0, ${READING_MAX_WIDTH}px) 280px` }, gap: 6, justifyContent: 'space-between' }}>
        <Box component="article" sx={{ minWidth: 0 }}>
          <HtmlContent html={study.html} hideRecallAnswers={hideAnswers} />

          <Stack direction="row" spacing={2} sx={{ mt: 6, justifyContent: 'space-between' }}>
            {prev ? (
              <Button component={Link} to={`/system-design/case-studies/${prev.slug}`} startIcon={<ArrowBackIcon />} sx={{ textAlign: 'left' }}>
                {shortTitle(prev.title)}
              </Button>
            ) : (
              <span />
            )}
            {next && (
              <Button component={Link} to={`/system-design/case-studies/${next.slug}`} endIcon={<ArrowForwardIcon />} sx={{ textAlign: 'right' }}>
                {shortTitle(next.title)}
              </Button>
            )}
          </Stack>
        </Box>

        {desktop && (
          <Box component="aside" sx={{ position: 'sticky', top: HEADER_HEIGHT + 16, alignSelf: 'start', maxHeight: `calc(100dvh - ${HEADER_HEIGHT + 32}px)`, overflowY: 'auto' }}>
            <TableOfContents headings={study.headings} />
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
          <TableOfContents headings={study.headings} onNavigate={() => setTocOpen(false)} />
        </Drawer>
      )}
    </PageContainer>
  )
}

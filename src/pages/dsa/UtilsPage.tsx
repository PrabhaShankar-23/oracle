import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { memo, useDeferredValue, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import TableOfContents from '../../components/content/TableOfContents'
import type { UtilsHelper, UtilsLang, UtilsToolkit } from '../../content/types'
import { codeBlockHtml } from '../../lib/codeHtml'
import { FONT_MONO, HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'

const LANGS: Record<UtilsLang, { label: string; path: string }> = {
  python: { label: 'Python', path: '/dsa/python-utils' },
  java: { label: 'Java', path: '/dsa/java-utils' },
}

const stripTags = (s = '') => s.replace(/<[^>]+>/g, '')

type Props = { toolkit: UtilsToolkit }

/** A DSA helper toolkit (py_dsa_utils / JavaDsaUtils): syntax sheet, imports and helper snippets with a filter. */
export default function UtilsPage({ toolkit }: Props) {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const navigate = useNavigate()
  const { hash } = useLocation()
  const [query, setQuery] = useState('')
  const [tocOpen, setTocOpen] = useState(false)
  const term = useDeferredValue(query.trim().toLowerCase())

  const searchText = useMemo(
    () =>
      new Map<object, string>(
        toolkit.sections.flatMap((s) => [
          ...s.helpers.map((h) => [h, [h.name, stripTags(h.doc), h.code].join(' ').toLowerCase()] as const),
          ...s.sheet.map((r) => [r, `${r.label} ${r.code}`.toLowerCase()] as const),
        ]),
      ),
    [toolkit],
  )

  const visible = useMemo(() => {
    if (!term) return toolkit.sections
    const match = (item: object) => searchText.get(item)?.includes(term)
    return toolkit.sections
      .map((s) => ({ ...s, sheet: s.sheet.filter(match), helpers: s.helpers.filter(match) }))
      .filter((s) => s.sheet.length > 0 || s.helpers.length > 0)
  }, [toolkit, term, searchText])

  const total = toolkit.sections.reduce((n, s) => n + s.helpers.filter((h) => h.name).length, 0)
  const shown = visible.reduce((n, s) => n + s.helpers.filter((h) => h.name).length, 0)
  const headings = useMemo(() => visible.map((s) => ({ id: s.id, text: s.title, level: 2 })), [visible])

  // A deep link (global search, #anchor) must not point into a filtered-out helper.
  useEffect(() => {
    if (!hash) return
    // oxlint-disable-next-line react/set-state-in-effect
    setQuery('')
  }, [hash])

  const { label } = LANGS[toolkit.lang]

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'DSA', to: '/dsa' }, { label: `${label} helpers` }]}
        title={`${label} DSA helpers`}
        subtitle={toolkit.subtitle}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={toolkit.lang}
              onChange={(_, lang: UtilsLang | null) => lang && navigate(LANGS[lang].path)}
              aria-label="Language"
              sx={{ mr: 1 }}
            >
              {(Object.keys(LANGS) as UtilsLang[]).map((l) => (
                <ToggleButton key={l} value={l} sx={{ minHeight: 44, px: 2 }}>
                  {LANGS[l].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {toolkit.stats.map((s) => (
              <Chip key={s.label} label={`${s.value} ${s.label}`} size="small" variant="outlined" />
            ))}
          </Stack>
          <HtmlContent
            html={toolkit.meta}
            sx={{ typography: 'body2', color: 'text.secondary', maxWidth: READING_MAX_WIDTH }}
          />
        </Stack>
      </PageHeader>

      {/* Filter bar */}
      <Paper
        variant="outlined"
        sx={(t) => ({
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          backgroundColor: t.vars.palette.surface.container,
          borderColor: t.vars.palette.surface.outlineVariant,
        })}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          <TextField
            fullWidth
            size="small"
            label="Filter helpers by name, doc or code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" aria-label="Clear filter" onClick={() => setQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Chip label={`${shown} / ${total} helpers`} size="small" color={term ? 'primary' : 'default'} />
            {!desktop && (
              <Button variant="outlined" startIcon={<TocIcon />} onClick={() => setTocOpen(true)}>
                Contents
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: `minmax(0, ${READING_MAX_WIDTH}px) 280px` },
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {visible.length === 0 && (
            <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No helper matches “{query.trim()}”
              </Typography>
              <Button onClick={() => setQuery('')}>Clear filter</Button>
            </Paper>
          )}

          {visible.map((s) => (
            <Box component="section" key={s.id} sx={{ mb: 6 }}>
              <Typography
                id={s.id}
                variant="h4"
                component="h2"
                sx={{ mb: 1.5, pb: 1, borderBottom: 1, borderColor: 'divider', textWrap: 'balance' }}
              >
                {s.title}
              </Typography>
              {s.lede && (
                <HtmlContent html={s.lede} sx={{ color: 'text.secondary', mb: 2 }} />
              )}

              {s.sheet.length > 0 && (
                <Paper variant="outlined" component="dl" sx={{ m: 0, overflow: 'hidden' }}>
                  {s.sheet.map((r) => (
                    <Box
                      key={r.label}
                      sx={(t) => ({
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '160px minmax(0, 1fr)' },
                        columnGap: 2,
                        rowGap: 0.25,
                        px: 2,
                        py: 1,
                        borderBottom: `1px solid ${t.vars.palette.divider}`,
                        '&:last-of-type': { borderBottom: 0 },
                      })}
                    >
                      <Typography component="dt" variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {r.label}
                      </Typography>
                      <Box
                        component="dd"
                        sx={{
                          m: 0,
                          fontFamily: FONT_MONO,
                          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {r.code}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )}

              {s.helpers.map((h, i) => (
                <HelperCard key={h.id ?? `${s.id}-${i}`} helper={h} lang={toolkit.lang} />
              ))}
            </Box>
          ))}
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
            <TableOfContents headings={headings} />
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
          <TableOfContents headings={headings} onNavigate={() => setTocOpen(false)} />
        </Drawer>
      )}
    </PageContainer>
  )
}

const HelperCard = memo(function HelperCard({ helper: h, lang }: { helper: UtilsHelper; lang: UtilsLang }) {
  const navigate = useNavigate()
  const html = useMemo(() => codeBlockHtml(h.code, lang), [h.code, lang])

  const onAnchor = (e: MouseEvent) => {
    e.preventDefault()
    navigate({ hash: h.id }, { replace: true })
  }

  return (
    <Card id={h.id} component="article" sx={{ mt: 2 }}>
      {h.name && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 2, pt: 1.5, minWidth: 0 }}>
          {h.kind && (
            <Chip
              label={h.kind}
              size="small"
              color={h.kind === 'class' ? 'secondary' : 'primary'}
              variant="outlined"
              sx={{ fontFamily: FONT_MONO, textTransform: 'uppercase', fontSize: '0.6875rem' }}
            />
          )}
          <Link
            href={`#${h.id}`}
            onClick={onAnchor}
            underline="hover"
            color="text.primary"
            sx={{ fontFamily: FONT_MONO, fontWeight: 600, fontSize: '0.9375rem', minWidth: 0, overflowWrap: 'anywhere', py: 1 }}
          >
            {h.name}
          </Link>
        </Stack>
      )}
      {h.doc && (
        <HtmlContent html={h.doc} sx={{ typography: 'body2', color: 'text.secondary', px: 2, pb: 1 }} />
      )}
      <HtmlContent
        html={html}
        sx={{ '& pre': { m: 0, borderRadius: 0, fontSize: { xs: '0.75rem', sm: '0.8125rem' } } }}
      />
    </Card>
  )
})

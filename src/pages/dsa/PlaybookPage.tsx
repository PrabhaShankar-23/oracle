import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import EastIcon from '@mui/icons-material/East'
import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Drawer from '@mui/material/Drawer'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme, type Theme } from '@mui/material/styles'
import { Fragment, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import TableOfContents from '../../components/content/TableOfContents'
import { playbook } from '../../content/playbook'
import type { PlaybookBlock, PlaybookTone } from '../../content/types'
import { codeBlockHtml } from '../../lib/codeHtml'
import { FONT_MONO, HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'

/** The accent colour for a tone. Containers are avoided so light/dark contrast stays safe. */
const toneColor = (t: Theme, tone: PlaybookTone) =>
  tone === 'tertiary' ? t.vars.palette.tertiary.main : t.vars.palette[tone].main

/** Renders `backtick` spans in hand-written copy as inline code. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <Box
            key={i}
            component="code"
            sx={(t) => ({
              fontFamily: FONT_MONO,
              fontSize: '0.875em',
              px: 0.5,
              py: 0.125,
              borderRadius: 1,
              backgroundColor: t.vars.palette.surface.containerHighest,
            })}
          >
            {p}
          </Box>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

/** Small caption under a block. */
function Note({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontStyle: 'italic' }}>
      <Rich text={text} />
    </Typography>
  )
}

function BlockTitle({ text }: { text?: string }) {
  if (!text) return null
  return (
    <Typography variant="subtitle1" component="h3" sx={{ mb: 1.5, textWrap: 'balance' }}>
      {text}
    </Typography>
  )
}

/**
 * The DSA thinking playbook — recognition, memory choice, pre-checks, rituals and practice,
 * rendered from the hand-written blocks in `src/content/playbook.ts`.
 */
export default function PlaybookPage() {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [tocOpen, setTocOpen] = useState(false)

  const headings = useMemo(() => playbook.sections.map((s) => ({ id: s.id, text: s.title, level: 2 })), [])

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'DSA', to: '/dsa' }, { label: 'Thinking playbook' }]}
        title={playbook.title}
        subtitle={playbook.subtitle}
      >
        <Stack spacing={1} sx={{ maxWidth: READING_MAX_WIDTH }}>
          {playbook.intro.map((p) => (
            <Typography key={p} variant="body2" color="text.secondary">
              <Rich text={p} />
            </Typography>
          ))}
          {!desktop && (
            <Box>
              <Button variant="outlined" startIcon={<TocIcon />} onClick={() => setTocOpen(true)} sx={{ mt: 1 }}>
                Contents
              </Button>
            </Box>
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
        <Box sx={{ minWidth: 0 }}>
          {playbook.sections.map((s) => (
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
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  <Rich text={s.lede} />
                </Typography>
              )}

              <Stack spacing={3}>
                {s.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </Stack>

              {s.link && (
                <Button
                  component={RouterLink}
                  to={s.link.to}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: 2, minHeight: 44 }}
                >
                  {s.link.label}
                </Button>
              )}
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

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

function Block({ block: b }: { block: PlaybookBlock }) {
  switch (b.kind) {
    case 'flow':
      return <FlowBlock block={b} />
    case 'checklist':
      return <ChecklistBlock block={b} />
    case 'table':
      return <TableBlock block={b} />
    case 'cards':
      return <CardsBlock block={b} />
    case 'bullets':
      return <BulletsBlock block={b} />
    case 'compare':
      return <CompareBlock block={b} />
    case 'code':
      return <CodeBlock block={b} />
    case 'callout':
      return <CalloutBlock block={b} />
  }
}

type Of<K extends PlaybookBlock['kind']> = Extract<PlaybookBlock, { kind: K }>

function FlowBlock({ block: b }: { block: Of<'flow'> }) {
  return (
    <Box>
      <BlockTitle text={b.title} />
      {/* The arrow travels with the step before it, so a wrap never starts a line with an arrow. */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        {b.steps.map((step, i) => {
          const last = i === b.steps.length - 1
          return (
            <Box key={step} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Box
                sx={(t) => ({
                  px: 1.75,
                  py: 1,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 5,
                  backgroundColor: last ? t.vars.palette.container.primary : t.vars.palette.surface.containerHigh,
                  color: last ? t.vars.palette.container.onPrimary : undefined,
                  typography: 'body2',
                  fontWeight: 500,
                  overflowWrap: 'anywhere',
                })}
              >
                {step}
              </Box>
              {!last && <EastIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} aria-hidden />}
            </Box>
          )
        })}
      </Box>
      {b.note && <Note text={b.note} />}
    </Box>
  )
}

function ChecklistBlock({ block: b }: { block: Of<'checklist'> }) {
  return (
    <Paper
      variant="outlined"
      sx={(t) => ({
        p: { xs: 2, sm: 2.5 },
        backgroundColor: t.vars.palette.surface.containerLow,
        borderColor: t.vars.palette.surface.outlineVariant,
      })}
    >
      <BlockTitle text={b.title} />
      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          columnGap: 3,
          rowGap: 0.5,
        }}
      >
        {b.items.map((item) => (
          <Stack key={item} component="li" direction="row" spacing={1} sx={{ alignItems: 'flex-start', minWidth: 0, py: 0.5 }}>
            <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: 'primary.main', mt: '1px', flexShrink: 0 }} aria-hidden />
            <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <Rich text={item} />
            </Typography>
          </Stack>
        ))}
      </Box>
      {b.note && <Note text={b.note} />}
    </Paper>
  )
}

function TableBlock({ block: b }: { block: Of<'table'> }) {
  const mono = new Set(b.mono ?? [])
  return (
    <Box>
      <BlockTitle text={b.title} />
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Box component="table" sx={{ width: '100%', minWidth: b.columns.length > 2 ? 520 : 320, borderCollapse: 'collapse' }}>
          <thead>
            <Box
              component="tr"
              sx={(t) => ({ backgroundColor: t.vars.palette.surface.containerHigh })}
            >
              {b.columns.map((c) => (
                <Box
                  key={c}
                  component="th"
                  scope="col"
                  sx={(t) => ({
                    textAlign: 'left',
                    px: 2,
                    py: 1.25,
                    typography: 'subtitle2',
                    color: t.vars.palette.text.secondary,
                    borderBottom: `1px solid ${t.vars.palette.divider}`,
                  })}
                >
                  {c}
                </Box>
              ))}
            </Box>
          </thead>
          <tbody>
            {b.rows.map((row) => (
              <Box component="tr" key={row.join('|')}>
                {row.map((cell, i) => (
                  <Box
                    key={i}
                    component="td"
                    sx={(t) => ({
                      px: 2,
                      py: 1.25,
                      verticalAlign: 'top',
                      borderBottom: `1px solid ${t.vars.palette.divider}`,
                      'tr:last-of-type &': { borderBottom: 0 },
                      typography: 'body2',
                      overflowWrap: 'anywhere',
                      ...(i === 0 && { fontWeight: 600 }),
                      ...(mono.has(i) && { fontFamily: FONT_MONO, fontSize: '0.8125rem' }),
                    })}
                  >
                    <Rich text={cell} />
                  </Box>
                ))}
              </Box>
            ))}
          </tbody>
        </Box>
      </Paper>
      {b.note && <Note text={b.note} />}
    </Box>
  )
}

function CardsBlock({ block: b }: { block: Of<'cards'> }) {
  return (
    <Box>
      <BlockTitle text={b.title} />
      <Grid container spacing={2}>
        {b.items.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Box sx={{ p: 2, pb: item.code ? 1.5 : 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, overflowWrap: 'anywhere' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Rich text={item.text} />
                </Typography>
              </Box>
              {item.code && (
                <HtmlContent
                  html={codeBlockHtml(item.code, item.lang ?? 'python')}
                  sx={{ mt: 'auto', '& pre': { m: 0, borderRadius: 0, fontSize: { xs: '0.75rem', sm: '0.8125rem' } } }}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function BulletsBlock({ block: b }: { block: Of<'bullets'> }) {
  return (
    <Box>
      <BlockTitle text={b.title} />
      <Box component="ul" sx={{ m: 0, pl: 2.5, typography: 'body2', '& li': { mb: 0.75, overflowWrap: 'anywhere' } }}>
        {b.items.map((item) => (
          <li key={item}>
            <Rich text={item} />
          </li>
        ))}
      </Box>
    </Box>
  )
}

function CompareBlock({ block: b }: { block: Of<'compare'> }) {
  return (
    <Box>
      <BlockTitle text={b.title} />
      <Grid container spacing={2}>
        {b.columns.map((col) => (
          <Grid key={col.title} size={{ xs: 12, sm: 6 }} sx={{ minWidth: 0 }}>
            <Paper
              variant="outlined"
              sx={(t) => ({
                height: '100%',
                p: 2,
                borderTop: `3px solid ${toneColor(t, col.tone)}`,
                backgroundColor: t.vars.palette.surface.containerLow,
                borderColor: t.vars.palette.surface.outlineVariant,
              })}
            >
              <Typography variant="subtitle2" sx={(t) => ({ mb: 1, color: toneColor(t, col.tone) })}>
                {col.title}
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, typography: 'body2', '& li': { mb: 0.5, overflowWrap: 'anywhere' } }}>
                {col.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} />
                  </li>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function CodeBlock({ block: b }: { block: Of<'code'> }) {
  return (
    <Box>
      <BlockTitle text={b.title} />
      <HtmlContent
        html={codeBlockHtml(b.code, b.lang)}
        sx={{ '& pre': { m: 0, fontSize: { xs: '0.75rem', sm: '0.8125rem' } } }}
      />
      {b.note && <Note text={b.note} />}
    </Box>
  )
}

function CalloutBlock({ block: b }: { block: Of<'callout'> }) {
  return (
    <Paper
      variant="outlined"
      sx={(t) => ({
        p: { xs: 2, sm: 2.5 },
        borderLeft: `4px solid ${toneColor(t, b.tone)}`,
        backgroundColor: t.vars.palette.surface.containerLow,
        borderColor: t.vars.palette.surface.outlineVariant,
      })}
    >
      {b.title && (
        <Typography variant="overline" component="p" sx={(t) => ({ color: toneColor(t, b.tone), mb: 0.5 })}>
          {b.title}
        </Typography>
      )}
      <Typography sx={{ typography: { xs: 'body2', sm: 'body1' }, overflowWrap: 'anywhere' }}>
        <Rich text={b.text} />
      </Typography>
    </Paper>
  )
}

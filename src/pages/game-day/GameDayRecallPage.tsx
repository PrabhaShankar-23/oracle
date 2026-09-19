import TocIcon from '@mui/icons-material/Toc'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import TableOfContents from '../../components/content/TableOfContents'
import { manifest } from '../../content/sections'
import type { GameDayMark, GameDayQuestion, GameDayTopic } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import NotFoundPage from '../NotFoundPage'

// Vite turns this into one lazy chunk per topic, so a page loads only its own questions.
const TOPICS = import.meta.glob<{ default: GameDayTopic }>('../../content/generated/game-day-*.json')

/** Appendix bands have no letter — "♻️ Merged from JBTIQ_PY.md — 24 Aug 2026" → "Merged". */
const shortBandName = (name: string) => name.replace(/^[^\p{Letter}]+/u, '').split(/[\s—]/)[0] || 'Extra'

const MARK_LABEL: Record<GameDayMark, string> = {
  decides: '⭐ decides the round',
  trending: '🔥 trending',
  asked: '📍 actually asked',
}

export default function GameDayRecallPage() {
  const { slug = '' } = useParams()
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [topic, setTopic] = useState<GameDayTopic | null>(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [allOpen, setAllOpen] = useState<boolean | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const known = manifest.gameDay.some((t) => t.slug === slug)

  useEffect(() => {
    if (!known) return
    let live = true
    const load = TOPICS[`../../content/generated/game-day-${slug}.json`]
    void load?.().then((m) => live && setTopic(m.default))
    return () => {
      live = false
    }
  }, [slug, known])

  // "Expand all" drives the native <details> elements directly — they stay uncontrolled otherwise.
  useEffect(() => {
    if (allOpen === null) return
    bodyRef.current?.querySelectorAll('details').forEach((d) => (d.open = allOpen))
  }, [allOpen, topic])

  const headings = useMemo(
    () => (topic?.bands ?? []).map((b) => ({ id: b.id, text: b.letter ? `${b.letter} — ${b.name}` : b.name, level: 2 })),
    [topic],
  )

  if (!known) return <NotFoundPage />

  const total = topic?.bands.reduce((n, b) => n + b.questions.length, 0) ?? 0

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'Game Day', to: '/game-day' }, { label: topic?.title ?? '…' }]}
        title={topic?.title ?? 'Loading…'}
        subtitle="Question visible — answer out loud, then expand and grade what you missed."
      >
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip size="small" label={`${total} questions`} color="primary" />
          {topic?.bands.map((b) => (
            <Chip
              key={b.id}
              size="small"
              variant="outlined"
              label={`${b.letter ?? shortBandName(b.name)} ${b.questions.length}`}
              onClick={() => document.getElementById(b.id)?.scrollIntoView()}
              sx={{ minHeight: 32 }}
            />
          ))}
        </Stack>
      </PageHeader>

      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
        <Button
          size="small"
          variant="outlined"
          startIcon={allOpen ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
          onClick={() => setAllOpen((v) => !v)}
          sx={{ minHeight: 44 }}
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
        {!desktop && (
          <Button size="small" variant="outlined" startIcon={<TocIcon />} onClick={() => setTocOpen(true)} sx={{ minHeight: 44 }}>
            Bands
          </Button>
        )}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: `minmax(0, ${READING_MAX_WIDTH}px) 280px` },
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        <Box ref={bodyRef} sx={{ minWidth: 0 }}>
          {topic?.bands.map((band) => (
            <Box component="section" key={band.id} sx={{ mb: 6 }}>
              <Typography
                id={band.id}
                variant="h5"
                component="h2"
                sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider', textWrap: 'balance' }}
              >
                {band.letter ? `${band.letter} — ${band.name}` : band.name}
              </Typography>
              <Stack spacing={1.5}>
                {band.questions.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </Stack>
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

/** Question visible, answer behind a native <details> — disclosure is exactly this interaction. */
function QuestionCard({ question: q }: { question: GameDayQuestion }) {
  const answer = [
    q.points.length ? `<ul>${q.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : '',
    q.flow ? `<p class="gd-line"><b>Flow:</b> ${q.flow}</p>` : '',
    q.trap ? `<p class="gd-line gd-trap"><b>Trap:</b> ${q.trap}</p>` : '',
    q.oneLiner ? `<p class="gd-line"><b>One-liner:</b> “${q.oneLiner}”</p>` : '',
  ].join('')

  return (
    <Paper
      id={q.id}
      component="article"
      variant="outlined"
      sx={(t) => ({
        overflow: 'hidden',
        borderColor: t.vars.palette.surface.outlineVariant,
        backgroundColor: t.vars.palette.surface.containerLow,
      })}
    >
      <Box
        component="details"
        sx={(t) => ({
          '& > summary': {
            listStyle: 'none',
            cursor: 'pointer',
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            px: { xs: 1.75, sm: 2 },
            py: 1.5,
            minHeight: 44,
            '&::-webkit-details-marker': { display: 'none' },
            '&:hover': { backgroundColor: t.vars.palette.action.hover },
            '&:focus-visible': { outline: `2px solid ${t.vars.palette.primary.main}`, outlineOffset: -2 },
          },
          '&[open] > summary': { borderBottom: `1px solid ${t.vars.palette.divider}` },
        })}
      >
        <Box component="summary">
          <Box
            component="span"
            sx={(t) => ({
              fontSize: '0.75rem',
              fontWeight: 700,
              color: t.vars.palette.text.secondary,
              minWidth: 22,
              pt: '2px',
            })}
          >
            {q.number}
          </Box>
          <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="span" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
              {q.text}
            </Typography>
            {(q.marks.length > 0 || q.badge) && (
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 0.75 }}>
                {q.marks.map((m) => (
                  <Chip key={m} size="small" variant="outlined" label={MARK_LABEL[m]} sx={{ height: 22, fontSize: '0.6875rem' }} />
                ))}
                {q.badge && <Chip size="small" label={q.badge} color="secondary" variant="outlined" sx={{ height: 22, fontSize: '0.6875rem' }} />}
              </Stack>
            )}
          </Box>
        </Box>

        <Box sx={{ px: { xs: 1.75, sm: 2 }, py: 1.5 }}>
          <HtmlContent
            html={answer}
            sx={{
              typography: 'body2',
              '& ul': { m: 0, pl: 2.5 },
              '& li': { mb: 0.5 },
              '& .gd-line': { mt: 1.5, mb: 0 },
              '& .gd-trap': { color: 'warning.main' },
            }}
          />
          {q.drill && <Drill drill={q.drill} />}
          {q.links.length > 0 && (
            <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
              {q.links.map((l) => (
                <Chip key={l.target} size="small" variant="outlined" label={l.label} title={l.target} sx={{ height: 24, fontSize: '0.6875rem' }} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

/** The scripted version of the answer, folded in from a retired jbtiq drill. */
function Drill({ drill }: { drill: NonNullable<GameDayQuestion['drill']> }) {
  const html = [
    drill.hint ? `<p class="gd-line"><b>💡 Hint:</b> ${drill.hint}</p>` : '',
    drill.points.length ? `<ul>${drill.points.map((p) => `<li>${p}</li>`).join('')}</ul>` : '',
    drill.oneLiner ? `<p class="gd-line"><b>One-liner:</b> “${drill.oneLiner}”</p>` : '',
    drill.followUp ? `<p class="gd-line"><b>Follow-up:</b> ${drill.followUp}</p>` : '',
  ].join('')

  return (
    <Box
      sx={(t) => ({
        mt: 2,
        pt: 1.5,
        borderTop: `1px dashed ${t.vars.palette.divider}`,
      })}
    >
      <Typography variant="overline" component="p" sx={{ color: 'secondary.main' }}>
        🗣️ Phrasing drill
      </Typography>
      {drill.prompt && (
        <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, overflowWrap: 'anywhere' }}>
          {drill.prompt}
        </Typography>
      )}
      <HtmlContent
        html={html}
        sx={{ typography: 'body2', '& ul': { m: 0, pl: 2.5 }, '& li': { mb: 0.5 }, '& .gd-line': { mt: 1.5, mb: 0 } }}
      />
    </Box>
  )
}

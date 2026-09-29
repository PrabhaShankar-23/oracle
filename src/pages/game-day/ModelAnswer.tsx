import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { useState, type ReactNode } from 'react'
import HtmlContent from '../../components/content/HtmlContent'
import type { GameDayAnswerType, GameDayFollowUpTag, GameDayModelAnswer, GameDayModelAnswers } from '../../content/types'

// One lazy chunk per topic, fetched the first time any model answer on the page is opened.
const ANSWER_FILES = import.meta.glob<{ default: GameDayModelAnswers }>('../../content/generated/model-answers-*.json')
const cache = new Map<string, Promise<GameDayModelAnswers>>()

function loadAnswers(topic: string): Promise<GameDayModelAnswers> {
  let pending = cache.get(topic)
  if (!pending) {
    const load = ANSWER_FILES[`../../content/generated/model-answers-${topic}.json`]
    pending = load ? load().then((m) => m.default) : Promise.resolve({})
    cache.set(topic, pending)
  }
  return pending
}

const TYPE_LABEL: Record<GameDayAnswerType, string> = {
  diagnose: 'Diagnose',
  design: 'Design',
  'trade-off': 'Trade-off',
  concept: 'Concept',
  story: 'Story',
}

const TAG_COLOR: Record<GameDayFollowUpTag, 'primary' | 'warning' | 'secondary' | 'success'> = {
  probe: 'primary',
  trap: 'warning',
  edge: 'secondary',
  senior: 'success',
}

const Html = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />

const bodySx: SxProps<Theme> = {
  typography: 'body2',
  '& > :first-of-type': { mt: 0 },
  '& > :last-child': { mb: 0 },
  '& ul, & ol': { pl: 2.5 },
  '& pre': { fontSize: { xs: '0.75rem', sm: '0.8125rem' } },
}

/** A nested disclosure: native <details>, so keyboard and screen readers get it for free. */
function Fold({ summary, children, onToggle }: { summary: ReactNode; children: ReactNode; onToggle?: (open: boolean) => void }) {
  return (
    <Box
      component="details"
      onToggle={(e) => onToggle?.((e.currentTarget as HTMLDetailsElement).open)}
      sx={(t) => ({
        borderRadius: 2,
        border: `1px solid ${t.vars.palette.surface.outlineVariant}`,
        backgroundColor: t.vars.palette.surface.container,
        overflow: 'hidden',
        '& > summary': {
          listStyle: 'none',
          cursor: 'pointer',
          boxSizing: 'border-box',
          typography: 'body2',
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
          px: 1.5,
          py: 1.25,
          minHeight: 44,
          '&::-webkit-details-marker': { display: 'none' },
          '&::before': { content: '"▸"', color: t.vars.palette.text.secondary, transition: 'transform 120ms' },
          '&:hover': { backgroundColor: t.vars.palette.action.hover },
          '&:focus-visible': { outline: `2px solid ${t.vars.palette.primary.main}`, outlineOffset: -2 },
        },
        '&[open] > summary': { borderBottom: `1px solid ${t.vars.palette.divider}` },
        '&[open] > summary::before': { transform: 'rotate(90deg)' },
      })}
    >
      <Box component="summary">
        <Box component="span" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
          {summary}
        </Box>
      </Box>
      <Box sx={{ px: 1.5, py: 1.25, minWidth: 0 }}>{children}</Box>
    </Box>
  )
}

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <Typography variant="overline" component="p" sx={{ color: 'text.secondary', mt: 2, mb: 0.5, lineHeight: 1.6 }}>
    {children}
  </Typography>
)

/** 🎤 The full walkthrough for one question: spine up front, everything else behind nested accordions. */
export default function ModelAnswer({
  topic,
  questionId,
  type,
  spine,
  standalone = false,
}: {
  topic: string
  questionId: string
  type: GameDayAnswerType
  spine: string[]
  /** The card's only content (recall blocks retired), so no divider from the answer above. */
  standalone?: boolean
}) {
  const [answer, setAnswer] = useState<GameDayModelAnswer | null | undefined>(undefined)

  const open = (isOpen: boolean) => {
    if (!isOpen || answer !== undefined) return
    void loadAnswers(topic).then((all) => setAnswer(all[questionId] ?? null))
  }

  return (
    <Box sx={(t) => (standalone ? {} : { mt: 2, pt: 1.5, borderTop: `1px dashed ${t.vars.palette.divider}` })}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
        <Typography variant="overline" component="p" sx={{ color: 'primary.main', lineHeight: 1.6 }}>
          🎤 Model answer
        </Typography>
        <Chip size="small" variant="outlined" label={TYPE_LABEL[type]} sx={{ height: 22, fontSize: '0.6875rem' }} />
      </Stack>

      {/* The spine is the thing to memorise, so it's visible without opening anything. */}
      <Box
        component="ol"
        aria-label="Answer sequence"
        sx={(t) => ({
          m: 0,
          mb: 1.5,
          p: 0,
          listStyle: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          '& li': {
            typography: 'body2',
            fontWeight: 500,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: t.vars.palette.container.primary,
            color: t.vars.palette.container.onPrimary,
            overflowWrap: 'anywhere',
          },
          '& li:not(:last-child)::after': { content: '" →"', opacity: 0.7 },
        })}
      >
        {spine.map((step, i) => (
          <li key={step}>
            {i + 1} · {step}
          </li>
        ))}
      </Box>

      <Fold onToggle={open} summary={<b>Open the full answer</b>}>
        {answer === undefined && <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading…</Typography>}
        {answer === null && <Typography variant="body2" sx={{ color: 'text.secondary' }}>Model answer not available.</Typography>}
        {answer && <AnswerBody answer={answer} />}
      </Fold>
    </Box>
  )
}

function AnswerBody({ answer: a }: { answer: GameDayModelAnswer }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      {a.warning && (
        <Box
          sx={(t) => ({
            typography: 'body2',
            mb: 1.5,
            p: 1.25,
            borderRadius: 1.5,
            backgroundColor: t.vars.palette.container.error,
            color: t.vars.palette.container.onError,
            overflowWrap: 'anywhere',
          })}
        >
          ⚠️ <Html html={a.warning} />
        </Box>
      )}
      <Typography variant="body2" sx={{ mb: 0.75, overflowWrap: 'anywhere' }}>
        <b>🎯 What they're testing:</b> <Html html={a.testing} />
      </Typography>
      <Typography variant="body2" sx={{ color: 'warning.main', overflowWrap: 'anywhere' }}>
        <b>🪤 The trap:</b> <Html html={a.trap} />
      </Typography>

      <SectionLabel>Say it</SectionLabel>
      <Fold summary={<b>🎤 The spoken answer{a.speakTime ? ` (${a.speakTime})` : ''}</b>}>
        <HtmlContent html={a.spoken} sx={bodySx} />
      </Fold>

      <SectionLabel>The walkthrough</SectionLabel>
      <Stack spacing={1}>
        {a.stages.map((s) => (
          <Fold
            key={s.number}
            summary={
              <>
                <b>
                  {s.number} · {s.name}
                </b>
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {' — '}
                  <Html html={s.claim} />
                </Box>
              </>
            }
          >
            <HtmlContent html={s.html} sx={bodySx} />
          </Fold>
        ))}
      </Stack>

      <SectionLabel>Follow-ups they'll fire</SectionLabel>
      <Stack spacing={1}>
        {a.followUps.map((f) => (
          <Fold
            key={f.number}
            summary={
              <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box component="span" sx={{ minWidth: 0 }}>
                  <b>F{f.number} · </b>
                  <Html html={f.question} />
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  color={TAG_COLOR[f.tag]}
                  label={f.tag}
                  sx={{ height: 22, minHeight: 22, fontSize: '0.6875rem', flexShrink: 0 }}
                />
              </Stack>
            }
          >
            <HtmlContent html={f.html} sx={bodySx} />
          </Fold>
        ))}
      </Stack>

      {a.dontSay.length > 0 && (
        <>
          <SectionLabel>🚫 Don't say</SectionLabel>
          <Box component="ul" sx={{ typography: 'body2', m: 0, pl: 2.5, '& li': { mb: 0.5, overflowWrap: 'anywhere' } }}>
            {a.dontSay.map((d) => (
              <li key={d}>
                <Html html={d} />
              </li>
            ))}
          </Box>
        </>
      )}

      {a.links.length > 0 && (
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }}>
          {a.links.map((l) => (
            <Chip key={l.target} size="small" variant="outlined" label={l.label} title={l.target} sx={{ height: 24, fontSize: '0.6875rem' }} />
          ))}
        </Stack>
      )}
    </Box>
  )
}

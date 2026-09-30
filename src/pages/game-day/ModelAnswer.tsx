import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import HtmlContent from '../../components/content/HtmlContent'
import type { GameDayAnswerType, GameDayFollowUpTag, GameDayModelAnswer, GameDayModelAnswers } from '../../content/types'

// One lazy chunk per topic, fetched the first time any question with a model answer is opened.
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
  mechanism: 'Mechanism',
  debug: 'Debug',
  predict: 'Predict',
  threat: 'Threat',
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

/** A section heading inside the answer: an h4 under the card's question. */
const SectionHeading = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="overline"
    component="h4"
    sx={(t) => ({
      display: 'block',
      color: t.vars.palette.primary.main,
      mt: 3,
      mb: 1.25,
      pb: 0.5,
      lineHeight: 1.6,
      borderBottom: `1px solid ${t.vars.palette.divider}`,
    })}
  >
    {children}
  </Typography>
)

/**
 * 🎤 The full walkthrough for one question, laid out as one readable article: the question card is
 * the only accordion. The answer text loads when that card is first opened.
 */
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
  const ref = useRef<HTMLDivElement>(null)
  const [answer, setAnswer] = useState<GameDayModelAnswer | null | undefined>(undefined)

  // Load when the enclosing question card opens (or is already open, e.g. after "Expand all").
  useEffect(() => {
    const card = ref.current?.closest('details')
    if (!card) return
    let live = true
    const load = () => {
      if (!card.open) return
      void loadAnswers(topic).then((all) => live && setAnswer(all[questionId] ?? null))
    }
    load()
    card.addEventListener('toggle', load)
    return () => {
      live = false
      card.removeEventListener('toggle', load)
    }
  }, [topic, questionId])

  return (
    <Box ref={ref} sx={(t) => (standalone ? {} : { mt: 2, pt: 1.5, borderTop: `1px dashed ${t.vars.palette.divider}` })}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
        <Typography variant="overline" component="p" sx={{ color: 'primary.main', lineHeight: 1.6 }}>
          🎤 Model answer
        </Typography>
        <Chip size="small" variant="outlined" label={TYPE_LABEL[type]} sx={{ height: 22, fontSize: '0.6875rem' }} />
      </Stack>

      {/* The spine is the thing to memorise, so it comes first. */}
      <Box
        component="ol"
        aria-label="Answer sequence"
        sx={(t) => ({
          m: 0,
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
            borderRadius: '4px',
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

      {answer === undefined && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Loading…
        </Typography>
      )}
      {answer === null && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
          Model answer not available.
        </Typography>
      )}
      {answer && <AnswerBody answer={answer} />}
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
            mt: 2,
            p: 1.25,
            borderRadius: 1,
            backgroundColor: t.vars.palette.container.error,
            color: t.vars.palette.container.onError,
            overflowWrap: 'anywhere',
          })}
        >
          ⚠️ <Html html={a.warning} />
        </Box>
      )}
      <Typography variant="body2" sx={{ mt: 2, mb: 0.75, overflowWrap: 'anywhere' }}>
        <b>🎯 What they're testing:</b> <Html html={a.testing} />
      </Typography>
      <Typography variant="body2" sx={{ color: 'warning.main', overflowWrap: 'anywhere' }}>
        <b>🪤 The trap:</b> <Html html={a.trap} />
      </Typography>

      <SectionHeading>🎤 The spoken answer{a.speakTime ? ` (${a.speakTime})` : ''}</SectionHeading>
      <Box
        sx={(t) => ({
          px: 1.75,
          py: 1.25,
          borderRadius: 1,
          borderLeft: `3px solid ${t.vars.palette.primary.main}`,
          backgroundColor: t.vars.palette.surface.container,
        })}
      >
        <HtmlContent html={a.spoken} sx={bodySx} />
      </Box>

      <SectionHeading>🪜 The walkthrough</SectionHeading>
      <Stack spacing={2.5}>
        {a.stages.map((s) => (
          <Box component="section" key={s.number} sx={{ minWidth: 0 }}>
            <Typography component="h5" variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.35, mb: 0.75, overflowWrap: 'anywhere' }}>
              {s.number} · {s.name}
              {s.claim && (
                <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>
                  {' — '}
                  <Html html={s.claim} />
                </Box>
              )}
            </Typography>
            <HtmlContent html={s.html} sx={bodySx} />
          </Box>
        ))}
      </Stack>

      <SectionHeading>🔁 Follow-ups they'll fire</SectionHeading>
      <Stack spacing={2}>
        {a.followUps.map((f) => (
          <Box component="section" key={f.number} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'flex-start', mb: 0.5 }}>
              <Typography component="h5" variant="body2" sx={{ fontWeight: 700, flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                F{f.number} · <Html html={f.question} />
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                color={TAG_COLOR[f.tag]}
                label={f.tag}
                sx={{ height: 22, minHeight: 22, fontSize: '0.6875rem', flexShrink: 0 }}
              />
            </Stack>
            <HtmlContent html={f.html} sx={bodySx} />
          </Box>
        ))}
      </Stack>

      {a.dontSay.length > 0 && (
        <>
          <SectionHeading>🚫 Don't say</SectionHeading>
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
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }}>
          {a.links.map((l) => (
            <Chip key={l.target} size="small" variant="outlined" label={l.label} title={l.target} sx={{ height: 24, fontSize: '0.6875rem' }} />
          ))}
        </Stack>
      )}
    </Box>
  )
}

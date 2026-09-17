import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { memo, useState } from 'react'
import HtmlContent from '../../components/content/HtmlContent'
import { walkthroughs } from '../../content/deep'
import type { Difficulty, Problem } from '../../content/types'
import { codeBlockHtml } from '../../lib/codeHtml'
import { FONT_MONO } from '../../theme/theme'
import ApproachTabs from './ApproachTabs'
import { MARK_LABELS } from './marks'

const DIFFICULTY_COLOR: Record<Difficulty, 'success' | 'warning' | 'error'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'error',
}


const Html = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />

type Props = { problem: Problem; recallMode: boolean }

function ProblemCard({ problem: p, recallMode }: Props) {
  const [revealed, setRevealed] = useState(false)
  const hidden = recallMode && !revealed
  const walkthrough = walkthroughs[p.id]

  return (
    <Card id={p.id} component="article" sx={{ mb: 1.5 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
          <Link
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="subtitle1"
            underline="hover"
            color="text.primary"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mr: 'auto', minHeight: 32 }}
          >
            {p.title}
            <OpenInNewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          </Link>
          <Chip label={p.difficulty} size="small" color={DIFFICULTY_COLOR[p.difficulty]} variant="outlined" />
          {p.marks.map((m) => (
            <Tooltip key={m} title={MARK_LABELS[m] ?? m}>
              <Chip label={m} size="small" />
            </Tooltip>
          ))}
        </Stack>

        {hidden ? (
          <Button size="small" variant="outlined" startIcon={<VisibilityOutlined />} onClick={() => setRevealed(true)}>
            Reveal answer
          </Button>
        ) : (
          <>
            <Box
              component="dl"
              sx={{
                m: 0,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '92px 1fr' },
                columnGap: 2,
                rowGap: { xs: 0.25, sm: 1 },
                '& dt': { typography: 'overline', color: 'text.secondary', lineHeight: 1.9 },
                '& dd': { m: 0, mb: { xs: 1, sm: 0 }, typography: 'body2' },
                '& code': inlineCode,
              }}
            >
              <dt>State</dt>
              <dd>
                <Html html={p.state} />
              </dd>
              <dt>Invariant</dt>
              <dd>
                <Html html={p.invariant} />
              </dd>
            </Box>

            {walkthrough ? (
              <ApproachTabs approaches={walkthrough} />
            ) : (
              <Box
                component="ol"
                sx={(t) => ({
                  listStyle: 'none',
                  p: 0,
                  m: 0,
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: `1px dashed ${t.vars.palette.divider}`,
                  '& code': inlineCode,
                })}
              >
                {p.approaches.map((a) => (
                  <Box
                    component="li"
                    key={a.label}
                    sx={(t) => ({
                      display: 'flex',
                      flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      alignItems: 'baseline',
                      columnGap: 1,
                      py: 0.5,
                      px: 1,
                      mx: -1,
                      borderRadius: 2,
                      typography: 'body2',
                      ...(a.winner && { backgroundColor: t.vars.palette.container.primary, color: t.vars.palette.container.onPrimary }),
                    })}
                  >
                    {a.winner ? (
                      <CheckCircleIcon sx={{ fontSize: 16, alignSelf: 'center', color: 'primary.main' }} aria-label="Best approach" />
                    ) : (
                      <Box component="span" sx={{ color: 'text.secondary', minWidth: 16 }}>
                        {a.label}
                      </Box>
                    )}
                    <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                      <Html html={a.text} />
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontFamily: FONT_MONO,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        opacity: 0.85,
                        width: { xs: '100%', sm: 'auto' },
                        pl: { xs: 3, sm: 1 },
                      }}
                    >
                      {a.complexity}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {p.why && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic', '& code': inlineCode }}>
                <Html html={p.why} />
              </Typography>
            )}

            {!walkthrough && p.code && (
              <HtmlContent html={codeBlockHtml(p.code, 'python')} sx={{ '& pre': { mt: 1.5, mb: 0 } }} />
            )}

            {p.traps.map((trap) => (
              <Alert key={trap} severity="error" variant="outlined" sx={{ mt: 1.5, py: 0, '& code': inlineCode }}>
                <strong>Trap · </strong>
                <Html html={trap} />
              </Alert>
            ))}

            {recallMode && (
              <Button size="small" onClick={() => setRevealed(false)} sx={{ mt: 1 }}>
                Hide again
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

const inlineCode = {
  fontFamily: FONT_MONO,
  fontSize: '0.85em',
  px: 0.5,
  borderRadius: 0.5,
  bgcolor: 'action.hover',
}

export default memo(ProblemCard)

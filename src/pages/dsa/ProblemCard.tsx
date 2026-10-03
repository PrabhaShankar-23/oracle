import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { memo, useState } from 'react'
import HtmlContent from '../../components/content/HtmlContent'
import { walkthroughs } from '../../content/deep'
import { gfgLinks } from '../../content/gfgLinks'
import type { Problem } from '../../content/types'
import { codeBlockHtml } from '../../lib/codeHtml'
import { FONT_MONO } from '../../theme/theme'
import ApproachTabs from './ApproachTabs'
import { DIFFICULTY_COLOR, MARK_LABELS } from './marks'

const Html = ({ html }: { html: string }) => <span dangerouslySetInnerHTML={{ __html: html }} />

type Props = { problem: Problem; recallMode: boolean; open: boolean; onToggle: (id: string) => void }

/** One problem: the header row is always shown, the answer mounts only while the card is open. */
function ProblemCard({ problem: p, recallMode, open, onToggle }: Props) {
  const [revealed, setRevealed] = useState(false)
  const hidden = recallMode && !revealed
  const walkthrough = walkthroughs[p.id]
  const bodyId = `${p.id}-body`
  const gfg = gfgLinks[p.id]

  return (
    <Card id={p.id} component="article" sx={{ mb: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', pr: { xs: 0.5, sm: 1 } }}>
        <ButtonBase
          onClick={() => onToggle(p.id)}
          aria-expanded={open}
          aria-controls={bodyId}
          sx={(t) => ({
            flex: 1,
            minWidth: 0,
            minHeight: 52,
            justifyContent: 'flex-start',
            textAlign: 'left',
            gap: 1,
            pl: { xs: 2, sm: 2.5 },
            pr: 1,
            py: 1,
            '&:hover': { backgroundColor: t.vars.palette.action.hover },
            '&.Mui-focusVisible': { outline: `2px solid ${t.vars.palette.primary.main}`, outlineOffset: -2 },
          })}
        >
          <ExpandMoreIcon
            sx={{ color: 'text.secondary', transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'none' }}
          />
          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" component="h3" sx={{ mr: 'auto', overflowWrap: 'anywhere' }}>
              {p.title}
            </Typography>
            {p.l1 && <Chip label="L1" size="small" color="primary" />}
            <Chip label={p.difficulty} size="small" color={DIFFICULTY_COLOR[p.difficulty]} variant="outlined" />
            {p.marks.map((m) => (
              <Tooltip key={m} title={MARK_LABELS[m] ?? m}>
                <Chip label={m} size="small" />
              </Tooltip>
            ))}
          </Stack>
        </ButtonBase>
        <IconButton
          component="a"
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${p.title} on LeetCode`}
          sx={{ color: 'text.secondary' }}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
        {gfg && (
          <Tooltip title={`GeeksforGeeks${gfg.related ? ' (related)' : ''}: ${gfg.title}`}>
            <IconButton
              component="a"
              href={gfg.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GeeksforGeeks${gfg.related ? ' related article' : ''}: ${gfg.title}`}
              sx={{ color: gfg.related ? 'text.secondary' : 'success.main', fontSize: '0.75rem', fontWeight: 700, width: 44, height: 44 }}
            >
              GfG
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Collapse in={open} timeout={200} mountOnEnter unmountOnExit>
        <CardContent id={bodyId} sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 0.5, sm: 0.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          {hidden ? (
            <Button size="small" variant="outlined" startIcon={<VisibilityOutlined />} onClick={() => setRevealed(true)}>
              Reveal answer
            </Button>
          ) : (
            <>
              {walkthrough ? (
                <ApproachTabs approaches={walkthrough} fallback={{ state: p.state, invariant: p.invariant }} />
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
                          borderRadius: 1,
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
                </>
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
      </Collapse>
    </Card>
  )
}

const inlineCode = {
  fontFamily: FONT_MONO,
  fontSize: '0.85em',
  px: 0.5,
  borderRadius: '4px',
  bgcolor: 'action.hover',
}

export default memo(ProblemCard)

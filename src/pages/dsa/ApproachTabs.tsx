import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined'
import StarRounded from '@mui/icons-material/StarRounded'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useId, useState } from 'react'
import HtmlContent from '../../components/content/HtmlContent'
import RecallDiagram from '../../components/content/RecallDiagram'
import type { ApproachWalkthrough } from '../../content/types'
import { codeBlockHtml } from '../../lib/codeHtml'
import { inlineCodeHtml } from '../../lib/inlineCode'
import { FONT_MONO } from '../../theme/theme'

/** The problem's own State / Invariant (HTML). They describe the best approach, so only that tab falls back to them. */
type Fallback = { state?: string; invariant?: string }
type Props = { approaches: ApproachWalkthrough[]; fallback?: Fallback }

const inlineCode = { fontFamily: FONT_MONO, fontSize: '0.9em', px: 0.5, borderRadius: 0.5, bgcolor: 'action.hover' }

/** State and invariant of one approach: each approach keeps different things, so each tab has its own. */
function StateInvariant({ a, fallback }: { a: ApproachWalkthrough; fallback?: Fallback }) {
  const state = a.state ? inlineCodeHtml(a.state) : a.best ? fallback?.state : undefined
  const invariant = a.invariant ? inlineCodeHtml(a.invariant) : a.best ? fallback?.invariant : undefined
  if (!state && !invariant) return null
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        mb: 1.5,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '92px 1fr' },
        columnGap: 2,
        rowGap: { xs: 0.25, sm: 1 },
        '& dt': { typography: 'overline', color: 'text.secondary', lineHeight: 1.9 },
        '& dd': { m: 0, mb: { xs: 1, sm: 0 }, typography: 'body2' },
        '& code': inlineCode,
      }}
    >
      {state && (
        <>
          <dt>State</dt>
          <dd dangerouslySetInnerHTML={{ __html: state }} />
        </>
      )}
      {invariant && (
        <>
          <dt>Invariant</dt>
          <dd dangerouslySetInnerHTML={{ __html: invariant }} />
        </>
      )}
    </Box>
  )
}

/** Naive → best approaches as tabs; each shows complexity, its own state and invariant, a diagram, the idea in a few lines and the code. */
export default function ApproachTabs({ approaches, fallback }: Props) {
  const id = useId()
  const [tab, setTab] = useState(() => Math.max(0, approaches.findIndex((a) => a.best)))
  const a = approaches[tab]

  return (
    <Box sx={{ mt: 1.5, pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Approaches"
        sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, textTransform: 'none', px: 1.5 } }}
      >
        {approaches.map((ap, i) => (
          <Tab
            key={ap.name}
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel-${i}`}
            label={`${i + 1}. ${ap.name}`}
            icon={
              ap.best ? (
                <StarRounded fontSize="small" aria-label="Best approach" />
              ) : ap.trick ? (
                <LightbulbOutlined fontSize="small" aria-label="Interview trick" />
              ) : undefined
            }
            iconPosition="end"
          />
        ))}
      </Tabs>

      <Box role="tabpanel" id={`${id}-panel-${tab}`} aria-labelledby={`${id}-tab-${tab}`} sx={{ pt: 1.5 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
          <Chip size="small" label={`Time ${a.time}`} sx={{ fontFamily: FONT_MONO }} color={a.best ? 'primary' : 'default'} />
          <Chip size="small" label={`Space ${a.space}`} sx={{ fontFamily: FONT_MONO }} variant="outlined" />
          {a.trick && <Chip size="small" label="Interview trick" color="tertiary" icon={<LightbulbOutlined />} />}
        </Stack>

        <StateInvariant a={a} fallback={fallback} />

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
            alignItems: 'start',
          }}
        >
          <Stack spacing={1}>
            {a.diagrams.map((d, i) => (
              <RecallDiagram key={i} diagram={d} label={`${a.name} diagram`} />
            ))}
          </Stack>
          <Box component="ul" sx={{ m: 0, pl: 2.5, typography: 'body2', '& li': { mb: 0.5 } }}>
            {a.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </Box>
        </Box>

        <HtmlContent html={codeBlockHtml(a.code, 'python')} sx={{ '& pre': { mt: 1.5, mb: 0 } }} />
      </Box>
    </Box>
  )
}

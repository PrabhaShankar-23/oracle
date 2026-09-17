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
import { FONT_MONO } from '../../theme/theme'

type Props = { approaches: ApproachWalkthrough[] }

/** Naive → best approaches as tabs; each shows complexity, a diagram, the idea in a few lines and the code. */
export default function ApproachTabs({ approaches }: Props) {
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
            icon={ap.best ? <StarRounded fontSize="small" aria-label="Best approach" /> : undefined}
            iconPosition="end"
          />
        ))}
      </Tabs>

      <Box role="tabpanel" id={`${id}-panel-${tab}`} aria-labelledby={`${id}-tab-${tab}`} sx={{ pt: 1.5 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
          <Chip size="small" label={`Time ${a.time}`} sx={{ fontFamily: FONT_MONO }} color={a.best ? 'primary' : 'default'} />
          <Chip size="small" label={`Space ${a.space}`} sx={{ fontFamily: FONT_MONO }} variant="outlined" />
        </Stack>

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

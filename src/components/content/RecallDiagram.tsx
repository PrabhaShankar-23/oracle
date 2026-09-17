import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import type { Diagram } from '../../content/types'
import { barsSvg, cellsSvg } from '../../lib/recallDiagramSvg'
import { FONT_MONO } from '../../theme/theme'

type Props = { diagram: Diagram; label: string }

/** Small step-by-step drawings for cold recall approaches: array walks and height charts. */
export default function RecallDiagram({ diagram, label }: Props) {
  return (
    <Box
      component="figure"
      aria-label={label}
      sx={[
        diagramStyles,
        { m: 0, display: 'grid', gap: 1.25, p: { xs: 1.5, sm: 2 }, borderRadius: 3, overflowX: 'auto' },
      ]}
    >
      {diagram.kind === 'cells'
        ? diagram.rows.map((row, i) => <Frame key={i} caption={row.caption} note={row.note} svg={cellsSvg(row)} />)
        : diagram.rows.map((row, i) => (
            <Frame key={i} caption={row.caption} highlight={row.box?.label} note={row.note} svg={barsSvg(row)} />
          ))}
    </Box>
  )
}

type FrameProps = { caption?: string; highlight?: string; note?: string; svg: string }

function Frame({ caption, highlight, note, svg }: FrameProps) {
  return (
    <Box>
      {(caption || highlight) && (
        <Typography variant="caption" component="div" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.25 }}>
          {caption}
          {caption && highlight && ' · '}
          {highlight && (
            <Box component="span" sx={{ color: 'tertiary.main', fontFamily: FONT_MONO }}>
              {highlight}
            </Box>
          )}
        </Typography>
      )}
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      {note && (
        <Typography variant="caption" component="div" sx={{ fontFamily: FONT_MONO, mt: 0.25, lineHeight: 1.5 }}>
          {note}
        </Typography>
      )}
    </Box>
  )
}

const diagramStyles = (t: Theme) => {
  const v = t.vars.palette
  const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
  const tones = {
    primary: v.primary.main,
    secondary: v.secondary.main,
    success: v.success.main,
    error: v.error.main,
    warning: v.warning.main,
  }

  return {
    backgroundColor: v.surface.containerLow,
    border: `1px solid ${v.surface.outlineVariant}`,
    '& text': { fontFamily: FONT_MONO, fontSize: 11, fill: v.text.secondary },

    '& .rd-cell rect': { fill: v.surface.containerHigh, stroke: v.surface.outlineVariant, strokeWidth: 1 },
    '& .rd-cell text': { fontSize: 13, fill: v.text.primary },
    '& .rd-dim': { opacity: 0.35 },
    '& .rd-match rect': { fill: tint(v.success.main, 22), stroke: v.success.main },
    '& .rd-miss rect': { fill: tint(v.error.main, 18), stroke: v.error.main },
    '& .rd-active rect': { fill: v.container.primary, stroke: v.primary.main, strokeWidth: 1.5 },
    '& .rd-active text': { fill: v.container.onPrimary, fontWeight: 700 },

    '& .rd-span path': { stroke: v.text.secondary, strokeWidth: 1 },

    '& .rd-bar': { fill: tint(v.text.secondary, 35) },
    '& .rd-bar-value': { fontSize: 9 },
    '& .rd-water': { fill: tint(v.primary.main, 60), stroke: v.primary.main, strokeWidth: 1 },
    '& .rd-baseline': { stroke: v.text.secondary, strokeWidth: 1 },
    '& .rd-box': { fill: tint(v.tertiary.main, 16), stroke: v.tertiary.main, strokeDasharray: '4 3' },
    '& .rd-level line': { strokeDasharray: '5 3', strokeWidth: 1.25 },
    '& .rd-level .rd-leader': { strokeDasharray: '1 3', opacity: 0.6 },

    ...Object.fromEntries(
      Object.entries(tones).flatMap(([name, color]) => [
        [`& .rd-tone-${name} path, & .rd-tone-${name} line`, { fill: color, stroke: color }],
        [`& .rd-tone-${name} text`, { fill: color, fontWeight: 700 }],
      ]),
    ),
  }
}

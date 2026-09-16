import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import data from '../../content/generated/webrtc.json'
import type { WebRtcDeck } from '../../content/types'
import { FONT_MONO, READING_MAX_WIDTH } from '../../theme/theme'

const deck = data as WebRtcDeck

export default function WebRtcPage() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const current = deck.cards.find((c) => `#${c.id}` === hash)?.id ?? ''

  return (
    <PageContainer sx={{ maxWidth: READING_MAX_WIDTH + 64 }}>
      <PageHeader
        crumbs={[{ label: 'System Design', to: '/system-design' }, { label: 'WebRTC revision cards' }]}
        title={`${deck.title} revision cards`}
        subtitle="Sixteen cards, from the four obstacles to the thirty-second pitch."
      >
        <FormControl size="small" sx={{ width: { xs: '100%', sm: 360 } }}>
          <InputLabel id="card-label">Jump to card</InputLabel>
          <Select
            labelId="card-label"
            label="Jump to card"
            value={current}
            onChange={(e) => navigate({ hash: e.target.value }, { replace: true })}
          >
            {deck.cards.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {String(c.number).padStart(2, '0')} · {c.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </PageHeader>

      <Stack spacing={3}>
        {deck.cards.map((c) => (
          <Card key={c.id} id={c.id} component="section" sx={(t) => ({ borderTop: `6px solid ${t.vars.palette.primary.main}` })}>
            <CardContent sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2, pb: 1.5, mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="overline" color="text.secondary">
                  {c.topic}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  <Box component="strong" sx={{ color: 'text.primary' }}>
                    {String(c.number).padStart(2, '0')}
                  </Box>{' '}
                  / {deck.cards.length}
                </Typography>
              </Stack>

              <Typography
                variant={c.cover ? 'h2' : 'h4'}
                component="h2"
                sx={{ '& em': { color: 'primary.main', fontStyle: 'italic' }, textWrap: 'balance' }}
                dangerouslySetInnerHTML={{ __html: c.titleHtml }}
              />
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 1, mb: 3, fontWeight: 400, fontStyle: 'italic', maxWidth: '60ch' }}
                dangerouslySetInnerHTML={{ __html: c.subtitle }}
              />
              <HtmlContent html={c.html} sx={[deckStyles, c.cover ? coverStyles : {}]} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageContainer>
  )
}

const deckStyles = (t: Theme) => {
  const v = t.vars.palette
  return {
    '& .steps': { listStyle: 'none', counterReset: 'step', pl: 0 },
    '& .steps li': {
      counterIncrement: 'step',
      position: 'relative',
      pl: { xs: 5, sm: 6 },
      py: 1.25,
      borderBottom: `1px dashed ${v.divider}`,
      '&:last-child': { borderBottom: 0 },
      '&::before': {
        content: 'counter(step, decimal-leading-zero)',
        position: 'absolute',
        left: 0,
        top: 10,
        color: v.primary.main,
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        fontWeight: 300,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
      },
    },
    '& .table td:first-of-type': { fontWeight: 600 },
    '& .term': {
      px: 0.75,
      borderRadius: 1,
      backgroundColor: v.container.primary,
      color: v.container.onPrimary,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    },
    '& .pullquote': {
      my: 3,
      pl: { xs: 2, sm: 3 },
      borderLeft: `3px solid ${v.primary.main}`,
      fontSize: { xs: '1.125rem', sm: '1.375rem' },
      lineHeight: 1.4,
      fontStyle: 'italic',
      fontWeight: 300,
    },
    '& .fact': { display: 'flex', alignItems: 'baseline', gap: 1, my: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } },
    '& .fact .label': { fontWeight: 500 },
    '& .fact .dots': { flex: 1, minWidth: 24, borderBottom: `1px dotted ${v.text.secondary}`, transform: 'translateY(-4px)' },
    '& .fact .value': { fontFamily: FONT_MONO, fontSize: '0.8125rem', color: v.primary.main },
    '& pre.code': { whiteSpace: 'pre-wrap', wordBreak: 'break-word', borderLeft: `4px solid ${v.primary.main}` },
  }
}

const coverStyles = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
  gap: 2,
  '& .label': { display: 'block', typography: 'overline', color: 'text.secondary' },
  '& .value': { display: 'block', typography: 'body2', fontWeight: 500 },
}

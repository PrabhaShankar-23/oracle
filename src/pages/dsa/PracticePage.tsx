import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import StyleOutlined from '@mui/icons-material/StyleOutlined'
import TocIcon from '@mui/icons-material/Toc'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import data from '../../content/generated/dsa-practice.json'
import type { Difficulty, PracticeGroup, PracticeList, PracticeProblem } from '../../content/types'
import { HEADER_HEIGHT, READING_MAX_WIDTH } from '../../theme/theme'
import { DIFFICULTY_COLOR, MARK_LABELS } from './marks'

const practice = data as PracticeList
const allProblems = practice.families.flatMap((f) => f.groups.flatMap((g) => g.problems))
const l1Total = allProblems.filter((p) => p.l1).length
const groupIds = new Set(practice.families.flatMap((f) => f.groups.map((g) => g.id)))

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']
const STORAGE_KEY = 'dsa-practice-solved'

type Filters = { level: 'all' | 'l1'; difficulty: string; hideSolved: boolean }
const EMPTY: Filters = { level: 'all', difficulty: '', hideSolved: false }

/** Solved ticks, keyed by the problem's number in the note. Kept in this browser only. */
function useSolved() {
  const [solved, setSolved] = useState<Set<number>>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      return new Set(Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : [])
    } catch {
      return new Set()
    }
  })

  const toggle = useCallback((n: number) => {
    setSolved((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].sort((a, b) => a - b)))
      } catch {
        // Storage blocked (private window): ticks still work for this visit.
      }
      return next
    })
  }, [])

  return [solved, toggle] as const
}

export default function PracticePage() {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const { hash } = useLocation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [solved, toggle] = useSolved()
  const [railOpen, setRailOpen] = useState(false)

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))
  const filtered = filters.level !== 'all' || !!filters.difficulty || filters.hideSolved

  const visible = useMemo(() => {
    const match = (p: PracticeProblem) =>
      (filters.level === 'all' || p.l1) &&
      (!filters.difficulty || p.difficulty === filters.difficulty) &&
      (!filters.hideSolved || !solved.has(p.n))
    return practice.families
      .map((f) => ({
        ...f,
        groups: f.groups.map((g) => ({ ...g, problems: g.problems.filter(match) })).filter((g) => g.problems.length > 0),
      }))
      .filter((f) => f.groups.length > 0)
  }, [filters, solved])

  const shown = visible.reduce((n, f) => n + f.groups.reduce((m, g) => m + g.problems.length, 0), 0)
  const solvedL1 = allProblems.filter((p) => p.l1 && solved.has(p.n)).length

  // A deep link to a pattern must not land on a group the filters have hidden.
  useEffect(() => {
    if (!groupIds.has(decodeURIComponent(hash.slice(1)))) return
    // oxlint-disable-next-line react/set-state-in-effect
    setFilters(EMPTY)
  }, [hash])

  const go = (id: string) => {
    navigate({ hash: id }, { replace: true })
    setRailOpen(false)
  }

  const rail = (
    <List dense disablePadding aria-label="Patterns">
      {practice.families.map((f) => (
        <li key={f.id}>
          <ListSubheader sx={{ bgcolor: 'background.default', lineHeight: '32px' }}>{f.name}</ListSubheader>
          {f.groups.map((g) => (
            <ListItemButton key={g.id} onClick={() => go(g.id)} sx={{ minHeight: { xs: 44, lg: 36 }, py: 0, borderRadius: 5 }}>
              <ListItemText
                primary={g.code ? `${g.code} · ${g.name}` : g.name}
                slotProps={{ primary: { variant: 'body2', noWrap: true } }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ pl: 1, fontVariantNumeric: 'tabular-nums' }}>
                {g.problems.filter((p) => solved.has(p.n)).length}/{g.problems.length}
              </Typography>
            </ListItemButton>
          ))}
        </li>
      ))}
      <li>
        <ListSubheader sx={{ bgcolor: 'background.default', lineHeight: '32px' }}>Guide</ListSubheader>
        {practice.guide.map((s) => (
          <ListItemButton key={s.id} onClick={() => go(s.id)} sx={{ minHeight: { xs: 44, lg: 36 }, py: 0, borderRadius: 5 }}>
            <ListItemText primary={s.title} slotProps={{ primary: { variant: 'body2', noWrap: true } }} />
          </ListItemButton>
        ))}
      </li>
    </List>
  )

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'DSA', to: '/dsa' }, { label: practice.title }]}
        title={practice.title}
        subtitle={<span dangerouslySetInnerHTML={{ __html: practice.intro }} />}
      >
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, maxWidth: 640 }}>
          <Progress label="Solved" done={solved.size} total={allProblems.length} />
          <Progress label="L1 solved" done={solvedL1} total={l1Total} />
        </Box>
      </PageHeader>

      {/* Filter bar */}
      <Paper
        variant="outlined"
        sx={(t) => ({
          p: { xs: 1.5, sm: 2 },
          mb: 3,
          backgroundColor: t.vars.palette.surface.container,
          borderColor: t.vars.palette.surface.outlineVariant,
        })}
      >
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={filters.level}
            onChange={(_, level: Filters['level'] | null) => level && set({ level })}
            aria-label="Which problems"
          >
            <ToggleButton value="all" sx={{ minHeight: 44, px: 2 }}>
              All {allProblems.length}
            </ToggleButton>
            <ToggleButton value="l1" sx={{ minHeight: 44, px: 2 }}>
              🟢 L1 {l1Total}
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="practice-difficulty-label">Difficulty</InputLabel>
            <Select
              labelId="practice-difficulty-label"
              label="Difficulty"
              value={filters.difficulty}
              onChange={(e) => set({ difficulty: e.target.value })}
            >
              <MenuItem value="">Any difficulty</MenuItem>
              {DIFFICULTIES.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={filters.hideSolved} onChange={(e) => set({ hideSolved: e.target.checked })} />}
            label="Hide solved"
            sx={{ mr: 0, whiteSpace: 'nowrap' }}
          />
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={`${shown} / ${allProblems.length} problems`}
            size="small"
            color={shown < allProblems.length ? 'primary' : 'default'}
          />
          <Box sx={{ flex: 1 }} />
          {filtered && (
            <Button size="small" startIcon={<RestartAltIcon />} onClick={() => setFilters(EMPTY)}>
              Reset
            </Button>
          )}
          {!desktop && (
            <Button size="small" variant="outlined" startIcon={<TocIcon />} onClick={() => setRailOpen(true)}>
              Patterns
            </Button>
          )}
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr)' }, gap: 4, alignItems: 'start' }}>
        {desktop && (
          <Box
            component="aside"
            sx={{ position: 'sticky', top: HEADER_HEIGHT + 16, maxHeight: `calc(100dvh - ${HEADER_HEIGHT + 32}px)`, overflowY: 'auto' }}
          >
            {rail}
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          {shown === 0 && (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
              {filters.hideSolved ? 'Everything that matches these filters is solved.' : 'No problems match these filters.'}
            </Typography>
          )}
          {visible.map((f) => (
            <Box component="section" key={f.id} sx={{ mb: 4 }}>
              <Typography variant="overline" component="h2" color="primary" sx={{ display: 'block', fontWeight: 700 }}>
                {f.name}
              </Typography>
              {f.note && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {f.note}
                </Typography>
              )}
              {f.groups.map((g) => (
                <GroupCard key={g.id} group={g} solved={solved} onToggle={toggle} />
              ))}
            </Box>
          ))}

          {practice.guide.map((s) => (
            <Box component="section" key={s.id} sx={{ mb: 4, maxWidth: READING_MAX_WIDTH }}>
              <Typography id={s.id} variant="h5" component="h2" sx={{ mb: 1.5 }}>
                {s.title}
              </Typography>
              <HtmlContent html={s.html} />
            </Box>
          ))}
        </Box>
      </Box>

      {!desktop && (
        <Drawer
          anchor="right"
          open={railOpen}
          onClose={() => setRailOpen(false)}
          slotProps={{ paper: { sx: { width: 'min(340px, 88vw)', borderRadius: '16px 0 0 16px', py: 2, px: 1 } } }}
        >
          {rail}
        </Drawer>
      )}
    </PageContainer>
  )
}

function Progress({ label, done, total }: { label: string; done: number; total: number }) {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {done} / {total}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={total ? (done / total) * 100 : 0}
        aria-label={`${label}: ${done} of ${total}`}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  )
}

type GroupProps = { group: PracticeGroup; solved: Set<number>; onToggle: (n: number) => void }

function GroupCard({ group: g, solved, onToggle }: GroupProps) {
  return (
    <Card id={g.id} component="article" sx={{ mb: 1.5 }}>
      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        sx={{ alignItems: 'center', flexWrap: 'wrap', px: { xs: 2, sm: 2.5 }, pt: 1.5, pb: 0.5 }}
      >
        {g.code && (
          <Typography variant="subtitle2" color="primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {g.code}
          </Typography>
        )}
        <Typography variant="subtitle1" component="h3" sx={{ minWidth: 0, mr: 'auto' }}>
          {g.name}
        </Typography>
        {g.recallId && (
          <Button
            component={RouterLink}
            to={`/dsa/cold-recall#${g.recallId}`}
            size="small"
            startIcon={<StyleOutlined />}
            sx={{ minHeight: 36 }}
          >
            Recall cards
          </Button>
        )}
      </Stack>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, px: { xs: 0.5, sm: 1 }, pb: 1 }}>
        {g.problems.map((p) => (
          <ProblemRow key={p.n} problem={p} solved={solved.has(p.n)} onToggle={onToggle} />
        ))}
      </Box>
    </Card>
  )
}

type RowProps = { problem: PracticeProblem; solved: boolean; onToggle: (n: number) => void }

const ProblemRow = memo(function ProblemRow({ problem: p, solved, onToggle }: RowProps) {
  return (
    <Box
      component="li"
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.25,
        borderTop: `1px solid ${t.vars.palette.divider}`,
        '&:first-of-type': { borderTop: 0 },
      })}
    >
      <Checkbox
        checked={solved}
        onChange={() => onToggle(p.n)}
        slotProps={{ input: { 'aria-label': `Solved: ${p.title}` } }}
        sx={{ width: 44, height: 44, flexShrink: 0 }}
      />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: '3ch', flexShrink: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
      >
        {p.n}
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 0.5, sm: 1 }}
        useFlexGap
        sx={{ flex: 1, minWidth: 0, alignItems: { sm: 'center' }, py: { xs: 0.75, sm: 0 } }}
      >
        <Link
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color={solved ? 'text.secondary' : 'text.primary'}
          sx={{
            display: 'block',
            mr: { sm: 'auto' },
            minWidth: 0,
            overflowWrap: 'anywhere',
            textDecoration: solved ? 'line-through' : undefined,
          }}
        >
          {p.title}
          <OpenInNewIcon sx={{ fontSize: 14, color: 'text.secondary', ml: 0.5, verticalAlign: '-2px' }} />
        </Link>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {p.l1 && <Chip label="L1" size="small" color="primary" />}
          <Chip label={p.difficulty} size="small" color={DIFFICULTY_COLOR[p.difficulty]} variant="outlined" />
          {p.marks.map((m) => (
            <Tooltip key={m} title={MARK_LABELS[m] ?? m} enterTouchDelay={0}>
              <Chip label={m} size="small" aria-label={MARK_LABELS[m] ?? m} />
            </Tooltip>
          ))}
        </Stack>
      </Stack>
      {p.recallId && (
        <Tooltip title="Recall card">
          <IconButton
            component={RouterLink}
            to={`/dsa/cold-recall#${p.recallId}`}
            aria-label={`Recall card: ${p.title}`}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <StyleOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
})

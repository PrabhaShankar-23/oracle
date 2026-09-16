import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Autocomplete from '@mui/material/Autocomplete'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import data from '../../content/generated/dsa-cold-recall.json'
import type { ColdRecall, Difficulty, Problem } from '../../content/types'
import { HEADER_HEIGHT } from '../../theme/theme'
import { MARK_LABELS } from './marks'
import ProblemCard from './ProblemCard'

const recall = data as ColdRecall

const allProblems = recall.families.flatMap((f) =>
  f.patterns.flatMap((p) => p.problems.map((problem) => ({ problem, pattern: p, family: f }))),
)

const searchText = new Map<string, string>(
  allProblems.map(({ problem: q, pattern }) => [
    q.id,
    [q.title, pattern.id, pattern.name, q.state, q.invariant, q.why, q.code, ...q.approaches.map((a) => a.text), ...q.traps]
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .toLowerCase(),
  ]),
)

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard']

type Filters = { query: string; family: string; pattern: string; difficulty: string; mark: string }
const EMPTY: Filters = { query: '', family: '', pattern: '', difficulty: '', mark: '' }

export default function ColdRecallPage() {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const wideBar = useMediaQuery(theme.breakpoints.up('md'))
  const { hash } = useLocation()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [recallMode, setRecallMode] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const query = useDeferredValue(filters.query.trim().toLowerCase())

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))
  const activeCount = [filters.family, filters.pattern, filters.difficulty, filters.mark].filter(Boolean).length

  const visible = useMemo(() => {
    const match = (q: Problem, patternId: string, familyId: string) =>
      (!filters.family || filters.family === familyId) &&
      (!filters.pattern || filters.pattern === patternId) &&
      (!filters.difficulty || filters.difficulty === q.difficulty) &&
      (!filters.mark || q.marks.includes(filters.mark)) &&
      (!query || searchText.get(q.id)!.includes(query))

    return recall.families
      .map((f) => ({
        ...f,
        patterns: f.patterns
          .map((p) => ({ ...p, problems: p.problems.filter((q) => match(q, p.id, f.id)) }))
          .filter((p) => p.problems.length > 0),
      }))
      .filter((f) => f.patterns.length > 0)
  }, [filters.family, filters.pattern, filters.difficulty, filters.mark, query])

  const shownCount = visible.reduce((n, f) => n + f.patterns.reduce((m, p) => m + p.problems.length, 0), 0)
  const patternOptions = recall.families.filter((f) => !filters.family || f.id === filters.family)

  // Deep link (#P12 or #P12-some-problem): make sure the target is visible and expanded.
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    const hit = allProblems.find(({ problem, pattern }) => problem.id === id || pattern.id === id)
    if (!hit) return
    // The hash is set from outside this page (global search, links), so sync filters to it here.
    // oxlint-disable-next-line react/set-state-in-effect
    setFilters(EMPTY)
    setCollapsed((c) => {
      if (!c.has(hit.pattern.id)) return c
      const next = new Set(c)
      next.delete(hit.pattern.id)
      return next
    })
  }, [hash])

  const togglePattern = (id: string) =>
    setCollapsed((c) => {
      const next = new Set(c)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const filterControls = (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, minmax(0, 1fr))' },
      }}
    >
      <FormControl size="small" fullWidth>
        <InputLabel id="family-label">Family</InputLabel>
        <Select labelId="family-label" label="Family" value={filters.family} onChange={(e) => set({ family: e.target.value, pattern: '' })}>
          <MenuItem value="">All families</MenuItem>
          {recall.families.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel id="pattern-label">Pattern</InputLabel>
        <Select labelId="pattern-label" label="Pattern" value={filters.pattern} onChange={(e) => set({ pattern: e.target.value })}>
          <MenuItem value="">All patterns</MenuItem>
          {patternOptions.flatMap((f) => [
            <ListSubheader key={`h-${f.id}`}>{f.name}</ListSubheader>,
            ...f.patterns.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.id} · {p.name}
              </MenuItem>
            )),
          ])}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel id="difficulty-label">Difficulty</InputLabel>
        <Select labelId="difficulty-label" label="Difficulty" value={filters.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
          <MenuItem value="">Any difficulty</MenuItem>
          {DIFFICULTIES.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel id="list-label">List</InputLabel>
        <Select labelId="list-label" label="List" value={filters.mark} onChange={(e) => set({ mark: e.target.value })}>
          <MenuItem value="">Any list</MenuItem>
          {Object.entries(MARK_LABELS).map(([mark, label]) => (
            <MenuItem key={mark} value={mark}>
              {mark} {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )

  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'DSA', to: '/dsa' }, { label: 'Cold recall' }]}
        title={recall.title}
        subtitle={<span dangerouslySetInnerHTML={{ __html: recall.intro }} />}
      />

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
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          <Autocomplete
            freeSolo
            fullWidth
            size="small"
            options={allProblems}
            groupBy={(o) => `${o.pattern.id} · ${o.pattern.name}`}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o.problem.title)}
            getOptionKey={(o) => (typeof o === 'string' ? o : o.problem.id)}
            inputValue={filters.query}
            onInputChange={(_, v, reason) => reason !== 'reset' && set({ query: v })}
            onChange={(_, option) => {
              if (option && typeof option !== 'string') {
                set({ query: '' })
                navigate({ hash: option.problem.id }, { replace: true })
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label="Search problems, invariants, code…" />
            )}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0, justifyContent: 'space-between' }}>
            {!wideBar && (
              <Badge badgeContent={activeCount} color="primary">
                <Button
                  variant={filtersOpen ? 'contained' : 'outlined'}
                  startIcon={<FilterListIcon />}
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-expanded={filtersOpen}
                >
                  Filters
                </Button>
              </Badge>
            )}
            <FormControlLabel
              control={<Switch checked={recallMode} onChange={(e) => setRecallMode(e.target.checked)} />}
              label="Recall mode"
              sx={{ mr: 0, whiteSpace: 'nowrap' }}
            />
          </Stack>
        </Stack>

        {wideBar ? <Box sx={{ mt: 1.5 }}>{filterControls}</Box> : <Collapse in={filtersOpen}><Box sx={{ mt: 1.5 }}>{filterControls}</Box></Collapse>}

        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={`${shownCount} / ${allProblems.length} problems`} size="small" color={shownCount < allProblems.length ? 'primary' : 'default'} />
          <Box sx={{ flex: 1 }} />
          {(activeCount > 0 || filters.query) && (
            <Button size="small" startIcon={<RestartAltIcon />} onClick={() => setFilters(EMPTY)}>
              Reset
            </Button>
          )}
          <Button size="small" startIcon={<UnfoldMoreIcon />} onClick={() => setCollapsed(new Set())}>
            Expand all
          </Button>
          <Button
            size="small"
            startIcon={<UnfoldLessIcon />}
            onClick={() => setCollapsed(new Set(recall.families.flatMap((f) => f.patterns.map((p) => p.id))))}
          >
            Collapse all
          </Button>
        </Stack>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '260px minmax(0, 1fr)' }, gap: 4, alignItems: 'start' }}>
        {desktop && (
          <Box component="aside" sx={{ position: 'sticky', top: HEADER_HEIGHT + 16, maxHeight: `calc(100dvh - ${HEADER_HEIGHT + 32}px)`, overflowY: 'auto' }}>
            <List dense disablePadding aria-label="Patterns">
              {recall.families.map((f) => (
                <li key={f.id}>
                  <ListSubheader sx={{ bgcolor: 'background.default', lineHeight: '32px' }}>{f.name}</ListSubheader>
                  {f.patterns.map((p) => (
                    <ListItemButton
                      key={p.id}
                      onClick={() => navigate({ hash: p.id }, { replace: true })}
                      sx={{ minHeight: 34, py: 0, borderRadius: 5 }}
                    >
                      <ListItemText primary={`${p.id} · ${p.name}`} slotProps={{ primary: { variant: 'body2', noWrap: true } }} />
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                        {p.problems.length}
                      </Typography>
                    </ListItemButton>
                  ))}
                </li>
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          {shownCount === 0 && (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
              No problems match these filters.
            </Typography>
          )}
          {visible.map((f) => (
            <Box component="section" key={f.id} sx={{ mb: 4 }}>
              <Typography variant="overline" component="h2" color="primary" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>
                {f.name}
              </Typography>
              {f.patterns.map((p) => (
                <Accordion
                  key={p.id}
                  id={p.id}
                  expanded={!collapsed.has(p.id) || !!query || activeCount > 0}
                  onChange={() => togglePattern(p.id)}
                  slotProps={{ transition: { timeout: 200 } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0.5, minHeight: 52 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', minWidth: 0 }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {p.id}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ minWidth: 0 }}>
                        {p.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.problems.length}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
                    {p.problems.map((q) => (
                      <ProblemCard key={q.id} problem={q} recallMode={recallMode} />
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </PageContainer>
  )
}

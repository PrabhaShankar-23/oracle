import SearchIcon from '@mui/icons-material/Search'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { searchIndex, type SearchItem } from '../../content/sections'
import type { GameDaySearchEntry } from '../../content/types'

const filter = createFilterOptions<SearchItem>({
  limit: 60,
  stringify: (o) => `${o.label} ${o.secondary}`,
})

type Props = {
  autoFocus?: boolean
  onNavigate?: () => void
}

export default function GlobalSearch({ autoFocus, onNavigate }: Props) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [questions, setQuestions] = useState<SearchItem[]>([])

  // 474 Game Day questions are ~116 KB, so they load on the first keystroke rather than
  // shipping in the main bundle with the rest of the index.
  useEffect(() => {
    if (input.length < 2 || questions.length > 0) return
    let live = true
    void import('../../content/generated/game-day-search.json').then((m) => {
      if (!live) return
      setQuestions(
        (m.default as GameDaySearchEntry[]).map((q) => ({
          key: `gdq:${q.id}`,
          label: q.text,
          secondary: `${q.topicTitle} · band ${q.band}`,
          path: `/game-day/recall/${q.topic}#${q.id}`,
          group: 'Game Day questions',
        })),
      )
    })
    return () => {
      live = false
    }
  }, [input, questions.length])

  const options = useMemo(() => [...searchIndex, ...questions], [questions])

  return (
    <Autocomplete
      fullWidth
      openOnFocus={false}
      autoHighlight
      forcePopupIcon={false}
      options={options}
      groupBy={(o) => o.group}
      getOptionLabel={(o) => o.label}
      getOptionKey={(o) => o.key}
      filterOptions={filter}
      inputValue={input}
      onInputChange={(_, v, reason) => setInput(reason === 'reset' ? '' : v)}
      value={null}
      blurOnSelect
      noOptionsText="Nothing matches"
      onChange={(_, option) => {
        if (!option) return
        navigate(option.path)
        onNavigate?.()
      }}
      renderOption={({ key, ...props }, option) => (
        <Box component="li" key={key} {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start !important' }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {option.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {option.secondary}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          placeholder="Search pages, problems, sections…"
          size="small"
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: (t) => ({ borderRadius: 7, backgroundColor: t.vars.palette.surface.containerHigh, pr: '12px !important' }),
            },
          }}
        />
      )}
    />
  )
}

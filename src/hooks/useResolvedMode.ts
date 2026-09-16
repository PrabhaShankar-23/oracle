import { useColorScheme } from '@mui/material/styles'

/** The colour scheme actually on screen, with 'system' resolved to light or dark. */
export function useResolvedMode() {
  const { mode, systemMode } = useColorScheme()
  return (mode === 'system' ? systemMode : mode) ?? 'light'
}

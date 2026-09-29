import { useColorScheme } from '@mui/material/styles'
import type { SchemeName } from '../theme/theme'

/** The colour scheme actually on screen, with 'system' resolved to light or dark. */
export function useResolvedMode() {
  const { mode, systemMode } = useColorScheme()
  return (mode === 'system' ? systemMode : mode) ?? 'light'
}

/** Which scheme is applied: 'light', 'dark', or a named variant such as 'forest'. */
export function useActiveScheme(): SchemeName {
  const { colorScheme } = useColorScheme()
  const mode = useResolvedMode()
  return (colorScheme as SchemeName | undefined) ?? mode
}

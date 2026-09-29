import ForestOutlined from '@mui/icons-material/ForestOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import { useActiveScheme } from '../../hooks/useResolvedMode'

/**
 * Switches dark mode between the default dark scheme and Deep Forest (VS Code's Material
 * Deepforest). MUI remembers the choice, so dark mode stays forest until switched back.
 */
export default function ForestToggle() {
  const { setMode, setColorScheme } = useColorScheme()
  const forest = useActiveScheme() === 'forest'
  const label = forest ? 'Switch to the default dark theme' : 'Switch to the Deep Forest theme'

  const toggle = () => {
    if (forest) {
      setColorScheme({ dark: 'dark' })
      return
    }
    setColorScheme({ dark: 'forest' })
    setMode('dark')
  }

  return (
    <Tooltip title={label}>
      <IconButton onClick={toggle} aria-label={label} aria-pressed={forest} sx={forest ? { color: 'primary.main' } : undefined}>
        <ForestOutlined />
      </IconButton>
    </Tooltip>
  )
}

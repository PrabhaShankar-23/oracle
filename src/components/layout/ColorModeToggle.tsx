import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlined from '@mui/icons-material/LightModeOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'
import { useResolvedMode } from '../../hooks/useResolvedMode'

export default function ColorModeToggle() {
  const { setMode } = useColorScheme()
  const resolved = useResolvedMode()
  const next = resolved === 'dark' ? 'light' : 'dark'

  return (
    <Tooltip title={`Switch to ${next} theme`}>
      <IconButton onClick={() => setMode(next)} aria-label={`Switch to ${next} theme`}>
        {resolved === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  )
}

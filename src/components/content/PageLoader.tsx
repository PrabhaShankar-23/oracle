import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'

export default function PageLoader() {
  return (
    <Box sx={{ px: 2, py: 6, maxWidth: 480, mx: 'auto' }} role="status" aria-label="Loading page">
      <LinearProgress />
    </Box>
  )
}

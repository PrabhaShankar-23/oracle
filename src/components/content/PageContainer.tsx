import Box, { type BoxProps } from '@mui/material/Box'
import { CONTENT_MAX_WIDTH } from '../../theme/theme'

/** Horizontal gutters: 16px compact, 24px medium, 32px expanded (M3 window classes). */
export default function PageContainer({ sx, ...props }: BoxProps) {
  return (
    <Box
      {...props}
      sx={[{ width: '100%', maxWidth: CONTENT_MAX_WIDTH, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, pb: 8 }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  )
}

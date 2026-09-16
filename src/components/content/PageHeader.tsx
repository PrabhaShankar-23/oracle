import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'

type Crumb = { label: string; to?: string }

type Props = {
  crumbs?: Crumb[]
  title: string
  subtitle?: ReactNode
  children?: ReactNode
}

export default function PageHeader({ crumbs = [], title, subtitle, children }: Props) {
  return (
    <Box component="header" sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 2, md: 3 } }}>
      {crumbs.length > 0 && (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5, '& ol': { flexWrap: 'wrap' } }}>
          {crumbs.map((c) =>
            c.to ? (
              <Link key={c.label} component={RouterLink} to={c.to} underline="hover" color="inherit" variant="body2">
                {c.label}
              </Link>
            ) : (
              <Typography key={c.label} variant="body2" color="text.primary">
                {c.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Typography variant="h3" component="h1" sx={{ textWrap: 'balance' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, fontWeight: 400, maxWidth: '68ch' }}>
          {subtitle}
        </Typography>
      )}
      {children && <Box sx={{ mt: 2 }}>{children}</Box>}
    </Box>
  )
}

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import PageContainer from '../components/content/PageContainer'
import { manifest } from '../content/sections'

export default function HomePage() {
  return (
    <PageContainer>
      <Box
        sx={(t) => ({
          mt: { xs: 2, md: 4 },
          mb: 5,
          p: { xs: 3, sm: 5, md: 7 },
          borderRadius: { xs: 4, md: 7 },
          backgroundColor: t.vars.palette.container.primary,
          color: t.vars.palette.container.onPrimary,
        })}
      >
        <Typography variant="h2" component="h1" sx={{ textWrap: 'balance', maxWidth: '18ch' }}>
          Interview prep, one recall at a time.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 400, maxWidth: '56ch', opacity: 0.9 }}>
          {manifest.dsa.problems.length} DSA recall cards and {manifest.caseStudies.length} system design case studies so far. The
          rest of the vault moves over section by section.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
          <Button variant="contained" size="large" component={Link} to="/dsa/cold-recall" endIcon={<ArrowForwardIcon />}>
            Start DSA recall
          </Button>
          <Button variant="outlined" size="large" color="inherit" component={Link} to="/system-design/case-studies">
            System design case studies
          </Button>
        </Stack>
      </Box>

    </PageContainer>
  )
}

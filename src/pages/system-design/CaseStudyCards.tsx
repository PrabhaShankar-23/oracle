import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import type { CaseStudySummary } from '../../content/types'

export default function CaseStudyCards({ studies }: { studies: CaseStudySummary[] }) {
  return (
    <Grid container spacing={2}>
      {studies.map((s) => (
        <Grid key={s.slug} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea component={Link} to={`/system-design/case-studies/${s.slug}`} sx={{ height: '100%', alignItems: 'flex-start' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mb: 1.5 }}>
                  {s.tags.map((t) => (
                    <Chip key={t.label} label={t.label} size="small" color={t.tone} variant="outlined" />
                  ))}
                </Stack>
                <Typography variant="h6" component="h3" gutterBottom>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {s.summary}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                  {s.readingTime}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

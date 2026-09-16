import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link, useLocation } from 'react-router'
import PageContainer from '../components/content/PageContainer'
import PageHeader from '../components/content/PageHeader'
import { findSection, groupPages } from '../content/sections'
import NotFoundPage from './NotFoundPage'

export default function SectionPage() {
  const { pathname } = useLocation()
  const section = findSection(pathname)
  if (!section || section.path !== pathname) return <NotFoundPage />

  return (
    <PageContainer>
      <PageHeader crumbs={[{ label: 'Home', to: '/' }, { label: section.title }]} title={section.title} subtitle={section.description} />

      {section.pages.length === 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
          <ScheduleOutlined color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Moving over soon
          </Typography>
          <Typography color="text.secondary">These notes still live in the vault. Pages will appear here as they're converted.</Typography>
        </Paper>
      )}

      {groupPages(section.pages).map(([group, pages]) => (
        <Stack key={group} component="section" spacing={2} sx={{ mb: 5 }}>
          {group && (
            <Typography variant="h5" component="h2">
              {group}
            </Typography>
          )}
          <Grid container spacing={2}>
            {pages.map((p) => (
              <Grid key={p.path} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea component={Link} to={p.path} sx={{ height: '100%', alignItems: 'flex-start' }}>
                    <CardContent>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" component="h3">
                          {p.title}
                        </Typography>
                        <ArrowForwardIcon color="primary" fontSize="small" />
                      </Stack>
                      {p.description && (
                        <Typography variant="body2" color="text.secondary">
                          {p.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      ))}
    </PageContainer>
  )
}

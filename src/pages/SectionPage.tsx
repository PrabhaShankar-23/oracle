import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import PageContainer from '../components/content/PageContainer'
import PageHeader from '../components/content/PageHeader'
import { findSection, navTree, type NavPage } from '../content/sections'
import NotFoundPage from './NotFoundPage'

/** A section small enough that collapsing its groups would only add clicks. */
const ALWAYS_OPEN = 10

function PageGrid({ pages }: { pages: NavPage[] }) {
  return (
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
  )
}

/** A collapsible group of pages. `level` picks the heading element and the emphasis. */
function Panel({ label, count, level, children }: { label: string; count: number; level: 2 | 3; children: ReactNode }) {
  return (
    <Accordion
      disableGutters
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={(t) => ({
        mt: level === 3 ? 1.5 : 0,
        mb: 1.5,
        borderRadius: 3,
        border: `1px solid ${t.vars.palette.surface.outlineVariant}`,
        backgroundColor: level === 2 ? t.vars.palette.surface.containerLowest : t.vars.palette.surface.container,
        '&::before': { display: 'none' },
        '&.Mui-expanded': { mt: level === 3 ? 1.5 : 0, mb: 1.5 },
      })}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 56, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant={level === 2 ? 'h6' : 'subtitle1'} component={level === 2 ? 'h2' : 'h3'}>
            {label}
          </Typography>
          <Chip label={count} size="small" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>{children}</AccordionDetails>
    </Accordion>
  )
}

/**
 * A section's landing page: its description, then one row per group.
 *
 * Large sections open as a contents list rather than every page at once — System Design alone
 * holds 100+ pages, and rendering them all buries the shape of the section. Small sections stay
 * expanded, because collapsing four pages only adds a click.
 */
export default function SectionPage() {
  const { pathname } = useLocation()
  const section = findSection(pathname)
  if (!section || section.path !== pathname) return <NotFoundPage />

  const tree = navTree(section.pages)
  const expanded = section.pages.length <= ALWAYS_OPEN

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

      {expanded
        ? tree.map((group) => (
            <Stack key={group.name} component="section" spacing={2} sx={{ mb: 5 }}>
              {group.name && (
                <Typography variant="h5" component="h2">
                  {group.name}
                </Typography>
              )}
              <PageGrid pages={group.direct} />
            </Stack>
          ))
        : tree.map((group) => (
            <Panel key={group.name} label={group.name || 'Pages'} count={group.count} level={2}>
              {group.direct.length > 0 && <PageGrid pages={group.direct} />}
              {group.subgroups.map((sub) => (
                <Panel key={sub.name} label={sub.name} count={sub.pages.length} level={3}>
                  <PageGrid pages={sub.pages} />
                </Panel>
              ))}
            </Panel>
          ))}
    </PageContainer>
  )
}

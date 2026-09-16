import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import HtmlContent from '../../components/content/HtmlContent'
import PageContainer from '../../components/content/PageContainer'
import PageHeader from '../../components/content/PageHeader'
import data from '../../content/generated/case-studies.json'
import type { CaseStudies } from '../../content/types'
import { READING_MAX_WIDTH } from '../../theme/theme'
import CaseStudyCards from './CaseStudyCards'

const { index, studies } = data as CaseStudies

export default function CaseStudiesIndexPage() {
  return (
    <PageContainer>
      <PageHeader
        crumbs={[{ label: 'System Design', to: '/system-design' }, { label: 'Case studies' }]}
        title={index.title}
        subtitle={index.subtitle}
      />
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        The five notes
      </Typography>
      <CaseStudyCards studies={studies} />
      <Box sx={{ maxWidth: READING_MAX_WIDTH, mt: 5 }}>
        <HtmlContent html={index.html} />
      </Box>
    </PageContainer>
  )
}

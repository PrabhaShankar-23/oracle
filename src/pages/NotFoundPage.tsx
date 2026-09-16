import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import PageContainer from '../components/content/PageContainer'

export default function NotFoundPage() {
  return (
    <PageContainer sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        That note hasn't moved over yet, or the link is wrong.
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Back to home
      </Button>
    </PageContainer>
  )
}

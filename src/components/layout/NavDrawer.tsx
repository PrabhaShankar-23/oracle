import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import SideNav from './SideNav'

type Props = { open: boolean; onClose: () => void }

/** Below `lg`: the section sidebar as a modal drawer. */
export default function NavDrawer({ open, onClose }: Props) {
  return (
    <Drawer open={open} onClose={onClose} slotProps={{ paper: { sx: { width: 'min(320px, 86vw)', borderRadius: '0 16px 16px 0' } } }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="subtitle1" component={Link} to="/" onClick={onClose} sx={{ color: 'text.primary', textDecoration: 'none' }}>
          AlgoHandbook
        </Typography>
      </Box>
      <SideNav onNavigate={onClose} />
    </Drawer>
  )
}

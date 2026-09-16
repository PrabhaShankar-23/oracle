import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Suspense, useState } from 'react'
import { Link, Outlet } from 'react-router'
import { useHashScroll } from '../../hooks/useHashScroll'
import PageLoader from '../content/PageLoader'
import ColorModeToggle from './ColorModeToggle'
import GlobalSearch from './GlobalSearch'
import NavDrawer from './NavDrawer'
import SectionMenus from './SectionMenus'

export default function AppShell() {
  const theme = useTheme()
  const wide = useMediaQuery(theme.breakpoints.up('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  useHashScroll()

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppBar>
        <Toolbar sx={{ gap: { xs: 0.5, md: 1.5 }, px: { xs: 1, sm: 2 } }}>
          {!wide && (
            <IconButton onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            noWrap
            sx={{ color: 'text.primary', textDecoration: 'none', fontSize: { xs: '1.125rem', sm: '1.25rem' }, mr: { md: 1 } }}
          >
            AlgoHandbook
          </Typography>

          {wide && <SectionMenus />}

          <Box sx={{ flex: 1 }} />

          {wide ? (
            <Box sx={{ width: { md: 260, lg: 340 } }}>
              <GlobalSearch />
            </Box>
          ) : (
            <IconButton onClick={() => setSearchOpen(true)} aria-label="Search">
              <SearchIcon />
            </IconButton>
          )}
          <ColorModeToggle />
        </Toolbar>
      </AppBar>

      {!wide && <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}

      <Dialog
        fullScreen
        open={searchOpen && !wide}
        onClose={() => setSearchOpen(false)}
        slotProps={{ paper: { sx: (t) => ({ backgroundColor: t.vars.palette.surface.container }) } }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', p: 1.5 }}>
          <GlobalSearch autoFocus onNavigate={() => setSearchOpen(false)} />
          <IconButton onClick={() => setSearchOpen(false)} aria-label="Close search">
            <CloseIcon />
          </IconButton>
        </Stack>
      </Dialog>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Box>

      <Box component="footer" sx={{ py: 3, px: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">Built from the AlgoHandbook notes vault</Typography>
      </Box>
    </Box>
  )
}

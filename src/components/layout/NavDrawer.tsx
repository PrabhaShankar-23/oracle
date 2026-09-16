import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Typography from '@mui/material/Typography'
import { Fragment, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { findSection, groupPages, liveSections, upcomingSections } from '../../content/sections'

type Props = { open: boolean; onClose: () => void }

/** Compact/medium-width navigation: modal drawer with collapsible sections. */
export default function NavDrawer({ open, onClose }: Props) {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState<string | undefined>(() => findSection(pathname)?.id)

  return (
    <Drawer open={open} onClose={onClose} slotProps={{ paper: { sx: { width: 'min(320px, 86vw)', borderRadius: '0 16px 16px 0' } } }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="subtitle1" component={Link} to="/" onClick={onClose} sx={{ color: 'text.primary', textDecoration: 'none' }}>
          AlgoHandbook
        </Typography>
      </Box>
      <List sx={{ px: 1.5 }} component="nav" aria-label="Sections">
        {liveSections.map((s) => {
          const isOpen = expanded === s.id
          return (
            <Fragment key={s.id}>
              <ListItemButton onClick={() => setExpanded(isOpen ? undefined : s.id)} aria-expanded={isOpen}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <s.icon />
                </ListItemIcon>
                <ListItemText primary={s.title} />
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={isOpen} unmountOnExit>
                <List disablePadding dense>
                  <ListItemButton component={Link} to={s.path} onClick={onClose} selected={pathname === s.path} sx={{ pl: 7 }}>
                    <ListItemText primary={`All ${s.title}`} />
                  </ListItemButton>
                  {groupPages(s.pages).map(([group, pages]) => (
                    <Fragment key={group}>
                      {group && (
                        <ListSubheader sx={{ bgcolor: 'transparent', pl: 7, lineHeight: '32px', typography: 'overline', color: 'primary.main' }}>{group}</ListSubheader>
                      )}
                      {pages.map((p) => (
                        <ListItemButton key={p.path} component={Link} to={p.path} onClick={onClose} selected={pathname === p.path} sx={{ pl: 7 }}>
                          <ListItemText primary={p.title} />
                        </ListItemButton>
                      ))}
                    </Fragment>
                  ))}
                </List>
              </Collapse>
            </Fragment>
          )
        })}
      </List>
      <Divider sx={{ mx: 3 }} />
      <List sx={{ px: 1.5 }} subheader={<ListSubheader sx={{ bgcolor: 'transparent' }}>Moving over soon</ListSubheader>}>
        {upcomingSections.map((s) => (
          <ListItemButton key={s.id} component={Link} to={s.path} onClick={onClose} selected={pathname === s.path}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <s.icon />
            </ListItemIcon>
            <ListItemText primary={s.title} />
            <Chip label="Soon" size="small" />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  )
}

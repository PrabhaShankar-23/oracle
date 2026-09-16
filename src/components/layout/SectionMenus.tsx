import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { Fragment, useState, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { findSection, groupPages, liveSections, upcomingSections, type Section } from '../../content/sections'

/** Desktop navigation: one dropdown per live section, plus "More" for sections that are still coming. */
export default function SectionMenus() {
  const { pathname } = useLocation()
  const current = findSection(pathname)

  return (
    <Stack direction="row" spacing={0.5} component="nav" aria-label="Sections">
      {liveSections.map((s) => (
        <SectionMenu key={s.id} section={s} active={current?.id === s.id} pathname={pathname} />
      ))}
      <MoreMenu active={!!current && current.pages.length === 0} />
    </Stack>
  )
}

function useMenu() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return {
    anchor,
    open: (e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget),
    close: () => setAnchor(null),
  }
}

function SectionMenu({ section, active, pathname }: { section: Section; active: boolean; pathname: string }) {
  const menu = useMenu()
  const id = `menu-${section.id}`

  return (
    <>
      <Button
        color={active ? 'primary' : 'inherit'}
        endIcon={<ExpandMoreIcon />}
        onClick={menu.open}
        aria-controls={menu.anchor ? id : undefined}
        aria-haspopup="true"
        aria-expanded={menu.anchor ? 'true' : undefined}
        sx={(t) => ({ ...(active && { backgroundColor: t.vars.palette.container.secondary, color: t.vars.palette.container.onSecondary }) })}
      >
        {section.title}
      </Button>
      <Menu id={id} anchorEl={menu.anchor} open={!!menu.anchor} onClose={menu.close}>
        <MenuItem component={Link} to={section.path} onClick={menu.close} selected={pathname === section.path}>
          <ListItemIcon>
            <section.icon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={`All ${section.title}`} />
        </MenuItem>
        {groupPages(section.pages).map(([group, pages]) => (
          <Fragment key={group}>
            <Divider />
            {group && <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '32px', typography: 'overline', color: 'primary.main' }}>{group}</ListSubheader>}
            {pages.map((p) => (
              <MenuItem key={p.path} component={Link} to={p.path} onClick={menu.close} selected={pathname === p.path}>
                <ListItemText inset primary={p.title} />
              </MenuItem>
            ))}
          </Fragment>
        ))}
      </Menu>
    </>
  )
}

function MoreMenu({ active }: { active: boolean }) {
  const menu = useMenu()

  return (
    <>
      <Button color={active ? 'primary' : 'inherit'} endIcon={<ExpandMoreIcon />} onClick={menu.open} aria-haspopup="true">
        More
      </Button>
      <Menu anchorEl={menu.anchor} open={!!menu.anchor} onClose={menu.close}>
        <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '32px' }}>Moving over soon</ListSubheader>
        {upcomingSections.map((s) => (
          <MenuItem key={s.id} component={Link} to={s.path} onClick={menu.close}>
            <ListItemIcon>
              <s.icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={s.title} />
            <Chip label="Soon" size="small" sx={{ ml: 2 }} />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

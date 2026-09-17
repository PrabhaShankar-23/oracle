import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import { Fragment, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { findSection, groupPages, sections } from '../../content/sections'

type Props = {
  /** Called after a link is followed (closes the drawer on small screens). */
  onNavigate?: () => void
}

/** Every vault section in vault order, with its pages nested. Used by the sidebar and the nav drawer. */
export default function SideNav({ onNavigate }: Props) {
  const { pathname } = useLocation()
  const current = findSection(pathname)?.id
  // Sections with pages start open so every page is one click away.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  // Opening a page inside a collapsed section re-expands it so the selection stays visible.
  useEffect(() => {
    if (!current) return
    // oxlint-disable-next-line react/set-state-in-effect
    setCollapsed((c) => {
      if (!c.has(current)) return c
      const next = new Set(c)
      next.delete(current)
      return next
    })
  }, [current])

  const toggle = (id: string) =>
    setCollapsed((c) => {
      const next = new Set(c)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <List component="nav" aria-label="Sections" sx={{ px: 1.5, py: 1 }}>
      {sections.map((s) => {
        const live = s.pages.length > 0
        const open = live && !collapsed.has(s.id)
        return (
          <Fragment key={s.id}>
            <ListItem
              disablePadding
              secondaryAction={
                live && (
                  <IconButton
                    edge="end"
                    onClick={() => toggle(s.id)}
                    aria-label={`${open ? 'Collapse' : 'Expand'} ${s.title}`}
                    aria-expanded={open}
                  >
                    {open ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )
              }
            >
              <ListItemButton
                component={Link}
                to={s.path}
                onClick={onNavigate}
                selected={pathname === s.path}
                sx={{ pr: live ? 6 : 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <s.icon color={current === s.id ? 'primary' : live ? 'inherit' : 'disabled'} />
                </ListItemIcon>
                <ListItemText
                  primary={s.title}
                  slotProps={{
                    primary: {
                      sx: { fontWeight: current === s.id ? 600 : 500, color: live ? 'text.primary' : 'text.secondary' },
                    },
                  }}
                />
                {!live && <Chip label="Soon" size="small" />}
              </ListItemButton>
            </ListItem>

            {live && (
              <Collapse in={open}>
                <List disablePadding dense sx={{ mb: 1 }}>
                  {groupPages(s.pages).map(([group, pages]) => (
                    <Fragment key={group}>
                      {group && (
                        <ListSubheader
                          disableSticky
                          sx={{ bgcolor: 'transparent', pl: 7, lineHeight: '28px', typography: 'overline', color: 'primary.main' }}
                        >
                          {group}
                        </ListSubheader>
                      )}
                      {pages.map((p) => (
                        <ListItemButton
                          key={p.path}
                          component={Link}
                          to={p.path}
                          onClick={onNavigate}
                          selected={pathname === p.path}
                          sx={{ pl: 7 }}
                        >
                          <ListItemText primary={p.title} />
                        </ListItemButton>
                      ))}
                    </Fragment>
                  ))}
                </List>
              </Collapse>
            )}
          </Fragment>
        )
      })}
    </List>
  )
}

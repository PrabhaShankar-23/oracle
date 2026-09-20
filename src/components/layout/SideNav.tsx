import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { Fragment, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { findSection, groupPages, sections } from '../../content/sections'

type Props = {
  /** Called after a link is followed (closes the drawer on small screens). */
  onNavigate?: () => void
}

const groupKey = (sectionId: string, group: string) => `${sectionId}::${group}`

/**
 * Every vault section in vault order, three levels deep: section → group → page.
 *
 * Only one section is open at a time and groups start closed, because System Design alone
 * holds 100+ pages — expanding everything turns the sidebar into one long scroll. The section
 * and group holding the current page open themselves so the selection is always visible.
 */
export default function SideNav({ onNavigate }: Props) {
  const { pathname } = useLocation()
  const current = findSection(pathname)?.id
  const activeGroup = sections
    .flatMap((s) => s.pages.map((p) => ({ s, p })))
    .find(({ p }) => p.path === pathname)
  const activeKey = activeGroup ? groupKey(activeGroup.s.id, activeGroup.p.group ?? '') : undefined

  const [openSection, setOpenSection] = useState<string | undefined>(current)
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(activeKey ? [activeKey] : []))

  // Follow the route: open the section and group holding the current page, and close the rest.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setOpenSection(current)
    if (activeKey) {
      // oxlint-disable-next-line react/set-state-in-effect
      setOpenGroups((g) => (g.has(activeKey) ? g : new Set([...g, activeKey])))
    }
  }, [current, activeKey])

  const toggleGroup = (key: string) =>
    setOpenGroups((g) => {
      const next = new Set(g)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <List component="nav" aria-label="Sections" sx={{ px: 1.5, py: 1 }}>
      {sections.map((s) => {
        const live = s.pages.length > 0
        const open = live && openSection === s.id
        const groups = groupPages(s.pages)
        // One unnamed group means there is nothing to nest — list the pages directly.
        const flat = groups.length === 1 && !groups[0][0]

        return (
          <Fragment key={s.id}>
            <ListItem
              disablePadding
              secondaryAction={
                live && (
                  <IconButton
                    edge="end"
                    onClick={() => setOpenSection((o) => (o === s.id ? undefined : s.id))}
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
                onClick={() => {
                  if (live) setOpenSection(s.id)
                  onNavigate?.()
                }}
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
              <Collapse in={open} unmountOnExit>
                <List disablePadding dense sx={{ mb: 1 }}>
                  {groups.map(([group, pages]) => {
                    const key = groupKey(s.id, group)
                    const groupOpen = flat || openGroups.has(key)
                    const holdsCurrent = pages.some((p) => p.path === pathname)

                    return (
                      <Fragment key={key}>
                        {!flat && (
                          <ListItemButton
                            onClick={() => toggleGroup(key)}
                            aria-expanded={groupOpen}
                            sx={{ pl: 4.5, minHeight: 44 }}
                          >
                            <ListItemText
                              primary={group}
                              slotProps={{
                                primary: {
                                  variant: 'body2',
                                  sx: {
                                    fontWeight: holdsCurrent ? 600 : 500,
                                    color: holdsCurrent ? 'primary.main' : 'text.primary',
                                  },
                                },
                              }}
                            />
                            <Chip
                              label={pages.length}
                              size="small"
                              sx={(t) => ({
                                mr: 0.5,
                                height: 20,
                                minHeight: 20,
                                bgcolor: t.vars.palette.surface.containerHigh,
                                color: t.vars.palette.text.secondary,
                                '& .MuiChip-label': { px: 0.75, fontSize: '0.6875rem' },
                              })}
                            />
                            <Box
                              component={groupOpen ? ExpandLess : ExpandMore}
                              fontSize="small"
                              sx={{ color: 'text.secondary' }}
                            />
                          </ListItemButton>
                        )}

                        <Collapse in={groupOpen} unmountOnExit>
                          <List disablePadding dense>
                            {pages.map((p) => (
                              <ListItemButton
                                key={p.path}
                                component={Link}
                                to={p.path}
                                onClick={onNavigate}
                                selected={pathname === p.path}
                                sx={{ pl: flat ? 4.5 : 6.5, minHeight: 40 }}
                              >
                                <ListItemText
                                  primary={p.title}
                                  // Decision titles are whole sentences; two lines keeps the list scannable.
                                  slotProps={{
                                    primary: {
                                      variant: 'body2',
                                      title: p.title,
                                      sx: {
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 2,
                                        overflow: 'hidden',
                                      },
                                    },
                                  }}
                                />
                              </ListItemButton>
                            ))}
                          </List>
                        </Collapse>
                      </Fragment>
                    )
                  })}
                </List>
              </Collapse>
            )}
          </Fragment>
        )
      })}
    </List>
  )
}

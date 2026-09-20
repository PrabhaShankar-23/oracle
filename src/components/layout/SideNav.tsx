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
import { findSection, navTree, sections, type NavPage } from '../../content/sections'

type Props = {
  /** Called after a link is followed (closes the drawer on small screens). */
  onNavigate?: () => void
}

/** A key per expandable branch: `section::group` and `section::group::subgroup`. */
const branchKey = (...parts: string[]) => parts.join('::')

/** Every branch that has to be open for `pathname` to be visible. */
function branchesFor(pathname: string) {
  for (const s of sections) {
    const page = s.pages.find((p) => p.path === pathname)
    if (!page) continue
    const group = branchKey(s.id, page.group ?? '')
    return page.subgroup ? [group, branchKey(group, page.subgroup)] : [group]
  }
  return []
}

function PageRow({ page, pathname, indent, onNavigate }: { page: NavPage; pathname: string; indent: number; onNavigate?: () => void }) {
  return (
    <ListItemButton
      component={Link}
      to={page.path}
      onClick={onNavigate}
      selected={pathname === page.path}
      sx={{ pl: indent, minHeight: 40 }}
    >
      <ListItemText
        primary={page.title}
        // Decision titles are whole sentences; two lines keeps the list scannable.
        slotProps={{
          primary: {
            variant: 'body2',
            title: page.title,
            sx: { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' },
          },
        }}
      />
    </ListItemButton>
  )
}

function BranchRow({
  label,
  count,
  open,
  active,
  indent,
  onClick,
}: {
  label: string
  count: number
  open: boolean
  active: boolean
  indent: number
  onClick: () => void
}) {
  return (
    <ListItemButton onClick={onClick} aria-expanded={open} sx={{ pl: indent, minHeight: 44 }}>
      <ListItemText
        primary={label}
        slotProps={{
          primary: {
            variant: 'body2',
            sx: { fontWeight: active ? 600 : 500, color: active ? 'primary.main' : 'text.primary' },
          },
        }}
      />
      <Chip
        label={count}
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
      <Box component={open ? ExpandLess : ExpandMore} fontSize="small" sx={{ color: 'text.secondary' }} />
    </ListItemButton>
  )
}

/**
 * Every vault section in vault order, nested: section → group → sub-group → page.
 *
 * Only one section is open at a time and branches start closed, because System Design alone
 * holds 100+ pages — expanding everything turns the sidebar into one long scroll. The branches
 * holding the current page open themselves so the selection stays visible.
 */
export default function SideNav({ onNavigate }: Props) {
  const { pathname } = useLocation()
  const current = findSection(pathname)?.id
  const active = branchesFor(pathname)
  const activeSignature = active.join('|')

  const [openSection, setOpenSection] = useState<string | undefined>(current)
  const [open, setOpen] = useState<Set<string>>(() => new Set(active))

  // Follow the route: open the branches holding the current page, and close other sections.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setOpenSection(current)
    // oxlint-disable-next-line react/set-state-in-effect
    setOpen((o) => (active.every((k) => o.has(k)) ? o : new Set([...o, ...active])))
    // `active` is derived from the pathname; activeSignature is its stable identity.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [current, activeSignature])

  const toggle = (key: string) =>
    setOpen((o) => {
      const next = new Set(o)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <List component="nav" aria-label="Sections" sx={{ px: 1.5, py: 1 }}>
      {sections.map((s) => {
        const live = s.pages.length > 0
        const sectionOpen = live && openSection === s.id
        const tree = navTree(s.pages)
        // A single unnamed group means there is nothing to nest — list the pages directly.
        const flat = tree.length === 1 && !tree[0].name

        return (
          <Fragment key={s.id}>
            <ListItem
              disablePadding
              secondaryAction={
                live && (
                  <IconButton
                    edge="end"
                    onClick={() => setOpenSection((o) => (o === s.id ? undefined : s.id))}
                    aria-label={`${sectionOpen ? 'Collapse' : 'Expand'} ${s.title}`}
                    aria-expanded={sectionOpen}
                  >
                    {sectionOpen ? <ExpandLess /> : <ExpandMore />}
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
              <Collapse in={sectionOpen} unmountOnExit>
                <List disablePadding dense sx={{ mb: 1 }}>
                  {tree.map((group) => {
                    const gKey = branchKey(s.id, group.name)
                    const gOpen = flat || open.has(gKey)

                    return (
                      <Fragment key={gKey}>
                        {!flat && (
                          <BranchRow
                            label={group.name || 'Pages'}
                            count={group.count}
                            open={gOpen}
                            active={active.includes(gKey)}
                            indent={4}
                            onClick={() => toggle(gKey)}
                          />
                        )}

                        <Collapse in={gOpen} unmountOnExit>
                          <List disablePadding dense>
                            {group.direct.map((p) => (
                              <PageRow key={p.path} page={p} pathname={pathname} indent={flat ? 4 : 6} onNavigate={onNavigate} />
                            ))}

                            {group.subgroups.map((sub) => {
                              const sKey = branchKey(gKey, sub.name)
                              const sOpen = open.has(sKey)
                              return (
                                <Fragment key={sKey}>
                                  <BranchRow
                                    label={sub.name}
                                    count={sub.pages.length}
                                    open={sOpen}
                                    active={active.includes(sKey)}
                                    indent={6}
                                    onClick={() => toggle(sKey)}
                                  />
                                  <Collapse in={sOpen} unmountOnExit>
                                    <List disablePadding dense>
                                      {sub.pages.map((p) => (
                                        <PageRow key={p.path} page={p} pathname={pathname} indent={8} onNavigate={onNavigate} />
                                      ))}
                                    </List>
                                  </Collapse>
                                </Fragment>
                              )
                            })}
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

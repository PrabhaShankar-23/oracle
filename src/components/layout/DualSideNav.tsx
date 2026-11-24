import ChevronRight from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { HEADER_HEIGHT } from '../../theme/theme'
import { findSection, navTree, sections, type NavPage } from '../../content/sections'
import { CountChip, PageRow } from './SideNav'

export const RAIL_WIDTH = 232
export const PANEL_WIDTH = 304

const slideIn = keyframes`from { opacity: 0; transform: translateX(-8px) } to { opacity: 1; transform: none }`

/** Keys for expanded rows: `g:<group>` and `s:<group>::<subgroup>`. */
function keysFor(pages: NavPage[], pathname: string): string[] {
  const p = pages.find((x) => x.path === pathname)
  if (!p) return []
  const g = p.group ?? ''
  return p.subgroup ? [`g:${g}`, `s:${g}::${p.subgroup}`] : [`g:${g}`]
}

function column(width: number) {
  return (t: import('@mui/material/styles').Theme) => ({
    width,
    flexShrink: 0,
    position: 'sticky' as const,
    top: HEADER_HEIGHT,
    alignSelf: 'flex-start',
    height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
    overflowY: 'auto' as const,
    overscrollBehavior: 'contain',
    borderRight: `1px solid ${t.vars.palette.surface.outlineVariant}`,
  })
}

/** A row that expands or collapses a nested list in place. */
function TreeRow({ label, count, open, active, depth, onClick }: {
  label: string; count: number; open: boolean; active: boolean; depth: number; onClick: () => void
}) {
  return (
    <ListItemButton onClick={onClick} aria-expanded={open} sx={{ minHeight: 40, pl: 1 + depth * 1.5 }}>
      <ExpandMore fontSize="small" sx={{ mr: 0.75, color: 'text.secondary', transition: 'transform 150ms', transform: open ? 'none' : 'rotate(-90deg)' }} />
      <ListItemText
        primary={label}
        slotProps={{ primary: { variant: 'body2', sx: { fontWeight: active ? 600 : 500, color: active ? 'primary.main' : 'text.primary' } } }}
      />
      <CountChip count={count} />
    </ListItemButton>
  )
}

/**
 * Desktop sidebar in two columns (user, 24 Nov 2026: "a double sidebar … I cannot see the previous links").
 * Column 1 always lists every section; clicking one opens column 2 beside it with that section's groups,
 * sub-groups and pages as an expandable tree, so the way back is always on screen. The drawer on small
 * screens keeps the one-column drill-down in SideNav.
 */
export default function DualSideNav() {
  const { pathname } = useLocation()
  const routeSection = findSection(pathname)
  const [openId, setOpenId] = useState<string | undefined>(routeSection?.id)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(keysFor(routeSection?.pages ?? [], pathname)))

  // Follow the route: open its section and expand the branch holding the page.
  useEffect(() => {
    const s = findSection(pathname)
    // oxlint-disable-next-line react/set-state-in-effect
    setOpenId(s && s.pages.length > 0 ? s.id : undefined)
    setExpanded((prev) => new Set([...prev, ...keysFor(s?.pages ?? [], pathname)]))
  }, [pathname])

  const open = sections.find((s) => s.id === openId && s.pages.length > 0)
  const tree = useMemo(() => (open ? navTree(open.pages) : []), [open])
  const flat = tree.length === 1 && !tree[0].name
  const here = open ? keysFor(open.pages, pathname) : []
  const toggle = (k: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })

  return (
    <Box sx={{ display: 'flex', flexShrink: 0 }}>
      <Box component="nav" aria-label="Sections" sx={(t) => ({ ...column(RAIL_WIDTH)(t), backgroundColor: t.vars.palette.surface.containerLowest })}>
        <List dense sx={{ px: 1, py: 1 }}>
          {sections.map((s) => {
            const live = s.pages.length > 0
            const current = routeSection?.id === s.id
            const isOpen = open?.id === s.id
            const body = (
              <>
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <s.icon fontSize="small" color={current || isOpen ? 'primary' : live ? 'inherit' : 'disabled'} />
                </ListItemIcon>
                <ListItemText
                  primary={s.title}
                  slotProps={{ primary: { variant: 'body2', sx: { fontWeight: current ? 600 : 500, color: live ? 'text.primary' : 'text.secondary' } } }}
                />
                {live ? (
                  <ChevronRight fontSize="small" sx={{ color: isOpen ? 'primary.main' : 'text.secondary' }} />
                ) : (
                  <Chip label="Soon" size="small" sx={{ height: 20, '& .MuiChip-label': { px: 0.75, fontSize: '0.6875rem' } }} />
                )}
              </>
            )
            return live ? (
              <ListItemButton key={s.id} selected={isOpen} onClick={() => setOpenId(isOpen ? undefined : s.id)} sx={{ minHeight: 40 }}>
                {body}
              </ListItemButton>
            ) : (
              <ListItemButton key={s.id} component={Link} to={s.path} selected={pathname === s.path} sx={{ minHeight: 40 }}>
                {body}
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {open && (
        <Box
          key={open.id}
          component="nav"
          aria-label={open.title}
          sx={(t) => ({ ...column(PANEL_WIDTH)(t), backgroundColor: t.vars.palette.surface.containerLow, animation: `${slideIn} 140ms ease-out` })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 1.5, pb: 0.5 }}>
            <Typography
              variant="subtitle2"
              component={Link}
              to={open.path}
              sx={{ flex: 1, fontWeight: 600, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              {open.title}
            </Typography>
            <IconButton size="small" aria-label="Close section panel" onClick={() => setOpenId(undefined)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <List dense sx={{ px: 1, pb: 2 }}>
            {flat
              ? tree[0].direct.map((p) => <PageRow key={p.path} page={p} pathname={pathname} />)
              : tree.map((g) => {
                  const gk = `g:${g.name}`
                  const gOpen = expanded.has(gk)
                  return (
                    <Box key={gk}>
                      <TreeRow label={g.name || 'Pages'} count={g.count} open={gOpen} active={here.includes(gk)} depth={0} onClick={() => toggle(gk)} />
                      <Collapse in={gOpen} timeout={150} unmountOnExit>
                        <List dense disablePadding sx={{ pl: 1.5 }}>
                          {g.direct.map((p) => <PageRow key={p.path} page={p} pathname={pathname} />)}
                          {g.subgroups.map((x) => {
                            const sk = `s:${g.name}::${x.name}`
                            const sOpen = expanded.has(sk)
                            return (
                              <Box key={sk}>
                                <TreeRow label={x.name} count={x.pages.length} open={sOpen} active={here.includes(sk)} depth={0} onClick={() => toggle(sk)} />
                                <Collapse in={sOpen} timeout={150} unmountOnExit>
                                  <List dense disablePadding sx={{ pl: 1.5 }}>
                                    {x.pages.map((p) => <PageRow key={p.path} page={p} pathname={pathname} />)}
                                  </List>
                                </Collapse>
                              </Box>
                            )
                          })}
                        </List>
                      </Collapse>
                    </Box>
                  )
                })}
          </List>
        </Box>
      )}
    </Box>
  )
}

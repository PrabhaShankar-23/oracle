import ArrowBack from '@mui/icons-material/ArrowBack'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { findSection, navTree, sections, type NavPage, type Section } from '../../content/sections'

type Props = {
  /** Called after a link is followed (closes the drawer on small screens). */
  onNavigate?: () => void
}

/**
 * Where the sidebar is drilled to: nothing (the section list), a section, a group inside it,
 * or a sub-group inside that group. Each level is its own short panel.
 */
type Layer = { section?: string; group?: string; subgroup?: string }

/** The layer that shows `pathname` as a row: the deepest branch holding the current page. */
function layerFor(pathname: string): Layer {
  for (const s of sections) {
    const page = s.pages.find((p) => p.path === pathname)
    if (page) return { section: s.id, group: page.group ?? '', subgroup: page.subgroup }
  }
  return { section: findSection(pathname)?.id }
}

const slideIn = keyframes`from { opacity: 0; transform: translateX(12px) } to { opacity: 1; transform: none }`
const slideBack = keyframes`from { opacity: 0; transform: translateX(-12px) } to { opacity: 1; transform: none }`

function CountChip({ count }: { count: number }) {
  return (
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
  )
}

function PageRow({ page, pathname, onNavigate }: { page: NavPage; pathname: string; onNavigate?: () => void }) {
  return (
    <ListItemButton component={Link} to={page.path} onClick={onNavigate} selected={pathname === page.path} sx={{ minHeight: 40 }}>
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

/** A row that opens the next layer down. */
function DrillRow({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <ListItemButton onClick={onClick} sx={{ minHeight: 44 }}>
      <ListItemText
        primary={label}
        slotProps={{
          primary: {
            variant: 'body2',
            sx: { fontWeight: active ? 600 : 500, color: active ? 'primary.main' : 'text.primary' },
          },
        }}
      />
      <CountChip count={count} />
      <ChevronRight fontSize="small" sx={{ color: 'text.secondary' }} />
    </ListItemButton>
  )
}

/** Top of a drilled-in panel: a back row naming the parent, then this layer's title. */
function LayerHeader({
  back,
  title,
  to,
  onBack,
  onNavigate,
}: {
  back: string
  title: string
  to?: string
  onBack: () => void
  onNavigate?: () => void
}) {
  const titleSx = { display: 'block', px: 2, pt: 1, pb: 1, fontWeight: 600, color: 'text.primary', textDecoration: 'none' }
  return (
    <Box sx={{ mb: 0.5 }}>
      <ListItemButton onClick={onBack} aria-label={`Back to ${back}`} sx={{ minHeight: 36, color: 'text.secondary' }}>
        <ArrowBack fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body2" noWrap>
          {back}
        </Typography>
      </ListItemButton>
      {to ? (
        <Typography variant="subtitle2" component={Link} to={to} onClick={onNavigate} sx={titleSx}>
          {title}
        </Typography>
      ) : (
        <Typography variant="subtitle2" sx={titleSx}>
          {title}
        </Typography>
      )}
    </Box>
  )
}

function SectionRow({
  section: s,
  current,
  selected,
  onOpen,
  onNavigate,
}: {
  section: Section
  current: boolean
  selected: boolean
  onOpen: () => void
  onNavigate?: () => void
}) {
  const live = s.pages.length > 0
  const body = (
    <>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <s.icon color={current ? 'primary' : live ? 'inherit' : 'disabled'} />
      </ListItemIcon>
      <ListItemText
        primary={s.title}
        slotProps={{
          primary: { sx: { fontWeight: current ? 600 : 500, color: live ? 'text.primary' : 'text.secondary' } },
        }}
      />
      {live ? (
        <>
          <CountChip count={s.pages.length} />
          <ChevronRight fontSize="small" sx={{ color: 'text.secondary' }} />
        </>
      ) : (
        <Chip label="Soon" size="small" />
      )}
    </>
  )
  // A live section drills in; one with no pages yet links to its placeholder page.
  return live ? (
    <ListItemButton onClick={onOpen} selected={selected}>
      {body}
    </ListItemButton>
  ) : (
    <ListItemButton component={Link} to={s.path} onClick={onNavigate} selected={selected}>
      {body}
    </ListItemButton>
  )
}

/**
 * Every vault section in vault order, one layer at a time: sections → groups → sub-groups → pages.
 *
 * System Design alone holds 300+ pages, so nesting them in one expanding list turns the sidebar
 * into a long scroll. Instead each click drills one layer down and a back row climbs one up, so
 * every panel is a short list. The sidebar follows the route and opens on the current page's layer.
 */
export default function SideNav({ onNavigate }: Props) {
  const { pathname } = useLocation()
  const [layer, setLayer] = useState<Layer>(() => layerFor(pathname))
  const [direction, setDirection] = useState<'in' | 'back'>('in')

  // Follow the route: show the layer that holds the current page.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setLayer(layerFor(pathname))
  }, [pathname])

  const go = (next: Layer, dir: 'in' | 'back') => {
    setDirection(dir)
    setLayer(next)
  }

  const current = findSection(pathname)?.id
  const here = layerFor(pathname)
  const section = sections.find((s) => s.id === layer.section && s.pages.length > 0)
  const tree = section ? navTree(section.pages) : []
  // A single unnamed group means there is nothing to nest — the section's panel lists the pages.
  const flat = tree.length === 1 && !tree[0].name
  const group = section && !flat && layer.group !== undefined ? tree.find((g) => g.name === layer.group) : undefined
  const sub = group && layer.subgroup ? group.subgroups.find((x) => x.name === layer.subgroup) : undefined

  const panelKey = [section?.id, group?.name, sub?.name].join('::')
  const panelSx = { px: 1.5, py: 1, animation: `${direction === 'in' ? slideIn : slideBack} 160ms ease-out` }

  // Layer 4: one sub-group's pages.
  if (section && group && sub) {
    return (
      <List key={panelKey} component="nav" aria-label={sub.name} dense sx={panelSx}>
        <LayerHeader back={group.name || section.title} title={sub.name} onBack={() => go({ section: section.id, group: group.name }, 'back')} />
        {sub.pages.map((p) => (
          <PageRow key={p.path} page={p} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </List>
    )
  }

  // Layer 3: one group — its own pages, then a row per sub-group.
  if (section && group) {
    return (
      <List key={panelKey} component="nav" aria-label={group.name || section.title} dense sx={panelSx}>
        <LayerHeader back={section.title} title={group.name || 'Pages'} onBack={() => go({ section: section.id }, 'back')} />
        {group.direct.map((p) => (
          <PageRow key={p.path} page={p} pathname={pathname} onNavigate={onNavigate} />
        ))}
        {group.subgroups.map((x) => (
          <DrillRow
            key={x.name}
            label={x.name}
            count={x.pages.length}
            active={here.section === section.id && here.group === group.name && here.subgroup === x.name}
            onClick={() => go({ section: section.id, group: group.name, subgroup: x.name }, 'in')}
          />
        ))}
      </List>
    )
  }

  // Layer 2: one section — a row per group, or its pages when it has no groups.
  if (section) {
    return (
      <List key={panelKey} component="nav" aria-label={section.title} dense sx={panelSx}>
        <LayerHeader back="All sections" title={section.title} to={section.path} onBack={() => go({}, 'back')} onNavigate={onNavigate} />
        {flat
          ? tree[0].direct.map((p) => <PageRow key={p.path} page={p} pathname={pathname} onNavigate={onNavigate} />)
          : tree.map((g) => (
              <DrillRow
                key={g.name}
                label={g.name || 'Pages'}
                count={g.count}
                active={here.section === section.id && here.group === g.name}
                onClick={() => go({ section: section.id, group: g.name }, 'in')}
              />
            ))}
      </List>
    )
  }

  // Layer 1: every section.
  return (
    <List key={panelKey} component="nav" aria-label="Sections" sx={panelSx}>
      {sections.map((s) => (
        <SectionRow
          key={s.id}
          section={s}
          current={current === s.id}
          selected={pathname === s.path}
          onOpen={() => go({ section: s.id }, 'in')}
          onNavigate={onNavigate}
        />
      ))}
    </List>
  )
}

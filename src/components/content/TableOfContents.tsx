import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { Heading } from '../../content/types'
import { HEADER_HEIGHT } from '../../theme/theme'

type Props = {
  headings: Heading[]
  onNavigate?: () => void
}

const clean = (s: string) => s.replace(/^[^\p{Letter}\p{Number}]+/u, '')

/** Section links with scroll-spy. Used in the desktop sidebar and the mobile drawer. */
export default function TableOfContents({ headings, onNavigate }: Props) {
  const navigate = useNavigate()
  const active = useActiveHeading(headings)

  return (
    <nav aria-label="On this page">
      <Typography variant="overline" color="text.secondary" sx={{ px: 2, display: 'block' }}>
        On this page
      </Typography>
      <List dense disablePadding>
        {headings.map((h) => (
          <ListItemButton
            key={h.id}
            selected={active === h.id}
            onClick={() => {
              navigate({ hash: h.id }, { replace: true })
              onNavigate?.()
            }}
            sx={{ minHeight: 36, py: 0.25, pl: h.level === 3 ? 4 : 2, borderRadius: 5 }}
          >
            <ListItemText
              primary={clean(h.text)}
              slotProps={{ primary: { variant: 'body2', sx: { fontSize: h.level === 3 ? '0.8125rem' : undefined } } }}
            />
          </ListItemButton>
        ))}
      </List>
    </nav>
  )
}

function useActiveHeading(headings: Heading[]) {
  const [active, setActive] = useState<string>()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: `-${HEADER_HEIGHT + 8}px 0px -70% 0px` },
    )
    // Headings are injected by HtmlContent; wait a frame for them to exist.
    const raf = requestAnimationFrame(() => {
      headings.forEach((h) => {
        const el = document.getElementById(h.id)
        if (el) observer.observe(el)
      })
    })
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [headings])

  return active
}

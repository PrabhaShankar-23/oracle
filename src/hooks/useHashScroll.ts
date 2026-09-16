import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { HEADER_HEIGHT } from '../theme/theme'

const OFFSET = HEADER_HEIGHT + 16

/**
 * Scrolls to `#hash` after navigation, or to the top on a plain path change.
 * Content renders late (lazy pages) and shifts (diagrams, accordions), so it waits
 * for the target and re-aligns a few times while the layout settles.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }

    const id = decodeURIComponent(hash.slice(1))
    const timers: number[] = []
    let userScrolled = false
    const stop = () => (userScrolled = true)

    const align = () => {
      const el = document.getElementById(id)
      if (!el || userScrolled) return
      const top = el.getBoundingClientRect().top
      if (Math.abs(top - OFFSET) > 4) window.scrollTo({ top: window.scrollY + top - OFFSET, behavior: 'instant' })
    }

    let tries = 0
    const wait = window.setInterval(() => {
      if (!document.getElementById(id) && ++tries < 30) return
      window.clearInterval(wait)
      align()
      // Late layout shifts: fonts, Mermaid diagrams, accordion transitions.
      for (const ms of [250, 700, 1500]) timers.push(window.setTimeout(align, ms))
      window.addEventListener('wheel', stop, { once: true, passive: true })
      window.addEventListener('touchmove', stop, { once: true, passive: true })
    }, 50)

    return () => {
      window.clearInterval(wait)
      timers.forEach(window.clearTimeout)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)
    }
  }, [pathname, hash])
}

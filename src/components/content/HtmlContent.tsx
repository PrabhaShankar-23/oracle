import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import { memo, useEffect, useRef, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { highlightWithin } from '../../lib/highlight'
import { renderMermaidWithin } from '../../lib/mermaid'
import { useResolvedMode } from '../../hooks/useResolvedMode'
import { articleStyles } from './articleStyles'

type Props = {
  html: string
  /** Blur answers in `.recall-tbl` tables until tapped. */
  hideRecallAnswers?: boolean
  sx?: SxProps<Theme>
}

/**
 * Renders trusted HTML generated from the notes vault (see scripts/ingest-vault.mjs)
 * with M3 styling, diagrams, syntax highlighting and copy buttons.
 */
function HtmlContent({ html, hideRecallAnswers = false, sx }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const mode = useResolvedMode()

  // One-time DOM enhancements for this HTML.
  useEffect(() => {
    const root = ref.current
    if (!root) return

    root.querySelectorAll('table').forEach((table) => {
      if (table.parentElement?.classList.contains('table-scroll')) return
      const wrap = document.createElement('div')
      wrap.className = 'table-scroll'
      table.replaceWith(wrap)
      wrap.appendChild(table)
    })

    root.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'copy-btn'
      btn.textContent = 'Copy'
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.innerText ?? pre.innerText
        void navigator.clipboard?.writeText(code.replace(/Copy$/, ''))
        btn.textContent = 'Copied'
        window.setTimeout(() => (btn.textContent = 'Copy'), 1200)
      })
      pre.appendChild(btn)
    })

    highlightWithin(root)
  }, [html])

  // Diagrams re-render when the colour scheme changes.
  useEffect(() => {
    if (ref.current) void renderMermaidWithin(ref.current, mode)
  }, [html, mode])

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    const cell = target.closest('.recall-tbl td:last-child')
    if (cell) cell.classList.toggle('revealed')

    const link = target.closest('a')
    const href = link?.getAttribute('href')
    if (!link || !href || link.target === '_blank' || e.metaKey || e.ctrlKey) return
    if (href.startsWith('/') || href.startsWith('#')) {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <Box
      ref={ref}
      className={hideRecallAnswers ? 'hide-recall' : undefined}
      onClick={onClick}
      sx={[articleStyles, ...(Array.isArray(sx) ? sx : [sx])]}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default memo(HtmlContent)

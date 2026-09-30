import { mermaidThemeVariables, type SchemeName } from '../theme/theme'

let counter = 0

/** Below this scale the labels drop under ~12px and stop being readable. */
const MIN_SCALE = 0.8
/** Width used when the block is inside a closed accordion and has no layout yet. */
const FALLBACK_WIDTH = 720

const LEFT_TO_RIGHT = /^(\s*(?:flowchart|graph))\s+(LR|RL)\b/m

/**
 * Renders every `.mermaid` block inside `root`. Mermaid is ~1 MB, so it is only
 * downloaded the first time a page with a diagram is opened.
 *
 * Wide diagrams are the problem: a long left-to-right chain is scaled down to the column
 * width and its text becomes unreadable. So a left-to-right flowchart that would shrink
 * below MIN_SCALE is redrawn top-to-bottom, and anything still too wide keeps a readable
 * size and scrolls sideways instead of shrinking.
 */
export async function renderMermaidWithin(root: HTMLElement, scheme: SchemeName) {
  const blocks = [...root.querySelectorAll<HTMLElement>('.mermaid')]
  if (blocks.length === 0) return

  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: mermaidThemeVariables(scheme),
    securityLevel: 'strict',
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif",
    flowchart: { curve: 'basis', htmlLabels: true, useMaxWidth: true },
    sequence: { mirrorActors: false, useMaxWidth: true },
  })

  for (const el of blocks) {
    el.dataset.source ??= el.textContent ?? ''
    try {
      const available = el.clientWidth || root.clientWidth || FALLBACK_WIDTH
      let source = el.dataset.source
      let { svg } = await mermaid.render(`mmd-${++counter}`, source)
      if (naturalWidth(svg) * MIN_SCALE > available && LEFT_TO_RIGHT.test(source)) {
        source = source.replace(LEFT_TO_RIGHT, '$1 TB')
        svg = (await mermaid.render(`mmd-${++counter}`, source)).svg
      }
      if (!el.isConnected) continue
      el.innerHTML = svg
      const width = naturalWidth(svg)
      const svgEl = el.querySelector('svg')
      if (svgEl && width * MIN_SCALE > available) {
        // still too wide: keep text readable and let the block scroll
        svgEl.style.maxWidth = 'none'
        svgEl.style.flexShrink = '0'
        svgEl.style.width = `${Math.round(width * MIN_SCALE)}px`
        el.classList.add('mermaid-wide')
      } else {
        el.classList.remove('mermaid-wide')
      }
    } catch (err) {
      console.warn('Mermaid render failed', err)
      el.classList.add('mermaid-error')
    }
  }
}

/** The diagram's drawn width, from the SVG's viewBox. */
function naturalWidth(svg: string): number {
  const m = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+) [\d.]+"/)
  return m ? Number(m[1]) : 0
}

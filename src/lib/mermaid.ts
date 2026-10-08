import { DIAGRAM_TEXT, diagramTones, mermaidThemeVariables, type SchemeName } from '../theme/theme'

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
    // Mermaid 12's default "neo" look ignores `flowchart.padding` and draws roomy nodes; the classic look
    // honours it, so nodes hug their text and diagrams stay within a screen.
    look: 'classic',
    themeCSS: '.nodeLabel p { margin: 0 } .node foreignObject div { line-height: 1.3 !important }',
    // Vault labels are broken by hand with <br/> at ~24 characters; the default 200px wrap adds a second,
    // unintended break at this font size and makes every node a line or two taller.
    flowchart: { curve: 'basis', htmlLabels: true, useMaxWidth: true, wrappingWidth: 280, padding: 8 },
    sequence: { mirrorActors: false, useMaxWidth: true },
  })

  for (const el of blocks) {
    el.dataset.source ??= el.textContent ?? ''
    try {
      const available = el.clientWidth || root.clientWidth || FALLBACK_WIDTH
      let source = withThemeColours(el.dataset.source, scheme)
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

/**
 * Vault diagrams carry a fixed pastel palette in their `classDef` lines. Swap each known colour for the
 * active scheme's tint so nodes follow the theme; unknown colours are left alone. Also drops label emoji.
 */
function withThemeColours(source: string, scheme: SchemeName): string {
  let out = source
  for (const t of diagramTones(scheme)) {
    out = out.replace(new RegExp(`fill:${t.fill}`, 'gi'), `fill:${t.toFill}`).replace(new RegExp(`stroke:${t.stroke}`, 'gi'), `stroke:${t.toStroke}`)
  }
  return (
    out
      .replace(/color:#000(?:000)?\b/gi, `color:${DIAGRAM_TEXT}`)
      // Vault labels lead with an emoji; the site uses Material icons for those everywhere else, and an
      // icon can't go inside a Mermaid label, so the emoji is dropped and the colour carries the meaning.
      // Arrows (U+2190–U+25FF, ⬆ ⬇) are kept: they are part of what a label says.
      .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]\uFE0F?[ \t]?/gu, '')
  )
}

/** The diagram's drawn width, from the SVG's viewBox. */
function naturalWidth(svg: string): number {
  const m = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+) [\d.]+"/)
  return m ? Number(m[1]) : 0
}

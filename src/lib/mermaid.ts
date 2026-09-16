let counter = 0

/**
 * Renders every `.mermaid` block inside `root`. Mermaid is ~1 MB, so it is only
 * downloaded the first time a page with a diagram is opened.
 */
export async function renderMermaidWithin(root: HTMLElement, mode: 'light' | 'dark') {
  const blocks = [...root.querySelectorAll<HTMLElement>('.mermaid')]
  if (blocks.length === 0) return

  const { default: mermaid } = await import('mermaid')
  mermaid.initialize({
    startOnLoad: false,
    theme: mode === 'dark' ? 'dark' : 'default',
    securityLevel: 'strict',
    fontFamily: "'Roboto Flex Variable', system-ui, sans-serif",
    flowchart: { curve: 'basis', htmlLabels: true, useMaxWidth: true },
    sequence: { mirrorActors: false, useMaxWidth: true },
  })

  for (const el of blocks) {
    el.dataset.source ??= el.textContent ?? ''
    try {
      const { svg } = await mermaid.render(`mmd-${++counter}`, el.dataset.source)
      if (el.isConnected) el.innerHTML = svg
    } catch (err) {
      console.warn('Mermaid render failed', err)
      el.classList.add('mermaid-error')
    }
  }
}

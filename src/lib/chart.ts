import type { ChartAnnotation, ChartSeries, ChartSpec, ChartTone } from '../content/types'
import { chartColors, type SchemeName } from '../theme/theme'

type PlotModule = typeof import('@observablehq/plot')
type Colors = ReturnType<typeof chartColors>

/**
 * Charts are laid out at this logical width and scaled by CSS (`svg.chart` in articleStyles).
 * A fixed size means a chart inside a closed <details> renders correctly before anyone opens it.
 */
const WIDTH = 560
const DEFAULT_TONES: ChartTone[] = ['primary', 'warn', 'accent', 'ok', 'muted']

/**
 * Renders every `.vault-chart` inside `root` from its `data-spec` (a `ChartSpec` validated by the
 * ingest). Observable Plot is only downloaded the first time a page with a chart is opened.
 */
export async function renderChartsWithin(root: HTMLElement, scheme: SchemeName) {
  const blocks = [...root.querySelectorAll<HTMLElement>('.vault-chart')]
  if (blocks.length === 0) return

  const Plot = await import('@observablehq/plot')
  const colors = chartColors(scheme)
  for (const el of blocks) {
    try {
      const spec = JSON.parse(el.dataset.spec ?? '') as ChartSpec
      const svg = buildChart(Plot, spec, colors)
      svg.classList.add('chart')
      if (el.isConnected) el.replaceChildren(svg)
    } catch (err) {
      console.warn('Chart render failed', err)
      el.textContent = 'Chart failed to render.'
    }
  }
}

/** Linear interpolation of a series at x, clamped to its ends. */
function valueAt(points: [number, number][], x: number): number {
  if (x <= points[0][0]) return points[0][1]
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1)
  }
  return points[points.length - 1][1]
}

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }

/** Log axes label decades as powers of ten (10⁻⁴), not SI prefixes (100µ) that read as units. */
const powerOfTen = (d: number) => {
  const e = Math.log10(d)
  if (Math.abs(e - Math.round(e)) > 1e-9) return ''
  const n = Math.round(e)
  if (n === 0) return '1'
  if (n === 1) return '10'
  return `10${[...String(n)].map((ch) => SUPERSCRIPT[ch]).join('')}`
}

function buildChart(Plot: PlotModule, spec: ChartSpec, c: Colors): SVGSVGElement | HTMLElement {
  const tone = (t: ChartTone | undefined, fallback: ChartTone) => c.tones[t ?? fallback]
  const unit = (u?: string) => (u ? (d: number) => `${d}${u}` : undefined)
  const ticks = (axis?: ChartSpec['x']) => (axis?.scale === 'log' ? powerOfTen : unit(axis?.unit))
  // hline labels sit just outside the frame on the right, clear of bars and line ends.
  const hasHline = (spec.annotations ?? []).some((a) => a.kind === 'hline')
  const height = spec.height ?? 300
  const common = {
    width: WIDTH,
    height,
    marginTop: 28,
    marginLeft: 56,
    marginBottom: 46,
    style: { fontSize: '13px', fontFamily: 'inherit', color: c.text, background: 'transparent', overflow: 'visible' },
    ariaLabel: spec.title,
    ariaDescription: spec.caption,
  }

  if (spec.type === 'bar') {
    const bars = spec.bars ?? []
    const base = spec.y?.domain?.[0] ?? 0
    return Plot.plot({
      ...common,
      marginRight: hasHline ? 120 : 16,
      x: { type: 'band', label: spec.x?.label ?? null, padding: 0.35 },
      y: { label: spec.y?.label ?? null, domain: spec.y?.domain, grid: true, tickFormat: unit(spec.y?.unit), labelArrow: 'none' },
      marks: [
        // Bars start at the domain floor, so a y domain that skips 0 can show small differences.
        Plot.barY(bars, { x: 'label', y1: base, y2: 'value', fill: (d) => tone(d.tone, 'primary'), rx: 4 }),
        Plot.text(bars, {
          x: 'label',
          y: 'value',
          text: (d) => `${d.value}${spec.y?.unit ?? ''}`,
          dy: -10,
          fill: c.text,
          fontWeight: 700,
        }),
        Plot.ruleY([base], { stroke: c.axis }),
        // Only reference lines make sense on bars; the ingest rejects series-based annotations here.
        ...(spec.annotations ?? []).flatMap((a) => annotationMarks(Plot, a, new Map(), c, tone, 'foreground')),
      ],
    })
  }

  const series = (spec.series ?? []).map((s, i) => ({ ...s, color: tone(s.tone, DEFAULT_TONES[i % DEFAULT_TONES.length]) }))
  const byName = new Map(series.map((s) => [s.name, s]))
  const annotations = spec.annotations ?? []
  const needsRightRoom = annotations.some((a) => a.kind === 'gap') || series.some((s) => s.labelAt === undefined)

  const background = annotations.flatMap((a) => annotationMarks(Plot, a, byName, c, tone, 'background'))
  const foreground = annotations.flatMap((a) => annotationMarks(Plot, a, byName, c, tone, 'foreground'))

  const lines = series.map((s) =>
    Plot.line(s.points, {
      x: (d) => d[0],
      y: (d) => d[1],
      stroke: s.color,
      strokeWidth: 2.75,
      curve: 'monotone-x',
      strokeDasharray: s.dashed ? '6 5' : undefined,
    }),
  )

  // Label each line directly: beside its end, or — when a gap bracket owns that spot, or the
  // author picked a point with `labelAt` — above it (below when it's the lower line there).
  const gapXs = new Set(annotations.flatMap((a) => (a.kind === 'gap' ? [a.x] : [])))
  const labels = series.map((s) => {
    const last = s.points[s.points.length - 1]
    const x = s.labelAt ?? last[0]
    const y = valueAt(s.points, x)
    const lowest = series.every((o) => o === s || valueAt(o.points, x) >= y)
    const beside = s.labelAt === undefined && !gapXs.has(x)
    const stacked = { dx: 0, dy: lowest && series.length > 1 ? 18 : -12 }
    return Plot.text([{ x, y }], {
      x: 'x',
      y: 'y',
      text: () => s.name,
      fill: s.color,
      fontWeight: 700,
      textAnchor: beside ? 'start' : s.labelAt === undefined ? 'end' : 'middle',
      ...(beside ? { dx: 8, dy: 0 } : stacked),
    })
  })

  return Plot.plot({
    ...common,
    marginRight: hasHline ? 120 : needsRightRoom ? 96 : 20,
    x: { type: spec.x?.scale ?? 'linear', label: spec.x?.label ?? null, domain: spec.x?.domain, tickFormat: ticks(spec.x), labelAnchor: 'center', labelArrow: 'none' },
    y: { type: spec.y?.scale ?? 'linear', label: spec.y?.label ?? null, domain: spec.y?.domain, tickFormat: ticks(spec.y), grid: true, labelArrow: 'none' },
    marks: [...background, ...lines, ...foreground, ...labels],
  })
}

type SeriesWithColor = ChartSeries & { color: string }

function annotationMarks(
  Plot: PlotModule,
  a: ChartAnnotation,
  byName: Map<string, SeriesWithColor>,
  c: Colors,
  tone: (t: ChartTone | undefined, fallback: ChartTone) => string,
  layer: 'background' | 'foreground',
) {
  const label = (data: object[], options: Record<string, unknown>) =>
    a.label ? [Plot.text(data, { text: () => a.label, fill: c.text, fontWeight: 600, lineHeight: 1.25, ...options })] : []

  switch (a.kind) {
    case 'band': {
      if (layer !== 'background') return []
      const [top, bottom] = a.between.map((n) => byName.get(n)!.points)
      const from = a.from ?? Math.max(top[0][0], bottom[0][0])
      const to = a.to ?? Math.min(top[top.length - 1][0], bottom[bottom.length - 1][0])
      const xs = [...new Set([from, to, ...top.map((p) => p[0]), ...bottom.map((p) => p[0])])]
        .filter((x) => x >= from && x <= to)
        .sort((p, q) => p - q)
      const data = xs.map((x) => ({ x, y1: valueAt(top, x), y2: valueAt(bottom, x) }))
      const mid = data[Math.floor(data.length / 2)]
      return [
        Plot.areaY(data, { x: 'x', y1: 'y1', y2: 'y2', fill: tone(a.tone, 'bad'), fillOpacity: 0.16, curve: 'monotone-x' }),
        ...label([{ x: mid.x, y: (mid.y1 + mid.y2) / 2 }], { x: 'x', y: 'y' }),
      ]
    }
    case 'region':
      if (layer !== 'background') return []
      return [
        Plot.rectX([{ x1: a.from, x2: a.to }], { x1: 'x1', x2: 'x2', fill: tone(a.tone, 'muted'), fillOpacity: 0.12 }),
        ...label([{ x: (a.from + a.to) / 2 }], { x: 'x', frameAnchor: 'top', dy: 14 }),
      ]
    case 'vline':
      if (layer !== 'foreground') return []
      return [
        Plot.ruleX([a.x], { stroke: a.tone ? tone(a.tone, 'muted') : c.muted, strokeDasharray: '4 4', strokeWidth: 1.5 }),
        ...label([{ x: a.x }], { x: 'x', frameAnchor: 'bottom', textAnchor: 'end', dx: -8, dy: -10 }),
      ]
    case 'hline':
      if (layer !== 'foreground') return []
      return [
        Plot.ruleY([a.y], { stroke: a.tone ? tone(a.tone, 'muted') : c.muted, strokeDasharray: '4 4', strokeWidth: 1.5 }),
        ...label([{ y: a.y }], { y: 'y', frameAnchor: 'right', textAnchor: 'start', dx: 8 }),
      ]
    case 'gap': {
      if (layer !== 'foreground') return []
      const [p, q] = a.between.map((n) => valueAt(byName.get(n)!.points, a.x))
      const ends = [
        { x: a.x, y: p },
        { x: a.x, y: q },
      ]
      return [
        Plot.ruleX([{ x: a.x, y1: p, y2: q }], { x: 'x', y1: 'y1', y2: 'y2', dx: 14, stroke: c.text, strokeWidth: 1.5 }),
        Plot.dot(ends, { x: 'x', y: 'y', dx: 14, r: 2.5, fill: c.text }),
        ...label([{ x: a.x, y: (p + q) / 2 }], { x: 'x', y: 'y', dx: 22, textAnchor: 'start', fontWeight: 700 }),
      ]
    }
    case 'point':
      if (layer !== 'foreground') return []
      return [
        Plot.dot([{ x: a.x, y: a.y }], { x: 'x', y: 'y', r: 5, fill: tone(a.tone, 'primary'), stroke: c.text, strokeWidth: 0 }),
        ...label([{ x: a.x, y: a.y }], { x: 'x', y: 'y', dy: -14 }),
      ]
  }
}

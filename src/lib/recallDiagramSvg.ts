/**
 * SVG markup for cold recall diagrams, shared by the site (RecallDiagram) and the vault page
 * (scripts/render-vault-walkthroughs.mjs). Pure string output with `rd-` classes, so each host
 * styles it with its own colours. Keep this file free of runtime imports: Node loads it directly.
 */
import type { BarsRow, CellsRow, DiagramPointer } from '../content/types'

const CELL = 34
const GAP = 4
const POINTER_H = 24
const SPAN_H = 26
const BAR_W = 26
const BARS_MAX_H = 96
const LEVEL_GUTTER = 84

const esc = (s: string | number) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function svg(width: number, height: number, body: string) {
  return (
    `<svg class="rd-svg" viewBox="-2 0 ${width + 4} ${height}" width="100%" ` +
    `style="max-width:${width + 4}px;display:block;overflow:visible" aria-hidden="true">${body}</svg>`
  )
}

function pointers(list: DiagramPointer[] = [], center: (i: number) => number, baseline: number, up: boolean) {
  // Pointers on the same index share one arrow: "l,r".
  const byIndex = new Map<number, DiagramPointer[]>()
  for (const p of list) byIndex.set(p.at, [...(byIndex.get(p.at) ?? []), p])

  return [...byIndex]
    .map(([at, group]) => {
      const cx = center(at)
      const back = up ? baseline + 6 : baseline - 6
      const textY = up ? baseline + 18 : baseline - 10
      return (
        `<g class="rd-pointer rd-tone-${group[0].tone ?? 'primary'}">` +
        `<path d="M${cx - 4} ${back} L${cx + 4} ${back} L${cx} ${baseline} Z"/>` +
        `<text x="${cx}" y="${textY}" text-anchor="middle">${esc(group.map((p) => p.label).join(','))}</text></g>`
      )
    })
    .join('')
}

export function cellsSvg(row: CellsRow) {
  const n = row.cells.length
  const width = n * CELL + (n - 1) * GAP
  const y0 = row.pointers?.length ? POINTER_H : 4
  const height = y0 + CELL + (row.span ? SPAN_H : 4)
  const x = (i: number) => i * (CELL + GAP)

  let body = pointers(row.pointers, (i) => x(i) + CELL / 2, y0 - 4, false)
  row.cells.forEach((value, i) => {
    body +=
      `<g class="rd-cell${row.states?.[i] ? ` rd-${row.states[i]}` : ''}">` +
      `<rect x="${x(i)}" y="${y0}" width="${CELL}" height="${CELL}" rx="6"/>` +
      `<text x="${x(i) + CELL / 2}" y="${y0 + CELL / 2}" dominant-baseline="central" text-anchor="middle">${esc(value)}</text></g>`
  })
  if (row.span) {
    const { from, to, label } = row.span
    body +=
      `<g class="rd-span"><path fill="none" d="M${x(from) + 2} ${y0 + CELL + 4} v5 H${x(to) + CELL - 2} v-5"/>` +
      `<text x="${(x(from) + x(to) + CELL) / 2}" y="${y0 + CELL + 20}" text-anchor="middle">${esc(label)}</text></g>`
  }
  return svg(width, height, body)
}

export function barsSvg(row: BarsRow) {
  const n = row.heights.length
  const top = Math.max(
    ...row.heights.map((h, i) => h + (row.water?.[i] ?? 0)),
    row.box?.height ?? 0,
    ...(row.levels ?? []).map((l) => l.value),
    1,
  )
  const unit = Math.min(16, BARS_MAX_H / top)
  const chartWidth = n * BAR_W + (n - 1) * GAP
  // Level labels sit in a right-hand gutter so they never collide with bar values.
  const width = chartWidth + (row.levels?.length ? LEVEL_GUTTER : 0)
  const base = 16 + top * unit
  const height = base + 4 + POINTER_H
  const x = (i: number) => i * (BAR_W + GAP)
  const dim = new Set(row.dim)

  let body = ''
  if (row.box) {
    const { from, to, height: h } = row.box
    body += `<rect class="rd-box" x="${x(from)}" y="${base - h * unit}" width="${x(to) + BAR_W - x(from)}" height="${h * unit}"/>`
  }
  row.heights.forEach((h, i) => {
    const w = row.water?.[i] ?? 0
    body +=
      `<g${dim.has(i) ? ' opacity="0.35"' : ''}>` +
      (w > 0 ? `<rect class="rd-water" x="${x(i)}" y="${base - (h + w) * unit}" width="${BAR_W}" height="${w * unit}"/>` : '') +
      `<rect class="rd-bar" x="${x(i)}" y="${base - h * unit}" width="${BAR_W}" height="${h * unit}" rx="2"/>` +
      `<text class="rd-bar-value" x="${x(i) + BAR_W / 2}" y="${base - h * unit - 3}" text-anchor="middle">${h}</text></g>`
  })
  for (const l of row.levels ?? []) {
    const y = base - l.value * unit
    body +=
      `<g class="rd-level rd-tone-${l.tone ?? 'secondary'}">` +
      `<line x1="${x(l.from)}" x2="${x(l.to) + BAR_W}" y1="${y}" y2="${y}"/>` +
      `<line class="rd-leader" x1="${x(l.to) + BAR_W}" x2="${chartWidth + 6}" y1="${y}" y2="${y}"/>` +
      `<text x="${chartWidth + 10}" y="${y}" dominant-baseline="central">${esc(l.label)}</text></g>`
  }
  body += `<line class="rd-baseline" x1="0" x2="${chartWidth}" y1="${base}" y2="${base}"/>`
  body += pointers(row.pointers, (i) => x(i) + BAR_W / 2, base + 6, true)
  return svg(width, height, body)
}

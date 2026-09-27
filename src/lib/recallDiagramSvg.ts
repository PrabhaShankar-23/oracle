/**
 * SVG markup for cold recall diagrams, shared by the site (RecallDiagram) and the vault page
 * (scripts/render-vault-walkthroughs.mjs). Pure string output with `rd-` classes, so each host
 * styles it with its own colours. Keep this file free of runtime imports: Node loads it directly.
 */
import type { BarsRow, CellsRow, DiagramPointer, IntervalsRow } from '../content/types'

const CELL = 34
const GAP = 4
const POINTER_H = 24
const SPAN_H = 26
const BAR_W = 26
const BARS_MAX_H = 96
const LEVEL_GUTTER = 84
const LANE_H = 20
const LANE_GAP = 6
const MARK_H = 18
const AXIS_H = 20
const IVAL_MAX_W = 250

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

export function intervalsSvg(row: IntervalsRow) {
  const marks = row.marks ?? []
  const points = [...row.bars.flatMap((b) => [b.from, b.to]), ...marks.map((m) => m.at)]
  const lo = Math.min(...points)
  const hi = Math.max(...points)
  const unit = Math.min(24, IVAL_MAX_W / Math.max(1, hi - lo))
  const width = (hi - lo) * unit
  const lanes = Math.max(...row.bars.map((b, i) => b.lane ?? i)) + 1
  const y0 = marks.length ? MARK_H : 4
  const base = y0 + lanes * (LANE_H + LANE_GAP)
  const height = base + AXIS_H
  const x = (v: number) => (v - lo) * unit

  let body = ''
  row.bars.forEach((b, i) => {
    const y = y0 + (b.lane ?? i) * (LANE_H + LANE_GAP)
    // A point interval [v, v] still needs a visible sliver.
    const x1 = b.from === b.to ? x(b.from) - 3 : x(b.from)
    const w = b.from === b.to ? 6 : x(b.to) - x(b.from)
    const label = b.label ?? `${b.from}–${b.to}`
    const labelW = label.length * 6.6 + 6
    const inside = w >= labelW
    // An outside label that would run into the next bar on the same lane is dropped; the axis still shows the values.
    const blocked =
      !inside &&
      row.bars.some((o, j) => j !== i && (o.lane ?? j) === (b.lane ?? i) && x(o.from) >= x1 + w && x(o.from) < x1 + w + labelW)
    const text = blocked
      ? ''
      : `<text x="${inside ? x1 + w / 2 : x1 + w + 4}" y="${y + LANE_H / 2}" dominant-baseline="central" text-anchor="${inside ? 'middle' : 'start'}">${esc(label)}</text>`
    body +=
      `<g class="rd-cell rd-ival${b.state ? ` rd-${b.state}` : ''}">` +
      `<rect x="${x1}" y="${y}" width="${w}" height="${LANE_H}" rx="4"/>` +
      text +
      `</g>`
  })
  for (const m of marks) {
    body +=
      `<g class="rd-level rd-tone-${m.tone ?? 'warning'}">` +
      `<line x1="${x(m.at)}" x2="${x(m.at)}" y1="${y0 - 2}" y2="${base}"/>` +
      `<text x="${x(m.at)}" y="${y0 - 6}" text-anchor="middle">${esc(m.label)}</text></g>`
  }
  body += `<line class="rd-baseline" x1="0" x2="${width}" y1="${base}" y2="${base}"/>`
  for (const v of [...new Set(points)].sort((a, b) => a - b)) {
    body += `<text class="rd-tick" x="${x(v)}" y="${base + 13}" text-anchor="middle">${v}</text>`
  }
  // Labels outside the last bar can run past the axis; leave room for them.
  return svg(width + 48, height, body)
}

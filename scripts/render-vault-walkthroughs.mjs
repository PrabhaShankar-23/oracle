// Writes the approach walkthroughs (src/content/deep) into the vault's 03-dsa-cold-recall.html:
// tabs per approach with time/space, SVG diagrams, key points and code. Same data and SVG
// renderer as the site. Re-running replaces the marked blocks, so it is safe to repeat.
// Run: npm run vault:walkthroughs      (VAULT_DIR=… to override the vault path)
import * as cheerio from 'cheerio'
import { readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { walkthroughs } from '../src/content/deep/index.ts'
import { barsSvg, cellsSvg } from '../src/lib/recallDiagramSvg.ts'

const VAULT = process.env.VAULT_DIR ?? path.join(homedir(), 'Desktop/java/Spring Boot/AlgoHandbook')
const FILE = path.join(VAULT, '04-DSA-V2/00-index/03-dsa-cold-recall.html')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\p{Letter}\p{Number}\s-]/gu, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')

function frame({ caption, highlight, note }, svg) {
  const head =
    caption || highlight
      ? `<div class="walk-cap">${esc(caption ?? '')}${caption && highlight ? ' · ' : ''}${highlight ? `<span class="walk-hl">${esc(highlight)}</span>` : ''}</div>`
      : ''
  return `<div class="walk-frame">${head}${svg}${note ? `<div class="walk-fnote">${esc(note)}</div>` : ''}</div>`
}

function diagram(d) {
  const frames = d.rows.map((row) =>
    d.kind === 'cells' ? frame(row, cellsSvg(row)) : frame({ ...row, highlight: row.box?.label }, barsSvg(row)),
  )
  return `<figure class="walk-fig">${frames.join('')}</figure>`
}

function block(id, approaches) {
  const best = Math.max(0, approaches.findIndex((a) => a.best))
  const tabs = approaches
    .map(
      (a, i) =>
        `<button type="button" role="tab" data-i="${i}" aria-selected="${i === best}">${i + 1}. ${esc(a.name)}${a.best ? ' ★' : ''}</button>`,
    )
    .join('')
  const panels = approaches
    .map(
      (a, i) =>
        `<div class="walk-panel${a.best ? ' walk-best' : ''}" role="tabpanel" data-i="${i}"${i === best ? '' : ' hidden'}>` +
        `<div class="walk-cx"><span>Time ${esc(a.time)}</span><span>Space ${esc(a.space)}</span></div>` +
        `<div class="walk-grid"><div class="walk-figs">${a.diagrams.map(diagram).join('')}</div>` +
        `<ul class="walk-points">${a.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` +
        `<pre>${esc(a.code)}</pre></div>`,
    )
    .join('')
  return `<!-- walk:${id} -->\n<div class="walk"><div class="walk-tabs" role="tablist">${tabs}</div>${panels}</div>\n<!-- /walk -->`
}

const CSS = `<style id="walk-css">
:root{--walk-blue:#2f6fb5}
@media (prefers-color-scheme:dark){:root{--walk-blue:#7fa7e0}}
.walk{margin:10px 0 0;border-top:1px dashed var(--line);padding-top:6px}
.walk-tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--line)}
.walk-tabs button{background:none;border:0;border-bottom:2px solid transparent;color:var(--dim);
  font:600 12px/1.4 inherit;font-family:inherit;padding:8px 8px 6px;cursor:pointer;white-space:nowrap}
.walk-tabs button[aria-selected="true"]{color:var(--accent);border-bottom-color:var(--accent)}
.walk-panel{padding-top:8px}
.walk-cx{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.walk-cx span{font:11px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--badge);
  border:1px solid var(--line);border-radius:10px;padding:0 8px}
.walk-best .walk-cx span:first-child{border-color:var(--accent);color:var(--accent)}
.walk-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}
.walk-figs{display:grid;gap:8px;min-width:0}
.walk-fig{margin:0;display:grid;gap:10px;padding:10px;border:1px solid var(--line);border-radius:8px;
  background:var(--code-bg);overflow-x:auto}
.walk-cap{font-size:11px;font-weight:600;color:var(--dim);margin-bottom:2px}
.walk-hl{color:var(--accent);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.walk-fnote{font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:2px}
.walk-points{margin:0;padding-left:18px;font-size:12.5px}
.walk-points li{margin:0 0 4px}
.walk text{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;fill:var(--dim)}
.walk .rd-cell rect{fill:var(--card);stroke:var(--line)}
.walk .rd-cell text{font-size:13px;fill:var(--ink)}
.walk .rd-dim{opacity:.35}
.walk .rd-match rect{fill:color-mix(in srgb,var(--e) 22%,transparent);stroke:var(--e)}
.walk .rd-miss rect{fill:color-mix(in srgb,var(--h) 18%,transparent);stroke:var(--h)}
.walk .rd-active rect{fill:color-mix(in srgb,var(--accent) 24%,transparent);stroke:var(--accent);stroke-width:1.5}
.walk .rd-active text{font-weight:700}
.walk .rd-span path{stroke:var(--dim)}
.walk .rd-bar{fill:color-mix(in srgb,var(--dim) 40%,transparent)}
.walk .rd-bar-value{font-size:9px}
.walk .rd-water{fill:color-mix(in srgb,var(--walk-blue) 45%,transparent);stroke:var(--walk-blue)}
.walk .rd-baseline{stroke:var(--dim)}
.walk .rd-box{fill:color-mix(in srgb,var(--accent) 14%,transparent);stroke:var(--accent);stroke-dasharray:4 3}
.walk .rd-level line{stroke-dasharray:5 3;stroke-width:1.25}
.walk .rd-level .rd-leader{stroke-dasharray:1 3;opacity:.6}
.walk .rd-tone-primary path,.walk .rd-tone-primary line{fill:var(--accent);stroke:var(--accent)}
.walk .rd-tone-primary text{fill:var(--accent);font-weight:700}
.walk .rd-tone-secondary path,.walk .rd-tone-secondary line{fill:var(--walk-blue);stroke:var(--walk-blue)}
.walk .rd-tone-secondary text{fill:var(--walk-blue);font-weight:700}
.walk .rd-tone-success path,.walk .rd-tone-success line{fill:var(--e);stroke:var(--e)}
.walk .rd-tone-success text{fill:var(--e);font-weight:700}
.walk .rd-tone-error path,.walk .rd-tone-error line{fill:var(--h);stroke:var(--h)}
.walk .rd-tone-error text{fill:var(--h);font-weight:700}
.walk .rd-tone-warning path,.walk .rd-tone-warning line{fill:var(--m);stroke:var(--m)}
.walk .rd-tone-warning text{fill:var(--m);font-weight:700}
@media (max-width:720px){.walk-grid{grid-template-columns:minmax(0,1fr)}}
@media print{.walk-tabs{display:none}.walk-panel[hidden]{display:block}.walk-panel{break-inside:avoid}}
</style>`

const JS = `<script id="walk-js">
document.addEventListener('click', function (e) {
  var tab = e.target.closest('.walk-tabs button');
  if (!tab) return;
  var walk = tab.closest('.walk');
  walk.querySelectorAll('.walk-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b === tab)); });
  walk.querySelectorAll('.walk-panel').forEach(function (p) { p.hidden = p.dataset.i !== tab.dataset.i; });
});
</script>`

// A pointer or span past the end of a row would draw off the diagram; catch it here.
function checkDiagrams() {
  for (const [id, approaches] of Object.entries(walkthroughs)) {
    for (const a of approaches) {
      for (const d of a.diagrams) {
        for (const row of d.rows) {
          const n = (d.kind === 'cells' ? row.cells : row.heights).length
          const at = (label, i) => {
            if (!Number.isInteger(i) || i < 0 || i >= n) throw new Error(`${id} · ${a.name}: ${label} index ${i} outside 0…${n - 1}`)
          }
          for (const p of row.pointers ?? []) at(`pointer ${p.label}`, p.at)
          for (const k of Object.keys(row.states ?? {})) at('state', Number(k))
          for (const i of row.dim ?? []) at('dim', i)
          if (row.span) {
            at('span from', row.span.from)
            at('span to', row.span.to)
            if (row.span.from > row.span.to) throw new Error(`${id} · ${a.name}: span runs backwards`)
          }
          for (const l of row.levels ?? []) {
            at(`level ${l.label} from`, l.from)
            at(`level ${l.label} to`, l.to)
          }
          if (row.box) {
            at('box from', row.box.from)
            at('box to', row.box.to)
          }
        }
      }
    }
  }
}

checkDiagrams()

let html = await readFile(FILE, 'utf8')
const $ = cheerio.load(html)

// Card ids in document order, built exactly like scripts/ingest-vault.mjs.
const ids = []
$('.wrap > details').each((_, d) => {
  $(d)
    .find('.card')
    .each((_, c) => {
      ids.push(`${$(d).attr('id')}-${slugify($(c).find('.hd a').first().text().replace(/\s+/g, ' ').trim())}`)
    })
})

// Each card holds exactly one code slot: a plain <pre>, or a walkthrough block written earlier.
const slots = [...html.matchAll(/<!-- walk:[^>]*? -->[\s\S]*?<!-- \/walk -->|<pre>[\s\S]*?<\/pre>/g)]
if (slots.length !== ids.length) throw new Error(`${slots.length} code slots vs ${ids.length} cards`)

const unknown = Object.keys(walkthroughs).filter((id) => !ids.includes(id))
if (unknown.length) throw new Error(`walkthroughs for unknown cards: ${unknown.join(', ')}`)

let out = ''
let last = 0
let written = 0
slots.forEach((m, i) => {
  const approaches = walkthroughs[ids[i]]
  if (!approaches) return
  out += html.slice(last, m.index) + block(ids[i], approaches)
  last = m.index + m[0].length
  written++
})
html = out + html.slice(last)

html = html.replace(/<style id="walk-css">[\s\S]*?<\/style>\n?/, '').replace('</head>', `${CSS}\n</head>`)
html = html.replace(/<script id="walk-js">[\s\S]*?<\/script>\n?/, '').replace('</body>', `${JS}\n</body>`)

await writeFile(FILE, html)
console.log(`Wrote ${written} walkthroughs into ${path.relative(VAULT, FILE)}`)

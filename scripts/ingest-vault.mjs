// Pulls pages from the AlgoHandbook vault into src/content/generated/*.json.
// Run: npm run ingest            (uses the default vault path below)
//      VAULT_DIR=/path npm run ingest
import * as cheerio from 'cheerio'
import { marked } from 'marked'
import { parse as parseYaml } from 'yaml'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const VAULT =
  process.env.VAULT_DIR ??
  path.join(homedir(), 'Desktop/java/Spring Boot/AlgoHandbook')
const OUT = path.resolve(import.meta.dirname, '../src/content/generated')

const CASE_STUDIES_DIR = '01-System Design/07-Design-problems/html'
const AI_SYSTEMS_DIR = '01-System Design/06-ai-systems'
const GAME_DAY_DIR = '02-Game-Day'
const CASE_STUDY_ROUTE = '/system-design/case-studies'

const load = async (rel) => cheerio.load(await readFile(path.join(VAULT, rel), 'utf8'))
const text = (el) => el.text().replace(/\s+/g, ' ').trim()
const inner = (el) => (el.html() ?? '').trim()

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/*
 * Emoji → Material icons. The vault marks its sections and callouts with emoji (⚡ TL;DR, 🎯 Recall,
 * ⚠️ Break it …). On the site those are drawn as Material icons instead: every HTML string in the
 * generated JSON gets its mapped emoji replaced by an inline SVG whose path comes from
 * @mui/icons-material, so the icons take the text colour and need no runtime code. Diagram sources,
 * code and chart specs are left alone; an emoji with no mapping stays as it is. Plain-text fields
 * (titles, nav labels) are not HTML and are not touched.
 */
const EMOJI_ICONS = {
  '⚡': 'BoltOutlined', '🎯': 'TrackChangesOutlined', '💡': 'LightbulbOutlined', '⚙': 'SettingsOutlined',
  '🧬': 'TimelineOutlined', '💻': 'CodeOutlined', '📏': 'StraightenOutlined', '🩺': 'MonitorHeartOutlined',
  '🗣': 'RecordVoiceOverOutlined', '⚖': 'BalanceOutlined', '🔢': 'NumbersOutlined', '🚫': 'BlockOutlined',
  '🕸': 'HubOutlined', '📚': 'MenuBookOutlined', '🗺': 'MapOutlined', '🏠': 'HomeOutlined',
  '🌳': 'AccountTreeOutlined', '📋': 'ListAltOutlined', '🛰': 'SatelliteAltOutlined', '📍': 'PlaceOutlined',
  '🧭': 'ExploreOutlined', '⚠': 'WarningAmberOutlined', '❌': 'CloseOutlined', '✅': 'CheckCircleOutlined',
  '🔀': 'ShuffleOutlined', '⏳': 'HourglassEmptyOutlined', '🪞': 'FlipOutlined', '✏': 'EditOutlined',
  '🔗': 'LinkOutlined', '🎤': 'MicNoneOutlined', '🪜': 'StairsOutlined', '🔁': 'ReplayOutlined',
  '🪤': 'ReportProblemOutlined', '⭐': 'StarRounded', '🔥': 'LocalFireDepartmentOutlined', '📝': 'EditNoteOutlined',
  '🧱': 'FoundationOutlined', '📘': 'DescriptionOutlined', '📄': 'ArticleOutlined', '🔬': 'ScienceOutlined',
  '📖': 'AutoStoriesOutlined', '🖼': 'ImageOutlined', '🧪': 'ScienceOutlined', '🛡': 'ShieldOutlined',
  '🏗': 'ConstructionOutlined', '📣': 'CampaignOutlined', '🔑': 'KeyOutlined', '🏭': 'FactoryOutlined',
  '🧠': 'PsychologyOutlined', '🔧': 'BuildOutlined', '🧩': 'ExtensionOutlined', '👥': 'GroupsOutlined',
  '📦': 'Inventory2Outlined', '🚀': 'RocketLaunchOutlined', '🔍': 'SearchOutlined', '🔎': 'SearchOutlined',
  '⏱': 'TimerOutlined', '🧮': 'CalculateOutlined', '📉': 'TrendingDownOutlined', '📈': 'TrendingUpOutlined',
  '🔌': 'PowerOutlined', '🙋': 'PanToolOutlined', '✂': 'ContentCutOutlined', '📌': 'PushPinOutlined',
  '🤔': 'HelpOutlineOutlined', '❓': 'HelpOutlineOutlined', '🌍': 'PublicOutlined', '🗂': 'FolderOutlined',
  '🧰': 'HandymanOutlined', '🛑': 'DangerousOutlined', '🎚': 'TuneOutlined', '♻': 'RecyclingOutlined',
  '📎': 'AttachFileOutlined', '📊': 'BarChartOutlined', '📐': 'SquareFootOutlined', '🛠': 'HandymanOutlined',
  '📅': 'EventOutlined', '🏷': 'LabelOutlined', '🎛': 'TuneOutlined', '🔒': 'LockOutlined', '🏛': 'AccountBalanceOutlined',
}
const iconSvgCache = new Map()
function iconSvg(name) {
  if (iconSvgCache.has(name)) return iconSvgCache.get(name)
  let svg = null
  try {
    const src = readFileSync(path.join(process.cwd(), 'node_modules/@mui/icons-material', `${name}.js`), 'utf8')
    const paths = [...src.matchAll(/"path",\s*\{[^}]*?d:\s*"([^"]+)"/g)].map((m) => `<path d="${m[1]}"/>`)
    const circles = [...src.matchAll(/"circle",\s*\{\s*cx:\s*"([\d.]+)",\s*cy:\s*"([\d.]+)",\s*r:\s*"([\d.]+)"/g)].map(
      (m) => `<circle cx="${m[1]}" cy="${m[2]}" r="${m[3]}"/>`,
    )
    if (paths.length + circles.length) {
      svg = `<svg class="md-icon" viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="currentColor" aria-hidden="true" style="vertical-align:-0.2em;flex-shrink:0">${paths.join('')}${circles.join('')}</svg>`
    }
  } catch {
    /* icon not in this version of the package: keep the emoji */
  }
  iconSvgCache.set(name, svg)
  return svg
}
const EMOJI_RE = new RegExp(`(${Object.keys(EMOJI_ICONS).join('|')})\uFE0F?`, 'gu')
const ICON_SKIP = new Set(['pre', 'code', 'svg', 'script', 'style', 'title'])

function iconiseHtml(html) {
  const hasEmoji = EMOJI_RE.test(html)
  EMOJI_RE.lastIndex = 0
  if (!hasEmoji && !html.includes('─▶') && !html.includes('→')) return html
  const $ = cheerio.load(html, null, false)
  promoteFlowChains($)
  const walk = (node) => {
    for (const child of [...(node.children ?? [])]) {
      if (child.type === 'text') {
        const before = child.data
        const after = before.replace(EMOJI_RE, (m, e) => iconSvg(EMOJI_ICONS[e]) ?? m)
        // text nodes are escaped on output, so swap the node for parsed HTML
        if (after !== before) $(child).replaceWith(after.replace(/&(?!#?\w+;)/g, '&amp;').replace(/<(?!svg|\/svg|path|circle)/g, '&lt;'))
      } else if (child.type === 'tag' && !ICON_SKIP.has(child.name) && !$(child).hasClass('mermaid') && !$(child).hasClass('vault-chart')) {
        walk(child)
      }
    }
  }
  walk($.root()[0])
  return $.html()
}

/*
 * Flow chains. The vault writes short "how it happens" sequences as one line of text:
 *   **🧭 Flow:** request ─▶ validate ─label─▶ run ─▶ result        (or a labelled line using →)
 * The site draws each as a horizontal row of step chips joined by arrows, so a sequence reads as a small
 * diagram instead of a sentence. A paragraph can hold several chains separated by line breaks.
 */
const CHAIN_SPLIT = /\s*─([^─▶<]{1,24})─▶\s*|\s*─▶\s*/
function chainHtml(segment) {
  const usesBar = (segment.match(/─▶/g) ?? []).length >= 2
  const labelled = /^\s*(<strong>[^<]{1,40}:<\/strong>)\s*/.exec(segment)
  const usesArrow = !usesBar && labelled && (segment.match(/\s→\s/g) ?? []).length >= 3
  if (!usesBar && !usesArrow) return null
  let rest = labelled ? segment.slice(labelled[0].length) : segment
  let tail = ''
  // a trailing "· offline" / "· every step" suffix is a note on the chain, not a step
  const suffix = /\s+·\s+([^·<]{1,30})\s*$/.exec(rest)
  if (suffix) {
    tail = `<span class="flow-note">${suffix[1]}</span>`
    rest = rest.slice(0, suffix.index)
  }
  const parts = usesBar ? rest.split(CHAIN_SPLIT) : rest.split(/\s+→\s+/).flatMap((x, i) => (i ? [undefined, x] : [x]))
  let out = labelled ? `<span class="flow-label">${labelled[1]}</span>` : ''
  for (let i = 0; i < parts.length; i += 2) {
    const step = (parts[i] ?? '').trim()
    if (!step) continue
    if (i > 0) out += parts[i - 1] ? `<span class="flow-arrow" data-label="${parts[i - 1].trim()}"></span>` : '<span class="flow-arrow"></span>'
    out += `<span class="flow-step">${step}</span>`
  }
  return `<div class="flow-chain">${out}${tail}</div>`
}
function promoteFlowChains($) {
  $('p').each((_, node) => {
    const p = $(node)
    if (p.parents('pre, code, .mermaid, figure').length) return
    const html = p.html() ?? ''
    if (!html.includes('─▶') && !/→/.test(html)) return
    const segments = html.split(/\\?\s*<br\s*\/?>\s*/)
    const drawn = segments.map((seg) => chainHtml(seg))
    if (!drawn.some(Boolean)) return
    p.replaceWith(segments.map((seg, i) => drawn[i] ?? (seg.trim() ? `<p>${seg}</p>` : '')).join(''))
  })
}

/** Apply `iconiseHtml` to every HTML string in a generated JSON value. */
function iconiseDeep(value) {
  if (typeof value === 'string') return /<[a-z][^>]*>/i.test(value) ? iconiseHtml(value) : value
  if (Array.isArray(value)) return value.map(iconiseDeep)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, iconiseDeep(v)]))
  return value
}

async function write(name, data) {
  await writeFile(path.join(OUT, name), JSON.stringify(iconiseDeep(data), null, 2) + '\n')
  console.log(`  wrote ${name}`)
}

/* ---------------- DSA cold recall ---------------- */

const LIST_MARKS = {
  '★': 'both',
  '◆': 'neetcode150',
  '▲': 'lc150',
  '＋': 'canonical',
  '🔒': 'premium',
}
const DIFFICULTY = { E: 'Easy', M: 'Medium', H: 'Hard' }

async function ingestColdRecall() {
  const $ = await load('04-DSA-V2/00-index/03-dsa-cold-recall.html')
  const families = []

  $('.wrap > .sec, .wrap > details').each((_, node) => {
    const el = $(node)
    if (el.hasClass('sec')) {
      const name = text(el)
      families.push({ id: name.split(' ')[0], name, patterns: [] })
      return
    }

    const patternId = el.attr('id')
    const pattern = {
      id: patternId,
      name: text(el.find('summary .pname')),
      problems: [],
    }

    el.find('.card').each((_, cardNode) => {
      const card = $(cardNode)
      const link = card.find('.hd a').first()
      const title = text(link)
      const marks = text(card.find('.hd .tag')).split(/\s+/).filter(Boolean)
      const rows = Object.fromEntries(
        card
          .find('.row')
          .toArray()
          .map((r) => [text($(r).find('.k')).toLowerCase(), inner($(r).find('.v'))]),
      )

      pattern.problems.push({
        id: `${patternId}-${slugify(title)}`,
        title,
        url: link.attr('href'),
        difficulty: DIFFICULTY[card.find('.hd .d').attr('class').split(' ')[1]],
        marks,
        lists: marks.map((m) => LIST_MARKS[m]).filter(Boolean),
        state: rows.state,
        invariant: rows.invariant,
        approaches: card
          .find('.appr .a')
          .toArray()
          .map((a) => ({
            label: text($(a).find('.n')),
            text: inner($(a).find('span').eq(1)),
            complexity: text($(a).find('.cx')),
            winner: $(a).hasClass('win'),
          })),
        why: inner(card.find('.why')) || undefined,
        // Cards with a walkthrough block keep the best approach's code in its panel.
        code: card.children('pre').text() || card.find('.walk-best pre').text() || undefined,
        traps: card
          .find('.note')
          .toArray()
          .map((n) => {
            $(n).find('b').first().remove()
            return inner($(n)).replace(/^\s*·\s*/, '')
          }),
      })
    })

    families.at(-1).patterns.push(pattern)
  })

  const head = $('.head p').first()
  const data = { title: 'DSA Cold Recall', intro: inner(head), families }
  await write('dsa-cold-recall.json', data)
  return data
}

/* ---------------- DSA practice list ---------------- */

const PRACTICE_FILE = '04-DSA-V2/00-index/00-dsa-problem-solving-index.md'
/** Prose sections of the note worth publishing; the rest is vault bookkeeping (night log, authoring rules). */
const PRACTICE_GUIDE = ['How to work this list', 'AI-loop practical round']
const stripEmoji = (s) => s.replace(/^[^\p{Letter}\p{Number}]+/u, '').trim()
const normUrl = (u) => u.replace(/\/+$/, '')

async function ingestPractice(recall) {
  const md = await readFile(path.join(VAULT, PRACTICE_FILE), 'utf8')
  const lines = md.split('\n')

  // Same LeetCode problem → its cold recall card, preferring the card under the same pattern.
  const cards = new Map()
  for (const f of recall.families)
    for (const p of f.patterns)
      for (const q of p.problems) {
        const key = normUrl(q.url)
        cards.set(key, [...(cards.get(key) ?? []), { id: q.id, pattern: p.id }])
      }
  const cardFor = (url, pattern) => {
    const hits = cards.get(normUrl(url)) ?? []
    return hits.find((h) => h.pattern === pattern) ?? hits[0]
  }

  const families = []
  const sections = new Map()
  let current = null // prose section being collected
  let inList = true
  for (const line of lines) {
    const h2 = /^## (.+)$/.exec(line)
    if (h2) {
      const title = stripEmoji(h2[1])
      const family = /^([A-Z]) · (.+)$/.exec(title)
      current = null
      if (inList && family) {
        families.push({ id: family[1], name: `${family[1]} — ${family[2]}`, groups: [] })
      } else if (inList && /^Extra tracks/.test(title)) {
        families.push({ id: 'extra', name: title.replace(/ — /, ' · '), groups: [] })
      } else {
        inList = false
        const known = PRACTICE_GUIDE.find((g) => title.startsWith(g))
        if (known) sections.set(known, (current = []))
      }
      continue
    }
    if (current) {
      current.push(line)
      continue
    }
    if (!inList) continue

    const family = families.at(-1)
    if (!family) continue
    const h3 = /^### (.+)$/.exec(line)
    if (h3) {
      const pattern = /^(P\d+) — (.+?) · \[note\]/.exec(h3[1])
      family.groups.push(
        pattern
          ? { id: pattern[1], code: pattern[1], name: pattern[2], recallId: pattern[1], problems: [] }
          : { id: `x-${slugify(h3[1])}`, name: h3[1].trim(), problems: [] },
      )
      continue
    }
    const note = /^\*([^*].*)\*$/.exec(line.trim())
    if (note && family.groups.length === 0) family.note = note[1]

    const row = /^(\d+)\. \[[ x]\] (🟢 \*\*L1\*\* · )?\[([^\]]+)\]\(([^)]+)\) · (Easy|Medium|Hard)(.*)$/.exec(line)
    if (!row) continue
    const group = family.groups.at(-1)
    const card = cardFor(row[4], group.code)
    // Extra-track groups take the cold recall pattern (X1…) their problems sit under.
    if (!group.recallId && card) group.recallId = card.pattern
    group.problems.push({
      n: Number(row[1]),
      title: row[3],
      url: row[4],
      difficulty: row[5],
      l1: Boolean(row[2]),
      marks: row[6].split('·').map((m) => m.trim()).filter(Boolean),
      recallId: card?.id,
    })
  }

  const guide = PRACTICE_GUIDE.filter((t) => sections.has(t)).map((title) => {
    const body = sections
      .get(title)
      .join('\n')
      .replace(/^\s*---\s*$/gm, '')
      .replace(/^(\s*)- \[[ x]\] /gm, '$1- ')
    const $ = cheerio.load(marked.parse(body, { gfm: true, mangle: false, headerIds: false }))
    const root = $('body')
    // Pattern-note links point into the vault; the site's copy of each pattern is its cold recall section.
    root.find('a[href$=".md"]').each((_, node) => {
      const a = $(node)
      const id = /(P\d+)-[\w-]+\.md$/.exec(a.attr('href') ?? '')?.[1]
      if (id) a.attr('href', `/dsa/cold-recall#${id}`)
    })
    rewriteLinks($, root)
    return { id: slugify(title), title, html: inner(root) }
  })

  const intro = /^> (.+)$/m.exec(md)?.[1] ?? ''
  const data = {
    title: 'Practice list',
    intro: marked.parseInline(intro.replace(/ in this repo/, '')),
    families,
    guide,
  }
  const problems = families.flatMap((f) => f.groups.flatMap((g) => g.problems))
  console.log(`  parsed practice list (${problems.length} problems, ${problems.filter((p) => p.l1).length} L1)`)
  await write('dsa-practice.json', data)

  // The practice list owns the 🟢 L1 flag; copy it onto every cold recall card for the same LeetCode problem.
  const l1Urls = new Set(problems.filter((p) => p.l1).map((p) => normUrl(p.url)))
  for (const f of recall.families)
    for (const p of f.patterns)
      for (const q of p.problems) q.l1 = l1Urls.has(normUrl(q.url))
  await write('dsa-cold-recall.json', recall)
  return data
}

/* ---------------- System design case studies ---------------- */

function rewriteLinks($, root) {
  root.find('a[href]').each((_, node) => {
    const a = $(node)
    const href = a.attr('href')
    if (/^https?:\/\//.test(href)) {
      a.attr('target', '_blank').attr('rel', 'noopener noreferrer')
    } else if (href === 'index.html') {
      a.attr('href', CASE_STUDY_ROUTE)
    } else if (/^[\w-]+\.html$/.test(href)) {
      a.attr('href', `${CASE_STUDY_ROUTE}/${href.replace('.html', '')}`)
    } else if (href.startsWith('/')) {
      // Already a site route — an earlier pass resolved it. Leave it alone.
    } else if (!href.startsWith('#')) {
      // Points at a vault .md file that isn't on the site yet — keep the text, drop the link.
      a.replaceWith(a.contents())
    }
  })
}

function collectHeadings($, root) {
  const seen = new Set()
  return root
    .find('h2, h3')
    .toArray()
    .map((node) => {
      const h = $(node)
      let id = slugify(text(h)) || 'section'
      while (seen.has(id)) id += '-x'
      seen.add(id)
      h.attr('id', id)
      return { id, text: text(h), level: Number(node.tagName[1]) }
    })
}

function readHeader($) {
  const article = $('#content')
  return {
    title: text(article.find('h1').first()),
    subtitle: text(article.find('.subtitle').first()),
    meta: article
      .find('.meta span')
      .toArray()
      .map((s) => text($(s))),
  }
}

function stripHeader($, article) {
  article.find('h1, .subtitle, .meta, hr.rule, .docnav, #reveal').remove()
  // The first <hr> after the removed docnav/button is now a stray divider.
  const first = article.children().first()
  if (first.is('hr')) first.remove()
  article.find('[style]').removeAttr('style')
}

async function ingestCaseStudies() {
  const $index = await load(`${CASE_STUDIES_DIR}/index.html`)
  const indexArticle = $index('#content')

  const studies = indexArticle
    .find('.ncard')
    .toArray()
    .map((node) => {
      const card = $index(node)
      return {
        slug: card.attr('href').replace('.html', ''),
        title: text(card.find('h3')),
        summary: text(card.find('p')),
        tags: card
          .find('.pill')
          .toArray()
          .map((p) => ({
            label: text($index(p)),
            tone: { a: 'primary', g: 'success', w: 'warning', r: 'error' }[
              $index(p).attr('class').split(' ')[1]
            ],
          })),
        readingTime: text(card.find('.rt')),
      }
    })

  const indexHeader = readHeader($index)
  stripHeader($index, indexArticle)
  indexArticle.find('.cardgrid').prev('h2').remove()
  indexArticle.find('.cardgrid').remove()
  rewriteLinks($index, indexArticle)
  const indexHeadings = collectHeadings($index, indexArticle)

  const pages = []
  for (const study of studies) {
    const $ = await load(`${CASE_STUDIES_DIR}/${study.slug}.html`)
    const article = $('#content')
    const header = readHeader($)
    stripHeader($, article)
    rewriteLinks($, article)
    const headings = collectHeadings($, article)
    pages.push({ ...study, ...header, headings, html: inner(article) })
    console.log(`  parsed ${study.slug} (${headings.length} headings)`)
  }

  const data = {
    index: { ...indexHeader, headings: indexHeadings, html: inner(indexArticle) },
    studies: pages,
  }
  await write('case-studies.json', data)
  return data
}

/* ---------------- WebRTC revision cards ---------------- */

async function ingestWebRtc() {
  const $ = await load('01-System Design/03-hld/webRTC.html')

  const cards = $('.deck > .card')
    .toArray()
    .map((node, i) => {
      const card = $(node)
      card.find('[style]').removeAttr('style')
      const titleHtml = inner(card.find('.title')).replace(/<br\s*\/?>/g, ' ')
      return {
        id: `card-${String(i + 1).padStart(2, '0')}`,
        number: i + 1,
        cover: card.hasClass('cover'),
        topic: text(card.find('.topic')),
        title: text(card.find('.title').clone().find('br').replaceWith(' ').end()),
        titleHtml,
        subtitle: inner(card.find('.subtitle').first()),
        html: inner(card.find('.content')) || inner(card.find('.meta-block')),
      }
    })

  const data = { title: text($('.toolbar h1').clone().find('em').remove().end()), cards }
  await write('webrtc.json', data)
  return data
}

/* ---------------- DSA helper toolkits (Python + Java) ---------------- */

const UTILS = [
  { lang: 'python', label: 'Python helpers', file: 'py_dsa_utils.html', route: '/dsa/python-utils' },
  { lang: 'java', label: 'Java helpers', file: 'JavaDsaUtils.html', route: '/dsa/java-utils' },
]

async function ingestUtils({ lang, file }) {
  const $ = await load(`04-DSA-V2/00-index/04-code-helpers/${file}`)
  const main = $('main')

  // Twin page → its site route; the .py/.java source isn't on the site, so keep only the text.
  main.find('.meta a[href]').each((_, node) => {
    const a = $(node)
    const twin = UTILS.find((u) => u.file === a.attr('href'))
    if (twin) a.attr('href', twin.route).text(twin.label)
    else a.replaceWith(a.contents())
  })
  main.find('code.py').removeAttr('class')

  const sections = main
    .find('section.sec')
    .toArray()
    .map((node) => {
      const sec = $(node)
      return {
        id: sec.attr('id'),
        title: text(sec.find('h2')),
        lede: inner(sec.find('.lede')) || undefined,
        sheet: sec
          .find('.sheet .row')
          .toArray()
          .map((r) => ({ label: text($(r).find('.k')), code: $(r).find('.v').text() })),
        helpers: sec
          .find('.card')
          .toArray()
          .map((c) => {
            const card = $(c)
            const name = card.find('.cname')
            return {
              id: name.attr('id'),
              name: name.length ? text(name) : undefined,
              kind: text(card.find('.card-head .tag')) || undefined,
              doc: inner(card.find('.doc')) || undefined,
              code: card.find('pre.code code').text(),
            }
          }),
      }
    })

  const data = {
    lang,
    title: text(main.find('h1')),
    subtitle: text(main.find('.subtitle')),
    meta: inner(main.find('.meta')),
    stats: main
      .find('.stats .num')
      .toArray()
      .map((n) => ({ value: text($(n).find('b')), label: text($(n).find('span')) })),
    sections,
  }
  await write(`dsa-utils-${lang}.json`, data)
  return data
}

/* ---------------- AI systems (Markdown notes) ---------------- */

const AI_SYSTEMS_DOCS = [
  { slug: 'agentic-design', file: 'index_agentic_systems_design.md' },
]

/** `[C]` / `[I]` / `[B]` tier markers become chips the page can style. */
const TIERS = { C: 'core', I: 'important', B: 'breadth' }

async function ingestAiSystems(agenticSections = []) {
  const published = new Set(agenticSections.flatMap((s) => s.notes.map((n) => n.slug)))
  const docs = []
  for (const { slug, file } of AI_SYSTEMS_DOCS) {
    const md = await readFile(path.join(VAULT, AI_SYSTEMS_DIR, file), 'utf8')
    const $ = cheerio.load(marked.parse(md, { gfm: true, mangle: false, headerIds: false }))
    const body = $('body')

    const title = text(body.find('h1').first())
    body.find('h1').first().remove()

    // The opening blockquote is the note's metadata: created/revised, scope, router.
    const lead = body.find('blockquote').first()
    rewriteLinks($, lead)
    const meta = lead
      .find('p')
      .toArray()
      .flatMap((p) => inner($(p)).split('\n'))
      .map((line) => line.trim())
      .filter(Boolean)
    lead.remove()

    body.find('code').each((_, node) => {
      const code = $(node)
      const tier = /^\[([CIB])\]$/.exec(text(code))
      if (tier) code.replaceWith(`<span class="tier tier-${TIERS[tier[1]]}">${tier[1]}</span>`)
    })

    body.find(`a[href*="${path.basename(AGENTIC_DIR)}/"][href$=".md"]`).each((_, node) => {
      const a = $(node)
      const slug = agenticSlug(path.basename(a.attr('href') ?? ''))
      if (published.has(slug)) a.attr('href', `${AGENTIC_ROUTE}/${slug}`)
    })

    rewriteLinks($, body)
    const headings = collectHeadings($, body)
    docs.push({ slug, title, meta, headings, html: inner(body) })
    console.log(`  parsed ${file} (${headings.length} headings)`)
  }

  const data = { docs }
  await write('ai-systems.json', data)
  return data
}

/* ---------------- Game Day recall (02-Game-Day) ---------------- */

// Source files are Q&A recall grids: `## <emoji> A — Openers` bands, `###### 1. ⭐ "question"`,
// then a <details> holding the keyword bullets plus Flow / Trap / a vault link.
const GAME_DAY_FILES = [
  '01-PYTHON.md',
  '02-FASTAPI.md',
  '03-JAVA-SPRING.md',
  '04-LLM-FOUNDATIONS.md',
  '05-RAG.md',
  '06-AGENTIC-AI.md',
  '07-MCP-CONTEXT-ENGINEERING.md',
  '08-LLM-SERVING-INFERENCE.md',
  '11-ML-DL.md',
  '15-REAL-TIME-SYSTEMS.md',
  '17-NLP-CLASSICAL.md',
  '18-REACT.md',
]

const GAME_DAY_MARKS = { '⭐': 'decides', '🔥': 'trending', '📍': 'asked' }

/** `## 🎬 A — Openers` → letter + name. Appendix headings (♻️, 📝) have no letter. */
function parseBandHeading(raw) {
  const cleaned = raw.replace(/^[^\p{Letter}\p{Number}]+/u, '').trim()
  const band = /^([A-F])\s+—\s+(.*)$/.exec(cleaned)
  return band ? { letter: band[1], name: band[2] } : { letter: null, name: cleaned }
}

/** `1. ⭐ 🔥 "How do you pick?"` → number, marks, text. */
function parseQuestionHeading(raw) {
  const numbered = /^(\d+)\.\s*(.*)$/.exec(raw.trim())
  if (!numbered) return null
  let rest = numbered[2]
  const marks = []
  for (const [glyph, mark] of Object.entries(GAME_DAY_MARKS)) {
    if (rest.includes(glyph)) {
      marks.push(mark)
      rest = rest.split(glyph).join('')
    }
  }
  // Merged questions carry a tag before the quote. A band tag (`*(D)* "Why …?"`) is kept; a drill
  // provenance tag (`🗣️ *(`jbtiq_ml` Q12 · S3 …)* "Why …?"`) is dropped. The quotes go either way.
  // Trend-scan badges (🆕 new to the vault, 🎯 a named company asked it) may sit in front and are kept.
  rest = rest.trim().replace(/^🗣️\s*/, '')
  const badges = /^(?:(?:🆕|🎯)\s*)+/.exec(rest)?.[0] ?? ''
  rest = rest.slice(badges.length)
  const prov = /^\*?\([^)]*\bQ\d+[^)]*\)\*?\s*/.exec(rest)
  if (prov) rest = rest.slice(prov[0].length)
  const tag = /^\*?(\([A-Z]\))\*?\s*/.exec(rest)
  const body = (tag ? rest.slice(tag[0].length) : rest).trim().replace(/^["“”]+|["“”]+$/g, '').trim()
  return {
    number: Number(numbered[1]),
    marks,
    text: [badges.replace(/\s+/g, ''), tag?.[1], body].filter(Boolean).join(' '),
  }
}

/** `[[04-RAG/01-foundations/02-Naive RAG pipeline]]` → a readable label. No site route resolves yet. */
function parseVaultLinks(line) {
  return [...line.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => {
    const target = m[1].split('|')[0].trim()
    const leaf = target.split('/').pop() ?? target
    return { label: leaf.replace(/^\d+[a-z]?-/, '').replace(/-/g, ' ').trim(), target }
  })
}


// Vault h1s are shouty ("🧠 LLM FOUNDATIONS"). Split the emoji off and title-case the rest,
// preserving the acronyms, so cards and nav read as names rather than as headings.
const GAME_DAY_ACRONYMS = new Set(['LLM', 'RAG', 'MCP', 'NLP', 'ML', 'DL', 'AI', 'API', 'GIL'])

function prettifyTitle(raw) {
  const m = /^([^\p{Letter}\p{Number}]*)(.*)$/u.exec(raw.trim())
  const icon = (m?.[1] ?? '').trim()
  const words = (m?.[2] ?? raw).trim()
  const title = words
    .split(/(\s+|[&/()-])/)
    .map((w) => {
      if (!/\p{Letter}/u.test(w)) return w
      const bare = w.replace(/[^\p{Letter}]/gu, '')
      if (GAME_DAY_ACRONYMS.has(bare.toUpperCase()) && w === w.toUpperCase()) return bare.toUpperCase()
      if (/^FASTAPI$/i.test(bare)) return 'FastAPI'
      return w === w.toUpperCase() ? w.charAt(0) + w.slice(1).toLowerCase() : w
    })
    .join('')
  return { icon, title }
}

/**
 * `[[04-RAG/01-foundations/02-Naive RAG pipeline]]` → "Naive RAG pipeline".
 * Those notes aren't on the site yet, so the target becomes readable text rather than a dead link.
 */
const escapeHtml = (t) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const vaultRefSpan = (raw, resolve) => {
  const [target, alias] = String(raw).split('|')
  const leaf = alias ?? (target.split('/').pop() ?? target)
  const label = leaf.replace(/^\d+[a-z]?-/, '').replace(/\.md$/, '').trim()
  const href = resolve?.(target.trim())
  if (href) return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
  return `<span class="vault-ref" title="${escapeHtml(target.trim())}">${escapeHtml(label)}</span>`
}

/**
 * A wikilink whose alias holds Markdown (`[[x/42-tasks|`TaskGroup`]]`, `|__slots__`) is split by marked
 * into text + <code>/<strong> + text, so the DOM pass never sees it whole. Outside code fences, turn it
 * into a .md link before parsing; the `a[href$=".md"]` pass then routes it like any note link.
 */
function linkMarkdownAliases(md) {
  return md
    .split(/(^```[\s\S]*?^```)/m)
    .map((part, i) =>
      i % 2 ? part : part.replace(/\[\[([^\]|\\]+)\\?\|([^\]]*[`*_][^\]]*)\]\]/g, (_, target, alias) =>
        `[${alias}](${encodeURI(target.trim())}.md)`),
    )
    .join('')
}

function flattenVaultRefs(html) {
  return html.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => vaultRefSpan(raw))
}

/**
 * Same rewrite, but over the DOM so it skips code and diagrams.
 *
 * Mermaid uses `[[label]]` for a subroutine node, so a blind string replace turns a valid
 * diagram into a broken one. Run this after `promoteMermaidFences` and it never sees either.
 */
function flattenVaultRefsWithin($, body, resolve) {
  const SKIP = new Set(['pre', 'code', 'script', 'style'])
  const walk = (node) => {
    for (const child of $(node).contents().toArray()) {
      if (child.type === 'text') {
        const t = child.data ?? ''
        if (!t.includes('[[')) continue
        const html = t.replace(/(\[\[[^\]]+\]\])|([^[]+|\[)/g, (m, ref, lit) =>
          ref ? vaultRefSpan(ref.slice(2, -2), resolve) : escapeHtml(lit),
        )
        if (html !== t) $(child).replaceWith(html)
      } else if (child.type === 'tag' && !SKIP.has(child.name) && !$(child).hasClass('mermaid')) {
        walk(child)
      }
    }
  }
  walk(body)
}

/** Prose siblings of the recall grids: the runbook and the STAR story bank. */
const GAME_DAY_DOCS = [
  { slug: 'runbook', file: '00-index.md' },
  { slug: 'stories', file: '16-PROJECT-STORIES.md' },
]

async function ingestGameDayDocs() {
  const docs = []
  for (const { slug, file } of GAME_DAY_DOCS) {
    const md = await readFile(path.join(VAULT, GAME_DAY_DIR, file), 'utf8')
    const $ = cheerio.load(marked.parse(md, { gfm: true, mangle: false, headerIds: false }))
    const body = $('body')

    const { icon, title } = prettifyTitle(
      text(body.find('h1').first())
        .replace(/\s*—\s*(Interview Day Recall|Index & Runbook)\s*$/i, '')
        .trim(),
    )
    body.find('h1').first().remove()

    const lead = body.find('blockquote').first()
    rewriteLinks($, lead)
    const meta = lead
      .find('p')
      .toArray()
      .flatMap((p) => inner($(p)).split('\n'))
      .map((l) => l.trim())
      .filter(Boolean)
    lead.remove()

    rewriteLinks($, body)
    // Flatten wiki refs in the DOM *before* collecting headings, or the TOC keeps the `[[…]]`.
    body.html(flattenVaultRefs(inner(body)))
    const headings = collectHeadings($, body)
    docs.push({ slug, icon, title, meta: meta.map(flattenVaultRefs), headings, html: inner(body) })
    console.log(`  parsed ${file} (${headings.length} headings)`)
  }
  await write('game-day-docs.json', { docs })
  return docs
}

/*
 * Model answers: `02-Game-Day/model-answers/<recall-stem>/NN-slug.md`, one per question, linked from the
 * recall entry by `**🎤 Model answer:** [[…]]`. The format comes from the vault's
 * `meta_prompts/model_answer_prompt_v1.md`, so it's regular enough to read from the Markdown source:
 * a Spine line, 🎯/🪤 lead lines, and `<details><summary><b>…</b></summary> … </details>` blocks under
 * `## 🪜` (stages) and `## 🔁` (follow-ups). marked doesn't nest a details body reliably, so each body is
 * cut out here and rendered on its own.
 */
const MODEL_ANSWER_TYPES = {
  '🩺': 'diagnose', '🏗️': 'design', '⚖️': 'trade-off', '📖': 'concept', '📣': 'story',
  // Python edition (meta_prompts/python_model_answer_prompt_v1.md)
  '🔬': 'mechanism', '🐛': 'debug', '🧪': 'predict',
  // AI-systems edition (meta_prompts/ai_model_answer_prompt_v1.md)
  '🛡️': 'threat',
  // Real-time & voice pack (meta_prompts/voice_realtime_model_answer_prompt_v1.md)
  '🏛️': 'defend',
}

function mdToHtml(md) {
  const $ = cheerio.load(marked.parse(md.trim(), { gfm: true, mangle: false, headerIds: false }))
  const body = $('body')
  promoteMermaidFences($, body)
  promoteExperimentBlocks($, body)
  flattenVaultRefsWithin($, body)
  return inner(body)
}

/*
 * Experiment blocks (template §5, "one sub-block per experiment"): a paragraph that is only
 * `**Experiment N — Name.**`, then its what / **Why?** / *Best suited…* paragraphs and any lists.
 * Consecutive blocks become one `.exp-list` card with a tagged, titled section per experiment.
 * A block ends at the next experiment, a table, a heading, a rule, or a `**Why this matters:**` line.
 */
function promoteExperimentBlocks($, body) {
  const marker = (el) => {
    if (el.tagName !== 'p') return null
    const p = $(el)
    const only = p.children().length === 1 && p.children().first().is('strong') && text(p) === text(p.children().first())
    return only ? /^Experiment\s+(\d+)\s*[—–-]\s*(.+?)\.?$/.exec(text(p)) : null
  }
  const stops = (el) =>
    ['table', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure'].includes(el.tagName) ||
    (el.tagName === 'p' && /^Why this matters:/i.test(text($(el))))

  const nodes = body.children().toArray()
  let list = null
  for (let i = 0; i < nodes.length; i++) {
    const m = marker(nodes[i])
    if (!m) {
      if (stops(nodes[i])) list = null
      continue
    }
    if (!list) {
      list = $('<div class="exp-list"></div>')
      $(nodes[i]).before(list)
    }
    const section = $('<section class="exp"></section>')
    section.append($('<span class="exp-tag"></span>').text(`Experiment ${m[1]}`))
    section.append($('<h4 class="exp-title"></h4>').text(m[2]))
    $(nodes[i]).remove()
    while (i + 1 < nodes.length && !marker(nodes[i + 1]) && !stops(nodes[i + 1])) {
      const el = $(nodes[++i])
      // A paragraph that is only italics is the "best suited when" line: muted, not emphasised.
      if (el.is('p') && el.children().length === 1 && el.children().first().is('em') && text(el) === text(el.children().first())) {
        el.addClass('exp-best').html(el.children().first().html())
      }
      section.append(el)
    }
    list.append(section)
  }
}

const mdInline = (md) => flattenVaultRefs(marked.parseInline(md.trim()))

function parseModelAnswer(md) {
  const line = (re) => re.exec(md)?.[1]?.trim()
  // The header line is the blockquote right under the title; only ⭐ questions start with ⭐.
  const meta = line(/^# 🎤[^\n]*\n>\s*([^\n]*)$/m) ?? ''
  const type = Object.entries(MODEL_ANSWER_TYPES).find(([glyph]) => meta.includes(glyph))?.[1] ?? 'diagnose'

  const at = (marker) => {
    const i = md.indexOf(marker)
    return i === -1 ? md.length : i
  }
  const walkStart = at('## 🪜')
  const followStart = at('## 🔁')
  const dontStart = at("## 🚫 Don't say")

  const answer = {
    type,
    spine: (line(/^\*\*🧭 Spine:\*\*\s*(.*)$/m) ?? '').split(/\s+→\s+/).filter(Boolean),
    testing: mdInline(line(/^>\s*🎯\s*\*\*What they're testing:\*\*\s*(.*)$/m) ?? ''),
    trap: mdInline(line(/^>\s*🪤\s*\*\*The trap:\*\*\s*(.*)$/m) ?? ''),
    speakTime: line(/Time to speak:\s*([^·\n]+)/),
    spoken: '',
    stages: [],
    followUps: [],
    dontSay: [],
    links: parseVaultLinks(line(/^\*\*🔗 Depth:\*\*\s*(.*)$/m) ?? '').filter((l) => !/^\d+-[A-Z-]+$/.test(l.target)),
  }
  const warning = line(/^>\s*⚠️\s*\*\*Fill before use\.\*\*\s*(.*)$/m)
  if (warning) answer.warning = mdInline(warning)
  // 🗺️ Answer map (template v1.3): the Spine drawn as one diagram, always visible above the spoken answer.
  const map = /^## 🗺️[^\n]*\n([\s\S]*?)(?=\n<details>|\n## )/m.exec(md)?.[1]
  if (map?.trim()) answer.map = mdToHtml(map)

  for (const m of md.matchAll(/<details><summary>(.*?)<\/summary>\n([\s\S]*?)\n<\/details>/g)) {
    const summary = m[1]
    const title = summary.replace(/<code>.*?<\/code>/g, '').replace(/<\/?b>/g, '').trim()
    const html = mdToHtml(m[2])
    const pos = m.index ?? 0

    if (/🎤 The spoken answer/.test(title)) {
      answer.spoken = html
    } else if (pos > walkStart && pos < followStart) {
      // `N · Stage name — the claim`; the claim is required by the template but a missing one
      // must not drop the stage.
      const s = /^(\d+)\s*·\s*(.*?)(?:\s+—\s+(.*))?$/.exec(title)
      if (s) answer.stages.push({ number: Number(s[1]), name: s[2], claim: s[3] ? mdInline(s[3]) : '', html })
      else console.warn(`  ⚠ ${chartSource}: stage heading not parsed: ${title}`)
    } else if (pos > followStart && pos < dontStart) {
      const f = /^F(\d+)\s*·\s*(.*)$/.exec(title)
      const tag = /<code>(\w+)<\/code>/.exec(summary)?.[1]
      if (f) answer.followUps.push({ number: Number(f[1]), question: mdInline(f[2]), tag: tag ?? 'probe', html })
    }
  }

  const dont = md.slice(dontStart, at('**🔗 Depth:**'))
  answer.dontSay = [...dont.matchAll(/^-\s+(.*)$/gm)].map((d) => mdInline(d[1]))
  return answer
}

async function ingestGameDay() {
  const topics = []

  for (const file of GAME_DAY_FILES) {
    const md = await readFile(path.join(VAULT, GAME_DAY_DIR, file), 'utf8')
    const $ = cheerio.load(marked.parse(md, { gfm: true, mangle: false, headerIds: false }))
    const body = $('body')

    const { icon, title } = prettifyTitle(
      text(body.find('h1').first()).replace(/\s*—\s*Interview Day Recall\s*$/i, ''),
    )
    const lead = body.find('blockquote').first()
    const meta = lead
      .find('p')
      .toArray()
      .flatMap((p) => inner($(p)).split('\n'))
      .map((l) => l.trim())
      .filter(Boolean)

    const number = Number(/^(\d+)/.exec(file)?.[1] ?? 0)
    const slug = slugify(file.replace(/^\d+-/, '').replace(/\.md$/, ''))

    const bands = []
    let band = null
    let question = null

    body.children().each((_, node) => {
      const el = $(node)
      const tag = (node.tagName ?? '').toLowerCase()

      if (tag === 'h2') {
        const { letter, name } = parseBandHeading(text(el))
        band = { id: `${slug}-${letter ? letter.toLowerCase() : slugify(name)}`, letter, name, questions: [] }
        bands.push(band)
        question = null
        return
      }

      if (tag === 'h6') {
        const parsed = parseQuestionHeading(text(el))
        if (!parsed || !band) return
        question = { id: `${slug}-q${parsed.number}`, ...parsed, points: [], links: [], blocks: [] }
        band.questions.push(question)
        return
      }

      if (!question) return

      // A question owns everything up to the next heading: a badge blockquote, the recall
      // <details>, and — where a phrasing drill was folded in — a Hint and a Recall-points block.
      if (tag === 'blockquote') {
        question.badge = text(el).replace(/^[^\p{Letter}\p{Number}]+/u, '').trim() || undefined
      } else if (tag === 'p' && /Phrasing drill/i.test(text(el))) {
        question.drillPrompt = text(el).replace(/^.*?Phrasing drill\s*—?\s*/i, '').trim()
      } else if (tag === 'p' && /Model answer:/.test(text(el))) {
        // A question whose recall blocks were retired for a model answer carries just this link.
        question.modelAnswerTarget = parseVaultLinks(text(el))[0]?.target
      } else if ((tag === 'pre' || tag === 'ul' || tag === 'ol') && !question.modelAnswerTarget && !question.blocks.length) {
        // Snippet questions ("What renders after one click?") carry their code and A–D options
        // between the heading and the answer; they're part of the question, shown before expanding.
        question.prompt = (question.prompt ?? '') + $.html(el)
      } else if (tag === 'details') {
        question.blocks.push(el)
      }
    })

    // Fold each question's <details> blocks into one answer shape.
    for (const b of bands) {
      for (const q of b.questions) {
        const blocks = q.blocks
        delete q.blocks
        const find = (re) => blocks.find((el) => re.test(text(el.find('> summary').first())))
        const recall = blocks.find((el) => text(el.find('> summary').first()).trim() === '🔑')
        const hint = find(/Hint/i)
        const points = find(/Recall points/i)

        const readBlock = (el) => {
          if (!el) return null
          const out = {
            points: el.find('> ul > li').toArray().map((li) => inner($(li))),
            links: [],
          }
          for (const para of el.find('> p').toArray()) {
            for (const line of ($(para).html() ?? '').split('\n')) {
              const m = /^<strong>(?:<b>)?([^<]+)(?:<\/b>)?<\/strong>\s*(.*)$/.exec(line.trim())
              if (!m) continue
              const [, key, value] = m
              if (/^Flow/i.test(key)) out.flow = value.trim()
              else if (/^Trap/i.test(key)) out.trap = value.trim()
              else if (/^One-liner/i.test(key)) out.oneLiner = value.trim().replace(/^["“”]+|["“”]+$/g, '')
              else if (/^Follow-up/i.test(key)) out.followUp = value.trim()
              else if (/Model answer/i.test(key)) out.modelAnswer = parseVaultLinks(value)[0]?.target
              else if (key.includes('→') || /^Note/i.test(key)) out.links.push(...parseVaultLinks(value))
            }
          }
          return out
        }

        // Primary answer: the 🔑 recall block, or the drill's recall points when that is all there is.
        const primary = readBlock(recall) ?? readBlock(points)
        if (primary) {
          q.points = primary.points
          q.links = primary.links
          if (primary.flow) q.flow = primary.flow
          if (primary.trap) q.trap = primary.trap
          if (primary.oneLiner) q.oneLiner = primary.oneLiner
          if (primary.modelAnswer) q.modelAnswerTarget = primary.modelAnswer
        }

        // A drill only survives separately when it sits alongside a real recall block.
        if (recall && points) {
          const d = readBlock(points)
          q.drill = {
            prompt: q.drillPrompt,
            badge: q.badge,
            hint: hint ? text(hint).replace(/^💡\s*Hint\s*/i, '').trim() : undefined,
            points: d.points,
            oneLiner: d.oneLiner,
            followUp: d.followUp,
            links: d.links,
          }
        }
        delete q.drillPrompt
      }
    }

    // "Merged from jbtiq_ml.md — 19 Sep 2026" is vault bookkeeping, not something to read on the
    // day. Those questions are part of the topic: fold every such band into one neutral group.
    // "Added from the Aug 2026 trend scan — 24 Aug" says something useful; keep it, but say it plainly.
    for (const b of bands) {
      const scan = /^Added from the (\w+ \d{4}) trend scan/i.exec(b.name)
      if (scan) {
        b.name = `Trend scan — ${scan[1]}`
        b.id = `${slug}-trend-scan`
      }
    }

    const isProvenance = (b) => /^Merged from/i.test(b.name)
    const merged = bands.filter(isProvenance)
    if (merged.length > 0) {
      const first = merged[0]
      first.name = 'More questions'
      first.id = `${slug}-more`
      first.questions = merged.flatMap((b) => b.questions)
      for (const extra of merged.slice(1)) extra.questions = []
    }

    const withQuestions = bands.filter((b) => b.questions.length > 0)
    const count = withQuestions.reduce((n, b) => n + b.questions.length, 0)

    // Full model answers go in their own lazily-loaded file; the topic keeps only what the card
    // shows before one is opened.
    const answers = {}
    for (const q of withQuestions.flatMap((b) => b.questions)) {
      const target = q.modelAnswerTarget
      delete q.modelAnswerTarget
      if (!target) continue
      try {
        chartSource = `${target}.md`
        const answer = parseModelAnswer(await readFile(path.join(VAULT, GAME_DAY_DIR, `${target}.md`), 'utf8'))
        answers[q.id] = answer
        q.modelAnswer = { type: answer.type, spine: answer.spine }
      } catch (err) {
        console.warn(`  ⚠ ${file} Q${q.number}: model answer ${target} not readable (${err.code ?? err.message})`)
      }
    }
    const answerCount = Object.keys(answers).length
    if (answerCount > 0) {
      await write(`model-answers-${slug}.json`, answers)
      console.log(`  parsed ${answerCount} model answers for ${file}`)
    }
    topics.push({ slug, number, icon, title, meta, bands: withQuestions })
    console.log(`  parsed ${file} → ${count} questions in ${withQuestions.length} bands`)
  }

  for (const topic of topics) await write(`game-day-${topic.slug}.json`, topic)

  // Question text is ~76 KB — too much for manifest.json, which ships in the main bundle.
  // It lives in its own file, loaded lazily by global search.
  await write(
    'game-day-search.json',
    topics.flatMap((t) =>
      t.bands.flatMap((b) =>
        b.questions.map((q) => ({ id: q.id, text: q.text, topic: t.slug, topicTitle: t.title, band: b.letter ?? b.name })),
      ),
    ),
  )
  const docs = await ingestGameDayDocs()
  return { topics, docs }
}

/* ---------------- Agentic design decisions (06-ai-systems/agentic-design) ---------------- */

const AGENTIC_DIR = '01-System Design/06-ai-systems/agentic-design'
const numericSort = (a, b) =>
  (Number(/^(\d+)/.exec(a)?.[1] ?? 0) - Number(/^(\d+)/.exec(b)?.[1] ?? 0)) || a.localeCompare(b)
const agenticSlug = (name) => slugify(name.replace(/\.md$/, '').replace(/^\d+[a-z]?-/, ''))
const AGENTIC_ROUTE = '/system-design/agentic-design'

const AGENTIC_SECTIONS = {
  '01-framing': 'Framing the round',
  '02-reference-architecture': 'Reference architecture',
  '03-control-flow': 'Control flow & orchestration',
  '04-tool-layer': 'Tool layer design',
  '05-memory-state': 'Memory, state & context',
  '06-multi-agent': 'Multi-agent topology',
  '07-durable-execution': 'Durable execution',
  '08-reliability': 'Reliability engineering',
  '09-latency': 'Latency & streaming',
  '10-cost': 'Cost modelling & optimisation',
  '11-safety-security': 'Safety, security & governance',
  '12-eval-observability': 'Evaluation & observability',
  '13-deployment': 'Deployment, versioning & scaling',
  '14-canonical-problems': 'Canonical design problems',
  '15-architect-lens': 'Architect lens',
}

/**
 * The metadata blockquote, read as text. Two shapes:
 * labelled — `Category: … · Round Relevance: High · Depth Tier: CORE · Created: …`
 * positional (Python v5 notes) — `CORE · Senior · Language Fundamentals … · Created 20 Sep 2026 · Revised …`
 */
function parseDecisionMeta(blockquoteText) {
  const fields = {}
  for (const part of blockquoteText.split('·')) {
    const m = /^\s*([^:]+):\s*(.+?)\s*$/.exec(part)
    if (m) {
      fields[m[1].trim().toLowerCase()] = m[2].trim()
      continue
    }
    const p = part.trim()
    if (/^(CORE|SUPPORTING|BREADTH)$/i.test(p)) fields['depth tier'] = p
    else if (/^(Senior|Architect|Staff)$/i.test(p)) fields['seniority relevance'] = p
    else if (/^Created\s+/i.test(p)) fields['created'] = p.replace(/^Created\s+/i, '')
    else if (p && !/^Revised\s+/i.test(p) && !fields['category']) fields['category'] = p
  }
  return {
    category: fields['category'],
    relevance:
      fields['round relevance'] ?? fields['architect relevance'] ?? fields['seniority relevance'],
    tier: (fields['depth tier'] ?? '').toUpperCase(),
    created: fields['created'],
  }
}

/**
 * `marked` turns a ```mermaid fence into `<pre><code class="language-mermaid">`, which renders
 * as source. The site draws diagrams from `.mermaid` inside a `figure`, so promote them.
 */
function promoteMermaidFences($, body) {
  body.find('pre > code.language-mermaid').each((_, node) => {
    const code = $(node)
    const figure = $('<figure></figure>').append($('<div class="mermaid"></div>').text(code.text()))
    code.parent().replaceWith(figure)
  })
  promoteChartFences($, body)
}

/*
 * ```chart fences: a small, library-neutral chart spec written in the vault as YAML (see
 * `ChartSpec` in src/content/types.ts). Validated here so a typo fails the ingest instead of
 * rendering a broken chart; the site draws it with Observable Plot (src/lib/chart.ts).
 */
const CHART_TONES = new Set(['primary', 'warn', 'bad', 'ok', 'muted', 'accent'])
const CHART_ANNOTATIONS = new Set(['band', 'vline', 'hline', 'gap', 'point', 'region'])

function validateChart(spec, where) {
  const fail = (msg) => {
    throw new Error(`chart in ${where}: ${msg}`)
  }
  const isNum = (n) => typeof n === 'number' && Number.isFinite(n)
  const isPair = (p) => Array.isArray(p) && p.length === 2 && isNum(p[0]) && isNum(p[1])
  if (!spec || typeof spec !== 'object') fail('not a mapping')
  if (!['line', 'bar'].includes(spec.type)) fail(`type must be line or bar, got ${spec.type}`)
  for (const axis of ['x', 'y']) {
    const a = spec[axis] ?? {}
    if (a.domain && !isPair(a.domain)) fail(`${axis}.domain must be [min, max]`)
    if (a.scale && !['linear', 'log'].includes(a.scale)) fail(`${axis}.scale must be linear or log`)
    if (a.scale === 'log' && a.domain && a.domain[0] <= 0) fail(`${axis}.domain must be > 0 on a log scale`)
  }
  const tone = (t, at) => {
    if (t !== undefined && !CHART_TONES.has(t)) fail(`${at}: unknown tone "${t}" (use ${[...CHART_TONES].join(', ')})`)
  }

  if (spec.type === 'bar') {
    if (!Array.isArray(spec.bars) || spec.bars.length === 0) fail('bar chart needs bars: [{ label, value }]')
    spec.bars.forEach((b, i) => {
      if (typeof b.label !== 'string' || !isNum(b.value)) fail(`bars[${i}] needs a string label and a number value`)
      tone(b.tone, `bars[${i}]`)
    })
  } else {
    if (!Array.isArray(spec.series) || spec.series.length === 0) fail('line chart needs series')
    spec.series.forEach((s, i) => {
      if (typeof s.name !== 'string') fail(`series[${i}] needs a name`)
      if (!Array.isArray(s.points) || s.points.length < 2 || !s.points.every(isPair)) fail(`series "${s.name}" needs ≥2 [x, y] points`)
      tone(s.tone, `series "${s.name}"`)
    })
  }
  if (spec.type === 'bar' && (spec.annotations ?? []).some((a) => a.kind !== 'hline'))
    fail('bar charts only take hline annotations')
  const names = new Set((spec.series ?? []).map((s) => s.name))
  for (const [i, a] of (spec.annotations ?? []).entries()) {
    if (!CHART_ANNOTATIONS.has(a.kind)) fail(`annotations[${i}]: unknown kind "${a.kind}"`)
    tone(a.tone, `annotations[${i}]`)
    if (a.between) {
      if (!Array.isArray(a.between) || a.between.length !== 2 || !a.between.every((n) => names.has(n)))
        fail(`annotations[${i}].between must name two series (${[...names].join(', ')})`)
    }
    if ((a.kind === 'band' || a.kind === 'gap') && !a.between) fail(`annotations[${i}] (${a.kind}) needs between`)
    if ((a.kind === 'vline' || a.kind === 'gap') && !isNum(a.x)) fail(`annotations[${i}] (${a.kind}) needs x`)
    if (a.kind === 'hline' && !isNum(a.y)) fail(`annotations[${i}] (hline) needs y`)
    if (a.kind === 'point' && !(isNum(a.x) && isNum(a.y))) fail(`annotations[${i}] (point) needs x and y`)
    if (a.kind === 'region' && !(isNum(a.from) && isNum(a.to))) fail(`annotations[${i}] (region) needs from and to`)
  }
  return spec
}

/** Where the chart came from, for error messages; set by callers that know the file. */
let chartSource = 'vault'

function promoteChartFences($, body) {
  body.find('pre > code.language-chart').each((_, node) => {
    const code = $(node)
    let spec
    try {
      spec = parseYaml(code.text())
    } catch (err) {
      throw new Error(`chart in ${chartSource}: invalid YAML — ${err.message}`)
    }
    validateChart(spec, chartSource)
    const figure = $('<figure class="chart-fig"></figure>')
    figure.append($('<div class="vault-chart"></div>').attr('data-spec', JSON.stringify(spec)))
    if (spec.caption) figure.append($('<figcaption></figcaption>').text(spec.caption))
    code.parent().replaceWith(figure)
  })
}

/* ---------------- Networking (01-System Design/01-Networking) ---------------- */

const NETWORKING_DIR = '01-System Design/01-Networking'
const NETWORKING_ROUTE = '/system-design/networking'
const NETWORKING_CHAPTERS = {
  '01-mental-models': 'Mental models',
  '02-ip-packets-routing': 'IP, packets & routing',
  '03-tcp-udp': 'TCP & UDP',
  '04-dns': 'DNS',
  '05-tls': 'TLS',
  '06-http-versions': 'HTTP versions',
  '07-http-semantics': 'HTTP semantics',
  '08-realtime-streaming': 'Real-time & streaming',
  '09-webrtc': 'WebRTC',
  '10-api-protocols': 'API protocols',
  '11-proxies-load-balancers': 'Proxies & load balancers',
  '12-cloud-networking': 'Cloud networking',
  '13-kubernetes-networking': 'Kubernetes networking',
  '14-performance-reliability': 'Performance & reliability',
  '15-observability-debugging': 'Observability & debugging',
  '16-ai-networking': 'Networking for AI systems',
}

/** A vault series is one folder of chapters, each holding notes that share a header prefix. */
async function ingestNoteSeries({ dir, chapters, route, header, prefix, mapHeader }) {
  const { readdir } = await import('node:fs/promises')
  const headerRe = new RegExp(`^# ${header}: `)
  const stripRe = new RegExp(`^${header}:\\s*`, 'i')
  const parsed = []

  for (const [chapterDir, chapterTitle] of Object.entries(chapters)) {
    const abs = path.join(VAULT, dir, chapterDir)
    let files
    try {
      files = (await readdir(abs)).filter((f) => f.endsWith('.md') && f !== 'README.md').sort(numericSort)
    } catch {
      console.log(`  skipped ${chapterDir} (not present)`)
      continue
    }

    for (const file of files) {
      const raw = await readFile(path.join(abs, file), 'utf8')
      // A chapter's `00-chapter-map.md` (concept map, reading order, decision tree) becomes the
      // chapter's first page, rendered and link-resolved like any note.
      if (mapHeader && file === '00-chapter-map.md' && raw.startsWith(`# ${mapHeader}: `)) {
        const $ = cheerio.load(marked.parse(linkMarkdownAliases(raw), { gfm: true, mangle: false, headerIds: false }))
        const body = $('body')
        body.find('h1').first().remove()
        body.find('blockquote').first().remove()
        parsed.push({
          $, body, dir: chapterDir, chapterTitle,
          slug: `${chapterDir.replace(/^\d+-/, '')}-map`, stem: '00-chapter-map', number: -1,
          title: `Chapter map: ${chapterTitle}`, tier: 'MAP', category: 'Concept map & reading order',
        })
        continue
      }
      // A `breadth.md` carries several notes at once; every other file carries exactly one.
      const split = raw.split(new RegExp(`(?=${headerRe.source})`, 'm')).filter((x) => headerRe.test(x))
      const notes = split.length > 0 ? split : []

      for (const md of notes) {
        chartSource = `${chapterDir}/${file}`
        const $ = cheerio.load(marked.parse(linkMarkdownAliases(md), { gfm: true, mangle: false, headerIds: false }))
        const body = $('body')

        const title = text(body.find('h1').first()).replace(stripRe, '')
        body.find('h1').first().remove()

        const lead = body.find('blockquote').first()
        const meta = parseDecisionMeta(text(lead))
        lead.remove()

        // Order by the metadata's item number where there is one, else by the filename.
        const item = Number(/\(Item\s+(\d+)\)/.exec(meta.category ?? '')?.[1] ?? 0)
        // `04a-…` sorts after `04-…`: a letter suffix adds a tenth per letter (a = .1, b = .2).
        const fileNo = Number(/^(\d+)/.exec(file)?.[1] ?? 0) + ((/^\d+([a-z])-/.exec(file)?.[1]?.charCodeAt(0) ?? 96) - 96) / 10
        // A note's own file gives it a short, hand-chosen URL. A shared file (breadth.md) names
        // no single note, so those take the title — including when it currently holds just one.
        const shared = /^breadth\./.test(file)
        const slug = shared ? slugify(title) : agenticSlug(file)
        parsed.push({ $, body, dir: chapterDir, chapterTitle, slug, stem: file.replace(/\.md$/, ''), number: item || fileNo, title, ...meta })
      }
    }
  }

  // Two chapters can hold the same filename; the later one takes the chapter as a prefix so
  // every note keeps a stable, unique URL.
  const seen = new Set()
  for (const n of parsed) {
    if (seen.has(n.slug)) n.slug = `${n.dir.replace(/^\d+-/, '')}-${n.slug}`
    seen.add(n.slug)
  }
  const dupes = parsed.map((n) => n.slug).filter((x, i, a) => a.indexOf(x) !== i)
  if (dupes.length > 0) throw new Error(`Duplicate ${prefix} slugs: ${[...new Set(dupes)].join(', ')}`)

  const published = new Set(parsed.map((n) => n.slug))
  const byFile = new Map(parsed.map((n) => [`${n.dir}/${n.number}`, n.slug]))
  // Exact file stems first: `04-…` and `04a-…` share a number, so the number alone can pick the wrong note.
  const byStem = new Map(parsed.map((n) => [`${n.dir}/${n.stem}`, n.slug]))
  const resolveNote = (ref, fromDir) => {
    const leaf = decodeURIComponent(ref.split('/').pop() ?? '').replace(/\.md$/, '').trim()
    const dir = /(?:^|\/)(\d{2}-[a-z-]+)\/[^/]*$/.exec(ref)?.[1] ?? fromDir
    const n = /^(\d+)[a-z]?-/.exec(leaf)
    const slug = byStem.get(`${dir}/${leaf}`) ?? (n ? byFile.get(`${dir}/${Number(n[1])}`) : undefined)
    return slug && published.has(slug) ? slug : null
  }
  const out = []

  for (const note of parsed) {
    const { $, body } = note
    // Links to another note in this series become site routes; anything else flattens to text.
    body.find('a[href$=".md"]').each((_, node) => {
      const a = $(node)
      const target = resolveNote(a.attr('href') ?? '', note.dir)
      if (target) a.attr('href', `${route}/${target}`)
    })
    rewriteLinks($, body)
    promoteMermaidFences($, body)
    // Wikilinks to a published note in this series (`[[03-iterators-…/15-generators…|generators]]`) become routes too.
    flattenVaultRefsWithin($, body, (target) => {
      const slug = resolveNote(target, note.dir)
      return slug ? `${route}/${slug}` : null
    })

    const chapter = out.find((c) => c.id === note.dir) ?? { id: note.dir, title: note.chapterTitle, notes: [] }
    if (!out.includes(chapter)) out.push(chapter)
    chapter.notes.push({
      slug: note.slug,
      number: note.number,
      title: note.title,
      category: note.category,
      relevance: note.relevance,
      tier: note.tier,
      created: note.created,
      section: note.dir,
      sectionTitle: note.chapterTitle,
      headings: collectHeadings($, body),
      html: inner(body),
    })
  }

  for (const chapter of out) {
    chapter.notes.sort((a, b) => a.number - b.number)
    await write(`${prefix}-${chapter.id.replace(/^\d+-/, '')}.json`, chapter)
    console.log(`  parsed ${chapter.id} → ${chapter.notes.length} ${prefix} notes`)
  }
  return out
}

const ingestNetworking = () =>
  ingestNoteSeries({
    dir: NETWORKING_DIR,
    chapters: NETWORKING_CHAPTERS,
    route: NETWORKING_ROUTE,
    header: 'Networking Topic',
    prefix: 'networking',
  })

/* ---------------- Python (07-python) ---------------- */

const PYTHON_DIR = '07-python'
const PYTHON_ROUTE = '/python'
const PYTHON_CHAPTERS = {
  '01-data-model-object-semantics': 'Data model & object semantics',
  '02-functions-scope-closures': 'Functions, scope & closures',
  '03-iterators-generators-comprehensions': 'Iterators, generators & comprehensions',
  '04-cpython-object-internals': 'CPython object internals',
  '05-memory-management-gc': 'Memory management & GC',
  '06-concurrency-gil': 'Concurrency & the GIL',
  '07-async-io': 'Async I/O',
  '08-typing-interfaces': 'Typing & interfaces',
  '09-idiomatic-structural': 'Idiomatic & structural',
  '10-performance-profiling': 'Performance & profiling',
  '11-packaging-environments-tooling': 'Packaging, environments & tooling',
  '12-stdlib-systems': 'Stdlib & systems',
  '13-production-services': 'Production services',
  '14-applied-adjacent': 'Applied & adjacent',
  '15-oop-design': 'OOP design',
}

const ingestPython = () =>
  ingestNoteSeries({
    dir: PYTHON_DIR,
    chapters: PYTHON_CHAPTERS,
    route: PYTHON_ROUTE,
    header: 'Python Topic',
    prefix: 'python',
    mapHeader: 'Chapter Map',
  })

async function ingestAgenticDecisions() {
  const { readdir } = await import('node:fs/promises')
  const parsed = []

  // Pass 1 — parse every note, so pass 2 knows which slugs the series actually publishes.
  for (const [dir, sectionTitle] of Object.entries(AGENTIC_SECTIONS)) {
    const abs = path.join(VAULT, AGENTIC_DIR, dir)
    let files
    try {
      files = (await readdir(abs)).filter((f) => f.endsWith('.md')).sort()
    } catch {
      console.log(`  skipped ${dir} (not present)`)
      continue
    }

    for (const file of files) {
      const md = await readFile(path.join(abs, file), 'utf8')
      const $ = cheerio.load(marked.parse(md, { gfm: true, mangle: false, headerIds: false }))
      const body = $('body')

      const rawTitle = text(body.find('h1').first())
      body.find('h1').first().remove()

      const lead = body.find('blockquote').first()
      const meta = parseDecisionMeta(text(lead))
      lead.remove()

      parsed.push({
        $,
        body,
        dir,
        sectionTitle,
        slug: agenticSlug(file),
        number: Number(/^(\d+)/.exec(file)?.[1] ?? 0),
        title: rawTitle.replace(/^Design (?:Decision|Problem):\s*/i, ''),
        ...meta,
      })
    }
  }

  const published = new Set(parsed.map((n) => n.slug))
  const sections = []

  // Pass 2 — links to other decision notes become site routes; links to anything else
  // (prompt files, concept notes) fall through to rewriteLinks and flatten to plain text.
  for (const note of parsed) {
    const { $, body } = note
    body.find('a[href$=".md"]').each((_, node) => {
      const a = $(node)
      const m = /(?:^|\/)([^/]+)\.md$/.exec(a.attr('href') ?? '')
      const slug = m && agenticSlug(m[1])
      if (slug && published.has(slug)) a.attr('href', `${AGENTIC_ROUTE}/${slug}`)
    })
    rewriteLinks($, body)
    promoteMermaidFences($, body)
    flattenVaultRefsWithin($, body)

    const section = sections.find((s) => s.id === note.dir) ?? { id: note.dir, title: note.sectionTitle, notes: [] }
    if (!sections.includes(section)) sections.push(section)
    section.notes.push({
      slug: note.slug,
      number: note.number,
      title: note.title,
      category: note.category,
      relevance: note.relevance,
      tier: note.tier,
      created: note.created,
      section: note.dir,
      sectionTitle: note.sectionTitle,
      headings: collectHeadings($, body),
      html: inner(body),
    })
  }

  for (const section of sections) {
    await write(`agentic-${section.id.replace(/^\d+-/, '')}.json`, section)
    console.log(`  parsed ${section.id} → ${section.notes.length} decision notes`)
  }
  return sections
}

/* ---------------- Manifest (nav + search, kept small for the main bundle) ---------------- */

async function writeManifest(dsa, caseStudies, webrtc, utils, aiSystems, gameDay, agentic, networking, python, practice) {
  const practiceProblems = practice.families.flatMap((f) => f.groups.flatMap((g) => g.problems))
  await write('manifest.json', {
    dsaPractice: { total: practiceProblems.length, l1: practiceProblems.filter((p) => p.l1).length },
    dsa: {
      patterns: dsa.families.flatMap((f) =>
        f.patterns.map((p) => ({ id: p.id, name: p.name, family: f.name, count: p.problems.length })),
      ),
      problems: dsa.families.flatMap((f) =>
        f.patterns.flatMap((p) =>
          p.problems.map((q) => ({ id: q.id, title: q.title, pattern: p.name, difficulty: q.difficulty })),
        ),
      ),
    },
    caseStudies: caseStudies.studies.map(({ html: _html, headings, ...rest }) => ({
      ...rest,
      headings: headings.filter((h) => h.level === 2),
    })),
    webrtc: webrtc.cards.map((c) => ({ id: c.id, number: c.number, title: c.title, topic: c.topic })),
    aiSystems: aiSystems.docs.map(({ html: _html, ...doc }) => ({
      ...doc,
      headings: doc.headings.filter((h) => h.level === 2),
    })),
    gameDay: gameDay.topics.map((t) => ({
      slug: t.slug,
      number: t.number,
      icon: t.icon,
      title: t.title,
      count: t.bands.reduce((n, b) => n + b.questions.length, 0),
      bands: t.bands.map((b) => ({ id: b.id, letter: b.letter, name: b.name, count: b.questions.length })),
    })),
    agenticDecisions: agentic.flatMap((sec) =>
      sec.notes.map((n) => ({
        slug: n.slug,
        title: n.title,
        tier: n.tier,
        relevance: n.relevance,
        section: sec.id,
        sectionTitle: sec.title,
      })),
    ),
    networking: networking.flatMap((ch) =>
      ch.notes.map((n) => ({
        slug: n.slug,
        title: n.title,
        tier: n.tier,
        relevance: n.relevance,
        section: ch.id,
        sectionTitle: ch.title,
      })),
    ),
    python: python.flatMap((ch) =>
      ch.notes.map((n) => ({
        slug: n.slug,
        title: n.title,
        tier: n.tier,
        relevance: n.relevance,
        section: ch.id,
        sectionTitle: ch.title,
      })),
    ),
    gameDayDocs: gameDay.docs.map(({ html: _html, ...d }) => ({
      ...d,
      headings: d.headings.filter((h) => h.level === 2),
    })),
    dsaUtils: utils.flatMap((u) =>
      u.sections.flatMap((s) =>
        s.helpers.filter((h) => h.id).map((h) => ({ lang: u.lang, id: h.id, name: h.name, section: s.title })),
      ),
    ),
  })
}

await mkdir(OUT, { recursive: true })
console.log(`Vault: ${VAULT}`)
const utils = []
for (const u of UTILS) utils.push(await ingestUtils(u))
const agentic = await ingestAgenticDecisions()
const networking = await ingestNetworking()
const python = await ingestPython()
const dsa = await ingestColdRecall()
await writeManifest(
  dsa,
  await ingestCaseStudies(),
  await ingestWebRtc(),
  utils,
  await ingestAiSystems(agentic),
  await ingestGameDay(),
  agentic,
  networking,
  python,
  await ingestPractice(dsa),
)

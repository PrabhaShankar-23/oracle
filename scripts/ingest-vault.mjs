// Pulls pages from the AlgoHandbook vault into src/content/generated/*.json.
// Run: npm run ingest            (uses the default vault path below)
//      VAULT_DIR=/path npm run ingest
import * as cheerio from 'cheerio'
import { marked } from 'marked'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
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

async function write(name, data) {
  await writeFile(path.join(OUT, name), JSON.stringify(data, null, 2) + '\n')
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
  const $ = await load('04-DSA-V2/00-index/dsa-cold-recall.html')
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
  const $ = await load(`04-DSA-V2/00-index/${file}`)
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
  return {
    number: Number(numbered[1]),
    marks,
    text: rest.trim().replace(/^["“”]+|["“”]+$/g, '').trim(),
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
function flattenVaultRefs(html) {
  return html.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
    const [target, alias] = String(raw).split('|')
    const leaf = alias ?? (target.split('/').pop() ?? target)
    const label = leaf.replace(/^\d+[a-z]?-/, '').replace(/\.md$/, '').trim()
    return `<span class="vault-ref" title="${target.trim()}">${label}</span>`
  })
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
}

/** The metadata blockquote, read as text: `Category: … · Round Relevance: High · Depth Tier: CORE · Created: …` */
function parseDecisionMeta(blockquoteText) {
  const fields = {}
  for (const part of blockquoteText.split('·')) {
    const m = /^\s*([^:]+):\s*(.+?)\s*$/.exec(part)
    if (m) fields[m[1].trim().toLowerCase()] = m[2].trim()
  }
  return {
    category: fields['category'],
    relevance: fields['round relevance'],
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
}

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
        title: rawTitle.replace(/^Design Decision:\s*/i, ''),
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
    body.html(flattenVaultRefs(inner(body)))
    promoteMermaidFences($, body)

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

async function writeManifest(dsa, caseStudies, webrtc, utils, aiSystems, gameDay, agentic) {
  await write('manifest.json', {
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
await writeManifest(
  await ingestColdRecall(),
  await ingestCaseStudies(),
  await ingestWebRtc(),
  utils,
  await ingestAiSystems(agentic),
  await ingestGameDay(),
  agentic,
)

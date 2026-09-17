// Pulls pages from the AlgoHandbook vault into src/content/generated/*.json.
// Run: npm run ingest            (uses the default vault path below)
//      VAULT_DIR=/path npm run ingest
import * as cheerio from 'cheerio'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

const VAULT =
  process.env.VAULT_DIR ??
  path.join(homedir(), 'Desktop/java/Spring Boot/AlgoHandbook')
const OUT = path.resolve(import.meta.dirname, '../src/content/generated')

const CASE_STUDIES_DIR = '01-System Design/07-Design-problems/html'
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
        code: card.find('pre').text() || undefined,
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

/* ---------------- Manifest (nav + search, kept small for the main bundle) ---------------- */

async function writeManifest(dsa, caseStudies, webrtc, utils) {
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
await writeManifest(await ingestColdRecall(), await ingestCaseStudies(), await ingestWebRtc(), utils)

import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import lua from 'highlight.js/lib/languages/lua'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import yaml from 'highlight.js/lib/languages/yaml'

// Only the languages the notes use — the full bundle is ~1 MB.
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('lua', lua)
hljs.registerLanguage('python', python)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('yaml', yaml)

export function highlightWithin(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('pre code[class*="language-"]').forEach((el) => {
    if (el.dataset.highlighted) return
    const lang = /language-(\w+)/.exec(el.className)?.[1]
    if (lang && hljs.getLanguage(lang)) hljs.highlightElement(el)
  })
}

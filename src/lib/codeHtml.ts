const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A `<pre><code>` block for `HtmlContent`, which adds highlighting and a copy button. */
export const codeBlockHtml = (code: string, lang: string) =>
  `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`

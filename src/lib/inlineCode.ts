/** Escapes plain text and turns `backticks` into <code>, for the short authored strings in the walkthroughs. */
export function inlineCodeHtml(text: string): string {
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return esc.replace(/`([^`]+)`/g, '<code>$1</code>')
}

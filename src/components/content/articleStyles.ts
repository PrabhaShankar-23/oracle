import type { SxProps, Theme } from '@mui/material/styles'
import { FONT_MONO } from '../../theme/theme'

/** Typography and component styles for vault HTML, expressed in theme tokens. */
export const articleStyles: SxProps<Theme> = (t) => {
  const v = t.vars.palette
  const tone = (color: string, container: string) => ({
    borderLeftColor: color,
    backgroundColor: container,
    '& .label': { color },
  })

  return {
    minWidth: 0,
    color: v.text.primary,
    ...t.typography.body1,
    overflowWrap: 'anywhere',

    '& h2': {
      ...t.typography.h4,
      mt: 6,
      mb: 2,
      pt: 1,
      borderTop: `1px solid ${v.divider}`,
    },
    '& > h2:first-of-type': { mt: 2, borderTop: 0 },
    '& h3': { ...t.typography.h6, mt: 4, mb: 1.5 },
    '& h4': { ...t.typography.subtitle1, mt: 3, mb: 1 },
    '& p': { my: 1.5 },
    '& ul, & ol': { pl: 3, my: 1.5 },
    '& li': { my: 0.5 },
    '& li > p': { my: 0.5 },
    '& hr': { border: 0, borderTop: `1px solid ${v.divider}`, my: 4 },
    '& a': { color: v.primary.main, textUnderlineOffset: '3px', textDecorationThickness: '1px' },
    '& strong, & b': { fontWeight: 600 },
    '& img': { maxWidth: '100%', height: 'auto' },
    '& blockquote': {
      m: 0,
      my: 2,
      pl: 2,
      borderLeft: `4px solid ${v.surface.outlineVariant}`,
      color: v.text.secondary,
    },

    // Inline code
    '& :not(pre) > code': {
      fontFamily: FONT_MONO,
      fontSize: '0.875em',
      px: 0.75,
      py: 0.25,
      borderRadius: 1,
      backgroundColor: v.surface.containerHigh,
    },

    // Tier chips from vault index notes: [C] core, [I] important, [B] breadth
    '& .tier': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      mr: 0.75,
      borderRadius: '50%',
      fontFamily: FONT_MONO,
      fontSize: '0.6875rem',
      fontWeight: 700,
      verticalAlign: 'text-bottom',
    },
    '& .tier-core': { backgroundColor: v.container.primary, color: v.container.onPrimary },
    '& .tier-important': { backgroundColor: v.container.tertiary, color: v.container.onTertiary },
    '& .tier-breadth': { border: `1px solid ${v.surface.outlineVariant}`, color: v.text.secondary },

    // Code blocks
    '& pre': {
      position: 'relative',
      my: 2.5,
      p: 2,
      pr: { xs: 2, sm: 9 },
      overflowX: 'auto',
      borderRadius: 3,
      backgroundColor: v.surface.containerHighest,
      fontFamily: FONT_MONO,
      fontSize: { xs: '0.78rem', sm: '0.8125rem' },
      lineHeight: 1.6,
      WebkitOverflowScrolling: 'touch',
    },
    '& pre code': { fontFamily: 'inherit', background: 'none', p: 0 },
    '& .copy-btn': {
      position: 'absolute',
      top: 8,
      right: 8,
      display: { xs: 'none', sm: 'inline-flex' },
      font: 'inherit',
      fontFamily: t.typography.fontFamily,
      fontSize: '0.75rem',
      fontWeight: 500,
      px: 1.5,
      py: 0.5,
      borderRadius: 4,
      border: `1px solid ${v.surface.outlineVariant}`,
      backgroundColor: v.surface.container,
      color: v.text.secondary,
      cursor: 'pointer',
      '&:hover': { color: v.primary.main, borderColor: v.primary.main },
    },

    // Syntax highlighting (highlight.js classes)
    '& .hljs-keyword, & .hljs-built_in, & .hljs-type': { color: v.primary.main },
    '& .hljs-string, & .hljs-regexp': { color: v.success.main },
    '& .hljs-number, & .hljs-literal': { color: v.tertiary.main },
    '& .hljs-comment': { color: v.text.secondary, fontStyle: 'italic' },
    '& .hljs-title, & .hljs-title.function_, & .hljs-title.class_': { color: v.warning.main },
    '& .hljs-meta, & .hljs-attr, & .hljs-variable': { color: v.secondary.main },

    // Tables — scroll horizontally inside their wrapper on narrow screens
    '& .table-scroll': {
      my: 2.5,
      overflowX: 'auto',
      borderRadius: 3,
      border: `1px solid ${v.surface.outlineVariant}`,
      WebkitOverflowScrolling: 'touch',
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    '& th': {
      textAlign: 'left',
      fontWeight: 600,
      backgroundColor: v.surface.container,
      whiteSpace: 'nowrap',
    },
    '& th, & td': {
      px: 1.5,
      py: 1,
      verticalAlign: 'top',
      borderBottom: `1px solid ${v.surface.outlineVariant}`,
      minWidth: { xs: 140, sm: 'auto' },
    },
    '& tr:last-child td': { borderBottom: 0 },

    // Recall tables: optional practice mode
    '&.hide-recall .recall-tbl td:last-child': {
      cursor: 'pointer',
      filter: 'blur(6px)',
      userSelect: 'none',
      transition: 'filter 150ms ease',
    },
    '&.hide-recall .recall-tbl td:last-child.revealed': { filter: 'none', userSelect: 'auto' },

    // Callouts
    '& .callout': {
      my: 2.5,
      px: 2,
      py: 1.5,
      borderRadius: '4px 12px 12px 4px',
      borderLeft: '4px solid',
      ...tone(v.primary.main, v.surface.container),
      '& > :last-child': { mb: 0 },
      '& > p:first-of-type': { mt: 0.5 },
    },
    '& .callout .label': { display: 'block', ...t.typography.overline, fontWeight: 700 },
    '& .callout.insight': tone(v.primary.main, v.container.primary),
    '& .callout.tip': tone(v.success.main, v.surface.container),
    '& .callout.warn': tone(v.warning.main, v.surface.container),
    '& .callout.trap': tone(v.error.main, v.container.error),

    // Figures and diagrams
    '& figure': {
      mx: 0,
      my: 3,
      p: { xs: 1.5, sm: 2.5 },
      borderRadius: 3,
      border: `1px solid ${v.surface.outlineVariant}`,
      backgroundColor: v.surface.containerLowest,
      overflowX: 'auto',
    },
    '& .mermaid': { display: 'flex', justifyContent: 'center', minHeight: 60, color: 'transparent' },
    '& .mermaid svg': { maxWidth: '100%', height: 'auto' },
    '& .mermaid:has(svg)': { color: 'inherit' },
    '& .mermaid-error': { color: v.text.secondary, whiteSpace: 'pre-wrap', fontFamily: FONT_MONO, fontSize: '0.75rem' },
    '& figcaption': {
      mt: 1.5,
      pt: 1.25,
      borderTop: `1px dashed ${v.surface.outlineVariant}`,
      ...t.typography.body2,
      color: v.text.secondary,
    },

    '& details': {
      my: 1.5,
      px: 2,
      py: 1,
      borderRadius: 3,
      border: `1px solid ${v.surface.outlineVariant}`,
    },
    '& summary': { cursor: 'pointer', fontWeight: 500, minHeight: 32, display: 'list-item' },
  }
}

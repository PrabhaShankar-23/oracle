/**
 * Material Design 3 theme for MUI.
 *
 * Every radius, type style and component default lives in this file; colour values live in
 * ./schemes (one file per scheme) and the light/dark pair is chosen below.
 * Components read colours through `theme.vars.palette.*` so light/dark switch
 * with CSS variables instead of a React re-render.
 *
 * Colour roles follow M3 (https://m3.material.io/styles/color/roles).
 */
import { chatgptDark } from './schemes/chatgptDark'
import { deepforestDark } from './schemes/deepforestDark'
import { everforestLight } from './schemes/everforestLight'
import type { Scheme } from './schemes/types'
import '@fontsource-variable/roboto-flex'
import '@fontsource-variable/roboto-mono'
import type {} from '@mui/material/themeCssVarsAugmentation'
import { alpha, createTheme } from '@mui/material/styles'

/* ------------------------------------------------------------------ */
/* Layout constants shared by the app shell and sticky elements        */
/* ------------------------------------------------------------------ */

export const HEADER_HEIGHT = 64
export const CONTENT_MAX_WIDTH = 1280
export const READING_MAX_WIDTH = 860
export const SIDEBAR_WIDTH = 280
export const FONT_MONO = "'Roboto Mono Variable', ui-monospace, SFMono-Regular, Menlo, monospace"
const FONT_SANS = "'Roboto Flex Variable', Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif"

/* ------------------------------------------------------------------ */
/* M3 surface roles — not part of MUI's palette, so we add them         */
/* ------------------------------------------------------------------ */

type SurfaceRoles = {
  dim: string
  bright: string
  containerLowest: string
  containerLow: string
  container: string
  containerHigh: string
  containerHighest: string
  onVariant: string
  outlineVariant: string
}

type ContainerRoles = {
  primary: string
  onPrimary: string
  secondary: string
  onSecondary: string
  tertiary: string
  onTertiary: string
  error: string
  onError: string
}

declare module '@mui/material/styles' {
  interface Palette {
    surface: SurfaceRoles
    container: ContainerRoles
    tertiary: Palette['primary']
  }
  interface PaletteOptions {
    surface?: SurfaceRoles
    container?: ContainerRoles
    tertiary?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    tertiary: true
  }
}

/* ------------------------------------------------------------------ */
/* Colour schemes                                                      */
/* ------------------------------------------------------------------ */

// Colour schemes live in ./schemes, one file each. Pick the dark one here; everything else
// (MUI palette, Mermaid, charts, code highlighting) follows from it.
const light: Scheme = everforestLight
const dark: Scheme = chatgptDark // alternatives: everforestDark, deepforestDark

/**
 * Every scheme the app can show. `forest` is a second dark scheme, offered by the forest button in
 * the app bar (ForestToggle); MUI swaps it in as the dark scheme via `setColorScheme({ dark: 'forest' })`.
 */
const SCHEMES = { light, dark, forest: deepforestDark } as const
export type SchemeName = keyof typeof SCHEMES

declare module '@mui/material/styles' {
  interface ColorSchemeOverrides {
    forest: true
  }
}

/** Hex values for vault charts (src/lib/chart.ts): Plot writes colours as SVG attributes, which can't read CSS variables. */
export const chartColors = (scheme: SchemeName) => {
  const s = SCHEMES[scheme]
  return {
    text: s.onSurface,
    muted: s.onSurfaceVariant,
    // Charts sit in figures on the lowest surface; point markers get a ring in that colour so they read as cut-outs.
    surface: s.surfaceContainerLowest,
    grid: s.outlineVariant,
    axis: s.outline,
    tones: {
      primary: s.primary,
      warn: s.warning,
      bad: s.error,
      ok: s.success,
      accent: s.tertiary,
      muted: s.onSurfaceVariant,
    },
  }
}

/* Diagram node colours. Vault diagrams colour nodes by meaning with a fixed pastel palette (green = a step,
 * blue = a good outcome, yellow = a computation, purple = a question, red = a failure, grey = an input).
 * The site redraws those in light tints of the active scheme's own colours, with dark text, so a diagram
 * belongs to the theme and stays readable in every scheme (light tints, never the dark container roles). */
const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}
const rgbToHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)]
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t))
}
const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** A light tint of `hue`: mixed towards white until dark text reads comfortably on it. */
const tint = (hue: string) => {
  let t = 0.5
  while (t < 0.86 && luminance(mix(hue, '#ffffff', t)) < 0.68) t += 0.04
  return { fill: mix(hue, '#ffffff', t), stroke: mix(hue, '#000000', luminance(hue) > 0.5 ? 0.3 : 0.05) }
}
export const DIAGRAM_TEXT = '#1b1c1e'
/** Vault pastel (fill, stroke) → the scheme role that replaces it. */
export const diagramTones = (scheme: SchemeName) => {
  const s = SCHEMES[scheme]
  return [
    { fill: '#6EE7B7', stroke: '#34D399', ...asTone(tint(s.success)) },
    { fill: '#93C5FD', stroke: '#60A5FA', ...asTone(tint(s.primary)) },
    { fill: '#FCD34D', stroke: '#F59E0B', ...asTone(tint(s.warning)) },
    { fill: '#C4B5FD', stroke: '#8B5CF6', ...asTone(tint(s.tertiary)) },
    { fill: '#FCA5A5', stroke: '#F87171', ...asTone(tint(s.error)) },
    { fill: '#D1D5DB', stroke: '#9CA3AF', ...asTone(tint(s.outline)) },
  ]
}
const asTone = (t: { fill: string; stroke: string }) => ({ toFill: t.fill, toStroke: t.stroke })

/** Hex values for Mermaid, which draws SVG and can't read the CSS variables. */
export const mermaidThemeVariables = (scheme: SchemeName) => {
  const s = SCHEMES[scheme]
  return {
    darkMode: scheme !== 'light',
    background: s.surface,
    primaryColor: s.surfaceContainerHigh,
    primaryTextColor: s.onSurface,
    primaryBorderColor: s.primary,
    secondaryColor: s.secondaryContainer,
    tertiaryColor: s.surfaceContainerLow,
    lineColor: s.outline,
    textColor: s.onSurface,
    mainBkg: s.surfaceContainerHigh,
    nodeBorder: s.primary,
    clusterBkg: s.surfaceContainerLow,
    clusterBorder: s.outlineVariant,
    edgeLabelBackground: s.surfaceContainer,
    noteBkgColor: s.tertiaryContainer,
    noteTextColor: s.onTertiaryContainer,
    noteBorderColor: s.tertiary,
    actorBkg: s.surfaceContainerHigh,
    actorBorder: s.primary,
    actorTextColor: s.onSurface,
    signalColor: s.onSurface,
    signalTextColor: s.onSurface,
  }
}

function palette(s: Scheme, mode: 'light' | 'dark') {
  return {
    mode,
    primary: { main: s.primary, contrastText: s.onPrimary },
    secondary: { main: s.secondary, contrastText: s.onSecondary },
    tertiary: { main: s.tertiary, contrastText: s.onTertiary },
    error: { main: s.error },
    success: { main: s.success },
    warning: { main: s.warning },
    background: { default: s.surface, paper: s.surfaceContainerLow },
    text: { primary: s.onSurface, secondary: s.onSurfaceVariant },
    divider: s.outlineVariant,
    surface: {
      dim: s.surfaceDim,
      bright: s.surfaceBright,
      containerLowest: s.surfaceContainerLowest,
      containerLow: s.surfaceContainerLow,
      container: s.surfaceContainer,
      containerHigh: s.surfaceContainerHigh,
      containerHighest: s.surfaceContainerHighest,
      onVariant: s.onSurfaceVariant,
      outlineVariant: s.outlineVariant,
    },
    container: {
      primary: s.primaryContainer,
      onPrimary: s.onPrimaryContainer,
      secondary: s.secondaryContainer,
      onSecondary: s.onSecondaryContainer,
      tertiary: s.tertiaryContainer,
      onTertiary: s.onTertiaryContainer,
      error: s.errorContainer,
      onError: s.onErrorContainer,
    },
    action: {
      hover: alpha(s.onSurface, 0.08),
      selected: alpha(s.secondaryContainer, 1),
      focus: alpha(s.onSurface, 0.12),
    },
  }
}

/**
 * MUI v9 only fills in palette defaults (common, grey, overlays…) for the built-in `light` and
 * `dark` schemes; a custom one such as `forest` is copied as-is and would crash theme creation.
 * So resolve the scheme as `dark` in a throwaway theme and register the finished result.
 * (The cast: the ColorSchemeOverrides augmentation makes every theme's options require `forest`.)
 */
function resolvedDarkScheme(s: Scheme) {
  const options = { cssVariables: true, defaultColorScheme: 'dark', colorSchemes: { dark: { palette: palette(s, 'dark') } } }
  return createTheme(options as unknown as Parameters<typeof createTheme>[0]).colorSchemes.dark!
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  colorSchemes: {
    light: { palette: palette(light, 'light') },
    dark: { palette: palette(dark, 'dark') },
    forest: resolvedDarkScheme(deepforestDark),
  },

  shape: { borderRadius: 6 },

  breakpoints: {
    // Aligned with M3 window size classes: compact < 600, medium < 840, expanded < 1200, large ≥ 1200
    values: { xs: 0, sm: 600, md: 840, lg: 1200, xl: 1600 },
  },

  // M3 type scale. Headings use clamp() so they shrink on phones without media queries.
  typography: {
    fontFamily: FONT_SANS,
    h1: { fontSize: 'clamp(2rem, 1.4rem + 2.4vw, 3.5625rem)', lineHeight: 1.12, fontWeight: 400, letterSpacing: '-0.015em' },
    h2: { fontSize: 'clamp(1.75rem, 1.35rem + 1.6vw, 2.8125rem)', lineHeight: 1.16, fontWeight: 400 },
    h3: { fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2.25rem)', lineHeight: 1.22, fontWeight: 400 },
    h4: { fontSize: 'clamp(1.375rem, 1.2rem + 0.7vw, 2rem)', lineHeight: 1.25, fontWeight: 400 },
    h5: { fontSize: '1.5rem', lineHeight: 1.33, fontWeight: 400 },
    h6: { fontSize: '1.375rem', lineHeight: 1.27, fontWeight: 500 },
    subtitle1: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 500, letterSpacing: '0.01em' },
    subtitle2: { fontSize: '0.875rem', lineHeight: 1.43, fontWeight: 500, letterSpacing: '0.006em' },
    body1: { fontSize: '1rem', lineHeight: 1.6, letterSpacing: '0.01em' },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, letterSpacing: '0.016em' },
    button: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.006em', textTransform: 'none' },
    caption: { fontSize: '0.75rem', lineHeight: 1.33, letterSpacing: '0.025em' },
    overline: { fontSize: '0.6875rem', lineHeight: 1.45, fontWeight: 500, letterSpacing: '0.09em' },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        html: { scrollBehavior: 'smooth', WebkitTextSizeAdjust: '100%' },
        body: { overflowX: 'hidden' },
        // Anchored headings/cards stop below the sticky app bar.
        '[id]': { scrollMarginTop: HEADER_HEIGHT + 16 },
        'code, kbd, pre, samp': { fontFamily: FONT_MONO },
        '::selection': { background: t.vars?.palette.container.primary },
        '@media (prefers-reduced-motion: reduce)': {
          html: { scrollBehavior: 'auto' },
          '*, *::before, *::after': { transitionDuration: '0.01ms !important', animationDuration: '0.01ms !important' },
        },
      }),
    },

    MuiToolbar: {
      styleOverrides: { root: { minHeight: HEADER_HEIGHT, '@media (min-width:0px)': { minHeight: HEADER_HEIGHT } } },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit', position: 'sticky' },
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: t.vars.palette.surface.container,
          color: t.vars.palette.text.primary,
          borderBottom: `1px solid ${t.vars.palette.surface.outlineVariant}`,
        }),
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, paddingInline: 16, minHeight: 40 },
        sizeSmall: { minHeight: 32, paddingInline: 12 },
      },
    },

    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 6 } },
    },

    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 6,
          backgroundColor: t.vars.palette.surface.containerLowest,
          borderColor: t.vars.palette.surface.outlineVariant,
        }),
      },
    },

    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 6 } },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 500 },
        sizeSmall: { height: 24 },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 6,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: t.vars.palette.surface.outlineVariant },
        }),
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme: t }) => ({ backgroundColor: t.vars.palette.surface.container, marginTop: 4 }),
        groupLabel: ({ theme: t }) => ({
          backgroundColor: t.vars.palette.surface.container,
          color: t.vars.palette.primary.main,
          fontWeight: 600,
          lineHeight: '36px',
        }),
        option: { minHeight: 44 },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: ({ theme: t }) => ({ backgroundColor: t.vars.palette.surface.container, minWidth: 220 }),
      },
    },

    MuiMenuItem: {
      styleOverrides: { root: { minHeight: 44, borderRadius: 4, marginInline: 6 } },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 6,
          minHeight: 48,
          '&.Mui-selected': {
            backgroundColor: t.vars.palette.container.secondary,
            color: t.vars.palette.container.onSecondary,
          },
        }),
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme: t }) => ({ backgroundColor: t.vars.palette.surface.containerLow, borderRight: 0 }),
      },
    },

    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: 'transparent',
          borderBottom: `1px solid ${t.vars.palette.surface.outlineVariant}`,
          '&::before': { display: 'none' },
        }),
      },
    },

    MuiTooltip: {
      defaultProps: { arrow: true, enterTouchDelay: 300 },
    },

    MuiSelect: {
      defaultProps: { MenuProps: { slotProps: { paper: { sx: { maxHeight: 420 } } } } },
    },
  },
})

export default theme

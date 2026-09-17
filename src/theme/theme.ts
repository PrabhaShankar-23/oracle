/**
 * Material Design 3 theme for MUI.
 *
 * Every colour, radius, type style and component default lives in this file.
 * Components read colours through `theme.vars.palette.*` so light/dark switch
 * with CSS variables instead of a React re-render.
 *
 * Colour roles follow the M3 baseline scheme (https://m3.material.io/styles/color/roles).
 * To re-brand, generate a scheme at https://material-foundation.github.io/material-theme-builder/
 * and replace the `light` and `dark` objects below.
 */
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

const light = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  error: '#B3261E',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  success: '#386A20',
  warning: '#7C5800',
  surface: '#FEF7FF',
  surfaceDim: '#DED8E1',
  surfaceBright: '#FEF7FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F7F2FA',
  surfaceContainer: '#F3EDF7',
  surfaceContainerHigh: '#ECE6F0',
  surfaceContainerHighest: '#E6E0E9',
  onSurface: '#1D1B20',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
}

const dark: typeof light = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  error: '#F2B8B5',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  success: '#9CD67D',
  warning: '#F9BD22',
  surface: '#141218',
  surfaceDim: '#141218',
  surfaceBright: '#3B383E',
  surfaceContainerLowest: '#0F0D13',
  surfaceContainerLow: '#1D1B20',
  surfaceContainer: '#211F26',
  surfaceContainerHigh: '#2B2930',
  surfaceContainerHighest: '#36343B',
  onSurface: '#E6E0E9',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
}

function palette(s: typeof light, mode: 'light' | 'dark') {
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

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  colorSchemes: {
    light: { palette: palette(light, 'light') },
    dark: { palette: palette(dark, 'dark') },
  },

  shape: { borderRadius: 12 },

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
        root: { borderRadius: 20, paddingInline: 16, minHeight: 40 },
        sizeSmall: { minHeight: 32, paddingInline: 12 },
      },
    },

    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 20 } },
    },

    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 12,
          backgroundColor: t.vars.palette.surface.containerLowest,
          borderColor: t.vars.palette.surface.outlineVariant,
        }),
      },
    },

    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 12 } },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        sizeSmall: { height: 24 },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 12,
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
      styleOverrides: { root: { minHeight: 44, borderRadius: 8, marginInline: 6 } },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 28,
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

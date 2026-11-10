import type { Scheme } from './types'

/**
 * Charcoal dark: neutral greys like Claude's app (user, 2026-11-10), softer than pure black. Page #191919, sidebar and
 * app bar a step up (#1F1F1F), cards #252525, selection #404040, hairlines #323232; white text, grey secondary text.
 * Colour only where it means something, as in chatgptDark.
 */
export const charcoalDark: Scheme = {
  primary: '#ECECEC',
  onPrimary: '#191919',
  primaryContainer: '#404040',
  onPrimaryContainer: '#FFFFFF',
  secondary: '#8AB4F8',
  onSecondary: '#191919',
  secondaryContainer: '#2F2F2F',
  onSecondaryContainer: '#FFFFFF',
  tertiary: '#C4A7E7',
  onTertiary: '#191919',
  tertiaryContainer: '#2E2838',
  onTertiaryContainer: '#E4D7F5',
  error: '#F87171',
  errorContainer: '#3A1F1F',
  onErrorContainer: '#FECACA',
  success: '#6EE7A0',
  warning: '#F5C451',
  surface: '#191919',
  surfaceDim: '#141414',
  surfaceBright: '#404040',
  surfaceContainerLowest: '#191919',
  surfaceContainerLow: '#1F1F1F',
  surfaceContainer: '#1F1F1F',
  surfaceContainerHigh: '#252525',
  surfaceContainerHighest: '#404040',
  onSurface: '#F5F5F5',
  onSurfaceVariant: '#B1B1B1',
  outline: '#5D5D5D',
  outlineVariant: '#323232',
}

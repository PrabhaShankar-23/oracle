import type { Scheme } from './types'

/**
 * GitHub Dark Dimmed (user, 2026-11-24: "the GitHub Markdown preview: dark blue backgrounds in a few
 * shades, soft text, blue links, easy on the eyes"). Page #22272E, sidebar and app bar #1C2128, code and
 * code blocks #2D333B, cards #282E36, borders #444C56; body text #ADBAC7, headings #CDD9E5 (set in theme.ts), links #539BF5.
 */
export const githubDimmed: Scheme = {
  primary: '#539BF5',
  onPrimary: '#1C2128',
  primaryContainer: '#26354A',
  onPrimaryContainer: '#CDD9E5',
  secondary: '#6CB6FF',
  onSecondary: '#1C2128',
  secondaryContainer: '#2D333B',
  onSecondaryContainer: '#CDD9E5',
  tertiary: '#DCBDFB',
  onTertiary: '#1C2128',
  tertiaryContainer: '#2F2A40',
  onTertiaryContainer: '#E8D9FC',
  error: '#F47067',
  errorContainer: '#3B2629',
  onErrorContainer: '#FFC1BA',
  success: '#6BC46D',
  warning: '#DAAA3F',
  surface: '#22272E',
  surfaceDim: '#1C2128',
  surfaceBright: '#444C56',
  surfaceContainerLowest: '#1C2128',
  surfaceContainerLow: '#262C36',
  surfaceContainer: '#282E36',
  surfaceContainerHigh: '#373E47',
  surfaceContainerHighest: '#2D333B', // code blocks, as on GitHub
  onSurface: '#ADBAC7',
  onSurfaceVariant: '#909DAB',
  outline: '#545D68',
  outlineVariant: '#373E47',
}

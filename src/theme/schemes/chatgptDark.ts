import type { Scheme } from './types'

/** Dark like ChatGPT's reading view: pure black, neutral greys, off-white text, no tinted surfaces. */
export const chatgptDark: Scheme = {
  // Neutral: colour only where it means something. Primary is near-white (buttons, spine, main
  // chart line); a soft blue and violet carry secondary/tertiary; status colours stay muted.
  primary: '#ECECEC',
  onPrimary: '#0D0D0D',
  primaryContainer: '#2F2F2F',
  onPrimaryContainer: '#FFFFFF',
  secondary: '#8AB4F8',
  onSecondary: '#0D0D0D',
  secondaryContainer: '#212121',
  onSecondaryContainer: '#FFFFFF',
  tertiary: '#C4A7E7',
  onTertiary: '#0D0D0D',
  tertiaryContainer: '#2A2338',
  onTertiaryContainer: '#E4D7F5',
  error: '#F87171',
  errorContainer: '#3A1D1D',
  onErrorContainer: '#FECACA',
  success: '#6EE7A0',
  warning: '#F5C451',
  // Surfaces: pure black page, sidebar and cards a step up, selection #212121 like ChatGPT's recents.
  surface: '#000000',
  surfaceDim: '#000000',
  surfaceBright: '#303030',
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#0D0D0D',
  surfaceContainer: '#171717',
  surfaceContainerHigh: '#212121',
  surfaceContainerHighest: '#2F2F2F',
  onSurface: '#ECECEC',
  onSurfaceVariant: '#A3A3A3',
  outline: '#5D5D5D',
  outlineVariant: '#262626',
}

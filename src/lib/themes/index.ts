// src/lib/themes/index.ts
import type { ThemeId, ThemeConfig, ColorPalette, FontConfig, StyleConfig } from '@/types/theme'
import { macOsTheme } from './mac-os'
import { instagramReelsTheme } from './instagram-reels'
import { systemSettingsTheme } from './system-settings'
import { blinkiesTheme } from './blinkies'
import { vcrMenuTheme } from './vcr-menu'
import { ipodClassicTheme } from './ipod-classic'
import { receiptTheme } from './receipt'
import { macintoshTheme } from './macintosh'
import { wordArtTheme } from './word-art'
import { phoneHomeTheme } from './phone-home'
import { chaoticZineTheme } from './chaotic-zine'
import { artifactTheme } from './artifact'

export const THEMES: ThemeConfig[] = [
  macOsTheme,
  instagramReelsTheme,
  systemSettingsTheme,
  blinkiesTheme,
  vcrMenuTheme,
  ipodClassicTheme,
  receiptTheme,
  macintoshTheme,
  wordArtTheme,
  phoneHomeTheme,
  chaoticZineTheme,
  artifactTheme,
]

export const THEME_IDS: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings', 'blinkies', 'vcr-menu', 'ipod-classic', 'receipt', 'macintosh', 'word-art', 'phone-home', 'chaotic-zine', 'artifact']

export function getTheme(id: ThemeId): ThemeConfig | undefined {
  return THEMES.find((theme) => theme.id === id)
}

export function getThemeDefaults(id: ThemeId): {
  colors: ColorPalette
  fonts: FontConfig
  style: StyleConfig
} | null {
  const theme = getTheme(id)
  if (!theme) return null

  return {
    colors: theme.defaultColors,
    fonts: theme.defaultFonts,
    style: theme.defaultStyle,
  }
}

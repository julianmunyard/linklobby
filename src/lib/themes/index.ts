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
import { lanyardBadgeTheme } from './lanyard-badge'
import { classifiedTheme } from './classified'
import { departuresBoardTheme } from './departures-board'
import { departuresBoardLedTheme } from './departures-board-led'
import { phoneHomeTheme } from './phone-home'

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
  lanyardBadgeTheme,
  classifiedTheme,
  departuresBoardTheme,
  departuresBoardLedTheme,
  phoneHomeTheme,
]

export const THEME_IDS: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings', 'blinkies', 'vcr-menu', 'ipod-classic', 'receipt', 'macintosh', 'word-art', 'lanyard-badge', 'classified', 'departures-board', 'departures-board-led', 'phone-home']

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

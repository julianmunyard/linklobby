// src/lib/themes/index.ts
import type { ThemeId, ThemeConfig, ColorPalette, FontConfig, StyleConfig } from '@/types/theme'
import { macOsTheme } from './mac-os'
import { instagramReelsTheme } from './instagram-reels'
import { systemSettingsTheme } from './system-settings'

export const THEMES: ThemeConfig[] = [
  macOsTheme,
  instagramReelsTheme,
  systemSettingsTheme,
]

export const THEME_IDS: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings']

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

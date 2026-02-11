// src/types/scatter.ts
import type { ThemeId } from '@/types/theme'

/**
 * Position and size of a card in scatter (freeform) layout mode.
 * All values are percentages (0-100) relative to the canvas.
 */
export interface ScatterPosition {
  x: number        // Percentage (0-100) of canvas width
  y: number        // Percentage (0-100) of canvas height
  width: number    // Percentage (0-100) of canvas width
  height: number   // Percentage (0-100) of canvas height
  zIndex: number   // Stacking order - last moved = highest
}

/**
 * Per-theme scatter layouts for a card.
 * Each card can have different positions/sizes for each scatter-enabled theme.
 */
export type ScatterLayouts = Partial<Record<ThemeId, ScatterPosition>>

/**
 * Themes that support scatter (freeform) positioning mode.
 */
export const SCATTER_THEMES: ThemeId[] = [
  'mac-os',
  'instagram-reels',
  'system-settings',
  'macintosh',
  'word-art'
]

/**
 * Default width/height percentages by card type when scatter mode
 * is first activated for a theme. Used to initialize card sizes.
 */
export const DEFAULT_SCATTER_SIZES: Record<string, { width: number; height: number }> = {
  hero: { width: 40, height: 30 },
  square: { width: 25, height: 25 },
  horizontal: { width: 45, height: 12 },
  link: { width: 30, height: 8 },
  text: { width: 30, height: 10 },
  video: { width: 35, height: 25 },
  gallery: { width: 35, height: 30 },
  game: { width: 30, height: 30 },
  music: { width: 35, height: 15 },
  audio: { width: 45, height: 20 },
  release: { width: 30, height: 35 },
  'email-collection': { width: 35, height: 20 },
  'social-icons': { width: 30, height: 8 },
  mini: { width: 15, height: 8 },
}

/**
 * Check if a theme supports scatter mode.
 */
export function isScatterTheme(themeId: string): boolean {
  return SCATTER_THEMES.includes(themeId as ThemeId)
}

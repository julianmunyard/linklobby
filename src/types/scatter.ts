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
  hero: { width: 60, height: 40 },
  square: { width: 45, height: 45 },
  horizontal: { width: 65, height: 12 },
  link: { width: 60, height: 10 },
  text: { width: 100, height: 10 },  // fit-content: 100 = 1x natural size
  video: { width: 60, height: 40 },
  gallery: { width: 60, height: 40 },
  game: { width: 50, height: 40 },
  music: { width: 60, height: 15 },
  audio: { width: 65, height: 25 },
  release: { width: 50, height: 50 },
  'email-collection': { width: 60, height: 25 },
  'social-icons': { width: 100, height: 10 },  // fit-content: 100 = 1x natural size
  mini: { width: 30, height: 8 },
}

/**
 * Check if a theme supports scatter mode.
 */
export function isScatterTheme(themeId: string): boolean {
  return SCATTER_THEMES.includes(themeId as ThemeId)
}

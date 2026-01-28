// src/types/theme.ts

export type ThemeId = 'mac-os' | 'sleek-modern' | 'instagram-reels'

export interface ColorPalette {
  background: string      // Page background
  cardBg: string          // Card background
  text: string            // Primary text
  accent: string          // Accent/highlight color
  border: string          // Border color
  link: string            // Link color
}

export interface FontConfig {
  heading: string         // CSS variable name (e.g., '--font-inter')
  body: string            // CSS variable name
  headingSize: number     // rem multiplier (1 = base, 1.25 = 25% larger)
  bodySize: number        // rem multiplier
  headingWeight: 'normal' | 'bold'
}

export interface StyleConfig {
  borderRadius: number    // px value
  shadowEnabled: boolean
  blurIntensity: number   // 0-32 px
}

export interface BackgroundConfig {
  type: 'solid' | 'image' | 'video'
  value: string           // color hex, image URL, or video URL
}

// Font sizes for each card type (rem multiplier, 1 = base)
export interface CardTypeFontSizes {
  hero: number
  square: number
  horizontal: number
  link: number
  gallery: number
}

export interface ThemeConfig {
  id: ThemeId
  name: string
  description: string
  defaultColors: ColorPalette
  defaultFonts: FontConfig
  defaultStyle: StyleConfig
  palettes: Array<{ id: string; name: string; colors: ColorPalette }>
  // Theme-specific features
  hasTrafficLights?: boolean   // Mac OS only
  hasGlassEffect?: boolean     // Sleek Modern only
  hasSpreadText?: boolean      // Instagram Reels only
}

export interface ThemeState {
  themeId: ThemeId
  paletteId: string | null
  colors: ColorPalette
  fonts: FontConfig
  style: StyleConfig
  background: BackgroundConfig
  cardTypeFontSizes: CardTypeFontSizes
}

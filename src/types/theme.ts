// src/types/theme.ts

export type ThemeId = 'mac-os' | 'instagram-reels' | 'system-settings'

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
  // Video zoom/position settings
  videoZoom?: number      // Default: 1.0, range: 1.0 to 2.0
  videoPositionX?: number // Default: 50 (center), range: 0-100
  videoPositionY?: number // Default: 50 (center), range: 0-100
  // Top bar fade settings (for notch/Dynamic Island handling)
  fadeToTopBar?: boolean  // Whether to fade into top bar color
  topBarColor?: string    // Color to fade into at top (default: #000000)
  // Frame overlay settings
  frameOverlay?: string      // Frame PNG path (e.g., '/frames/awge-tv.png')
  frameZoom?: number         // Frame zoom level (default: 1, range: 0.5 to 2)
  framePositionX?: number    // Frame X position offset (default: 0, range: -50 to 50)
  framePositionY?: number    // Frame Y position offset (default: 0, range: -50 to 50)
  frameFitContent?: boolean  // Keep content inside frame when zoomed/positioned
  // Content position within frame (fine-tuning)
  contentOffsetX?: number    // Content X offset (default: 0, range: -20 to 20)
  contentOffsetY?: number    // Content Y offset (default: 0, range: -20 to 20)
  contentZoom?: number       // Content zoom (default: 1, range: 0.8 to 1.2)
}

// Font sizes for each card type (rem multiplier, 1 = base)
export interface CardTypeFontSizes {
  hero: number
  square: number
  horizontal: number
  link: number
  gallery: number
  video: number
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
  hasGlassEffect?: boolean     // For glass-style themes
  hasSpreadText?: boolean      // Instagram Reels only
  hasWindowChrome?: boolean    // System Settings only
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

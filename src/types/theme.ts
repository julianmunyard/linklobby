// src/types/theme.ts

export type ThemeId = 'mac-os' | 'instagram-reels' | 'system-settings' | 'vcr-menu' | 'ipod-classic' | 'receipt' | 'macintosh' | 'word-art' | 'lanyard-badge' | 'classified'

export interface ColorPalette {
  background: string      // Page background
  cardBg: string          // Card background
  text: string            // Primary text
  accent: string          // Accent/highlight color
  border: string          // Border color
  link: string            // Link color
  // Theme-specific optional colors
  titleBarLine?: string   // Mac OS theme: title bar separator line color
}

export interface FontConfig {
  heading: string         // CSS variable name (e.g., '--font-inter')
  body: string            // CSS variable name
  headingSize: number     // rem multiplier (1 = base, 1.25 = 25% larger)
  bodySize: number        // rem multiplier
  headingWeight: 'normal' | 'bold'
  // Fuzzy/distress text effect
  fuzzyEnabled?: boolean  // Whether distress effect is enabled
  fuzzyIntensity?: number // 0-1 range, default 0.19
  fuzzySpeed?: number     // FPS for animation, default 12
}

export interface StyleConfig {
  borderRadius: number    // px value
  shadowEnabled: boolean
  blurIntensity: number   // 0-32 px
}

export interface BackgroundConfig {
  type: 'solid' | 'image' | 'video'
  value: string           // color hex, image URL, or video URL
  // Image zoom/position settings
  imageZoom?: number      // Default: 1.0, range: 1.0 to 3.0
  imagePositionX?: number // Default: 50 (center), range: 0-100
  imagePositionY?: number // Default: 50 (center), range: 0-100
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
  // Noise overlay
  noiseOverlay?: boolean     // Whether noise grain overlay is enabled
  noiseIntensity?: number    // Noise opacity (0-100, default 15)
  // Dim overlay
  dimOverlay?: boolean       // Whether to dim the background
  dimIntensity?: number      // Dim opacity (0-100, default 40)
}

// Receipt sticker configuration
export interface ReceiptSticker {
  id: string
  src: string              // Image path (e.g., '/images/stickers/special-tag.jpeg')
  x: number                // Position as percentage (0-100)
  y: number                // Position as percentage (0-100)
  rotation: number         // Rotation in degrees (-45 to 45)
  scale: number            // Scale multiplier (0.5 to 1.5)
  behindText?: boolean     // If true, sticker renders behind receipt text
}

// Font sizes for each card type (rem multiplier, 1 = base)
export interface CardTypeFontSizes {
  hero: number
  square: number
  horizontal: number
  link: number
  mini: number
  text: number
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
  palettes: Array<{ id: string; name: string; colors: ColorPalette; transparent?: boolean }>
  // Theme-specific features
  hasTrafficLights?: boolean   // Mac OS only
  hasGlassEffect?: boolean     // For glass-style themes
  hasSpreadText?: boolean      // Instagram Reels only
  hasWindowChrome?: boolean    // System Settings only
  isListLayout?: boolean       // VCR Menu - simple text list instead of cards
  hasReceiptPhoto?: boolean    // Receipt theme - dithered B&W photo
}

export interface ThemeState {
  themeId: ThemeId
  paletteId: string | null
  colors: ColorPalette
  fonts: FontConfig
  style: StyleConfig
  background: BackgroundConfig
  cardTypeFontSizes: CardTypeFontSizes
  socialIconSize?: number  // Icon size in pixels (16-48), default 24
  vcrCenterContent?: boolean  // VCR theme: center content vertically
  receiptPrice?: string  // Receipt theme: custom price text
  receiptStickers?: ReceiptSticker[]  // Receipt theme: draggable stickers
  receiptFloatAnimation?: boolean  // Receipt theme: floating animation enabled
  receiptPaperTexture?: boolean  // Receipt theme: paper texture overlay enabled
  ipodStickers?: ReceiptSticker[]  // iPod theme: draggable stickers (reuses ReceiptSticker type)
  ipodTexture?: string  // iPod theme: texture overlay image path
  ipodFont?: string  // iPod theme: font choice ('system' or 'pix-chicago')
  centerCards?: boolean      // Basic themes (mac-os, instagram, poolsuite): vertically center cards on screen
  macPattern?: string       // Macintosh theme: pattern image path ('' = default CSS checkerboard)
  macPatternColor?: string  // Macintosh theme: background color behind pattern (default '#c0c0c0')
  wordArtTitleStyle?: string  // Word Art theme: style ID for the title text
  lanyardActiveView?: number  // Lanyard theme: active card view index (0-4)
  classifiedStampText?: string       // Classified theme: stamp text (default 'SECRET')
  classifiedDeptText?: string        // Classified theme: department line (default 'War Department')
  classifiedCenterText?: string      // Classified theme: center line (default 'Classified Message Center')
  classifiedMessageText?: string     // Classified theme: message line (default 'Incoming Message')
  pixels?: {  // Tracking pixel configuration
    facebookPixelId?: string  // Facebook Pixel ID for ad retargeting
    gaMeasurementId?: string  // Google Analytics GA4 Measurement ID
  }
}

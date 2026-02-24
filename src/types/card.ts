// src/types/card.ts
export type CardType =
  | 'hero'
  | 'horizontal'
  | 'square'
  | 'video'
  | 'gallery'
  | 'game'
  | 'audio'
  | 'music'
  | 'social-icons'
  | 'link'
  | 'mini'
  | 'text'
  | 'email-collection'
  | 'release'

export type CardSize = 'big' | 'small'

export type HorizontalPosition = 'left' | 'center' | 'right'

export interface Card {
  id: string
  page_id: string
  card_type: CardType
  title: string | null
  description: string | null
  url: string | null
  content: Record<string, unknown>
  size: CardSize
  position: HorizontalPosition  // horizontal position for small cards
  sortKey: string  // fractional-indexing key for ordering
  is_visible: boolean
  created_at: string
  updated_at: string
}

// Phone Home theme layout — stored in card content.phoneHomeLayout
export interface PhoneHomeLayout {
  page: number    // Which home screen page (0-based)
  row: number     // Row in the grid (0-based)
  col: number     // Column in the grid (0-based, max 3)
  width: 1 | 2 | 4   // Grid columns spanned
  height: 1 | 2 | 3  // Grid rows spanned
}

import type { AudioCardContent } from './audio'
import { DEFAULT_AUDIO_CONTENT } from './audio'

// Card size configuration for flow layout
export const CARD_SIZES = {
  big: {
    label: 'Big',
    description: 'Full width',
  },
  small: {
    label: 'Small',
    description: 'Half width',
  },
} as const

// Define which card types support sizing (null = always full width)
export const CARD_TYPE_SIZING: Record<CardType, CardSize[] | null> = {
  hero: ['big', 'small'],
  square: ['big', 'small'],
  horizontal: null, // Always full width - no sizing option
  video: ['big', 'small'],
  gallery: ['big', 'small'],
  game: ['big', 'small'],
  audio: null, // Always full width
  music: null, // Always full width, no sizing option
  'social-icons': null, // Always full width - singleton widget
  link: null, // Always full width - simple text link
  mini: null, // Compact width - fits content
  text: ['big', 'small'], // Text cards support sizing for horizontal stacking
  'email-collection': null, // Always full width - form needs space
  'release': ['big', 'small'], // Release cards support sizing
}

// Card types that don't support images (use custom media handling instead)
export const CARD_TYPES_NO_IMAGE: CardType[] = ['social-icons', 'link', 'mini', 'text', 'audio', 'music', 'video', 'gallery', 'game', 'email-collection', 'release']

// Text alignment options
export type TextAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'middle' | 'bottom'

// Fuzzy/distress text effect settings
export interface FuzzyTextSettings {
  enabled: boolean
  intensity: number  // 0-1 range, default 0.19
}

export const TEXT_ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

export const VERTICAL_ALIGN_OPTIONS: { value: VerticalAlign; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' },
]

// Position mapping for database storage
export const POSITION_MAP: Record<HorizontalPosition, number> = {
  left: 0,
  center: 1,
  right: 2,
}

export const POSITION_REVERSE: Record<number, HorizontalPosition> = {
  0: 'left',
  1: 'center',
  2: 'right',
}

// Content schemas for each card type
export interface HeroCardContent {
  imageUrl?: string
  imageAlt?: string
  showButton?: boolean  // Whether to show the CTA button (default true)
  buttonText?: string
  buttonStyle?: "primary" | "secondary" | "outline"
  textColor?: string    // Override text color (default white)
  fuzzyText?: FuzzyTextSettings  // Distress text effect
}

export interface HorizontalLinkContent {
  imageUrl?: string
  imageAlt?: string
  iconName?: string  // Lucide icon name as alternative to image
  textColor?: string // Override text color
  fuzzyText?: FuzzyTextSettings  // Distress text effect
}

export interface LinkCardContent {
  textColor?: string // Override text color
  fuzzyText?: FuzzyTextSettings  // Distress text effect
  blinkieStyle?: string  // Blinky animation style for blinkies theme
}

export interface SquareCardContent {
  imageUrl?: string
  imageAlt?: string
  showTitle?: boolean  // Whether to show title overlay (default true)
  textColor?: string   // Override text color (default white)
  fuzzyText?: FuzzyTextSettings  // Distress text effect
}

export interface VideoCardContent {
  videoType?: 'embed' | 'upload'  // Defaults to 'embed'
  // For embeds
  embedUrl?: string           // Original URL (YouTube/Vimeo/TikTok/Instagram)
  embedService?: 'youtube' | 'vimeo' | 'tiktok' | 'instagram'
  embedVideoId?: string
  embedThumbnailUrl?: string
  embedIsVertical?: boolean   // True for TikTok and Instagram Reels (9:16 aspect ratio)
  // For uploads
  uploadedVideoUrl?: string
  uploadedVideoPath?: string  // Supabase Storage path for deletion
  // Zoom/crop settings (for uploads)
  videoZoom?: number          // Default: 1.0, range: 1.0 to 2.0
  videoPositionX?: number     // Default: 50 (center), range: 0-100
  videoPositionY?: number     // Default: 50 (center), range: 0-100
  textColor?: string          // Override text color (default white)
  fuzzyText?: FuzzyTextSettings  // Distress text effect
}

export interface GalleryImage {
  id: string
  url: string
  alt: string
  storagePath: string  // For deletion
  caption?: string     // Optional label displayed below image
  link?: string        // Optional URL - makes image clickable
}

export interface GalleryCardContent {
  galleryStyle: 'circular' | 'carousel' | 'stack'  // Default: 'circular'
  images: GalleryImage[]
  // ReactBits Circular Gallery settings (optional overrides)
  bend?: number             // Default: 1.5, range: -3 to 3
  borderRadius?: number     // Default: 0.05, range: 0 to 0.5
  scrollSpeed?: number      // Default: 1.5, range: 0.5 to 5
  scrollEase?: number       // Default: 0.03, range: 0.01 to 0.2
  spacing?: number          // Default: 2.5, range: 0.5 to 4
  showCaptions?: boolean    // Default: true - show captions in circular mode
  captionColor?: string     // Caption text color (default: #ffffff)
}

export type GameType = 'snake' | 'breakout' | 'flappy'

export interface GameCardContent {
  gameType: GameType
  accentColor?: string  // Default: "#ffffff" - used for border and game elements
}

// Music platform types (includes generic-music for loose/fallback detection)
export type MusicPlatform = 'spotify' | 'apple-music' | 'soundcloud' | 'bandcamp' | 'audiomack' | 'generic-music'

export type PhoneHomeWidgetSize = 'wide' | 'square' | 'icon'

export interface MusicCardContent {
  platform?: MusicPlatform       // Detected platform from URL
  embedUrl?: string              // Original URL pasted by user
  embedIframeUrl?: string        // Constructed iframe src
  embedHeight?: number           // Custom height from embed code (e.g., Bandcamp slim vs large)
  thumbnailUrl?: string          // From oEmbed (if available)
  title?: string                 // From oEmbed (if available)
  embeddable?: boolean           // false when URL was domain-matched but not regex-matched (shows link fallback)
  phoneHomeWidgetSize?: PhoneHomeWidgetSize  // Phone Home: wide (4x2), square (4x4), icon (1x1)
  // Bandcamp-specific (requires page fetch to get IDs)
  bandcampAlbumId?: string
  bandcampTrackId?: string
  textColor?: string             // Override text color
  fuzzyText?: FuzzyTextSettings  // Distress text effect
  noBorder?: boolean             // Remove card border/background styling
  autoplay?: boolean             // Auto-play embed on page load
}

// After countdown action options
export type AfterCountdownAction = 'custom' | 'hide'

// Release card content - for pre-release with countdown and auto-conversion to music card
export interface ReleaseCardContent extends ScheduledContent {
  // Core release info
  albumArtUrl?: string           // Uploaded album art
  albumArtStoragePath?: string   // For deletion
  releaseTitle?: string          // Album/single name
  artistName?: string            // Artist name (if different from profile)

  // Countdown
  showCountdown?: boolean        // Default true for new release cards
  releaseDate?: string           // ISO 8601 UTC - when release goes live

  // Pre-save
  preSaveUrl?: string            // Link to pre-save page (feature.fm, smarturl, etc.)
  preSaveButtonText?: string     // Default "Pre-save"

  // Post-release / after countdown
  afterCountdownAction?: AfterCountdownAction  // What to do when countdown ends: 'custom' or 'hide'
  afterCountdownText?: string    // Custom text to show (e.g., "OUT NOW", "Listen Now")
  afterCountdownUrl?: string     // URL for custom action button

  // Styling
  textColor?: string
  fuzzyText?: FuzzyTextSettings
}

// Re-export from fan-tools for convenience
export type { EmailCollectionCardContent } from './fan-tools'

// Game type info for UI display
export const GAME_TYPE_INFO: Record<GameType, { label: string; description: string }> = {
  snake: { label: 'Snake', description: 'Classic snake game' },
  breakout: { label: 'Breakout', description: 'Break the bricks' },
  flappy: { label: 'Flappy', description: 'Tap to fly' },
}

// Import EmailCollectionCardContent for the union type
import type { EmailCollectionCardContent } from './fan-tools'

// Scheduling mixin - any card content type can include these fields
// publishAt: ISO 8601 UTC timestamp - null/undefined = published immediately
// expireAt: ISO 8601 UTC timestamp - null/undefined = never expires
export interface ScheduledContent {
  publishAt?: string
  expireAt?: string
}

// Union type for all card content
// Note: All content types can optionally include ScheduledContent fields (publishAt, expireAt)
export type CardContent = HeroCardContent | HorizontalLinkContent | SquareCardContent | VideoCardContent | GalleryCardContent | GameCardContent | AudioCardContent | MusicCardContent | EmailCollectionCardContent | ReleaseCardContent | Record<string, unknown>

// Scheduling helper functions
export function isScheduled(content: Record<string, unknown>): boolean {
  return !!(content.publishAt || content.expireAt)
}

export type ScheduleStatus = 'scheduled' | 'active' | 'expired' | null

export function getScheduleStatus(content: Record<string, unknown>): ScheduleStatus {
  const now = new Date().toISOString()
  const publishAt = content.publishAt as string | undefined
  const expireAt = content.expireAt as string | undefined

  if (!publishAt && !expireAt) return null
  if (publishAt && publishAt > now) return 'scheduled'
  if (expireAt && expireAt < now) return 'expired'
  return 'active'
}

// Helper type guards
export function isHeroContent(content: unknown): content is HeroCardContent {
  return typeof content === 'object' && content !== null
}

export function isHorizontalContent(content: unknown): content is HorizontalLinkContent {
  return typeof content === 'object' && content !== null
}

export function isSquareContent(content: unknown): content is SquareCardContent {
  return typeof content === 'object' && content !== null
}

export function isVideoContent(content: unknown): content is VideoCardContent {
  // VideoCardContent is any object that could have video-related fields
  // videoType is optional (defaults to 'embed'), so we can't rely on it being present
  return typeof content === 'object' && content !== null
}

export function isGalleryContent(content: unknown): content is GalleryCardContent {
  return typeof content === 'object' && content !== null && 'galleryStyle' in content
}

export function isGameContent(content: unknown): content is GameCardContent {
  return typeof content === 'object' && content !== null && 'gameType' in content
}

export function isMusicContent(content: unknown): content is MusicCardContent {
  return typeof content === 'object' && content !== null
}

export function isEmailCollectionContent(content: unknown): content is EmailCollectionCardContent {
  return typeof content === 'object' && content !== null && 'heading' in content
}

export function isReleaseContent(content: unknown): content is ReleaseCardContent {
  return typeof content === 'object' && content !== null
}

export function isAudioContent(content: unknown): content is AudioCardContent {
  return typeof content === 'object' && content !== null && 'tracks' in content && Array.isArray((content as any).tracks)
}

// Re-export AudioCardContent for convenience
export type { AudioCardContent } from './audio'

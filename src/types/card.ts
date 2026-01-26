// src/types/card.ts
export type CardType =
  | 'hero'
  | 'horizontal'
  | 'square'
  | 'video'
  | 'gallery'
  | 'dropdown'
  | 'game'
  | 'audio'
  | 'social-icons'
  | 'link'

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
  dropdown: null, // Always full width
  game: ['big', 'small'],
  audio: null, // Always full width
  'social-icons': null, // Always full width - singleton widget
  link: null, // Always full width - simple text link
}

// Card types that don't support images
export const CARD_TYPES_NO_IMAGE: CardType[] = ['social-icons', 'link', 'dropdown', 'audio']

// Text alignment options
export type TextAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'middle' | 'bottom'

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
}

export interface HorizontalLinkContent {
  imageUrl?: string
  imageAlt?: string
  iconName?: string  // Lucide icon name as alternative to image
}

export interface SquareCardContent {
  imageUrl?: string
  imageAlt?: string
  showTitle?: boolean  // Whether to show title overlay (default true)
}

export interface VideoCardContent {
  videoType: 'embed' | 'upload'
  // For embeds
  embedUrl?: string           // Original URL (YouTube/Vimeo/TikTok)
  embedService?: 'youtube' | 'vimeo' | 'tiktok'
  embedVideoId?: string
  embedThumbnailUrl?: string
  // For uploads
  uploadedVideoUrl?: string
  uploadedVideoPath?: string  // Supabase Storage path for deletion
}

export interface GalleryImage {
  id: string
  url: string
  alt: string
  storagePath: string  // For deletion
}

export interface GalleryCardContent {
  galleryStyle: 'circular' | 'carousel'
  images: GalleryImage[]
  // ReactBits Circular Gallery settings (optional overrides)
  scrollEase?: number       // Default: 0.15
  scrollSpeed?: number      // Default: 4.6
  borderRadius?: number     // Default: 0
  bend?: number            // Default: 10
}

// Union type for all card content
export type CardContent = HeroCardContent | HorizontalLinkContent | SquareCardContent | VideoCardContent | GalleryCardContent | Record<string, unknown>

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
  return typeof content === 'object' && content !== null && 'videoType' in content
}

export function isGalleryContent(content: unknown): content is GalleryCardContent {
  return typeof content === 'object' && content !== null && 'galleryStyle' in content
}

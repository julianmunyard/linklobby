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

// Union type for all card content
export type CardContent = HeroCardContent | HorizontalLinkContent | SquareCardContent | Record<string, unknown>

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

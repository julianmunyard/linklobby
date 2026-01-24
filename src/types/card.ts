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

export type CardSize = 'small' | 'medium' | 'large'

export interface Card {
  id: string
  page_id: string
  card_type: CardType
  title: string | null
  description: string | null
  url: string | null
  content: Record<string, unknown>
  size: CardSize
  sortKey: string  // fractional-indexing key for ordering
  is_visible: boolean
  created_at: string
  updated_at: string
}

// Card size configuration for Tailwind classes
export const CARD_SIZES = {
  small: {
    label: 'Small',
    height: 'h-24',      // 96px
    minHeight: 'min-h-24',
  },
  medium: {
    label: 'Medium',
    height: 'h-40',      // 160px
    minHeight: 'min-h-40',
  },
  large: {
    label: 'Large',
    height: 'h-64',      // 256px
    minHeight: 'min-h-64',
  },
} as const

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

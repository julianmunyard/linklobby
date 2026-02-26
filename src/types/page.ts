// src/types/page.ts
import type { Card } from './card'
import type { ThemeState } from './theme'

/**
 * Page record from database
 */
export interface Page {
  id: string
  user_id: string
  is_published: boolean
  theme_settings: ThemeState | null  // Stored theme configuration
  created_at: string
  updated_at: string
}

/**
 * Complete data bundle for rendering a public page
 * Fetched in single query via join
 */
export interface PublicPageData {
  profile: {
    username: string
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    avatar_feather: number
    avatar_size: number
    show_avatar: boolean
    show_title: boolean
    title_size: 'small' | 'large'
    show_logo: boolean
    logo_url: string | null
    logo_scale: number
    profile_layout: 'classic' | 'hero'
    show_social_icons: boolean
    social_icons: string | null  // JSON string from DB
    header_text_color: string | null
    social_icon_color: string | null
  }
  page: Page
  cards: Card[]
}

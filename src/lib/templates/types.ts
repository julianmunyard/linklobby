// src/lib/templates/types.ts
// Template type system for theme templates.
// Templates define a complete page layout (cards, theme, profile settings)
// that can be applied to a user's page as a starting point.

import type { Card } from '@/types/card'
import type { ThemeState } from '@/types/theme'
import type { Profile } from '@/types/profile'

/**
 * TemplateCard — Card shape stored in template definitions.
 * Strips DB-generated fields (id, page_id, timestamps).
 * Media fields (imageUrl, storagePath, audioUrl) use relative paths
 * like `/templates/{template-id}/hero.jpg` that get replaced on apply.
 */
export type TemplateCard = Omit<Card, 'id' | 'page_id' | 'created_at' | 'updated_at'>

/**
 * TemplateTheme — Full theme state minus pixel tracking config.
 * Pixels are user-specific tracking setup and should never be copied from templates.
 */
export type TemplateTheme = Omit<ThemeState, 'pixels'>

/**
 * TemplateProfile — Full profile state a template can set.
 * Includes display name, bio, avatar, logo, social icons — everything
 * needed to fully reproduce the demo page. User-specific data (like
 * avatar/logo URLs) point to template assets that get re-uploaded on apply.
 */
export type TemplateProfile = Partial<Pick<
  Profile,
  | 'profileLayout'
  | 'displayName'
  | 'bio'
  | 'avatarUrl'
  | 'avatarFeather'
  | 'avatarSize'
  | 'avatarShape'
  | 'showAvatar'
  | 'showTitle'
  | 'titleSize'
  | 'showSocialIcons'
  | 'showLogo'
  | 'logoUrl'
  | 'logoScale'
  | 'headerTextColor'
  | 'socialIconColor'
  | 'socialIcons'
>>

/**
 * TemplateDefinition — Top-level type for a complete template.
 * Contains all the data needed to apply a template to a user's page.
 */
export interface TemplateDefinition {
  /** Unique slug, e.g. 'instagram-reels-dark-minimal' */
  id: string
  /** Matches ThemeId — used for grouping templates by theme */
  themeId: string
  /** Display name shown in template picker */
  name: string
  /** Short description blurb for the picker */
  description: string
  /** Optional energy/genre label, e.g. 'hip-hop', 'indie folk', 'minimal' */
  energyLabel?: string
  /** Path to thumbnail image for the picker grid, e.g. '/templates/{id}/thumbnail.jpg' */
  thumbnailPath: string
  /** Card definitions for the template page layout */
  cards: TemplateCard[]
  /** Theme state to apply (without pixel tracking config) */
  theme: TemplateTheme
  /** Profile display settings to apply */
  profile: TemplateProfile
  /** Relative filenames of media assets that need to be uploaded on apply */
  mediaAssets: string[]
}

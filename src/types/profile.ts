// src/types/profile.ts

/**
 * Social platform identifiers for the Big 5
 */
export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'spotify' | 'twitter'

/**
 * Individual social icon with ordering support
 */
export interface SocialIcon {
  id: string
  platform: SocialPlatform
  url: string
  sortKey: string  // Fractional indexing for ordering (same pattern as cards)
}

/**
 * Platform metadata for UI rendering
 */
export interface SocialPlatformMeta {
  label: string
  icon: string  // Lucide icon name
  placeholder: string
  enabled: boolean
}

/**
 * Platform configuration for all social platforms
 * Big 5 are enabled; others can be added later as disabled
 */
export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformMeta> = {
  instagram: {
    label: 'Instagram',
    icon: 'Instagram',
    placeholder: 'https://instagram.com/username',
    enabled: true,
  },
  tiktok: {
    label: 'TikTok',
    icon: 'Music2',
    placeholder: 'https://tiktok.com/@username',
    enabled: true,
  },
  youtube: {
    label: 'YouTube',
    icon: 'Youtube',
    placeholder: 'https://youtube.com/@channel',
    enabled: true,
  },
  spotify: {
    label: 'Spotify',
    icon: 'Music',
    placeholder: 'https://open.spotify.com/artist/...',
    enabled: true,
  },
  twitter: {
    label: 'X / Twitter',
    icon: 'Twitter',
    placeholder: 'https://x.com/username',
    enabled: true,
  },
}

/**
 * Title size options
 */
export type TitleSize = 'small' | 'large'

/**
 * Profile layout options
 * - classic: Small circle avatar
 * - hero: Larger banner-style layout
 */
export type ProfileLayout = 'classic' | 'hero'

/**
 * Complete profile interface for header customization
 */
export interface Profile {
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  avatarFeather: number  // 0-100, edge feathering amount (0 = no feather, 100 = max feather)
  showAvatar: boolean
  showTitle: boolean
  titleSize: TitleSize
  showLogo: boolean
  logoUrl: string | null
  logoScale: number  // 50-300 as percentage, default 100
  profileLayout: ProfileLayout
  showSocialIcons: boolean
  socialIcons: SocialIcon[]
}

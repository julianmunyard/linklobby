// src/types/profile.ts

/**
 * Social platform identifiers - comprehensive coverage for artists
 */
export type SocialPlatform =
  // Current Big 5
  | 'instagram' | 'tiktok' | 'youtube' | 'spotify' | 'twitter'
  // Music platforms
  | 'soundcloud' | 'applemusic' | 'bandcamp' | 'deezer' | 'amazonmusic'
  // Social platforms
  | 'facebook' | 'threads' | 'bluesky' | 'snapchat' | 'pinterest' | 'linkedin' | 'whatsapp'
  // Streaming
  | 'twitch' | 'kick'
  // Community
  | 'discord'
  // Other
  | 'website' | 'email' | 'patreon' | 'venmo' | 'cashapp' | 'paypal'

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
 * Grouped by category for clarity
 */
export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialPlatformMeta> = {
  // === Big 5 (most common) ===
  instagram: {
    label: 'Instagram',
    icon: 'SiInstagram',
    placeholder: 'https://instagram.com/username',
    enabled: true,
  },
  tiktok: {
    label: 'TikTok',
    icon: 'SiTiktok',
    placeholder: 'https://tiktok.com/@username',
    enabled: true,
  },
  youtube: {
    label: 'YouTube',
    icon: 'SiYoutube',
    placeholder: 'https://youtube.com/@channel',
    enabled: true,
  },
  spotify: {
    label: 'Spotify',
    icon: 'SiSpotify',
    placeholder: 'https://open.spotify.com/artist/...',
    enabled: true,
  },
  twitter: {
    label: 'X / Twitter',
    icon: 'SiX',
    placeholder: 'https://x.com/username',
    enabled: true,
  },

  // === Music Platforms ===
  soundcloud: {
    label: 'SoundCloud',
    icon: 'SiSoundcloud',
    placeholder: 'https://soundcloud.com/username',
    enabled: true,
  },
  applemusic: {
    label: 'Apple Music',
    icon: 'SiApplemusic',
    placeholder: 'https://music.apple.com/artist/...',
    enabled: true,
  },
  bandcamp: {
    label: 'Bandcamp',
    icon: 'SiBandcamp',
    placeholder: 'https://username.bandcamp.com',
    enabled: true,
  },
  deezer: {
    label: 'Deezer',
    icon: 'SiDeezer',
    placeholder: 'https://deezer.com/artist/...',
    enabled: true,
  },
  amazonmusic: {
    label: 'Amazon Music',
    icon: 'SiAmazonmusic',
    placeholder: 'https://music.amazon.com/artists/...',
    enabled: true,
  },

  // === Social Platforms ===
  facebook: {
    label: 'Facebook',
    icon: 'SiFacebook',
    placeholder: 'https://facebook.com/pagename',
    enabled: true,
  },
  threads: {
    label: 'Threads',
    icon: 'SiThreads',
    placeholder: 'https://threads.net/@username',
    enabled: true,
  },
  bluesky: {
    label: 'Bluesky',
    icon: 'SiBluesky',
    placeholder: 'https://bsky.app/profile/handle.bsky.social',
    enabled: true,
  },
  snapchat: {
    label: 'Snapchat',
    icon: 'SiSnapchat',
    placeholder: 'https://snapchat.com/add/username',
    enabled: true,
  },
  pinterest: {
    label: 'Pinterest',
    icon: 'SiPinterest',
    placeholder: 'https://pinterest.com/username',
    enabled: true,
  },
  linkedin: {
    label: 'LinkedIn',
    icon: 'SiLinkedin',
    placeholder: 'https://linkedin.com/in/username',
    enabled: true,
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: 'SiWhatsapp',
    placeholder: 'https://wa.me/1234567890',
    enabled: true,
  },

  // === Streaming ===
  twitch: {
    label: 'Twitch',
    icon: 'SiTwitch',
    placeholder: 'https://twitch.tv/username',
    enabled: true,
  },
  kick: {
    label: 'Kick',
    icon: 'SiKick',
    placeholder: 'https://kick.com/username',
    enabled: true,
  },

  // === Community ===
  discord: {
    label: 'Discord',
    icon: 'SiDiscord',
    placeholder: 'https://discord.gg/invite-code',
    enabled: true,
  },

  // === Other ===
  website: {
    label: 'Website',
    icon: 'Globe',
    placeholder: 'https://yourwebsite.com',
    enabled: true,
  },
  email: {
    label: 'Email',
    icon: 'Mail',
    placeholder: 'mailto:you@email.com',
    enabled: true,
  },
  patreon: {
    label: 'Patreon',
    icon: 'SiPatreon',
    placeholder: 'https://patreon.com/username',
    enabled: true,
  },
  venmo: {
    label: 'Venmo',
    icon: 'SiVenmo',
    placeholder: 'https://venmo.com/username',
    enabled: true,
  },
  cashapp: {
    label: 'Cash App',
    icon: 'SiCashapp',
    placeholder: 'https://cash.app/$username',
    enabled: true,
  },
  paypal: {
    label: 'PayPal',
    icon: 'SiPaypal',
    placeholder: 'https://paypal.me/username',
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
  socialIconSize: number  // Icon size in pixels (16-48), default 24
  headerTextColor: string | null  // Custom color for title, bio, icons (null = use theme text color)
}

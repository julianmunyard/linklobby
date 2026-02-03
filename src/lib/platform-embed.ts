// src/lib/platform-embed.ts
// Unified platform detection for music, video, and social embeds
import getVideoId from 'get-video-id'

// All supported embed platforms
export type EmbedPlatform =
  // Music platforms
  | 'spotify'
  | 'apple-music'
  | 'soundcloud'
  | 'bandcamp'
  | 'audiomack'
  // Video platforms (handled by video-embed.ts for VideoCard, but detected here)
  | 'youtube'
  | 'vimeo'
  | 'tiktok'
  // Social platforms
  | 'instagram'

// Music-only subset
export type MusicPlatform = 'spotify' | 'apple-music' | 'soundcloud' | 'bandcamp' | 'audiomack'

// Video-only subset (for reference)
export type VideoPlatform = 'youtube' | 'vimeo' | 'tiktok'

// Social-only subset
export type SocialPlatform = 'instagram'

// Platform pattern definitions
interface PlatformPattern {
  platform: EmbedPlatform
  pattern: RegExp
}

// Regex patterns for each platform
// Order matters: more specific patterns should come first
export const PLATFORM_PATTERNS: PlatformPattern[] = [
  // Spotify: open.spotify.com/(track|album|playlist|artist)/ID
  {
    platform: 'spotify',
    pattern: /^https?:\/\/(?:open\.)?spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/i,
  },
  // Apple Music: (embed.)?music.apple.com/COUNTRY/(album|playlist|artist|song)/NAME/ID
  {
    platform: 'apple-music',
    pattern: /^https?:\/\/(?:embed\.)?music\.apple\.com\/([a-z]{2})\/(album|playlist|artist|song)\/([^\/]+)\/([a-zA-Z0-9\.]+)/i,
  },
  // SoundCloud: soundcloud.com/USER/(sets/)?TRACK
  {
    platform: 'soundcloud',
    pattern: /^https?:\/\/(?:www\.)?soundcloud\.com\/([^\/]+)(?:\/(sets))?\/([^\/\?]+)/i,
  },
  // Bandcamp: ARTIST.bandcamp.com/(album|track)/SLUG or bandcamp.com/EmbeddedPlayer/...
  {
    platform: 'bandcamp',
    pattern: /^https?:\/\/(?:([^\.]+)\.bandcamp\.com\/(album|track)\/([^\/\?]+)|bandcamp\.com\/EmbeddedPlayer\/)/i,
  },
  // Audiomack: audiomack.com/(song|album|playlist)/ARTIST/TITLE
  {
    platform: 'audiomack',
    pattern: /^https?:\/\/(?:www\.)?audiomack\.com\/(song|album|playlist)\/([^\/]+)\/([^\/\?]+)/i,
  },
  // Instagram: instagram.com/(p|reel|reels)/ID
  {
    platform: 'instagram',
    pattern: /^https?:\/\/(?:www\.)?instagram\.com\/(p|reel|reels)\/([a-zA-Z0-9_-]+)/i,
  },
  // TikTok: tiktok.com/@USER/video/ID
  {
    platform: 'tiktok',
    pattern: /^https?:\/\/(?:www\.)?tiktok\.com\/@([^\/]+)\/video\/([0-9]+)/i,
  },
]

// Result of platform detection
export interface PlatformDetectResult {
  platform: EmbedPlatform
  match: RegExpMatchArray
}

/**
 * Detect which platform a URL belongs to
 * For YouTube/Vimeo, uses get-video-id first then falls back to patterns
 * Returns null for unrecognized URLs
 */
export function detectPlatform(url: string): PlatformDetectResult | null {
  if (!url || typeof url !== 'string') return null

  const trimmedUrl = url.trim()
  if (!trimmedUrl) return null

  // First, try get-video-id for YouTube/Vimeo
  try {
    const videoResult = getVideoId(trimmedUrl)
    if (videoResult.id && videoResult.service) {
      const service = videoResult.service as string
      if (service === 'youtube' || service === 'vimeo') {
        // Create a synthetic match array for consistency
        const syntheticMatch = [trimmedUrl, videoResult.id] as RegExpMatchArray
        syntheticMatch.index = 0
        syntheticMatch.input = trimmedUrl
        return {
          platform: service as EmbedPlatform,
          match: syntheticMatch,
        }
      }
    }
  } catch {
    // get-video-id failed, continue to pattern matching
  }

  // Try each platform pattern
  for (const { platform, pattern } of PLATFORM_PATTERNS) {
    const match = trimmedUrl.match(pattern)
    if (match) {
      return { platform, match }
    }
  }

  return null
}

/**
 * Check if a platform produces vertical (9:16) content
 * TikTok and Instagram Reels are typically vertical
 */
export function isVerticalPlatform(platform: EmbedPlatform): boolean {
  return platform === 'tiktok' || platform === 'instagram'
}

/**
 * Check if a platform is a music platform
 */
export function isMusicPlatform(platform: EmbedPlatform): platform is MusicPlatform {
  return ['spotify', 'apple-music', 'soundcloud', 'bandcamp', 'audiomack'].includes(platform)
}

/**
 * Check if a platform is a video platform
 */
export function isVideoPlatform(platform: EmbedPlatform): platform is VideoPlatform {
  return ['youtube', 'vimeo', 'tiktok'].includes(platform)
}

/**
 * Check if a platform is a social platform
 */
export function isSocialPlatform(platform: EmbedPlatform): platform is SocialPlatform {
  return platform === 'instagram'
}

// oEmbed response structure (common fields)
export interface EmbedInfo {
  embedUrl: string         // Constructed iframe src URL
  thumbnailUrl?: string    // Preview image (if available)
  title?: string           // Track/video/post title (if available)
  aspectRatio?: number     // width/height ratio (optional)
  rawOembedData?: Record<string, unknown>  // Original oEmbed response
}

/**
 * Fetch embed info from platform oEmbed endpoints
 * For platforms without oEmbed (Bandcamp, Apple Music, Instagram): returns basic info
 * Handles errors gracefully with fallback info
 */
export async function fetchPlatformEmbed(
  url: string,
  platform: EmbedPlatform
): Promise<EmbedInfo> {
  const embedUrl = getEmbedUrl(url, platform)

  try {
    switch (platform) {
      case 'spotify':
        return await fetchSpotifyEmbed(url, embedUrl)
      case 'soundcloud':
        return await fetchSoundCloudEmbed(url, embedUrl)
      case 'audiomack':
        return await fetchAudiomackEmbed(url, embedUrl)
      case 'bandcamp':
        return await fetchBandcampEmbed(url)
      // These platforms don't have accessible oEmbed
      case 'apple-music':
      case 'instagram':
      case 'tiktok':
      case 'youtube':
      case 'vimeo':
        // Return basic info - no oEmbed fetching
        return { embedUrl }
      default:
        return { embedUrl }
    }
  } catch (error) {
    // Return fallback with just the embed URL
    console.warn(`Failed to fetch oEmbed for ${platform}:`, error)
    return { embedUrl }
  }
}

async function fetchSpotifyEmbed(url: string, embedUrl: string): Promise<EmbedInfo> {
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
  const response = await fetch(oembedUrl)

  if (!response.ok) {
    return { embedUrl }
  }

  const data = await response.json()
  return {
    embedUrl,
    thumbnailUrl: data.thumbnail_url,
    title: data.title,
    rawOembedData: data,
  }
}

async function fetchSoundCloudEmbed(url: string, embedUrl: string): Promise<EmbedInfo> {
  const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`
  const response = await fetch(oembedUrl)

  if (!response.ok) {
    return { embedUrl }
  }

  const data = await response.json()
  return {
    embedUrl,
    thumbnailUrl: data.thumbnail_url,
    title: data.title,
    rawOembedData: data,
  }
}

async function fetchAudiomackEmbed(url: string, embedUrl: string): Promise<EmbedInfo> {
  const oembedUrl = `https://audiomack.com/oembed?url=${encodeURIComponent(url)}`
  const response = await fetch(oembedUrl)

  if (!response.ok) {
    return { embedUrl }
  }

  const data = await response.json()
  return {
    embedUrl,
    thumbnailUrl: data.thumbnail_url,
    title: data.title,
    rawOembedData: data,
  }
}

async function fetchBandcampEmbed(url: string): Promise<EmbedInfo> {
  try {
    // Use server-side API route to avoid CORS issues
    const response = await fetch(`/api/oembed/bandcamp?url=${encodeURIComponent(url)}`)

    if (!response.ok) {
      // Fallback: return original URL
      return { embedUrl: url }
    }

    const data = await response.json()

    return {
      embedUrl: data.embedUrl || url,
      thumbnailUrl: data.thumbnailUrl,
      title: data.title,
    }
  } catch (error) {
    console.warn('Bandcamp oEmbed failed:', error)
    return { embedUrl: url }
  }
}

/**
 * Construct the iframe embed URL for a given platform
 * Converts original URLs to their embeddable equivalents
 */
export function getEmbedUrl(url: string, platform: EmbedPlatform): string {
  switch (platform) {
    case 'spotify': {
      // open.spotify.com/track/ID -> open.spotify.com/embed/track/ID
      // Add theme=0 for dark mode to avoid white background in corners
      const embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/')
      const separator = embedUrl.includes('?') ? '&' : '?'
      return `${embedUrl}${separator}theme=0`
    }

    case 'apple-music': {
      // music.apple.com/ -> embed.music.apple.com/
      // Also needs to handle URLs that are already embed URLs
      if (url.includes('embed.music.apple.com')) {
        return url
      }
      return url.replace('music.apple.com/', 'embed.music.apple.com/')
    }

    case 'soundcloud': {
      // SoundCloud widget player URL
      // Note: Auto-play disabled, hide related content
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`
    }

    case 'bandcamp': {
      // Bandcamp requires album/track ID from page meta for proper embed
      // For now, return the original URL - the card component will need to
      // fetch the page to extract the album/track ID for proper embedding
      // Format: https://bandcamp.com/EmbeddedPlayer/album=ID/track=ID/...
      return url
    }

    case 'audiomack': {
      // audiomack.com/song/ARTIST/TITLE -> audiomack.com/embed/song/ARTIST/TITLE
      return url.replace('audiomack.com/', 'audiomack.com/embed/')
    }

    case 'tiktok': {
      // Extract video ID and construct embed URL
      const videoIdMatch = url.match(/\/video\/([0-9]+)/)
      if (videoIdMatch) {
        return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`
      }
      // Fallback to original URL
      return url
    }

    case 'instagram': {
      // instagram.com/p/ID/ -> instagram.com/p/ID/embed/
      const postIdMatch = url.match(/(p|reel|reels)\/([a-zA-Z0-9_-]+)/)
      if (postIdMatch) {
        const [, type, postId] = postIdMatch
        // Instagram embed URLs use /p/ for all post types
        return `https://www.instagram.com/p/${postId}/embed/`
      }
      return url
    }

    case 'youtube': {
      // For YouTube, use get-video-id to extract the ID
      try {
        const result = getVideoId(url)
        if (result.id) {
          return `https://www.youtube.com/embed/${result.id}`
        }
      } catch {
        // Fall through
      }
      return url
    }

    case 'vimeo': {
      // For Vimeo, use get-video-id to extract the ID
      try {
        const result = getVideoId(url)
        if (result.id) {
          return `https://player.vimeo.com/video/${result.id}`
        }
      } catch {
        // Fall through
      }
      return url
    }

    default:
      return url
  }
}

/**
 * Get default aspect ratio for a platform
 * Used when oEmbed doesn't provide dimensions
 */
export function getDefaultAspectRatio(platform: EmbedPlatform): number {
  switch (platform) {
    // Music players are typically wide and short
    case 'spotify':
      return 380 / 152  // Spotify default height is 152px for tracks
    case 'apple-music':
      return 380 / 175  // Apple Music player height
    case 'soundcloud':
      return 380 / 166  // SoundCloud visual player
    case 'bandcamp':
      return 350 / 120  // Bandcamp slim player
    case 'audiomack':
      return 380 / 130  // Audiomack player
    // Vertical video platforms
    case 'tiktok':
    case 'instagram':
      return 9 / 16  // Vertical video
    // Horizontal video platforms
    case 'youtube':
    case 'vimeo':
      return 16 / 9  // Standard video
    default:
      return 16 / 9
  }
}

/**
 * Get platform display name for UI
 */
export function getPlatformDisplayName(platform: EmbedPlatform): string {
  const names: Record<EmbedPlatform, string> = {
    spotify: 'Spotify',
    'apple-music': 'Apple Music',
    soundcloud: 'SoundCloud',
    bandcamp: 'Bandcamp',
    audiomack: 'Audiomack',
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    tiktok: 'TikTok',
    instagram: 'Instagram',
  }
  return names[platform] || platform
}

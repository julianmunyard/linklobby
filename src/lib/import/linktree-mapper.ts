// src/lib/import/linktree-mapper.ts
import axios from 'axios'
import type { LayoutItem } from './layout-generator'
import type { LinktreeLink, LinktreeSocialLink } from '@/types/linktree'
import type { CardType, CardSize, HorizontalPosition } from '@/types/card'
import type { SocialPlatform } from '@/types/profile'

/**
 * URL patterns to detect social PROFILE links (not content links)
 * Only matches profile/channel URLs, not videos/tracks/etc.
 * These get extracted as social icons rather than cards
 */
const SOCIAL_PROFILE_PATTERNS: { platform: SocialPlatform; patterns: RegExp[] }[] = [
  // === Big 5 ===
  {
    platform: 'instagram',
    patterns: [
      // instagram.com/username (but not /p/ posts, /reel/, /stories/, etc.)
      /instagram\.com\/(?!p\/|reel\/|stories\/|explore\/)[a-zA-Z0-9_.]+\/?$/i,
      /instagr\.am\/(?!p\/)[a-zA-Z0-9_.]+\/?$/i,
    ],
  },
  {
    platform: 'tiktok',
    patterns: [
      // tiktok.com/@username (profile, not video)
      /tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/i,
    ],
  },
  {
    platform: 'youtube',
    patterns: [
      // youtube.com/@channel or /channel/ or /c/ (not /watch, /shorts, /playlist)
      /youtube\.com\/@[a-zA-Z0-9_-]+\/?$/i,
      /youtube\.com\/channel\/[a-zA-Z0-9_-]+\/?$/i,
      /youtube\.com\/c\/[a-zA-Z0-9_-]+\/?$/i,
      /youtube\.com\/user\/[a-zA-Z0-9_-]+\/?$/i,
    ],
  },
  {
    platform: 'spotify',
    patterns: [
      // open.spotify.com/artist/ (not /track, /album, /playlist)
      /open\.spotify\.com\/artist\/[a-zA-Z0-9]+/i,
      /spotify\.com\/artist\/[a-zA-Z0-9]+/i,
    ],
  },
  {
    platform: 'twitter',
    patterns: [
      // twitter.com/username or x.com/username (not /status/, /i/, etc.)
      /twitter\.com\/(?!status\/|i\/|search|explore|home)[a-zA-Z0-9_]+\/?$/i,
      /x\.com\/(?!status\/|i\/|search|explore|home)[a-zA-Z0-9_]+\/?$/i,
    ],
  },

  // === Music Platforms ===
  {
    platform: 'soundcloud',
    patterns: [/soundcloud\.com\/[a-zA-Z0-9_-]+\/?$/i],
  },
  {
    platform: 'applemusic',
    patterns: [/music\.apple\.com\/.*\/artist\//i],
  },
  {
    platform: 'bandcamp',
    patterns: [/[a-zA-Z0-9_-]+\.bandcamp\.com\/?$/i],
  },
  {
    platform: 'deezer',
    patterns: [/deezer\.com\/.*\/artist\//i],
  },
  {
    platform: 'amazonmusic',
    patterns: [/music\.amazon\..*\/artists\//i],
  },

  // === Social Platforms ===
  {
    platform: 'facebook',
    patterns: [
      // facebook.com/pagename (not /watch, /events, /groups)
      /facebook\.com\/(?!watch|events|groups)[a-zA-Z0-9.]+\/?$/i,
      /fb\.com\/[a-zA-Z0-9.]+\/?$/i,
    ],
  },
  {
    platform: 'threads',
    patterns: [/threads\.net\/@?[a-zA-Z0-9_.]+\/?$/i],
  },
  {
    platform: 'bluesky',
    patterns: [/bsky\.app\/profile\/[a-zA-Z0-9._-]+/i],
  },
  {
    platform: 'snapchat',
    patterns: [
      /snapchat\.com\/add\/[a-zA-Z0-9_-]+/i,
      /snapchat\.com\/t\/[a-zA-Z0-9_-]+/i,
    ],
  },
  {
    platform: 'pinterest',
    patterns: [/pinterest\.com\/[a-zA-Z0-9_-]+\/?$/i],
  },
  {
    platform: 'linkedin',
    patterns: [/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i],
  },
  {
    platform: 'whatsapp',
    patterns: [
      /wa\.me\/[0-9]+/i,
      /api\.whatsapp\.com\/send/i,
    ],
  },

  // === Streaming ===
  {
    platform: 'twitch',
    patterns: [/twitch\.tv\/[a-zA-Z0-9_]+\/?$/i],
  },
  {
    platform: 'kick',
    patterns: [/kick\.com\/[a-zA-Z0-9_]+\/?$/i],
  },

  // === Community ===
  {
    platform: 'discord',
    patterns: [
      /discord\.gg\/[a-zA-Z0-9]+/i,
      /discord\.com\/invite\/[a-zA-Z0-9]+/i,
    ],
  },

  // === Support/Payment ===
  {
    platform: 'patreon',
    patterns: [/patreon\.com\/[a-zA-Z0-9_]+\/?$/i],
  },
  {
    platform: 'venmo',
    patterns: [/venmo\.com\/[a-zA-Z0-9_-]+\/?$/i],
  },
  {
    platform: 'cashapp',
    patterns: [/cash\.app\/\$[a-zA-Z0-9_]+/i],
  },
  {
    platform: 'paypal',
    patterns: [/paypal\.me\/[a-zA-Z0-9_]+/i],
  },
]

/**
 * Detect if a URL is a social PROFILE link (not a content link)
 * Returns the platform if detected, null otherwise
 */
function detectSocialPlatform(url: string): SocialPlatform | null {
  for (const { platform, patterns } of SOCIAL_PROFILE_PATTERNS) {
    if (patterns.some(pattern => pattern.test(url))) {
      return platform
    }
  }
  return null
}

/**
 * Map Linktree's social type strings to our SocialPlatform type
 * Includes all platforms Linktree may report in their socialLinks array
 */
const LINKTREE_SOCIAL_TYPE_MAP: Record<string, SocialPlatform> = {
  // Big 5
  'INSTAGRAM': 'instagram',
  'TIKTOK': 'tiktok',
  'YOUTUBE': 'youtube',
  'SPOTIFY': 'spotify',
  'TWITTER': 'twitter',
  'X': 'twitter',  // Linktree may use "X" now

  // Music platforms
  'SOUNDCLOUD': 'soundcloud',
  'APPLEMUSIC': 'applemusic',
  'APPLE_MUSIC': 'applemusic',
  'BANDCAMP': 'bandcamp',
  'DEEZER': 'deezer',
  'AMAZONMUSIC': 'amazonmusic',
  'AMAZON_MUSIC': 'amazonmusic',

  // Social platforms
  'FACEBOOK': 'facebook',
  'THREADS': 'threads',
  'BLUESKY': 'bluesky',
  'SNAPCHAT': 'snapchat',
  'PINTEREST': 'pinterest',
  'LINKEDIN': 'linkedin',
  'WHATSAPP': 'whatsapp',

  // Streaming
  'TWITCH': 'twitch',
  'KICK': 'kick',

  // Community
  'DISCORD': 'discord',

  // Support/Payment
  'PATREON': 'patreon',
  'VENMO': 'venmo',
  'CASHAPP': 'cashapp',
  'CASH_APP': 'cashapp',
  'PAYPAL': 'paypal',

  // Generic
  'EMAIL': 'email',
  'WEBSITE': 'website',
}

/**
 * Convert Linktree's socialLinks array to our DetectedSocialIcon format
 */
function mapSocialLinks(socialLinks: LinktreeSocialLink[] | undefined): DetectedSocialIcon[] {
  if (!socialLinks) return []

  const result: DetectedSocialIcon[] = []

  for (const link of socialLinks) {
    const platform = LINKTREE_SOCIAL_TYPE_MAP[link.type?.toUpperCase()]
    if (platform && link.url) {
      result.push({ platform, url: link.url })
      console.log(`[LinktreeMapper] Mapped social link: ${link.type} -> ${platform} (${link.url})`)
    }
  }

  return result
}

/**
 * Detected social icon from import
 */
export interface DetectedSocialIcon {
  platform: SocialPlatform
  url: string
}

// Card data without the image blob
export interface MappedCardData {
  card_type: CardType
  title: string | null
  description: string | null
  url: string
  content: Record<string, unknown>
  size: CardSize
  position: HorizontalPosition
}

// Structured return: card data paired with its image blob
export interface MappedCardWithImage {
  card: MappedCardData
  imageBlob: Blob | null
}

// Result of full import
export interface ImportResult {
  mappedCards: MappedCardWithImage[]
  detectedSocialIcons: DetectedSocialIcon[]
  failures: Array<{ index: number; title: string; reason: string }>
}

// Download image from URL and return as Blob
async function downloadImage(imageUrl: string): Promise<Blob | null> {
  // Skip empty or invalid URLs
  if (!imageUrl || imageUrl.trim() === '') {
    return null
  }

  // Skip data URIs, SVGs, and other non-downloadable formats
  if (imageUrl.startsWith('data:') || imageUrl.endsWith('.svg') || imageUrl.includes('/svg')) {
    console.log('[ImageDownload] Skipping non-image URL:', imageUrl.substring(0, 50))
    return null
  }

  // Handle relative URLs (shouldn't happen but just in case)
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://linktr.ee${imageUrl}`

  console.log('[ImageDownload] Attempting:', fullUrl)

  try {
    const response = await axios.get(fullUrl, {
      responseType: 'arraybuffer',
      timeout: 15000, // Increased timeout to 15 seconds
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': 'https://linktr.ee/',
      },
      maxRedirects: 5,
    })

    const contentType = response.headers['content-type'] || 'image/jpeg'
    const dataSize = response.data.byteLength || 0

    console.log('[ImageDownload] Success:', fullUrl, `(${dataSize} bytes, ${contentType})`)

    // Skip very small images (likely broken or placeholder)
    if (dataSize < 100) {
      console.warn('[ImageDownload] Skipping tiny image:', fullUrl, `(${dataSize} bytes)`)
      return null
    }

    return new Blob([response.data], { type: contentType })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn('[ImageDownload] Failed:', fullUrl, error.response?.status || error.code || error.message)
    } else {
      console.warn('[ImageDownload] Failed:', fullUrl, error)
    }
    return null
  }
}

/**
 * Map Linktree links to LinkLobby cards.
 * Downloads thumbnails and returns them separately from card data.
 * Social icons come ONLY from Linktree's explicit socialLinks array.
 * All main links (including those with social URLs) become cards to preserve grouping.
 * Returns array of {card, imageBlob} objects for clean API handling.
 */
export async function mapLinktreeToCards(
  links: LinktreeLink[],
  socialLinks?: LinktreeSocialLink[]
): Promise<ImportResult> {
  // Get social icons ONLY from Linktree's explicit socialLinks array
  // We don't extract from main links because that breaks the visual grouping
  // (e.g., a YouTube channel under "Mac DeMarco" header should stay there)
  const detectedSocialIcons = mapSocialLinks(socialLinks)

  // Keep all main links as cards (preserves order and grouping)
  const regularLinks: LinktreeLink[] = []

  for (const link of links) {
    // Keep HEADER links as text cards (section dividers)
    if (link.type === 'HEADER') {
      regularLinks.push(link)
      console.log(`[LinktreeMapper] Keeping header: "${link.title}"`)
      continue
    }

    // Skip links without URLs
    if (!link.url) continue

    // Keep ALL links as cards to preserve grouping structure
    regularLinks.push(link)
  }

  console.log(`[LinktreeMapper] Found ${detectedSocialIcons.length} social icons from socialLinks array, ${regularLinks.length} regular links`)

  // Use horizontal card type for links with thumbnails (supports images), link type otherwise
  const layout: LayoutItem[] = regularLinks.map((link) => ({
    type: (link.type === 'HEADER' ? 'text' : link.thumbnail ? 'horizontal' : 'link') as CardType,
    size: 'big' as CardSize,
  }))

  // Log what we're processing
  console.log('[LinktreeMapper] Processing', regularLinks.length, 'regular links')
  regularLinks.forEach((link, i) => {
    console.log(`[LinktreeMapper] Link ${i}: "${link.title}" thumbnail:`, link.thumbnail || '(none)')
  })

  // Process regular links in parallel with Promise.allSettled
  const settledResults = await Promise.allSettled(
    regularLinks.map(async (link, index) => {
      const layoutItem = layout[index]

      // HEADER links become text cards (section dividers)
      if (link.type === 'HEADER') {
        const card: MappedCardData = {
          card_type: 'text',
          title: link.title || 'Section',
          description: null,
          url: '', // Text cards don't have URLs
          content: {
            textAlign: 'center',
          },
          size: 'big', // Full width for headers
          position: 'left' as HorizontalPosition,
        }
        return { card, imageBlob: null, index }
      }

      // Download thumbnail if available
      let imageBlob: Blob | null = null
      if (link.thumbnail) {
        imageBlob = await downloadImage(link.thumbnail)
        if (!imageBlob) {
          console.warn(`[LinktreeMapper] Failed to get image for "${link.title}"`)
        }
      }

      // Default content - all cards use center/center alignment
      const defaultContent: Record<string, unknown> = {
        textAlign: 'center',
        verticalAlign: 'center',
      }

      // Map to our card format - image blob is separate, not embedded in content
      const card: MappedCardData = {
        card_type: layoutItem.type,
        title: link.title || null,
        description: null, // Linktree doesn't have descriptions on links
        url: link.url || '', // URL should always exist after filtering, but default to empty string
        content: defaultContent,
        size: layoutItem.size,
        position: 'left' as HorizontalPosition, // Will flow naturally in our layout
      }

      return { card, imageBlob, index }
    })
  )

  // Separate successes and failures, preserving original order
  const mappedCardsWithIndex: Array<{ index: number; card: MappedCardData; imageBlob: Blob | null }> = []
  const failures: Array<{ index: number; title: string; reason: string }> = []

  for (let i = 0; i < settledResults.length; i++) {
    const result = settledResults[i]
    if (result.status === 'fulfilled') {
      const { card, imageBlob, index } = result.value
      // Store with original index for sorting
      mappedCardsWithIndex.push({ index, card, imageBlob })
    } else {
      failures.push({
        index: i,
        title: regularLinks[i]?.title || 'Unknown',
        reason: result.reason?.message || 'Unknown error',
      })
    }
  }

  // Sort by original index to preserve Linktree order
  mappedCardsWithIndex.sort((a, b) => a.index - b.index)

  // Extract just the card data without index
  const mappedCards: MappedCardWithImage[] = mappedCardsWithIndex.map(({ card, imageBlob }) => ({
    card,
    imageBlob,
  }))

  return { mappedCards, detectedSocialIcons, failures }
}

// src/lib/import/linktree-mapper.ts
import axios from 'axios'
import { generateLayoutPatternRandomized, type LayoutItem } from './layout-generator'
import type { LinktreeLink, LinktreeSocialLink } from '@/types/linktree'
import type { CardType, CardSize, HorizontalPosition } from '@/types/card'
import type { SocialPlatform } from '@/types/profile'

/**
 * URL patterns to detect social PROFILE links (not content links)
 * Only matches profile/channel URLs, not videos/tracks/etc.
 * These get extracted as social icons rather than cards
 */
const SOCIAL_PROFILE_PATTERNS: { platform: SocialPlatform; patterns: RegExp[] }[] = [
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
 */
const LINKTREE_SOCIAL_TYPE_MAP: Record<string, SocialPlatform> = {
  'INSTAGRAM': 'instagram',
  'TIKTOK': 'tiktok',
  'YOUTUBE': 'youtube',
  'SPOTIFY': 'spotify',
  'TWITTER': 'twitter',
  'X': 'twitter',  // Linktree may use "X" now
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
 * Social platform links are extracted as social icons instead of cards.
 * Returns array of {card, imageBlob} objects for clean API handling.
 */
export async function mapLinktreeToCards(
  links: LinktreeLink[],
  socialLinks?: LinktreeSocialLink[]
): Promise<ImportResult> {
  // First pass: separate social links from regular links
  const detectedSocialIcons: DetectedSocialIcon[] = []
  const regularLinks: LinktreeLink[] = []

  // Start with socialLinks array (Linktree's explicit social icons)
  const socialLinksFromArray = mapSocialLinks(socialLinks)
  detectedSocialIcons.push(...socialLinksFromArray)

  // Then process regular links, extracting profile URLs as social icons
  for (const link of links) {
    const platform = detectSocialPlatform(link.url)
    if (platform) {
      // Check if we already have this platform (avoid duplicates)
      const alreadyHave = detectedSocialIcons.some(s => s.platform === platform)
      if (!alreadyHave) {
        detectedSocialIcons.push({ platform, url: link.url })
        console.log(`[LinktreeMapper] Detected social icon from URL: ${platform} -> ${link.url}`)
      }
    } else {
      regularLinks.push(link)
    }
  }

  console.log(`[LinktreeMapper] Found ${detectedSocialIcons.length} social icons (${socialLinksFromArray.length} from socialLinks array), ${regularLinks.length} regular links`)

  // Generate layout only for regular links
  const layout = generateLayoutPatternRandomized(regularLinks.length)

  // Log what we're processing
  console.log('[LinktreeMapper] Processing', regularLinks.length, 'regular links')
  regularLinks.forEach((link, i) => {
    console.log(`[LinktreeMapper] Link ${i}: "${link.title}" thumbnail:`, link.thumbnail || '(none)')
  })

  // Process regular links in parallel with Promise.allSettled
  const settledResults = await Promise.allSettled(
    regularLinks.map(async (link, index) => {
      const layoutItem = layout[index]

      // Download thumbnail if available
      let imageBlob: Blob | null = null
      if (link.thumbnail) {
        imageBlob = await downloadImage(link.thumbnail)
        if (!imageBlob) {
          console.warn(`[LinktreeMapper] Failed to get image for "${link.title}"`)
        }
      }

      // Type-specific default content (text and vertical alignment)
      const defaultContent: Record<string, unknown> = (() => {
        switch (layoutItem.type) {
          case 'hero':
          case 'square':
            return { textAlign: 'center', verticalAlign: 'bottom' }
          case 'horizontal':
            return { textAlign: 'left', verticalAlign: 'middle' }
          case 'link':
            return { textAlign: 'center', verticalAlign: 'middle' }
          default:
            return {}
        }
      })()

      // Map to our card format - image blob is separate, not embedded in content
      const card: MappedCardData = {
        card_type: layoutItem.type,
        title: link.title || null,
        description: null, // Linktree doesn't have descriptions on links
        url: link.url,
        content: defaultContent,
        size: layoutItem.size,
        position: 'left' as HorizontalPosition, // Will flow naturally in our layout
      }

      return { card, imageBlob, index }
    })
  )

  // Separate successes and failures
  const mappedCards: MappedCardWithImage[] = []
  const failures: Array<{ index: number; title: string; reason: string }> = []

  for (const result of settledResults) {
    if (result.status === 'fulfilled') {
      const { card, imageBlob } = result.value
      // Return structured object with card data and imageBlob separate
      mappedCards.push({ card, imageBlob })
    } else {
      const linkIndex = settledResults.indexOf(result)
      failures.push({
        index: linkIndex,
        title: regularLinks[linkIndex]?.title || 'Unknown',
        reason: result.reason?.message || 'Unknown error',
      })
    }
  }

  return { mappedCards, detectedSocialIcons, failures }
}
